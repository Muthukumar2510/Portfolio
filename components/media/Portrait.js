import Image from 'next/image';
import profile from '../../content/profile';
import { findMedia } from '../../lib/media';
import styles from './Portrait.module.css';

const photo = findMedia('profile/');
const isDev = process.env.NODE_ENV === 'development';

// Your photo, framed: a rounded print with an offset outline behind it and a small caption plate.
// Drop one image into public/media/profile/ and run `npm run media`. With no photo, nothing renders in production;
// in development a dashed placeholder shows exactly where it will go.
export default function Portrait({ className = '' }) {
  if (!photo && !isDev) return null;
  return (
    <figure className={`${styles.frame} ${className}`}>
      <div className={styles.print}>
        {photo ? (
          <Image
            src={photo.src}
            alt={profile.name}
            fill
            priority
            quality={90}
            sizes="(max-width: 767px) 12rem, 20rem"
            placeholder="blur"
            blurDataURL={photo.blur}
            className={styles.img}
          />
        ) : (
          <span className={styles.empty}>
            Your photo goes here
            <code>public/media/profile/</code>
            <small>then run npm run media</small>
          </span>
        )}
      </div>
      <figcaption className={styles.caption}>
        {profile.name.split(' ')[0]} · {profile.location.split(',')[0]}
      </figcaption>
    </figure>
  );
}

export const hasPortrait = Boolean(photo) || isDev;
