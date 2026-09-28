import BrandIcon from './BrandIcon';
import styles from './Tag.module.css';

// tone: 'default' | 'accent'
export function Tag({ tone = 'default', children }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}

// Stack/tech tags; a matching logo from public/brands is shown when one exists.
export function TagList({ items, label }) {
  if (!items?.length) return null;
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((t) => (
        <li key={t}>
          <Tag>
            <BrandIcon name={t} />
            {t}
          </Tag>
        </li>
      ))}
    </ul>
  );
}
