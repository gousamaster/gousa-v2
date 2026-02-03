// src/lib/actions/catalogos/tipos-cita-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CatalogoTipoCita,
  CitaPrecioDetalle,
  TipoCitaConPrecios,
  TipoCitaListItem,
} from "@/types/tipo-cita-types";
import {
  type CitaPrecioFormData,
  type CitaPrecioInput,
  type CreateTipoCitaConPreciosFormData,
  type CreateTipoCitaFormData,
  citaPrecioInputSchema,
  citaPrecioSchema,
  createTipoCitaConPreciosSchema,
  createTipoCitaSchema,
  type UpdateCitaPrecioFormData,
  type UpdateTipoCitaFormData,
  updateCitaPrecioSchema,
  updateTipoCitaSchema,
} from "@/validations/tipo-cita-validations";

export async function obtenerTiposCitaActivos(): Promise<
  ActionResult<TipoCitaListItem[]>
> {
  try {
    const tiposCita = await db.catalogoTipoCita.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        orden: true,
        _count: {
          select: {
            preciosPorRegion: true,
          },
        },
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    const tiposFormateados = tiposCita.map((tipo) => ({
      id: tipo.id,
      nombre: tipo.nombre,
      codigo: tipo.codigo,
      activo: tipo.activo,
      orden: tipo.orden,
      totalPrecios: tipo._count.preciosPorRegion,
    }));

    return {
      success: true,
      data: tiposFormateados,
    };
  } catch (error) {
    console.error("Error al obtener tipos de cita activos:", error);
    return {
      success: false,
      error: "Error al obtener los tipos de cita",
    };
  }
}

export async function obtenerTodosLosTiposCita(): Promise<
  ActionResult<TipoCitaListItem[]>
> {
  try {
    const tiposCita = await db.catalogoTipoCita.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        orden: true,
        _count: {
          select: {
            preciosPorRegion: true,
          },
        },
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    const tiposFormateados = tiposCita.map((tipo) => ({
      id: tipo.id,
      nombre: tipo.nombre,
      codigo: tipo.codigo,
      activo: tipo.activo,
      orden: tipo.orden,
      totalPrecios: tipo._count.preciosPorRegion,
    }));

    return {
      success: true,
      data: tiposFormateados,
    };
  } catch (error) {
    console.error("Error al obtener todos los tipos de cita:", error);
    return {
      success: false,
      error: "Error al obtener los tipos de cita",
    };
  }
}

export async function obtenerTipoCitaPorId(
  id: string,
): Promise<ActionResult<TipoCitaConPrecios>> {
  try {
    const tipoCita = await db.catalogoTipoCita.findUnique({
      where: { id },
      include: {
        preciosPorRegion: {
          orderBy: { region: { nombre: "asc" } },
        },
      },
    });

    if (!tipoCita) {
      return {
        success: false,
        error: "Tipo de cita no encontrado",
      };
    }

    const tipoCitaFormateado: TipoCitaConPrecios = {
      id: tipoCita.id,
      nombre: tipoCita.nombre,
      descripcion: tipoCita.descripcion,
      codigo: tipoCita.codigo,
      activo: tipoCita.activo,
      orden: tipoCita.orden,
      createdAt: tipoCita.createdAt,
      updatedAt: tipoCita.updatedAt,
      preciosPorRegion: tipoCita.preciosPorRegion.map((precio) => ({
        ...precio,
        precio: Number(precio.precio),
      })),
    };

    return {
      success: true,
      data: tipoCitaFormateado,
    };
  } catch (error) {
    console.error("Error al obtener tipo de cita por ID:", error);
    return {
      success: false,
      error: "Error al obtener el tipo de cita",
    };
  }
}

export async function crearTipoCita(
  input: CreateTipoCitaFormData,
): Promise<ActionResult<CatalogoTipoCita>> {
  try {
    const validated = createTipoCitaSchema.parse(input);

    const tipoCita = await db.catalogoTipoCita.create({
      data: validated,
    });

    return {
      success: true,
      data: tipoCita,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este código",
          };
        }
      }
    }

    console.error("Error al crear tipo de cita:", error);
    return {
      success: false,
      error: "Error al crear el tipo de cita",
    };
  }
}

export async function crearTipoCitaConPrecios(
  input: CreateTipoCitaConPreciosFormData,
): Promise<ActionResult<TipoCitaConPrecios>> {
  try {
    const validated = createTipoCitaConPreciosSchema.parse(input);

    const tipoCita = await db.$transaction(async (tx) => {
      const nuevoTipoCita = await tx.catalogoTipoCita.create({
        data: validated.tipoCita,
      });

      const preciosCreados = await tx.citaPrecioPorRegion.createMany({
        data: validated.precios.map((precio) => ({
          tipoCitaId: nuevoTipoCita.id,
          regionId: precio.regionId,
          precio: precio.precio,
          activo: true,
        })),
      });

      const tipoCitaConPrecios = await tx.catalogoTipoCita.findUnique({
        where: { id: nuevoTipoCita.id },
        include: {
          preciosPorRegion: true,
        },
      });

      return tipoCitaConPrecios;
    });

    if (!tipoCita) {
      return {
        success: false,
        error: "Error al crear el tipo de cita con precios",
      };
    }

    const tipoCitaFormateado: TipoCitaConPrecios = {
      ...tipoCita,
      preciosPorRegion: tipoCita.preciosPorRegion.map((precio) => ({
        ...precio,
        precio: Number(precio.precio),
      })),
    };

    return {
      success: true,
      data: tipoCitaFormateado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este código",
          };
        }
      }
    }

    console.error("Error al crear tipo de cita con precios:", error);
    return {
      success: false,
      error: "Error al crear el tipo de cita con precios",
    };
  }
}

export async function actualizarTipoCita(
  id: string,
  input: UpdateTipoCitaFormData,
): Promise<ActionResult<CatalogoTipoCita>> {
  try {
    const validated = updateTipoCitaSchema.parse(input);

    const tipoCitaExiste = await db.catalogoTipoCita.findUnique({
      where: { id },
    });

    if (!tipoCitaExiste) {
      return {
        success: false,
        error: "Tipo de cita no encontrado",
      };
    }

    const tipoCita = await db.catalogoTipoCita.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: tipoCita,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un tipo de cita con este código",
          };
        }
      }
    }

    console.error("Error al actualizar tipo de cita:", error);
    return {
      success: false,
      error: "Error al actualizar el tipo de cita",
    };
  }
}

export async function toggleTipoCitaActivo(
  id: string,
): Promise<ActionResult<CatalogoTipoCita>> {
  try {
    const tipoCita = await db.catalogoTipoCita.findUnique({
      where: { id },
    });

    if (!tipoCita) {
      return {
        success: false,
        error: "Tipo de cita no encontrado",
      };
    }

    const tipoCitaActualizado = await db.catalogoTipoCita.update({
      where: { id },
      data: { activo: !tipoCita.activo },
    });

    return {
      success: true,
      data: tipoCitaActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de tipo de cita:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del tipo de cita",
    };
  }
}

export async function eliminarTipoCita(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const tipoCita = await db.catalogoTipoCita.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            citas: true,
          },
        },
      },
    });

    if (!tipoCita) {
      return {
        success: false,
        error: "Tipo de cita no encontrado",
      };
    }

    if (tipoCita._count.citas > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar el tipo de cita porque tiene citas asociadas",
      };
    }

    await db.catalogoTipoCita.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar tipo de cita:", error);
    return {
      success: false,
      error: "Error al eliminar el tipo de cita",
    };
  }
}

export async function obtenerPreciosPorTipoCita(
  tipoCitaId: string,
): Promise<ActionResult<CitaPrecioDetalle[]>> {
  try {
    const precios = await db.citaPrecioPorRegion.findMany({
      where: { tipoCitaId },
      include: {
        region: {
          select: {
            nombre: true,
            codigo: true,
          },
        },
      },
      orderBy: { region: { nombre: "asc" } },
    });

    const preciosFormateados = precios.map((precio) => ({
      id: precio.id,
      regionId: precio.regionId,
      regionNombre: precio.region.nombre,
      regionCodigo: precio.region.codigo,
      precio: Number(precio.precio),
      activo: precio.activo,
    }));

    return {
      success: true,
      data: preciosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener precios por tipo de cita:", error);
    return {
      success: false,
      error: "Error al obtener los precios",
    };
  }
}

export async function agregarPrecioATipoCita(
  input: CitaPrecioInput,
): Promise<ActionResult<CitaPrecioDetalle>> {
  try {
    const validated = citaPrecioInputSchema.parse(input);

    const tipoCitaExiste = await db.catalogoTipoCita.findUnique({
      where: { id: validated.tipoCitaId },
    });

    if (!tipoCitaExiste) {
      return {
        success: false,
        error: "Tipo de cita no encontrado",
      };
    }

    const regionExiste = await db.region.findUnique({
      where: { id: validated.regionId },
    });

    if (!regionExiste) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const precio = await db.citaPrecioPorRegion.create({
      data: {
        tipoCitaId: validated.tipoCitaId,
        regionId: validated.regionId,
        precio: validated.precio,
        activo: true,
      },
      include: {
        region: {
          select: {
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    const precioFormateado: CitaPrecioDetalle = {
      id: precio.id,
      regionId: precio.regionId,
      regionNombre: precio.region.nombre,
      regionCodigo: precio.region.codigo,
      precio: Number(precio.precio),
      activo: precio.activo,
    };

    return {
      success: true,
      data: precioFormateado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Ya existe un precio para esta región",
        };
      }
    }

    console.error("Error al agregar precio a tipo de cita:", error);
    return {
      success: false,
      error: "Error al agregar el precio",
    };
  }
}

export async function actualizarPrecioTipoCita(
  precioId: string,
  input: UpdateCitaPrecioFormData,
): Promise<ActionResult<CitaPrecioDetalle>> {
  try {
    const validated = updateCitaPrecioSchema.parse(input);

    const precioExiste = await db.citaPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precioExiste) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    const precio = await db.citaPrecioPorRegion.update({
      where: { id: precioId },
      data: validated,
      include: {
        region: {
          select: {
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    const precioFormateado: CitaPrecioDetalle = {
      id: precio.id,
      regionId: precio.regionId,
      regionNombre: precio.region.nombre,
      regionCodigo: precio.region.codigo,
      precio: Number(precio.precio),
      activo: precio.activo,
    };

    return {
      success: true,
      data: precioFormateado,
    };
  } catch (error) {
    console.error("Error al actualizar precio de tipo de cita:", error);
    return {
      success: false,
      error: "Error al actualizar el precio",
    };
  }
}

export async function eliminarPrecioTipoCita(
  precioId: string,
): Promise<ActionResult<void>> {
  try {
    const precioExiste = await db.citaPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precioExiste) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    await db.citaPrecioPorRegion.delete({
      where: { id: precioId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar precio de tipo de cita:", error);
    return {
      success: false,
      error: "Error al eliminar el precio",
    };
  }
}

export async function togglePrecioTipoCitaActivo(
  precioId: string,
): Promise<ActionResult<CitaPrecioDetalle>> {
  try {
    const precio = await db.citaPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precio) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    const precioActualizado = await db.citaPrecioPorRegion.update({
      where: { id: precioId },
      data: { activo: !precio.activo },
      include: {
        region: {
          select: {
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    const precioFormateado: CitaPrecioDetalle = {
      id: precioActualizado.id,
      regionId: precioActualizado.regionId,
      regionNombre: precioActualizado.region.nombre,
      regionCodigo: precioActualizado.region.codigo,
      precio: Number(precioActualizado.precio),
      activo: precioActualizado.activo,
    };

    return {
      success: true,
      data: precioFormateado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de precio:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del precio",
    };
  }
}
