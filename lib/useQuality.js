import { useEffect, useState } from 'react';

// Latest published quality-gate result (see scripts/quality.mjs). undefined = loading, null = none yet.
let pending = null;

export default function useQuality() {
  const [q, setQ] = useState(undefined);
  useEffect(() => {
    let alive = true;
    pending ||= fetch('/api/quality')
      .then((r) => r.json())
      .catch(() => null);
    pending.then((v) => alive && setQ(v));
    return () => {
      alive = false;
    };
  }, []);
  return q;
}
