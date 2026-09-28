import brands from '../../content/brands';
import manifest from '../../public/brands/manifest.json';
import styles from './BrandIcon.module.css';

const norm = (s) => String(s || '').trim().toLowerCase();
const byAlias = new Map();
for (const b of brands) for (const a of b.aliases || []) byAlias.set(norm(a), b.slug);

// Finds a brand for a free-text label: exact alias first ("Argo CD"), then its first word ("AWS Organizations").
export function brandFor(label) {
  const n = norm(label);
  const slug = byAlias.get(n) || byAlias.get(n.split(/[\s/]+/)[0]);
  return slug && manifest[slug] ? { slug, ...manifest[slug] } : null;
}

export const hasBrand = (slug) => Boolean(manifest[slug]);

// Monochrome logo rendered with CSS mask so it follows the text colour; `brand` tints it with the brand colour.
// `size` is a token name (e.g. '--size-brand'), so sizes stay in tokens.css.
// `color` shows the full brand colour at all times (used for social links, where the logo *is* the label).
export default function BrandIcon({ name, slug, label, tint = false, color = false, title }) {
  const b = slug && manifest[slug] ? { slug, ...manifest[slug] } : brandFor(name || label);
  if (!b) return null;
  const vars = { '--brand': b.color || 'currentColor' };
  if (b.file) vars['--logo'] = `url(${b.file})`;
  return (
    <span
      className={`${styles.icon} ${b.file ? styles.mask : styles.text} ${tint ? styles.tint : ''} ${color ? styles.color : ''}`}
      style={vars}
      role={title ? 'img' : undefined}
      aria-label={title ? b.name : undefined}
      aria-hidden={title ? undefined : 'true'}
      title={title ? b.name : undefined}
    >
      {!b.file && b.text}
    </span>
  );
}
