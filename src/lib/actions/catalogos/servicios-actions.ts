// src/lib/actions/catalogos/servicios-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  CatalogoServicio,
  ServicioConPrecios,
  ServicioListItem,
  ServicioPrecioDetalle,
} from "@/types/servicio-types";
import {
  type CreateServicioConPreciosFormData,
  type CreateServicioFormData,
  createServicioConPreciosSchema,
  createServicioSchema,
  type ServicioPrecioFormData,
  type ServicioPrecioInput,
  servicioPrecioInputSchema,
  servicioPrecioSchema,
  type UpdateServicioFormData,
  type UpdateServicioPrecioFormData,
  updateServicioPrecioSchema,
  updateServicioSchema,
} from "@/validations/servicio-validations";

export async function obtenerServiciosActivos(): Promise<
  ActionResult<ServicioListItem[]>
> {
  try {
    const servicios = await db.catalogoServicio.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        requiereTramite: true,
        orden: true,
        _count: {
          select: {
            preciosPorRegion: true,
          },
        },
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    const serviciosFormateados = servicios.map((servicio) => ({
      id: servicio.id,
      nombre: servicio.nombre,
      codigo: servicio.codigo,
      activo: servicio.activo,
      requiereTramite: servicio.requiereTramite,
      orden: servicio.orden,
      totalPrecios: servicio._count.preciosPorRegion,
    }));

    return {
      success: true,
      data: serviciosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener servicios activos:", error);
    return {
      success: false,
      error: "Error al obtener los servicios",
    };
  }
}

export async function obtenerTodosLosServicios(): Promise<
  ActionResult<ServicioListItem[]>
> {
  try {
    const servicios = await db.catalogoServicio.findMany({
      select: {
        id: true,
        nombre: true,
        codigo: true,
        activo: true,
        requiereTramite: true,
        orden: true,
        _count: {
          select: {
            preciosPorRegion: true,
          },
        },
      },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    const serviciosFormateados = servicios.map((servicio) => ({
      id: servicio.id,
      nombre: servicio.nombre,
      codigo: servicio.codigo,
      activo: servicio.activo,
      requiereTramite: servicio.requiereTramite,
      orden: servicio.orden,
      totalPrecios: servicio._count.preciosPorRegion,
    }));

    return {
      success: true,
      data: serviciosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener todos los servicios:", error);
    return {
      success: false,
      error: "Error al obtener los servicios",
    };
  }
}

export async function obtenerServicioPorId(
  id: string,
): Promise<ActionResult<ServicioConPrecios>> {
  try {
    const servicio = await db.catalogoServicio.findUnique({
      where: { id },
      include: {
        preciosPorRegion: {
          orderBy: { region: { nombre: "asc" } },
        },
      },
    });

    if (!servicio) {
      return {
        success: false,
        error: "Servicio no encontrado",
      };
    }

    const servicioFormateado: ServicioConPrecios = {
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      codigo: servicio.codigo,
      requiereTramite: servicio.requiereTramite,
      activo: servicio.activo,
      orden: servicio.orden,
      createdAt: servicio.createdAt,
      updatedAt: servicio.updatedAt,
      preciosPorRegion: servicio.preciosPorRegion.map((precio) => ({
        ...precio,
        precio: Number(precio.precio),
      })),
    };

    return {
      success: true,
      data: servicioFormateado,
    };
  } catch (error) {
    console.error("Error al obtener servicio por ID:", error);
    return {
      success: false,
      error: "Error al obtener el servicio",
    };
  }
}

export async function crearServicio(
  input: CreateServicioFormData,
): Promise<ActionResult<CatalogoServicio>> {
  try {
    const validated = createServicioSchema.parse(input);

    const servicio = await db.catalogoServicio.create({
      data: validated,
    });

    return {
      success: true,
      data: servicio,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un servicio con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un servicio con este código",
          };
        }
      }
    }

    console.error("Error al crear servicio:", error);
    return {
      success: false,
      error: "Error al crear el servicio",
    };
  }
}

export async function crearServicioConPrecios(
  input: CreateServicioConPreciosFormData,
): Promise<ActionResult<ServicioConPrecios>> {
  try {
    const validated = createServicioConPreciosSchema.parse(input);

    const servicio = await db.$transaction(async (tx) => {
      const nuevoServicio = await tx.catalogoServicio.create({
        data: validated.servicio,
      });

      const preciosCreados = await tx.servicioPrecioPorRegion.createMany({
        data: validated.precios.map((precio) => ({
          servicioId: nuevoServicio.id,
          regionId: precio.regionId,
          precio: precio.precio,
          activo: true,
        })),
      });

      const servicioConPrecios = await tx.catalogoServicio.findUnique({
        where: { id: nuevoServicio.id },
        include: {
          preciosPorRegion: true,
        },
      });

      return servicioConPrecios;
    });

    if (!servicio) {
      return {
        success: false,
        error: "Error al crear el servicio con precios",
      };
    }

    const servicioFormateado: ServicioConPrecios = {
      ...servicio,
      preciosPorRegion: servicio.preciosPorRegion.map((precio) => ({
        ...precio,
        precio: Number(precio.precio),
      })),
    };

    return {
      success: true,
      data: servicioFormateado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un servicio con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un servicio con este código",
          };
        }
      }
    }

    console.error("Error al crear servicio con precios:", error);
    return {
      success: false,
      error: "Error al crear el servicio con precios",
    };
  }
}

export async function actualizarServicio(
  id: string,
  input: UpdateServicioFormData,
): Promise<ActionResult<CatalogoServicio>> {
  try {
    const validated = updateServicioSchema.parse(input);

    const servicioExiste = await db.catalogoServicio.findUnique({
      where: { id },
    });

    if (!servicioExiste) {
      return {
        success: false,
        error: "Servicio no encontrado",
      };
    }

    const servicio = await db.catalogoServicio.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: servicio,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("nombre")) {
          return {
            success: false,
            error: "Ya existe un servicio con este nombre",
          };
        }
        if (target.includes("codigo")) {
          return {
            success: false,
            error: "Ya existe un servicio con este código",
          };
        }
      }
    }

    console.error("Error al actualizar servicio:", error);
    return {
      success: false,
      error: "Error al actualizar el servicio",
    };
  }
}

export async function toggleServicioActivo(
  id: string,
): Promise<ActionResult<CatalogoServicio>> {
  try {
    const servicio = await db.catalogoServicio.findUnique({
      where: { id },
    });

    if (!servicio) {
      return {
        success: false,
        error: "Servicio no encontrado",
      };
    }

    const servicioActualizado = await db.catalogoServicio.update({
      where: { id },
      data: { activo: !servicio.activo },
    });

    return {
      success: true,
      data: servicioActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de servicio:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del servicio",
    };
  }
}

export async function eliminarServicio(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const servicio = await db.catalogoServicio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientesServicios: true,
          },
        },
      },
    });

    if (!servicio) {
      return {
        success: false,
        error: "Servicio no encontrado",
      };
    }

    if (servicio._count.clientesServicios > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar el servicio porque tiene clientes asociados",
      };
    }

    await db.catalogoServicio.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return {
      success: false,
      error: "Error al eliminar el servicio",
    };
  }
}

export async function obtenerPreciosPorServicio(
  servicioId: string,
): Promise<ActionResult<ServicioPrecioDetalle[]>> {
  try {
    const precios = await db.servicioPrecioPorRegion.findMany({
      where: { servicioId },
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
    console.error("Error al obtener precios por servicio:", error);
    return {
      success: false,
      error: "Error al obtener los precios",
    };
  }
}

export async function agregarPrecioAServicio(
  input: ServicioPrecioInput,
): Promise<ActionResult<ServicioPrecioDetalle>> {
  try {
    const validated = servicioPrecioInputSchema.parse(input);

    const servicioExiste = await db.catalogoServicio.findUnique({
      where: { id: validated.servicioId },
    });

    if (!servicioExiste) {
      return {
        success: false,
        error: "Servicio no encontrado",
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

    const precio = await db.servicioPrecioPorRegion.create({
      data: {
        servicioId: validated.servicioId,
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

    const precioFormateado: ServicioPrecioDetalle = {
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

    console.error("Error al agregar precio a servicio:", error);
    return {
      success: false,
      error: "Error al agregar el precio",
    };
  }
}

export async function actualizarPrecioServicio(
  precioId: string,
  input: UpdateServicioPrecioFormData,
): Promise<ActionResult<ServicioPrecioDetalle>> {
  try {
    const validated = updateServicioPrecioSchema.parse(input);

    const precioExiste = await db.servicioPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precioExiste) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    const precio = await db.servicioPrecioPorRegion.update({
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

    const precioFormateado: ServicioPrecioDetalle = {
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
    console.error("Error al actualizar precio de servicio:", error);
    return {
      success: false,
      error: "Error al actualizar el precio",
    };
  }
}

export async function eliminarPrecioServicio(
  precioId: string,
): Promise<ActionResult<void>> {
  try {
    const precioExiste = await db.servicioPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precioExiste) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    await db.servicioPrecioPorRegion.delete({
      where: { id: precioId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar precio de servicio:", error);
    return {
      success: false,
      error: "Error al eliminar el precio",
    };
  }
}

export async function togglePrecioServicioActivo(
  precioId: string,
): Promise<ActionResult<ServicioPrecioDetalle>> {
  try {
    const precio = await db.servicioPrecioPorRegion.findUnique({
      where: { id: precioId },
    });

    if (!precio) {
      return {
        success: false,
        error: "Precio no encontrado",
      };
    }

    const precioActualizado = await db.servicioPrecioPorRegion.update({
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

    const precioFormateado: ServicioPrecioDetalle = {
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
