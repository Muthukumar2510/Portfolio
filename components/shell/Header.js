import Link from 'next/link';
import profile from '../../content/profile';
import { HEADER_IDS, itemsFor, hrefFor } from '../../lib/nav';
import useIsActive from '../../lib/useIsActive';
import useScrollHide from '../../lib/useScrollHide';
import { openPalette } from '../../lib/actions';
import ThemeToggle from '../ThemeToggle';
import Icon from './Icon';
import styles from './Header.module.css';

const LINKS = itemsFor(HEADER_IDS);
const [first, ...others] = profile.name.split(' ');
const rest = others.join(' ');

// Slim rounded header: transparent over the hero, solid once the page scrolls. The only floating element.
export default function Header() {
  const { hidden, scrolled } = useScrollHide();
  const isActive = useIsActive();

  return (
    <header className={`${styles.wrap} ${hidden ? styles.hidden : ''} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${profile.name}, home`}>
          <span className={styles.first}>{first}</span>
          <span className={styles.last}>{rest}</span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((item) => {
            const on = isActive(item);
            return (
              <Link key={item.id} href={hrefFor(item)} className={on ? styles.on : undefined} aria-current={on ? 'location' : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} onClick={openPalette} aria-label="Search">
            <Icon name="search" size={16} />
          </button>
          <ThemeToggle />
          <Link href="/#contact" className={styles.cta}>
            Let&apos;s talk
          </Link>
        </div>
      </div>
    </header>
  );
}
