import styles from './Backdrop.module.css';

// Page background: slow-drifting colour glows plus a fine grain. Pure CSS (GPU-composited transforms only).
// Their tint follows the section in view via <html data-scene="…">, which StoryField sets on the home page.
export default function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={`${styles.glow} ${styles.a}`} />
      <span className={`${styles.glow} ${styles.b}`} />
      <span className={`${styles.glow} ${styles.c}`} />
      <span className={styles.grain} />
    </div>
  );
}
