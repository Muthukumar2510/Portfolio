import experience from '../../content/experience';
import Section from '../ui/Section';
import { Tag } from '../ui/Tag';
import styles from './Experience.module.css';

export default function Experience() {
  if (!experience.length) return null;
  return (
    <Section stage="side" id="experience" title="Experience">
      <ol className={styles.log}>
        {experience.map((e, i) => (
          <li key={e.version} className={styles.item}>
            <div className={styles.meta}>
              <Tag tone="accent">{e.version}</Tag>
              {i === 0 && <span className={styles.current}>current</span>}
              <span>{e.period}</span>
            </div>
            <h3 className={styles.role}>
              {e.role} <span className={styles.company}>@ {e.company}</span>
            </h3>
            <ul className={styles.highlights}>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
