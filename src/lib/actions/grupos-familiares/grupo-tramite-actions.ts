"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type GrupoFamiliarPendienteOption = {
  id: string;
  nombre: string;
  totalMiembros: number;
  titularNombre: string | null;
};

export type ParentescoOption = {
  id: string;
  nombre: string;
};

export async function obtenerOpcionesGrupoFamiliarPendientes(): Promise<
  ActionResult<{ grupos: GrupoFamiliarPendienteOption[]; parentescos: ParentescoOption[] }>
> {
  try {
    const [afiliados, grupos, parentescos] = await Promise.all([
      db.$queryRaw<Array<{ clienteId: string }>>`
        SELECT "clienteId" FROM "cliente_afiliado" WHERE "afiliado" = TRUE
      `,
      db.grupoFamiliar.findMany({
        where: {
          activo: true,
          deletedAt: null,
          miembros: {
            some: {
              cliente: { activo: true, deletedAt: null },
            },
          },
        },
        include: {
          miembros: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  activo: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.catalogoParentesco.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      }),
    ]);

    const afiliadosIds = new Set(afiliados.map((item) => item.clienteId));
    const opciones = grupos
      .filter((grupo) =>
        grupo.miembros.some(
          (m) =>
            m.cliente.activo &&
            m.cliente.deletedAt === null &&
            !afiliadosIds.has(m.cliente.id),
        ),
      )
      .map((grupo) => {
        const titular = grupo.miembros.find((m) => m.esTitular);
        return {
          id: grupo.id,
          nombre: grupo.nombre,
          totalMiembros: grupo.miembros.length,
          titularNombre: titular
            ? `${titular.cliente.nombres} ${titular.cliente.apellidos}`
            : null,
        };
      });

    return { success: true, data: { grupos: opciones, parentescos } };
  } catch (error) {
    console.error("Error obteniendo opciones de grupo familiar:", error);
    return { success: false, error: "No se pudieron cargar los grupos familiares" };
  }
}

export async function asignarClienteAGrupoPendiente(
  clienteId: string,
  grupoFamiliarId: string,
  parentescoId: string,
): Promise<ActionResult<void>> {
  try {
    const [cliente, grupo, parentesco, afiliados] = await Promise.all([
      db.cliente.findFirst({ where: { id: clienteId, activo: true, deletedAt: null }, select: { id: true } }),
      db.grupoFamiliar.findFirst({
        where: { id: grupoFamiliarId, activo: true, deletedAt: null },
        include: { miembros: { include: { cliente: { select: { id: true, activo: true, deletedAt: true } } } } },
      }),
      db.catalogoParentesco.findUnique({ where: { id: parentescoId }, select: { id: true } }),
      db.$queryRaw<Array<{ clienteId: string }>>`
        SELECT "clienteId" FROM "cliente_afiliado" WHERE "afiliado" = TRUE
      `,
    ]);

    if (!cliente) return { success: false, error: "El cliente no está disponible para asignación" };
    if (!grupo) return { success: false, error: "Grupo familiar no encontrado" };
    if (!parentesco) return { success: false, error: "Selecciona un parentesco válido" };

    const afiliadosIds = new Set(afiliados.map((item) => item.clienteId));
    const grupoTienePendientes = grupo.miembros.some(
      (m) => m.cliente.activo && m.cliente.deletedAt === null && !afiliadosIds.has(m.cliente.id),
    );
    if (!grupoTienePendientes) {
      return { success: false, error: "Ese grupo ya no tiene clientes pendientes" };
    }

    const yaPertenece = await db.grupoFamiliarMiembro.findFirst({
      where: { grupoFamiliarId, clienteId },
      select: { id: true },
    });
    if (!yaPertenece) {
      await db.grupoFamiliarMiembro.create({
        data: { grupoFamiliarId, clienteId, parentescoId, esTitular: false },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error asignando cliente al grupo familiar:", error);
    return { success: false, error: "No se pudo asignar el cliente al grupo familiar" };
  }
}

export async function crearGrupoFamiliarDesdeTramite(
  clienteId: string,
  nombre: string,
  parentescoId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 2) return { success: false, error: "Ingresa un nombre para el grupo familiar" };

    const [cliente, parentesco] = await Promise.all([
      db.cliente.findFirst({ where: { id: clienteId, activo: true, deletedAt: null }, select: { id: true } }),
      db.catalogoParentesco.findUnique({ where: { id: parentescoId }, select: { id: true } }),
    ]);
    if (!cliente) return { success: false, error: "Cliente no disponible para crear grupo" };
    if (!parentesco) return { success: false, error: "Selecciona un parentesco válido" };

    const id = await db.$transaction(async (tx) => {
      const grupo = await tx.grupoFamiliar.create({ data: { nombre: nombreLimpio } });
      await tx.grupoFamiliarMiembro.create({
        data: {
          grupoFamiliarId: grupo.id,
          clienteId,
          parentescoId,
          esTitular: true,
        },
      });
      return grupo.id;
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error creando grupo familiar desde trámite:", error);
    return { success: false, error: "No se pudo crear el grupo familiar" };
  }
}
