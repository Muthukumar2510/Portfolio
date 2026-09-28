import { useState } from 'react';
import profile from '../../content/profile';
import costs from '../../content/costs';
import useVisitors from '../../lib/useVisitors';
import useQuality from '../../lib/useQuality';
import Section from '../ui/Section';
import InfraMap from '../InfraMap';
import StatusBar from '../StatusBar';
import ScoreRing from '../ui/ScoreRing';
import BrandIcon from '../ui/BrandIcon';
import styles from './Operations.module.css';

// Rough Redis commands: ~30 per visit (count + heartbeats + trace) plus 2 per uptime check (96/day).
const CMDS_PER_VISIT = 30;
const MONITOR_CMDS_PER_MONTH = 2 * 96 * 30;

function rel(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Quality() {
  const q = useQuality();
  const repo = `https://github.com/${profile.repo}`;

  return (
    <div className={styles.card}>
      <h3 className={styles.h3}>Quality gates</h3>
      <p className={styles.note}>Every pull request must pass these before it can merge. Scores are from the latest run on main.</p>
      {q === undefined ? (
        <p className={styles.note}>Loading…</p>
      ) : !q ? (
        <p className={styles.note}>
          Results appear after the first <a href={`${repo}/actions/workflows/quality.yml`}>Quality workflow</a> run on main.
        </p>
      ) : (
        <>
          <div className={styles.scores}>
            <ScoreRing label="Performance" value={q.lighthouse.performance} />
            <ScoreRing label="Accessibility" value={q.lighthouse.accessibility} />
            <ScoreRing label="Best practices" value={q.lighthouse['best-practices']} />
            <ScoreRing label="SEO" value={q.lighthouse.seo} />
          </div>
          <ul className={styles.facts}>
            <li>
              Security headers <strong>{q.headers.present}/{q.headers.total}</strong>
            </li>
            <li>
              Broken links <strong>{q.links.broken}</strong> of {q.links.checked}
            </li>
            <li suppressHydrationWarning>
              Checked {rel(q.t)} on <a href={`${repo}/commit/${q.commit}`}>{q.commit}</a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

function Costs() {
  const visitors = useVisitors();
  const total = costs.services.reduce((n, s) => n + s.monthly, 0);
  const usage = {
    redisCommands: visitors?.week != null ? Math.round((visitors.week * 30) / 7) * CMDS_PER_VISIT + MONITOR_CMDS_PER_MONTH : null,
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.h3}>What it costs to run</h3>
      <p className={styles.total}>
        ${total.toFixed(2)}
        <span> / month</span>
      </p>
      <ul className={styles.services}>
        {costs.services.map((s) => {
          const used = s.usageKey ? usage[s.usageKey] : null;
          const pct = used != null && s.freeLimit ? Math.min(100, (used / s.freeLimit) * 100) : null;
          return (
            <li key={s.name}>
              <div className={styles.serviceHead}>
                <span className={styles.serviceName}>
                  <BrandIcon name={s.name} tint />
                  {s.name}
                </span>
                <span className={styles.plan}>
                  {s.plan} · ${s.monthly}
                </span>
              </div>
              <span className={styles.note}>{s.role}</span>
              {pct != null && (
                <span className={styles.usage}>
                  <span className={styles.usageBar}>
                    <span style={{ width: `${Math.max(pct, 1)}%` }} />
                  </span>
                  ≈ {pct < 1 ? '<1' : Math.round(pct)}% of free tier
                </span>
              )}
              <span className={styles.limit}>{s.limit}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// "How this site runs": quality gates, running costs and real commits, i.e. the site's own ops dashboard.
export default function Operations({ commits }) {
  const [trace, setTrace] = useState(null);
  const edge = trace?.edge?.name && trace.edge.name !== 'local' ? trace.edge.name : null;
  return (
    <Section
      stage="none"
      id="operations"
      title="How this site runs"
      intro="The same practices I use at work, applied to this site: gated CI, measured quality, known costs, and small, reviewed changes."
    >
      <div className={styles.trace}>
        <h3 className={styles.h3}>Your request, traced live</h3>
        <p className={styles.note}>
          {edge ? (
            <>
              It entered through <strong>{edge}</strong>
              {trace?.rtt != null && <> in {trace.rtt} ms</>}.{' '}
            </>
          ) : (
            'The path this page took to reach you, measured live. '
          )}
          Hover over any part to see what it does and why it&apos;s built that way.
        </p>
        <InfraMap onTrace={setTrace} />
        <StatusBar trace={trace} />
      </div>
      <div className={styles.grid}>
        <Quality />
        <Costs />
      </div>
      {commits?.length > 0 && (
        <div className={styles.commits}>
          <h3 className={styles.h3}>Recent changes</h3>
          <ol className={styles.list}>
            {commits.map((c) => (
              <li key={c.sha} className={styles.item}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className={styles.sha}>
                  {c.sha}
                </a>
                <span className={styles.msg}>{c.message}</span>
                <time className={styles.when} dateTime={c.date} suppressHydrationWarning>
                  {rel(c.date)}
                </time>
              </li>
            ))}
          </ol>
          <a href={`https://github.com/${profile.repo}`} target="_blank" rel="noopener noreferrer" className={styles.repo}>
            View the source on GitHub ↗
          </a>
        </div>
      )}
    </Section>
  );
}
