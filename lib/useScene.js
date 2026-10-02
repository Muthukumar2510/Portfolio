import { useEffect } from 'react';

// Sets <html data-scene="…"> to the home section crossing the middle of the screen, so the Backdrop glows
// can take that section's tint. One IntersectionObserver, no scroll listener.
export default function useScene() {
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (root.dataset.scene = e.target.id)),
      { rootMargin: '-50% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      delete root.dataset.scene;
    };
  }, []);
}
