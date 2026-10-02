import { WATERMARKS } from '../../lib/storyShapes';
import styles from './Watermark.module.css';

// A large, faint technical drawing behind a section (shapes in lib/storyShapes.js → WATERMARKS).
// Static SVG: no JavaScript, no animation, no layout cost.
export default function Watermark({ id }) {
  const mark = WATERMARKS[id];
  if (!mark) return null;
  return (
    <svg className={`${styles.mark} ${styles[mark.side]}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {mark.draw().map((l, i) => (
        <path
          key={i}
          d={'M' + l.pts.map(([x, y]) => `${(x * 100).toFixed(2)} ${(y * 100).toFixed(2)}`).join('L')}
          className={l.dash ? styles.dash : undefined}
        />
      ))}
    </svg>
  );
}
