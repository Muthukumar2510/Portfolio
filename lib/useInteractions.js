import { useEffect } from 'react';

// Delegated pointer effect: [data-spotlight] cards get --mx/--my so a soft light follows the cursor (desktop only).
export default function useInteractions() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const onMove = (e) => {
      const spot = e.target instanceof Element ? e.target.closest('[data-spotlight]') : null;
      if (!spot) return;
      const r = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
      spot.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}
