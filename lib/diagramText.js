// Write a diagram as text; the site lays it out and draws it (lib/diagram.js). One line per link or note:
//
//   You (user) -> DNS : lookup            node kinds in brackets: user, store, cloud, circle (default: box)
//   DNS -> Vercel edge (cloud) : PoP      ": label" names the link
//   Vercel edge -> /api/trace : HTTPS !   "!" at the end = the lit path (what matters)
//   /api/trace -> Redis (store) : ping ~  "~" at the end = dashed (async, optional)
//   note: static pages stop here @ Vercel edge
//   # a comment
//
// Layout is automatic: nodes appear left to right in the order they are first mentioned (top to bottom on phones);
// a node that only hangs off the previous one (like a datastore) drops below it. Good for chains, which is most systems.

const KINDS = new Set(['user', 'store', 'cloud', 'circle', 'box']);

function parseNode(raw) {
  const m = raw.trim().match(/^(.*?)\s*(?:\((\w+)\))?$/);
  const label = (m?.[1] || raw).trim();
  const kind = KINDS.has(m?.[2]) ? m[2] : undefined;
  return { label, kind };
}

const idOf = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'node';

export function parseDiagramText(text, title) {
  const nodes = new Map();
  const links = [];
  const notes = [];
  const add = (raw) => {
    const { label, kind } = parseNode(raw);
    const id = idOf(label);
    if (!nodes.has(id)) nodes.set(id, { id, label, kind, order: nodes.size });
    else if (kind) nodes.get(id).kind = kind;
    return id;
  };

  for (const line of String(text).split('\n')) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const note = l.match(/^note:\s*(.+?)\s*@\s*(.+)$/i);
    if (note) {
      notes.push({ text: note[1], target: idOf(parseNode(note[2]).label) });
      continue;
    }
    const link = l.match(/^(.+?)\s*->\s*(.+?)(?:\s*:\s*(.*?))?\s*([!~])?$/);
    if (!link) continue;
    const from = add(link[1]);
    const to = add(link[2]);
    links.push({ from, to, label: link[3] || undefined, lit: link[4] === '!', dash: link[4] === '~' });
  }
  if (!nodes.size) return null;

  // A node is a "leaf" if its only link comes from the previous node and nothing continues from it:
  // draw it below that node instead of extending the row (e.g. a function and its datastore).
  const list = [...nodes.values()];
  const outDeg = (id) => links.filter((k) => k.from === id).length;
  const inFrom = (id) => links.filter((k) => k.to === id).map((k) => k.from);
  let col = -1;
  for (const n of list) {
    const parents = inFrom(n.id);
    const prev = list[n.order - 1];
    const leaf = prev && outDeg(n.id) === 0 && parents.length === 1 && parents[0] === prev.id && prev.col !== undefined && !prev.below;
    if (leaf && list.slice(n.order + 1).length === 0) {
      n.col = prev.col;
      n.below = true;
    } else {
      col += 1;
      n.col = col;
    }
  }
  const cols = col + 1;
  const STEP = 3.8;
  const ROW = 2.4;
  const nodeOut = list.map((n) => ({
    id: n.id,
    label: n.label,
    kind: n.kind,
    at: [1.8 + n.col * STEP, n.below ? ROW + 2.3 : ROW],
    // Phones: one vertical chain; a leaf simply continues it.
    atTall: [2.4, 1.2 + n.col * 2.6 + (n.below ? 2.6 : 0)],
  }));
  const pos = Object.fromEntries(nodeOut.map((n) => [n.id, n]));
  const noteOut = notes
    .filter((n) => pos[n.target])
    .map((n) => {
      const t = pos[n.target];
      return {
        text: n.text.replace(/\s*\\n\s*/g, '\n'),
        at: [t.at[0] - 1.4, t.at[1] + 2.2],
        point: [t.at[0] - 0.3, t.at[1] + 0.95],
        atTall: [4.2, t.atTall[1] + 0.3],
        pointTall: [3.8, t.atTall[1]],
      };
    });

  const hasBelow = list.some((n) => n.below);
  return {
    title,
    size: [Math.max(6, 1.8 * 2 + (cols - 1) * STEP), hasBelow || noteOut.length ? 5.6 : 4],
    sizeTall: [7.4, Math.max(4, 1.2 + (cols - 1 + (hasBelow ? 1 : 0)) * 2.6 + 2.4)],
    nodes: nodeOut,
    links,
    notes: noteOut,
  };
}
