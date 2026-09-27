import { ImageResponse } from 'next/og';

// Share-card colours are fixed (not theme tokens): the image is rendered server-side, outside the page.
const BG = '#0d0f12';
const FG = '#e6e8eb';
const MUTED = '#8b929c';
const ACCENT = '#8ab4f8';

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const title = (searchParams.get('title') || 'Portfolio').slice(0, 90);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 80);

  const dots = Array.from({ length: 140 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 8 * Math.sqrt(i) * 1.6;
    return { x: 960 + Math.cos(a) * r, y: 315 + Math.sin(a) * r, o: 0.25 + (i % 5) * 0.15 };
  });

  const image = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: BG, position: 'relative', padding: 80 }}>
        {dots.map((d, i) => (
          <div key={i} style={{ position: 'absolute', left: d.x, top: d.y, width: 5, height: 5, background: ACCENT, opacity: d.o }} />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 760 }}>
          <div style={{ fontSize: 28, color: ACCENT, marginBottom: 24 }}>{subtitle}</div>
          <div style={{ fontSize: 68, fontWeight: 700, color: FG, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 24, color: MUTED, marginTop: 32 }}>Cloud · DevOps · Platform engineering</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
  res.end(Buffer.from(await image.arrayBuffer()));
}
