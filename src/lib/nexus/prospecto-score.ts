export const PROSPECTO_SCORE_VERSION = "NEXUS-SCORE-2.0-GOUSA-2027";

export type ScoreOption = {
  value: string;
  label: string;
  factor: number;
  puntos: number;
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
 * NEXUS Score 2.0 — Método GO USA 2027.
 *
 * Los puntajes provienen del archivo operativo SIMULADOR-2027.xlsx entregado
 * por GO USA. NEXUS los organiza en nueve bloques con máximo total de 100
 * puntos y obliga a escoger una sola alternativa por bloque para evitar que
 * opciones mutuamente excluyentes se sumen accidentalmente.
 *
 * IMPORTANTE: este Score es exclusivamente un índice interno de oportunidad
 * comercial y preparación del perfil. NO representa probabilidad de
 * aprobación consular, no sustituye evaluación profesional y no garantiza
 * ninguna decisión migratoria.
 */
function opcion(value: string, label: string, puntos: number, peso: number): ScoreOption {
  return { value, label, puntos, factor: puntos / peso };
}

export const PROSPECTO_SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    id: "estado_civil",
    titulo: "Estado civil declarado",
    ayuda: "Bloque de referencia del Método GO USA 2027. Registrar la situación actual tal como fue informada por el prospecto.",
    peso: 10,
    opciones: [
      opcion("soltero", "Soltero(a)", 4, 10),
      opcion("casado", "Casado(a)", 10, 10),
      opcion("divorciado", "Divorciado(a)", 6, 10),
      opcion("conviviente", "Conviviente", 8, 10),
    ],
  },
  {
    id: "hijos",
    titulo: "Situación de hijos",
    ayuda: "Seleccionar la alternativa que mejor representa la situación familiar declarada.",
    peso: 5,
    opciones: [
      opcion("dependientes", "Con hijos dependientes", 5, 5),
      opcion("independientes", "Con hijos independientes", 4, 5),
      opcion("sin_hijos", "Sin hijos", 1, 5),
    ],
  },
  {
    id: "situacion_laboral",
    titulo: "Situación laboral principal",
    ayuda: "Seleccionar una sola alternativa principal para evitar sumar condiciones laborales incompatibles entre sí.",
    peso: 15,
    opciones: [
      opcion("dependiente_privada_5", "Dependiente empresa privada +5 años", 7, 15),
      opcion("dependiente_publica_5", "Dependiente empresa pública +5 años", 15, 15),
      opcion("dependiente_menos_2", "Dependiente menos de 2 años", 2, 15),
      opcion("independiente_nit_menos_2", "Independiente con NIT menos de 2 años", 7, 15),
      opcion("independiente_nit_5", "Independiente con NIT +5 años", 15, 15),
      opcion("independiente_sin_respaldo", "Independiente sin respaldo", 2, 15),
      opcion("sin_trabajo_renta", "Sin trabajo, con renta/propiedades", 12, 15),
      opcion("sin_trabajo_patrocinante", "Sin trabajo, con patrocinante", 5, 15),
      opcion("sin_trabajo_sin_patrocinante", "Sin trabajo y sin patrocinante", -10, 15),
    ],
  },
  {
    id: "antiguedad_laboral",
    titulo: "Antigüedad / estabilidad laboral",
    ayuda: "Aplicar a la actividad laboral, empresarial o económica principal cuando corresponda.",
    peso: 15,
    opciones: [
      opcion("menos_1", "Menos de 1 año", 3, 15),
      opcion("menos_2", "Estable menos de 2 años", 5, 15),
      opcion("3_5", "Estable de 3 a 5 años", 8, 15),
      opcion("5_10", "Estable de 5 a 10 años", 12, 15),
      opcion("mas_10", "Estable más de 10 años", 15, 15),
    ],
  },
  {
    id: "ingresos",
    titulo: "Percepción salarial / ingresos mensuales",
    ayuda: "Usar el ingreso mensual principal declarado y respaldable del prospecto.",
    peso: 15,
    opciones: [
      opcion("hasta_3300", "Bs 3.300 o menos", 2, 15),
      opcion("3300_6000", "Bs 3.300 a Bs 6.000", 4, 15),
      opcion("6000_9999", "Bs 6.000 a Bs 9.999", 9, 15),
      opcion("10000_19999", "Bs 10.000 a Bs 19.999", 12, 15),
      opcion("20000_mas", "Bs 20.000 o más", 15, 15),
    ],
  },
  {
    id: "vivienda",
    titulo: "Vivienda / estabilidad residencial",
    ayuda: "Seleccionar la condición residencial principal. Se corrigió la referencia cruzada de la fila Alquiler - Bs 2.500 del Excel original.",
    peso: 10,
    opciones: [
      opcion("propiedad", "Propiedad inmueble a su nombre", 10, 10),
      opcion("anticretico", "Anticrético", 5, 10),
      opcion("alquiler_menor_2500", "Alquiler hasta Bs 2.500", 3, 10),
      opcion("alquiler_3000_mas", "Alquiler Bs 3.000 o más", 4, 10),
      opcion("vive_padres", "Vive con padres", 2, 10),
    ],
  },
  {
    id: "solidez_financiera",
    titulo: "Principal señal patrimonial / financiera",
    ayuda: "Elegir la señal que mejor represente la situación actual. El Excel permitía múltiples checks; Score 2.0 usa una sola opción para mantener el máximo del bloque en 10 puntos.",
    peso: 10,
    opciones: [
      opcion("otro_patrimonio", "Otro patrimonio a su nombre", 7, 10),
      opcion("cuentas_bancarias", "Cuentas bancarias con ahorro/movimiento", 10, 10),
      opcion("efectivo_ahorrado", "Dinero en efectivo ahorrado", 6, 10),
      opcion("deuda_alta_productiva", "Deuda bancaria alta vinculada a negocio/propiedad", 10, 10),
      opcion("deuda_baja", "Deuda bancaria baja", 4, 10),
      opcion("sin_deuda_sin_bienes", "Sin deuda pero sin bienes", -10, 10),
    ],
  },
  {
    id: "entorno_usa",
    titulo: "Contexto de viaje / vínculos en Estados Unidos",
    ayuda: "Registrar la situación que mejor describa el contexto principal del viaje; no equivale por sí sola a elegibilidad consular.",
    peso: 10,
    opciones: [
      opcion("familiar_ciudadano", "Familiar de primer grado ciudadano estadounidense", 8, 10),
      opcion("evento_feria", "Invitación a evento o feria en Estados Unidos", 10, 10),
      opcion("amistad_legal", "Amistad o conocido en Estados Unidos con estatus legal", 6, 10),
      opcion("sin_conocido_respaldo", "Sin conocido en Estados Unidos, pero con respaldos de viaje", 8, 10),
      opcion("familiar_directo_irregular", "Familiar directo en Estados Unidos con situación migratoria irregular", -20, 10),
    ],
  },
  {
    id: "historial_viajes",
    titulo: "Historial de viajes al exterior",
    ayuda: "Seleccionar la alternativa que mejor resuma el historial internacional declarado.",
    peso: 10,
    opciones: [
      opcion("mas_2_ultimos_5", "Más de 2 países visitados en los últimos 5 años", 10, 10),
      opcion("2_ultimos_5", "2 países visitados en los últimos 5 años", 7, 10),
      opcion("mas_5_historicos", "Más de 5 viajes al exterior realizados históricamente", 5, 10),
      opcion("ninguno", "Ningún viaje al exterior", 1, 10),
    ],
  },
];

export function calcularProspectoScore(respuestas: ProspectoScoreAnswers) {
  let score = 0;
  for (const pregunta of PROSPECTO_SCORE_QUESTIONS) {
    const respuesta = respuestas[pregunta.id];
    const opcionSeleccionada = pregunta.opciones.find((item) => item.value === respuesta);
    if (!opcionSeleccionada) throw new Error(`Respuesta inválida para ${pregunta.id}`);
    score += opcionSeleccionada.puntos;
  }
  const resultado = Math.round(score);
  const scoreNormalizado = Math.max(0, Math.min(100, resultado));
  return { score: scoreNormalizado, clasificacion: clasificarProspectoScore(scoreNormalizado) };
}

export function analizarProspectoScore(respuestas: ProspectoScoreAnswers): ProspectoScoreAnalysis {
  const items = PROSPECTO_SCORE_QUESTIONS.map((pregunta) => {
    const seleccion = pregunta.opciones.find((item) => item.value === respuestas[pregunta.id]);
    if (!seleccion) throw new Error(`Respuesta inválida para ${pregunta.id}`);
    return { preguntaId: pregunta.id, titulo: pregunta.titulo, respuesta: seleccion.label, aporte: seleccion.puntos, peso: pregunta.peso, factor: seleccion.factor };
  });

  const fortalezas = items.filter((item) => item.factor >= 0.75).sort((a, b) => b.aporte - a.aporte).slice(0, 4).map(({ factor: _factor, ...item }) => item);
  const alertas = items.filter((item) => item.factor < 0.4).sort((a, b) => a.factor - b.factor || b.peso - a.peso).slice(0, 4).map(({ factor: _factor, ...item }) => item);

  const accionesPorPregunta: Record<string, string> = {
    estado_civil: "Confirmar que la información familiar esté actualizada y sea consistente con la ficha del prospecto.",
    hijos: "Completar correctamente el contexto familiar y responsabilidades declaradas.",
    situacion_laboral: "Revisar la actividad económica actual y solicitar respaldo real cuando corresponda.",
    antiguedad_laboral: "Validar fechas y continuidad de la actividad laboral o económica declarada.",
    ingresos: "Confirmar ingreso mensual y evidencia disponible antes de avanzar con la evaluación comercial.",
    vivienda: "Precisar la situación residencial y el respaldo que realmente exista.",
    solidez_financiera: "Revisar la principal señal financiera/patrimonial y documentarla correctamente.",
    entorno_usa: "Revisar el contexto de viaje y cualquier vínculo en Estados Unidos antes de definir el siguiente paso.",
    historial_viajes: "Completar el historial internacional y registrar países/viajes de forma consistente.",
  };
  const acciones = alertas.map((alerta) => accionesPorPregunta[alerta.preguntaId] ?? `Revisar: ${alerta.titulo}.`);
  const { score } = calcularProspectoScore(respuestas);
  const prioridadComercial: ProspectoScoreAnalysis["prioridadComercial"] = score >= 70 ? "ALTA" : score >= 45 ? "MEDIA" : "BAJA";
  return { prioridadComercial, fortalezas, alertas, acciones: [...new Set(acciones)].slice(0, 4) };
}

export function clasificarProspectoScore(score: number) {
  if (score >= 70) return "ALTA_OPORTUNIDAD";
  if (score >= 45) return "MEDIA_OPORTUNIDAD";
  return "BAJA_OPORTUNIDAD";
}

export function validarRespuestasProspectoScore(respuestas: ProspectoScoreAnswers) {
  return PROSPECTO_SCORE_QUESTIONS.every((pregunta) => pregunta.opciones.some((opcion) => opcion.value === respuestas[pregunta.id]));
}
