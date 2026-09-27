import profile from '../../content/profile';
import Terminal from '../Terminal/Terminal';
import Avatar from '../Avatar';
import VisitorCount from '../VisitorCount';
import styles from './Sections.module.css';

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <div className={styles.identity}>
              <Avatar size={56} />
              <p className={styles.status}>
                <span className={styles.pulse} aria-hidden="true" />
                {profile.status}
              </p>
            </div>
            <h1 className={styles.heroTitle}>
              {profile.name}
              <span className={styles.heroAccent}>{profile.headline}</span>
            </h1>
            <p className={styles.heroSub}>{profile.tagline}</p>
            <div className={styles.heroCtas}>
              <a href="#projects" className={styles.btnPrimary}>See my work</a>
              <a href="#contact" className={styles.btnGhost}>Contact</a>
              <a href={profile.resumeUrl} className={styles.btnGhost} target="_blank" rel="noopener noreferrer">
                Resume ↗
              </a>
            </div>
            <VisitorCount className={styles.visits} />
          </div>
          <div className={styles.terminalWrap}>
            <div className={styles.glow} aria-hidden="true" />
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
