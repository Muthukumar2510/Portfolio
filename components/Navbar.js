import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import profile from '../content/profile';
import { openPalette } from '../lib/actions';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

const links = ['projects', 'about', 'skills', 'experience', 'writing', 'contact'];

export default function Navbar() {
  const [active, setActive] = useState('');
  const [isMac, setIsMac] = useState(false);
  const { asPath } = useRouter();

  useEffect(() => {
    setActive('');
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    links.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [asPath]);

  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandPrompt}>~/</span>
          {profile.handle}
        </Link>
        <nav aria-label="Sections" className={styles.links}>
          {links.map((id) => (
            <a key={id} href={`/#${id}`} className={active === id ? styles.active : ''}>
              {id}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <button type="button" className={styles.kbd} onClick={openPalette} aria-label="Open command palette">
            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
