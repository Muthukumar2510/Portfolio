import styles from './StatusDot.module.css';

// status: 'live' | 'building' | 'archived'
export default function StatusDot({ status }) {
  return (
    <span className={styles.wrap}>
      <span className={`${styles.dot} ${styles[status] || ''}`} aria-hidden="true" />
      {status}
    </span>
  );
}
