import { useEffect, useState } from 'react';
import Link from 'next/link';
import Seo from '../components/layout/Seo';
import Button from '../components/ui/Button';
import { openPalette } from '../lib/actions';
import styles from '../styles/pages/NotFound.module.css';

// A 404 styled as a failed request trace, reusing the same language as the home page map.
export default function NotFound() {
  const [path, setPath] = useState('/…');
  const [ms, setMs] = useState(null);

  useEffect(() => {
    setPath(window.location.pathname);
    setMs(Math.round(performance.now() % 40) + 8);
  }, []);

  const hops = [
    { name: 'you', ok: true, detail: 'request sent' },
    { name: 'edge', ok: true, detail: 'routed to nearest region' },
    { name: 'router', ok: false, detail: `no route matches ${path}` },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Seo title="Page not found" description="This page doesn't exist." />
      <p className={styles.code}>
        GET {path} <span className={styles.status}>404</span>
        {ms != null && <span className={styles.ms}>{ms} ms</span>}
      </p>
      <h1 className={styles.title}>This route doesn&apos;t exist.</h1>
      <p className={styles.text}>The request made it through the edge, but nothing is deployed at this path. It may have moved, or the link had a typo.</p>

      <ol className={styles.trace} aria-label="Request trace">
        {hops.map((h) => (
          <li key={h.name} className={h.ok ? styles.ok : styles.fail}>
            <span className={styles.mark} aria-hidden="true">
              {h.ok ? '✓' : '✕'}
            </span>
            <span className={styles.hop}>{h.name}</span>
            <span className={styles.detail}>{h.detail}</span>
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        <Button href="/">Back to home</Button>
        <Button href="/projects" variant="ghost">
          See projects
        </Button>
        <Button variant="ghost" onClick={openPalette}>
          Search (Ctrl K)
        </Button>
      </div>
      <p className={styles.small}>
        Found a broken link? <Link href="/colophon#contact">Tell me</Link> and I&apos;ll fix it.
      </p>
    </div>
  );
}
