import Link from 'next/link';
import Image from 'next/image';
import { TagList } from '../ui/Tag';
import { formatDate } from '../../lib/format';
import styles from './EntryCard.module.css';

const STAMP = { build: 'BUILD', teardown: 'TEARDOWN', sketch: 'SKETCH', note: 'NOTE' };

// One notebook entry in a list (Lab, home page). The type stamp, title and summary carry it; a photo shows only
// when the entry has one, so cards never fake imagery.
export default function EntryCard({ entry: e }) {
  const metric = e.metrics?.[0];
  return (
    <Link href={`/lab/${e.slug}`} className={styles.card} data-spotlight>
      {e.cover && (
        <span className={styles.thumb}>
          <Image src={e.cover.src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" {...(e.cover.blur ? { placeholder: 'blur', blurDataURL: e.cover.blur } : {})} />
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.meta}>
          <span className={`${styles.stamp} ${styles[e.type] || ''}`}>{STAMP[e.type] || e.type}</span>
          <time dateTime={e.date}>{formatDate(e.date)}</time>
          {e.status && <span>· {e.status}</span>}
        </span>
        <span className={styles.title}>{e.title}</span>
        {e.summary && <span className={styles.summary}>{e.summary}</span>}
        {metric && (
          <span className={styles.metric}>
            <strong>{metric.value}</strong> {metric.label.toLowerCase()}
          </span>
        )}
        {e.stack?.length > 0 && <TagList items={e.stack.slice(0, 4)} label="Stack" />}
      </span>
    </Link>
  );
}
