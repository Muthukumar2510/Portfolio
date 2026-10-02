import fs from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';
import { getEntry } from '../../lib/content';
import { toSvgString } from '../../lib/diagram';

// Share cards: blueprint paper, the title, and, for entries with a diagram (?entry=<slug>), that diagram drawn
// by the same engine as the page. Colours are fixed (not theme tokens): the image is rendered outside the page.
const BG = '#0b1424';
const GRID = 'rgba(138, 180, 248, 0.08)';
const FG = '#e6ebf3';
const MUTED = '#8d9bb1';
const INK = '#8ab4f8';

function entryDiagram(slug) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug || '')) return null;
  if (!fs.existsSync(path.join(process.cwd(), 'content', 'entries', `${slug}.md`))) return null;
  try {
    return getEntry('entries', slug).diagram || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const title = (searchParams.get('title') || 'Portfolio').slice(0, 90);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 80);
  const diagram = entryDiagram(searchParams.get('entry'));
  const svg = diagram ? toSvgString(diagram, { ink: INK, strokeWidth: 2 }) : null;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: BG,
          backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
          <div style={{ fontSize: 26, color: INK, marginBottom: 16 }}>{subtitle}</div>
          <div style={{ fontSize: diagram ? 54 : 68, fontWeight: 700, color: FG, lineHeight: 1.1 }}>{title}</div>
        </div>
        {svg ? (
          <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`} width={1072} height={300} style={{ objectFit: 'contain' }} alt="" />
        ) : (
          <div style={{ fontSize: 24, color: MUTED }}>Field notes from a cloud engineer</div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
  res.end(Buffer.from(await image.arrayBuffer()));
}
