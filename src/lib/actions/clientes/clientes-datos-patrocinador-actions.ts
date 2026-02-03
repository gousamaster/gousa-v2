// src/lib/actions/clientes/clientes-datos-patrocinador-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteDatosPatrocinador } from "@/types/cliente-types";
import {
  type CreateClienteDatosPatrocinadorFormData,
  createClienteDatosPatrocinadorSchema,
  type UpdateClienteDatosPatrocinadorFormData,
  updateClienteDatosPatrocinadorSchema,
} from "@/validations/cliente-validations";

export async function obtenerDatosPatrocinadorPorClienteId(
  clienteId: string,
): Promise<ActionResult<ClienteDatosPatrocinador>> {
  try {
    const datos = await db.clienteDatosPatrocinador.findUnique({
      where: { clienteId },
    });

    if (!datos) {
      return {
        success: false,
        error: "Datos del patrocinador no encontrados",
      };
    }

    const datosFormateados: ClienteDatosPatrocinador = {
      ...datos,
      percepcionSalarialPatrocinador: datos.percepcionSalarialPatrocinador
        ? Number(datos.percepcionSalarialPatrocinador)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener datos del patrocinador:", error);
    return {
      success: false,
      error: "Error al obtener los datos del patrocinador",
    };
  }
}

export async function crearDatosPatrocinador(
  clienteId: string,
  input: CreateClienteDatosPatrocinadorFormData,
): Promise<ActionResult<ClienteDatosPatrocinador>> {
  try {
    const validated = createClienteDatosPatrocinadorSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const datosExisten = await db.clienteDatosPatrocinador.findUnique({
      where: { clienteId },
    });

    if (datosExisten) {
      return {
        success: false,
        error: "Los datos del patrocinador ya existen para este cliente",
      };
    }

    const datos = await db.clienteDatosPatrocinador.create({
      data: {
        clienteId,
        ...validated,
      },
    });

    const datosFormateados: ClienteDatosPatrocinador = {
      ...datos,
      percepcionSalarialPatrocinador: datos.percepcionSalarialPatrocinador
        ? Number(datos.percepcionSalarialPatrocinador)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al crear datos del patrocinador:", error);
    return {
      success: false,
      error: "Error al crear los datos del patrocinador",
    };
  }
}

export async function actualizarDatosPatrocinador(
  clienteId: string,
  input: UpdateClienteDatosPatrocinadorFormData,
): Promise<ActionResult<ClienteDatosPatrocinador>> {
  try {
    const validated = updateClienteDatosPatrocinadorSchema.parse(input);

    const datosExisten = await db.clienteDatosPatrocinador.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos del patrocinador no encontrados",
      };
    }

    const datos = await db.clienteDatosPatrocinador.update({
      where: { clienteId },
      data: validated,
    });

    const datosFormateados: ClienteDatosPatrocinador = {
      ...datos,
      percepcionSalarialPatrocinador: datos.percepcionSalarialPatrocinador
        ? Number(datos.percepcionSalarialPatrocinador)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al actualizar datos del patrocinador:", error);
    return {
      success: false,
      error: "Error al actualizar los datos del patrocinador",
    };
  }
}

export async function eliminarDatosPatrocinador(
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const datosExisten = await db.clienteDatosPatrocinador.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos del patrocinador no encontrados",
      };
    }

    await db.clienteDatosPatrocinador.delete({
      where: { clienteId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar datos del patrocinador:", error);
    return {
      success: false,
      error: "Error al eliminar los datos del patrocinador",
    };
  }
}
