import profile from '../../data/profile';
import Terminal from '../Terminal/Terminal';
import styles from './Sections.module.css';

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <p className={styles.status}>
              <span className={styles.pulse} aria-hidden="true" />
              {profile.status}
            </p>
            <h1 className={styles.heroTitle}>
              Hi, I&apos;m {profile.name.split(' ')[0]}.
              <br />
              <span className={styles.heroAccent}>I keep the cloud calm.</span>
            </h1>
            <p className={styles.heroSub}>{profile.tagline}</p>
            <div className={styles.heroCtas}>
              <a href="#contact" className={styles.btnPrimary}>Get in touch</a>
              <a href={profile.resumeUrl} className={styles.btnGhost} target="_blank" rel="noopener noreferrer">
                Resume ↗
              </a>
            </div>
          </div>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
