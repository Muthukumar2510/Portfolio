import { useEffect, useState } from 'react';
import { ALL_ITEMS } from '../lib/nav';
import styles from './ScrollPacket.module.css';

// A packet travelling down the page: a rail on the left edge with one hop per section.
// Hops you've passed light up; reaching Contact marks the packet delivered. Hops are links, so it doubles as nav.
const HOPS = ALL_ITEMS.filter((i) => i.section);
const clamp = (v) => Math.max(0, Math.min(1, v));

export default function ScrollPacket() {
  const [state, setState] = useState({ progress: 0, hops: [] });

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      const hops = HOPS.map((item) => {
        const el = document.getElementById(item.section);
        return el ? { ...item, at: clamp((el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45) / max) } : null;
      }).filter(Boolean);
      setState({ progress: clamp(window.scrollY / max), hops });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const { progress, hops } = state;
  if (!hops.length) return null;
  const delivered = progress > 0.985;
  const current = [...hops].reverse().find((hop) => progress >= hop.at - 0.001);

  return (
    <nav className={`${styles.rail} ${delivered ? styles.delivered : ''}`} aria-label="Page sections">
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ transform: `scaleY(${progress})` }} />
      </span>
      {hops.map((hop) => {
        const passed = progress >= hop.at - 0.001;
        const here = current?.id === hop.id;
        return (
          <a
            key={hop.id}
            href={`#${hop.section}`}
            className={`${styles.hop} ${passed ? styles.passed : ''} ${here ? styles.here : ''}`}
            style={{ top: `${hop.at * 100}%` }}
            aria-current={here ? 'location' : undefined}
          >
            <span className={styles.label}>{hop.label}</span>
          </a>
        );
      })}
      <span className={styles.packet} style={{ top: `${progress * 100}%` }} aria-hidden="true" />
      <span className={styles.status} aria-live="polite">
        {delivered ? 'delivered ✓' : ''}
      </span>
    </nav>
  );
}
