import Link from 'next/link';
import Section from '../ui/Section';
import Gallery from '../Gallery';
import { formatDate } from '../../lib/format';
import styles from './Moments.module.css';

// Big-picture photo section: the newest event gets a full-width collage, older ones a strip of albums.
export default function Moments({ moments }) {
  if (!moments?.length) return null;
  const [lead, ...rest] = moments;

  return (
    <Section id="moments" title="Moments" intro="Events, talks and people. The part of the work that doesn't fit in a repo." wide>
      <article className={styles.lead}>
        <header className={styles.leadHead}>
          <div>
            <p className={styles.meta}>
              {formatDate(lead.date)}
              {lead.location && ` · ${lead.location}`}
            </p>
            <h3 className={styles.leadTitle}>
              <Link href={`/writing/${lead.slug}`}>{lead.title}</Link>
            </h3>
          </div>
          <Link href={`/writing/${lead.slug}`} className={styles.readMore}>
            Read the story →
          </Link>
        </header>
        {lead.preview.length > 0 ? (
          <Gallery images={lead.preview} total={lead.imageCount} title={lead.title} album={lead.album} size="hero" moreHref={`/writing/${lead.slug}`} />
        ) : (
          <EmptyAlbum slug={lead.slug} album={lead.album} />
        )}
      </article>

      {rest.length > 0 && (
        <ul className={styles.strip}>
          {rest.map((m) => (
            <li key={m.slug}>
              <Link href={`/writing/${m.slug}`} className={styles.album}>
                <span className={styles.albumStack} aria-hidden="true">
                  {(m.preview.length ? m.preview.slice(0, 3) : [null]).map((img, i) => (
                    <span key={i} style={img ? { backgroundImage: `url(${img.src})` } : undefined} />
                  ))}
                </span>
                <span className={styles.albumTitle}>{m.title}</span>
                <span className={styles.meta}>
                  {formatDate(m.date)} · {m.imageCount} photos
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function EmptyAlbum({ slug, album }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyGrid} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className={styles.emptyText}>
        <p>Photos go here.</p>
        <code>public/media/posts/{slug}/</code>
        {album && (
          <a href={album} target="_blank" rel="noopener noreferrer">
            View the album on Google Photos ↗
          </a>
        )}
      </div>
    </div>
  );
}
