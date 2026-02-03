// src/lib/actions/grupos-familiares/grupos-familiares-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  GrupoFamiliar,
  GrupoFamiliarCompleto,
  GrupoFamiliarListItem,
} from "@/types/grupo-familiar-types";
import {
  type CreateGrupoFamiliarConMiembrosFormData,
  type CreateGrupoFamiliarFormData,
  createGrupoFamiliarConMiembrosSchema,
  createGrupoFamiliarSchema,
  type UpdateGrupoFamiliarFormData,
  updateGrupoFamiliarSchema,
} from "@/validations/grupo-familiar-validations";

export async function obtenerGruposFamiliaresActivos(): Promise<
  ActionResult<GrupoFamiliarListItem[]>
> {
  try {
    const grupos = await db.grupoFamiliar.findMany({
      where: {
        activo: true,
        deletedAt: null,
      },
      include: {
        miembros: {
          include: {
            cliente: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const gruposFormateados = grupos.map((grupo) => {
      const titular = grupo.miembros.find((m) => m.esTitular);
      return {
        id: grupo.id,
        nombre: grupo.nombre,
        activo: grupo.activo,
        totalMiembros: grupo.miembros.length,
        titular: titular
          ? {
              id: titular.cliente.id,
              nombreCompleto: `${titular.cliente.nombres} ${titular.cliente.apellidos}`,
            }
          : null,
        createdAt: grupo.createdAt,
      };
    });

    return {
      success: true,
      data: gruposFormateados,
    };
  } catch (error) {
    console.error("Error al obtener grupos familiares activos:", error);
    return {
      success: false,
      error: "Error al obtener los grupos familiares",
    };
  }
}

export async function obtenerTodosLosGruposFamiliares(): Promise<
  ActionResult<GrupoFamiliarListItem[]>
> {
  try {
    const grupos = await db.grupoFamiliar.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        miembros: {
          include: {
            cliente: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const gruposFormateados = grupos.map((grupo) => {
      const titular = grupo.miembros.find((m) => m.esTitular);
      return {
        id: grupo.id,
        nombre: grupo.nombre,
        activo: grupo.activo,
        totalMiembros: grupo.miembros.length,
        titular: titular
          ? {
              id: titular.cliente.id,
              nombreCompleto: `${titular.cliente.nombres} ${titular.cliente.apellidos}`,
            }
          : null,
        createdAt: grupo.createdAt,
      };
    });

    return {
      success: true,
      data: gruposFormateados,
    };
  } catch (error) {
    console.error("Error al obtener todos los grupos familiares:", error);
    return {
      success: false,
      error: "Error al obtener los grupos familiares",
    };
  }
}

export async function obtenerGrupoFamiliarPorId(
  id: string,
): Promise<ActionResult<GrupoFamiliarCompleto>> {
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
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
          orderBy: [{ esTitular: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!grupo) {
      return {
        success: false,
        error: "Grupo familiar no encontrado",
      };
    }

    const grupoFormateado: GrupoFamiliarCompleto = {
      ...grupo,
      miembros: grupo.miembros.map((miembro) => ({
        ...miembro,
        cliente: {
          ...miembro.cliente,
          nombreCompleto: `${miembro.cliente.nombres} ${miembro.cliente.apellidos}`,
        },
      })),
      totalMiembros: grupo.miembros.length,
    };

    return {
      success: true,
      data: grupoFormateado,
    };
  } catch (error) {
    console.error("Error al obtener grupo familiar por ID:", error);
    return {
      success: false,
      error: "Error al obtener el grupo familiar",
    };
  }
}

export async function obtenerGruposFamiliaresPorCliente(
  clienteId: string,
): Promise<ActionResult<GrupoFamiliarListItem[]>> {
  try {
    const miembros = await db.grupoFamiliarMiembro.findMany({
      where: { clienteId },
      include: {
        grupoFamiliar: {
          include: {
            miembros: {
              include: {
                cliente: {
                  select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const gruposFormateados = miembros.map((miembro) => {
      const grupo = miembro.grupoFamiliar;
      const titular = grupo.miembros.find((m) => m.esTitular);
      return {
        id: grupo.id,
        nombre: grupo.nombre,
        activo: grupo.activo,
        totalMiembros: grupo.miembros.length,
        titular: titular
          ? {
              id: titular.cliente.id,
              nombreCompleto: `${titular.cliente.nombres} ${titular.cliente.apellidos}`,
            }
          : null,
        createdAt: grupo.createdAt,
      };
    });

    return {
      success: true,
      data: gruposFormateados,
    };
  } catch (error) {
    console.error("Error al obtener grupos familiares por cliente:", error);
    return {
      success: false,
      error: "Error al obtener los grupos familiares",
    };
  }
}

export async function crearGrupoFamiliar(
  input: CreateGrupoFamiliarFormData,
): Promise<ActionResult<GrupoFamiliar>> {
  try {
    const validated = createGrupoFamiliarSchema.parse(input);

    const grupo = await db.grupoFamiliar.create({
      data: validated,
    });

    return {
      success: true,
      data: grupo,
    };
  } catch (error) {
    console.error("Error al crear grupo familiar:", error);
    return {
      success: false,
      error: "Error al crear el grupo familiar",
    };
  }
}

export async function crearGrupoFamiliarConMiembros(
  input: CreateGrupoFamiliarConMiembrosFormData,
): Promise<ActionResult<GrupoFamiliarCompleto>> {
  try {
    const validated = createGrupoFamiliarConMiembrosSchema.parse(input);

    const clienteIds = validated.miembros.map((m) => m.clienteId);
    const clientesExisten = await db.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true },
    });

    if (clientesExisten.length !== clienteIds.length) {
      return {
        success: false,
        error: "Uno o más clientes no existen",
      };
    }

    const parentescoIds = validated.miembros.map((m) => m.parentescoId);
    const parentescosExisten = await db.catalogoParentesco.findMany({
      where: { id: { in: parentescoIds } },
      select: { id: true },
    });

    if (parentescosExisten.length !== parentescoIds.length) {
      return {
        success: false,
        error: "Uno o más parentescos no existen",
      };
    }

    const grupo = await db.$transaction(async (tx) => {
      const nuevoGrupo = await tx.grupoFamiliar.create({
        data: validated.grupoFamiliar,
      });

      await tx.grupoFamiliarMiembro.createMany({
        data: validated.miembros.map((miembro) => ({
          grupoFamiliarId: nuevoGrupo.id,
          clienteId: miembro.clienteId,
          parentescoId: miembro.parentescoId,
          esTitular: miembro.esTitular ?? false,
        })),
      });

      const grupoCompleto = await tx.grupoFamiliar.findUnique({
        where: { id: nuevoGrupo.id },
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
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
            orderBy: [{ esTitular: "desc" }, { createdAt: "asc" }],
          },
        },
      });

      return grupoCompleto;
    });

    if (!grupo) {
      return {
        success: false,
        error: "Error al crear el grupo familiar con miembros",
      };
    }

    const grupoFormateado: GrupoFamiliarCompleto = {
      ...grupo,
      miembros: grupo.miembros.map((miembro) => ({
        ...miembro,
        cliente: {
          ...miembro.cliente,
          nombreCompleto: `${miembro.cliente.nombres} ${miembro.cliente.apellidos}`,
        },
      })),
      totalMiembros: grupo.miembros.length,
    };

    return {
      success: true,
      data: grupoFormateado,
    };
  } catch (error) {
    console.error("Error al crear grupo familiar con miembros:", error);
    return {
      success: false,
      error: "Error al crear el grupo familiar con miembros",
    };
  }
}

export async function actualizarGrupoFamiliar(
  id: string,
  input: UpdateGrupoFamiliarFormData,
): Promise<ActionResult<GrupoFamiliar>> {
  try {
    const validated = updateGrupoFamiliarSchema.parse(input);

    const grupoExiste = await db.grupoFamiliar.findUnique({
      where: { id },
    });

    if (!grupoExiste) {
      return {
        success: false,
        error: "Grupo familiar no encontrado",
      };
    }

    const grupo = await db.grupoFamiliar.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: grupo,
    };
  } catch (error) {
    console.error("Error al actualizar grupo familiar:", error);
    return {
      success: false,
      error: "Error al actualizar el grupo familiar",
    };
  }
}

export async function toggleGrupoFamiliarActivo(
  id: string,
): Promise<ActionResult<GrupoFamiliar>> {
  try {
    const grupo = await db.grupoFamiliar.findUnique({
      where: { id },
    });

    if (!grupo) {
      return {
        success: false,
        error: "Grupo familiar no encontrado",
      };
    }

    const grupoActualizado = await db.grupoFamiliar.update({
      where: { id },
      data: { activo: !grupo.activo },
    });

    return {
      success: true,
      data: grupoActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de grupo familiar:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del grupo familiar",
    };
  }
}

export async function eliminarGrupoFamiliar(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const grupo = await db.grupoFamiliar.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            citasGrupales: true,
          },
        },
      },
    });

    if (!grupo) {
      return {
        success: false,
        error: "Grupo familiar no encontrado",
      };
    }

    if (grupo._count.citasGrupales > 0) {
      await db.grupoFamiliar.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
      };
    }

    await db.grupoFamiliar.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar grupo familiar:", error);
    return {
      success: false,
      error: "Error al eliminar el grupo familiar",
    };
  }
}
