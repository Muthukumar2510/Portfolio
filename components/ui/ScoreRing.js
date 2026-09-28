import styles from './ScoreRing.module.css';

// Lighthouse-style 0–100 score ring. size: 'md' | 'sm'.
export default function ScoreRing({ label, value, size = 'md' }) {
  const tone = value >= 90 ? styles.good : styles.warn;
  return (
    <div className={`${styles.score} ${styles[size]}`}>
      <span className={`${styles.ring} ${tone}`} style={{ '--v': value }} role="img" aria-label={`${label} ${value} out of 100`}>
        {value}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
