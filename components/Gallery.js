import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Router from 'next/router';
import styles from './Gallery.module.css';

// One 2x2 hero tile plus singles: 5 or 9 tiles fill complete rows at both 4 and 2 columns.
const tileCount = (n) => (n >= 9 ? 9 : n >= 5 ? 5 : n);

const blurProps = (img) => (img.blur ? { placeholder: 'blur', blurDataURL: img.blur } : {});

// size: 'default' (article pages) | 'hero' (home Moments, taller tiles).
// total: real photo count when `images` is only a preview; moreHref: where the "+N" tile goes.
export default function Gallery({ images, title, album, size = 'default', total, moreHref }) {
  const [open, setOpen] = useState(null);
  if (!images.length && !album) return null;

  const tiles = images.slice(0, tileCount(images.length));
  const hidden = (total ?? images.length) - tiles.length;
  const layout = images.length >= 5 ? 'many' : `n${images.length}`;
  const onTile = (i) => (hidden > 0 && i === tiles.length - 1 && moreHref ? Router.push(moreHref) : setOpen(i));

  return (
    <section className={`${styles.wrap} ${size === 'hero' ? styles.hero : ''}`} aria-label="Photos">
      {images.length > 0 && (
        <div className={`${styles.grid} ${styles[layout]}`}>
          {tiles.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.tile}
              onClick={() => onTile(i)}
              aria-label={hidden > 0 && i === tiles.length - 1 ? `See all ${total ?? images.length} photos` : `Open photo ${i + 1} of ${images.length}`}
            >
              <Image
                src={img.src}
                alt={`${title}, photo ${i + 1}`}
                {...blurProps(img)}
                fill
                sizes={i === 0 ? '(max-width: 720px) 100vw, 800px' : '(max-width: 720px) 50vw, 400px'}
              />
              {hidden > 0 && i === tiles.length - 1 && <span className={styles.more}>+{hidden}</span>}
            </button>
          ))}
        </div>
      )}
      {album && (
        <a href={album} target="_blank" rel="noopener noreferrer" className={styles.album}>
          View the full album on Google Photos ↗
        </a>
      )}
      {open !== null && <Lightbox images={images} start={open} title={title} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Lightbox({ images, start, title, onClose }) {
  const [i, setI] = useState(start);
  const touchX = useRef(null);
  const closeRef = useRef(null);
  const go = useCallback((d) => setI((x) => (x + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [go, onClose]);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        <Image key={images[i].src} src={images[i].src} alt={`${title}, photo ${i + 1}`} {...blurProps(images[i])} fill sizes="100vw" priority />
      </div>
      <div className={styles.bar} onClick={(e) => e.stopPropagation()}>
        <span>
          {i + 1} / {images.length}
        </span>
        <div className={styles.controls}>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo">←</button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo">→</button>
            </>
          )}
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>
    </div>
  );
}
