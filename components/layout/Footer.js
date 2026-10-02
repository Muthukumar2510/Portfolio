import Link from 'next/link';
import profile from '../../content/profile';
import { NAV, hrefFor } from '../../lib/nav';
import SocialLinks from './SocialLinks';
import Button from '../ui/Button';
import { toggleConsole } from '../../lib/actions';
import styles from './Footer.module.css';

const commit = process.env.NEXT_PUBLIC_COMMIT;
const built = process.env.NEXT_PUBLIC_BUILD_TIME;
const repo = process.env.NEXT_PUBLIC_REPO_URL;
const [first, ...others] = profile.name.split(' ');

// Footer as a sign-off: who I am, one clear call to action, every link, and the name as a watermark.
export default function Footer() {
  const year = new Date(built || Date.now()).getFullYear();
  const columns = NAV.filter((g) => g.group !== 'Connect');

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.brand}>
            <p className={styles.name}>
              <strong>{first}</strong> {others.join(' ')}
            </p>
            <p className={styles.tagline}>{profile.tagline}</p>
            <div className={styles.ctas}>
              <Button href="/#contact">Let&apos;s talk</Button>
              {profile.resumeUrl && (
                <Button href={profile.resumeUrl} variant="ghost">
                  Résumé
                </Button>
              )}
            </div>
            <SocialLinks withEmail />
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {columns.map((g) => (
              <div key={g.group}>
                <p className={styles.colTitle}>{g.group}</p>
                <ul>
                  {g.items.map((item) => (
                    <li key={item.id}>
                      <Link href={item.page || hrefFor(item)}>{item.label}</Link>
                    </li>
                  ))}
                  {g.group === 'Behind the site' && (
                    <>
                      <li>
                        <a href="/rss.xml">RSS</a>
                      </li>
                      {repo && (
                        <li>
                          <a href={repo} target="_blank" rel="noopener noreferrer">
                            Source ↗
                          </a>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            ))}
          </nav>

          <div className={styles.bottom}>
            <span>
              © {year} {profile.name}
            </span>
            <span className={styles.build}>
              <span className={styles.dot} aria-hidden="true" /> build {commit} · {built ? built.slice(0, 10) : ''}
            </span>
            <span className={styles.bottomLinks}>
              <button type="button" className={styles.top} onClick={toggleConsole}>
                Open terminal <kbd>`</kbd>
              </button>
              <a href="#top" className={styles.top}>
                Back to top ↑
              </a>
            </span>
          </div>
        </div>
      </div>
      <p className={styles.watermark} aria-hidden="true">
        {first}
      </p>
    </footer>
  );
}
