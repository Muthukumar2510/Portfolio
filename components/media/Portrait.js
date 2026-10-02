import Image from 'next/image';
import profile from '../../content/profile';
import { findMedia } from '../../lib/media';
import notes from '../../content/notes';
import Note from '../ui/Note';
import styles from './Portrait.module.css';

const photo = findMedia('profile/');
const isDev = process.env.NODE_ENV === 'development';

// Your photo as a drawing plate: a circle with a white mount, a thin ink ring, registration marks in the corners,
// a dimension line and a revision stamp, plus an optional handwritten note (content/notes.js).
// Drop one image into public/media/profile/ and run `npm run media`. With no photo, nothing renders in production;
// in development a dashed placeholder shows exactly where it will go.
export default function Portrait({ className = '' }) {
  if (!photo && !isDev) return null;
  return (
    <figure className={`${styles.frame} ${className}`}>
      <svg className={styles.plate} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        {/* Registration marks */}
        {[[4, 4], [96, 4], [4, 96], [96, 96]].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}`} />
        ))}
        {/* Dimension line across the diameter */}
        <path className={styles.dim} d="M8 108H92M8 104V112M92 104V112" />
      </svg>
      <span className={styles.dimLabel} aria-hidden="true">⌀ 1 human</span>
      <div className={styles.print}>
        {photo ? (
          <Image
            src={photo.src}
            alt={profile.name}
            fill
            priority
            quality={90}
            sizes="(max-width: 767px) 10rem, 20rem"
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
      <span className={styles.stamp} aria-hidden="true">
        REV {new Date().getFullYear()} · {profile.location.split(',')[0]}
      </span>
      <Note point="right" className={styles.note}>
        {notes.portrait}
      </Note>
    </figure>
  );
}

export const hasPortrait = Boolean(photo) || isDev;
