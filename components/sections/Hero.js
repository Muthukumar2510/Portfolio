import Image from 'next/image';
import profile from '../../content/profile';
import DotField from '../DotField';
import SocialLinks from '../SocialLinks';
import Button from '../ui/Button';
import styles from './Hero.module.css';

const first = profile.name.split(' ')[0];
const initials = profile.name
  .split(' ')
  .map((w) => w[0])
  .slice(0, 2)
  .join('');

// Personal first: who I am, what I do, and one clear way to reach me. The live infra story lives further down.
export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <DotField className={styles.dotField} />
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          {profile.status && (
            <p className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              {profile.status}
            </p>
          )}
          <p className={styles.hello}>
            Hi, I&apos;m {first}. {profile.title} in {profile.location}.
          </p>
          {/* Static headline (it's the LCP element). */}
          <h1 className={styles.title}>{profile.headline}</h1>
          <p className={styles.sub}>{profile.bio[0]}</p>

          <div className={styles.ctas}>
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
          <SocialLinks withEmail labels className={styles.socials} />
        </div>

        <div className={styles.portrait}>
          {profile.avatar ? (
            <Image src={profile.avatar} alt={profile.name} fill priority sizes="(max-width: 767px) 60vw, 320px" className={styles.photo} />
          ) : (
            <span className={styles.mono} role="img" aria-label={profile.name}>
              {initials}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
