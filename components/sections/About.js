import profile from '../../content/profile';
import Section from '../ui/Section';
import styles from './About.module.css';

export default function About() {
  const facts = [
    ['Role', profile.title],
    ['Based in', profile.location],
    ['Status', profile.status],
  ];
  return (
    <Section id="about" title="About">
      <div className={styles.grid}>
        <div className={styles.text}>
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className={styles.facts}>
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd className={k === 'Status' ? styles.ok : ''}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
