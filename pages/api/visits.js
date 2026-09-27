// Visitor stats backed by Upstash Redis (or Vercel KV, which exposes the same REST API).
const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const P = 'portfolio:';
const ONLINE_WINDOW_MS = 60_000;

const dayKey = (d) => `${P}day:${d.toISOString().slice(0, 10)}`;

async function pipeline(commands) {
  const r = await fetch(`${URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).map((x) => x.result);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL || !TOKEN) return res.status(200).json({ total: null });
  if (req.method !== 'POST') return res.status(405).end();

  const sid = String(req.body?.sid || '').replace(/[^a-z0-9]/gi, '').slice(0, 32);
  const count = req.body?.count === true;
  const now = Date.now();
  const today = new Date(now);
  const week = Array.from({ length: 7 }, (_, i) => dayKey(new Date(now - i * 86_400_000)));

  const cmds = [];
  if (count) cmds.push(['INCR', `${P}total`], ['INCR', week[0]], ['EXPIRE', week[0], 8 * 86_400]);
  if (sid) cmds.push(['ZADD', `${P}online`, now, sid]);
  cmds.push(
    ['ZREMRANGEBYSCORE', `${P}online`, 0, now - ONLINE_WINDOW_MS],
    ['ZCARD', `${P}online`],
    ['GET', `${P}total`],
    ['MGET', ...week]
  );

  try {
    const out = await pipeline(cmds);
    const [online, total, days] = out.slice(-3);
    const perDay = days.map((v) => Number(v) || 0);
    return res.status(200).json({
      total: Number(total) || 0,
      today: perDay[0],
      week: perDay.reduce((a, b) => a + b, 0),
      online: Math.max(Number(online) || 0, 1),
      date: dayKey(today).slice(-10),
    });
  } catch {
    return res.status(200).json({ total: null });
  }
}
