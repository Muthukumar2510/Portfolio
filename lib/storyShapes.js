// Shapes the story particles form for each home section (see components/StoryField.js).
// Each shape returns polylines in a unit box [0,1]² plus which ones are "lit" (drawn in the accent colour).
// `p` = scroll progress through the section (0 → 1), `t` = time in seconds.

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const circle = (cx, cy, r, rot = 0, sy = 1, steps = 48) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * sy;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });
const clamp = (v) => Math.max(0, Math.min(1, v));

// Work: servers scale out as you scroll, like an autoscaling group under load.
function servers(p) {
  const count = 2 + Math.round(clamp(p * 1.3) * 10);
  const lines = [];
  for (let i = 0; i < count; i++) {
    const c = i % 4;
    const r = Math.floor(i / 4);
    lines.push({ pts: rect(0.04 + c * 0.24, 0.12 + r * 0.27, 0.19, 0.19), lit: i === count - 1 });
  }
  return lines;
}

// About: concentric rings, an identity/fingerprint.
const identity = (p, t) => [0.12, 0.24, 0.36, 0.46].map((r, i) => ({ pts: circle(0.5, 0.5, r, t * 0.1 * (i % 2 ? -1 : 1)), lit: i === 0 }));

// Experience: a timeline whose milestones light up as you pass them.
function timeline(p) {
  const lines = [{ pts: [[0.5, 0.02], [0.5, 0.98]], lit: false }];
  for (let i = 0; i < 4; i++) {
    const y = 0.12 + i * 0.25;
    lines.push({ pts: circle(0.5, y, 0.05, 0, 1, 20), lit: p * 1.1 > i / 4 });
    lines.push({ pts: [[0.58, y], [0.9 - i * 0.06, y]], lit: p * 1.1 > i / 4 });
  }
  return lines;
}

// Skills: tools orbiting a core.
const orbits = (p, t) => [
  { pts: circle(0.5, 0.5, 0.06), lit: true },
  { pts: circle(0.5, 0.5, 0.22, t * 0.35, 0.45), lit: false },
  { pts: circle(0.5, 0.5, 0.34, -t * 0.25 + 1, 0.4), lit: false },
  { pts: circle(0.5, 0.5, 0.46, t * 0.18 + 2, 0.35), lit: false },
];

// Certifications: a badge with a check mark that draws itself.
function badge(p) {
  const hex = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [0.5 + Math.cos(a) * 0.4, 0.5 + Math.sin(a) * 0.4];
  });
  const k = clamp(p * 1.6);
  const check = [[0.34, 0.52], [0.45, 0.63]];
  if (k > 0.4) check.push([0.45 + (0.66 - 0.45) * clamp((k - 0.4) / 0.6), 0.63 - (0.63 - 0.38) * clamp((k - 0.4) / 0.6)]);
  return [{ pts: hex, lit: false }, { pts: check, lit: true }];
}

// Talks & moments: a camera; the lens pulses like a shutter.
const camera = (p, t) => [
  { pts: rect(0.1, 0.28, 0.8, 0.5), lit: false },
  { pts: rect(0.32, 0.18, 0.2, 0.1), lit: false },
  { pts: circle(0.5, 0.53, 0.16 + Math.sin(t * 2) * 0.01), lit: true },
  { pts: circle(0.5, 0.53, 0.08), lit: true },
];

// Writing: lines of text type out; leftover particles gather at the caret.
function writing(p) {
  const widths = [0.9, 0.75, 0.85, 0.6, 0.8, 0.45];
  const typed = clamp(p * 1.4) * widths.length;
  const lines = [];
  let caret = [0.05, 0.1];
  widths.forEach((w, i) => {
    const k = clamp(typed - i);
    if (k <= 0) return;
    const y = 0.1 + i * 0.16;
    lines.push({ pts: [[0.05, y], [0.05 + w * k, y]], lit: false });
    caret = [0.05 + w * k + 0.03, y];
  });
  lines.push({ pts: [[caret[0], caret[1] - 0.05], [caret[0], caret[1] + 0.05]], lit: true, weight: 0.4 });
  return lines;
}

// How this site runs: four hops (browser → edge → function → Redis) with packets flowing between them.
function network(p, t) {
  const xs = [0.08, 0.36, 0.64, 0.92];
  const lines = xs.map((x) => ({ pts: rect(x - 0.06, 0.42, 0.12, 0.16), lit: false }));
  lines.push({ pts: [[0.14, 0.5], [0.86, 0.5]], lit: false, weight: 0.3 });
  for (let k = 0; k < 5; k++) {
    const f = (t * 0.25 + k / 5) % 1;
    const x = 0.14 + f * 0.72;
    lines.push({ pts: circle(x, 0.5, 0.018, 0, 1, 8), lit: true, weight: 0.5 });
  }
  return lines;
}

// Contact: everything folds into an envelope.
const envelope = () => [
  { pts: rect(0.1, 0.25, 0.8, 0.5), lit: false },
  { pts: [[0.1, 0.25], [0.5, 0.55], [0.9, 0.25]], lit: true },
];

export const SHAPES = {
  projects: servers,
  about: identity,
  experience: timeline,
  skills: orbits,
  certifications: badge,
  moments: camera,
  writing,
  operations: network,
  contact: envelope,
};

// Spreads n particles along the polylines in proportion to their length (× optional weight).
export function sample(lines, n) {
  const segs = [];
  let total = 0;
  for (const l of lines) {
    const wgt = l.weight ?? 1;
    for (let i = 1; i < l.pts.length; i++) {
      const [x1, y1] = l.pts[i - 1];
      const [x2, y2] = l.pts[i];
      const len = Math.hypot(x2 - x1, y2 - y1) * wgt || 0.001;
      segs.push({ x1, y1, x2, y2, len, start: total, lit: l.lit });
      total += len;
    }
  }
  const out = new Array(n);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = ((i + 0.5) / n) * total;
    while (s < segs.length - 1 && segs[s].start + segs[s].len < d) s++;
    const g = segs[s];
    const f = Math.min(1, (d - g.start) / g.len);
    out[i] = { x: g.x1 + (g.x2 - g.x1) * f, y: g.y1 + (g.y2 - g.y1) * f, lit: g.lit };
  }
  return out;
}
