// src/lib/actions/clientes/grupos-familiares-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import {
  type AddMiembroFormData,
  addMiembroSchema,
  type CreateGrupoFamiliarFormData,
  createGrupoFamiliarSchema,
} from "@/validations/grupo-familiar-validations";

export type GrupoFamiliarListItem = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  totalMiembros: number;
  titular: {
    id: string;
    nombres: string;
    apellidos: string;
  } | null;
};

export type GrupoFamiliarDetalle = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  miembros: Array<{
    id: string;
    esTitular: boolean;
    cliente: {
      id: string;
      nombres: string;
      apellidos: string;
      tipoCliente: string;
      email: string | null;
      telefonoCelular: string | null;
    };
    parentesco: {
      id: string;
      nombre: string;
      codigo: string;
    };
  }>;
};

export async function obtenerGruposFamiliaresDeCliente(
  clienteId: string,
): Promise<ActionResult<GrupoFamiliarListItem[]>> {
  try {
    const membresias = await db.grupoFamiliarMiembro.findMany({
      where: { clienteId },
      include: {
        grupoFamiliar: {
          include: {
            _count: { select: { miembros: true } },
            miembros: {
              where: { esTitular: true },
              include: {
                cliente: {
                  select: { id: true, nombres: true, apellidos: true },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    const grupos = membresias.map(({ grupoFamiliar: g }) => ({
      id: g.id,
      nombre: g.nombre,
      descripcion: g.descripcion,
      activo: g.activo,
      createdAt: g.createdAt,
      totalMiembros: g._count.miembros,
      titular: g.miembros[0]?.cliente ?? null,
    }));

    return { success: true, data: grupos };
  } catch (error) {
    console.error("Error al obtener grupos familiares:", error);
    return { success: false, error: "Error al obtener los grupos familiares" };
  }
}

export async function obtenerGrupoFamiliarPorId(
  id: string,
): Promise<ActionResult<GrupoFamiliarDetalle>> {
  try {
    const grupo = await db.grupoFamiliar.findUnique({
      where: { id },
      include: {
        miembros: {
          include: {
            cliente: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                tipoCliente: true,
                email: true,
                telefonoCelular: true,
              },
            },
            parentesco: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
          orderBy: [{ esTitular: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!grupo) {
      return { success: false, error: "Grupo familiar no encontrado" };
    }

    return { success: true, data: grupo };
  } catch (error) {
    console.error("Error al obtener grupo familiar:", error);
    return { success: false, error: "Error al obtener el grupo familiar" };
  }
}

export async function crearGrupoFamiliar(
  clienteTitularId: string,
  input: CreateGrupoFamiliarFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createGrupoFamiliarSchema.parse(input);

    const [cliente, parentesco] = await Promise.all([
      db.cliente.findUnique({ where: { id: clienteTitularId } }),
      db.catalogoParentesco.findUnique({
        where: { id: validated.parentescoTitularId },
      }),
    ]);

    if (!cliente) {
      return { success: false, error: "Cliente titular no encontrado" };
    }

    if (!parentesco) {
      return { success: false, error: "Tipo de parentesco no encontrado" };
    }

    const grupoId = await db.$transaction(async (tx) => {
      const grupo = await tx.grupoFamiliar.create({
        data: {
          nombre: validated.nombre,
          descripcion: validated.descripcion ?? null,
        },
      });

      await tx.grupoFamiliarMiembro.create({
        data: {
          grupoFamiliarId: grupo.id,
          clienteId: clienteTitularId,
          parentescoId: validated.parentescoTitularId,
          esTitular: true,
        },
      });

      return grupo.id;
    });

    return { success: true, data: { id: grupoId } };
  } catch (error) {
    console.error("Error al crear grupo familiar:", error);
    return { success: false, error: "Error al crear el grupo familiar" };
  }
}

export async function agregarMiembro(
  grupoFamiliarId: string,
  input: AddMiembroFormData,
): Promise<ActionResult<void>> {
  try {
    const validated = addMiembroSchema.parse(input);

    const [grupo, cliente, parentesco, miembroExistente] = await Promise.all([
      db.grupoFamiliar.findUnique({ where: { id: grupoFamiliarId } }),
      db.cliente.findUnique({ where: { id: validated.clienteId } }),
      db.catalogoParentesco.findUnique({
        where: { id: validated.parentescoId },
      }),
      db.grupoFamiliarMiembro.findUnique({
        where: {
          grupoFamiliarId_clienteId: {
            grupoFamiliarId,
            clienteId: validated.clienteId,
          },
        },
      }),
    ]);

    if (!grupo)
      return { success: false, error: "Grupo familiar no encontrado" };
    if (!cliente) return { success: false, error: "Cliente no encontrado" };
    if (!parentesco)
      return { success: false, error: "Tipo de parentesco no encontrado" };
    if (miembroExistente)
      return {
        success: false,
        error: "El cliente ya es miembro de este grupo",
      };

    await db.grupoFamiliarMiembro.create({
      data: {
        grupoFamiliarId,
        clienteId: validated.clienteId,
        parentescoId: validated.parentescoId,
        esTitular: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al agregar miembro:", error);
    return { success: false, error: "Error al agregar el miembro" };
  }
}

export async function removerMiembro(
  grupoFamiliarId: string,
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const miembro = await db.grupoFamiliarMiembro.findUnique({
      where: {
        grupoFamiliarId_clienteId: { grupoFamiliarId, clienteId },
      },
    });

    if (!miembro) {
      return { success: false, error: "Miembro no encontrado en el grupo" };
    }

    if (miembro.esTitular) {
      const totalMiembros = await db.grupoFamiliarMiembro.count({
        where: { grupoFamiliarId },
      });

      if (totalMiembros > 1) {
        return {
          success: false,
          error: "No se puede remover al titular mientras haya otros miembros",
        };
      }
    }

    await db.grupoFamiliarMiembro.delete({
      where: { grupoFamiliarId_clienteId: { grupoFamiliarId, clienteId } },
    });

    const miembrosRestantes = await db.grupoFamiliarMiembro.count({
      where: { grupoFamiliarId },
    });

    if (miembrosRestantes === 0) {
      await db.grupoFamiliar.update({
        where: { id: grupoFamiliarId },
        data: { deletedAt: new Date() },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error al remover miembro:", error);
    return { success: false, error: "Error al remover el miembro" };
  }
}

export async function obtenerParentescos(): Promise<
  ActionResult<Array<{ id: string; nombre: string; codigo: string }>>
> {
  try {
    const parentescos = await db.catalogoParentesco.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, codigo: true },
      orderBy: { orden: "asc" },
    });

    return { success: true, data: parentescos };
  } catch (error) {
    console.error("Error al obtener parentescos:", error);
    return {
      success: false,
      error: "Error al obtener los tipos de parentesco",
    };
  }
}

export async function buscarClientesParaGrupo(
  query: string,
  grupoFamiliarId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      nombres: string;
      apellidos: string;
      numeroCi: string | null;
    }>
  >
> {
  try {
    const miembrosActuales = await db.grupoFamiliarMiembro.findMany({
      where: { grupoFamiliarId },
      select: { clienteId: true },
    });

    const idsExcluidos = miembrosActuales.map((m) => m.clienteId);

    const clientes = await db.cliente.findMany({
      where: {
        deletedAt: null,
        activo: true,
        id: { notIn: idsExcluidos },
        OR: [
          { nombres: { contains: query, mode: "insensitive" } },
          { apellidos: { contains: query, mode: "insensitive" } },
          { numeroCi: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, nombres: true, apellidos: true, numeroCi: true },
      take: 10,
    });

    return { success: true, data: clientes };
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    return { success: false, error: "Error al buscar clientes" };
  }
}
