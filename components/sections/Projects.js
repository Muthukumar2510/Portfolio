import projects from '../../data/projects';
import styles from './Sections.module.css';

const statusClass = { live: 'dotOk', building: 'dotWarn', archived: 'dotOff' };

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <p className="section-label">$ docker ps --all</p>
        <h2 className="section-title">Deployed services</h2>
        <div className={styles.projects}>
          {projects.map((p) => (
            <article key={p.slug} id={`project-${p.slug}`} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardStatus}>
                  <span className={styles[statusClass[p.status]]} aria-hidden="true" />
                  {p.status}
                </span>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
