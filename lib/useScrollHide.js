import { useEffect, useState } from 'react';

const THRESHOLD_PX = 240;
const JITTER_PX = 6;

// { hidden, scrolled }: hide on scroll down past the threshold, show again on scroll up.
export default function useScrollHide() {
  const [state, setState] = useState({ hidden: false, scrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setState((s) => {
          const scrolled = y > 8;
          let hidden = s.hidden;
          if (Math.abs(y - lastY) > JITTER_PX) {
            hidden = y > lastY && y > THRESHOLD_PX;
            lastY = y;
          }
          return hidden === s.hidden && scrolled === s.scrolled ? s : { hidden, scrolled };
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return state;
}
