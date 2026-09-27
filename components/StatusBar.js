import { useEffect, useState } from 'react';
import styles from './StatusBar.module.css';

const commit = process.env.NEXT_PUBLIC_COMMIT;
const builtAt = process.env.NEXT_PUBLIC_BUILD_TIME;
const repo = process.env.NEXT_PUBLIC_REPO_URL;

function rel(iso, now) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}

export default function StatusBar({ trace }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { k: 'status', v: 'All systems operational', ok: true },
    trace?.rtt != null && { k: 'latency', v: `${trace.rtt} ms` },
    trace?.edge && { k: 'edge', v: trace.edge.code ? `${trace.edge.name} (${trace.edge.code})` : trace.edge.name },
    now && builtAt && { k: 'deployed', v: rel(builtAt, now) },
    commit && { k: 'build', v: commit, href: repo && commit !== 'local' ? `${repo}/commit/${commit}` : null },
  ].filter(Boolean);

  return (
    <div className={styles.bar} role="status" aria-label="Live site status">
      <div className={`container ${styles.inner}`}>
        {items.map((i) => (
          <span key={i.k} className={styles.item}>
            <span className={styles.key}>{i.k}</span>
            {i.href ? (
              <a href={i.href} target="_blank" rel="noopener noreferrer">
                {i.v}
              </a>
            ) : (
              <span className={i.ok ? styles.ok : ''}>
                {i.ok && <span className={styles.dot} aria-hidden="true" />}
                {i.v}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
