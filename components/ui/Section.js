import Link from 'next/link';
import StoryArt from '../motion/StoryArt';
import Watermark from '../motion/Watermark';
import Note from './Note';
import styles from './Section.module.css';

// Standard page section: anchor id, container, reveal animation, title row with optional "see all" link.
// stage: where this section's illustration (StoryArt, shapes from lib/storyShapes.js) lives.
//   'slot' (default) beside the heading · 'band' a wide strip under the heading ·
//   'side' a tall sticky column beside the content (desktop), collapsing to a band on smaller screens ·
//   'none' no illustration (the section carries its own visual).
// typed: the title types itself out (with a caret) when the section scrolls in.
// notebook: notebook layout. Number, title, intro and an optional handwritten `note` sit in a left margin column;
//   the illustration band and content fill the page to the right. Stacks on phones.
// Every section also gets its faint drawing watermark if lib/storyShapes.js defines one (WATERMARKS).
export default function Section({ id, title, intro, action, wide = false, stage = 'slot', typed = false, notebook = false, note, children }) {
  if (notebook) {
    return (
      <section id={id} className={`${styles.section} ${styles.notebook}`}>
        <Watermark id={id} />
        <div className={`container reveal ${styles.notebookGrid}`}>
          <div className={styles.marginCol}>
            <div className={styles.marginHead}>
              <h2 className={styles.title}>{title}</h2>
              {intro && <p className={styles.marginIntro}>{intro}</p>}
              {action && (
                <Link href={action.href} className={styles.action}>
                  {action.label} →
                </Link>
              )}
            </div>
            <Note point="right" className={styles.marginNote}>
              {note}
            </Note>
          </div>
          <div className={styles.notebookBody}>
            {id && stage !== 'none' && (
              <span className={styles.band} aria-hidden="true">
                <StoryArt id={id} stage="band" />
              </span>
            )}
            {children}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id={id} className={styles.section}>
      <Watermark id={id} />
      <div className={`container reveal ${wide ? styles.wide : ''}`}>
        {(title || action) && (
          <div className={styles.head}>
            <div>
              {title && (
                <h2 className={`${styles.title} ${typed ? styles.typed : ''}`} style={typed ? { '--chars': title.length } : undefined}>
                  {typed ? (
                    <>
                      <span className={styles.typedText}>{title}</span>
                      <span className={styles.caret} aria-hidden="true" />
                    </>
                  ) : (
                    title
                  )}
                </h2>
              )}
              {intro && <p className={styles.intro}>{intro}</p>}
              {action && (
                <Link href={action.href} className={styles.action}>
                  {action.label} →
                </Link>
              )}
            </div>
            {id && stage === 'slot' && (
              <span className={styles.slot} aria-hidden="true">
                <StoryArt id={id} />
              </span>
            )}
          </div>
        )}
        {id && (stage === 'band' || stage === 'side') && (
          <span className={`${styles.band} ${stage === 'side' ? styles.sideFallback : ''}`} aria-hidden="true">
            <StoryArt id={id} stage="band" />
          </span>
        )}
        {id && stage === 'side' ? (
          <div className={styles.sideGrid}>
            <div>{children}</div>
            <div className={styles.sideCol} aria-hidden="true">
              <span className={styles.sideSlot}>
                <StoryArt id={id} stage="side" />
              </span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
