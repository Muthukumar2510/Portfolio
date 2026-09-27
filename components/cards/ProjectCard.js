import Link from 'next/link';
import ProjectCover from '../ProjectCover';
import StatusDot from '../ui/StatusDot';
import { Tag, TagList } from '../ui/Tag';
import RepoStats from '../ui/RepoStats';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project: p, large = false }) {
  return (
    <Link href={`/projects/${p.slug}`} id={`project-${p.slug}`} className={`${styles.card} ${large ? styles.large : ''}`} data-spotlight>
      <div data-tilt className={styles.cover}>
        <ProjectCover project={p} sizes={large ? '(max-width: 860px) 100vw, 560px' : '(max-width: 860px) 100vw, 480px'} />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <StatusDot status={p.status} />
          {p.featured && <Tag tone="accent">featured</Tag>}
        </div>
        <h3 className={styles.title}>{p.title}</h3>
        <p className={styles.summary}>{p.summary}</p>
        {p.metrics?.[0] && (
          <p className={styles.metric}>
            <strong>{p.metrics[0].value}</strong> {p.metrics[0].label.toLowerCase()}
          </p>
        )}
        <TagList items={p.stack} label="Tech stack" />
        {p.repoStats && (
          <div className={styles.stats}>
            <RepoStats stats={p.repoStats} />
          </div>
        )}
        <span className={styles.more}>Read the case study →</span>
      </div>
    </Link>
  );
}
