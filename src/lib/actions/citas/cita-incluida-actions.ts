"use server";

import { db } from "@/lib/db";
import { crearCita } from "@/lib/actions/citas/citas-actions";
import type { ActionResult } from "@/types/action-result-types";

export type CrearCitaIncluidaInput = {
  tramiteId?: string | null;
  grupoFamiliarId?: string | null;
  tipoCitaId: string;
  fechaHora: string;
  lugar?: string | null;
  notas?: string | null;
  participanteTramiteIds?: string[];
};

export async function crearCitaIncluida(
  input: CrearCitaIncluidaInput,
  creadaPorId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const tramiteReferencia = input.tramiteId ?? input.participanteTramiteIds?.[0] ?? null;

    let estadoPagoId: string | null = null;
    if (tramiteReferencia) {
      const t = await db.tramite.findUnique({
        where: { id: tramiteReferencia },
        select: { clienteServicio: { select: { estadoPagoId: true } } },
      });
      estadoPagoId = t?.clienteServicio?.estadoPagoId ?? null;
    }

    // Compatibilidad técnica con la tabla cita: el estado se hereda del servicio,
    // pero la cita/simulacro incluido no genera un segundo cobro.
    if (!estadoPagoId) {
      const fallback = await db.catalogoEstadoPago.findFirst({
        where: { activo: true },
        orderBy: { orden: "asc" },
        select: { id: true },
      });
      estadoPagoId = fallback?.id ?? null;
    }

    if (!estadoPagoId) return { success: false, error: "No existe un estado operativo para registrar la cita" };

    return await crearCita(
      {
        ...input,
        precioAcordado: 0,
        descuentoAplicado: null,
        precioFinal: 0,
        estadoPagoId,
      },
      creadaPorId,
    );
  } catch (error) {
    console.error("crearCitaIncluida", error);
    return { success: false, error: "No se pudo programar la cita incluida en el servicio" };
  }
}
