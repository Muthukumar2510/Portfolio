import Link from 'next/link';
import { useSite } from '../../lib/SiteContext';
import Section from '../ui/Section';
import styles from './Building.module.css';

const ago = (iso) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
};

// What's on the bench: entries still in progress, plus the latest real commits to this site (build-time GitHub data).
// Renders nothing when there is neither.
export default function Building({ commits = [] }) {
  const { entries = [] } = useSite();
  const wip = entries.filter((e) => e.status === 'building');
  if (!wip.length && !commits.length) return null;
  return (
    <Section id="building" stage="none" title="On the bench" intro="Work in progress, and the last changes to this notebook itself.">
      <div className={styles.cols}>
        {wip.length > 0 && (
          <div>
            <h3 className={styles.h3}>In progress</h3>
            <ul className={styles.list}>
              {wip.map((e) => (
                <li key={e.slug}>
                  <Link href={`/lab/${e.slug}`}>{e.title}</Link>
                  <span className={styles.muted}>{e.summary}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {commits.length > 0 && (
          <div>
            <h3 className={styles.h3}>Recent commits</h3>
            <ul className={styles.list}>
              {commits.slice(0, 5).map((c) => (
                <li key={c.sha}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className={styles.sha}>
                    {c.sha}
                  </a>
                  <span>{c.message}</span>
                  {c.date && <span className={styles.muted}>{ago(c.date)}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
