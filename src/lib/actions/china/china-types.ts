export const ETAPAS_CHINA = [
  "RECOLECCION_DOCUMENTOS",
  "EVALUACION",
  "TOMA_DATOS",
  "LLENADO_FORMULARIO",
  "SUBIR_DOCUMENTOS",
  "PRESENTACION_EMBAJADA",
  "RECOJO_DOCUMENTO",
  "FINALIZADO",
] as const;

export type EtapaChina = (typeof ETAPAS_CHINA)[number];
export type SedeChina = "LA_PAZ" | "SANTA_CRUZ";

export type ChinaOperativo = {
  tramiteId: string;
  etapa: EtapaChina;
  hijos: string[];
  formularioIniciado: boolean;
  documentosSubidos: boolean;
  sedeEmbajada: SedeChina | null;
  clienteNotificado: boolean;
  fechaNotificacion: Date | null;
  fechaPresentacion: string | null;
  guiaRecojoRecibida: boolean;
  guiaRecojoReferencia: string | null;
  guiaRecojoUrl: string | null;
  fechaRecojo: string | null;
  pasaporteRecogido: boolean;
  fechaPasaporteRecogido: string | null;
  observaciones: string | null;
};

export type ChinaTimeItem = {
  tramiteId: string;
  clienteId: string;
  cliente: string;
  servicio: string;
  sede: SedeChina | null;
  estado: "NOTIFICADO" | "POR_RECOGER" | "RECOJO_VENCIDO";
  fechaNotificacion: Date | null;
  fechaRecojo: string | null;
};
