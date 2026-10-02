import { useEffect, useMemo, useRef, useState } from 'react';
import { WATERMARKS } from '../../lib/storyShapes';
import { DIAGRAMS, WATERMARK_DIAGRAMS } from '../../content/diagrams';
import { toSvgString } from '../../lib/diagram';
import styles from './Watermark.module.css';

// A large, faint technical drawing behind a section (shapes in lib/storyShapes.js → WATERMARKS).
// Decorative, so it stays out of the server HTML: when its section comes near the screen it is drawn as one <img> (an SVG data URI),
// which the browser rasterises once — no SVG nodes to style or lay out, nothing to repaint while scrolling.
// The ink colour comes from --watermark-ink and is redrawn when the theme changes.
function toDataUri(lines, ink) {
  const d = (l) => 'M' + l.pts.map(([x, y]) => `${(x * 100).toFixed(1)} ${(y * 100).toFixed(1)}`).join('L');
  const paths = lines
    .map((l) => `<path d="${d(l)}"${l.dash ? ' stroke-dasharray="1 1.6"' : ''}/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 104" fill="none" stroke="${ink}" stroke-width="0.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Sections with a diagram in content/diagrams.js get that diagram's line work; the rest keep their drawing.
const diagramUri = (diagram, ink) =>
  `data:image/svg+xml,${encodeURIComponent(toSvgString(diagram, { ink, lines: true, strokeWidth: 1.4 }))}`;

export default function Watermark({ id }) {
  const mark = useMemo(() => {
    const diagram = DIAGRAMS[WATERMARK_DIAGRAMS[id]];
    return diagram ? { side: WATERMARKS[id]?.side || 'right', diagram } : WATERMARKS[id];
  }, [id]);
  const [src, setSrc] = useState(null);
  const anchor = useRef(null);

  useEffect(() => {
    if (!mark || !anchor.current) return;
    const root = document.documentElement;
    const draw = () => {
      const ink = getComputedStyle(root).getPropertyValue('--watermark-ink').trim();
      setSrc(mark.diagram ? diagramUri(mark.diagram, ink) : toDataUri(mark.draw(), ink));
    };
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        drawn = true;
        draw();
      },
      { rootMargin: '50% 0px' }
    );
    near.observe(anchor.current.parentElement);
    let drawn = false;
    const themeWatch = new MutationObserver(() => drawn && draw());
    themeWatch.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      near.disconnect();
      themeWatch.disconnect();
    };
  }, [mark]);

  if (!mark) return null;
  if (!src) return <span ref={anchor} hidden />;
  // A generated data URI: nothing for next/image to optimise.
  return <img src={src} alt="" aria-hidden="true" decoding="async" className={`${styles.mark} ${styles[mark.side]}`} />;
}
