import Link from 'next/link';
import ListPage from '../components/layout/ListPage';
import { getSiteData } from '../lib/content';
import { getLogbook } from '../lib/logbook';
import styles from '../styles/pages/LogPage.module.css';

const MARK = { commit: 'commit', build: 'build', teardown: 'teardown', sketch: 'sketch', note: 'note', design: 'design' };
const monthName = (key) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// The logbook: every change to this notebook, assembled at build time from commits, entries and design decisions.
export default function Log({ log }) {
  return (
    <ListPage
      title="Log"
      intro="Every change to this notebook, newest first. It writes itself on each build from the repository, the Lab and the design journal."
    >
      {log.months.length === 0 && <p className={styles.empty}>Nothing logged yet (GitHub may be unreachable during this build).</p>}
      {log.months.map((m) => (
        <section key={m.key} className={styles.month} aria-label={monthName(m.key)}>
          <h2 className={styles.h2}>{monthName(m.key)}</h2>
          <ol className={styles.list}>
            {m.items.map((i, n) => (
              <li key={`${i.kind}-${i.href}-${n}`} className={styles.item}>
                <time dateTime={i.date} className={styles.date}>
                  {i.date.slice(8)}
                </time>
                <span className={`${styles.kind} ${styles[i.kind] || ''}`}>{MARK[i.kind] || i.kind}</span>
                {i.kind === 'commit' ? (
                  <a href={i.href} target="_blank" rel="noopener noreferrer" className={styles.title}>
                    {i.title} <span className={styles.sha}>{i.sha}</span>
                  </a>
                ) : (
                  <Link href={i.href} className={styles.title}>
                    {i.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </ListPage>
  );
}

export async function getStaticProps() {
  return { props: { site: getSiteData(), log: await getLogbook() }, revalidate: 3600 };
}
