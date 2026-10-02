import experience from '../content/experience';

// The illustration for each home section, drawn as inline SVG by components/motion/StoryArt.js.
// Each shape returns polylines in a unit box [0,1]² plus which ones are "lit" (drawn heavier).
// `p` = progress (StoryArt renders the finished state, p = 1), `t` = time in seconds (0).
// Lines marked `ghost`, or beyond `reveal` (0–1), are hidden at that progress.

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const circle = (cx, cy, r, rot = 0, sy = 1, steps = 48) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * sy;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });
const clamp = (v) => Math.max(0, Math.min(1, v));

// About: concentric rings, an identity/fingerprint.
const identity = (p, t) => [0.12, 0.24, 0.36, 0.46].map((r, i) => ({ pts: circle(0.5, 0.5, r, t * 0.1 * (i % 2 ? -1 : 1)), lit: i === 0 }));

// Certifications: a badge with a check mark that draws itself.
function badge(p) {
  const hex = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [0.5 + Math.cos(a) * 0.4, 0.5 + Math.sin(a) * 0.4];
  });
  const check = [[0.34, 0.52], [0.45, 0.63], [0.66, 0.38]];
  return [{ pts: hex, lit: false }, { pts: check, lit: true, reveal: clamp(p * 1.6) }];
}

// Writing: lines of text type out behind a blinking caret.
function writing(p) {
  const widths = [0.9, 0.75, 0.85, 0.6, 0.8, 0.45];
  const typed = clamp(p * 1.4) * widths.length;
  const lines = [];
  let caret = [0.05, 0.1];
  widths.forEach((w, i) => {
    const k = clamp(typed - i);
    const y = 0.1 + i * 0.16;
    lines.push({ pts: [[0.05, y], [0.05 + w, y]], lit: false, reveal: k });
    if (k > 0) caret = [0.05 + w * k + 0.03, y];
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
const envelope = (p, t) => [
  { pts: rect(0.1, 0.25, 0.8, 0.5), lit: false },
  { pts: [[0.1, 0.25], [0.5, 0.55], [0.9, 0.25]], lit: true },
  { pts: [[0.1, 0.75], [0.4, 0.5]], lit: false, weight: 0.6 },
  { pts: [[0.9, 0.75], [0.6, 0.5]], lit: false, weight: 0.6 },
  // A heart-beat "sent" pulse above the envelope.
  { pts: circle(0.5, 0.12 - Math.sin(t * 1.5) * 0.02, 0.03, 0, 1, 12), lit: true, weight: 0.5 },
];


// ---- Shapes for wide ("band") and tall ("side") stages. They receive the stage's aspect ratio `a` (width / height)
// and draw in the full box, keeping circles round and servers square in real pixels.
const circleA = (cx, cy, r, a, steps = 20) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const ang = (i / steps) * Math.PI * 2;
    return [cx + (Math.cos(ang) * r) / a, cy + Math.sin(ang) * r];
  });

// Work: an autoscaling group. Servers join left to right as you scroll; packets run along the shared network.
function serverFarm(p, t, a) {
  const bh = 0.56;
  const bw = bh / a;
  const pitch = bw * 1.45;
  const max = Math.max(3, Math.floor(0.92 / pitch));
  const count = Math.min(max, 2 + Math.round(clamp(p * 1.4) * (max - 2)));
  const x0 = 0.5 - (max * pitch - (pitch - bw)) / 2;
  const lines = [];
  for (let i = 0; i < max; i++) {
    const x = x0 + i * pitch;
    const lit = i === count - 1;
    const ghost = i >= count;
    lines.push({ pts: rect(x, 0.08, bw, bh), lit, ghost });
    lines.push({ pts: [[x + bw * 0.18, 0.08 + bh * 0.55], [x + bw * 0.82, 0.08 + bh * 0.55]], lit, ghost, weight: 0.6 });
    lines.push({ pts: [[x + bw / 2, 0.08 + bh], [x + bw / 2, 0.88]], lit: false, ghost, weight: 0.5 });
  }
  const end = x0 + (count - 1) * pitch + bw / 2;
  const full = x0 + (max - 1) * pitch + bw / 2;
  lines.push({ pts: [[x0 + bw / 2, 0.88], [full, 0.88]], lit: false, weight: 0.5, reveal: (end - x0 - bw / 2) / Math.max(0.001, full - x0 - bw / 2) });
  for (let k = 0; k < 4; k++) {
    const f = (t * 0.18 + k / 4) % 1;
    lines.push({ pts: circleA(x0 + bw / 2 + f * (end - x0 - bw / 2), 0.88, 0.05, a, 8), lit: true, weight: 0.3 });
  }
  return lines;
}

// Skills: a constellation — one cluster of stars per tool group, linked as the board comes into view.
function constellation(p, t, a) {
  const clusters = [0.14, 0.38, 0.62, 0.86].map((x, i) => ({ x, y: i % 2 ? 0.62 : 0.38 }));
  const lines = [];
  const k = clamp(p * 1.8);
  clusters.forEach((c, i) => {
    const stars = [0, 1, 2].map((j) => {
      const ang = (j / 3) * Math.PI * 2 + i;
      return [c.x + (Math.cos(ang) * 0.26) / a, c.y + Math.sin(ang) * 0.26];
    });
    stars.forEach(([x, y], j) => lines.push({ pts: circleA(x, y, 0.045 + (Math.sin(t * 2 + i + j) > 0.7 ? 0.02 : 0), a, 10), lit: j === 0, weight: 0.5 }));
    lines.push({ pts: [...stars, stars[0]], lit: false, weight: 0.6 });
    if (i > 0) lines.push({ pts: [[clusters[i - 1].x, clusters[i - 1].y], [c.x, c.y]], lit: true, weight: 0.4, reveal: clamp((k - (i - 1) / 4) * 4) });
  });
  return lines;
}

// Moments: a film strip advancing through the gate; a flash fires as the section arrives.
function filmStrip(p, t, a) {
  const fh = 0.6;
  const fw = (fh * 1.4) / a;
  const pitch = fw * 1.15;
  const lines = [{ pts: [[0.02, 0.08], [0.98, 0.08]], lit: false, weight: 0.4 }, { pts: [[0.02, 0.92], [0.98, 0.92]], lit: false, weight: 0.4 }];
  const count = Math.max(1, Math.floor(0.95 / pitch));
  const x0 = 0.5 - (count * pitch - (pitch - fw)) / 2;
  for (let i = 0; i < count; i++) {
    // Frames "develop" one after another as the section scrolls in.
    lines.push({ pts: rect(x0 + i * pitch, 0.2, fw, fh), lit: false, reveal: clamp(p * 2.2 * count - i) });
  }
  const flash = p < 0.3;
  const len = 0.25 + Math.max(0, 0.3 - p) * 1.5;
  for (let r = 0; r < 8; r++) {
    const ang = (r / 8) * Math.PI * 2 + t * 0.3;
    lines.push({ pts: [[0.5 + (Math.cos(ang) * 0.12) / a, 0.5 + Math.sin(ang) * 0.12], [0.5 + (Math.cos(ang) * len) / a, 0.5 + Math.sin(ang) * len]], lit: true, weight: 0.5, ghost: !flash });
  }
  lines.push({ pts: circleA(0.5, 0.5, 0.12, a, 16), lit: true, weight: 0.5, ghost: flash });
  return lines;
}

// Experience: a git history. Each role is a commit on main; a feature branch forks and merges between them.
// Commits light up as you read; HEAD (the current role) pulses. Vertical in the tall column, horizontal as a band.
function gitGraph(p, t, a, roles = Math.max(2, experience.length)) {
  const vertical = a < 1;
  const P = (along, across) => (vertical ? [across, along] : [along, across]);
  const lines = [{ pts: [P(0.06, 0.35), P(0.94, 0.35)], lit: false }];
  const at = (i) => 0.12 + (i / Math.max(1, roles - 1)) * 0.76;
  const r = vertical ? 0.03 : 0.1;
  const circ = (x, y, rr) => (vertical ? circleA(x, y, rr * a, a, 16) : circleA(x, y, rr, a, 16));
  for (let i = 0; i < roles; i++) {
    const [x, y] = P(at(i), 0.35);
    const lit = p * 1.2 * roles > i;
    const pulse = i === 0 ? Math.sin(t * 3) * 0.2 + 1.2 : 1;
    lines.push({ pts: circ(x, y, r * pulse), lit });
    if (i < roles - 1) {
      // Feature branch: fork after this commit, curve out, merge before the next.
      const a0 = at(i) + 0.05;
      const a1 = at(i + 1) - 0.05;
      const curve = Array.from({ length: 13 }, (_, k) => {
        const f = k / 12;
        return P(a0 + (a1 - a0) * f, 0.35 + Math.sin(f * Math.PI) * 0.4);
      });
      lines.push({ pts: curve, lit: p * 1.2 * roles > i + 0.5, weight: 0.8 });
      const [bx, by] = P((a0 + a1) / 2, 0.75);
      lines.push({ pts: circ(bx, by, r * 0.6), lit: false, weight: 0.5 });
    }
  }
  return lines;
}

export const SHAPES = {
  projects: serverFarm,
  about: identity,
  experience: gitGraph,
  skills: constellation,
  certifications: badge,
  moments: filmStrip,
  writing,
  operations: network,
  contact: envelope,
};

// Shapes that fill their whole stage (and take its aspect ratio); the rest are drawn in a centred square.
for (const fn of [serverFarm, constellation, filmStrip, gitGraph]) fn.fit = 'rect';

// ---- Watermarks: large, faint technical drawings that sit behind a section and bleed off the page edge.
// Static line art (drawn once, never animated), same polyline format as above, in a unit box.

// Projects: an exploded server rack. Units slide out of the frame along dashed guide lines.
function rackExploded() {
  const lines = [{ pts: rect(0.08, 0.06, 0.34, 0.88) }];
  for (let i = 0; i < 6; i++) {
    const y = 0.1 + i * 0.14;
    const dx = i * 0.07;
    const x = 0.12 + dx;
    lines.push({ pts: rect(x, y, 0.3, 0.1) });
    lines.push({ pts: [[x + 0.03, y + 0.05], [x + 0.17, y + 0.05]] });
    lines.push({ pts: circle(x + 0.25, y + 0.05, 0.012, 0, 1, 10) });
    // Isometric depth: the unit's top and side faces.
    lines.push({ pts: [[x, y], [x + 0.06, y - 0.035], [x + 0.36, y - 0.035], [x + 0.36, y + 0.065], [x + 0.3, y + 0.1]] });
    lines.push({ pts: [[x + 0.3, y], [x + 0.36, y - 0.035]] });
    if (dx) lines.push({ pts: [[0.42, y + 0.05], [x, y + 0.05]], dash: true });
  }
  return lines;
}

// About: a drafting compass mid-arc over a measured circle.
function compass() {
  return [
    { pts: [[0.5, 0.1], [0.3, 0.75]] },
    { pts: [[0.5, 0.1], [0.72, 0.72]] },
    { pts: circle(0.5, 0.1, 0.04, 0, 1, 16) },
    { pts: [[0.42, 0.38], [0.6, 0.4]] },
    { pts: Array.from({ length: 25 }, (_, i) => {
      const a = Math.PI * (0.15 + (i / 24) * 0.7);
      return [0.51 + Math.cos(a) * 0.42, 0.42 + Math.sin(a) * 0.42];
    }) },
    { pts: [[0.1, 0.92], [0.92, 0.92]], dash: true },
    { pts: [[0.3, 0.88], [0.3, 0.96]] },
    { pts: [[0.72, 0.88], [0.72, 0.96]] },
  ];
}

// Experience: a long git history running down the page, branches forking off and merging back.
function gitHistory() {
  const lines = [{ pts: [[0.3, 0.02], [0.3, 0.98]] }];
  for (let i = 0; i < 6; i++) {
    const y = 0.08 + i * 0.16;
    lines.push({ pts: circle(0.3, y, 0.025, 0, 1, 14) });
    const curve = Array.from({ length: 13 }, (_, k) => {
      const f = k / 12;
      return [0.3 + Math.sin(f * Math.PI) * (0.25 + (i % 2) * 0.15), y + 0.02 + f * 0.12];
    });
    lines.push({ pts: curve, dash: i % 2 === 1 });
    lines.push({ pts: circle(0.3 + 0.25 + (i % 2) * 0.15, y + 0.08, 0.018, 0, 1, 12) });
  }
  return lines;
}

// Skills: a star chart. Concentric rings, meridians, and a few constellations.
function starChart() {
  const lines = [0.15, 0.3, 0.45].map((r) => ({ pts: circle(0.5, 0.5, r, 0, 1, 64) }));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI;
    lines.push({ pts: [[0.5 - Math.cos(a) * 0.45, 0.5 - Math.sin(a) * 0.45], [0.5 + Math.cos(a) * 0.45, 0.5 + Math.sin(a) * 0.45]], dash: true });
  }
  const groups = [
    [[0.25, 0.3], [0.33, 0.22], [0.42, 0.28], [0.4, 0.38]],
    [[0.6, 0.62], [0.7, 0.55], [0.78, 0.66], [0.68, 0.74]],
    [[0.3, 0.68], [0.38, 0.76], [0.48, 0.72]],
  ];
  for (const g of groups) {
    lines.push({ pts: g });
    for (const [x, y] of g) lines.push({ pts: circle(x, y, 0.012, 0, 1, 8) });
  }
  return lines;
}

// Certifications: a rosette seal with ribbon tails.
function seal() {
  const teeth = Array.from({ length: 49 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const r = i % 2 ? 0.3 : 0.33;
    return [0.5 + Math.cos(a) * r, 0.42 + Math.sin(a) * r];
  });
  return [
    { pts: teeth },
    { pts: circle(0.5, 0.42, 0.24, 0, 1, 48) },
    { pts: circle(0.5, 0.42, 0.2, 0, 1, 48), dash: true },
    { pts: [[0.42, 0.7], [0.36, 0.96], [0.43, 0.9], [0.48, 0.97], [0.5, 0.72]] },
    { pts: [[0.58, 0.7], [0.64, 0.96], [0.57, 0.9], [0.52, 0.97], [0.5, 0.72]] },
    { pts: [[0.42, 0.42], [0.48, 0.5], [0.6, 0.34]] },
  ];
}

// Moments: a camera, front view, lens rings and a flash.
function camera() {
  return [
    { pts: rect(0.1, 0.3, 0.8, 0.5) },
    { pts: [[0.3, 0.3], [0.36, 0.2], [0.56, 0.2], [0.62, 0.3]] },
    { pts: circle(0.5, 0.55, 0.19, 0, 1, 48) },
    { pts: circle(0.5, 0.55, 0.13, 0, 1, 48) },
    { pts: circle(0.5, 0.55, 0.06, 0, 1, 32), dash: true },
    { pts: rect(0.74, 0.36, 0.1, 0.06) },
    { pts: [[0.1, 0.4], [0.28, 0.4]] },
  ];
}

// Writing: a fountain pen nib and the lines it has written.
function nib() {
  const lines = [
    { pts: [[0.5, 0.05], [0.66, 0.35], [0.58, 0.6], [0.5, 0.68], [0.42, 0.6], [0.34, 0.35], [0.5, 0.05]] },
    { pts: [[0.5, 0.36], [0.5, 0.68]] },
    { pts: circle(0.5, 0.33, 0.03, 0, 1, 16) },
  ];
  [0.78, 0.86, 0.94].forEach((y, i) => lines.push({ pts: [[0.12, y], [0.88 - i * 0.18, y]], dash: i === 2 }));
  return lines;
}

// How this site runs: a small topology. Browser, edge, function and store, wired together.
function topology() {
  const nodes = [[0.15, 0.2], [0.5, 0.15], [0.82, 0.35], [0.5, 0.55], [0.2, 0.75], [0.75, 0.82]];
  const lines = nodes.map(([x, y]) => ({ pts: rect(x - 0.07, y - 0.05, 0.14, 0.1) }));
  [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [2, 5]].forEach(([a, b], i) =>
    lines.push({ pts: [nodes[a], nodes[b]], dash: i % 2 === 1 })
  );
  return lines;
}

// Contact: an envelope with a postmark and cancellation waves.
function postmark() {
  const lines = [
    { pts: rect(0.08, 0.3, 0.7, 0.45) },
    { pts: [[0.08, 0.3], [0.43, 0.56], [0.78, 0.3]] },
    { pts: circle(0.74, 0.3, 0.13, 0, 1, 40) },
    { pts: circle(0.74, 0.3, 0.09, 0, 1, 40), dash: true },
  ];
  for (let k = 0; k < 3; k++) {
    lines.push({ pts: Array.from({ length: 17 }, (_, i) => [0.62 + i * 0.02, 0.5 + k * 0.06 + Math.sin(i * 0.9) * 0.015]) });
  }
  return lines;
}

// side: which page edge the drawing bleeds off; alternating keeps the page balanced.
export const WATERMARKS = {
  projects: { draw: rackExploded, side: 'right' },
  about: { draw: compass, side: 'left' },
  experience: { draw: gitHistory, side: 'right' },
  skills: { draw: starChart, side: 'left' },
  certifications: { draw: seal, side: 'right' },
  moments: { draw: camera, side: 'left' },
  writing: { draw: nib, side: 'right' },
  operations: { draw: topology, side: 'left' },
  contact: { draw: postmark, side: 'right' },
};
