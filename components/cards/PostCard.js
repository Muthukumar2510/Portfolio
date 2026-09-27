import Link from 'next/link';
import Image from 'next/image';
import { Tag } from '../ui/Tag';
import { formatDate } from '../../lib/format';
import styles from './PostCard.module.css';

// Blog posts and events share one card; events show their photo count, blogs their reading time.
export default function PostCard({ post: p }) {
  return (
    <Link href={`/writing/${p.slug}`} className={styles.card} data-spotlight>
      <span className={styles.thumb}>
        {p.cover ? (
          <Image src={p.cover.src} alt="" fill sizes="(max-width: 600px) 100vw, 320px" {...(p.cover.blur ? { placeholder: 'blur', blurDataURL: p.cover.blur } : {})} />
        ) : (
          <span className={styles.glyph} aria-hidden="true">
            {p.type === 'event' ? '◆' : '¶'}
          </span>
        )}
      </span>
      <span className={styles.body}>
        <span className={styles.meta}>
          <Tag tone="accent">{p.type}</Tag>
          <span>{formatDate(p.date)}</span>
          {p.location && <span>· {p.location}</span>}
          {p.type === 'event' && p.imageCount > 0 && <span>· {p.imageCount} photos</span>}
          {p.type !== 'event' && <span>· {p.readingMinutes} min read</span>}
        </span>
        <span className={styles.title}>{p.title}</span>
        <span className={styles.summary}>{p.summary}</span>
      </span>
    </Link>
  );
}
