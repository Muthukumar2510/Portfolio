import Link from 'next/link';
import Image from 'next/image';
import { useSite } from '../../lib/SiteContext';
import { formatDate } from '../../lib/format';
import styles from './Sections.module.css';

export default function Writing() {
  const { posts } = useSite();
  if (!posts.length) return null;
  return (
    <section id="writing" className="section">
      <div className="container reveal">
        <p className="section-label">$ tail -f journal.log</p>
        <h2 className="section-title">Writing &amp; events</h2>
        <ul className={styles.posts}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}`} className={styles.post}>
                <span className={styles.postThumb}>
                  {p.cover ? (
                    <Image src={p.cover} alt="" fill sizes="96px" />
                  ) : (
                    <span className={styles.postGlyph}>{p.type === 'event' ? '◆' : '¶'}</span>
                  )}
                </span>
                <span className={styles.postText}>
                  <span className={styles.postMeta}>
                    <span className={styles.tag}>{p.type}</span>
                    {formatDate(p.date)}
                    {p.location && <> · {p.location}</>}
                    {p.imageCount > 0 && <> · {p.imageCount} photos</>}
                  </span>
                  <span className={styles.postTitle}>{p.title}</span>
                  <span className={styles.muted}>{p.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
