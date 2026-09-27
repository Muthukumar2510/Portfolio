// Shared (as .mjs so plain Node can run it) by scripts/monitor.mjs (writes checks) and pages/api/status.js (reads them).
export const CHECKS_KEY = 'portfolio:checks';
export const CHECK_INTERVAL_MIN = 15;
export const RETENTION_DAYS = 90;
export const MAX_CHECKS = (RETENTION_DAYS * 24 * 60) / CHECK_INTERVAL_MIN;

export function redisConfig(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export async function redis(cfg, commands) {
  const r = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).map((x) => x.result);
}

const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : null);

// checks: newest first, each { t, ok, ms, code }.
export function summarize(checks, now = Date.now()) {
  const within = (days) => checks.filter((c) => now - c.t <= days * 86_400_000);
  const uptime = (list) => (list.length ? (list.filter((c) => c.ok).length / list.length) * 100 : null);
  const lat = within(1)
    .filter((c) => c.ok)
    .map((c) => c.ms)
    .sort((a, b) => a - b);

  // One bar per day for the last 90 days (null = no data).
  const days = Array.from({ length: RETENTION_DAYS }, (_, i) => {
    const start = new Date(now - (RETENTION_DAYS - 1 - i) * 86_400_000);
    start.setUTCHours(0, 0, 0, 0);
    const end = start.getTime() + 86_400_000;
    const list = checks.filter((c) => c.t >= start.getTime() && c.t < end);
    return { date: start.toISOString().slice(0, 10), uptime: uptime(list), checks: list.length };
  });

  // Incidents: runs of consecutive failed checks.
  const incidents = [];
  let run = null;
  for (const c of [...checks].reverse()) {
    if (!c.ok) {
      if (!run) run = { start: c.t, end: c.t, checks: 0, code: c.code };
      run.end = c.t;
      run.checks++;
    } else if (run) {
      incidents.push({ ...run, resolved: c.t });
      run = null;
    }
  }
  if (run) incidents.push({ ...run, resolved: null });

  // Latency sparkline: last 24h, oldest first.
  const spark = within(1)
    .slice()
    .reverse()
    .map((c) => (c.ok ? c.ms : null));

  const latest = checks[0] || null;
  return {
    status: !latest ? 'unknown' : latest.ok ? 'operational' : 'down',
    lastCheck: latest?.t ?? null,
    uptime: { d1: uptime(within(1)), d7: uptime(within(7)), d30: uptime(within(30)), d90: uptime(within(90)) },
    latency: { p50: pct(lat, 50), p95: pct(lat, 95) },
    spark,
    days,
    incidents: incidents.reverse().slice(0, 10),
    total: checks.length,
  };
}
