// src/lib/actions/clientes/clientes-datos-personales-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteDatosPersonales } from "@/types/cliente-types";
import {
  type CreateClienteDatosPersonalesFormData,
  createClienteDatosPersonalesSchema,
  type UpdateClienteDatosPersonalesFormData,
  updateClienteDatosPersonalesSchema,
} from "@/validations/cliente-validations";

export async function obtenerDatosPersonalesPorClienteId(
  clienteId: string,
): Promise<ActionResult<ClienteDatosPersonales>> {
  try {
    const datos = await db.clienteDatosPersonales.findUnique({
      where: { clienteId },
    });

    if (!datos) {
      return {
        success: false,
        error: "Datos personales no encontrados",
      };
    }

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al obtener datos personales:", error);
    return {
      success: false,
      error: "Error al obtener los datos personales",
    };
  }
}

export async function crearDatosPersonales(
  clienteId: string,
  input: CreateClienteDatosPersonalesFormData,
): Promise<ActionResult<ClienteDatosPersonales>> {
  try {
    const validated = createClienteDatosPersonalesSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const datosExisten = await db.clienteDatosPersonales.findUnique({
      where: { clienteId },
    });

    if (datosExisten) {
      return {
        success: false,
        error: "Los datos personales ya existen para este cliente",
      };
    }

    const datos = await db.clienteDatosPersonales.create({
      data: {
        clienteId,
        ...validated,
      },
    });

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al crear datos personales:", error);
    return {
      success: false,
      error: "Error al crear los datos personales",
    };
  }
}

export async function actualizarDatosPersonales(
  clienteId: string,
  input: UpdateClienteDatosPersonalesFormData,
): Promise<ActionResult<ClienteDatosPersonales>> {
  try {
    const validated = updateClienteDatosPersonalesSchema.parse(input);

    const datosExisten = await db.clienteDatosPersonales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos personales no encontrados",
      };
    }

    const datos = await db.clienteDatosPersonales.update({
      where: { clienteId },
      data: validated,
    });

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al actualizar datos personales:", error);
    return {
      success: false,
      error: "Error al actualizar los datos personales",
    };
  }
}

export async function eliminarDatosPersonales(
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const datosExisten = await db.clienteDatosPersonales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos personales no encontrados",
      };
    }

    await db.clienteDatosPersonales.delete({
      where: { clienteId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar datos personales:", error);
    return {
      success: false,
      error: "Error al eliminar los datos personales",
    };
  }
}
