import { useEffect, useState } from 'react';

// One /api/trace request per page load, shared by every component that shows the edge/latency.
let pending = null;
let latest = null;
const listeners = new Set();

export function loadTrace(force = false) {
  if (pending && !force) return pending;
  const t0 = performance.now();
  pending = fetch('/api/trace', { cache: 'no-store' })
    .then((r) => r.json())
    .then((data) => {
      latest = { ...data, rtt: Math.round(performance.now() - t0) };
      listeners.forEach((l) => l(latest));
      return latest;
    })
    .catch(() => null);
  return pending;
}

export default function useTrace() {
  const [trace, setTrace] = useState(latest);
  useEffect(() => {
    listeners.add(setTrace);
    loadTrace();
    return () => listeners.delete(setTrace);
  }, []);
  return trace;
}
