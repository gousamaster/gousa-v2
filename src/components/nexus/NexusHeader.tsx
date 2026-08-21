"use client";

import React from "react";
import { Activity, BriefcaseBusiness, ShieldCheck, Sparkles } from "lucide-react";
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
      <div className={styles.headerBrandBlock}>
        <div className={styles.brandIcon}><Sparkles size={22} /></div>
        <div>
          <div className={styles.brandEyebrow}>GO USA · INTELIGENCIA OPERATIVA</div>
          <h1 className={styles.title}>NEXUS</h1>
          <p className={styles.subtitle}>Centro de seguimiento, evaluación y preparación del cliente</p>
        </div>
      </div>

      <div className={styles.statusStrip}>
        <span className={styles.statusPill}><Activity size={14}/><strong>Estado</strong> {estadoTramite}</span>
        <span className={styles.statusPill}><ShieldCheck size={14}/><strong>DS-160</strong> {codigoDs160}</span>
      </div>

      <div className={styles.identityGrid}>
        <div className={styles.identityItem}><span className={styles.identityLabel}>Cliente</span><span className={styles.identityValue}>{clienteNombre}</span></div>
        <div className={styles.identityItem}><span className={styles.identityLabel}>Perfil</span><span className={styles.identityValue}>{tipoCliente}</span></div>
        <div className={styles.identityItem}><span className={styles.identityLabel}>Asesor responsable</span><span className={styles.identityValue}><BriefcaseBusiness size={14}/>{asesor}</span></div>
      </div>
    </header>
  );
}
