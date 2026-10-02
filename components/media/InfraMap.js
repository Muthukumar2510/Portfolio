import { useCallback, useEffect, useRef, useState } from 'react';
import profile from '../../content/profile';
import { failoverFor } from '../../lib/regions';
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

function describe(trace, rtt, chaos) {
  const t = trace || {};
  const backup = chaos?.backup;
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
      meta:
        chaos?.phase === 'down'
          ? `${t.edge?.name || 'edge'} · DOWN`
          : backup && chaos.phase !== 'idle'
            ? `${backup.name} · ${backup.code}`
            : t.edge
              ? `${t.edge.name}${t.edge.code ? ` · ${t.edge.code}` : ''}`
              : '…',
      detail:
        'Vercel’s edge network routed you to the closest point of presence. Pages and images are cached here, so most requests never reach a server.',
      stat: backup && chaos.phase !== 'down' && chaos.phase !== 'idle' ? `${(rtt || 0) + backup.extraMs} ms via failover` : rtt != null ? `${rtt} ms round trip` : null,
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
  const [chaos, setChaos] = useState({ phase: 'idle', log: [], backup: null });
  const timers = useRef([]);

  // Scripted outage: kill the visitor's edge, detect, alert, fail over, recover. Purely client-side.
  const simulateOutage = useCallback(() => {
    timers.current.forEach(clearTimeout);
    const edge = trace?.edge?.code ? trace.edge : { code: 'bom1', name: 'Mumbai' };
    const backup = failoverFor(edge.code);
    const t0 = performance.now();
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    const log = (text, tone) => setChaos((c) => ({ ...c, log: [...c.log, { ms: Math.round(performance.now() - t0), text, tone }] }));
    setActive('edge');
    setChaos({ phase: 'down', backup, log: [{ ms: 0, text: `Edge ${edge.name} (${edge.code}) stops responding`, tone: 'bad' }] });
    at(700, () => log('Health checks fail 3/3 from the edge network', 'bad'));
    at(1100, () => log('Alert fired → on-call paged', 'bad'));
    at(1700, () => {
      setChaos((c) => ({ ...c, phase: 'failover' }));
      log(`Edge routing drops ${edge.code} and sends traffic to ${backup.name} (${backup.code})`);
    });
    at(2500, () => {
      setChaos((c) => ({ ...c, phase: 'recovered' }));
      log(`Requests succeed again, with about +${backup.extraMs} ms extra latency`, 'ok');
    });
    at(3000, () => log(`Recovered in ${((performance.now() - t0) / 1000).toFixed(1)} s without manual action. (Simulation, timings compressed.)`, 'ok'));
  }, [trace]);

  const restore = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setChaos({ phase: 'idle', log: [], backup: null });
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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

  // Animations (moving packets, blinking dots) run only while the map is on screen, and only in the layout
  // that is actually visible. Off-screen they are paused, so they cost nothing while you scroll elsewhere.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Same breakpoint as InfraMap.module.css: ≤640px shows the tall layout, wider screens the wide one.
    const narrow = window.matchMedia('(max-width: 640px)');
    const setRunning = (on) => {
      el.dataset.running = on ? 'true' : 'false';
      el.querySelectorAll('svg').forEach((svg) => {
        const shown = svg.classList.contains(styles.tall) === narrow.matches;
        if (on && shown) svg.unpauseAnimations?.();
        else svg.pauseAnimations?.();
      });
    };
    setRunning(false);
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const info = describe(trace, rtt, chaos);
  const down = chaos.phase === 'down';
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
            const broken = down && l.lane === 'req' && (l.from === 'edge' || l.to === 'edge');
            return (
              <g key={id}>
                <path id={id} d={d} className={`${styles.link} ${styles[l.lane]} ${on ? styles.linkOn : ''} ${broken ? styles.linkDown : ''}`} markerEnd={`url(#${arrowId})`} />
                {!reduced && !(down && l.lane === 'req') && (
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
                className={`${styles.node} ${on ? styles.nodeOn : ''} ${id === 'you' ? styles.you : ''} ${id === 'edge' && down ? styles.nodeDown : ''} ${id === 'edge' && chaos.phase === 'recovered' ? styles.nodeHealed : ''}`}
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
        {chaos.phase === 'idle' ? (
          <div>
            <p className={styles.detailTitle}>
              {current.title}
              {current.stat && <span className={styles.stat}>{current.stat}</span>}
            </p>
            <p className={styles.detailText}>{current.detail}</p>
          </div>
        ) : (
          <div className={styles.incident}>
            <p className={styles.detailTitle}>
              Simulated incident
              <span className={chaos.phase === 'recovered' ? styles.stat : styles.statBad}>{chaos.phase === 'recovered' ? 'resolved' : chaos.phase === 'down' ? 'outage' : 'failing over'}</span>
            </p>
            <ol className={styles.timeline}>
              {chaos.log.map((e) => (
                <li key={e.ms + e.text} className={e.tone ? styles[`tl_${e.tone}`] : ''}>
                  <time>+{(e.ms / 1000).toFixed(1)}s</time>
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className={styles.actions}>
          {chaos.phase === 'idle' ? (
            <>
              <button type="button" className={styles.retrace} onClick={doTrace}>
                Trace again
              </button>
              <button type="button" className={`${styles.retrace} ${styles.chaosBtn}`} onClick={simulateOutage}>
                Simulate an outage
              </button>
            </>
          ) : (
            <button type="button" className={styles.retrace} onClick={restore} disabled={chaos.phase !== 'recovered'}>
              Restore {trace?.edge?.name && trace.edge.name !== 'local' ? trace.edge.name : 'region'}
            </button>
          )}
        </div>
      </div>
      <p className={styles.caption}>
        Designed, built and operated by {profile.name}.
      </p>
    </div>
  );
}
