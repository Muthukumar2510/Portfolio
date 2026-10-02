import { useEffect } from 'react';

// Home-page section awareness, with IntersectionObservers only (no scroll listener):
// - <html data-scene="…"> = the section crossing the middle of the screen, so the Backdrop glows take its tint;
// - .live on every section currently on screen, so StoryArt's ambient motion runs only where it can be seen.
export default function useScene() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = document.querySelectorAll('main section[id]');
    const scene = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (root.dataset.scene = e.target.id)),
      { rootMargin: '-50% 0px -50% 0px' }
    );
    const live = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)));
    sections.forEach((el) => {
      scene.observe(el);
      live.observe(el);
    });
    return () => {
      scene.disconnect();
      live.disconnect();
      delete root.dataset.scene;
    };
  }, []);
}
