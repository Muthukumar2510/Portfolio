import { CHECKS_KEY, MAX_CHECKS, redisConfig, redis, summarize } from '../../lib/monitor.mjs';

// Summary of synthetic checks written by scripts/monitor.mjs. `status: 'unknown'` until monitoring runs.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  const cfg = redisConfig();
  if (!cfg) return res.status(200).json({ status: 'unknown', configured: false });
  try {
    const [raw] = await redis(cfg, [['LRANGE', CHECKS_KEY, 0, MAX_CHECKS - 1]]);
    const checks = (raw || []).map((s) => JSON.parse(s)).filter((c) => typeof c.t === 'number');
    return res.status(200).json({ configured: true, ...summarize(checks) });
  } catch {
    return res.status(200).json({ status: 'unknown', configured: true });
  }
}
