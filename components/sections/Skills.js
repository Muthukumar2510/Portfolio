import skills from '../../content/skills';
import Section from '../ui/Section';
import BrandIcon, { brandFor } from '../ui/BrandIcon';

const hasLogo = (name) => Boolean(brandFor(name)?.file);
import styles from './Skills.module.css';

const BARS = 10;

export default function Skills() {
  if (!skills.length) return null;
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  return (
    <Section id="skills" title="Tools I work with">
      <div className={styles.board}>
        <div className={styles.head}>
          <span className={styles.ok}>
            <span className={styles.dot} aria-hidden="true" /> All systems operational
          </span>
          <span className={styles.count}>{total} services</span>
        </div>
        <div className={styles.groups}>
          {skills.map((g) => (
            <div key={g.group} className={styles.group}>
              <h3 className={styles.groupTitle}>{g.group}</h3>
              <ul className={styles.list}>
                {g.items.map((s) => (
                  <li key={s.name}>
                    <span className={styles.name}>
                      {hasLogo(s.name) ? <BrandIcon name={s.name} tint /> : <span className={styles.dot} aria-hidden="true" />}
                      {s.name}
                    </span>
                    <span
                      className={styles.meter}
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={s.level}
                      aria-label={`${s.name} proficiency`}
                    >
                      {Array.from({ length: BARS }, (_, i) => (
                        <i key={i} className={i < Math.round((s.level / 100) * BARS) ? styles.on : ''} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
