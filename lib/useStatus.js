import { useEffect, useState } from 'react';

const REFRESH_MS = 60_000;

// Uptime summary from /api/status. Returns null while loading.
export default function useStatus() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/status')
        .then((r) => r.json())
        .then((d) => alive && setData(d))
        .catch(() => alive && setData({ status: 'unknown' }));
    load();
    const t = setInterval(() => !document.hidden && load(), REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return data;
}

export const fmtPct = (v) => (v == null ? '—' : `${v >= 99.995 ? '100' : v.toFixed(2)}%`);
