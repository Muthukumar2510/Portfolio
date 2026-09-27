import Image from 'next/image';
import styles from './ProjectCover.module.css';

// Stable hue per project so the generated covers differ but never change between builds.
function hueFor(slug) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export default function ProjectCover({ project, sizes }) {
  if (project.cover) {
    return (
      <div className={styles.frame}>
        <Image src={project.cover} alt={`${project.title} screenshot`} fill sizes={sizes} className={styles.img} />
      </div>
    );
  }

  const hue = hueFor(project.slug);
  return (
    <div
      className={`${styles.frame} ${styles.generated}`}
      style={{ '--h1': hue, '--h2': (hue + 60) % 360 }}
      aria-hidden="true"
    >
      <div className={styles.grid} />
      <div className={styles.glyph}>
        <span className={styles.prompt}>$</span> deploy {project.slug}
        <span className={styles.caret} />
      </div>
    </div>
  );
}
