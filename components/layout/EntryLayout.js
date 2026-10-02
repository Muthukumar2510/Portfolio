import Link from 'next/link';
import Image from 'next/image';
import Seo from './Seo';
import Gallery from '../media/Gallery';
import ProjectCover from '../media/ProjectCover';
import ArchitectureDiagram from '../media/ArchitectureDiagram';
import InfraMap from '../media/InfraMap';
import Blueprint from '../ui/Blueprint';
import { DIAGRAMS } from '../../content/diagrams';
import Button from '../ui/Button';
import { TagList } from '../ui/Tag';
import RepoStats from '../ui/RepoStats';
import { formatDate } from '../../lib/format';
import { articleJsonLd } from '../../lib/seo';
import styles from './EntryLayout.module.css';

const statusTone = { live: 'ok', building: 'warn', archived: 'off' };

const basePath = '/lab';
const TYPE_LABEL = { build: 'build', teardown: 'teardown', sketch: 'sketch', note: 'note' };

// A notebook entry. Builds lead with their cover, events with a photo collage, teardowns with their diagram
// (front matter `diagram:` names one in content/diagrams.js). `embed: trace` adds the live request trace.
export default function EntryLayout({ entry }) {
  const isProject = entry.type === 'build';
  const isEvent = Boolean(entry.event);
  const diagram = DIAGRAMS[entry.diagram];
  const facts = isProject
    ? [
        ['role', entry.role],
        ['duration', entry.duration],
        ['status', entry.status],
        ['shipped', formatDate(entry.date)],
      ]
    : [
        ['type', TYPE_LABEL[entry.type] || entry.type],
        ['date', formatDate(entry.date)],
        ['location', entry.location],
        [isEvent ? 'photos' : 'reading', isEvent ? entry.images.length || null : `${entry.readingMinutes} min`],
      ];

  return (
    <article className={styles.page}>
      <Seo
        title={entry.title}
        description={entry.summary}
        image={entry.cover?.src}
        type="article"
        jsonLd={articleJsonLd(entry, `${basePath}/${entry.slug}`)}
      />
      <div className={`container ${styles.narrow}`}>
        <Link href={basePath} className={styles.back}>
          ← Lab
        </Link>
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
            {entry.live && <Button href={entry.live}>Live site ↗</Button>}
            {entry.repo && (
              <Button href={entry.repo} variant="ghost">
                Source code ↗
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={`container ${styles.wide}`}>
        {diagram ? (
          <Blueprint diagram={diagram} />
        ) : isEvent ? (
          <Gallery images={entry.images} title={entry.title} album={entry.album} size="hero" />
        ) : isProject ? (
          <ProjectCover project={entry} sizes="(max-width: 1040px) 100vw, 1040px" />
        ) : (
          entry.cover && (
            <div className={styles.cover}>
              <Image src={entry.cover.src} alt="" fill priority sizes="(max-width: 1040px) 100vw, 1040px" {...(entry.cover.blur ? { placeholder: 'blur', blurDataURL: entry.cover.blur } : {})} />
            </div>
          )
        )}
      </div>

      <div className={`container ${styles.narrow}`}>
        <div className={styles.stack}>
          <TagList items={entry.stack} label="Tech stack" />
        </div>

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

        <RepoStats stats={entry.repoStats} full />

        {entry.architecture && <ArchitectureDiagram spec={entry.architecture} />}

        <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />

        {entry.embed === 'trace' && (
          <div className={styles.embed}>
            <InfraMap />
          </div>
        )}

        {!isEvent && <Gallery images={entry.images} title={entry.title} album={entry.album} />}

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
