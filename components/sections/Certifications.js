import Image from 'next/image';
import certifications from '../../content/certifications';
import Section from '../ui/Section';
import BrandIcon, { brandFor } from '../ui/BrandIcon';
import styles from './Certifications.module.css';

function monthLabel(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function isExpired(ym) {
  if (!ym) return false;
  const [y, m] = ym.split('-').map(Number);
  return Date.UTC(y, m, 1) < Date.now();
}

function initials(issuer) {
  return issuer
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .slice(0, 3)
    .join('');
}

export default function Certifications() {
  if (!certifications.length) return null;
  return (
    <Section id="certifications" title="Certifications">
      <ul className={styles.grid}>
        {certifications.map((c) => {
          const expired = isExpired(c.expires);
          const Tag = c.url ? 'a' : 'div';
          return (
            <li key={c.name}>
              <Tag
                className={styles.card}
                data-spotlight
                {...(c.url ? { href: c.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className={styles.badge}>
                  {c.badge ? (
                    <Image src={c.badge} alt="" width={64} height={64} />
                  ) : brandFor(c.name) || brandFor(c.issuer) ? (
                    <BrandIcon name={brandFor(c.name) ? c.name : c.issuer} />
                  ) : (
                    <span>{initials(c.issuer)}</span>
                  )}
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{c.name}</span>
                  <span className={styles.issuer}>{c.issuer}</span>
                  <span className={styles.meta}>
                    Issued {monthLabel(c.date)}
                    {c.expires && (
                      <span className={expired ? styles.expired : styles.valid}>
                        {expired ? `Expired ${monthLabel(c.expires)}` : `Valid until ${monthLabel(c.expires)}`}
                      </span>
                    )}
                  </span>
                </span>
                {c.url && <span className={styles.verify}>Verify ↗</span>}
              </Tag>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
