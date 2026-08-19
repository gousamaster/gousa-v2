export const PROSPECTO_SCORE_VERSION = "NEXUS-PROSPECTO-0.2";

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

export type ProspectoScoreAnswers = Record<string, string>;

export type ProspectoScoreInsight = {
  preguntaId: string;
  titulo: string;
  respuesta: string;
  aporte: number;
  peso: number;
};

export type ProspectoScoreAnalysis = {
  prioridadComercial: "ALTA" | "MEDIA" | "BAJA";
  fortalezas: ProspectoScoreInsight[];
  alertas: ProspectoScoreInsight[];
  acciones: string[];
};

/**
 * Score NEXUS interno para prospectos de visa temporal B1/B2.
 *
 * No intenta predecir una decisión consular. La ponderación prioriza señales
 * operativas alineadas con propósito temporal, intención de salida, vínculos
 * fuera de EE.UU., capacidad de cubrir el viaje, elegibilidad para la categoría
 * y consistencia de la información.
 *
 * No usa edad, sexo, raza, religión, discapacidad, estado civil u otras
 * características protegidas como criterios de puntuación.
 */
export const PROSPECTO_SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    id: "proposito_categoria",
    titulo: "Propósito del viaje y encaje con visa temporal",
    ayuda:
      "Evalúa si el motivo declarado es específico, temporal y compatible con una visita de negocios o turismo, sin asumir que eso garantiza elegibilidad.",
    peso: 14,
    opciones: [
      { value: "claro_compatible", label: "Propósito claro, temporal y coherente con la categoría", factor: 1 },
      { value: "claro_revisar", label: "Propósito entendible, pero requiere precisar actividades o categoría", factor: 0.6 },
      { value: "ambiguo", label: "Propósito ambiguo o con actividades que deben revisarse antes de avanzar", factor: 0.15 },
    ],
  },
  {
    id: "plan_temporal",
    titulo: "Plan, duración y lógica del viaje",
    ayuda:
      "Considera si duración, destino, actividades y fechas tentativas forman un plan temporal razonablemente coherente.",
    peso: 8,
    opciones: [
      { value: "coherente", label: "Plan definido y coherente con el motivo", factor: 1 },
      { value: "parcial", label: "Plan general definido, con detalles pendientes", factor: 0.6 },
      { value: "inconsistente", label: "Duración o actividades todavía no son coherentes", factor: 0.15 },
    ],
  },
  {
    id: "vinculos_retorno",
    titulo: "Vínculos y compromisos objetivos de retorno",
    ayuda:
      "Considera compromisos verificables fuera de EE.UU., como trabajo, negocio, estudios, vivienda, responsabilidades económicas o personales. No puntúa el tipo de familia ni el estado civil.",
    peso: 20,
    opciones: [
      { value: "multiples", label: "Existen varios compromisos claros, actuales y verificables", factor: 1 },
      { value: "uno_solido", label: "Existe al menos un compromiso importante y verificable", factor: 0.7 },
      { value: "limitados", label: "Los compromisos existen, pero son débiles o poco documentados", factor: 0.35 },
      { value: "sin_evidencia", label: "Todavía no se identifican compromisos objetivos verificables", factor: 0 },
    ],
  },
  {
    id: "continuidad_actividad",
    titulo: "Continuidad laboral, empresarial o académica",
    ayuda:
      "Mide estabilidad y posibilidad de verificación de la actividad actual, sin asignar valor por profesión, cargo o nivel educativo.",
    peso: 12,
    opciones: [
      { value: "estable", label: "Actividad estable y verificable por 12 meses o más", factor: 1 },
      { value: "consolidando", label: "Actividad verificable entre 3 y 12 meses", factor: 0.7 },
      { value: "reciente", label: "Actividad reciente o documentación aún incompleta", factor: 0.4 },
      { value: "no_aplica_documentado", label: "No tiene actividad actual, pero la situación está claramente explicada y documentada", factor: 0.45 },
      { value: "sin_datos", label: "No hay información suficiente para verificar la situación actual", factor: 0.1 },
    ],
  },
  {
    id: "capacidad_costos",
    titulo: "Capacidad para cubrir los costos del viaje",
    ayuda:
      "Evalúa si el presupuesto del viaje puede explicarse y respaldarse, ya sea con recursos propios o con apoyo de un tercero claramente documentado.",
    peso: 12,
    opciones: [
      { value: "propios_suficientes", label: "Recursos propios suficientes y coherentes con el viaje", factor: 1 },
      { value: "tercero_documentado", label: "Parte o todo será cubierto por un tercero y el apoyo está claramente documentado", factor: 0.85 },
      { value: "parcial", label: "Hay recursos, pero falta sustento o el presupuesto requiere ajuste", factor: 0.45 },
      { value: "sin_respaldo", label: "Todavía no existe un respaldo económico identificable", factor: 0.05 },
    ],
  },
  {
    id: "consistencia_global",
    titulo: "Consistencia entre historia, formulario y documentos",
    ayuda:
      "Compara lo declarado sobre viaje, actividad, recursos y antecedentes para identificar contradicciones materiales o vacíos que deben corregirse.",
    peso: 12,
    opciones: [
      { value: "consistente", label: "La información es consistente y los respaldos principales coinciden", factor: 1 },
      { value: "vacíos_menores", label: "Hay vacíos menores corregibles sin cambiar la historia principal", factor: 0.7 },
      { value: "inconsistencias", label: "Hay inconsistencias relevantes que deben resolverse antes de avanzar", factor: 0.2 },
    ],
  },
  {
    id: "cumplimiento_migratorio",
    titulo: "Antecedentes de cumplimiento migratorio",
    ayuda:
      "Revisa sobreestadías, trabajo no autorizado, remoción, fraude u otros antecedentes relevantes. No tener viajes previos no reduce el puntaje.",
    peso: 10,
    opciones: [
      { value: "sin_incidentes", label: "No se conocen incidentes migratorios relevantes", factor: 1 },
      { value: "sin_historial", label: "No tiene historial migratorio previo que evaluar", factor: 1 },
      { value: "incidente_resuelto", label: "Existe un antecedente, pero está identificado y requiere análisis específico", factor: 0.45 },
      { value: "riesgo_legal", label: "Existe un posible impedimento o antecedente serio que requiere revisión profesional antes de continuar", factor: 0 },
    ],
  },
  {
    id: "rechazos_cambios",
    titulo: "Rechazos previos y cambios de circunstancias",
    ayuda:
      "Un rechazo previo no descalifica automáticamente. Si existió uno, evalúa si se comprende la razón y si hay cambios relevantes o mejor evidencia desde entonces.",
    peso: 5,
    opciones: [
      { value: "sin_rechazo", label: "No registra rechazo previo conocido", factor: 1 },
      { value: "rechazo_con_cambios", label: "Hubo rechazo previo y existen cambios o nueva evidencia relevante", factor: 0.8 },
      { value: "rechazo_sin_cambios", label: "Hubo rechazo previo y las circunstancias relevantes siguen prácticamente iguales", factor: 0.35 },
      { value: "motivo_desconocido", label: "Hubo rechazo, pero todavía no se conoce o entiende suficientemente el motivo", factor: 0.2 },
    ],
  },
  {
    id: "preparacion_entrevista",
    titulo: "Preparación para explicar el caso con claridad",
    ayuda:
      "Evalúa si el prospecto puede explicar de forma breve y consistente el propósito, duración, financiamiento y razones de retorno, sin memorizar respuestas artificiales.",
    peso: 7,
    opciones: [
      { value: "preparado", label: "Responde con claridad, naturalidad y consistencia", factor: 1 },
      { value: "requiere_practica", label: "La historia es consistente, pero necesita práctica y mejor estructura", factor: 0.65 },
      { value: "confuso", label: "Las respuestas son confusas o cambian al repreguntar", factor: 0.2 },
    ],
  },
];

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

export function analizarProspectoScore(
  respuestas: ProspectoScoreAnswers,
): ProspectoScoreAnalysis {
  const items = PROSPECTO_SCORE_QUESTIONS.map((pregunta) => {
    const opcion = pregunta.opciones.find(
      (item) => item.value === respuestas[pregunta.id],
    );

    if (!opcion) {
      throw new Error(`Respuesta inválida para ${pregunta.id}`);
    }

    return {
      preguntaId: pregunta.id,
      titulo: pregunta.titulo,
      respuesta: opcion.label,
      aporte: Math.round(pregunta.peso * opcion.factor * 10) / 10,
      peso: pregunta.peso,
      factor: opcion.factor,
    };
  });

  const fortalezas = items
    .filter((item) => item.factor >= 0.8)
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 4)
    .map(({ factor: _factor, ...item }) => item);

  const alertas = items
    .filter((item) => item.factor < 0.6)
    .sort((a, b) => b.peso * (1 - b.factor) - a.peso * (1 - a.factor))
    .slice(0, 4)
    .map(({ factor: _factor, ...item }) => item);

  const acciones = alertas.map((alerta) => {
    const accionesPorPregunta: Record<string, string> = {
      proposito_categoria:
        "Precisar el motivo del viaje y confirmar que las actividades declaradas encajen con una visita temporal antes de avanzar.",
      plan_temporal:
        "Definir mejor duración, destinos, fechas tentativas y actividades para que el plan sea coherente con el propósito declarado.",
      vinculos_retorno:
        "Identificar y documentar compromisos objetivos de retorno que realmente existan y puedan verificarse.",
      continuidad_actividad:
        "Completar la evidencia de la actividad laboral, empresarial, académica o explicar claramente la situación actual.",
      capacidad_costos:
        "Alinear presupuesto, duración y fuente de fondos; reunir respaldo verificable propio o del tercero que financiará el viaje.",
      consistencia_global:
        "Resolver contradicciones entre historia, formulario y documentos antes de preparar una solicitud.",
      cumplimiento_migratorio:
        "Detener la preparación estándar y solicitar revisión especializada del antecedente migratorio antes de continuar.",
      rechazos_cambios:
        "Revisar el rechazo previo, entender qué circunstancias siguen iguales y qué evidencia nueva existe antes de una nueva solicitud.",
      preparacion_entrevista:
        "Practicar una explicación breve, natural y consistente del propósito, financiamiento, duración y razones de retorno.",
    };

    return accionesPorPregunta[alerta.preguntaId] ??
      `Revisar y fortalecer: ${alerta.titulo}.`;
  });

  const { score } = calcularProspectoScore(respuestas);
  const prioridadComercial: ProspectoScoreAnalysis["prioridadComercial"] =
    score >= 75 ? "ALTA" : score >= 50 ? "MEDIA" : "BAJA";

  return {
    prioridadComercial,
    fortalezas,
    alertas,
    acciones: [...new Set(acciones)].slice(0, 4),
  };
}

export function clasificarProspectoScore(score: number) {
  if (score >= 82) return "ALTO";
  if (score >= 65) return "MEDIO_ALTO";
  if (score >= 45) return "MEDIO";
  return "BAJO";
}

export function validarRespuestasProspectoScore(respuestas: ProspectoScoreAnswers) {
  return PROSPECTO_SCORE_QUESTIONS.every((pregunta) => {
    const valor = respuestas[pregunta.id];
    return pregunta.opciones.some((opcion) => opcion.value === valor);
  });
}
