import { useEffect } from 'react';

// Adds .live to every home section currently on screen, so StoryArt's ambient motion runs only where it can be
// seen. One IntersectionObserver, no scroll listener.
export default function useScene() {
  useEffect(() => {
    const live = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)));
    document.querySelectorAll('main section[id]').forEach((el) => live.observe(el));
    return () => live.disconnect();
  }, []);
}
