import styles from './Backdrop.module.css';

// Page background: engineering grid paper (minor and major lines) with a fine grain. Static CSS, no animation cost.
export default function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={styles.grid} />
      <span className={styles.grain} />
    </div>
  );
}
