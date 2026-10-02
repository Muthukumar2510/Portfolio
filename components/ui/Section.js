import Link from 'next/link';
import StoryArt from '../motion/StoryArt';
import Watermark from '../motion/Watermark';
import Note from './Note';
import styles from './Section.module.css';

// Every home section is a notebook page: the section number, title, intro and an optional handwritten `note`
// sit in a left margin column; the content fills the page to the right. Stacks on phones.
// stage: where the section's illustration (StoryArt, shapes in lib/storyShapes.js) goes.
//   'slot' (default) a small drawing in the margin · 'band' a wide strip above the content ·
//   'none' no illustration (the section carries its own visual).
// Each section also gets its faint drawing watermark if lib/storyShapes.js defines one (WATERMARKS).
export default function Section({ id, title, intro, action, note, stage = 'slot', children }) {
  return (
    <section id={id} className={styles.section}>
      <Watermark id={id} />
      <div className={`container reveal ${styles.grid}`}>
        <div className={styles.margin}>
          <div className={styles.head}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {intro && <p className={styles.intro}>{intro}</p>}
            {action && (
              <Link href={action.href} className={styles.action}>
                {action.label} →
              </Link>
            )}
            {id && stage === 'slot' && (
              <span className={styles.slot} aria-hidden="true">
                <StoryArt id={id} />
              </span>
            )}
          </div>
          <Note point="right" className={styles.note}>
            {note}
          </Note>
        </div>
        <div className={styles.body}>
          {id && stage === 'band' && (
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
