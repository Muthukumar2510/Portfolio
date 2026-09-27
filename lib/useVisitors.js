import { useEffect, useState } from 'react';

const BEAT_MS = 30_000;

function storage(fn) {
  try {
    return fn(localStorage);
  } catch {
    return null;
  }
}

// One shared poller for the whole app; counts a browser once per day and heartbeats while the tab is visible.
let listeners = new Set();
let latest = null;
let started = false;

function publish(stats) {
  latest = stats;
  window.__visits = stats?.total ?? null;
  listeners.forEach((l) => l(stats));
}

function start() {
  if (started) return;
  started = true;
  const sid =
    storage((s) => s.getItem('visit-sid')) ||
    (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).replace(/-/g, '').slice(0, 24);
  storage((s) => s.setItem('visit-sid', sid));
  const today = new Date().toISOString().slice(0, 10);

  const beat = async (count) => {
    try {
      const r = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, count }),
      });
      const stats = await r.json();
      if (stats.total == null) return false;
      if (count) storage((s) => s.setItem('visit-day', today));
      publish(stats);
      return true;
    } catch {
      return false;
    }
  };

  beat(storage((s) => s.getItem('visit-day')) !== today).then((ok) => {
    if (!ok) return;
    setInterval(() => !document.hidden && beat(false), BEAT_MS);
    document.addEventListener('visibilitychange', () => !document.hidden && beat(false));
  });
}

export default function useVisitors() {
  const [stats, setStats] = useState(latest);
  useEffect(() => {
    listeners.add(setStats);
    start();
    return () => listeners.delete(setStats);
  }, []);
  return stats;
}
