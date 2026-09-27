import { useEffect, useState } from 'react';

export default function Toast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2600);
    };
    window.addEventListener('app:toast', onToast);
    return () => {
      window.removeEventListener('app:toast', onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" style={wrap}>
      {message && <div style={box}>{message}</div>}
    </div>
  );
}

const wrap = {
  position: 'fixed',
  bottom: 24,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 150,
  padding: '0 16px',
};

const box = {
  background: 'var(--text)',
  color: 'var(--bg)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  padding: '10px 16px',
  borderRadius: 10,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};
