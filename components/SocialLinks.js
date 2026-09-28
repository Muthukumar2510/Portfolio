import profile from '../content/profile';
import BrandIcon, { hasBrand } from './ui/BrandIcon';
import styles from './SocialLinks.module.css';

// Brand logos come from public/brands via <BrandIcon>; only generic glyphs stay inline.
const GLYPHS = {
  email: 'M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.4l10 6.25L22 6.4V6H2Zm20 2.76-9.47 5.92a1 1 0 0 1-1.06 0L2 8.76V18h20V8.76Z',
  link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 0 1 4.2 4.2l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a1 1 0 0 0-1.4-1.4l-3.5 3.5a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 0 1-4.2-4.2l2.1-2.1a1 1 0 1 1 1.4 1.4L7.1 12.7a1 1 0 0 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0Z',
};
// profile.socials `icon` values that differ from brand slugs.
const SLUG = { devto: 'devdotto' };

export const activeSocials = profile.socials.filter((s) => s.url);

export function SocialIcon({ icon }) {
  if (GLYPHS[icon]) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={GLYPHS[icon]} />
      </svg>
    );
  }
  const slug = SLUG[icon] || icon;
  return hasBrand(slug) ? <BrandIcon slug={slug} /> : <SocialIcon icon="link" />;
}

export default function SocialLinks({ withEmail = false, labels = false, className = '' }) {
  const items = [
    ...activeSocials,
    ...(withEmail ? [{ label: 'Email', icon: 'email', url: `mailto:${profile.email}` }] : []),
  ];
  if (!items.length) return null;
  return (
    <ul className={`${styles.list} ${labels ? styles.withLabels : ''} ${className}`} aria-label="Social links">
      {items.map((s) => (
        <li key={s.label}>
          <a
            href={s.url}
            className={styles.link}
            target={s.url.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer me"
            aria-label={s.label}
            title={s.label}
            data-magnetic
          >
            <SocialIcon icon={s.icon} />
            {labels && <span>{s.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
