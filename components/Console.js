import { useEffect, useState } from 'react';
import Terminal from './Terminal/Terminal';
import styles from './Console.module.css';

function isTyping(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export default function Console() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isTyping(document.activeElement) && document.activeElement.id !== 'term-input') return;
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onEvt = (e) => setOpen((o) => (e.detail === 'toggle' ? !o : e.detail === 'open'));
    window.addEventListener('keydown', onKey);
    window.addEventListener('app:console', onEvt);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app:console', onEvt);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => document.getElementById('term-input')?.focus({ preventScroll: true }));
    } else if (document.activeElement?.id === 'term-input') {
      document.activeElement.blur();
    }
  }, [open]);

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOn : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="container">{mounted && <Terminal autoFocus instant />}</div>
        <p className={styles.hint}>
          <kbd>`</kbd> or <kbd>esc</kbd> to close
        </p>
      </div>
    </>
  );
}
