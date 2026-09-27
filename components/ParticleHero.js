import { useEffect, useRef, useState } from 'react';
import styles from './ParticleHero.module.css';

const SHAPES = [
  { key: 'cloud', label: 'cloud' },
  { key: 'initials', label: 'muthukumar' },
  { key: 'k8s', label: 'kubernetes' },
];
const AUTO_MS = 7000;

// Draws a shape on an offscreen canvas and returns sampled pixel positions, normalised to 0..1.
function sampleShape(key, initials, font) {
  const S = 400;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.lineCap = 'round';

  if (key === 'cloud') {
    g.beginPath();
    g.arc(140, 230, 70, 0, Math.PI * 2);
    g.arc(215, 175, 90, 0, Math.PI * 2);
    g.arc(295, 225, 68, 0, Math.PI * 2);
    g.fill();
    g.fillRect(140, 225, 160, 75);
  } else if (key === 'initials') {
    g.font = `700 210px ${font}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(initials, S / 2, S / 2 + 10);
  } else {
    const cx = S / 2;
    const cy = S / 2;
    g.lineWidth = 22;
    g.beginPath();
    for (let i = 0; i <= 7; i++) {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const r = 165;
      i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath();
    g.stroke();
    g.lineWidth = 16;
    g.beginPath();
    g.arc(cx, cy, 72, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
      g.lineTo(cx + Math.cos(a) * 128, cy + Math.sin(a) * 128);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, 22, 0, Math.PI * 2);
    g.fill();
  }

  const data = g.getImageData(0, 0, S, S).data;
  const pts = [];
  const step = 5;
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      if (data[(y * S + x) * 4 + 3] > 128) pts.push([x / S, y / S]);
    }
  }
  return pts;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ParticleHero({ initials }) {
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const [shape, setShape] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const font = getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif';

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let shapeIdx = 0;
    let lastSwitch = performance.now();
    const pointer = { x: -9999, y: -9999, active: false };

    const targets = SHAPES.map((s) => shuffle(sampleShape(s.key, initials, font)));
    const count = Math.max(...targets.map((t) => t.length));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      size: 1.2 + Math.random() * 1.5,
      tone: Math.random(),
    }));

    function colors() {
      const css = getComputedStyle(document.documentElement);
      return { accent: css.getPropertyValue('--accent').trim() || '#1a73e8', text: css.getPropertyValue('--text').trim() || '#111' };
    }
    let palette = colors();

    function layout() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      assign(shapeIdx, false);
    }

    function assign(idx, burst) {
      const pts = targets[idx];
      const size = Math.min(w, h) * 0.92;
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;
      particles.forEach((p, i) => {
        const [nx, ny] = pts[i % pts.length];
        p.tx = ox + nx * size;
        p.ty = oy + ny * size;
        if (burst) {
          const a = Math.random() * Math.PI * 2;
          const f = 4 + Math.random() * 10;
          p.vx += Math.cos(a) * f;
          p.vy += Math.sin(a) * f;
        }
        if (p.x <= 1 && p.y <= 1) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }
      });
    }

    function go(idx) {
      shapeIdx = (idx + SHAPES.length) % SHAPES.length;
      lastSwitch = performance.now();
      assign(shapeIdx, !reduced);
      setShape(shapeIdx);
      if (reduced) draw(true);
    }
    apiRef.current = { go: (i) => go(i), next: () => go(shapeIdx + 1) };

    function draw(settle) {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.16;
      for (const p of particles) {
        if (settle) {
          p.x = p.tx;
          p.y = p.ty;
        } else {
          p.vx += (p.tx - p.x) * 0.045;
          p.vy += (p.ty - p.y) * 0.045;
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const force = (1 - d / R) * 9;
              p.vx += (dx / d) * force;
              p.vy += (dy / d) * force;
            }
          }
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
        const speed = Math.min(Math.hypot(p.vx, p.vy) / 6, 1);
        ctx.globalAlpha = 0.55 + p.tone * 0.35 + speed * 0.1;
        ctx.fillStyle = p.tone > 0.72 || speed > 0.4 ? palette.accent : palette.text;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      if (!pointer.active && now - lastSwitch > AUTO_MS) go(shapeIdx + 1);
      draw(false);
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    }

    function start() {
      if (!raf && !reduced) raf = requestAnimationFrame(frame);
    }

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    }
    const onMove = (e) => toLocal(e);
    const onLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    const onVis = () => (document.hidden ? null : start());
    const onTheme = () => {
      palette = colors();
      if (reduced) draw(true);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) draw(true);
    });

    layout();
    if (reduced) draw(true);
    else start();
    document.fonts?.ready.then(() => {
      targets[1] = shuffle(sampleShape('initials', initials, font));
      if (shapeIdx === 1) assign(1, false);
      if (reduced) draw(true);
    });
    io.observe(canvas);
    ro.observe(canvas);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && onLeave());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('app:theme', onTheme);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('app:theme', onTheme);
    };
  }, [initials]);

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={() => apiRef.current?.next()}
        role="img"
        aria-label={`Particle illustration showing a ${SHAPES[shape].label}`}
      />
      <div className={styles.dots} role="tablist" aria-label="Illustration">
        {SHAPES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={shape === i}
            className={shape === i ? styles.dotOn : styles.dot}
            onClick={() => apiRef.current?.go(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
