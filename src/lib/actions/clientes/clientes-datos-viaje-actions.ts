// src/lib/actions/clientes/clientes-datos-viaje-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteDatosViaje } from "@/types/cliente-types";
import {
  type CreateClienteDatosViajeFormData,
  createClienteDatosViajeSchema,
  type UpdateClienteDatosViajeFormData,
  updateClienteDatosViajeSchema,
} from "@/validations/cliente-validations";

/**
 * Obtiene los datos de viaje de un cliente
 */
export async function obtenerDatosViajePorClienteId(
  clienteId: string,
): Promise<ActionResult<ClienteDatosViaje>> {
  try {
    const datos = await db.clienteDatosViaje.findUnique({
      where: { clienteId },
    });

    if (!datos) {
      return {
        success: false,
        error: "Datos de viaje no encontrados",
      };
    }

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al obtener datos de viaje:", error);
    return {
      success: false,
      error: "Error al obtener los datos de viaje",
    };
  }
}

/**
 * Crea los datos de viaje para un cliente
 */
export async function crearDatosViaje(
  clienteId: string,
  input: CreateClienteDatosViajeFormData,
): Promise<ActionResult<ClienteDatosViaje>> {
  try {
    const validated = createClienteDatosViajeSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const datosExisten = await db.clienteDatosViaje.findUnique({
      where: { clienteId },
    });

    if (datosExisten) {
      return {
        success: false,
        error: "Los datos de viaje ya existen para este cliente",
      };
    }

    const datos = await db.clienteDatosViaje.create({
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
    console.error("Error al crear datos de viaje:", error);
    return {
      success: false,
      error: "Error al crear los datos de viaje",
    };
  }
}

/**
 * Actualiza los datos de viaje de un cliente
 */
export async function actualizarDatosViaje(
  clienteId: string,
  input: UpdateClienteDatosViajeFormData,
): Promise<ActionResult<ClienteDatosViaje>> {
  try {
    const validated = updateClienteDatosViajeSchema.parse(input);

    const datosExisten = await db.clienteDatosViaje.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos de viaje no encontrados",
      };
    }

    const datos = await db.clienteDatosViaje.update({
      where: { clienteId },
      data: validated,
    });

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al actualizar datos de viaje:", error);
    return {
      success: false,
      error: "Error al actualizar los datos de viaje",
    };
  }
}

/**
 * Elimina los datos de viaje de un cliente
 */
export async function eliminarDatosViaje(
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const datosExisten = await db.clienteDatosViaje.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos de viaje no encontrados",
      };
    }

    await db.clienteDatosViaje.delete({
      where: { clienteId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar datos de viaje:", error);
    return {
      success: false,
      error: "Error al eliminar los datos de viaje",
    };
  }
}
