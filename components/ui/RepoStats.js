import styles from './RepoStats.module.css';

function ago(iso) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d < 1) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  return `${Math.round(d / 30)}mo ago`;
}

// Build-time GitHub facts for a project. `full` adds the language bar (project pages).
export default function RepoStats({ stats, full = false }) {
  if (!stats) return null;
  return (
    <div className={`${styles.wrap} ${full ? styles.full : ''}`}>
      <ul className={styles.row} aria-label="Live repository stats">
        {stats.ci && (
          <li className={styles[stats.ci]}>
            <span className={styles.dot} aria-hidden="true" /> CI {stats.ci}
          </li>
        )}
        <li suppressHydrationWarning>pushed {ago(stats.pushedAt)}</li>
        <li>★ {stats.stars}</li>
        {full && <li>{stats.forks} forks</li>}
        {full && <li>{stats.openIssues} open issues</li>}
      </ul>
      {full && stats.languages.length > 0 && (
        <div className={styles.langs}>
          <div className={styles.bar} role="img" aria-label={stats.languages.map((l) => `${l.name} ${l.pct}%`).join(', ')}>
            {stats.languages.map((l, i) => (
              <span key={l.name} className={styles[`l${i}`]} style={{ width: `${l.pct}%` }} />
            ))}
          </div>
          <ul className={styles.legend}>
            {stats.languages.map((l, i) => (
              <li key={l.name}>
                <span className={`${styles.swatch} ${styles[`l${i}`]}`} aria-hidden="true" />
                {l.name} {l.pct}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
