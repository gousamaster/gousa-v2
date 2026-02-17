// src/lib/actions/clientes/clientes-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type {
  Cliente,
  ClienteCompleto,
  ClienteListItem,
} from "@/types/cliente-types";
import {
  type CreateClienteCompletoFormData,
  type CreateClienteFormData,
  createClienteCompletoSchema,
  createClienteSchema,
  type UpdateClienteFormData,
  updateClienteSchema,
} from "@/validations/cliente-validations";

export async function obtenerClientesActivos(): Promise<
  ActionResult<ClienteListItem[]>
> {
  try {
    const clientes = await db.cliente.findMany({
      where: {
        activo: true,
        deletedAt: null,
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipoCliente: true,
        email: true,
        telefonoCelular: true,
        activo: true,
        createdAt: true,
        region: {
          select: {
            nombre: true,
          },
        },
        registradoPor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const clientesFormateados = clientes.map((cliente) => ({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`,
      tipoCliente: cliente.tipoCliente,
      email: cliente.email,
      telefonoCelular: cliente.telefonoCelular,
      regionNombre: cliente.region.nombre,
      registradoPorNombre: cliente.registradoPor.name,
      activo: cliente.activo,
      createdAt: cliente.createdAt,
    }));

    return {
      success: true,
      data: clientesFormateados,
    };
  } catch (error) {
    console.error("Error al obtener clientes activos:", error);
    return {
      success: false,
      error: "Error al obtener los clientes",
    };
  }
}

export async function obtenerTodosLosClientes(): Promise<
  ActionResult<ClienteListItem[]>
> {
  try {
    const clientes = await db.cliente.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipoCliente: true,
        email: true,
        telefonoCelular: true,
        activo: true,
        createdAt: true,
        region: {
          select: {
            nombre: true,
          },
        },
        registradoPor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const clientesFormateados = clientes.map((cliente) => ({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`,
      tipoCliente: cliente.tipoCliente,
      email: cliente.email,
      telefonoCelular: cliente.telefonoCelular,
      regionNombre: cliente.region.nombre,
      registradoPorNombre: cliente.registradoPor.name,
      activo: cliente.activo,
      createdAt: cliente.createdAt,
    }));

    return {
      success: true,
      data: clientesFormateados,
    };
  } catch (error) {
    console.error("Error al obtener todos los clientes:", error);
    return {
      success: false,
      error: "Error al obtener los clientes",
    };
  }
}

export async function obtenerClientePorId(
  id: string,
): Promise<ActionResult<ClienteCompleto>> {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id },
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
    };

    return {
      success: true,
      data: clienteFormateado,
    };
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    return {
      success: false,
      error: "Error al obtener el cliente",
    };
  }
}

export async function crearCliente(
  input: CreateClienteFormData,
): Promise<ActionResult<Cliente>> {
  try {
    const validated = createClienteSchema.parse(input);

    const regionExiste = await db.region.findUnique({
      where: { id: validated.regionId },
    });

    if (!regionExiste) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const usuarioExiste = await db.user.findUnique({
      where: { id: validated.registradoPorId },
    });

    if (!usuarioExiste) {
      return {
        success: false,
        error: "Usuario registrador no encontrado",
      };
    }

    const cliente = await db.cliente.create({
      data: validated,
    });

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("numeroCi")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de CI",
          };
        }
        if (target.includes("numeroPasaporte")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de pasaporte",
          };
        }
      }
    }

    console.error("Error al crear cliente:", error);
    return {
      success: false,
      error: "Error al crear el cliente",
    };
  }
}

export async function crearClienteCompleto(
  input: CreateClienteCompletoFormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createClienteCompletoSchema.parse(input);

    const regionExiste = await db.region.findUnique({
      where: { id: validated.cliente.regionId },
    });

    if (!regionExiste) {
      return {
        success: false,
        error: "Región no encontrada",
      };
    }

    const usuarioExiste = await db.user.findUnique({
      where: { id: validated.cliente.registradoPorId },
    });

    if (!usuarioExiste) {
      return {
        success: false,
        error: "Usuario registrador no encontrado",
      };
    }

    const clienteId = await db.$transaction(
      async (tx) => {
        const nuevoCliente = await tx.cliente.create({
          data: validated.cliente,
        });

        const operations = [];

        if (
          validated.datosPersonales &&
          Object.keys(validated.datosPersonales).length > 0
        ) {
          operations.push(
            tx.clienteDatosPersonales.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosPersonales,
              },
            }),
          );
        }

        if (
          validated.datosLaborales &&
          Object.keys(validated.datosLaborales).length > 0
        ) {
          operations.push(
            tx.clienteDatosLaborales.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosLaborales,
              },
            }),
          );
        }

        if (
          validated.datosAcademicos &&
          Object.keys(validated.datosAcademicos).length > 0
        ) {
          operations.push(
            tx.clienteDatosAcademicos.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosAcademicos,
              },
            }),
          );
        }

        if (
          validated.datosMatrimoniales &&
          Object.keys(validated.datosMatrimoniales).length > 0
        ) {
          operations.push(
            tx.clienteDatosMatrimoniales.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosMatrimoniales,
              },
            }),
          );
        }

        if (
          validated.datosPatrocinador &&
          Object.keys(validated.datosPatrocinador).length > 0
        ) {
          operations.push(
            tx.clienteDatosPatrocinador.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosPatrocinador,
              },
            }),
          );
        }

        if (operations.length > 0) {
          await Promise.all(operations);
        }

        return nuevoCliente.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    return {
      success: true,
      data: { id: clienteId },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("numeroCi")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de CI",
          };
        }
        if (target.includes("numeroPasaporte")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de pasaporte",
          };
        }
      }
      if (error.code === "P2028") {
        return {
          success: false,
          error:
            "La operación tardó demasiado tiempo. Por favor, intenta nuevamente.",
        };
      }
    }

    console.error("Error al crear cliente completo:", error);
    return {
      success: false,
      error: "Error al crear el cliente completo",
    };
  }
}

export async function actualizarCliente(
  id: string,
  input: UpdateClienteFormData,
): Promise<ActionResult<Cliente>> {
  try {
    const validated = updateClienteSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    if (validated.regionId) {
      const regionExiste = await db.region.findUnique({
        where: { id: validated.regionId },
      });

      if (!regionExiste) {
        return {
          success: false,
          error: "Región no encontrada",
        };
      }
    }

    const cliente = await db.cliente.update({
      where: { id },
      data: validated,
    });

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("numeroCi")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de CI",
          };
        }
        if (target.includes("numeroPasaporte")) {
          return {
            success: false,
            error: "Ya existe un cliente con este número de pasaporte",
          };
        }
      }
    }

    console.error("Error al actualizar cliente:", error);
    return {
      success: false,
      error: "Error al actualizar el cliente",
    };
  }
}

export async function toggleClienteActivo(
  id: string,
): Promise<ActionResult<Cliente>> {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const clienteActualizado = await db.cliente.update({
      where: { id },
      data: { activo: !cliente.activo },
    });

    return {
      success: true,
      data: clienteActualizado,
    };
  } catch (error) {
    console.error("Error al cambiar estado de cliente:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del cliente",
    };
  }
}

export async function eliminarCliente(id: string): Promise<ActionResult<void>> {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            servicios: true,
            tramites: true,
            gruposFamiliares: true,
          },
        },
      },
    });

    if (!cliente) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const totalRelaciones =
      cliente._count.servicios +
      cliente._count.tramites +
      cliente._count.gruposFamiliares;

    if (totalRelaciones > 0) {
      await db.cliente.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
      };
    }

    await db.cliente.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return {
      success: false,
      error: "Error al eliminar el cliente",
    };
  }
}

export async function buscarClientes(
  query: string,
): Promise<ActionResult<ClienteListItem[]>> {
  try {
    const clientes = await db.cliente.findMany({
      where: {
        deletedAt: null,
        OR: [
          { nombres: { contains: query, mode: "insensitive" } },
          { apellidos: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { numeroCi: { contains: query, mode: "insensitive" } },
          { numeroPasaporte: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipoCliente: true,
        email: true,
        telefonoCelular: true,
        activo: true,
        createdAt: true,
        region: {
          select: {
            nombre: true,
          },
        },
        registradoPor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });

    const clientesFormateados = clientes.map((cliente) => ({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`,
      tipoCliente: cliente.tipoCliente,
      email: cliente.email,
      telefonoCelular: cliente.telefonoCelular,
      regionNombre: cliente.region.nombre,
      registradoPorNombre: cliente.registradoPor.name,
      activo: cliente.activo,
      createdAt: cliente.createdAt,
    }));

    return {
      success: true,
      data: clientesFormateados,
    };
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    return {
      success: false,
      error: "Error al buscar clientes",
    };
  }
}
