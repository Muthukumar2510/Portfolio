import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Which home-page section is in the middle of the viewport ('' elsewhere).
export default function useActiveSection(ids) {
  const [active, setActive] = useState('');
  const { asPath } = useRouter();
  const key = ids.join(',');

  useEffect(() => {
    setActive('');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    key.split(',').forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [asPath, key]);

  return active;
}
