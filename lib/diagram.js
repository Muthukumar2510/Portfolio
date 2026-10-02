// Diagrams as code. A diagram is plain data (see content/diagrams.js):
//
//   {
//     size: [12, 5], sizeTall: [6, 11],              // grid units; the tall layout is used on phones
//     nodes: [{ id, label, sub, kind, at: [x, y], atTall: [x, y], lit }],
//     links: [{ from, to, label, dash, lit, via: [[x, y]], viaTall }],
//     notes: [{ text, at, atTall, point, pointTall }],   // handwritten annotation + arrow
//     dims:  [{ from, to, label, fromTall, toTall }],     // dimension line
//   }
//
// layout(diagram, mode) turns it into drawing primitives (paths and text) in viewBox units. Two renderers use them:
// <Blueprint> (React SVG, animated draw-in) and toSvgString() (a flat SVG for watermarks and share images).
// kinds: box (default) · circle · store (cylinder) · user · cloud.

export const U = 40; // viewBox units per grid unit

const SIZES = {
  box: [3, 1.4],
  circle: [1.5, 1.5],
  store: [2.4, 1.6],
  user: [1.6, 1.6],
  cloud: [3, 1.7],
};

const f = (n) => Math.round(n * 10) / 10;
const P = ([x, y]) => `${f(x * U)} ${f(y * U)}`;
const poly = (pts) => 'M' + pts.map(P).join('L');

function nodeShape(n) {
  const [w, h] = SIZES[n.kind] || SIZES.box;
  const [cx, cy] = n.pos;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = 0.18;
  switch (n.kind) {
    case 'circle': {
      const R = (w / 2) * U;
      return `M${f(cx * U - R)} ${f(cy * U)}a${f(R)} ${f(R)} 0 1 0 ${f(2 * R)} 0a${f(R)} ${f(R)} 0 1 0 ${f(-2 * R)} 0`;
    }
    case 'store': {
      const e = 0.22;
      const rx = (w / 2) * U;
      const ry = e * U;
      return (
        `M${f(x * U)} ${f((y + e) * U)}a${f(rx)} ${f(ry)} 0 1 0 ${f(w * U)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-w * U)} 0` +
        `V${f((y + h - e) * U)}a${f(rx)} ${f(ry)} 0 0 0 ${f(w * U)} 0V${f((y + e) * U)}`
      );
    }
    case 'user': {
      const hr = 0.32 * U;
      return (
        `M${f(cx * U - hr)} ${f((y + 0.42) * U)}a${f(hr)} ${f(hr)} 0 1 0 ${f(2 * hr)} 0a${f(hr)} ${f(hr)} 0 1 0 ${f(-2 * hr)} 0` +
        `M${f(x * U + 0.1 * U)} ${f((y + h) * U)}q${f(0.7 * U)} ${f(-1.1 * U)} ${f((w - 0.2) * U)} 0`
      );
    }
    case 'cloud': {
      const b = (y + h) * U;
      return (
        `M${f((x + 0.4) * U)} ${f(b)}a${f(0.4 * U)} ${f(0.4 * U)} 0 0 1 ${f(0.1 * U)} ${f(-0.8 * U)}` +
        `a${f(0.6 * U)} ${f(0.6 * U)} 0 0 1 ${f(1.1 * U)} ${f(-0.5 * U)}a${f(0.55 * U)} ${f(0.55 * U)} 0 0 1 ${f(0.95 * U)} ${f(0.35 * U)}` +
        `a${f(0.45 * U)} ${f(0.45 * U)} 0 0 1 ${f(0.05 * U)} ${f(0.95 * U)}Z`
      );
    }
    default:
      return (
        `M${f((x + r) * U)} ${f(y * U)}H${f((x + w - r) * U)}q${f(r * U)} 0 ${f(r * U)} ${f(r * U)}V${f((y + h - r) * U)}` +
        `q0 ${f(r * U)} ${f(-r * U)} ${f(r * U)}H${f((x + r) * U)}q${f(-r * U)} 0 ${f(-r * U)} ${f(-r * U)}V${f((y + r) * U)}q0 ${f(-r * U)} ${f(r * U)} ${f(-r * U)}Z`
      );
  }
}

// Where the segment from a node's centre towards `to` leaves the node's outline.
function edgePoint(n, to) {
  const [w, h] = SIZES[n.kind] || SIZES.box;
  const [cx, cy] = n.pos;
  const dx = to[0] - cx;
  const dy = to[1] - cy;
  if (!dx && !dy) return n.pos;
  const pad = 0.12;
  if (n.kind === 'circle' || n.kind === 'user') {
    // People and circles carry their label underneath, so links leaving downwards start below the label.
    if (dy > Math.abs(dx)) return [cx, cy + h / 2 + 0.55];
    const r = w / 2 + pad;
    const d = Math.hypot(dx, dy);
    return [cx + (dx / d) * r, cy + (dy / d) * r];
  }
  const sx = dx ? (w / 2 + pad) / Math.abs(dx) : Infinity;
  const sy = dy ? (h / 2 + pad) / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
}

const arrowHead = (from, to) => {
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const l = 0.22;
  const p = (da) => [to[0] - Math.cos(a + da) * l, to[1] - Math.sin(a + da) * l];
  return poly([p(0.45), to, p(-0.45)]);
};

// mode: 'wide' | 'tall'. Returns { w, h, items } with items: { t: 'path' | 'text', ... } in viewBox units.
export function layout(diagram, mode = 'wide') {
  const tall = mode === 'tall' && diagram.sizeTall;
  const pick = (o, key) => (tall && o[`${key}Tall`]) || o[key];
  const [gw, gh] = tall ? diagram.sizeTall : diagram.size;
  const nodes = Object.fromEntries((diagram.nodes || []).map((n) => [n.id, { ...n, pos: pick(n, 'at') }]));
  const items = [];

  for (const l of diagram.links || []) {
    const a = nodes[l.from];
    const b = nodes[l.to];
    if (!a || !b) continue;
    const via = pick(l, 'via') || [];
    const start = edgePoint(a, via[0] || b.pos);
    const end = edgePoint(b, via[via.length - 1] || a.pos);
    const pts = [start, ...via, end];
    const cls = l.lit ? 'lit' : l.dash ? 'dash' : 'line';
    items.push({ t: 'path', d: poly(pts), c: cls });
    items.push({ t: 'path', d: arrowHead(pts[pts.length - 2], end), c: l.lit ? 'lit' : 'line' });
    if (l.label) {
      const mid = Math.floor((pts.length - 1) / 2);
      const [x1, y1] = pts[mid];
      const [x2, y2] = pts[mid + 1];
      const vertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
      items.push(
        vertical
          ? { t: 'text', x: ((x1 + x2) / 2) * U + 9, y: ((y1 + y2) / 2) * U + 4, s: l.label, c: 'linkLabel', a: 'start' }
          : { t: 'text', x: ((x1 + x2) / 2) * U, y: ((y1 + y2) / 2) * U - 8, s: l.label, c: 'linkLabel', a: 'middle' }
      );
    }
  }

  for (const n of Object.values(nodes)) {
    const [, h] = SIZES[n.kind] || SIZES.box;
    items.push({ t: 'path', d: nodeShape(n), c: n.lit ? 'nodeLit' : 'node' });
    const below = n.kind === 'user' || n.kind === 'circle';
    const ly = below ? (n.pos[1] + h / 2) * U + 16 : n.pos[1] * U + (n.sub ? -2 : 5);
    if (n.label) items.push({ t: 'text', x: n.pos[0] * U, y: ly, s: n.label, c: 'label', a: 'middle' });
    if (n.sub) items.push({ t: 'text', x: n.pos[0] * U, y: ly + 15, s: n.sub, c: 'sub', a: 'middle' });
  }

  for (const d of diagram.dims || []) {
    const a = pick(d, 'from');
    const b = pick(d, 'to');
    const horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
    const t = 0.18;
    const tick = (p) => (horiz ? poly([[p[0], p[1] - t], [p[0], p[1] + t]]) : poly([[p[0] - t, p[1]], [p[0] + t, p[1]]]));
    items.push({ t: 'path', d: poly([a, b]) + tick(a) + tick(b), c: 'dim' });
    if (d.label) {
      const x = ((a[0] + b[0]) / 2) * U + (horiz ? 0 : -8);
      const y = ((a[1] + b[1]) / 2) * U + (horiz ? -6 : 0);
      items.push({ t: 'text', x, y, s: d.label, c: 'dimLabel', a: 'middle', r: horiz ? 0 : -90 });
    }
  }

  for (const n of diagram.notes || []) {
    const at = pick(n, 'at');
    const point = pick(n, 'point');
    items.push({ t: 'text', x: at[0] * U, y: at[1] * U, s: n.text, c: 'note', a: 'start' });
    if (point) {
      // Handwriting is ~0.2 grid units per character; start beside the line nearest the target.
      const lines = n.text.split('\n');
      const width = Math.max(...lines.map((t) => t.length)) * 0.2;
      const right = point[0] > at[0] + width / 2;
      const above = point[1] < at[1];
      const s = [right ? at[0] + width + 0.15 : at[0] - 0.2, above ? at[1] - 0.3 : at[1] + (lines.length - 1) * 0.55 + 0.15];
      const mx = (s[0] + point[0]) / 2;
      const my = (s[1] + point[1]) / 2;
      const nx = -(point[1] - s[1]);
      const ny = point[0] - s[0];
      const k = 0.25;
      const c = [mx + nx * k, my + ny * k];
      items.push({ t: 'path', d: `M${P(s)}Q${P(c)} ${P(point)}`, c: 'noteArrow' });
      items.push({ t: 'path', d: arrowHead(c, point), c: 'noteArrow' });
    }
  }

  return { w: gw * U, h: gh * U, items };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A flat, self-contained SVG. `lines` = only the line work (watermarks); colours are baked in.
export function toSvgString(diagram, { mode = 'wide', ink = '#1f4fbf', lines = false, strokeWidth = 1.2 } = {}) {
  const { w, h, items } = layout(diagram, mode);
  const body = items
    .filter((i) => i.t === 'path' || !lines)
    .filter((i) => !lines || i.c !== 'noteArrow')
    .map((i) =>
      i.t === 'path'
        ? `<path d="${i.d}"${i.c === 'dash' || i.c === 'dim' ? ' stroke-dasharray="5 6"' : ''}/>`
        : `<text x="${f(i.x)}" y="${f(i.y)}"${i.r ? ` transform="rotate(${i.r} ${f(i.x)} ${f(i.y)})"` : ''} text-anchor="${i.a}" font-family="monospace" font-size="11" fill="${ink}" stroke="none">${String(i.s)
            .split('\n')
            .map((line, n) => `<tspan x="${f(i.x)}" dy="${n ? '1.15em' : 0}">${esc(line)}</tspan>`)
            .join('')}</text>`
    )
    .join('');
  const m = U * 0.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-m} ${-m} ${w + 2 * m} ${h + 2 * m}" fill="none" stroke="${ink}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
