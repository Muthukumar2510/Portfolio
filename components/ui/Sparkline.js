import styles from './Sparkline.module.css';

const W = 600;
const H = 80;

// Area sparkline for a series with gaps (null = no data). size: 'md' (status page) | 'sm' (widgets).
export default function Sparkline({ values, label = 'Response time', size = 'md' }) {
  const pts = (values || []).map((v, i) => [i, v]).filter(([, v]) => v != null);
  if (pts.length < 2) return <p className={styles.empty}>Not enough data yet.</p>;
  const max = Math.max(...pts.map(([, v]) => v));
  const x = (i) => (i / (values.length - 1)) * W;
  const y = (v) => H - (v / max) * (H - 8) - 4;
  const d = pts.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`${styles.spark} ${styles[size]}`} preserveAspectRatio="none" role="img" aria-label={`${label}, peak ${max} ms`}>
      <path d={`${d} L${W},${H} L0,${H} Z`} className={styles.fill} />
      <path d={d} className={styles.line} />
    </svg>
  );
}
