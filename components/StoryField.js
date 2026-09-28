import { useEffect, useRef } from 'react';
import { SHAPES, sample } from '../lib/storyShapes';
import styles from './StoryField.module.css';

// One particle system for the whole home page. In the hero it's a free "antigravity" field that lifts away
// from the cursor; further down, the same particles fly into the reserved slot beside each section heading
// (<Section> renders [data-story-slot]) and form a picture of it, so illustrations never sit on content.
// Motion is frame-rate independent (exponential easing on real elapsed time), colours come from the
// --story-* tokens, and reduced-motion users get the shapes without any animation loop.
const clamp = (v) => Math.max(0, Math.min(1, v));
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

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
    let colors = [];
    let muted = 'rgb(128,128,128)';
    let dark = false;
    let raf = 0;
    let last = 0;
    let t = 0;
    let lastSlot = null;
    const mouse = { x: -9999, y: -9999, active: 0 };

    const rand = (i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Per-particle colour along a blue → violet → teal gradient, so every shape reads as one continuous stroke.
    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      const stops = ['--story-1', '--story-2', '--story-3'].map((v) => hexToRgb(css.getPropertyValue(v).trim() || '#1a73e8'));
      const m = hexToRgb(css.getPropertyValue('--muted').trim() || '#888888');
      muted = `rgb(${m.join(',')})`;
      dark = document.documentElement.dataset.theme === 'dark';
      colors = Array.from({ length: n }, (_, i) => {
        const f = (i / Math.max(1, n - 1)) * 2;
        const a = stops[Math.min(1, Math.floor(f))];
        const b = stops[Math.min(2, Math.floor(f) + 1)];
        const k = f - Math.floor(f);
        return `rgb(${a.map((c, j) => Math.round(c + (b[j] - c) * k)).join(',')})`;
      });
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = fine && w >= 768 ? 800 : 320;
      const gap = Math.sqrt((w * h) / target);
      grid = [];
      let i = 0;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap, i++) {
          grid.push({ x: x + (rand(i) - 0.5) * gap * 0.7, y: y + (rand(i + 7) - 0.5) * gap * 0.7, phase: rand(i + 3) * 6.28, speed: 0.3 + rand(i + 5) * 0.5 });
        }
      }
      if (grid.length !== n) {
        n = grid.length;
        parts = grid.map((g) => ({ x: g.x, y: g.y, lit: 0, a: 0 }));
      }
      readColors();
    };

    // The illustration slot nearest the middle of the screen; the hero field while the hero is in view.
    const scene = () => {
      const hero = document.getElementById('top');
      if (hero && hero.getBoundingClientRect().bottom > h * 0.35) return { hero: true };
      let best = null;
      let bestD = Infinity;
      for (const el of document.querySelectorAll('[data-story-slot]')) {
        const id = el.dataset.storySlot;
        if (!SHAPES[id]) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < -h * 0.2 || r.top > h * 1.1) continue;
        const d = Math.abs(r.top + r.height / 2 - h * 0.45);
        if (d < bestD) {
          bestD = d;
          best = { el, id, r };
        }
      }
      if (best) lastSlot = best;
      else if (lastSlot) lastSlot = { ...lastSlot, r: lastSlot.el.getBoundingClientRect() };
      return lastSlot || { hero: true };
    };

    const quietRect = () => document.querySelector('[data-story-quiet]')?.getBoundingClientRect();

    const targets = (sc) => {
      if (sc.hero) {
        return grid.map((g) => ({ x: g.x + Math.sin(t * g.speed + g.phase) * 4, y: g.y + Math.cos(t * g.speed * 0.8 + g.phase) * 4, lit: false, shape: false }));
      }
      const section = sc.el.closest('section');
      const sr = section ? section.getBoundingClientRect() : sc.r;
      const p = clamp((h * 0.55 - sr.top) / Math.max(1, sr.height));
      // Uniform scale keeps circles round; the picture sits at the slot's inner edge (right on desktop).
      const s = Math.min(sc.r.width, sc.r.height);
      const sx = s;
      const sy = s;
      const cx = sc.r.width > s * 1.2 && w >= 600 ? sc.r.right - s / 2 : sc.r.left + sc.r.width / 2;
      const cy = sc.r.top + sc.r.height / 2;
      return sample(SHAPES[sc.id](p, t), n).map((q) => ({ x: cx + (q.x - 0.5) * sx, y: cy + (q.y - 0.5) * sy, lit: q.lit, shape: true }));
    };

    const draw = (dt) => {
      const sc = scene();
      const tg = targets(sc);
      const quiet = sc.hero ? quietRect() : null;
      // Same feel at 30, 60 or 120 fps; particles later in the path settle a touch later, so shapes "draw" in.
      const base = dt ? 1 - Math.exp(-dt * 4.2) : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark && sc.hero ? 'lighter' : 'source-over';
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
            const lift = near * near * (g.shape ? 14 : 36);
            tx += (dx / dist) * lift;
            ty += (dy / dist) * lift;
          }
        }
        const k = dt ? 1 - Math.pow(1 - base, 0.75 + 0.5 * (1 - i / n)) : 1;
        p.x += (tx - p.x) * k;
        p.y += (ty - p.y) * k;
        p.lit += ((g.lit ? 1 : 0) - p.lit) * k;
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;

        // Particles in flight between shapes stay faint, so the hand-off never paints over content.
        const away = Math.hypot(tx - p.x, ty - p.y);
        const settle = clamp(1 - away / 140);
        let alpha;
        let size;
        if (g.shape) {
          alpha = (dark ? 0.42 : 0.5) * (0.25 + 0.75 * settle) + p.lit * (dark ? 0.4 : 0.35);
          size = 1.1 + p.lit * 0.8;
        } else {
          alpha = (dark ? 0.3 : 0.26) + near * 0.6;
          size = 1 + near * 1.4;
          if (quiet && p.x > quiet.left - 16 && p.x < quiet.right + 16 && p.y > quiet.top - 16 && p.y < quiet.bottom + 16) alpha *= 0.3;
        }
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = g.shape || near > 0.1 ? colors[i] : muted;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const frame = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      mouse.active += ((mouse.x > -9999 ? 1 : 0) - mouse.active) * (1 - Math.exp(-dt * 5));
      draw(dt);
      raf = document.hidden ? 0 : requestAnimationFrame(frame);
    };
    const start = () => {
      if (reduced) draw(0);
      else if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
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
      draw(0);
    };
    const onScroll = () => reduced && draw(0);
    const onTheme = () => {
      readColors();
      if (reduced) draw(0);
    };

    layout();
    draw(0);
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
