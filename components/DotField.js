import { useEffect, useRef } from 'react';

// "Antigravity" particle field: particles drift gently on their own; near the cursor they lift away
// into a ring, stretch into short dashes pointing outward and pick up the accent colour, then settle back.
// Touch screens and reduced-motion users get a still field (no animation loop at all).
const GAP = 28;
const RADIUS = 170;
const PUSH = 34;

export default function DotField({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const animate = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let parts = [];
    let raf = 0;
    let visible = true;
    let t = 0;
    const mouse = { x: -9999, y: -9999, active: 0 };
    let muted = '#888';
    let accent = '#1a73e8';

    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      muted = css.getPropertyValue('--muted').trim() || muted;
      accent = css.getPropertyValue('--accent').trim() || accent;
    };

    // Deterministic jitter so the field looks organic but never reshuffles between renders.
    const rand = (i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = [];
      let i = 0;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP, i++) {
          const ox = x + (rand(i) - 0.5) * GAP * 0.7;
          const oy = y + (rand(i + 7) - 0.5) * GAP * 0.7;
          parts.push({ ox, oy, x: ox, y: oy, phase: rand(i + 3) * Math.PI * 2, speed: 0.4 + rand(i + 5) * 0.6 });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        // Idle drift: a slow float around the home position.
        const hx = p.ox + Math.sin(t * p.speed + p.phase) * 3;
        const hy = p.oy + Math.cos(t * p.speed * 0.8 + p.phase) * 3;
        const dx = hx - mouse.x;
        const dy = hy - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const near = dist < RADIUS ? (1 - dist / RADIUS) * mouse.active : 0;
        const lift = near * near * PUSH;
        const tx = hx + (dx / dist) * lift;
        const ty = hy + (dy / dist) * lift;
        p.x += (tx - p.x) * 0.12;
        p.y += (ty - p.y) * 0.12;

        ctx.globalAlpha = 0.18 + near * 0.75;
        if (near > 0.08) {
          const len = 2 + near * 7;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.2 + near;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x - (dx / dist) * len * 0.5, p.y - (dy / dist) * len * 0.5);
          ctx.lineTo(p.x + (dx / dist) * len * 0.5, p.y + (dy / dist) * len * 0.5);
          ctx.stroke();
        } else {
          ctx.fillStyle = muted;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      t += 0.016;
      // Ease the cursor's influence in and out so the ring blooms instead of popping.
      mouse.active += ((mouse.x > -9999 ? 1 : 0) - mouse.active) * 0.08;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (animate && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const host = canvas.parentElement;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onTheme = () => {
      readColors();
      if (!animate) draw();
    };

    readColors();
    layout();
    draw();
    start();
    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    ro.observe(canvas);
    io.observe(canvas);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('app:theme', onTheme);
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('app:theme', onTheme);
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
