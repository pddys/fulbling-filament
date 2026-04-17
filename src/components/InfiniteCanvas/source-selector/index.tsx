import * as React from "react";
import styles from "./style.module.css";

export type Source = {
  id: string;
  label: string;
  url: string;
};

type Props = {
  sources: Source[];
  selected: string;
  loading: boolean;
  onSelect: (id: string) => void;
};

export function SourceSelector({ sources, selected, loading, onSelect }: Props) {
  return (
    <div className={styles.panel}>
      {/* Mobile: native select */}
      <select
        className={styles.select}
        value={selected}
        disabled={loading}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Select source"
      >
        {sources.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      {/* Desktop: button list */}
      <div className={styles.list}>
        <div className={styles.title}>Source</div>
        {sources.map((s) => {
          const active = s.id === selected;
          return (
            <button
              key={s.id}
              className={`${styles.item} ${active ? styles.active : ""}`}
              onClick={() => onSelect(s.id)}
              disabled={loading && !active}
            >
              <span className={styles.bullet} />
              <span className={styles.label}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
