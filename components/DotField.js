import { useEffect, useRef } from 'react';

// Background grid of dots that bend away from the cursor and relax back.
export default function DotField({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Touch screens have no cursor to react to, so skip the animation (and its CPU cost) entirely.
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    const GAP = 26;
    let w = 0;
    let h = 0;
    let dots = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };
    let color = '#888';
    let accent = '#1a73e8';

    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      color = css.getPropertyValue('--muted').trim() || color;
      accent = css.getPropertyValue('--accent').trim() || accent;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) dots.push({ ox: x, oy: y, x, y });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = 130;
      for (const d of dots) {
        const dx = d.ox - mouse.x;
        const dy = d.oy - mouse.y;
        const dist = Math.hypot(dx, dy);
        let tx = d.ox;
        let ty = d.oy;
        let near = 0;
        if (dist < R) {
          near = 1 - dist / R;
          const push = near * near * 22;
          tx += (dx / (dist || 1)) * push;
          ty += (dy / (dist || 1)) * push;
        }
        d.x += (tx - d.x) * 0.18;
        d.y += (ty - d.y) * 0.18;
        ctx.globalAlpha = 0.22 + near * 0.6;
        ctx.fillStyle = near > 0.15 ? accent : color;
        const s = 1.4 + near * 1.6;
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(frame);
    };

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
      if (reduced) draw();
    };

    readColors();
    layout();
    draw();
    start();
    const host = canvas.parentElement;
    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
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
