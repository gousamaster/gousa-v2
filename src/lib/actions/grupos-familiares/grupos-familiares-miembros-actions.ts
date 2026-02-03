// src/lib/actions/grupos-familiares/grupos-familiares-miembros-actions.ts

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { GrupoFamiliarMiembroDetalle } from "@/types/grupo-familiar-types";
import {
  type AddMiembroGrupoFamiliarFormData,
  addMiembroGrupoFamiliarSchema,
  type UpdateMiembroGrupoFamiliarFormData,
  updateMiembroGrupoFamiliarSchema,
} from "@/validations/grupo-familiar-validations";

export async function obtenerMiembrosGrupoFamiliar(
  grupoFamiliarId: string,
): Promise<ActionResult<GrupoFamiliarMiembroDetalle[]>> {
  try {
    const miembros = await db.grupoFamiliarMiembro.findMany({
      where: { grupoFamiliarId },
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
    });

    const miembrosFormateados = miembros.map((miembro) => ({
      ...miembro,
      cliente: {
        ...miembro.cliente,
        nombreCompleto: `${miembro.cliente.nombres} ${miembro.cliente.apellidos}`,
      },
    }));

    return {
      success: true,
      data: miembrosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener miembros del grupo familiar:", error);
    return {
      success: false,
      error: "Error al obtener los miembros",
    };
  }
}

export async function agregarMiembroAGrupoFamiliar(
  input: AddMiembroGrupoFamiliarFormData,
): Promise<ActionResult<GrupoFamiliarMiembroDetalle>> {
  try {
    const validated = addMiembroGrupoFamiliarSchema.parse(input);

    const grupoExiste = await db.grupoFamiliar.findUnique({
      where: { id: validated.grupoFamiliarId },
    });

    if (!grupoExiste) {
      return {
        success: false,
        error: "Grupo familiar no encontrado",
      };
    }

    const clienteExiste = await db.cliente.findUnique({
      where: { id: validated.clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const parentescoExiste = await db.catalogoParentesco.findUnique({
      where: { id: validated.parentescoId },
    });

    if (!parentescoExiste) {
      return {
        success: false,
        error: "Parentesco no encontrado",
      };
    }

    const miembroExiste = await db.grupoFamiliarMiembro.findFirst({
      where: {
        grupoFamiliarId: validated.grupoFamiliarId,
        clienteId: validated.clienteId,
      },
    });

    if (miembroExiste) {
      return {
        success: false,
        error: "El cliente ya pertenece a este grupo familiar",
      };
    }

    if (validated.esTitular) {
      const titularActual = await db.grupoFamiliarMiembro.findFirst({
        where: {
          grupoFamiliarId: validated.grupoFamiliarId,
          esTitular: true,
        },
      });

      if (titularActual) {
        return {
          success: false,
          error: "El grupo familiar ya tiene un titular asignado",
        };
      }
    }

    const miembro = await db.grupoFamiliarMiembro.create({
      data: validated,
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
    });

    const miembroFormateado: GrupoFamiliarMiembroDetalle = {
      ...miembro,
      cliente: {
        ...miembro.cliente,
        nombreCompleto: `${miembro.cliente.nombres} ${miembro.cliente.apellidos}`,
      },
    };

    return {
      success: true,
      data: miembroFormateado,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "El cliente ya pertenece a este grupo familiar",
        };
      }
    }

    console.error("Error al agregar miembro al grupo familiar:", error);
    return {
      success: false,
      error: "Error al agregar el miembro",
    };
  }
}

export async function actualizarMiembroGrupoFamiliar(
  miembroId: string,
  input: UpdateMiembroGrupoFamiliarFormData,
): Promise<ActionResult<GrupoFamiliarMiembroDetalle>> {
  try {
    const validated = updateMiembroGrupoFamiliarSchema.parse(input);

    const miembroExiste = await db.grupoFamiliarMiembro.findUnique({
      where: { id: miembroId },
    });

    if (!miembroExiste) {
      return {
        success: false,
        error: "Miembro no encontrado",
      };
    }

    if (validated.parentescoId) {
      const parentescoExiste = await db.catalogoParentesco.findUnique({
        where: { id: validated.parentescoId },
      });

      if (!parentescoExiste) {
        return {
          success: false,
          error: "Parentesco no encontrado",
        };
      }
    }

    if (validated.esTitular === true) {
      const titularActual = await db.grupoFamiliarMiembro.findFirst({
        where: {
          grupoFamiliarId: miembroExiste.grupoFamiliarId,
          esTitular: true,
          id: { not: miembroId },
        },
      });

      if (titularActual) {
        return {
          success: false,
          error: "El grupo familiar ya tiene un titular asignado",
        };
      }
    }

    const miembro = await db.grupoFamiliarMiembro.update({
      where: { id: miembroId },
      data: validated,
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
    });

    const miembroFormateado: GrupoFamiliarMiembroDetalle = {
      ...miembro,
      cliente: {
        ...miembro.cliente,
        nombreCompleto: `${miembro.cliente.nombres} ${miembro.cliente.apellidos}`,
      },
    };

    return {
      success: true,
      data: miembroFormateado,
    };
  } catch (error) {
    console.error("Error al actualizar miembro del grupo familiar:", error);
    return {
      success: false,
      error: "Error al actualizar el miembro",
    };
  }
}

export async function removerMiembroDeGrupoFamiliar(
  miembroId: string,
): Promise<ActionResult<void>> {
  try {
    const miembroExiste = await db.grupoFamiliarMiembro.findUnique({
      where: { id: miembroId },
    });

    if (!miembroExiste) {
      return {
        success: false,
        error: "Miembro no encontrado",
      };
    }

    if (miembroExiste.esTitular) {
      const totalMiembros = await db.grupoFamiliarMiembro.count({
        where: { grupoFamiliarId: miembroExiste.grupoFamiliarId },
      });

      if (totalMiembros > 1) {
        return {
          success: false,
          error:
            "No se puede remover al titular mientras haya otros miembros en el grupo",
        };
      }
    }

    await db.grupoFamiliarMiembro.delete({
      where: { id: miembroId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al remover miembro del grupo familiar:", error);
    return {
      success: false,
      error: "Error al remover el miembro",
    };
  }
}

export async function establecerTitularGrupoFamiliar(
  grupoFamiliarId: string,
  miembroId: string,
): Promise<ActionResult<GrupoFamiliarMiembroDetalle>> {
  try {
    const miembroExiste = await db.grupoFamiliarMiembro.findUnique({
      where: { id: miembroId },
    });

    if (!miembroExiste) {
      return {
        success: false,
        error: "Miembro no encontrado",
      };
    }

    if (miembroExiste.grupoFamiliarId !== grupoFamiliarId) {
      return {
        success: false,
        error: "El miembro no pertenece a este grupo familiar",
      };
    }

    const resultado = await db.$transaction(async (tx) => {
      await tx.grupoFamiliarMiembro.updateMany({
        where: {
          grupoFamiliarId,
          esTitular: true,
        },
        data: {
          esTitular: false,
        },
      });

      const nuevoTitular = await tx.grupoFamiliarMiembro.update({
        where: { id: miembroId },
        data: { esTitular: true },
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
      });

      return nuevoTitular;
    });

    const miembroFormateado: GrupoFamiliarMiembroDetalle = {
      ...resultado,
      cliente: {
        ...resultado.cliente,
        nombreCompleto: `${resultado.cliente.nombres} ${resultado.cliente.apellidos}`,
      },
    };

    return {
      success: true,
      data: miembroFormateado,
    };
  } catch (error) {
    console.error("Error al establecer titular del grupo familiar:", error);
    return {
      success: false,
      error: "Error al establecer el titular",
    };
  }
}
