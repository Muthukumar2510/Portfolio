import { redisConfig, redis } from '../../lib/monitor.mjs';

// Latest quality-gate result published by scripts/quality.mjs on main. null until the first run.
export const QUALITY_KEY = 'portfolio:quality';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  const cfg = redisConfig();
  if (!cfg) return res.status(200).json(null);
  try {
    const [raw] = await redis(cfg, [['GET', QUALITY_KEY]]);
    return res.status(200).json(raw ? JSON.parse(raw) : null);
  } catch {
    return res.status(200).json(null);
  }
}
