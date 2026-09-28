import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import profile from '../../content/profile';
import { crumbsFor } from '../../lib/nav';
import { openPalette, toggleConsole } from '../../lib/actions';
import useScrollHide from '../../lib/useScrollHide';
import useTrace from '../../lib/useTrace';
import ThemeToggle from '../ThemeToggle';
import Icon from './Icon';
import styles from './CommandBar.module.css';

const initials = profile.name
  .split(' ')
  .map((w) => w[0])
  .slice(0, 2)
  .join('');

// Floating bar at the top of the main pane: where you are, search, and live latency.
export default function CommandBar({ title }) {
  const { pathname } = useRouter();
  const { hidden, scrolled } = useScrollHide();
  const trace = useTrace();
  const [isMac, setIsMac] = useState(false);
  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  const crumbs = crumbsFor(pathname, title);

  return (
    <header className={`${styles.wrap} ${hidden ? styles.hidden : ''} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${profile.name.split(' ')[0]}, home`}>
          <span aria-hidden="true">{initials}</span>
        </Link>

        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>

        <button type="button" className={styles.search} onClick={openPalette} aria-label="Search pages, projects and posts">
          <Icon name="search" size={16} />
          <span className={styles.searchText}>Search projects, posts, pages…</span>
          <span className={styles.keys} aria-hidden="true">
            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd>
          </span>
        </button>

        <div className={styles.actions}>
          {trace?.rtt != null && (
            <span className={styles.latency} title="Round trip for your last request">
              <span className={styles.dot} aria-hidden="true" />
              {trace.rtt} ms
            </span>
          )}
          <span className={styles.compactOnly}>
            <button type="button" className={styles.iconBtn} onClick={toggleConsole} aria-label="Open terminal">
              <Icon name="terminal" size={16} />
            </button>
            <ThemeToggle />
          </span>
        </div>
      </div>
    </header>
  );
}
