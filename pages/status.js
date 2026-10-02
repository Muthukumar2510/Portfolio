import ListPage from '../components/layout/ListPage';
import useStatus, { fmtPct } from '../lib/useStatus';
import { getSiteData } from '../lib/content';
import profile from '../content/profile';
import Sparkline from '../components/ui/Sparkline';
import styles from '../styles/pages/StatusPage.module.css';

function dayTone(u) {
  if (u == null) return styles.none;
  if (u >= 99.9) return styles.good;
  if (u >= 95) return styles.warn;
  return styles.bad;
}

function duration(ms) {
  const m = Math.max(1, Math.round(ms / 60000));
  return m < 60 ? `${m} min` : `${(m / 60).toFixed(1)} h`;
}

export default function StatusPage() {
  const s = useStatus();
  const repo = `https://github.com/${profile.repo}`;

  return (
    <ListPage
      title="Status"
      intro="This site is monitored like production. A scheduled job checks it every 15 minutes from outside, and the results below are what it recorded."
    >
      {!s ? (
        <p className={styles.muted}>Loading…</p>
      ) : s.status === 'unknown' || !s.total ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Monitoring isn&apos;t connected yet.</p>
          <p className={styles.muted}>
            Set the <code>SITE_URL</code> variable and the Upstash secrets in the repository settings, and the{' '}
            <a href={`${repo}/actions/workflows/monitor.yml`}>Monitor workflow</a> starts recording checks.
          </p>
        </div>
      ) : (
        <>
          <div className={`${styles.banner} ${s.status === 'operational' ? styles.bannerOk : styles.bannerBad}`}>
            <span className={styles.dot} aria-hidden="true" />
            {s.status === 'operational' ? 'All systems operational' : 'Site is currently failing checks'}
            {s.lastCheck && (
              <span className={styles.last} suppressHydrationWarning>
                last check {new Date(s.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <dl className={styles.kpis}>
            {[
              ['24 hours', fmtPct(s.uptime.d1)],
              ['7 days', fmtPct(s.uptime.d7)],
              ['30 days', fmtPct(s.uptime.d30)],
              ['90 days', fmtPct(s.uptime.d90)],
              ['p50 response', s.latency.p50 != null ? `${s.latency.p50} ms` : '—'],
              ['p95 response', s.latency.p95 != null ? `${s.latency.p95} ms` : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <section className={styles.block}>
            <h2 className={styles.h2}>Uptime, last 90 days</h2>
            <div className={styles.bars}>
              {s.days.map((d) => (
                <span key={d.date} className={`${styles.bar} ${dayTone(d.uptime)}`} title={`${d.date}: ${d.uptime == null ? 'no data' : fmtPct(d.uptime)}`} />
              ))}
            </div>
            <div className={styles.axis}>
              <span>90 days ago</span>
              <span>today</span>
            </div>
          </section>

          <section className={styles.block}>
            <h2 className={styles.h2}>Response time, last 24 hours</h2>
            <Sparkline values={s.spark} />
          </section>

          <section className={styles.block}>
            <h2 className={styles.h2}>Incidents</h2>
            {s.incidents.length ? (
              <ul className={styles.incidents}>
                {s.incidents.map((i) => (
                  <li key={i.start} suppressHydrationWarning>
                    <span className={i.resolved ? styles.resolved : styles.open}>{i.resolved ? 'resolved' : 'ongoing'}</span>
                    <span>{new Date(i.start).toLocaleString()}</span>
                    <span className={styles.muted}>
                      {i.checks} failed check{i.checks > 1 ? 's' : ''} · {duration((i.resolved || Date.now()) - i.start)} · {i.code}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No incidents recorded.</p>
            )}
          </section>
        </>
      )}

      <section className={styles.block}>
        <h2 className={styles.h2}>How this works</h2>
        <ol className={styles.how}>
          <li>
            A GitHub Actions <a href={`${repo}/blob/main/.github/workflows/monitor.yml`}>cron job</a> requests the home page and an API route every 15 minutes.
          </li>
          <li>Each result (status code, response time) is pushed to a capped list in Upstash Redis: 90 days, then the oldest drop off.</li>
          <li>This page and the status bar read a summary from <code>/api/status</code>. A failed check fails the workflow, which emails me.</li>
        </ol>
      </section>
    </ListPage>
  );
}

export function getStaticProps() {
  return { props: { site: getSiteData() } };
}
