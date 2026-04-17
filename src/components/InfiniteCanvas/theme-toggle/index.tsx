import * as React from "react";
import styles from "./style.module.css";

export function ThemeToggle({
  theme,
  onToggle,
  showHud,
  onToggleHud,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
  showHud: boolean;
  onToggleHud: () => void;
}) {
  return (
    <div className={styles.controls}>
      <button className={styles.toggle} onClick={onToggle} aria-label="Toggle theme">
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
      <button className={styles.toggle} onClick={onToggleHud} aria-label="Toggle HUD">
        {showHud ? 'Hide HUD' : 'Show HUD'}
      </button>
    </div>
  );
}
