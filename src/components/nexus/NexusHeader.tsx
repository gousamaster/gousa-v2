"use client";

import React from "react";
import type { NexusResponse } from "@/types/nexus";
import styles from "./nexus.module.css";

export default function NexusHeader({ data }: { data: NexusResponse }) {
  const clienteNombre = data.cliente?.nombreCompleto ?? "—";
  const tipoCliente = data.cliente?.tipoCliente ?? "—";
  const asesor = data.asesor?.nombre ?? "—";
  const estadoTramite = data.tramite?.estado ?? "—";
  const codigoDs160 = data.tramite?.codigoConfirmacionDs160 ?? "—";

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>NEXUS</h1>
        <div className={styles.headerMeta}>
          <span className={styles.metaItem}><strong>Cliente:</strong> {clienteNombre}</span>
          <span className={styles.metaItem}><strong>Tipo:</strong> {tipoCliente}</span>
          <span className={styles.metaItem}><strong>Asesor:</strong> {asesor}</span>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.metaSmall}><strong>Estado trámite:</strong> {estadoTramite}</div>
        <div className={styles.metaSmall}><strong>DS-160:</strong> {codigoDs160}</div>
      </div>
    </header>
  );
}
