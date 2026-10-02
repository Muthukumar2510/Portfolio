import { useEffect, useState } from 'react';
import Link from 'next/link';
import Section from '../ui/Section';
import Blueprint from '../ui/Blueprint';
import { request } from '../../content/diagrams';
import styles from './Traced.module.css';

// The path this very page took, drawn from content/diagrams.js, with the real numbers from /api/trace.
// If the trace endpoint is unavailable the drawing stays and the numbers say so (fail soft).
export default function Traced() {
  const [trace, setTrace] = useState(undefined);
  useEffect(() => {
    let alive = true;
    const t0 = performance.now();
    fetch('/api/trace')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setTrace(d ? { ...d, rtt: Math.round(performance.now() - t0) } : null))
      .catch(() => alive && setTrace(null));
    return () => {
      alive = false;
    };
  }, []);

  const facts = trace
    ? [
        ['your edge', trace.edge?.code ? `${trace.edge.name} (${trace.edge.code})` : trace.edge?.name],
        ['function', trace.fn?.code ? `${trace.fn.name} (${trace.fn.code})` : trace.fn?.name],
        ['redis', trace.redisMs != null ? `${trace.redisMs} ms` : 'not connected'],
        ['round trip', `${trace.rtt} ms`],
      ]
    : null;

  return (
    <Section id="traced" stage="none" title="This page, traced" intro="How the page you're reading reached you. The numbers are measured right now.">
      <Blueprint diagram={request} caption="Request path · measured live" />
      <dl className={styles.facts} aria-live="polite">
        {facts ? (
          facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v || 'unknown'}</dd>
            </div>
          ))
        ) : (
          <div>
            <dt>trace</dt>
            <dd>{trace === undefined ? 'measuring…' : 'unavailable right now'}</dd>
          </div>
        )}
      </dl>
      <Link href="/lab/what-happens-when-you-open-this-page" className={styles.more}>
        Read the teardown →
      </Link>
    </Section>
  );
}
