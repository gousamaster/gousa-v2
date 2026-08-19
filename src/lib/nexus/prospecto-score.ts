export const PROSPECTO_SCORE_VERSION = "NEXUS-PROSPECTO-0.1";

export type ScoreOption = {
  value: string;
  label: string;
  factor: number;
};

export type ScoreQuestion = {
  id: string;
  titulo: string;
  ayuda: string;
  peso: number;
  opciones: ScoreOption[];
};

export const PROSPECTO_SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    id: "motivo_viaje",
    titulo: "Claridad del motivo de viaje",
    ayuda: "Evalúa si el propósito del viaje está claro, es coherente y puede explicarse de forma sencilla.",
    peso: 10,
    opciones: [
      { value: "claro", label: "Claro, coherente y bien definido", factor: 1 },
      { value: "general", label: "Existe una idea general, pero necesita precisión", factor: 0.5 },
      { value: "incierto", label: "No está claro todavía", factor: 0 },
    ],
  },
  {
    id: "estabilidad_actividad",
    titulo: "Estabilidad laboral, empresarial o académica",
    ayuda: "Considera continuidad y estabilidad en trabajo, negocio o estudios, sin evaluar profesión ni nivel educativo.",
    peso: 15,
    opciones: [
      { value: "alta", label: "Actividad estable y verificable por más de 12 meses", factor: 1 },
      { value: "media", label: "Actividad verificable entre 3 y 12 meses", factor: 0.65 },
      { value: "baja", label: "Actividad reciente o parcialmente verificable", factor: 0.35 },
      { value: "sin_datos", label: "Sin actividad verificable actualmente", factor: 0 },
    ],
  },
  {
    id: "capacidad_economica",
    titulo: "Capacidad económica para el viaje",
    ayuda: "Evalúa si existen recursos propios o apoyo documentado suficiente para cubrir el viaje declarado.",
    peso: 15,
    opciones: [
      { value: "suficiente", label: "Recursos suficientes y verificables", factor: 1 },
      { value: "apoyo", label: "Apoyo de tercero o patrocinador claramente documentado", factor: 0.7 },
      { value: "limitada", label: "Recursos limitados o documentación incompleta", factor: 0.35 },
      { value: "sin_respaldo", label: "Sin respaldo económico identificable", factor: 0 },
    ],
  },
  {
    id: "arraigo",
    titulo: "Vínculos y responsabilidades de retorno",
    ayuda: "Considera trabajo, negocio, estudios, bienes, responsabilidades u otros compromisos objetivos en el país de residencia.",
    peso: 15,
    opciones: [
      { value: "fuerte", label: "Múltiples vínculos claros y verificables", factor: 1 },
      { value: "moderado", label: "Al menos un vínculo importante y verificable", factor: 0.65 },
      { value: "debil", label: "Vínculos limitados o poco documentados", factor: 0.3 },
      { value: "sin_datos", label: "No se identifican vínculos verificables", factor: 0 },
    ],
  },
  {
    id: "historial_viajes",
    titulo: "Historial de viajes y cumplimiento",
    ayuda: "Valora antecedentes de viajes y cumplimiento de tiempos autorizados. No tener viajes previos no se considera una falta.",
    peso: 10,
    opciones: [
      { value: "cumplido", label: "Tiene viajes previos y cumplió las condiciones", factor: 1 },
      { value: "sin_viajes", label: "No tiene viajes internacionales previos", factor: 0.6 },
      { value: "dudas", label: "Hay información incompleta o dudas por revisar", factor: 0.3 },
      { value: "incumplimiento", label: "Existe un incumplimiento migratorio relevante", factor: 0 },
    ],
  },
  {
    id: "antecedentes_migratorios",
    titulo: "Antecedentes migratorios hacia Estados Unidos",
    ayuda: "Evalúa únicamente la claridad y resolución de antecedentes migratorios, no penaliza automáticamente un rechazo previo.",
    peso: 15,
    opciones: [
      { value: "sin_incidentes", label: "Sin incidentes migratorios conocidos", factor: 1 },
      { value: "rechazo_explicado", label: "Tuvo rechazo previo, pero la situación está clara y documentada", factor: 0.65 },
      { value: "pendiente_revision", label: "Hay antecedentes que requieren revisión adicional", factor: 0.3 },
      { value: "incumplimiento_grave", label: "Existe un antecedente migratorio grave no resuelto", factor: 0 },
    ],
  },
  {
    id: "consistencia_documental",
    titulo: "Consistencia de la información y documentos",
    ayuda: "Compara la historia declarada con los documentos disponibles para detectar vacíos o contradicciones.",
    peso: 10,
    opciones: [
      { value: "consistente", label: "Información consistente y respaldada", factor: 1 },
      { value: "ajustes", label: "Hay vacíos menores que pueden corregirse", factor: 0.6 },
      { value: "contradicciones", label: "Existen contradicciones relevantes por resolver", factor: 0.15 },
    ],
  },
  {
    id: "preparacion_entrevista",
    titulo: "Preparación para explicar su caso",
    ayuda: "Evalúa si el prospecto puede responder de forma clara, breve y consistente sobre su viaje y situación personal.",
    peso: 10,
    opciones: [
      { value: "preparado", label: "Explica su caso con claridad y consistencia", factor: 1 },
      { value: "requiere_practica", label: "Necesita práctica o estructura adicional", factor: 0.6 },
      { value: "inconsistente", label: "Presenta respuestas confusas o contradictorias", factor: 0.15 },
    ],
  },
];

export type ProspectoScoreAnswers = Record<string, string>;

export function calcularProspectoScore(respuestas: ProspectoScoreAnswers) {
  let score = 0;

  for (const pregunta of PROSPECTO_SCORE_QUESTIONS) {
    const respuesta = respuestas[pregunta.id];
    const opcion = pregunta.opciones.find((item) => item.value === respuesta);

    if (!opcion) {
      throw new Error(`Respuesta inválida para ${pregunta.id}`);
    }

    score += pregunta.peso * opcion.factor;
  }

  const resultado = Math.round(score);

  return {
    score: Math.max(0, Math.min(100, resultado)),
    clasificacion: clasificarProspectoScore(resultado),
  };
}

export function clasificarProspectoScore(score: number) {
  if (score >= 80) return "ALTO";
  if (score >= 60) return "MEDIO_ALTO";
  if (score >= 40) return "MEDIO";
  return "BAJO";
}

export function validarRespuestasProspectoScore(respuestas: ProspectoScoreAnswers) {
  return PROSPECTO_SCORE_QUESTIONS.every((pregunta) => {
    const valor = respuestas[pregunta.id];
    return pregunta.opciones.some((opcion) => opcion.value === valor);
  });
}
