import profile from '../../content/profile';
import Portrait, { hasPortrait } from '../media/Portrait';
import SocialLinks from '../layout/SocialLinks';
import Button from '../ui/Button';
import { openConsole } from '../../lib/actions';
import styles from './Hero.module.css';


// Personal first: who I am, what I do, one clear way to reach me.
export default function Hero() {
  return (
    <section id="top" className={`${styles.hero} ${hasPortrait ? styles.withPhoto : ''}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.text} data-story-quiet>
          <p className={`${styles.hello} ${styles.enter}`} style={{ '--i': 0 }}>
            {profile.title} in {profile.location}.
          </p>
          {/* Static headline (it's the LCP element). */}
          <h1 className={styles.title}>{profile.headline}</h1>
          <p className={styles.sub}>{profile.bio[0]}</p>

          <div className={`${styles.ctas} ${styles.enter}`} style={{ '--i': 2 }}>
            <Button href="#contact">Let&apos;s talk</Button>
            <Button href="#projects" variant="ghost">
              See my work
            </Button>
            {profile.resumeUrl && (
              <Button href={profile.resumeUrl} variant="ghost">
                Résumé
              </Button>
            )}
          </div>
          <div className={styles.enter} style={{ '--i': 3 }}>
            <SocialLinks withEmail labels className={styles.socials} />
          </div>
          <button type="button" className={`${styles.console} ${styles.enter}`} style={{ '--i': 4 }} onClick={openConsole}>
            or explore from the terminal <kbd>`</kbd>
          </button>
          {profile.status && (
            <p className={`${styles.status} ${styles.enter}`} style={{ '--i': 5 }}>
              {profile.status}
            </p>
          )}
        </div>

        <Portrait className={styles.portrait} />
      </div>
    </section>
  );
}
