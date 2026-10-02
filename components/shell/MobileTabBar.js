import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ALL_ITEMS, TAB_IDS, itemsFor, hrefFor } from '../../lib/nav';
import { toggleConsole, openPalette } from '../../lib/actions';
import VisitorChip from '../console/VisitorChip';
import SocialLinks from '../layout/SocialLinks';
import useIsActive from '../../lib/useIsActive';
import Icon from './Icon';
import styles from './MobileTabBar.module.css';

const TABS = itemsFor(TAB_IDS);
const MORE = ALL_ITEMS.filter((i) => !TAB_IDS.includes(i.id));

// App-style bottom navigation below 768px; "More" opens a sheet with everything else.
export default function MobileTabBar() {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const { asPath } = useRouter();

  useEffect(() => setOpen(false), [asPath]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav className={styles.bar} aria-label="Primary">
        {TABS.map((item) => {
          const on = isActive(item);
          return (
            <Link key={item.id} href={hrefFor(item)} className={`${styles.tab} ${on ? styles.on : ''}`} aria-current={on ? 'page' : undefined}>
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button type="button" className={`${styles.tab} ${open ? styles.on : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="more-sheet">
          <Icon name={open ? 'close' : 'more'} size={20} />
          <span>More</span>
        </button>
      </nav>

      <div className={`${styles.scrim} ${open ? styles.scrimOn : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="more-sheet" className={`${styles.sheet} ${open ? styles.sheetOn : ''}`} role="dialog" aria-modal="true" aria-label="More" inert={!open}>
        <span className={styles.grip} aria-hidden="true" />
        <ul className={styles.grid}>
          {MORE.map((item) => (
            <li key={item.id}>
              <Link href={hrefFor(item)} className={styles.cell} onClick={() => setOpen(false)}>
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <button type="button" className={styles.cell} onClick={() => (setOpen(false), openPalette())}>
              <Icon name="search" size={20} />
              <span>Search</span>
            </button>
          </li>
          <li>
            <button type="button" className={styles.cell} onClick={() => (setOpen(false), toggleConsole())}>
              <Icon name="terminal" size={20} />
              <span>Terminal</span>
            </button>
          </li>
        </ul>
        <div className={styles.foot}>
          <VisitorChip />
          <SocialLinks withEmail />
        </div>
      </div>
    </>
  );
}
