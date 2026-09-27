import { useCallback, useEffect, useRef, useState } from 'react';
import profile from '../content/profile';
import styles from './InfraMap.module.css';

// Coordinates are in viewBox units; "wide" is desktop, "tall" is phones.
const LAYOUTS = {
  wide: {
    box: [1000, 300],
    size: [196, 76],
    nodes: {
      you: [110, 60],
      edge: [370, 60],
      fn: [630, 60],
      redis: [890, 60],
      github: [110, 240],
      build: [370, 240],
      deploy: [630, 240],
    },
  },
  tall: {
    box: [400, 720],
    size: [160, 72],
    nodes: {
      you: [110, 60],
      edge: [110, 230],
      fn: [110, 470],
      redis: [110, 650],
      github: [300, 170],
      build: [300, 320],
      deploy: [300, 470],
    },
  },
};

const LINKS = [
  { from: 'you', to: 'edge', lane: 'req' },
  { from: 'edge', to: 'fn', lane: 'req' },
  { from: 'fn', to: 'redis', lane: 'req' },
  { from: 'github', to: 'build', lane: 'dep' },
  { from: 'build', to: 'deploy', lane: 'dep' },
  { from: 'deploy', to: 'fn', lane: 'dep' },
];

function relTime(iso) {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

function describe(trace, rtt) {
  const t = trace || {};
  const where = [t.visitor?.city, t.visitor?.country].filter(Boolean).join(', ');
  return {
    you: {
      title: 'You',
      meta: where || 'your browser',
      detail:
        'Your browser asked for this page. Static pages are pre-built, so the first byte comes straight from a cache near you.',
    },
    edge: {
      title: 'Edge network',
      label: 'Edge',
      meta: t.edge ? `${t.edge.name}${t.edge.code ? ` · ${t.edge.code}` : ''}` : '…',
      detail:
        'Vercel’s edge network routed you to the closest point of presence. Pages and images are cached here, so most requests never reach a server.',
      stat: rtt != null ? `${rtt} ms round trip` : null,
    },
    fn: {
      title: 'Serverless function',
      label: 'Function',
      meta: t.fn ? `${t.fn.name}${t.fn.code ? ` · ${t.fn.code}` : ''}` : '…',
      detail:
        'Dynamic bits (this trace, the visitor counter) run as short-lived Node.js functions. They scale to zero when nobody is here and cost nothing idle.',
      stat: t.serverMs != null ? `${t.serverMs} ms to respond` : null,
    },
    redis: {
      title: 'Redis',
      meta: 'Upstash · serverless',
      detail:
        'A serverless Redis stores visit counts and who is online right now, using expiring sorted sets. One pipelined HTTP call per request.',
      stat: t.redisMs != null ? `${t.redisMs} ms ping` : 'not connected yet',
    },
    github: {
      title: 'GitHub',
      meta: t.commit && t.commit !== 'local' ? `commit ${t.commit}` : 'source of truth',
      detail:
        'Every change to this site, including its content, is a commit. Nothing is edited by hand in production.',
    },
    build: {
      title: 'CI build',
      meta: 'GitHub Actions',
      detail:
        'Each pull request is built and checked automatically before it can merge. A broken build never reaches visitors.',
    },
    deploy: {
      title: 'Deploy',
      meta: t.builtAt ? `deployed ${relTime(t.builtAt)}` : 'Vercel',
      detail:
        'Merging to main triggers an immutable deploy. Rolling back is one click, because every previous version is still there.',
    },
  };
}

// Layouts only ever connect nodes in the same row or column, so links are straight lines.
function linkPath(layout, a, b) {
  const [x1, y1] = layout.nodes[a];
  const [x2, y2] = layout.nodes[b];
  const [w, h] = layout.size;
  if (Math.abs(y1 - y2) < 1) {
    const dir = Math.sign(x2 - x1);
    return `M${x1 + (dir * w) / 2},${y1} L${x2 - (dir * w) / 2 - dir * 4},${y2}`;
  }
  const dir = Math.sign(y2 - y1);
  return `M${x1},${y1 + (dir * h) / 2} L${x2},${y2 - (dir * h) / 2 - dir * 4}`;
}

export default function InfraMap({ onTrace }) {
  const wrapRef = useRef(null);
  const [trace, setTrace] = useState(null);
  const [rtt, setRtt] = useState(null);
  const [active, setActive] = useState('edge');
  const [run, setRun] = useState(0);
  const [reduced, setReduced] = useState(false);

  const doTrace = useCallback(async () => {
    const t0 = performance.now();
    try {
      const r = await fetch('/api/trace', { cache: 'no-store' });
      const data = await r.json();
      const ms = Math.round(performance.now() - t0);
      setTrace(data);
      setRtt(ms);
      setRun((n) => n + 1);
      onTrace?.({ ...data, rtt: ms });
    } catch {}
  }, [onTrace]);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    doTrace();
  }, [doTrace]);

  // Gentle parallax so the diagram responds to the cursor.
  useEffect(() => {
    const el = wrapRef.current;
    if (!window.matchMedia('(pointer: fine)').matches || reduced) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--px', `${(x * 10).toFixed(1)}px`);
      el.style.setProperty('--py', `${(y * 8).toFixed(1)}px`);
    };
    const onLeave = () => {
      el.style.setProperty('--px', '0px');
      el.style.setProperty('--py', '0px');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  const info = describe(trace, rtt);
  const current = info[active];

  // Both layouts render; CSS shows one per breakpoint so nothing shifts after hydration.
  const diagram = (mode) => {
    const layout = LAYOUTS[mode];
    const [bw, bh] = layout.box;
    const [nw, nh] = layout.size;
    const maxMeta = mode === 'wide' ? 22 : 17;
    const arrowId = `arrow-${mode}`;
    return (
      <svg
        key={mode}
        className={`${styles.svg} ${styles[mode]}`}
        viewBox={`0 0 ${bw} ${bh}`}
        role="group"
        aria-label={`Live diagram of how this website is served. Your request went through ${info.edge.meta}.`}
      >
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
          </marker>
        </defs>
        <g className={styles.links}>
          {LINKS.map((l) => {
            const d = linkPath(layout, l.from, l.to);
            const id = `p-${mode}-${l.from}-${l.to}`;
            const on = active === l.from || active === l.to;
            return (
              <g key={id}>
                <path id={id} d={d} className={`${styles.link} ${styles[l.lane]} ${on ? styles.linkOn : ''}`} markerEnd={`url(#${arrowId})`} />
                {!reduced && (
                  <circle r={l.lane === 'req' ? 5 : 4} className={`${styles.packet} ${styles[`${l.lane}Packet`]}`}>
                    <animateMotion
                      key={`${id}-${run}`}
                      dur={l.lane === 'req' ? '1.6s' : '3.2s'}
                      begin={l.lane === 'req' ? `${['you', 'edge', 'fn'].indexOf(l.from) * 0.35}s` : `${['github', 'build', 'deploy'].indexOf(l.from) * 0.6}s`}
                      repeatCount="indefinite"
                    >
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}
        </g>
        <g className={styles.nodes}>
          {Object.entries(layout.nodes).map(([id, [x, y]]) => {
            const n = info[id];
            const on = active === id;
            return (
              <g
                key={id}
                className={`${styles.node} ${on ? styles.nodeOn : ''} ${id === 'you' ? styles.you : ''}`}
                transform={`translate(${x - nw / 2}, ${y - nh / 2})`}
                tabIndex={0}
                role="button"
                aria-pressed={on}
                onClick={() => setActive(id)}
                onMouseEnter={() => setActive(id)}
                onFocus={() => setActive(id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActive(id))}
              >
                <rect width={nw} height={nh} rx="14" className={styles.box} />
                {id === 'you' && <circle cx={nw - 16} cy={16} r={5} className={styles.youDot} />}
                <text x="16" y={nh / 2 - 6} className={styles.title}>
                  {n.label || n.title}
                </text>
                <text x="16" y={nh / 2 + 16} className={styles.meta}>
                  {n.meta.length > maxMeta ? `${n.meta.slice(0, maxMeta - 1)}…` : n.meta}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.lanes} aria-hidden="true">
        <span><i className={styles.req} /> request path</span>
        <span><i className={styles.dep} /> deploy path</span>
      </div>
      {diagram('wide')}
      {diagram('tall')}

      <div className={styles.detail} aria-live="polite">
        <div>
          <p className={styles.detailTitle}>
            {current.title}
            {current.stat && <span className={styles.stat}>{current.stat}</span>}
          </p>
          <p className={styles.detailText}>{current.detail}</p>
        </div>
        <button type="button" className={styles.retrace} onClick={doTrace}>
          Trace again
        </button>
      </div>
      <p className={styles.caption}>
        Designed, built and operated by {profile.name}.
      </p>
    </div>
  );
}
