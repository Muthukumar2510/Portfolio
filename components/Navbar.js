import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import profile from '../content/profile';
import { openPalette, toggleConsole } from '../lib/actions';
import ThemeToggle from './ThemeToggle';
import VisitorChip from './VisitorChip';
import styles from './Navbar.module.css';

const links = ['projects', 'experience', 'moments', 'writing', 'contact'];
const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function Navbar() {
  const [active, setActive] = useState('');
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [pill, setPill] = useState(null);
  const navRef = useRef(null);
  const { asPath } = useRouter();

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        if (Math.abs(y - lastY) > 6) {
          setHidden(y > lastY && y > 240);
          lastY = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActive('');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    links.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [asPath]);

  useIsoLayout(() => {
    const el = navRef.current?.querySelector(`[data-link="${active}"]`);
    setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [active]);

  return (
    <header className={`${styles.nav} ${hidden ? styles.hidden : ''} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${profile.name}, home`}>
          <span className={styles.logo} aria-hidden="true">
            {profile.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className={styles.brandName}>{profile.name.split(' ')[0]}</span>
        </Link>

        <nav aria-label="Sections" className={styles.links} ref={navRef}>
          <span
            className={styles.pill}
            style={pill ? { transform: `translateX(${pill.left}px)`, width: pill.width, opacity: 1 } : { opacity: 0 }}
            aria-hidden="true"
          />
          {links.map((id) => (
            <a
              key={id}
              data-link={id}
              href={`/#${id}`}
              className={active === id ? styles.active : ''}
              aria-current={active === id ? 'true' : undefined}
            >
              {id}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <VisitorChip />
          <button type="button" className={styles.iconBtn} onClick={toggleConsole} aria-label="Open terminal" title="Terminal ( ` )">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 17l6-5-6-5M12 19h8" />
            </svg>
          </button>
          <button type="button" className={styles.kbd} onClick={openPalette} aria-label="Search (command palette)">
            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
