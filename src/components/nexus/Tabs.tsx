"use client";

import React, { useState } from "react";
import styles from "./nexus.module.css";

export type TabItem = {
  key: string;
  label: string;
  content: React.ReactNode;
};

export default function Tabs({ items }: { items: TabItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.tabs}>
      <nav className={styles.tabList} role="tablist" aria-label="Nexus tabs">
        {items.map((it, idx) => (
          <button
            key={it.key}
            role="tab"
            aria-selected={activeIndex === idx}
            className={
              activeIndex === idx
                ? `${styles.tabButton} ${styles.tabButtonActive}`
                : styles.tabButton
            }
            onClick={() => setActiveIndex(idx)}
            type="button"
          >
            {it.label}
          </button>
        ))}
      </nav>

      <div className={styles.tabPanel}>
        {items.map((it, idx) =>
          idx === activeIndex ? (
            <div key={it.key} role="tabpanel" className={styles.tabContent}>
              {it.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
