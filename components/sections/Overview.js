import Link from 'next/link';
import Image from 'next/image';
import skills from '../../content/skills';
import certifications from '../../content/certifications';
import costs from '../../content/costs';
import { useSite } from '../../lib/SiteContext';
import useStatus, { fmtPct } from '../../lib/useStatus';
import useVisitors from '../../lib/useVisitors';
import useQuality from '../../lib/useQuality';
import { formatDate } from '../../lib/format';
import BrandIcon, { brandFor } from '../ui/BrandIcon';
import ScoreRing from '../ui/ScoreRing';
import Sparkline from '../ui/Sparkline';
import ProjectCover from '../ProjectCover';
import styles from './Overview.module.css';

// A console-style dashboard: every tile is live or derived from content/, and links to the full view.
function Tile({ href, label, span = '', children }) {
  const cls = `${styles.tile} ${span ? styles[span] : ''}`;
  const head = (
    <span className={styles.head}>
      <span className={styles.label}>{label}</span>
      {href && (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      )}
    </span>
  );
  if (!href) {
    return (
      <div className={cls}>
        {head}
        {children}
      </div>
    );
  }
  const external = href.startsWith('/#');
  return external ? (
    <a href={href} className={cls} data-spotlight>
      {head}
      {children}
    </a>
  ) : (
    <Link href={href} className={cls} data-spotlight>
      {head}
      {children}
    </Link>
  );
}

export default function Overview() {
  const { projects, posts } = useSite();
  const status = useStatus();
  const visitors = useVisitors();
  const quality = useQuality();

  const project = projects.find((p) => p.featured) || projects[0];
  const post = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];
  const stack = [...new Set([...skills.flatMap((g) => g.items.map((i) => i.name)), ...projects.flatMap((p) => p.stack || [])])]
    .map((n) => brandFor(n))
    .filter(Boolean)
    .filter((b, i, all) => all.findIndex((x) => x.slug === b.slug) === i);
  const total = costs.services.reduce((n, s) => n + s.monthly, 0);
  const statusOk = status?.status === 'operational';

  return (
    <section id="overview" className={styles.section} aria-label="Overview">
      <div className="container">
        <div className={styles.grid}>
          <Tile href="/status" label="Uptime · 30 days" span="w2">
            {status?.total ? (
              <>
                <span className={styles.big}>
                  <span className={`${styles.pulse} ${statusOk ? styles.ok : styles.bad}`} aria-hidden="true" />
                  {fmtPct(status.uptime.d30)}
                </span>
                <Sparkline values={status.spark} size="sm" label="Response time, last 24 hours" />
              </>
            ) : (
              <p className={styles.muted}>{status ? 'Monitoring not connected yet.' : 'Checking…'}</p>
            )}
          </Tile>

          <Tile label="Visitors">
            {visitors ? (
              <>
                <span className={styles.big}>{visitors.online}</span>
                <span className={styles.muted}>
                  here now · {visitors.today.toLocaleString()} today
                </span>
              </>
            ) : (
              <p className={styles.muted}>Counter not connected yet.</p>
            )}
          </Tile>

          <Tile href="/#operations" label="Running cost">
            <span className={styles.big}>${total.toFixed(2)}</span>
            <span className={styles.muted}>per month, {costs.services.length} services</span>
          </Tile>

          {project && (
            <Tile href={`/projects/${project.slug}`} label="Featured project" span="w2h2">
              <div className={styles.cover}>
                <ProjectCover project={project} sizes="(max-width: 860px) 100vw, 480px" />
              </div>
              <span className={styles.title}>{project.title}</span>
              <span className={styles.muted}>{project.summary}</span>
            </Tile>
          )}

          {stack.length > 0 && (
            <Tile href="/#skills" label="Stack" span="w2">
              <ul className={styles.logos}>
                {stack.map((b) => (
                  <li key={b.slug} title={b.name}>
                    <BrandIcon slug={b.slug} title />
                  </li>
                ))}
              </ul>
            </Tile>
          )}

          {quality && (
            <Tile href="/#operations" label="Quality gates" span="w2">
              <div className={styles.rings}>
                <ScoreRing size="sm" label="Perf" value={quality.lighthouse.performance} />
                <ScoreRing size="sm" label="A11y" value={quality.lighthouse.accessibility} />
                <ScoreRing size="sm" label="Best" value={quality.lighthouse['best-practices']} />
                <ScoreRing size="sm" label="SEO" value={quality.lighthouse.seo} />
              </div>
            </Tile>
          )}

          {post && (
            <Tile href={`/writing/${post.slug}`} label={post.type === 'event' ? 'Latest event' : 'Latest post'} span="w2">
              <div className={styles.post}>
                {post.cover && (
                  <span className={styles.thumb}>
                    <Image src={post.cover.src} alt="" fill sizes="120px" />
                  </span>
                )}
                <span>
                  <span className={styles.title}>{post.title}</span>
                  <span className={styles.muted}>
                    {formatDate(post.date)}
                    {post.location && ` · ${post.location}`}
                  </span>
                </span>
              </div>
            </Tile>
          )}

          {certifications.length > 0 && (
            <Tile href="/#certifications" label="Certifications" span="w2">
              <ul className={styles.certs}>
                {certifications.slice(0, 4).map((c) => (
                  <li key={c.name}>
                    <BrandIcon name={brandFor(c.name) ? c.name : c.issuer} tint />
                    <span>{c.name}</span>
                  </li>
                ))}
              </ul>
            </Tile>
          )}
        </div>
      </div>
    </section>
  );
}
