import { useEffect, useRef } from 'react';
import { SHAPES, sample } from '../lib/storyShapes';
import styles from './StoryField.module.css';

// One particle system for the whole home page. In the hero it's a free "antigravity" field that lifts away
// from the cursor; as you scroll, the same particles fly together into a picture of each section
// (servers scaling out, a timeline, orbits, a camera, typing text, packets on a network, an envelope).
// Reduced motion: no animation loop, particles jump straight to each shape. Touch: fewer particles, no cursor.
const IDS = ['top', ...Object.keys(SHAPES)];
const clamp = (v) => Math.max(0, Math.min(1, v));

export default function StoryField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let n = 0;
    let parts = [];
    let grid = [];
    let raf = 0;
    let t = 0;
    const mouse = { x: -9999, y: -9999, active: 0 };
    let muted = '#888';
    let accent = '#1a73e8';

    const rand = (i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      muted = css.getPropertyValue('--muted').trim() || muted;
      accent = css.getPropertyValue('--accent').trim() || accent;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = fine && w >= 768 ? 900 : 360;
      const gap = Math.sqrt((w * h) / target);
      grid = [];
      let i = 0;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap, i++) {
          grid.push({ x: x + (rand(i) - 0.5) * gap * 0.7, y: y + (rand(i + 7) - 0.5) * gap * 0.7, phase: rand(i + 3) * 6.28, speed: 0.4 + rand(i + 5) * 0.6 });
        }
      }
      n = grid.length;
      if (parts.length !== n) parts = grid.map((g) => ({ x: g.x, y: g.y, lit: 0 }));
    };

    // Which section is under the reading line, and how far through it we are.
    const active = () => {
      const line = h * 0.45;
      for (const id of IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) return { id, p: clamp((line - r.top) / r.height) };
      }
      return { id: 'top', p: 0 };
    };

    const targets = () => {
      const { id, p } = active();
      if (id === 'top' || !SHAPES[id]) {
        return grid.map((g) => ({ x: g.x + Math.sin(t * g.speed + g.phase) * 3, y: g.y + Math.cos(t * g.speed * 0.8 + g.phase) * 3, lit: false, shape: false }));
      }
      // Desktop: the picture sits in the right-hand gutter; phones: centred and fainter, behind the text.
      const wide = w >= 1024;
      const s = wide ? Math.min(w * 0.34, h * 0.62) : Math.min(w * 0.82, h * 0.5);
      const cx = wide ? w * 0.77 : w * 0.5;
      const cy = h * 0.5;
      return sample(SHAPES[id](p, t), n).map((q) => ({ x: cx + (q.x - 0.5) * s, y: cy + (q.y - 0.5) * s, lit: q.lit, shape: true }));
    };

    const step = (snap) => {
      const tg = targets();
      const wide = w >= 1024;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) {
        const p = parts[i];
        const g = tg[i];
        let tx = g.x;
        let ty = g.y;
        let near = 0;
        if (fine && mouse.active > 0.01) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 170) {
            near = (1 - dist / 170) * mouse.active;
            const lift = near * near * (g.shape ? 18 : 34);
            tx += (dx / dist) * lift;
            ty += (dy / dist) * lift;
          }
        }
        const k = snap ? 1 : 0.07 + rand(i) * 0.05;
        p.x += (tx - p.x) * k;
        p.y += (ty - p.y) * k;
        p.lit += ((g.lit ? 1 : 0) - p.lit) * (snap ? 1 : 0.1);

        const base = g.shape ? (wide ? 0.26 : 0.14) : 0.18;
        ctx.globalAlpha = Math.min(1, base + p.lit * (wide ? 0.34 : 0.22) + near * 0.6);
        ctx.fillStyle = p.lit > 0.5 || near > 0.15 ? accent : muted;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + p.lit * 0.7 + near, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      t += 0.016;
      mouse.active += ((mouse.x > -9999 ? 1 : 0) - mouse.active) * 0.08;
      step(false);
      raf = document.hidden ? 0 : requestAnimationFrame(frame);
    };
    const start = () => {
      if (reduced) step(true);
      else if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onResize = () => {
      layout();
      step(true);
    };
    const onScroll = () => reduced && step(true);
    const onTheme = () => {
      readColors();
      if (reduced) step(true);
    };

    readColors();
    layout();
    step(true);
    start();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('app:theme', onTheme);
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('app:theme', onTheme);
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
