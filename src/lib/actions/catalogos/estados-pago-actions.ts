// src/lib/actions/catalogos/estados-pago-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CatalogoEstadoPago,
  EstadoPagoListItem,
} from "@/types/estado-pago-types";
import {
  type CreateEstadoPagoFormData,
  createEstadoPagoSchema,
  type UpdateEstadoPagoFormData,
  updateEstadoPagoSchema,
} from "@/validations/estado-pago-validations";

export async function obtenerEstadosPagoActivos(): Promise<
  ActionResult<EstadoPagoListItem[]>
> {
  try {
    const estados = await db.catalogoEstadoPago.findMany({
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
    console.error("Error al obtener estados de pago activos:", error);
    return {
      success: false,
      error: "Error al obtener los estados de pago",
    };
  }
}

export async function obtenerTodosLosEstadosPago(): Promise<
  ActionResult<EstadoPagoListItem[]>
> {
  try {
    const estados = await db.catalogoEstadoPago.findMany({
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
    console.error("Error al obtener todos los estados de pago:", error);
    return {
      success: false,
      error: "Error al obtener los estados de pago",
    };
  }
}

export async function obtenerEstadoPagoPorId(
  id: string,
): Promise<ActionResult<CatalogoEstadoPago>> {
  try {
    const estado = await db.catalogoEstadoPago.findUnique({
      where: { id },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de pago no encontrado",
      };
    }

    return {
      success: true,
      data: estado,
    };
  } catch (error) {
    console.error("Error al obtener estado de pago por ID:", error);
    return {
      success: false,
      error: "Error al obtener el estado de pago",
    };
  }
}

export async function crearEstadoPago(
  input: CreateEstadoPagoFormData,
): Promise<ActionResult<CatalogoEstadoPago>> {
  try {
    const validated = createEstadoPagoSchema.parse(input);

    const estado = await db.catalogoEstadoPago.create({
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
            error: "Ya existe un estado de pago con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un estado de pago con este código",
          };
        }
      }
    }

    console.error("Error al crear estado de pago:", error);
    return {
      success: false,
      error: "Error al crear el estado de pago",
    };
  }
}

export async function actualizarEstadoPago(
  id: string,
  input: UpdateEstadoPagoFormData,
): Promise<ActionResult<CatalogoEstadoPago>> {
  try {
    const validated = updateEstadoPagoSchema.parse(input);

    const estadoExiste = await db.catalogoEstadoPago.findUnique({
      where: { id },
    });

    if (!estadoExiste) {
      return {
        success: false,
        error: "Estado de pago no encontrado",
      };
    }

    const estado = await db.catalogoEstadoPago.update({
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
            error: "Ya existe un estado de pago con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un estado de pago con este código",
          };
        }
      }
    }

    console.error("Error al actualizar estado de pago:", error);
    return {
      success: false,
      error: "Error al actualizar el estado de pago",
    };
  }
}

export async function toggleEstadoPagoActivo(
  id: string,
): Promise<ActionResult<CatalogoEstadoPago>> {
  try {
    const estado = await db.catalogoEstadoPago.findUnique({
      where: { id },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de pago no encontrado",
      };
    }

    const estadoActualizado = await db.catalogoEstadoPago.update({
      where: { id },
      data: { activo: !estado.activo },
    });

    return {
      success: true,
      data: estadoActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de pago:", error);
    return {
      success: false,
      error: "Error al cambiar el estado de pago",
    };
  }
}

export async function eliminarEstadoPago(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const estado = await db.catalogoEstadoPago.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientesServicios: true,
            citas: true,
          },
        },
      },
    });

    if (!estado) {
      return {
        success: false,
        error: "Estado de pago no encontrado",
      };
    }

    const totalRelaciones =
      estado._count.clientesServicios + estado._count.citas;

    if (totalRelaciones > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar el estado porque tiene registros asociados",
      };
    }

    await db.catalogoEstadoPago.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar estado de pago:", error);
    return {
      success: false,
      error: "Error al eliminar el estado de pago",
    };
  }
}
