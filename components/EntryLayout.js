import Link from 'next/link';
import Image from 'next/image';
import Seo from './Seo';
import Gallery from './Gallery';
import ProjectCover from './ProjectCover';
import { formatDate } from '../lib/format';
import styles from './EntryLayout.module.css';

const statusTone = { live: 'ok', building: 'warn', archived: 'off' };

export default function EntryLayout({ entry, basePath, backLabel }) {
  const isProject = entry.collection === 'projects';
  const facts = isProject
    ? [
        ['role', entry.role],
        ['duration', entry.duration],
        ['status', entry.status],
        ['shipped', formatDate(entry.date)],
      ]
    : [
        ['type', entry.type],
        ['date', formatDate(entry.date)],
        ['location', entry.location],
      ];

  return (
    <article className={styles.page}>
      <Seo title={entry.title} description={entry.summary} image={entry.cover || undefined} />
      <div className={`container ${styles.narrow}`}>
        <Link href={`/#${basePath.slice(1)}`} className={styles.back}>
          ← {backLabel}
        </Link>
        <p className="section-label">$ cat {entry.collection}/{entry.slug}.md</p>
        <h1 className={styles.title}>{entry.title}</h1>
        {entry.summary && <p className={styles.summary}>{entry.summary}</p>}

        <dl className={styles.facts}>
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className={k === 'status' ? styles[statusTone[v]] : ''}>{v}</dd>
              </div>
            ))}
        </dl>

        {(entry.repo || entry.live) && (
          <div className={styles.links}>
            {entry.live && (
              <a href={entry.live} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                Live site ↗
              </a>
            )}
            {entry.repo && (
              <a href={entry.repo} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
                Source code ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className={`container ${styles.wide}`}>
        {isProject ? (
          <ProjectCover project={entry} sizes="(max-width: 1040px) 100vw, 1040px" />
        ) : (
          entry.cover && (
            <div className={styles.cover}>
              <Image src={entry.cover} alt="" fill priority sizes="(max-width: 1040px) 100vw, 1040px" />
            </div>
          )
        )}
      </div>

      <div className={`container ${styles.narrow}`}>
        {entry.stack?.length > 0 && (
          <ul className={styles.stack} aria-label="Tech stack">
            {entry.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        {entry.metrics?.length > 0 && (
          <div className={styles.metrics}>
            {entry.metrics.map((m) => (
              <div key={m.label} className={styles.metric}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />

        <Gallery images={entry.images} title={entry.title} album={entry.album} />

        <nav className={styles.pager} aria-label="More">
          {entry.prev ? (
            <Link href={`${basePath}/${entry.prev.slug}`}>
              <span>← Previous</span>
              {entry.prev.title}
            </Link>
          ) : (
            <span />
          )}
          {entry.next && (
            <Link href={`${basePath}/${entry.next.slug}`} className={styles.next}>
              <span>Next →</span>
              {entry.next.title}
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
