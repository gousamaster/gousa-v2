// src/lib/actions/clientes/clientes-datos-matrimoniales-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteDatosMatrimoniales } from "@/types/cliente-types";
import {
  type CreateClienteDatosMatrimonialesFormData,
  createClienteDatosMatrimonialesSchema,
  type UpdateClienteDatosMatrimonialesFormData,
  updateClienteDatosMatrimonialesSchema,
} from "@/validations/cliente-validations";

export async function obtenerDatosMatrimonialesPorClienteId(
  clienteId: string,
): Promise<ActionResult<ClienteDatosMatrimoniales>> {
  try {
    const datos = await db.clienteDatosMatrimoniales.findUnique({
      where: { clienteId },
    });

    if (!datos) {
      return {
        success: false,
        error: "Datos matrimoniales no encontrados",
      };
    }

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al obtener datos matrimoniales:", error);
    return {
      success: false,
      error: "Error al obtener los datos matrimoniales",
    };
  }
}

export async function crearDatosMatrimoniales(
  clienteId: string,
  input: CreateClienteDatosMatrimonialesFormData,
): Promise<ActionResult<ClienteDatosMatrimoniales>> {
  try {
    const validated = createClienteDatosMatrimonialesSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const datosExisten = await db.clienteDatosMatrimoniales.findUnique({
      where: { clienteId },
    });

    if (datosExisten) {
      return {
        success: false,
        error: "Los datos matrimoniales ya existen para este cliente",
      };
    }

    const datos = await db.clienteDatosMatrimoniales.create({
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
    console.error("Error al crear datos matrimoniales:", error);
    return {
      success: false,
      error: "Error al crear los datos matrimoniales",
    };
  }
}

export async function actualizarDatosMatrimoniales(
  clienteId: string,
  input: UpdateClienteDatosMatrimonialesFormData,
): Promise<ActionResult<ClienteDatosMatrimoniales>> {
  try {
    const validated = updateClienteDatosMatrimonialesSchema.parse(input);

    const datosExisten = await db.clienteDatosMatrimoniales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos matrimoniales no encontrados",
      };
    }

    const datos = await db.clienteDatosMatrimoniales.update({
      where: { clienteId },
      data: validated,
    });

    return {
      success: true,
      data: datos,
    };
  } catch (error) {
    console.error("Error al actualizar datos matrimoniales:", error);
    return {
      success: false,
      error: "Error al actualizar los datos matrimoniales",
    };
  }
}

export async function eliminarDatosMatrimoniales(
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const datosExisten = await db.clienteDatosMatrimoniales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos matrimoniales no encontrados",
      };
    }

    await db.clienteDatosMatrimoniales.delete({
      where: { clienteId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar datos matrimoniales:", error);
    return {
      success: false,
      error: "Error al eliminar los datos matrimoniales",
    };
  }
}
