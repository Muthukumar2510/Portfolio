import projects from '../../data/projects';
import ProjectCover from '../ProjectCover';
import styles from './Sections.module.css';

const statusClass = { live: 'dotOk', building: 'dotWarn', archived: 'dotOff' };

export default function Projects() {
  const ordered = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return (
    <section id="projects" className="section">
      <div className="container reveal">
        <p className="section-label">$ docker ps --all</p>
        <h2 className="section-title">Deployed services</h2>
        <div className={styles.projects}>
          {ordered.map((p) => (
            <article
              key={p.slug}
              id={`project-${p.slug}`}
              className={`${styles.card} ${p.featured ? styles.featured : ''}`}
            >
              <ProjectCover
                project={p}
                sizes={p.featured ? '(max-width: 860px) 100vw, 560px' : '(max-width: 860px) 100vw, 340px'}
              />
              <div className={styles.cardBody}>
                <div className={styles.cardHead}>
                  <span className={styles.cardStatus}>
                    <span className={styles[statusClass[p.status]]} aria-hidden="true" />
                    {p.status}
                  </span>
                  {p.featured && <span className={styles.featuredTag}>featured</span>}
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul className={styles.tags}>
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className={styles.cardLinks}>
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      source ↗
                    </a>
                  )}
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer">
                      live ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
