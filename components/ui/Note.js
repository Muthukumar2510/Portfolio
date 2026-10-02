import styles from './Note.module.css';

// A handwritten margin note with a hand-drawn arrow. Text comes from content/notes.js.
// point: where the arrow aims ('left' | 'right' | 'up' | 'down'). The arrow is decorative; the words are read out.
export default function Note({ children, point = 'right', className = '' }) {
  if (!children) return null;
  return (
    <p className={`${styles.note} ${styles[point]} ${className}`}>
      <span className={styles.text}>{children}</span>
      <svg className={styles.arrow} viewBox="0 0 64 40" aria-hidden="true" focusable="false">
        <path d="M4 30 C 18 8, 40 6, 56 18" />
        <path d="M46 10 L 57 18 L 45 24" />
      </svg>
    </p>
  );
}
