import styles from './Backdrop.module.css';

// Page background: two soft, static colour glows (radial gradients, no blur, no animation loop).
// Their tint cross-fades to the section in view via <html data-scene="…"> (set by lib/useScene.js on the home page).
export default function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={`${styles.glow} ${styles.a}`} />
      <span className={`${styles.glow} ${styles.b}`} />
    </div>
  );
}
