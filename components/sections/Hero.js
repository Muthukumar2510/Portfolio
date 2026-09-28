import Image from 'next/image';
import profile from '../../content/profile';
import { findMedia } from '../../lib/media';
import SocialLinks from '../SocialLinks';
import Button from '../ui/Button';
import styles from './Hero.module.css';

const first = profile.name.split(' ')[0];
const portrait = findMedia('profile/');

// Personal first: who I am, what I do, one clear way to reach me. The page-wide StoryField starts here as a free particle field.
export default function Hero() {
  return (
    <section id="top" className={`${styles.hero} ${portrait ? styles.withPhoto : ''}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.text} data-story-quiet>
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
          {profile.status && <p className={styles.status}>{profile.status}</p>}
        </div>

        {portrait && (
          <div className={styles.portrait}>
            <Image
              src={portrait.src}
              alt={profile.name}
              fill
              priority
              sizes="(max-width: 767px) 40vw, 360px"
              placeholder="blur"
              blurDataURL={portrait.blur}
            />
          </div>
        )}
      </div>
    </section>
  );
}
