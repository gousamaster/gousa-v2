// src/types/nexus.ts

export type NexusMotorKey =
  | "ARRAIGO"
  | "CREDIBILIDAD_COHERENCIA"
  | "MOTIVO_VIAJE"
  | "PERFIL_LABORAL_ECONOMICO"
  | "ENTORNO_FAMILIAR_RIESGO_MIGRATORIO"
  | "HISTORIAL_MIGRATORIO";

export interface MotorScore {
  key: NexusMotorKey;
  value: number | null; // por ahora null
  note?: string | null;
}

export interface NexusMeta {
  clienteId: string;
  generadoEn: string; // ISO timestamp
  versionNexus: "1.0";
}

export interface ClienteSummary {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string; // derivado
  tipoCliente: "ADULTO" | "INFANTE";
}

export interface AsesorSummary {
  id: string | null;
  nombre: string | null;
}

export interface TramiteSummary {
  id: string | null;
  estado: string | null;
  codigoConfirmacionDs160: string | null;
  estadoDs160: string | null; // DERIVADO o null (provisional)
  estadoDs160_provisional?: boolean;
}

export interface ViajeSummary {
  motivo: string | null;
  destino: string | null;
  fechaTentativa: string | null; // ISO or null
  tiempoEstadia: string | null;
}

export interface CitaSummary {
  id: string;
  fechaHora: string; // ISO
  tipo: string | null;
  lugar: string | null;
  estado: string | null;
}

export interface PagoServiceItem {
  id: string;
  servicioId: string;
  precioAcordado: string; // Decimal string
  descuentoAplicado: string | null;
  precioFinal: string; // Decimal string
  estadoPago: string | null;
}

export interface PagoSummary {
  services: PagoServiceItem[];
  aggregatedEstado: string | null;
  aggregatedNota?: string | null;
}

export interface ActividadPendiente {
  tipo: string | null;
  descripcion: string | null;
  fecha: string | null;
  prioridad: "LOW" | "MEDIUM" | "HIGH" | null;
}

export interface DocumentoItem {
  tipo:
    | "PASAPORTE"
    | "FOTO"
    | "VISA_ANTERIOR"
    | "CONFIRMACION_DS160"
    | "FORMULARIO_DS160"
    | "CARTA_INVITACION_SOPORTE"
    | "CONFIRMACION_CITA"
    | "SOPORTE_SIMULACRO";
  id: string;
  filename?: string | null;
  url?: string | null;
  uploadedById?: string | null;
  createdAt?: string | null;
  metadata?: any | null;
}

export interface HistorialItem {
  id: string;
  fechaHora: string; // ISO
  usuario: { id: string | null; nombre: string | null } | null;
  estado: string | null;
  observacion?: string | null;
}

export interface NexusResponse {
  meta: NexusMeta;
  cliente: ClienteSummary;
  asesor: AsesorSummary;
  tramite: TramiteSummary;
  viaje: ViajeSummary;
  score: {
    total: number | null;
    motores: Record<NexusMotorKey, number | null>;
  };
  citas: {
    proximaEntrevista: CitaSummary | null;
    simulacro: CitaSummary | null;
  };
  pago: PagoSummary;
  actividadPendiente: ActividadPendiente | null;
  documentos: DocumentoItem[];
  historial: HistorialItem[];
}
