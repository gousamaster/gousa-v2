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
   migratorio?: {
    tuvoVisaUsaAntes?: boolean | null;
    tipoVisaUsaAnterior?: string | null;

    viajoUsaAntes?: boolean | null;
    cantidadViajesUsa?: number | null;
    cumplioSiempreTiempoAutorizado?: boolean | null;

    tuvoSobreestadia?: boolean | null;
    diasSobreestadia?: number | null;

    trabajoNoAutorizadoUsa?: boolean | null;

    tuvoRechazoVisaUsa?: boolean | null;
    cantidadRechazosVisaUsa?: number | null;

    tuvoEntradaRechazadaUsa?: boolean | null;

    tuvoProblemaCbP?: boolean | null;

    tuvoDeportacionRemocion?: boolean | null;

    tuvoPeticionMigratoriaUsa?: boolean | null;

    solicitoResidenciaUsa?: boolean | null;
    solicitoAsiloUsa?: boolean | null;
    solicitoCambioEstatusUsa?: boolean | null;

    tuvoOtroAntecedenteMigratorio?: boolean | null;
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
function evaluateCredibilidadCoherencia(
  input: NexusRuleInput
): NexusMotorEvaluation {
  const result = emptyMotor(
    "CREDIBILIDAD_COHERENCIA"
  );

  let earned = 0;
  let availableSignals = 0;
  const totalSignals = 11;

  const viaje = input.viaje;
  const laboral = input.laboral;
  const patrocinador = input.patrocinador;
  const migratorio = input.migratorio;

  // ==========================================
  // 1. COHERENCIA DEL VIAJE — hasta 5 pts
  // ==========================================

  if (viaje?.motivo) {
    availableSignals += 1;
    earned += 1.5;

    result.strengths.push(
      "motivo de viaje registrado"
    );
  } else {
    result.missingData.push(
      "motivo de viaje"
    );
  }

  if (viaje?.lugar) {
    availableSignals += 1;
    earned += 1;

    result.strengths.push(
      "destino del viaje identificado"
    );
  } else {
    result.missingData.push(
      "destino del viaje"
    );
  }

  if (viaje?.tiempoEstadia) {
    availableSignals += 1;
    earned += 1.5;

    result.strengths.push(
      "duración de estadía registrada"
    );
  } else {
    result.missingData.push(
      "duración de estadía"
    );
  }

  if (viaje?.fechaTentativa) {
    availableSignals += 1;
    earned += 1;

    result.strengths.push(
      "fecha tentativa del viaje registrada"
    );
  } else {
    result.missingData.push(
      "fecha tentativa del viaje"
    );
  }

  // ==========================================
  // 2. COHERENCIA ECONÓMICA — hasta 5 pts
  // ==========================================

  if (
    laboral?.percepcionSalarial != null &&
    laboral.percepcionSalarial > 0
  ) {
    availableSignals += 1;

    if (laboral.percepcionSalarial >= 12000) {
      earned += 3;

      result.strengths.push(
        "ingreso declarado con capacidad económica favorable"
      );
    } else if (
      laboral.percepcionSalarial >= 8000
    ) {
      earned += 2;

      result.observations.push(
        "capacidad económica moderada para contrastar con el viaje"
      );
    } else {
      earned += 1;

      result.observations.push(
        "capacidad económica declarada limitada; requiere revisar costo y características del viaje"
      );
    }
  } else {
    result.missingData.push(
      "ingreso económico para contrastar con el viaje"
    );
  }

  if (patrocinador?.nombrePatrocinador) {
    availableSignals += 1;

    const patrocinadorConContexto =
      Boolean(
        patrocinador.trabajoPatrocinador
      ) ||
      patrocinador
        .percepcionSalarialPatrocinador != null;

    if (patrocinadorConContexto) {
      earned += 2;

      result.strengths.push(
        "patrocinador identificado con contexto económico"
      );
    } else {
      earned += 0.75;

      result.observations.push(
        "patrocinador registrado sin suficiente contexto económico"
      );

      result.missingData.push(
        "capacidad económica del patrocinador"
      );
    }
  } else if (
    laboral?.percepcionSalarial != null
  ) {
    /*
     * No tener patrocinador no es negativo
     * cuando existe capacidad económica propia.
     */
    availableSignals += 1;
    earned += 2;

    result.strengths.push(
      "viaje respaldado por capacidad económica propia registrada"
    );
  } else {
    result.missingData.push(
      "fuente de financiamiento del viaje"
    );
  }

  // ==========================================
  // 3. COHERENCIA LABORAL — hasta 4 pts
  // ==========================================

  if (
    laboral?.lugarTrabajo ||
    laboral?.cargoTrabajo ||
    laboral?.descripcionTrabajo
  ) {
    availableSignals += 1;
    earned += 2;

    result.strengths.push(
      "actividad laboral identificada"
    );
  } else {
    result.missingData.push(
      "actividad laboral"
    );
  }

  if (laboral?.fechaContratacion) {
    availableSignals += 1;

    const antiguedad =
      yearsSince(
        laboral.fechaContratacion
      );

    if (antiguedad != null) {
      if (antiguedad >= 3) {
        earned += 2;

        result.strengths.push(
          "trayectoria laboral consistente"
        );
      } else if (antiguedad >= 1) {
        earned += 1.25;

        result.observations.push(
          "antigüedad laboral moderada"
        );
      } else {
        earned += 0.5;

        result.observations.push(
          "empleo reciente; requiere contrastar estabilidad con el viaje"
        );
      }
    }
  } else {
    result.missingData.push(
      "antigüedad laboral"
    );
  }

  // ==========================================
  // 4. COHERENCIA MIGRATORIA — hasta 4 pts
  // ==========================================

  if (migratorio) {
    const señalesGravesConocidas = [
      migratorio.tuvoSobreestadia,
      migratorio.trabajoNoAutorizadoUsa,
      migratorio.tuvoEntradaRechazadaUsa,
      migratorio.tuvoProblemaCbP,
      migratorio.tuvoDeportacionRemocion,
    ];

    const señalesInformadas =
      señalesGravesConocidas.filter(
        (value) =>
          value !== null &&
          value !== undefined
      );

    if (señalesInformadas.length > 0) {
      availableSignals += 1;

      const tieneIncidenciaGrave =
        señalesInformadas.some(
          (value) => value === true
        );

      if (!tieneIncidenciaGrave) {
        earned += 3;

        result.strengths.push(
          "antecedentes migratorios informados sin incidencias graves registradas"
        );
      } else {
        earned += 0.5;

        result.observations.push(
          "existen antecedentes migratorios que requieren contraste detallado"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes migratorios suficientes para contrastar coherencia"
      );
    }

    if (
      migratorio.tuvoVisaUsaAntes !== null &&
      migratorio.tuvoVisaUsaAntes !== undefined
    ) {
      availableSignals += 1;

      if (
        migratorio.tuvoVisaUsaAntes &&
        migratorio.tipoVisaUsaAnterior
      ) {
        earned += 1;

        result.strengths.push(
          "antecedente de visa estadounidense con tipo identificado"
        );
      } else if (
        migratorio.tuvoVisaUsaAntes
      ) {
        earned += 0.5;

        result.missingData.push(
          "tipo de visa estadounidense anterior"
        );
      } else {
        earned += 1;

        result.observations.push(
          "solicitante sin visa estadounidense previa"
        );
      }
    } else {
      result.missingData.push(
        "antecedente de visa estadounidense"
      );
    }
  } else {
    result.missingData.push(
      "historial migratorio estructurado"
    );
  }
  // ==========================================
  // 5. CONSISTENCIA TRANSVERSAL — hasta 2 pts
  // ==========================================

  if (migratorio) {
    const contradicciones: string[] = [];
    let verificacionesDisponibles = 0;

    // Dice no haber tenido visa USA,
    // pero existe un tipo de visa registrado.
    if (
      migratorio.tuvoVisaUsaAntes !== null &&
      migratorio.tuvoVisaUsaAntes !== undefined &&
      migratorio.tipoVisaUsaAnterior
    ) {
      verificacionesDisponibles += 1;

      if (!migratorio.tuvoVisaUsaAntes) {
        contradicciones.push(
          "se registra tipo de visa anterior aunque se declaró no haber tenido visa estadounidense"
        );
      }
    }

    // Dice no haber viajado a USA,
    // pero registra cantidad positiva de viajes.
    if (
      migratorio.viajoUsaAntes !== null &&
      migratorio.viajoUsaAntes !== undefined &&
      migratorio.cantidadViajesUsa != null
    ) {
      verificacionesDisponibles += 1;

      if (
        !migratorio.viajoUsaAntes &&
        migratorio.cantidadViajesUsa > 0
      ) {
        contradicciones.push(
          "se registran viajes a Estados Unidos aunque se declaró no haber ingresado anteriormente"
        );
      }
    }

    // Dice no haber tenido sobreestadía,
    // pero registra días de sobreestadía.
    if (
      migratorio.tuvoSobreestadia !== null &&
      migratorio.tuvoSobreestadia !== undefined &&
      migratorio.diasSobreestadia != null
    ) {
      verificacionesDisponibles += 1;

      if (
        !migratorio.tuvoSobreestadia &&
        migratorio.diasSobreestadia > 0
      ) {
        contradicciones.push(
          "se registran días de sobreestadía aunque se declaró no haber tenido sobreestadía"
        );
      }
    }

    // No puede afirmar cumplimiento permanente
    // y simultáneamente declarar una sobreestadía.
    if (
      migratorio.cumplioSiempreTiempoAutorizado !==
        null &&
      migratorio.cumplioSiempreTiempoAutorizado !==
        undefined &&
      migratorio.tuvoSobreestadia !== null &&
      migratorio.tuvoSobreestadia !== undefined
    ) {
      verificacionesDisponibles += 1;

      if (
        migratorio.cumplioSiempreTiempoAutorizado ===
          true &&
        migratorio.tuvoSobreestadia === true
      ) {
        contradicciones.push(
          "se declaró cumplimiento permanente del tiempo autorizado y también una sobreestadía"
        );
      }
    }

    if (verificacionesDisponibles > 0) {
      availableSignals += 1;

      if (contradicciones.length === 0) {
        earned += 2;

        result.strengths.push(
          "sin contradicciones internas detectadas en los antecedentes migratorios registrados"
        );
      } else {
        result.observations.push(
          ...contradicciones
        );
      }
    } else {
      result.missingData.push(
        "datos suficientes para contrastar consistencia interna"
      );
    }
  } else {
    result.missingData.push(
      "datos migratorios para contrastar consistencia interna"
    );
  }
  // ==========================================
  // COBERTURA Y PUNTAJE FINAL
  // ==========================================

  result.coverage = Math.round(
    (availableSignals / totalSignals) * 100
  );

  if (availableSignals === 0) {
    result.score = null;

    return result;
  }

  /*
   * Igual que en Historial Migratorio:
   * lo faltante no resta,
   * pero tampoco genera puntos artificiales.
   */
  result.score = Math.max(
    0,
    Math.min(
      result.max,
      Math.round(earned * 10) / 10
    )
  );

  if (result.coverage < 40) {
    result.observations.push(
      "evaluación preliminar de coherencia basada en información parcial"
    );
  } else if (result.coverage < 80) {
    result.observations.push(
      "coherencia parcialmente evaluable; existen datos relevantes por completar"
    );
  } else {
    result.strengths.push(
      "buena cobertura de información para contrastar coherencia"
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

  const migratorio = input.migratorio;

  let availableSignals = 0;
  const totalSignals = 11;

  let earned = 0;
  let availableWeight = 0;

  // ==========================================
  // 1. HISTORIAL INTERNACIONAL — hasta 5 pts
  // ==========================================

  const paisesTexto =
    input.viaje?.paisesVisitados?.trim();

  if (paisesTexto) {
    availableSignals += 1;
    availableWeight += 5;

    const paises = paisesTexto
      .split(/[,;\n]+/)
      .map((pais) =>
        pais.trim().toLowerCase()
      )
      .filter(Boolean);

    const paisesUnicos =
      Array.from(new Set(paises));

    const cantidad =
      paisesUnicos.length;

    let puntosViajes = 0;

    if (cantidad >= 6) {
      puntosViajes = 5;
    } else if (cantidad >= 4) {
      puntosViajes = 4.5;
    } else if (cantidad >= 2) {
      puntosViajes = 3.5;
    } else if (cantidad === 1) {
      puntosViajes = 2.5;
    }

    earned += puntosViajes;

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
  } else {
    result.missingData.push(
      "historial de viajes internacionales"
    );
  }

  // ==========================================
  // 2. HISTORIAL USA ESTRUCTURADO — 10 pts
  // ==========================================

  if (!migratorio) {
    result.missingData.push(
      "historial migratorio estructurado de Estados Unidos"
    );
  } else {
    // Visa anterior: contexto, no castiga
    if (
      migratorio.tuvoVisaUsaAntes !== null &&
      migratorio.tuvoVisaUsaAntes !== undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.25;
      earned += 0.25;

      if (migratorio.tuvoVisaUsaAntes) {
        result.strengths.push(
          "antecedente de visa estadounidense registrado"
        );

        if (!migratorio.tipoVisaUsaAnterior) {
          result.missingData.push(
            "tipo de visa estadounidense anterior"
          );
        }
      } else {
        result.observations.push(
          "solicitante sin visa estadounidense previa"
        );
      }
    } else {
      result.missingData.push(
        "antecedente de visa estadounidense"
      );
    }

    // Viajes anteriores a USA: contexto, no castiga
    if (
      migratorio.viajoUsaAntes !== null &&
      migratorio.viajoUsaAntes !== undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.25;
      earned += 0.25;

      if (migratorio.viajoUsaAntes) {
        result.strengths.push(
          "ingresos anteriores a Estados Unidos registrados"
        );

        if (
          migratorio.cantidadViajesUsa != null &&
          migratorio.cantidadViajesUsa > 1
        ) {
          result.strengths.push(
            "múltiples viajes anteriores a Estados Unidos"
          );
        }
      } else {
        result.observations.push(
          "sin viajes anteriores a Estados Unidos"
        );
      }
    } else {
      result.missingData.push(
        "viajes anteriores a Estados Unidos"
      );
    }

    // Cumplimiento del tiempo autorizado
    if (
      migratorio.cumplioSiempreTiempoAutorizado !==
        null &&
      migratorio.cumplioSiempreTiempoAutorizado !==
        undefined
    ) {
      availableSignals += 1;
      availableWeight += 2;

      if (
        migratorio.cumplioSiempreTiempoAutorizado
      ) {
        earned += 2;

        result.strengths.push(
          "cumplimiento de permanencias autorizadas registrado"
        );
      } else {
        result.observations.push(
          "existe antecedente de incumplimiento del tiempo autorizado"
        );
      }
    } else {
      result.missingData.push(
        "cumplimiento de tiempos autorizados en Estados Unidos"
      );
    }

    // Sobreestadía
    if (
      migratorio.tuvoSobreestadia !== null &&
      migratorio.tuvoSobreestadia !== undefined
    ) {
      availableSignals += 1;
      availableWeight += 2;

      if (!migratorio.tuvoSobreestadia) {
        earned += 2;

        result.strengths.push(
          "sin sobreestadía declarada"
        );
      } else {
        result.observations.push(
          migratorio.diasSobreestadia != null
            ? `sobreestadía registrada de aproximadamente ${migratorio.diasSobreestadia} días`
            : "antecedente de sobreestadía registrado"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes de sobreestadía"
      );
    }

    // Trabajo no autorizado
    if (
      migratorio.trabajoNoAutorizadoUsa !== null &&
      migratorio.trabajoNoAutorizadoUsa !==
        undefined
    ) {
      availableSignals += 1;
      availableWeight += 1.5;

      if (!migratorio.trabajoNoAutorizadoUsa) {
        earned += 1.5;

        result.strengths.push(
          "sin trabajo no autorizado declarado"
        );
      } else {
        result.observations.push(
          "antecedente de trabajo no autorizado en Estados Unidos"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes de trabajo no autorizado"
      );
    }

    // Rechazos de visa
    if (
      migratorio.tuvoRechazoVisaUsa !== null &&
      migratorio.tuvoRechazoVisaUsa !== undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.75;

      if (!migratorio.tuvoRechazoVisaUsa) {
        earned += 0.75;

        result.strengths.push(
          "sin rechazos de visa estadounidense declarados"
        );
      } else {
        earned += 0.35;

        result.observations.push(
          migratorio.cantidadRechazosVisaUsa != null
            ? `${migratorio.cantidadRechazosVisaUsa} rechazo(s) de visa registrado(s)`
            : "antecedente de rechazo de visa registrado"
        );
      }
    } else {
      result.missingData.push(
        "historial de rechazos de visa estadounidense"
      );
    }

    // Entrada rechazada
    if (
      migratorio.tuvoEntradaRechazadaUsa !== null &&
      migratorio.tuvoEntradaRechazadaUsa !==
        undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.75;

      if (!migratorio.tuvoEntradaRechazadaUsa) {
        earned += 0.75;
      } else {
        earned += 0.25;

        result.observations.push(
          "antecedente de ingreso rechazado a Estados Unidos"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes de ingreso rechazado"
      );
    }

    // Problemas con CBP
    if (
      migratorio.tuvoProblemaCbP !== null &&
      migratorio.tuvoProblemaCbP !== undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.75;

      if (!migratorio.tuvoProblemaCbP) {
        earned += 0.75;
      } else {
        earned += 0.25;

        result.observations.push(
          "incidente o problema con CBP registrado"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes de incidentes con CBP"
      );
    }

    // Deportación / remoción
    if (
      migratorio.tuvoDeportacionRemocion !== null &&
      migratorio.tuvoDeportacionRemocion !==
        undefined
    ) {
      availableSignals += 1;
      availableWeight += 1.5;

      if (!migratorio.tuvoDeportacionRemocion) {
        earned += 1.5;

        result.strengths.push(
          "sin deportación o remoción declarada"
        );
      } else {
        result.observations.push(
          "antecedente de deportación o remoción registrado"
        );
      }
    } else {
      result.missingData.push(
        "antecedentes de deportación o remoción"
      );
    }

    // Otro antecedente relevante
    if (
      migratorio.tuvoOtroAntecedenteMigratorio !==
        null &&
      migratorio.tuvoOtroAntecedenteMigratorio !==
        undefined
    ) {
      availableSignals += 1;
      availableWeight += 0.25;

      if (
        !migratorio.tuvoOtroAntecedenteMigratorio
      ) {
        earned += 0.25;
      } else {
        result.observations.push(
          "existe otro antecedente migratorio que requiere revisión"
        );
      }
    } else {
      result.missingData.push(
        "otros antecedentes migratorios relevantes"
      );
    }

    // Peticiones y procesos:
    // se registran como contexto, NO como penalización.
    if (
      migratorio.tuvoPeticionMigratoriaUsa === true
    ) {
      result.observations.push(
        "existe petición o proceso migratorio en Estados Unidos; requiere análisis de contexto"
      );
    }

    if (migratorio.solicitoResidenciaUsa === true) {
      result.observations.push(
        "solicitud de residencia registrada"
      );
    }

    if (migratorio.solicitoAsiloUsa === true) {
      result.observations.push(
        "solicitud de asilo registrada"
      );
    }

    if (
      migratorio.solicitoCambioEstatusUsa === true
    ) {
      result.observations.push(
        "solicitud de cambio de estatus registrada"
      );
    }
  }

  result.coverage = Math.round(
    (availableSignals / totalSignals) * 100
  );

  // Evitamos publicar una valoración migratoria
  // con información demasiado fragmentaria.
   // ==========================================
  // PUNTAJE FINAL — CALIBRACIÓN NEXUS
  // ==========================================

  if (availableWeight === 0) {
    result.score = null;

    result.observations.push(
      "historial migratorio todavía sin información evaluable"
    );

    return result;
  }

  /*
   * NEXUS no convierte automáticamente una ficha
   * incompleta en 15/15.
   *
   * earned representa únicamente los puntos que
   * realmente pudieron demostrarse con la información
   * disponible.
   *
   * Los datos faltantes:
   * - NO restan puntos;
   * - NO se consideran respuestas negativas;
   * - pero tampoco generan puntos artificiales.
   */

  let finalScore = earned;

  // Bonificación solo con buena cobertura y calidad
  if (result.coverage >= 80) {
    const quality =
      availableWeight > 0
        ? earned / availableWeight
        : 0;

    if (quality >= 0.95) {
      finalScore += 1;
    } else if (quality >= 0.85) {
      finalScore += 0.5;
    }
  }

  // 15/15 queda reservado para expedientes
  // prácticamente completos y excepcionalmente sólidos.
  if (
    result.coverage < 90 &&
    finalScore >= 15
  ) {
    finalScore = 14;
  }

  result.score = Math.max(
    0,
    Math.min(
      result.max,
      Math.round(finalScore * 10) / 10
    )
  );

  if (result.coverage < 45) {
    result.observations.push(
      "evaluación preliminar basada en información migratoria parcial"
    );
  } else if (result.coverage < 80) {
    result.observations.push(
      "evaluación migratoria disponible; aún existen antecedentes por completar"
    );
    } else {
    result.strengths.push(
      "historial migratorio con buena cobertura de información"
    );
  }

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

motores.CREDIBILIDAD_COHERENCIA =
  evaluateCredibilidadCoherencia(input);

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
