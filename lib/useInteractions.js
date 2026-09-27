import { useEffect } from 'react';

// Delegated pointer effects: [data-spotlight] gets --mx/--my, [data-tilt] tilts, [data-magnetic] follows the cursor.
export default function useInteractions() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    let tilted = null;
    let magnet = null;

    const reset = (el) => {
      if (el) el.style.transform = '';
    };

    const onMove = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;

      const spot = t.closest('[data-spotlight]');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      const tilt = t.closest('[data-tilt]');
      if (tilted && tilted !== tilt) reset(tilted);
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
      }

      const mag = t.closest('[data-magnetic]');
      if (magnet && magnet !== mag) reset(magnet);
      magnet = mag;
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`;
      }
    };

    const onLeave = () => {
      reset(tilted);
      reset(magnet);
      tilted = magnet = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);
}
