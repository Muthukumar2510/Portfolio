import experience from '../../data/experience';
import styles from './Sections.module.css';

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container reveal">
        <p className="section-label">$ git log --career</p>
        <h2 className="section-title">Deployment log</h2>
        <ol className={styles.log}>
          {experience.map((e, i) => (
            <li key={e.version} className={styles.logItem}>
              <div className={styles.logMeta}>
                <span className={styles.tag}>{e.version}</span>
                {i === 0 && <span className={styles.current}>current</span>}
                <span className={styles.muted}>{e.period}</span>
              </div>
              <h3>
                {e.role} <span className={styles.muted}>@ {e.company}</span>
              </h3>
              <ul>
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
