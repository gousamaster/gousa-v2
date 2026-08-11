"use client";

import React from "react";
import type { HistorialItem } from "@/types/nexus";
import styles from "./nexus.module.css";

export default function HistorialTab({ historial }: { historial: HistorialItem[] }) {
  if (!historial || historial.length === 0) {
    return <div className={styles.placeholder}>No hay actividad registrada todavía.</div>;
  }

  return (
    <section className={styles.historial}>
      <h2 className={styles.sectionTitle}>Historial</h2>
      <ul className={styles.historialList}>
        {historial.map((h) => (
          <li key={h.id} className={styles.historialItem}>
            <div className={styles.historialFecha}>
              {h.fechaHora ? new Date(h.fechaHora).toLocaleString() : "—"}
            </div>
            <div className={styles.historialEvento}>
              <div className={styles.historialEstado}>{h.estado ?? "—"}</div>
              {h.usuario && <div className={styles.historialUsuario}>Por: {h.usuario.nombre ?? "—"}</div>}
              {h.observacion && <div className={styles.historialObs}>{h.observacion}</div>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
