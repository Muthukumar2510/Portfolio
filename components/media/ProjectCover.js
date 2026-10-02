import Image from 'next/image';
import styles from './ProjectCover.module.css';

export default function ProjectCover({ project, sizes }) {
  if (project.cover) {
    return (
      <div className={styles.frame}>
        <Image
          src={project.cover.src}
          alt={`${project.title} screenshot`}
          fill
          sizes={sizes}
          className={styles.img}
          {...(project.cover.blur ? { placeholder: 'blur', blurDataURL: project.cover.blur } : {})}
        />
      </div>
    );
  }

  // No screenshot yet: a blueprint sheet with a title block, built from the project's own front matter.
  return (
    <div className={`${styles.frame} ${styles.generated}`} aria-hidden="true">
      <div className={styles.grid} />
      <div className={styles.glyph}>
        <span className={styles.prompt}>$</span> deploy {project.slug}
        <span className={styles.caret} />
      </div>
      <dl className={styles.titleBlock}>
        <div>
          <dt>Project</dt>
          <dd>{project.title}</dd>
        </div>
        {project.stack?.length > 0 && (
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.slice(0, 2).join(' · ')}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
