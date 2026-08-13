"use client";

import React, { useEffect, useState } from "react";
import type { NexusResponse, NexusMotorKey } from "@/types/nexus";
import NexusHeader from "@/components/nexus/NexusHeader";
import SummaryCard from "@/components/nexus/SummaryCard";
import Tabs from "@/components/nexus/Tabs";
import HistorialTab from "@/components/nexus/HistorialTab";
import styles from "./nexus.module.css";

const MOTOR_LABELS: Record<NexusMotorKey, string> = {
  ARRAIGO: "Arraigo",
  CREDIBILIDAD_COHERENCIA: "Credibilidad / Coherencia",
  MOTIVO_VIAJE: "Motivo de viaje",
  PERFIL_LABORAL_ECONOMICO: "Perfil laboral / económico",
  ENTORNO_FAMILIAR_RIESGO_MIGRATORIO:
    "Entorno familiar / riesgo migratorio",
  HISTORIAL_MIGRATORIO: "Historial migratorio",
};

const MOTOR_MAX: Record<NexusMotorKey, number> = {
  ARRAIGO: 20,
  CREDIBILIDAD_COHERENCIA: 20,
  MOTIVO_VIAJE: 15,
  PERFIL_LABORAL_ECONOMICO: 20,
  ENTORNO_FAMILIAR_RIESGO_MIGRATORIO: 10,
  HISTORIAL_MIGRATORIO: 15,
};

const MOTOR_ORDER: NexusMotorKey[] = [
  "ARRAIGO",
  "PERFIL_LABORAL_ECONOMICO",
  "MOTIVO_VIAJE",
  "CREDIBILIDAD_COHERENCIA",
  "HISTORIAL_MIGRATORIO",
  "ENTORNO_FAMILIAR_RIESGO_MIGRATORIO",
];

export default function NexusClient({
  clienteId,
}: {
  clienteId: string;
}) {
  const [data, setData] =
    useState<NexusResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    fetch(`/api/nexus/cliente/${clienteId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();

          throw new Error(
            `Status ${res.status} ${text}`
          );
        }

        return res.json();
      })
      .then((json: NexusResponse) => {
        if (!mounted) return;

        setData(json);
      })
      .catch((err: unknown) => {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : String(err)
        );
      })
      .finally(() => {
        if (!mounted) return;

        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [clienteId]);

  if (loading) {
    return (
      <div className={styles.placeholder}>
        Cargando datos de NEXUS…
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        No se pudo obtener datos de NEXUS: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.error}>
        No hay datos disponibles para este cliente.
      </div>
    );
  }

  const goUsaScore =
    data.score.total != null
      ? `${data.score.total}%`
      : "Datos insuficientes";

  const motivoViaje =
    data.viaje?.motivo ?? "—";

  const proximaEntrevista =
    data.citas?.proximaEntrevista?.fechaHora
      ? new Date(
          data.citas.proximaEntrevista.fechaHora
        ).toLocaleString()
      : "No programada";

  const simulacro =
    data.citas?.simulacro?.fechaHora
      ? new Date(
          data.citas.simulacro.fechaHora
        ).toLocaleString()
      : "No programado";

  const estadoPago =
    data.pago?.aggregatedEstado ??
    (data.pago?.services &&
    data.pago.services.length === 1
      ? data.pago.services[0].estadoPago ??
        "—"
      : data.pago?.aggregatedNota ?? "—");

  const actividadPendiente =
    data.actividadPendiente ? "Ver" : "—";

  const items = [
    {
      key: "historial",
      label: "Historial",
      content: (
        <HistorialTab
          historial={data.historial}
        />
      ),
    },
    {
      key: "eventos",
      label: "Eventos",
      content: (
        <div className={styles.placeholder}>
          Eventos — sin UI en Fase 1
        </div>
      ),
    },
    {
      key: "ajustes",
      label: "Ajustes",
      content: (
        <div className={styles.placeholder}>
          Ajustes — sin UI en Fase 1
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <NexusHeader data={data} />

      <div className={styles.summaryRow}>
        <SummaryCard
          title="GO USA Score"
          value={goUsaScore}
          description={
            data.score.total == null
              ? "NEXUS aún no tiene cobertura suficiente para publicar un porcentaje global."
              : undefined
          }
        />

        <SummaryCard
          title="Motivo de viaje"
          value={motivoViaje}
        />

        <SummaryCard
          title="Próxima entrevista"
          value={proximaEntrevista}
        />

        <SummaryCard
          title="Simulacro"
          value={simulacro}
        />

        <SummaryCard
          title="Estado de pago"
          value={estadoPago}
        />

        <SummaryCard
          title="Actividad pendiente"
          value={actividadPendiente}
        />
      </div>

      <section className="mt-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">
            Motores GO USA Score
          </h3>

          <p className="text-sm text-muted-foreground">
            Los motores muestran únicamente la información
            que NEXUS puede evaluar con los datos registrados
            actualmente. Un dato faltante no se interpreta
            como cero.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MOTOR_ORDER.map((key) => {
            const score =
              data.score.motores[key];

            return (
              <div
                key={key}
                className="rounded-lg border bg-card p-4"
              >
                <div className="text-sm text-muted-foreground">
                  {MOTOR_LABELS[key]}
                </div>

                <div className="mt-1 text-xl font-semibold">
                  {score != null
                    ? `${score} / ${MOTOR_MAX[key]}`
                    : "—"}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {score != null
                    ? "Evaluación preliminar disponible"
                    : "Información insuficiente para evaluar"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6">
        <Tabs items={items} />
      </div>
    </div>
  );
}
