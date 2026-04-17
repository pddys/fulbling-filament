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
        About
      </button>

      <dialog ref={dialogRef} className={styles.dialog} onClick={handleBackdropClick}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.panelTitle}>Infinite Canvas</div>
            <button className={styles.closeBtn} onClick={close} aria-label="Close">✕</button>
          </div>

          <p className={styles.body}>
            A procedurally generated gallery of 215 works rendered across an
            infinite three-dimensional plane. Navigate freely — there is no
            boundary.
          </p>

          <div className={styles.divider} />
          <div className={styles.sectionTitle}>Navigation</div>

          <div className={styles.dataRow}>
            <span className={styles.lbl}>Drag / WASD</span>
            <span className={styles.val}>Pan</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>Scroll</span>
            <span className={styles.val}>Zoom</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>Q / E</span>
            <span className={styles.val}>Altitude</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>Pinch</span>
            <span className={styles.val}>Zoom (touch)</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
