import { useEffect, useRef, useState } from 'react';
import { layout } from '../../lib/diagram';
import styles from './Blueprint.module.css';

// Renders a diagram from content/diagrams.js as an ink drawing: line work, mono labels, handwritten notes,
// dimension lines. Draws itself in once when it first scrolls into view (static under reduced motion).
// Wide layout on larger screens, the tall layout (if the diagram has one) on phones — both server-rendered,
// CSS shows one, so nothing shifts.
function Drawing({ diagram, mode, className }) {
  const { w, h, items } = layout(diagram, mode);
  const m = 20;
  let k = 0;
  return (
    <svg className={`${styles.svg} ${className || ''}`} viewBox={`${-m} ${-m} ${w + 2 * m} ${h + 2 * m}`} aria-hidden="true" focusable="false">
      {items.map((i) => {
        k += 1;
        if (i.t === 'path') return <path key={k} d={i.d} pathLength="1" className={styles[i.c]} style={{ '--i': Math.min(k, 24) }} />;
        const lines = String(i.s).split('\n');
        return (
          <text key={k} x={i.x} y={i.y} textAnchor={i.a} className={styles[i.c]} transform={i.r ? `rotate(${i.r} ${i.x} ${i.y})` : undefined}>
            {lines.map((line, n) => (
              <tspan key={n} x={i.x} dy={n ? '1.15em' : 0}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export default function Blueprint({ diagram, caption, className = '' }) {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setDrawn(true);
        io.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!diagram) return null;
  return (
    <figure ref={ref} className={`${styles.figure} ${drawn ? styles.drawn : ''} ${className}`}>
      <Drawing diagram={diagram} mode="wide" className={diagram.sizeTall ? styles.wideOnly : ''} />
      {diagram.sizeTall && <Drawing diagram={diagram} mode="tall" className={styles.tallOnly} />}
      {(caption ?? diagram.title) && <figcaption className={styles.caption}>{caption ?? diagram.title}</figcaption>}
      <span className="sr-only">{describe(diagram)}</span>
    </figure>
  );
}

// A plain-text reading of the diagram for screen readers.
function describe(d) {
  const name = Object.fromEntries((d.nodes || []).map((n) => [n.id, n.label]));
  const links = (d.links || []).map((l) => `${name[l.from]} to ${name[l.to]}${l.label ? ` (${l.label})` : ''}`);
  const notes = (d.notes || []).map((n) => n.text.replace(/\n/g, ' '));
  return [d.title, links.join('; '), notes.join('; ')].filter(Boolean).join('. ');
}
