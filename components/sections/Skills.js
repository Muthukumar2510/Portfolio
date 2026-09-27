import skills from '../../content/skills';
import styles from './Sections.module.css';

export default function Skills() {
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  return (
    <section id="skills" className="section">
      <div className="container reveal">
        <p className="section-label">$ kubectl get skills</p>
        <h2 className="section-title">Skills status board</h2>
        <div className={styles.board}>
          <div className={styles.boardHead}>
            <span>
              <span className={styles.dotOk} /> All systems operational
            </span>
            <span className={styles.muted}>{total} services</span>
          </div>
          <div className={styles.boardGrid}>
            {skills.map((g) => (
              <div key={g.group} className={styles.boardGroup}>
                <h3>{g.group}</h3>
                <ul>
                  {g.items.map((s) => (
                    <li key={s.name}>
                      <span className={styles.skillName}>
                        <span className={styles.dotOk} aria-hidden="true" />
                        {s.name}
                      </span>
                      <span
                        className={styles.uptime}
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={s.level}
                        aria-label={`${s.name} proficiency`}
                      >
                        {Array.from({ length: 10 }, (_, i) => (
                          <i key={i} className={i < Math.round(s.level / 10) ? styles.on : ''} />
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
