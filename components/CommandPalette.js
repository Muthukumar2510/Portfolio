import { useEffect, useMemo, useRef, useState } from 'react';
import profile from '../content/profile';
import { useSite } from '../lib/SiteContext';
import {
  scrollToSection,
  toggleTheme,
  copyEmail,
  openResume,
  openUrl,
  mailtoFor,
  fireEgg,
  openPath,
} from '../lib/actions';
import styles from './CommandPalette.module.css';

function buildItems({ projects, posts }) {
  return [
  ...['projects', 'about', 'experience', 'skills', 'certifications', 'moments', 'writing', 'changelog', 'contact'].map((id) => ({
    group: 'Go to',
    label: id[0].toUpperCase() + id.slice(1),
    hint: `#${id}`,
    run: () => scrollToSection(id),
  })),
  ...projects.map((p) => ({
    group: 'Projects',
    label: p.title,
    hint: (p.stack || []).join(' · '),
    run: () => openPath(`/projects/${p.slug}`),
  })),
  ...posts.map((p) => ({
    group: 'Writing & events',
    label: p.title,
    hint: `${p.type} · ${p.date}`,
    run: () => openPath(`/writing/${p.slug}`),
  })),
  { group: 'Actions', label: 'Copy email address', hint: profile.email, run: copyEmail },
  { group: 'Actions', label: 'Draft a hiring email', hint: 'opens mail client', run: () => (window.location.href = mailtoFor('hiring')) },
  { group: 'Actions', label: 'Open resume', hint: 'PDF', run: openResume },
  { group: 'Actions', label: 'Toggle theme', hint: 'light / dark', run: toggleTheme },
  ...(profile.bookingUrl ? [{ group: 'Actions', label: 'Book a call', hint: 'calendar', run: () => openUrl(profile.bookingUrl) }] : []),
  ...profile.socials.filter((s) => s.url).map((s) => ({ group: 'Links', label: s.label, hint: s.url.replace(/^https?:\/\//, ''), run: () => openUrl(s.url) })),
  { group: 'Fun', label: 'Enter the matrix', hint: 'trust me', run: () => fireEgg('matrix') },
  ];
}

function score(label, query) {
  const l = label.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  if (l.startsWith(q)) return 3;
  if (l.includes(q)) return 2;
  let i = 0;
  for (const ch of l) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
}

export default function CommandPalette() {
  const site = useSite();
  const items = useMemo(() => buildItems(site), [site]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('app:palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app:palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      setQuery('');
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      lastFocus.current?.focus?.({ preventScroll: true });
    }
  }, [open]);

  const results = useMemo(
    () =>
      items
        .map((it) => ({ ...it, s: Math.max(score(it.label, query), score(it.group, query) && query ? 1 : 0) }))
        .filter((it) => it.s > 0)
        .sort((a, b) => b.s - a.s),
    [query, items]
  );

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${index}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  if (!open) return null;

  function choose(item) {
    setOpen(false);
    setTimeout(item.run, 0);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results[index]) {
      e.preventDefault();
      choose(results[index]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  let lastGroup = null;

  return (
    <div className={styles.overlay} onMouseDown={() => setOpen(false)}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.searchRow}>
          <span className={styles.chevron} aria-hidden="true">›</span>
          <input
            ref={inputRef}
            className={styles.search}
            placeholder="Jump to a section, project, or action…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `palette-${index}` : undefined}
          />
          <kbd className={styles.esc}>esc</kbd>
        </div>
        <ul id="palette-list" className={styles.list} ref={listRef} role="listbox">
          {results.length === 0 && <li className={styles.empty}>No matches. Try &quot;projects&quot; or &quot;email&quot;.</li>}
          {results.map((it, i) => {
            const header = !query && it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <li key={it.group + it.label} role="presentation">
                {header && <div className={styles.group}>{header}</div>}
                <div
                  id={`palette-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={i === index}
                  className={i === index ? styles.itemActive : styles.item}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => choose(it)}
                >
                  <span>{it.label}</span>
                  <span className={styles.hint}>{it.hint}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
        </div>
      </div>
    </div>
  );
}
