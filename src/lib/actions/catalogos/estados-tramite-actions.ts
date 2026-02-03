// src/lib/actions/catalogos/estados-tramite-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CatalogoEstadoTramite,
  EstadoTramiteListItem,
} from "@/types/estado-tramite-types";
import {
  type CreateEstadoTramiteFormData,
  createEstadoTramiteSchema,
  type UpdateEstadoTramiteFormData,
  updateEstadoTramiteSchema,
} from "@/validations/estado-tramite-validations";

export async function obtenerEstadosTramiteActivos(): Promise<
  ActionResult<EstadoTramiteListItem[]>
> {
  try {
    const estados = await db.catalogoEstadoTramite.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        color: true,
        orden: true,
        activo: true,
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    return {
      success: true,
      data: estados,
    };
  } catch (error) {
    console.error("Error al obtener estados de trámite activos:", error);
    return {
      success: false,
      error: "Error al obtener los estados de trámite",
    };
  }
}

export async function obtenerTodosLosEstadosTramite(): Promise<
  ActionResult<EstadoTramiteListItem[]>
> {
  try {
    const estados = await db.catalogoEstadoTramite.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        color: true,
        orden: true,
        activo: true,
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    return {
      success: true,
      data: estados,
    };
  } catch (error) {
    console.error("Error al obtener todos los estados de trámite:", error);
    return {
      success: false,
      error: "Error al obtener los estados de trámite",
    };
  }
}

export async function obtenerEstadoTramitePorId(
  id: string,
): Promise<ActionResult<CatalogoEstadoTramite>> {
  try {
    const estado = await db.catalogoEstadoTramite.findUnique({
      where: { id },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de trámite no encontrado",
      };
    }

    return {
      success: true,
      data: estado,
    };
  } catch (error) {
    console.error("Error al obtener estado de trámite por ID:", error);
    return {
      success: false,
      error: "Error al obtener el estado de trámite",
    };
  }
}

export async function crearEstadoTramite(
  input: CreateEstadoTramiteFormData,
): Promise<ActionResult<CatalogoEstadoTramite>> {
  try {
    const validated = createEstadoTramiteSchema.parse(input);

    const estado = await db.catalogoEstadoTramite.create({
      data: validated,
    });

    return {
      success: true,
      data: estado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un estado de trámite con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un estado de trámite con este código",
          };
        }
      }
    }

    console.error("Error al crear estado de trámite:", error);
    return {
      success: false,
      error: "Error al crear el estado de trámite",
    };
  }
}

export async function actualizarEstadoTramite(
  id: string,
  input: UpdateEstadoTramiteFormData,
): Promise<ActionResult<CatalogoEstadoTramite>> {
  try {
    const validated = updateEstadoTramiteSchema.parse(input);

    const estadoExiste = await db.catalogoEstadoTramite.findUnique({
      where: { id },
    });

    if (!estadoExiste) {
      return {
        success: false,
        error: "Estado de trámite no encontrado",
      };
    }

    const estado = await db.catalogoEstadoTramite.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: estado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un estado de trámite con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un estado de trámite con este código",
          };
        }
      }
    }

    console.error("Error al actualizar estado de trámite:", error);
    return {
      success: false,
      error: "Error al actualizar el estado de trámite",
    };
  }
}

export async function toggleEstadoTramiteActivo(
  id: string,
): Promise<ActionResult<CatalogoEstadoTramite>> {
  try {
    const estado = await db.catalogoEstadoTramite.findUnique({
      where: { id },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de trámite no encontrado",
      };
    }

    const estadoActualizado = await db.catalogoEstadoTramite.update({
      where: { id },
      data: { activo: !estado.activo },
    });

    return {
      success: true,
      data: estadoActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de trámite:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del trámite",
    };
  }
}

export async function eliminarEstadoTramite(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const estado = await db.catalogoEstadoTramite.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tramites: true,
            tramiteHistorial: true,
          },
        },
      },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de trámite no encontrado",
      };
    }

    const totalRelaciones =
      estado._count.tramites + estado._count.tramiteHistorial;

    if (totalRelaciones > 0) {
      return {
        success: false,
        error: "No se puede eliminar el estado porque tiene trámites asociados",
      };
    }

    await db.catalogoEstadoTramite.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar estado de trámite:", error);
    return {
      success: false,
      error: "Error al eliminar el estado de trámite",
    };
  }
}
