// src/lib/actions/catalogos/regiones-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CreateRegionInput,
  Region,
  RegionListItem,
  UpdateRegionInput,
} from "@/types/region-types";
import {
  type CreateRegionFormData,
  createRegionSchema,
  type UpdateRegionFormData,
  updateRegionSchema,
} from "@/validations/region-validations";

export async function obtenerRegionesActivas(): Promise<
  ActionResult<RegionListItem[]>
> {
  try {
    const regiones = await db.region.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { nombre: "asc" },
    });

    return {
      success: true,
      data: regiones,
    };
  } catch (error) {
    console.error("Error al obtener regiones activas:", error);
    return {
      success: false,
      error: "Error al obtener las regiones",
    };
  }
}

export async function obtenerTodasLasRegiones(): Promise<
  ActionResult<RegionListItem[]>
> {
  try {
    const regiones = await db.region.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { nombre: "asc" },
    });

    return {
      success: true,
      data: regiones,
    };
  } catch (error) {
    console.error("Error al obtener todas las regiones:", error);
    return {
      success: false,
      error: "Error al obtener las regiones",
    };
  }
}

export async function obtenerRegionPorId(
  id: string,
): Promise<ActionResult<Region>> {
  try {
    const region = await db.region.findUnique({
      where: { id },
    });

    if (!region) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    return {
      success: true,
      data: region,
    };
  } catch (error) {
    console.error("Error al obtener región por ID:", error);
    return {
      success: false,
      error: "Error al obtener la región",
    };
  }
}

export async function crearRegion(
  input: CreateRegionFormData,
): Promise<ActionResult<Region>> {
  try {
    const validated = createRegionSchema.parse(input);

    const region = await db.region.create({
      data: validated,
    });

    return {
      success: true,
      data: region,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe una región con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe una región con este código",
          };
        }
      }
    }

    console.error("Error al crear región:", error);
    return {
      success: false,
      error: "Error al crear la región",
    };
  }
}

export async function actualizarRegion(
  id: string,
  input: UpdateRegionFormData,
): Promise<ActionResult<Region>> {
  try {
    const validated = updateRegionSchema.parse(input);

    const regionExiste = await db.region.findUnique({
      where: { id },
    });

    if (!regionExiste) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const region = await db.region.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: region,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe una región con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe una región con este código",
          };
        }
      }
    }

    console.error("Error al actualizar región:", error);
    return {
      success: false,
      error: "Error al actualizar la región",
    };
  }
}

export async function toggleRegionActivo(
  id: string,
): Promise<ActionResult<Region>> {
  try {
    const region = await db.region.findUnique({
      where: { id },
    });

    if (!region) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const regionActualizada = await db.region.update({
      where: { id },
      data: { activo: !region.activo },
    });

    return {
      success: true,
      data: regionActualizada,
    };
  } catch (error) {
    console.error("Error al cambiar estado de región:", error);
    return {
      success: false,
      error: "Error al cambiar el estado de la región",
    };
  }
}

export async function eliminarRegion(id: string): Promise<ActionResult<void>> {
  try {
    const region = await db.region.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientes: true,
            serviciosPrecios: true,
            citasPrecios: true,
          },
        },
      },
    });

    if (!region) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const totalRelaciones =
      region._count.clientes +
      region._count.serviciosPrecios +
      region._count.citasPrecios;

    if (totalRelaciones > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar la región porque tiene registros asociados",
      };
    }

    await db.region.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar región:", error);
    return {
      success: false,
      error: "Error al eliminar la región",
    };
  }
}
