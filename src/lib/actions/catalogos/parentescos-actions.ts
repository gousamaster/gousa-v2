// src/lib/actions/catalogos/parentescos-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CatalogoParentesco,
  ParentescoListItem,
} from "@/types/parentesco-types";
import {
  type CreateParentescoFormData,
  createParentescoSchema,
  type UpdateParentescoFormData,
  updateParentescoSchema,
} from "@/validations/parentesco-validations";

export async function obtenerParentescosActivos(): Promise<
  ActionResult<ParentescoListItem[]>
> {
  try {
    const parentescos = await db.catalogoParentesco.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        orden: true,
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    return {
      success: true,
      data: parentescos,
    };
  } catch (error) {
    console.error("Error al obtener parentescos activos:", error);
    return {
      success: false,
      error: "Error al obtener los parentescos",
    };
  }
}

export async function obtenerTodosLosParentescos(): Promise<
  ActionResult<ParentescoListItem[]>
> {
  try {
    const parentescos = await db.catalogoParentesco.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        orden: true,
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    return {
      success: true,
      data: parentescos,
    };
  } catch (error) {
    console.error("Error al obtener todos los parentescos:", error);
    return {
      success: false,
      error: "Error al obtener los parentescos",
    };
  }
}

export async function obtenerParentescoPorId(
  id: string,
): Promise<ActionResult<CatalogoParentesco>> {
  try {
    const parentesco = await db.catalogoParentesco.findUnique({
      where: { id },
    });

    if (!parentesco) {
      return {
        success: false,
        error: "Parentesco no encontrado",
      };
    }

    return {
      success: true,
      data: parentesco,
    };
  } catch (error) {
    console.error("Error al obtener parentesco por ID:", error);
    return {
      success: false,
      error: "Error al obtener el parentesco",
    };
  }
}

export async function crearParentesco(
  input: CreateParentescoFormData,
): Promise<ActionResult<CatalogoParentesco>> {
  try {
    const validated = createParentescoSchema.parse(input);

    const parentesco = await db.catalogoParentesco.create({
      data: validated,
    });

    return {
      success: true,
      data: parentesco,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un parentesco con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un parentesco con este código",
          };
        }
      }
    }

    console.error("Error al crear parentesco:", error);
    return {
      success: false,
      error: "Error al crear el parentesco",
    };
  }
}

export async function actualizarParentesco(
  id: string,
  input: UpdateParentescoFormData,
): Promise<ActionResult<CatalogoParentesco>> {
  try {
    const validated = updateParentescoSchema.parse(input);

    const parentescoExiste = await db.catalogoParentesco.findUnique({
      where: { id },
    });

    if (!parentescoExiste) {
      return {
        success: false,
        error: "Parentesco no encontrado",
      };
    }

    const parentesco = await db.catalogoParentesco.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: parentesco,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un parentesco con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un parentesco con este código",
          };
        }
      }
    }

    console.error("Error al actualizar parentesco:", error);
    return {
      success: false,
      error: "Error al actualizar el parentesco",
    };
  }
}

export async function toggleParentescoActivo(
  id: string,
): Promise<ActionResult<CatalogoParentesco>> {
  try {
    const parentesco = await db.catalogoParentesco.findUnique({
      where: { id },
    });

    if (!parentesco) {
      return {
        success: false,
        error: "Parentesco no encontrado",
      };
    }

    const parentescoActualizado = await db.catalogoParentesco.update({
      where: { id },
      data: { activo: !parentesco.activo },
    });

    return {
      success: true,
      data: parentescoActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de parentesco:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del parentesco",
    };
  }
}

export async function eliminarParentesco(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const parentesco = await db.catalogoParentesco.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            miembrosFamiliares: true,
          },
        },
      },
    });

    if (!parentesco) {
      return {
        success: false,
        error: "Parentesco no encontrado",
      };
    }

    if (parentesco._count.miembrosFamiliares > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar el parentesco porque tiene miembros familiares asociados",
      };
    }

    await db.catalogoParentesco.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar parentesco:", error);
    return {
      success: false,
      error: "Error al eliminar el parentesco",
    };
  }
}
