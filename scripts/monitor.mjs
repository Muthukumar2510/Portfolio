#!/usr/bin/env node
// Synthetic check run by .github/workflows/monitor.yml every 15 minutes.
// Records { t, ok, ms, code } to Redis; exits 1 on failure so GitHub emails the repo owner.
import { CHECKS_KEY, MAX_CHECKS, redisConfig, redis } from '../lib/monitor.mjs';

const SITE = (process.env.SITE_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 10_000;
const SLOW_MS = 3_000;

async function probe(path) {
  const t0 = Date.now();
  try {
    const r = await fetch(`${SITE}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': 'portfolio-monitor' } });
    await r.arrayBuffer();
    return { ok: r.ok, code: r.status, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, code: e.name === 'TimeoutError' ? 'timeout' : 'network', ms: Date.now() - t0 };
  }
}

if (!SITE) {
  console.error('SITE_URL is not set');
  process.exit(2);
}

const [home, api] = await Promise.all([probe('/'), probe('/api/trace')]);
const check = {
  t: Date.now(),
  ok: home.ok && api.ok && home.ms < SLOW_MS * 3,
  ms: home.ms,
  code: home.ok ? api.code : home.code,
};
console.log(`home ${home.code} ${home.ms}ms · api ${api.code} ${api.ms}ms → ${check.ok ? 'OK' : 'FAIL'}`);

const cfg = redisConfig();
if (cfg) {
  await redis(cfg, [
    ['LPUSH', CHECKS_KEY, JSON.stringify(check)],
    ['LTRIM', CHECKS_KEY, 0, MAX_CHECKS - 1],
  ]);
} else {
  console.warn('Redis not configured; check not stored.');
}

process.exit(check.ok ? 0 : 1);
