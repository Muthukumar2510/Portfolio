// Visitor counter backed by Upstash Redis (or Vercel KV, which exposes the same REST API).
const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = 'portfolio:visits';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL || !TOKEN) return res.status(200).json({ count: null });
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  try {
    const op = req.method === 'POST' ? `incr/${KEY}` : `get/${KEY}`;
    const r = await fetch(`${URL}/${op}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const { result } = await r.json();
    return res.status(200).json({ count: Number(result) || 0 });
  } catch {
    return res.status(200).json({ count: null });
  }
}
