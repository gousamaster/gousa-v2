import type { NexusMotorKey } from "@/types/nexus";

/**
 * GO USA NEXUS — Rule Engine v1
 *
 * Motor determinístico y puro:
 * - no accede a Prisma
 * - no modifica datos
 * - no hace llamadas externas
 * - no convierte información faltante en cero
 */

export const NEXUS_MOTOR_WEIGHTS: Record<NexusMotorKey, number> = {
  ARRAIGO: 20,
  CREDIBILIDAD_COHERENCIA: 20,
  MOTIVO_VIAJE: 15,
  PERFIL_LABORAL_ECONOMICO: 20,
  ENTORNO_FAMILIAR_RIESGO_MIGRATORIO: 10,
  HISTORIAL_MIGRATORIO: 15,
};

export type NexusRiskLevel =
  | "MUY_FAVORABLE"
  | "FAVORABLE"
  | "OBSERVACIONES"
  | "RIESGO"
  | "ALTO_RIESGO";

export interface NexusMotorEvaluation {
  key: NexusMotorKey;
  max: number;
  score: number | null;
  coverage: number;
  strengths: string[];
  observations: string[];
  missingData: string[];
}

export interface NexusScoreResult {
  total: number | null;
  coverage: number;
  classification: NexusRiskLevel | null;
  motores: Record<NexusMotorKey, NexusMotorEvaluation>;
}

export interface NexusRuleInput {
  laboral?: {
    lugarTrabajo?: string | null;
    cargoTrabajo?: string | null;
    descripcionTrabajo?: string | null;
    fechaContratacion?: Date | null;
    percepcionSalarial?: number | null;
  } | null;

  academico?: {
    lugarEstudio?: string | null;
    carreraEstudio?: string | null;
  } | null;

  matrimonial?: {
    conyugeNombreCompleto?: string | null;
  } | null;

  patrocinador?: {
    nombrePatrocinador?: string | null;
    trabajoPatrocinador?: string | null;
    percepcionSalarialPatrocinador?: number | null;
  } | null;

  viaje?: {
  motivo?: string | null;
  lugar?: string | null;
  fechaTentativa?: Date | null;
  tiempoEstadia?: string | null;
  paisesVisitados?: string | null;
} | null;

  grupoFamiliarCount?: number | null;
}

const MOTOR_KEYS = Object.keys(
  NEXUS_MOTOR_WEIGHTS
) as NexusMotorKey[];

function emptyMotor(
  key: NexusMotorKey
): NexusMotorEvaluation {
  return {
    key,
    max: NEXUS_MOTOR_WEIGHTS[key],
    score: null,
    coverage: 0,
    strengths: [],
    observations: [],
    missingData: [],
  };
}

function yearsSince(date?: Date | null): number | null {
  if (!date) return null;

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();

  const anniversary = new Date(
    now.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (anniversary > now) years -= 1;

  return Math.max(0, years);
}

function evaluateLaboral(
  input: NexusRuleInput
): NexusMotorEvaluation {
  const result = emptyMotor(
    "PERFIL_LABORAL_ECONOMICO"
  );

  const laboral = input.laboral;

  if (!laboral) {
    result.missingData.push("datos laborales");
    return result;
  }

  let raw = 0;
  let available = 0;
  const totalSignals = 4;

  if (laboral.fechaContratacion) {
    available += 1;

    const years =
      yearsSince(laboral.fechaContratacion) ?? 0;

    if (years >= 5) {
      raw += 8;
      result.strengths.push(
        "trayectoria laboral de 5 años o más"
      );
    } else if (years >= 3) {
      raw += 7;
      result.strengths.push(
        "buena antigüedad laboral"
      );
    } else if (years >= 1) {
      raw += 4;
      result.observations.push(
        "antigüedad laboral todavía moderada"
      );
    } else {
      raw += 1;
      result.observations.push(
        "antigüedad laboral menor a 12 meses: muy baja"
      );
    }
  } else {
    result.missingData.push(
      "fecha de contratación"
    );
  }

  if (laboral.percepcionSalarial != null) {
    available += 1;

    if (laboral.percepcionSalarial >= 12000) {
      raw += 5;
      result.strengths.push(
        "capacidad económica declarada favorable"
      );
    } else if (
      laboral.percepcionSalarial >= 8000
    ) {
      raw += 3.5;
    } else if (
      laboral.percepcionSalarial > 0
    ) {
      raw += 2;
      result.observations.push(
        "capacidad económica declarada limitada"
      );
    }
  } else {
    result.missingData.push(
      "ingreso o percepción salarial"
    );
  }

  if (
    laboral.lugarTrabajo ||
    laboral.cargoTrabajo ||
    laboral.descripcionTrabajo
  ) {
    available += 1;
    raw += 3;

    result.strengths.push(
      "actividad laboral identificada"
    );
  } else {
    result.missingData.push(
      "actividad o cargo laboral"
    );
  }

  if (input.patrocinador?.nombrePatrocinador) {
    available += 1;

    const sponsorHasEconomicContext =
      Boolean(
        input.patrocinador.trabajoPatrocinador
      ) ||
      input.patrocinador
        .percepcionSalarialPatrocinador != null;

    raw += sponsorHasEconomicContext ? 4 : 2;

    if (sponsorHasEconomicContext) {
      result.strengths.push(
        "patrocinador con contexto económico registrado"
      );
    } else {
      result.observations.push(
        "patrocinador registrado sin suficiente contexto económico"
      );
    }
  } else {
    result.missingData.push(
      "coherencia económica del viaje o patrocinador si aplica"
    );
  }

  result.coverage = Math.round(
    (available / totalSignals) * 100
  );

  result.score = Math.min(
    result.max,
    Math.round(raw * 10) / 10
  );

  return result;
}

function evaluateMotivo(
  input: NexusRuleInput
): NexusMotorEvaluation {
  const result = emptyMotor("MOTIVO_VIAJE");
  const viaje = input.viaje;

  if (!viaje) {
    result.missingData.push(
      "datos del viaje"
    );
    return result;
  }

  const signals = [
    viaje.motivo,
    viaje.lugar,
    viaje.fechaTentativa,
    viaje.tiempoEstadia,
  ];

  const available =
    signals.filter(Boolean).length;

  result.coverage = Math.round(
    (available / signals.length) * 100
  );

  if (!viaje.motivo) {
    result.missingData.push(
      "motivo del viaje"
    );
  }

  if (!viaje.lugar) {
    result.missingData.push("destino");
  }

  if (!viaje.fechaTentativa) {
    result.missingData.push(
      "fecha tentativa"
    );
  }

  if (!viaje.tiempoEstadia) {
    result.missingData.push(
      "duración de estadía"
    );
  }

  if (available === 0) {
    return result;
  }

  // En v1 solo medimos completitud.
  // No inferimos intención migratoria
  // a partir de texto libre.
  result.score =
    Math.round(
      (available / signals.length) *
        result.max *
        10
    ) / 10;

  if (available === signals.length) {
    result.strengths.push(
      "motivo, destino, fecha y duración registrados"
    );
  } else {
    result.observations.push(
      "viaje todavía incompleto para una evaluación consular profunda"
    );
  }

  return result;
}
function evaluateHistorialMigratorio(
  input: NexusRuleInput
): NexusMotorEvaluation {
  const result = emptyMotor(
    "HISTORIAL_MIGRATORIO"
  );

  const paisesTexto =
    input.viaje?.paisesVisitados?.trim();

  if (!paisesTexto) {
    result.missingData.push(
      "historial de viajes internacionales"
    );

    result.missingData.push(
      "historial estructurado de visas, entradas, salidas y rechazos"
    );

    return result;
  }

  // Acepta países separados por:
  // coma, punto y coma o salto de línea.
  const paises = paisesTexto
    .split(/[,;\n]+/)
    .map((pais) =>
      pais.trim().toLowerCase()
    )
    .filter(Boolean);

  // Evita contar repetidos.
  const paisesUnicos =
    Array.from(new Set(paises));

  const cantidad =
    paisesUnicos.length;

  let scoreViajes = 0;

  if (cantidad >= 6) {
    scoreViajes = 10;
  } else if (cantidad >= 4) {
    scoreViajes = 9;
  } else if (cantidad >= 2) {
    scoreViajes = 7;
  } else if (cantidad === 1) {
    scoreViajes = 5;
  }

  result.coverage = 40;
  result.score = scoreViajes;

  result.strengths.push(
    `${cantidad} país${
      cantidad === 1 ? "" : "es"
    } visitado${
      cantidad === 1 ? "" : "s"
    } registrado${
      cantidad === 1 ? "" : "s"
    }`
  );

  if (cantidad >= 4) {
    result.strengths.push(
      "historial internacional diversificado"
    );
  }

  result.observations.push(
    "el puntaje actual evalúa únicamente historial internacional registrado"
  );

  result.missingData.push(
    "visas anteriores y resultados"
  );

  result.missingData.push(
    "entradas, salidas y duración de estadías"
  );

  result.missingData.push(
    "rechazos o antecedentes migratorios"
  );

  result.missingData.push(
    "cumplimiento de condiciones migratorias en Estados Unidos"
  );

  return result;
}
function evaluateArraigo(
  input: NexusRuleInput
): NexusMotorEvaluation {
  const result = emptyMotor("ARRAIGO");

  const laboral = Boolean(
    input.laboral?.fechaContratacion ||
      input.laboral?.lugarTrabajo
  );

  const academico = Boolean(
    input.academico?.lugarEstudio ||
      input.academico?.carreraEstudio
  );

  const matrimonial = Boolean(
    input.matrimonial?.conyugeNombreCompleto
  );

  const familiar = Boolean(
    input.grupoFamiliarCount &&
      input.grupoFamiliarCount > 0
  );

  const signals = [
    laboral,
    academico,
    matrimonial,
    familiar,
  ];

  const available =
    signals.filter(Boolean).length;

  result.coverage = Math.round(
    (available / signals.length) * 100
  );

  if (available === 0) {
    result.missingData.push(
      "vínculos laborales, académicos o familiares suficientes"
    );

    return result;
  }

  let raw = 0;

  if (laboral) raw += 8;
  if (academico) raw += 4;
  if (matrimonial) raw += 4;
  if (familiar) raw += 4;

  result.score = Math.min(
    result.max,
    raw
  );

  if (laboral) {
    result.strengths.push(
      "vínculo laboral registrado"
    );
  }

  if (academico) {
    result.strengths.push(
      "vínculo académico registrado"
    );
  }

  if (matrimonial || familiar) {
    result.strengths.push(
      "vínculo familiar registrado"
    );
  }

  result.missingData.push(
    "patrimonio no está estructurado en la versión actual del CRM"
  );

  return result;
}

function classify(
  total: number
): NexusRiskLevel {
  if (total >= 85) {
    return "MUY_FAVORABLE";
  }

  if (total >= 70) {
    return "FAVORABLE";
  }

  if (total >= 55) {
    return "OBSERVACIONES";
  }

  if (total >= 40) {
    return "RIESGO";
  }

  return "ALTO_RIESGO";
}

export function evaluateNexusScore(
  input: NexusRuleInput
): NexusScoreResult {
  const motores = Object.fromEntries(
    MOTOR_KEYS.map((key) => [
      key,
      emptyMotor(key),
    ])
  ) as Record<
    NexusMotorKey,
    NexusMotorEvaluation
  >;

  motores.ARRAIGO =
    evaluateArraigo(input);

  motores.PERFIL_LABORAL_ECONOMICO =
    evaluateLaboral(input);

  motores.MOTIVO_VIAJE =
    evaluateMotivo(input);

  motores.CREDIBILIDAD_COHERENCIA
    .missingData.push(
      "formularios o antecedentes suficientes para contrastar coherencia"
    );

  motores.ENTORNO_FAMILIAR_RIESGO_MIGRATORIO
    .missingData.push(
      "estatus y contexto migratorio de familiares en Estados Unidos"
    );

  motores.HISTORIAL_MIGRATORIO =
  evaluateHistorialMigratorio(input);

  const evaluated = MOTOR_KEYS
    .map((key) => motores[key])
    .filter(
      (motor) => motor.score != null
    );

  const coveredWeight =
    evaluated.reduce(
      (sum, motor) =>
        sum + motor.max,
      0
    );

  const coverage = coveredWeight;

  // NEXUS no publica un porcentaje global
  // hasta poder evaluar al menos 60%
  // del modelo ponderado.
  //
  // Información faltante NO equivale
  // a cero puntos.
  if (coveredWeight < 60) {
    return {
      total: null,
      coverage,
      classification: null,
      motores,
    };
  }

  const earned = evaluated.reduce(
    (sum, motor) =>
      sum + (motor.score ?? 0),
    0
  );

  const normalized = Math.round(
    (earned / coveredWeight) * 100
  );

  return {
    total: normalized,
    coverage,
    classification:
      classify(normalized),
    motores,
  };
}
