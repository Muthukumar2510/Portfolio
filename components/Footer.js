import Link from 'next/link';
import profile from '../content/profile';
import SocialLinks from './SocialLinks';
import styles from './Footer.module.css';

const commit = process.env.NEXT_PUBLIC_COMMIT;
const built = process.env.NEXT_PUBLIC_BUILD_TIME;
const repo = process.env.NEXT_PUBLIC_REPO_URL;

export default function Footer() {
  const year = new Date(built || Date.now()).getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <span>
            © {year} {profile.name}
          </span>
          <nav className={styles.links} aria-label="Footer">
            <Link href="/projects">Projects</Link>
            <Link href="/writing">Writing</Link>
            <Link href="/status">Status</Link>
            <Link href="/infra">Infra</Link>
            <a href="/rss.xml">RSS</a>
            <a href={repo} target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </nav>
        </div>
        <SocialLinks withEmail />
        <span className={styles.build}>
          <span className={styles.dot} aria-hidden="true" /> build {commit} · {built ? built.slice(0, 10) : ''}
        </span>
      </div>
    </footer>
  );
}
