import { useState } from 'react';
import styles from './ArchitectureDiagram.module.css';

const CELL_W = 200;
const CELL_H = 110;
const NODE_W = 160;
const NODE_H = 56;

// Clickable system diagram from a project's front matter:
//   architecture:
//     nodes: [{ id, label, sub, note, col, row }]
//     links: [[fromId, toId], ...]
export default function ArchitectureDiagram({ spec }) {
  const nodes = spec?.nodes || [];
  const [active, setActive] = useState(nodes[0]?.id);
  if (!nodes.length) return null;

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.ceil(Math.max(...nodes.map((n) => n.row))) + 1;
  const W = cols * CELL_W;
  const H = rows * CELL_H;
  const cx = (n) => n.col * CELL_W + CELL_W / 2;
  const cy = (n) => n.row * CELL_H + CELL_H / 2;
  const current = byId[active];

  // Straight link between node edges, trimmed so arrows stop at the box.
  const line = (a, b) => {
    const dx = cx(b) - cx(a);
    const dy = cy(b) - cy(a);
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const pad = (u, half) => (Math.abs(u) > 1e-6 ? half / Math.abs(u) : Infinity);
    const ta = Math.min(pad(ux, NODE_W / 2), pad(uy, NODE_H / 2));
    const tb = Math.min(pad(ux, NODE_W / 2), pad(uy, NODE_H / 2)) + 6;
    return { x1: cx(a) + ux * ta, y1: cy(a) + uy * ta, x2: cx(b) - ux * tb, y2: cy(b) - uy * tb };
  };

  return (
    <figure className={styles.wrap}>
      <figcaption className={styles.caption}>Architecture: select a component to see why it's there.</figcaption>
      <div className={styles.scroll}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} style={{ minWidth: Math.min(W, 560) }} role="group" aria-label="Architecture diagram">
          <defs>
            <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrow} />
            </marker>
          </defs>
          {(spec.links || []).map(([a, b]) => {
            if (!byId[a] || !byId[b]) return null;
            const l = line(byId[a], byId[b]);
            const on = active === a || active === b;
            return <line key={`${a}-${b}`} {...l} className={`${styles.link} ${on ? styles.linkOn : ''}`} markerEnd="url(#arch-arrow)" />;
          })}
          {nodes.map((n) => (
            <g
              key={n.id}
              transform={`translate(${cx(n) - NODE_W / 2}, ${cy(n) - NODE_H / 2})`}
              className={`${styles.node} ${active === n.id ? styles.nodeOn : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={active === n.id}
              onClick={() => setActive(n.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActive(n.id))}
            >
              <rect width={NODE_W} height={NODE_H} rx="12" className={styles.box} />
              <text x={NODE_W / 2} y={n.sub ? 24 : 33} textAnchor="middle" className={styles.label}>
                {n.label}
              </text>
              {n.sub && (
                <text x={NODE_W / 2} y={42} textAnchor="middle" className={styles.sub}>
                  {n.sub}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      {current?.note && (
        <div className={styles.note} aria-live="polite">
          <strong>{current.label}</strong>
          <p>{current.note}</p>
        </div>
      )}
    </figure>
  );
}
