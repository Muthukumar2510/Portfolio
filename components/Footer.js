import profile from '../content/profile';

const commit = process.env.NEXT_PUBLIC_COMMIT;
const built = process.env.NEXT_PUBLIC_BUILD_TIME;

export default function Footer() {
  const date = built ? new Date(built).toISOString().slice(0, 10) : '';
  return (
    <footer style={footer}>
      <div className="container" style={inner}>
        <span>© {new Date(built || Date.now()).getFullYear()} {profile.name}</span>
        <span style={mono}>
          <span style={{ color: 'var(--accent)' }}>●</span> build {commit} · deployed {date}
        </span>
      </div>
    </footer>
  );
}

const footer = {
  marginTop: 80,
  borderTop: '1px solid var(--border)',
  padding: '24px 0',
  color: 'var(--muted)',
  fontSize: '0.85rem',
};

const inner = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 12,
};

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
};
