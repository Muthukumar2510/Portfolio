import { regionName } from '../../lib/regions';

const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// Describes the path this request took: visitor location, edge PoP, function region, Redis round trip.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const start = Date.now();

  // x-vercel-id looks like "bom1::iad1::abcde-123"; the first segment is the edge that received the request.
  const id = String(req.headers['x-vercel-id'] || '');
  const edge = id.includes('::') ? id.split('::')[0] : null;
  const fnRegion = process.env.VERCEL_REGION || null;
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(String(req.headers['x-vercel-ip-city'])) : null;
  const country = req.headers['x-vercel-ip-country'] || null;

  let redisMs = null;
  if (URL && TOKEN) {
    const t = Date.now();
    try {
      const r = await fetch(`${URL}/ping`, { headers: { Authorization: `Bearer ${TOKEN}` } });
      if (r.ok) redisMs = Date.now() - t;
    } catch {}
  }

  res.status(200).json({
    visitor: { city, country },
    edge: { code: edge, name: edge ? regionName(edge) : 'local' },
    fn: { code: fnRegion, name: fnRegion ? regionName(fnRegion) : 'local' },
    redisMs,
    serverMs: Date.now() - start,
    commit: process.env.NEXT_PUBLIC_COMMIT,
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME,
  });
}
