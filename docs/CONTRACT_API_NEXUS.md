# CONTRACT_API_NEXUS

Endpoint:
- GET /api/nexus/cliente/[clienteId]
  - Response: 200 OK with body matching `NexusResponse` (JSON)

Tipos principales (resumen)
- NexusResponse
  - meta: { clienteId: string, generadoEn: string (ISO), versionNexus: "1.0" }
  - cliente: {
      id: string,
      nombres: string,
      apellidos: string,
      nombreCompleto: string,
      tipoCliente: "ADULTO" | "INFANTE"
    }
  - asesor: { id: string | null, nombre: string | null }
  - tramite: {
      id: string | null,
      estado: string | null,
      codigoConfirmacionDs160: string | null,
      estadoDs160: string | null
    }
  - viaje: {
      motivo: string | null,
      destino: string | null,
      fechaTentativa: string | null (ISO),
      tiempoEstadia: string | null
    }
  - score: {
      total: number | null,
      motores: Record<string, number | null>
    }
  - citas: {
      proximaEntrevista: { id: string; fechaHora: string; tipo: string | null; lugar: string | null; estado: string | null } | null,
      simulacro: { id: string; fechaHora: string; tipo: string | null; lugar: string | null; estado: string | null } | null
    }
  - pago: {
      services: Array<{ id: string; servicioId: string; precioAcordado: string; descuentoAplicado: string | null; precioFinal: string; estadoPago: string | null }>,
      aggregatedEstado: string | null,
      aggregatedNota?: string | null
    }
  - actividadPendiente: { tipo: string | null; descripcion: string | null; fecha: string | null; prioridad: "LOW" | "MEDIUM" | "HIGH" | null } | null
  - documentos: Array<any>
  - historial: Array<{ id: string; fechaHora: string; usuario: { id: string | null; nombre: string | null } | null; estado: string | null; observacion?: string | null }>

Caveats y reglas de uso (Fase 1)
- No inventar datos: la UI debe mostrar únicamente los campos reales devueltos por el endpoint.
- Valores nulos o ausentes deben representarse explícitamente (por ejemplo "—" o mensajes claros), no mediante eventos ficticios.
- Historial: usar `response.historial` tal como llega. Si `historial` está vacío, la UI debe mostrar: "No hay actividad registrada todavía."

Ejemplo de respuesta (resumida)
/* ejemplo abreviado */
{
  "meta": { "clienteId": "abc", "generadoEn": "2026-08-11T...", "versionNexus":"1.0" },
  "cliente": { "id":"abc", "nombres":"Juan", "apellidos":"Pérez", "nombreCompleto":"Juan Pérez", "tipoCliente":"ADULTO" },
  "asesor": { "id":"u1", "nombre":"Asesor Ej." },
  "tramite": { "id":"t1", "estado":"EN_PROCESO", "codigoConfirmacionDs160":"XYZ123" },
  "viaje": { "motivo":"Turismo", "destino":"EEUU", "fechaTentativa":"2026-09-01T00:00:00.000Z" },
  "score": { "total": null, "motores": { "ARRAIGO": null } },
  "citas": { "proximaEntrevista": null, "simulacro": null },
  "pago": { "services": [], "aggregatedEstado": null },
  "actividadPendiente": null,
  "documentos": [],
  "historial": []
}
