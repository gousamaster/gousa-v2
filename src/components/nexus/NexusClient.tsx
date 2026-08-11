import React from "react";
import NexusHeader from "@/components/nexus/NexusHeader";
import Tabs from "@/components/nexus/Tabs";
import SummaryCard from "@/components/nexus/SummaryCard";
import HistorialTab from "@/components/nexus/HistorialTab";
import styles from "./nexus.module.css";

export default function NexusClient({ clienteId }: { clienteId: string }) {
  // Placeholder: Reuse existing API/helpers to fetch real data when available.
  // For now show basic structure and placeholders so page compiles.

  const summaryItems = [
    { title: "Estado", value: "Activo" },
    { title: "Última sincronización", value: "—" },
    { title: "Errores", value: "0" },
  ];

  return (
    <div className={styles.container}>
      <NexusHeader clienteId={clienteId} />
      <div className={styles.summaryRow}>
        {summaryItems.map((item) => (
          <SummaryCard key={item.title} title={item.title} value={item.value} />
        ))}
      </div>
      <Tabs>
        <div label="Historial">
          <HistorialTab clienteId={clienteId} />
        </div>
        <div label="Eventos">
          <div className={styles.placeholder}>Eventos - en desarrollo</div>
        </div>
        <div label="Ajustes">
          <div className={styles.placeholder}>Ajustes - en desarrollo</div>
        </div>
      </Tabs>
    </div>
  );
}
