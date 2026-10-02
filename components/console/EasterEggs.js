import { useEffect, useRef, useState } from 'react';
import { fireEgg, toast } from '../../lib/actions';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function EasterEggs() {
  const [egg, setEgg] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let pos = 0;
    const onKey = (e) => {
      if (e.key === 'Escape') setEgg(null);
      pos = e.key === KONAMI[pos] ? pos + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        fireEgg('matrix');
      }
    };
    const onEgg = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        toast(e.detail === 'confetti' ? '🎉 Hired! (animation skipped — reduced motion)' : 'Follow the white rabbit 🐇');
        return;
      }
      setEgg(e.detail);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('app:egg', onEgg);
    console.log('%c> hey, curious one. try the Konami code, or type `sudo hire-me` in the terminal.', 'color:#8ab4f8;font-family:monospace');
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app:egg', onEgg);
    };
  }, []);

  useEffect(() => {
    if (!egg) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    const start = performance.now();
    const duration = egg === 'confetti' ? 3000 : 6000;

    let draw;
    if (egg === 'confetti') {
      const colors = ['#1a73e8', '#8ab4f8', '#fbbf24', '#f472b6', '#a78bfa'];
      const parts = Array.from({ length: 160 }, () => ({
        x: w / 2 + (Math.random() - 0.5) * 120,
        y: h * 0.6,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 16 - 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        s: Math.random() * 6 + 4,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
      draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.vy += 0.35;
          p.vx *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.restore();
        }
      };
    } else {
      const size = 16;
      const cols = Math.ceil(w / size);
      const drops = Array.from({ length: cols }, () => Math.random() * -50);
      const glyphs = '01アカサタナハマヤラワ$#{}[]<>kubectl';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      draw = () => {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8ab4f8';
        ctx.font = `${size}px monospace`;
        drops.forEach((y, i) => {
          ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
          drops[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 0.5;
        });
      };
    }

    const loop = (t) => {
      draw();
      if (t - start < duration) raf = requestAnimationFrame(loop);
      else setEgg(null);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [egg]);

  if (!egg) return null;

  return (
    <canvas
      ref={canvasRef}
      onClick={() => setEgg(null)}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 200,
        pointerEvents: egg === 'matrix' ? 'auto' : 'none',
        cursor: 'pointer',
      }}
    />
  );
}
