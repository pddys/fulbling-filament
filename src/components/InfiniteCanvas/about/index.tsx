import * as React from "react";
import styles from "./style.module.css";

export function AboutModal() {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };

  return (
    <>
      <button className={styles.trigger} onClick={open} aria-label="About">
        ABOUT
      </button>

      <dialog ref={dialogRef} className={styles.dialog} onClick={handleBackdropClick}>
        <div className={styles.panel}>
          <div className={`${styles.corner} ${styles.tl}`} />
          <div className={`${styles.corner} ${styles.tr}`} />
          <div className={`${styles.corner} ${styles.bl}`} />
          <div className={`${styles.corner} ${styles.br}`} />

          <div className={styles.panelTitle}>INFINITE CANVAS</div>
          <div className={styles.divider} />

          <p className={styles.body}>
            A procedurally generated gallery of 215 works rendered across an
            infinite three-dimensional plane. Navigate freely — there is no
            boundary.
          </p>

          <div className={styles.divider} />
          <div className={styles.sectionTitle}>NAVIGATION</div>
          <div className={styles.divider} />

          <div className={styles.dataRow}>
            <span className={styles.lbl}>DRAG / WASD</span>
            <span className={styles.val}>PAN</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>SCROLL</span>
            <span className={styles.val}>ZOOM</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>Q / E</span>
            <span className={styles.val}>ALTITUDE</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>PINCH</span>
            <span className={styles.val}>ZOOM (TOUCH)</span>
          </div>

          <div className={styles.divider} />

          <button className={styles.closeBtn} onClick={close}>
            CLOSE
          </button>
        </div>
      </dialog>
    </>
  );
}
