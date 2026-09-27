import styles from './Tag.module.css';

// tone: 'default' | 'accent'
export function Tag({ tone = 'default', children }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}

export function TagList({ items, label }) {
  if (!items?.length) return null;
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
    </ul>
  );
}
