import Link from 'next/link';
import styles from './Section.module.css';

// Standard page section: anchor id, container, reveal animation, title row with optional "see all" link.
// stage: where this section's StoryField illustration lives.
//   'slot' (default) beside the heading · 'band' a wide strip under the heading ·
//   'side' a tall sticky column beside the content (desktop), collapsing to a band on smaller screens ·
//   'none' no illustration (the section carries its own visual).
export default function Section({ id, title, intro, action, wide = false, stage = 'slot', children }) {
  return (
    <section id={id} className={styles.section}>
      <div className={`container reveal ${wide ? styles.wide : ''}`}>
        {(title || action) && (
          <div className={styles.head}>
            <div>
              {title && <h2 className={styles.title}>{title}</h2>}
              {intro && <p className={styles.intro}>{intro}</p>}
              {action && (
                <Link href={action.href} className={styles.action}>
                  {action.label} →
                </Link>
              )}
            </div>
            {/* Reserved space for this section's StoryField illustration, so it never overlaps content. */}
            {id && stage === 'slot' && <span className={styles.slot} data-story-slot={id} aria-hidden="true" />}
          </div>
        )}
        {id && (stage === 'band' || stage === 'side') && (
          <span className={`${styles.band} ${stage === 'side' ? styles.sideFallback : ''}`} data-story-slot={id} aria-hidden="true" />
        )}
        {id && stage === 'side' ? (
          <div className={styles.sideGrid}>
            <div>{children}</div>
            <div className={styles.sideCol} aria-hidden="true">
              <span className={styles.sideSlot} data-story-slot={id} />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
