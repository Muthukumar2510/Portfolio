import Link from 'next/link';
import styles from './Section.module.css';

// Standard page section: anchor id, container, reveal animation, title row with optional "see all" link.
export default function Section({ id, title, intro, action, wide = false, children }) {
  return (
    <section id={id} className={styles.section}>
      <div className={`container reveal ${wide ? styles.wide : ''}`}>
        {(title || action) && (
          <div className={styles.head}>
            <div>
              {title && <h2 className={styles.title}>{title}</h2>}
              {intro && <p className={styles.intro}>{intro}</p>}
            </div>
            {action && (
              <Link href={action.href} className={styles.action}>
                {action.label} →
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
