"use client";

import React from "react";
import styles from "./nexus.module.css";

export default function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
      {description && <div className={styles.cardDesc}>{description}</div>}
    </div>
  );
}
