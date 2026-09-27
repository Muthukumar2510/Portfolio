import { useEffect, useState } from 'react';

// Counts a browser once per day; later loads the same day only read the total.
export default function VisitorCount({ className }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let counted = false;
    try {
      counted = localStorage.getItem('visit-day') === today;
    } catch {}
    fetch('/api/visits', { method: counted ? 'GET' : 'POST' })
      .then((r) => r.json())
      .then(({ count }) => {
        if (count == null) return;
        try {
          localStorage.setItem('visit-day', today);
        } catch {}
        window.__visits = count;
        setCount(count);
      })
      .catch(() => {});
  }, []);

  if (count == null) return null;
  return (
    <span className={className}>
      <span aria-hidden="true">●</span> {count.toLocaleString()} visits
    </span>
  );
}
