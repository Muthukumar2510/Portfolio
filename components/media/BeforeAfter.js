import { useState } from 'react';
import Image from 'next/image';
import styles from './BeforeAfter.module.css';

// A sketch's before/after pair: the "after" image is revealed over the "before" one by a slider.
// The slider is a native range input, so it works with keyboard, touch and screen readers.
export default function BeforeAfter({ before, after, title }) {
  const [split, setSplit] = useState(50);
  if (!before || !after) return null;
  const blur = (img) => (img.blur ? { placeholder: 'blur', blurDataURL: img.blur } : {});
  const ratio = before.width && before.height ? `${before.width} / ${before.height}` : '16 / 10';
  return (
    <figure className={styles.figure}>
      <div className={styles.frame} style={{ '--split': `${split}%`, aspectRatio: ratio }}>
        <Image src={before.src} alt={`${title}: before`} fill sizes="(max-width: 1040px) 100vw, 1040px" className={styles.img} {...blur(before)} />
        <div className={styles.after}>
          <Image src={after.src} alt={`${title}: after`} fill sizes="(max-width: 1040px) 100vw, 1040px" className={styles.img} {...blur(after)} />
        </div>
        <span className={styles.rule} aria-hidden="true" />
        <span className={`${styles.stamp} ${styles.left}`} aria-hidden="true">
          before
        </span>
        <span className={`${styles.stamp} ${styles.right}`} aria-hidden="true">
          after
        </span>
      </div>
      <label className={styles.control}>
        <span className="sr-only">Show more of the before or after version</span>
        <input type="range" min="0" max="100" value={split} onChange={(e) => setSplit(Number(e.target.value))} className={styles.range} />
      </label>
      <figcaption className={styles.caption}>Drag to compare · before ← → after</figcaption>
    </figure>
  );
}
