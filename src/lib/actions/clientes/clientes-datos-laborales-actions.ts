// src/lib/actions/clientes/clientes-datos-laborales-actions.ts

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";
import type { ClienteDatosLaborales } from "@/types/cliente-types";
import {
  type CreateClienteDatosLaboralesFormData,
  createClienteDatosLaboralesSchema,
  type UpdateClienteDatosLaboralesFormData,
  updateClienteDatosLaboralesSchema,
} from "@/validations/cliente-validations";

export async function obtenerDatosLaboralesPorClienteId(
  clienteId: string,
): Promise<ActionResult<ClienteDatosLaborales>> {
  try {
    const datos = await db.clienteDatosLaborales.findUnique({
      where: { clienteId },
    });

    if (!datos) {
      return {
        success: false,
        error: "Datos laborales no encontrados",
      };
    }

    const datosFormateados: ClienteDatosLaborales = {
      ...datos,
      percepcionSalarial: datos.percepcionSalarial
        ? Number(datos.percepcionSalarial)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al obtener datos laborales:", error);
    return {
      success: false,
      error: "Error al obtener los datos laborales",
    };
  }
}

export async function crearDatosLaborales(
  clienteId: string,
  input: CreateClienteDatosLaboralesFormData,
): Promise<ActionResult<ClienteDatosLaborales>> {
  try {
    const validated = createClienteDatosLaboralesSchema.parse(input);

    const clienteExiste = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!clienteExiste) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    const datosExisten = await db.clienteDatosLaborales.findUnique({
      where: { clienteId },
    });

    if (datosExisten) {
      return {
        success: false,
        error: "Los datos laborales ya existen para este cliente",
      };
    }

    const datos = await db.clienteDatosLaborales.create({
      data: {
        clienteId,
        ...validated,
      },
    });

    const datosFormateados: ClienteDatosLaborales = {
      ...datos,
      percepcionSalarial: datos.percepcionSalarial
        ? Number(datos.percepcionSalarial)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al crear datos laborales:", error);
    return {
      success: false,
      error: "Error al crear los datos laborales",
    };
  }
}

export async function actualizarDatosLaborales(
  clienteId: string,
  input: UpdateClienteDatosLaboralesFormData,
): Promise<ActionResult<ClienteDatosLaborales>> {
  try {
    const validated = updateClienteDatosLaboralesSchema.parse(input);

    const datosExisten = await db.clienteDatosLaborales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos laborales no encontrados",
      };
    }

    const datos = await db.clienteDatosLaborales.update({
      where: { clienteId },
      data: validated,
    });

    const datosFormateados: ClienteDatosLaborales = {
      ...datos,
      percepcionSalarial: datos.percepcionSalarial
        ? Number(datos.percepcionSalarial)
        : null,
    };

    return {
      success: true,
      data: datosFormateados,
    };
  } catch (error) {
    console.error("Error al actualizar datos laborales:", error);
    return {
      success: false,
      error: "Error al actualizar los datos laborales",
    };
  }
}

export async function eliminarDatosLaborales(
  clienteId: string,
): Promise<ActionResult<void>> {
  try {
    const datosExisten = await db.clienteDatosLaborales.findUnique({
      where: { clienteId },
    });

    if (!datosExisten) {
      return {
        success: false,
        error: "Datos laborales no encontrados",
      };
    }

    await db.clienteDatosLaborales.delete({
      where: { clienteId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar datos laborales:", error);
    return {
      success: false,
      error: "Error al eliminar los datos laborales",
    };
  }
}
