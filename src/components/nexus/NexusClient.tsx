"use client";

import React, { useEffect, useState } from "react";
import type { NexusResponse } from "@/types/nexus";
import NexusHeader from "@/components/nexus/NexusHeader";
import SummaryCard from "@/components/nexus/SummaryCard";
import Tabs from "@/components/nexus/Tabs";
import HistorialTab from "@/components/nexus/HistorialTab";
import styles from "./nexus.module.css";

export default function NexusClient({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState<NexusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/nexus/cliente/${clienteId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((json: NexusResponse) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
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
    return <div className={styles.placeholder}>Cargando datos de NEXUS…</div>;
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

  const goUsaScore = "—";
  const motivoViaje = data.viaje?.motivo ?? "—";
  const proximaEntrevista = data.citas?.proximaEntrevista?.fechaHora
    ? new Date(data.citas.proximaEntrevista.fechaHora).toLocaleString()
    : "No programada";
  const simulacro = data.citas?.simulacro?.fechaHora
    ? new Date(data.citas.simulacro.fechaHora).toLocaleString()
    : "No programado";

  const estadoPago =
    data.pago?.aggregatedEstado ??
    (data.pago?.services && data.pago.services.length === 1
      ? data.pago.services[0].estadoPago ?? "—"
      : data.pago?.aggregatedNota ?? "—");

  const actividadPendiente = data.actividadPendiente ? "Ver" : "—";

  const items = [
    { key: "historial", label: "Historial", content: <HistorialTab historial={data.historial} /> },
    { key: "eventos", label: "Eventos", content: <div className={styles.placeholder}>Eventos — sin UI en Fase 1</div> },
    { key: "ajustes", label: "Ajustes", content: <div className={styles.placeholder}>Ajustes — sin UI en Fase 1</div> },
  ];

  return (
    <div className={styles.container}>
      <NexusHeader data={data} />

      <div className={styles.summaryRow}>
        <SummaryCard title="GO USA Score" value={goUsaScore} />
        <SummaryCard title="Motivo de viaje" value={motivoViaje} />
        <SummaryCard title="Próxima entrevista" value={proximaEntrevista} />
        <SummaryCard title="Simulacro" value={simulacro} />
        <SummaryCard title="Estado de pago" value={estadoPago} />
        <SummaryCard title="Actividad pendiente" value={actividadPendiente} />
      </div>

      <Tabs items={items} />
    </div>
  );
}
