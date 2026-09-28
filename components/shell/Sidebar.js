import Link from 'next/link';
import { useRouter } from 'next/router';
import profile from '../../content/profile';
import { NAV, ALL_ITEMS, hrefFor } from '../../lib/nav';
import { useSite } from '../../lib/SiteContext';
import useActiveSection from '../../lib/useActiveSection';
import useStatus from '../../lib/useStatus';
import useTrace from '../../lib/useTrace';
import { toggleConsole } from '../../lib/actions';
import ThemeToggle from '../ThemeToggle';
import VisitorChip from '../VisitorChip';
import Icon from './Icon';
import styles from './Sidebar.module.css';

const SECTION_IDS = ALL_ITEMS.filter((i) => i.section).map((i) => i.section);
const initials = profile.name
  .split(' ')
  .map((w) => w[0])
  .slice(0, 2)
  .join('');

// Collapsing is stored on <html data-sidebar="rail"> (applied before paint by lib/themeScript.js).
function toggleRail() {
  const html = document.documentElement;
  const rail = html.dataset.sidebar !== 'rail';
  if (rail) html.dataset.sidebar = 'rail';
  else delete html.dataset.sidebar;
  try {
    localStorage.setItem('sidebar', rail ? 'rail' : 'full');
  } catch {}
}

export function useIsActive() {
  const { pathname } = useRouter();
  const section = useActiveSection(SECTION_IDS);
  return (item) => {
    if (pathname === '/') return item.section ? section === item.section : item.id === 'home' && !section;
    return item.page ? pathname.startsWith(item.page) : item.href && item.href !== '/' && pathname.startsWith(item.href);
  };
}

export default function Sidebar() {
  const site = useSite();
  const status = useStatus();
  const trace = useTrace();
  const isActive = useIsActive();
  const badges = { projects: site.projects.length, posts: site.posts.length };
  const statusTone = status?.status === 'operational' ? 'ok' : status?.status === 'down' ? 'bad' : 'idle';
  const edge = trace?.edge?.name && trace.edge.name !== 'local' ? trace.edge : null;

  return (
    <aside className={styles.sidebar} aria-label="Console navigation">
      <div className={styles.top}>
        <Link href="/" className={styles.identity} aria-label={`${profile.name.split(' ')[0]}, home`}>
          <span className={styles.logo} aria-hidden="true">
            {initials}
          </span>
          <span className={styles.who}>
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.role}>{profile.title}</span>
          </span>
        </Link>
        <button type="button" className={styles.railBtn} onClick={toggleRail} aria-label="Collapse or expand sidebar" title="Collapse sidebar">
          <Icon name="sidebar" size={16} />
        </button>
      </div>

      <div className={styles.edge} title="Where your request entered the network">
        <span className={styles.edgeDot} aria-hidden="true" />
        <span className={styles.edgeText}>
          {edge ? (
            <>
              edge <strong>{edge.name}</strong>
              {trace.rtt != null && <> · {trace.rtt} ms</>}
            </>
          ) : (
            <>edge {trace ? 'local' : '…'}</>
          )}
        </span>
      </div>

      <nav className={styles.nav}>
        {NAV.map((g) => (
          <div key={g.group} className={styles.group}>
            <p className={styles.groupLabel}>{g.group}</p>
            <ul>
              {g.items.map((item) => {
                const on = isActive(item);
                return (
                  <li key={item.id}>
                    <Link href={hrefFor(item)} className={`${styles.item} ${on ? styles.active : ''}`} aria-current={on ? 'page' : undefined} title={item.label}>
                      <Icon name={item.icon} />
                      <span className={styles.label}>{item.label}</span>
                      {item.badge && badges[item.badge] > 0 && <span className={styles.badge}>{badges[item.badge]}</span>}
                      {item.live === 'status' && <span className={`${styles.live} ${styles[statusTone]}`} aria-label={`status ${status?.status || 'unknown'}`} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <VisitorChip />
        <div className={styles.tools}>
          <button type="button" className={styles.tool} onClick={toggleConsole} aria-label="Open terminal" title="Terminal ( ` )">
            <Icon name="terminal" size={16} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
