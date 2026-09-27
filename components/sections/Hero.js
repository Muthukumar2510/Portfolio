import profile from '../../content/profile';
import ParticleHero from '../ParticleHero';
import Avatar from '../Avatar';
import { openConsole } from '../../lib/actions';
import styles from './Sections.module.css';

export default function Hero() {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <section id="top" className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <div className={styles.identity}>
              {profile.avatar && <Avatar size={48} />}
              <p className={styles.status}>
                <span className={styles.pulse} aria-hidden="true" />
                {profile.status}
              </p>
            </div>
            <h1 className={styles.heroTitle}>
              {profile.headline}
            </h1>
            <p className={styles.heroSub}>
              I&apos;m {profile.name}, a {profile.title.toLowerCase()} based in {profile.location.split(',')[0]}.{' '}
              {profile.bio[0]}
            </p>
            <div className={styles.heroCtas}>
              <a href="#projects" className={styles.btnPrimary} data-magnetic>
                See my work
              </a>
              <a href="#contact" className={styles.btnGhost} data-magnetic>
                Get in touch
              </a>
            </div>
            <button type="button" className={styles.consoleHint} onClick={openConsole}>
              Open the terminal <kbd>`</kbd>
            </button>
          </div>
          <ParticleHero initials={initials} />
        </div>
      </div>
    </section>
  );
}
