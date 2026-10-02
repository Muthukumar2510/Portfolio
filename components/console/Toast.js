import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

const VISIBLE_MS = 2600;

export default function Toast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), VISIBLE_MS);
    };
    window.addEventListener('app:toast', onToast);
    return () => {
      window.removeEventListener('app:toast', onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className={styles.wrap}>
      {message && <div className={styles.box}>{message}</div>}
    </div>
  );
}
