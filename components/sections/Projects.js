import Link from 'next/link';
import { useSite } from '../../lib/SiteContext';
import ProjectCover from '../ProjectCover';
import styles from './Sections.module.css';

const statusClass = { live: 'dotOk', building: 'dotWarn', archived: 'dotOff' };

export default function Projects() {
  const { projects } = useSite();
  return (
    <section id="projects" className="section">
      <div className="container reveal">
        <h2 className="section-title">Projects</h2>
        <div className={styles.projects}>
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              id={`project-${p.slug}`}
              className={`${styles.card} ${p.featured ? styles.featured : ''}`}
              data-spotlight
            >
              <div data-tilt className={styles.coverWrap}>
                <ProjectCover
                  project={p}
                  sizes={p.featured ? '(max-width: 860px) 100vw, 560px' : '(max-width: 860px) 100vw, 480px'}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHead}>
                  <span className={styles.cardStatus}>
                    <span className={styles[statusClass[p.status]]} aria-hidden="true" />
                    {p.status}
                  </span>
                  {p.featured && <span className={styles.featuredTag}>featured</span>}
                </div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                {p.metrics?.[0] && (
                  <p className={styles.cardMetric}>
                    <strong>{p.metrics[0].value}</strong> {p.metrics[0].label.toLowerCase()}
                  </p>
                )}
                <ul className={styles.tags}>
                  {(p.stack || []).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <span className={styles.readMore}>Read the case study →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
