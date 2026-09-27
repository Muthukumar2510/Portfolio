import Image from 'next/image';
import profile from '../content/profile';
import styles from './Avatar.module.css';

export default function Avatar({ size = 56 }) {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <span className={styles.wrap} style={{ width: size, height: size }}>
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt={profile.name}
          width={size * 2}
          height={size * 2}
          priority
          className={styles.img}
        />
      ) : (
        <span className={styles.mono} style={{ fontSize: size * 0.36 }} aria-label={profile.name} role="img">
          {initials}
        </span>
      )}
      <span className={styles.online} aria-hidden="true" />
    </span>
  );
}
