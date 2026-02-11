import styles from "./style.module.css";

export function Frame() {
  return (
    <header className={`frame ${styles.frame}`}>
      <h1 className={styles.frame__title}>Infinite Canvas</h1>
      <div className={styles.frame__borders}>
        <div
          className={`${styles.frame__border} ${styles["frame__border--top-right"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--top-left"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--bottom-right"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--bottom-left"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--top-centre"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--bottom-centre"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--left-centre"]}`}
        ></div>
        <div
          className={`${styles.frame__border} ${styles["frame__border--right-centre"]}`}
        ></div>
        <div className={styles.frame__circle}></div>
      </div>
      <div className={styles.frame__credits}></div>
      <nav className={styles.frame__tags}></nav>
    </header>
  );
}
