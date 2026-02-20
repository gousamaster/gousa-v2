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
        datosViaje: true,
        gruposFamiliares: true,
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
  console.log("🔵 [crearClienteCompleto] Inicio - Datos recibidos:", {
    cliente: {
      nombres: input.cliente?.nombres,
      apellidos: input.cliente?.apellidos,
      tipoCliente: input.cliente?.tipoCliente,
      regionId: input.cliente?.regionId,
    },
    timestamp: new Date().toISOString(),
  });

  try {
    console.log("🔵 [crearClienteCompleto] Validando datos con Zod...");
    const validated = createClienteCompletoSchema.parse(input);
    console.log("✅ [crearClienteCompleto] Validación exitosa");

    console.log(
      "🔵 [crearClienteCompleto] Verificando región:",
      validated.cliente.regionId,
    );
    const regionExiste = await db.region.findUnique({
      where: { id: validated.cliente.regionId },
    });

    if (!regionExiste) {
      console.error("❌ [crearClienteCompleto] Región no encontrada");
      return {
        success: false,
        error: "Región no encontrada",
      };
    }
    console.log(
      "✅ [crearClienteCompleto] Región encontrada:",
      regionExiste.nombre,
    );

    console.log(
      "🔵 [crearClienteCompleto] Verificando usuario:",
      validated.cliente.registradoPorId,
    );
    const usuarioExiste = await db.user.findUnique({
      where: { id: validated.cliente.registradoPorId },
    });

    if (!usuarioExiste) {
      console.error("❌ [crearClienteCompleto] Usuario no encontrado");
      return {
        success: false,
        error: "Usuario registrador no encontrado",
      };
    }
    console.log(
      "✅ [crearClienteCompleto] Usuario encontrado:",
      usuarioExiste.name,
    );

    console.log("🔵 [crearClienteCompleto] Iniciando transacción...");
    const clienteId = await db.$transaction(
      async (tx) => {
        console.log("🔵 [Transaction] Creando cliente base...");
        const nuevoCliente = await tx.cliente.create({
          data: validated.cliente,
        });
        console.log("✅ [Transaction] Cliente creado:", nuevoCliente.id);

        const operations = [];

        if (
          validated.datosPersonales &&
          Object.keys(validated.datosPersonales).length > 0
        ) {
          console.log("🔵 [Transaction] Agregando datosPersonales");
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
          console.log("🔵 [Transaction] Agregando datosLaborales");
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
          console.log("🔵 [Transaction] Agregando datosAcademicos");
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
          console.log("🔵 [Transaction] Agregando datosMatrimoniales");
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
          console.log("🔵 [Transaction] Agregando datosPatrocinador");
          operations.push(
            tx.clienteDatosPatrocinador.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosPatrocinador,
              },
            }),
          );
        }

        if (
          validated.datosViaje &&
          Object.keys(validated.datosViaje).length > 0
        ) {
          console.log("🔵 [Transaction] Agregando datosViaje");
          operations.push(
            tx.clienteDatosViaje.create({
              data: {
                clienteId: nuevoCliente.id,
                ...validated.datosViaje,
              },
            }),
          );
        }

        if (operations.length > 0) {
          console.log(
            `🔵 [Transaction] Ejecutando ${operations.length} operaciones adicionales...`,
          );
          await Promise.all(operations);
          console.log("✅ [Transaction] Operaciones adicionales completadas");
        }

        return nuevoCliente.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    console.log(
      "✅ [crearClienteCompleto] Cliente creado exitosamente:",
      clienteId,
    );

    return {
      success: true,
      data: { id: clienteId },
    };
  } catch (error) {
    console.error("❌ [crearClienteCompleto] ERROR CAPTURADO:", {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("❌ [crearClienteCompleto] Error Prisma:", {
        code: error.code,
        meta: error.meta,
        clientVersion: error.clientVersion,
      });

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

    return {
      success: false,
      error: "Error al crear el cliente completo",
    };
  }
}

export async function actualizarClienteCompleto(
  clienteId: string,
  input: CreateClienteCompletoFormData,
): Promise<ActionResult<{ id: string }>> {
  console.log("🔵 [actualizarClienteCompleto] Inicio - Cliente ID:", clienteId);

  try {
    console.log("🔵 [actualizarClienteCompleto] Validando datos con Zod...");
    const validated = createClienteCompletoSchema.parse(input);
    console.log("✅ [actualizarClienteCompleto] Validación exitosa");

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      console.error("❌ [actualizarClienteCompleto] Cliente no encontrado");
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    if (validated.cliente.regionId !== clienteExiste.regionId) {
      console.log(
        "🔵 [actualizarClienteCompleto] Verificando nueva región:",
        validated.cliente.regionId,
      );
      const regionExiste = await db.region.findUnique({
        where: { id: validated.cliente.regionId },
      });

      if (!regionExiste) {
        console.error("❌ [actualizarClienteCompleto] Región no encontrada");
        return {
          success: false,
          error: "Región no encontrada",
        };
      }
    }

    console.log("🔵 [actualizarClienteCompleto] Iniciando transacción...");
    await db.$transaction(
      async (tx) => {
        console.log("🔵 [Transaction] Actualizando cliente base...");
        await tx.cliente.update({
          where: { id: clienteId },
          data: validated.cliente,
        });
        console.log("✅ [Transaction] Cliente actualizado");

        if (
          validated.datosPersonales &&
          Object.keys(validated.datosPersonales).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosPersonales...");
          await tx.clienteDatosPersonales.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosPersonales,
            },
            update: validated.datosPersonales,
          });
        }

        if (
          validated.datosLaborales &&
          Object.keys(validated.datosLaborales).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosLaborales...");
          await tx.clienteDatosLaborales.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosLaborales,
            },
            update: validated.datosLaborales,
          });
        }

        if (
          validated.datosAcademicos &&
          Object.keys(validated.datosAcademicos).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosAcademicos...");
          await tx.clienteDatosAcademicos.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosAcademicos,
            },
            update: validated.datosAcademicos,
          });
        }

        if (
          validated.datosMatrimoniales &&
          Object.keys(validated.datosMatrimoniales).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosMatrimoniales...");
          await tx.clienteDatosMatrimoniales.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosMatrimoniales,
            },
            update: validated.datosMatrimoniales,
          });
        }

        if (
          validated.datosPatrocinador &&
          Object.keys(validated.datosPatrocinador).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosPatrocinador...");
          await tx.clienteDatosPatrocinador.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosPatrocinador,
            },
            update: validated.datosPatrocinador,
          });
        }

        if (
          validated.datosViaje &&
          Object.keys(validated.datosViaje).length > 0
        ) {
          console.log("🔵 [Transaction] Actualizando datosViaje...");
          await tx.clienteDatosViaje.upsert({
            where: { clienteId },
            create: {
              clienteId,
              ...validated.datosViaje,
            },
            update: validated.datosViaje,
          });
        }

        console.log("✅ [Transaction] Todas las actualizaciones completadas");
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    console.log(
      "✅ [actualizarClienteCompleto] Cliente actualizado exitosamente",
    );

    return {
      success: true,
      data: { id: clienteId },
    };
  } catch (error) {
    console.error("❌ [actualizarClienteCompleto] ERROR CAPTURADO:", {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("❌ [actualizarClienteCompleto] Error Prisma:", {
        code: error.code,
        meta: error.meta,
      });

      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("numeroCi")) {
          return {
            success: false,
            error: "Ya existe otro cliente con este número de CI",
          };
        }
        if (target.includes("numeroPasaporte")) {
          return {
            success: false,
            error: "Ya existe otro cliente con este número de pasaporte",
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

    return {
      success: false,
      error: "Error al actualizar el cliente",
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

export async function toggleClientesActivoEnLote(
  clienteIds: string[],
  nuevoEstado: boolean,
): Promise<ActionResult<{ actualizados: number }>> {
  console.log("🔵 [toggleClientesActivoEnLote] Inicio:", {
    clienteIds,
    nuevoEstado,
    total: clienteIds.length,
  });

  try {
    if (clienteIds.length === 0) {
      return {
        success: false,
        error: "No se seleccionaron clientes",
      };
    }

    const result = await db.cliente.updateMany({
      where: {
        id: {
          in: clienteIds,
        },
      },
      data: {
        activo: nuevoEstado,
      },
    });

    console.log(
      "✅ [toggleClientesActivoEnLote] Clientes actualizados:",
      result.count,
    );

    return {
      success: true,
      data: { actualizados: result.count },
    };
  } catch (error) {
    console.error("❌ [toggleClientesActivoEnLote] Error:", error);
    return {
      success: false,
      error: "Error al actualizar clientes en lote",
    };
  }
}

/**
 * Elimina múltiples clientes en lote (soft delete)
 */
export async function eliminarClientesEnLote(
  clienteIds: string[],
): Promise<ActionResult<{ eliminados: number }>> {
  console.log("🔵 [eliminarClientesEnLote] Inicio:", {
    clienteIds,
    total: clienteIds.length,
  });

  try {
    if (clienteIds.length === 0) {
      return {
        success: false,
        error: "No se seleccionaron clientes",
      };
    }

    const result = await db.cliente.updateMany({
      where: {
        id: {
          in: clienteIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    console.log(
      "✅ [eliminarClientesEnLote] Clientes eliminados:",
      result.count,
    );

    return {
      success: true,
      data: { eliminados: result.count },
    };
  } catch (error) {
    console.error("❌ [eliminarClientesEnLote] Error:", error);
    return {
      success: false,
      error: "Error al eliminar clientes en lote",
    };
  }
}
