import Link from 'next/link';
import Seo from './Seo';
import styles from './ListPage.module.css';

// Shell for index pages (/projects, /writing): back link, title, intro, optional filters, content.
export default function ListPage({ title, intro, filters, active, onFilter, children }) {
  return (
    <div className={`container ${styles.page}`}>
      <Seo title={title} description={intro} />
      <Link href="/" className={styles.back}>
        ← Home
      </Link>
      <h1 className={styles.title}>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {filters && (
        <div className={styles.filters} role="tablist" aria-label="Filter">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active === f.key}
              className={active === f.key ? styles.filterOn : styles.filter}
              onClick={() => onFilter(f.key)}
            >
              {f.label}
              <span className={styles.count}>{f.count}</span>
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
