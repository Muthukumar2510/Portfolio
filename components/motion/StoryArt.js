import { SHAPES } from '../../lib/storyShapes';
import styles from './StoryArt.module.css';

// A section's illustration as crisp inline SVG, drawn from the same shapes in lib/storyShapes.js.
// Rendered on the server at its finished state; CSS draws the lines in once the section scrolls into view.
// Wide/tall shapes need the box's aspect ratio, so each stage has fixed ones (bands get a phone and a desktop version).
const H = 100;
const ASPECTS = { slot: [1], band: [8, 3.6], side: [0.6] };
// Rendered height (px) of each stage, so strokes come out ~1.5px / 2.5px on screen. (non-scaling-stroke would
// do this automatically but breaks the pathLength-based draw-in.)
const PX = { slot: [136], band: [120, 88], side: [520] };

// Cuts a polyline at fraction `f` (0–1) of its length, for shapes that are only partly revealed.
function trim(pts, f) {
  if (f >= 1) return pts;
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = lens.reduce((a, b) => a + b, 0) * f;
  const out = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left >= lens[i]) {
      out.push(pts[i + 1]);
      left -= lens[i];
    } else {
      const k = left / lens[i];
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
      break;
    }
  }
  return out;
}

function Drawing({ id, fn, aspect, px, className }) {
  const rect = fn.fit === 'rect';
  const a = rect ? aspect : 1;
  const w = H * a;
  const lines = fn(1, 0, a).filter((l) => !l.ghost && (l.reveal ?? 1) > 0);
  const gid = `story-${id}-${String(aspect).replace('.', '_')}`;
  return (
    <svg className={`${styles.svg} ${className || ''}`} viewBox={`0 0 ${w} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style={{ '--u': H / px }}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={H}>
          <stop offset="0" className={styles.s1} />
          <stop offset="0.5" className={styles.s2} />
          <stop offset="1" className={styles.s3} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gid})`}>
        {lines.map((l, i) => (
          <path
            key={i}
            d={'M' + trim(l.pts, l.reveal ?? 1).map(([x, y]) => `${(x * w).toFixed(2)} ${(y * H).toFixed(2)}`).join('L')}
            pathLength="1"
            className={l.lit ? styles.lit : styles.line}
            style={{ '--i': Math.min(i, 10) }}
          />
        ))}
      </g>
    </svg>
  );
}

export default function StoryArt({ id, stage = 'slot' }) {
  const fn = SHAPES[id];
  if (!fn) return null;
  const [wide, narrow] = ASPECTS[stage] || ASPECTS.slot;
  const [pxWide, pxNarrow] = PX[stage] || PX.slot;
  if (!narrow || fn.fit !== 'rect') return <Drawing id={id} fn={fn} aspect={wide} px={pxWide} />;
  return (
    <>
      <Drawing id={id} fn={fn} aspect={wide} px={pxWide} className={styles.wideOnly} />
      <Drawing id={id} fn={fn} aspect={narrow} px={pxNarrow} className={styles.narrowOnly} />
    </>
  );
}
