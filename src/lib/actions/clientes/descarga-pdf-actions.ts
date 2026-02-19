// src/lib/actions/clientes/descarga-pdf-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteCompleto } from "@/types/cliente-types";

/**
 * Obtiene datos completos del cliente para generación de PDF
 */
export async function obtenerDatosClienteParaPdf(
  clienteId: string,
): Promise<ActionResult<ClienteCompleto>> {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id: clienteId, deletedAt: null },
      include: {
        region: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        registradoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        datosPersonales: true,
        datosLaborales: true,
        datosAcademicos: true,
        datosMatrimoniales: true,
        datosPatrocinador: true,
        datosViaje: true,
      },
    });

    if (!cliente) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const clienteFormateado: ClienteCompleto = {
      ...cliente,
      datosPersonales: cliente.datosPersonales ?? undefined,
      datosLaborales: cliente.datosLaborales
        ? {
            ...cliente.datosLaborales,
            percepcionSalarial: cliente.datosLaborales.percepcionSalarial
              ? Number(cliente.datosLaborales.percepcionSalarial)
              : null,
          }
        : undefined,
      datosAcademicos: cliente.datosAcademicos ?? undefined,
      datosMatrimoniales: cliente.datosMatrimoniales ?? undefined,
      datosPatrocinador: cliente.datosPatrocinador
        ? {
            ...cliente.datosPatrocinador,
            percepcionSalarialPatrocinador: cliente.datosPatrocinador
              .percepcionSalarialPatrocinador
              ? Number(cliente.datosPatrocinador.percepcionSalarialPatrocinador)
              : null,
          }
        : undefined,
      datosViaje: cliente.datosViaje ?? undefined,
    };

    return {
      success: true,
      data: clienteFormateado,
    };
  } catch (error) {
    console.error("Error al obtener datos del cliente:", error);
    return {
      success: false,
      error: "Error al obtener datos del cliente",
    };
  }
}

type GrupoFamiliar = {
  id: string;
  nombre: string;
  descripcion: string | null;
};

type MiembroConDatos = {
  esTitular: boolean;
  parentesco: { nombre: string };
  cliente: ClienteCompleto;
};

/**
 * Obtiene todos los miembros de un grupo familiar con sus datos completos
 */
export async function obtenerGrupoFamiliarParaPdf(clienteId: string): Promise<
  ActionResult<{
    grupo: GrupoFamiliar;
    miembros: MiembroConDatos[];
  }>
> {
  try {
    const miembroGrupo = await db.grupoFamiliarMiembro.findFirst({
      where: { clienteId, grupoFamiliar: { deletedAt: null } },
      include: { grupoFamiliar: true },
    });

    if (!miembroGrupo) {
      return {
        success: false,
        error: "Cliente no pertenece a un grupo familiar",
      };
    }

    const miembros = await db.grupoFamiliarMiembro.findMany({
      where: { grupoFamiliarId: miembroGrupo.grupoFamiliarId },
      include: {
        cliente: {
          include: {
            region: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
            registradoPor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            datosPersonales: true,
            datosLaborales: true,
            datosAcademicos: true,
            datosMatrimoniales: true,
            datosPatrocinador: true,
            datosViaje: true,
          },
        },
        parentesco: true,
      },
      orderBy: [{ esTitular: "desc" }, { createdAt: "asc" }],
    });

    const miembrosFormateados: MiembroConDatos[] = miembros.map((m) => ({
      esTitular: m.esTitular,
      parentesco: m.parentesco,
      cliente: {
        ...m.cliente,
        datosPersonales: m.cliente.datosPersonales ?? undefined,
        datosLaborales: m.cliente.datosLaborales
          ? {
              ...m.cliente.datosLaborales,
              percepcionSalarial: m.cliente.datosLaborales.percepcionSalarial
                ? Number(m.cliente.datosLaborales.percepcionSalarial)
                : null,
            }
          : undefined,
        datosAcademicos: m.cliente.datosAcademicos ?? undefined,
        datosMatrimoniales: m.cliente.datosMatrimoniales ?? undefined,
        datosPatrocinador: m.cliente.datosPatrocinador
          ? {
              ...m.cliente.datosPatrocinador,
              percepcionSalarialPatrocinador: m.cliente.datosPatrocinador
                .percepcionSalarialPatrocinador
                ? Number(
                    m.cliente.datosPatrocinador.percepcionSalarialPatrocinador,
                  )
                : null,
            }
          : undefined,
        datosViaje: m.cliente.datosViaje ?? undefined,
      },
    }));

    return {
      success: true,
      data: {
        grupo: miembroGrupo.grupoFamiliar,
        miembros: miembrosFormateados,
      },
    };
  } catch (error) {
    console.error("Error al obtener grupo familiar:", error);
    return {
      success: false,
      error: "Error al obtener grupo familiar",
    };
  }
}
