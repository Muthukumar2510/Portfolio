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
    let stopStr = [];
    let meta = null;
    let muted = 'rgb(128,128,128)';
    let dark = false;
    let raf = 0;
    let last = 0;
    let t = 0;
    let lastSlot = null;
    let slots = [];
    let hero = null;
    let quiet = null;
    const mouse = { x: -9999, y: -9999, active: 0 };

    const rand = (i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Per-particle colour along a blue → violet → teal gradient, so every shape reads as one continuous stroke.
    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      const stops = ['--story-1', '--story-2', '--story-3'].map((v) => hexToRgb(css.getPropertyValue(v).trim() || '#1a73e8'));
      stopStr = stops.map((c) => `rgb(${c.join(',')})`);
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
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // Phones resize the viewport as the browser bar shows/hides: keep the field, just resize the canvas.
      const minorResize = n && nw === w && Math.abs(nh - h) < 160;
      w = nw;
      h = nh;
      // Size the canvas in CSS pixels exactly (not 100vh), so it's never stretched and stays sharp.
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (minorResize) return;
      const target = fine && w >= 768 ? 520 : 240;
      const gap = Math.sqrt((w * h) / target);
      grid = [];
      let i = 0;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap, i++) {
          grid.push({ x: x + (rand(i) - 0.5) * gap * 0.7, y: y + (rand(i + 7) - 0.5) * gap * 0.7, phase: rand(i + 3) * 6.28, speed: 0.3 + rand(i + 5) * 0.5, layer: Math.floor(rand(i + 11) * 3) });
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
      if (hero && hero.getBoundingClientRect().bottom > h * 0.35) return { hero: true };
      let best = null;
      let bestD = Infinity;
      for (const el of slots) {
        const id = el.dataset.storySlot;
        if (!SHAPES[id]) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue; // hidden stage (e.g. the side column on small screens)
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

    const quietRect = () => quiet?.getBoundingClientRect();

    // Sampling a shape is the expensive part, so it's cached: rebuilt only when the section progress moves a step,
    // the stage size changes, or (for animated shapes) 1/20 s has passed. Target objects are reused every frame.
    let cacheKey = '';
    let cached = null;
    let cachedLines = null;
    let tgt = [];
    // 0–2 hero depth layers, 3 shape in flight, 4 shape sparkles, 5 shape highlights, 6 hero behind the intro text.
    const buckets = Array.from({ length: 7 }, () => []);
    const nearList = [];
    const ensureTargets = () => {
      if (tgt.length !== n) tgt = Array.from({ length: n }, () => ({ x: 0, y: 0, lit: false, ghost: false, shape: false, layer: 0 }));
    };
    const sampleCached = (id, fn, p, aspect, sx, sy) => {
      const key = `${id}|${Math.round(p * 60)}|${Math.round(t * 20)}|${Math.round(aspect * 20)}|${Math.round(sx)}|${Math.round(sy)}|${n}`;
      if (key !== cacheKey) {
        cacheKey = key;
        cachedLines = fn(p, t, aspect);
        cached = sample(cachedLines, n, sx, sy);
      }
      return cached;
    };

    const targets = (sc) => {
      ensureTargets();
      if (sc.hero) {
        meta = null;
        // Three depth layers drift and parallax at different rates, so the field reads as 3D space.
        const sy = window.scrollY;
        for (let i = 0; i < n; i++) {
          const g = grid[i];
          const o = tgt[i];
          const depth = [0.35, 0.7, 1.2][g.layer];
          o.x = g.x + Math.sin(t * g.speed * depth + g.phase) * 4 * depth;
          o.y = g.y + Math.cos(t * g.speed * 0.8 * depth + g.phase) * 4 * depth - sy * 0.15 * depth;
          o.lit = false;
          o.ghost = false;
          o.shape = false;
          o.layer = g.layer;
        }
        return tgt;
      }
      const section = sc.el.closest('section');
      const sr = section ? section.getBoundingClientRect() : sc.r;
      const p = clamp((h * 0.55 - sr.top) / Math.max(1, sr.height));
      const fn = SHAPES[sc.id];
      let ox;
      let oy;
      let sx;
      let sy;
      if (fn.fit === 'rect') {
        // Wide/tall stages: the shape fills the whole box and adapts to its aspect ratio.
        sx = sc.r.width;
        sy = sc.r.height;
        ox = sc.r.left;
        oy = sc.r.top;
        meta = { cx: ox + sx / 2, cy: oy + sy / 2, s: Math.min(sx, sy) * 1.4, ox, oy, sx, sy };
      } else {
        // Square shapes keep circles round; the picture sits at the slot's inner edge (right on desktop).
        const s = Math.min(sc.r.width, sc.r.height);
        const cx = sc.r.width > s * 1.2 && w >= 600 ? sc.r.right - s / 2 : sc.r.left + sc.r.width / 2;
        const cy = sc.r.top + sc.r.height / 2;
        sx = s;
        sy = s;
        ox = cx - s / 2;
        oy = cy - s / 2;
        meta = { cx, cy, s, ox: cx - s / 2, oy: cy - s / 2, sx: s, sy: s };
      }
      const pts = sampleCached(sc.id, fn, p, fn.fit === 'rect' ? sx / sy : 1, sx, sy);
      for (let i = 0; i < n; i++) {
        const q = pts[i];
        const o = tgt[i];
        o.x = ox + q.x * sx;
        o.y = oy + q.y * sy;
        o.lit = q.lit;
        o.ghost = q.ghost;
        o.shape = true;
      }
      // Typical spacing between neighbours along the path, used to decide which neighbours to join.
      let sum = 0;
      let cnt = 0;
      for (let i = 1; i < n; i += 4) {
        const dd = Math.hypot(tgt[i].x - tgt[i - 1].x, tgt[i].y - tgt[i - 1].y);
        if (dd < 40) {
          sum += dd;
          cnt++;
        }
      }
      meta.gap = Math.max(4, (cnt ? sum / cnt : 4) * 3);
      return tgt;
    };

    let lastScene = '';
    const draw = (dt) => {
      const sc = scene();
      const sceneId = sc.hero ? 'top' : sc.id;
      if (sceneId !== lastScene) {
        lastScene = sceneId;
        document.documentElement.dataset.scene = sceneId;
      }
      const tg = targets(sc);
      const quiet = sc.hero ? quietRect() : null;
      // Same feel at 30, 60 or 120 fps; particles later in the path settle a touch later, so shapes "draw" in.
      const base = dt ? 1 - Math.exp(-dt * 4.2) : 1;
      ctx.clearRect(0, 0, w, h);
      // A soft halo behind the picture gives it depth without competing with the text.
      if (meta) {
        const halo = ctx.createRadialGradient(meta.cx, meta.cy, 0, meta.cx, meta.cy, meta.s * 0.75);
        halo.addColorStop(0, stopStr[1] || '#888');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = dark ? 0.16 : 0.1;
        ctx.fillStyle = halo;
        ctx.fillRect(meta.cx - meta.s, meta.cy - meta.s, meta.s * 2, meta.s * 2);
        ctx.globalAlpha = 1;
      }
      // One gradient for the whole picture (dots and strokes), so drawing can be batched into a few paths.
      let grad = null;
      if (meta) {
        grad = ctx.createLinearGradient(meta.cx - meta.s / 2, meta.cy - meta.s / 2, meta.cx + meta.s / 2, meta.cy + meta.s / 2);
        stopStr.forEach((c, j) => grad.addColorStop(j / Math.max(1, stopStr.length - 1), c));
      }
      // Batches: particles are collected by look, then each batch is one path of tiny squares (identical to
      // circles at 1–3 px, far cheaper to rasterise than hundreds of separate arc() fills).
      for (const b of buckets) b.length = 0;
      const near = nearList;
      near.length = 0;
      let settledSum = 0;
      let visible = 0;
      for (let i = 0; i < n; i++) {
        const p = parts[i];
        const g = tg[i];
        let tx = g.x;
        let ty = g.y;
        let nr = 0;
        if (fine && mouse.active > 0.01) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 170) {
            nr = (1 - dist / 170) * mouse.active;
            const lift = nr * nr * (g.shape ? 14 : 36);
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
        const settle = clamp(1 - Math.hypot(tx - p.x, ty - p.y) / 140);
        p.settle = settle;
        p.ghost = g.ghost;
        if (g.ghost) continue;
        if (g.shape) {
          visible++;
          settledSum += settle;
          if (settle < 0.6) buckets[3].push(i);
          else if (p.lit > 0.5) buckets[5].push(i);
          else if (i % 6 === 0) buckets[4].push(i); // a few sparkles on top of the strokes
        } else if (nr > 0.1) {
          near.push(i);
          p.near = nr;
        } else if (quiet && p.x > quiet.left - 16 && p.x < quiet.right + 16 && p.y > quiet.top - 16 && p.y < quiet.bottom + 16) {
          buckets[6].push(i);
        } else {
          buckets[g.layer].push(i);
        }
      }
      const boost = dark ? 1.15 : 1;
      const fillBucket = (idx, size, alpha, style) => {
        if (!idx.length) return;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = style;
        ctx.beginPath();
        for (const i of idx) ctx.rect(parts[i].x - size / 2, parts[i].y - size / 2, size, size);
        ctx.fill();
      };
      fillBucket(buckets[0], 1.4, 0.14 * boost, muted);
      fillBucket(buckets[1], 2, 0.24 * boost, muted);
      fillBucket(buckets[2], 3, 0.36 * boost, muted);
      fillBucket(buckets[6], 2, 0.08 * boost, muted);
      if (grad) {
        // Settled dots fade as the crisp vector lines take over (see below).
        const fade = 1 - clamp((settledSum / Math.max(1, visible) - 0.7) / 0.25);
        fillBucket(buckets[3], 2, dark ? 0.2 : 0.25, grad);
        fillBucket(buckets[4], 2.2, (dark ? 0.42 : 0.5) * fade, grad);
        fillBucket(buckets[5], 3.2, 0.85 * fade, grad);
      }
      // The few particles right under the cursor get their own colour and size.
      for (const i of near) {
        const p = parts[i];
        const size = 2 + p.near * 2.8;
        ctx.globalAlpha = Math.min(1, 0.3 + p.near * 0.6);
        ctx.fillStyle = colors[i];
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // Join neighbouring particles (they're ordered along the path) into smooth gradient strokes.
      const settledRatio = settledSum / Math.max(1, visible);
      // While particles are still flying in, neighbours are joined into strokes; once the shape has formed, the
      // real vector lines take over (crisp at any pixel density) and the particle strokes fade out.
      const vectorAlpha = meta ? clamp((settledRatio - 0.7) / 0.25) : 0;
      if (meta && settledRatio > 0.2 && vectorAlpha < 1) {
        const gap = meta.gap;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = clamp((settledRatio - 0.2) / 0.4) * (1 - vectorAlpha) * (dark ? 0.95 : 0.85);
        if (dark && fine) {
          ctx.shadowColor = stopStr[1];
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        for (let i = 1; i < n; i++) {
          const a = parts[i - 1];
          const b = parts[i];
          if (!a.ghost && !b.ghost && a.settle > 0.55 && b.settle > 0.55 && Math.hypot(b.x - a.x, b.y - a.y) < gap) {
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      if (meta && vectorAlpha > 0 && cachedLines) {
        const { ox, oy, sx, sy } = meta;
        ctx.strokeStyle = grad;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (dark && fine) {
          ctx.shadowColor = stopStr[1];
          ctx.shadowBlur = 8;
        }
        for (const litPass of [false, true]) {
          ctx.lineWidth = litPass ? 2.6 : 1.8;
          ctx.globalAlpha = vectorAlpha * (litPass ? 1 : dark ? 0.95 : 0.85);
          ctx.beginPath();
          for (const l of cachedLines) {
            if (l.ghost || Boolean(l.lit) !== litPass) continue;
            const pts = l.pts;
            // Draw only the revealed part of the line (shapes that grow as you scroll).
            const r = l.reveal ?? 1;
            if (r <= 0) continue;
            let total = 0;
            for (let k = 1; k < pts.length; k++) total += Math.hypot((pts[k][0] - pts[k - 1][0]) * sx, (pts[k][1] - pts[k - 1][1]) * sy);
            let left = total * Math.min(1, r);
            ctx.moveTo(ox + pts[0][0] * sx, oy + pts[0][1] * sy);
            for (let k = 1; k < pts.length && left > 0; k++) {
              const x0 = ox + pts[k - 1][0] * sx;
              const y0 = oy + pts[k - 1][1] * sy;
              const x1 = ox + pts[k][0] * sx;
              const y1 = oy + pts[k][1] * sy;
              const seg = Math.hypot(x1 - x0, y1 - y0);
              const f = seg > left ? left / seg : 1;
              ctx.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
              left -= seg;
            }
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    // Phones and tablets run the "light" tier: 30 fps and no glow, to save battery and keep scrolling smooth.
    // Desktop runs 60 fps while you scroll or move the mouse and 30 fps when the page is still.
    let activeUntil = 0;
    const frame = (now) => {
      if (!last) last = now - 1000 / 60;
      const dt = Math.min(0.05, (now - last) / 1000);
      const minFrame = fine && now < activeUntil ? 0 : 1 / 30;
      if (dt < minFrame) {
        raf = document.hidden ? 0 : requestAnimationFrame(frame);
        return;
      }
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
      activeUntil = performance.now() + 600;
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
    const onScroll = () => {
      activeUntil = performance.now() + 600;
      if (reduced) draw(0);
    };
    const onTheme = () => {
      readColors();
      if (reduced) draw(0);
    };

    const init = () => {
      slots = [...document.querySelectorAll('[data-story-slot]')];
      hero = document.getElementById('top');
      quiet = document.querySelector('[data-story-quiet]');
      layout();
      draw(0);
      start();
    };
    // Start after the page is idle, so the particle system never competes with first paint or hydration.
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const idleId = ric(init, { timeout: 2500 });
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('app:theme', onTheme);
    document.addEventListener('visibilitychange', start);
    return () => {
      (window.cancelIdleCallback || clearTimeout)(idleId);
      delete document.documentElement.dataset.scene;
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
