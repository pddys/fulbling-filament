import styles from "./style.module.css";

export function Frame() {
  return (
    <header className={`frame ${styles.frame}`}>
      <h1 className={styles.frame__title}>Infinite Canvas</h1>
      <div className={styles.frame__credits}>
      </div>
      <nav className={styles.frame__tags}>

      </nav>
    </header>
  );
}
