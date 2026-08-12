"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NexusResponse } from "@/types/nexus";

// Read-only API: GET /api/nexus/cliente/[clienteId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  const { clienteId } = await params;

  // Fetch cliente base
  const cliente = await db.cliente.findUnique({
    where: { id: clienteId },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      tipoCliente: true,
      datosViaje: true,
    },
  });

  if (!cliente) {
    return NextResponse.json({ error: "Cliente not found" }, { status: 404 });
  }

  // Fetch tramites relacionados (no eliminado)
  const tramites = await db.tramite.findMany({
    where: { clienteId, deletedAt: null },
    include: {
      estadoActual: { select: { id: true, nombre: true } },
      usuarioAsignado: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Provisional: seleccionar tramite por updatedAt DESC (heurística)
  const tramiteSeleccionado = tramites.length > 0 ? tramites[0] : null;

  // cliente servicios
  const servicios = await db.clienteServicio.findMany({
    where: { clienteId, deletedAt: null },
    include: { estadoPago: { select: { id: true, nombre: true } } },
  });

  // Citas: próximas
  const now = new Date();
  const citas = await db.cita.findMany({
    where: { fechaHora: { gt: now }, deletedAt: null, tramiteId: { not: null } },
    include: { tipoCita: { select: { id: true, nombre: true, codigo: true } } },
    orderBy: { fechaHora: "asc" },
  });

  // identificar proxima entrevista y simulacro usando codigo (si existe)
  let proximaEntrevista = null;
  let simulacro = null;

  for (const c of citas) {
    const codigo = c.tipoCita?.codigo ?? c.tipoCita?.nombre ?? null;
    if (!proximaEntrevista && codigo && /ENTREVISTA/i.test(codigo)) {
      proximaEntrevista = c;
    }
    if (!simulacro && codigo && /(SIMULACRO|CAPACITACION)/i.test(codigo)) {
      simulacro = c;
    }
  }

  // Historial Tramite
  let historial = [];
  if (tramiteSeleccionado) {
    historial = await db.tramiteHistorial.findMany({
      where: { tramiteId: tramiteSeleccionado.id },
      include: { usuario: { select: { id: true, name: true } }, estado: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  const response: NexusResponse = {
    meta: {
      clienteId,
      generadoEn: new Date().toISOString(),
      versionNexus: "1.0",
    },
    cliente: {
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`,
      tipoCliente: cliente.tipoCliente,
    },
    asesor: {
      id: tramiteSeleccionado?.usuarioAsignado?.id ?? null,
      nombre: tramiteSeleccionado?.usuarioAsignado?.name ?? null,
    },
    tramite: {
      id: tramiteSeleccionado?.id ?? null,
      estado: tramiteSeleccionado?.estadoActual?.nombre ?? null,
      codigoConfirmacionDs160: tramiteSeleccionado?.codigoConfirmacionDs160 ?? null,
      estadoDs160: null,
      estadoDs160_provisional: false,
    },
    viaje: {
      motivo: cliente.datosViaje?.motivo ?? null,
      destino: cliente.datosViaje?.lugar ?? null,
      fechaTentativa: cliente.datosViaje?.fechaTentativa?.toISOString() ?? null,
      tiempoEstadia: cliente.datosViaje?.tiempoEstadia ?? null,
    },
    score: {
      total: null,
      motores: {
        ARRAIGO: null,
        CREDIBILIDAD_COHERENCIA: null,
        MOTIVO_VIAJE: null,
        PERFIL_LABORAL_ECONOMICO: null,
        ENTORNO_FAMILIAR_RIESGO_MIGRATORIO: null,
        HISTORIAL_MIGRATORIO: null,
      },
    },
    citas: {
      proximaEntrevista: proximaEntrevista
        ? {
            id: proximaEntrevista.id,
            fechaHora: proximaEntrevista.fechaHora.toISOString(),
            tipo: proximaEntrevista.tipoCita?.nombre ?? null,
            lugar: proximaEntrevista.lugar ?? null,
            estado: proximaEntrevista.estado ?? null,
          }
        : null,
      simulacro: simulacro
        ? {
            id: simulacro.id,
            fechaHora: simulacro.fechaHora.toISOString(),
            tipo: simulacro.tipoCita?.nombre ?? null,
            lugar: simulacro.lugar ?? null,
            estado: simulacro.estado ?? null,
          }
        : null,
    },
    pago: {
      services: servicios.map((s) => ({
        id: s.id,
        servicioId: s.servicioId,
        precioAcordado: s.precioAcordado.toString(),
        descuentoAplicado: s.descuentoAplicado?.toString() ?? null,
        precioFinal: s.precioFinal.toString(),
        estadoPago: s.estadoPago?.nombre ?? null,
      })),
      aggregatedEstado: servicios.length === 1 ? servicios[0].estadoPago?.nombre ?? null : null,
      aggregatedNota: servicios.length > 1 ? "MULTIPLES_SERVICIOS_NO_AGREGADOS" : null,
    },
    actividadPendiente: null,
    documentos: [],
    historial: historial.map((h) => ({
      id: h.id,
      fechaHora: h.createdAt.toISOString(),
      usuario: h.usuario ? { id: h.usuario.id, nombre: h.usuario.name } : null,
      estado: h.estado?.nombre ?? null,
      observacion: h.observacion ?? null,
    })),
  };

  return NextResponse.json(response);
}
