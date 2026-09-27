import { useEffect, useRef, useState } from 'react';
import useVisitors from '../lib/useVisitors';
import styles from './VisitorChip.module.css';

export default function VisitorChip() {
  const stats = useVisitors();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!stats) return null;

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.chip}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${stats.total} visitors, ${stats.online} here now. Show details`}
      >
        <span className={styles.live} aria-hidden="true" />
        <span className={styles.num}>{stats.online}</span>
        <span className={styles.label}>here now</span>
      </button>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Visitor stats">
          <p className={styles.title}>Live traffic</p>
          <dl>
            <div>
              <dt>Here right now</dt>
              <dd className={styles.accent}>{stats.online.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Today</dt>
              <dd>{stats.today.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Last 7 days</dt>
              <dd>{stats.week.toLocaleString()}</dd>
            </div>
            <div>
              <dt>All time</dt>
              <dd>{stats.total.toLocaleString()}</dd>
            </div>
          </dl>
          <p className={styles.note}>Each browser counts once a day. No cookies, no tracking.</p>
        </div>
      )}
    </div>
  );
}
