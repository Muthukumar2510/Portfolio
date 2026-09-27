import profile from '../../content/profile';
import Section from '../ui/Section';
import styles from './Changelog.module.css';

function rel(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Real commit history of this site, so visitors see how it's built and shipped.
export default function Changelog({ commits }) {
  if (!commits?.length) return null;
  return (
    <Section
      id="changelog"
      title="How this site ships"
      intro="Real commits from this site's repository. Every change is reviewed, built by CI, and deployed automatically."
    >
      <ol className={styles.list}>
        {commits.map((c) => (
          <li key={c.sha} className={styles.item}>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className={styles.sha}>
              {c.sha}
            </a>
            <span className={styles.msg}>{c.message}</span>
            <time className={styles.when} dateTime={c.date} suppressHydrationWarning>
              {rel(c.date)}
            </time>
          </li>
        ))}
      </ol>
      <a href={`https://github.com/${profile.repo}`} target="_blank" rel="noopener noreferrer" className={styles.repo}>
        View the source on GitHub ↗
      </a>
    </Section>
  );
}
