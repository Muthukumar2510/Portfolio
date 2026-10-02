import { useEffect, useRef, useState } from 'react';
import profile from '../../../content/profile';
import { runCommand, complete } from './commands';
import { useSite } from '../../../lib/SiteContext';
import styles from './Terminal.module.css';

const PROMPT = `visitor@${profile.handle}:~$`;

const bootScript = [
  { cmd: `ssh visitor@${profile.domain}` },
  { out: [{ text: 'Connection established. Authenticated as guest.', tone: 'muted' }] },
  { cmd: 'whoami --short' },
  { out: [{ text: profile.name, tone: 'accent' }, profile.tagline] },
  { out: [{ text: "Type 'help' to explore, or just scroll ↓", tone: 'muted' }] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Terminal({ autoFocus = false, instant = false }) {
  const site = useSite();
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState('');
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const history = useRef([]);
  const historyIdx = useRef(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const reduced = instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      for (const step of bootScript) {
        if (cancelled) return;
        if (step.cmd) {
          if (!reduced) {
            for (let i = 1; i <= step.cmd.length; i++) {
              if (cancelled) return;
              setTyping(step.cmd.slice(0, i));
              await sleep(35 + Math.random() * 40);
            }
            await sleep(250);
          }
          setTyping('');
          setLines((l) => [...l, { prompt: true, text: step.cmd }]);
        } else {
          setLines((l) => [...l, ...step.out.map(normalize)]);
          if (!reduced) await sleep(300);
        }
      }
      if (cancelled) return;
      setBooted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (booted && (autoFocus || window.matchMedia('(pointer: fine)').matches)) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [booted, autoFocus]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  function submit(value) {
    const out = runCommand(value, site);
    if (value.trim()) {
      history.current.unshift(value);
      historyIdx.current = -1;
    }
    if (out === 'CLEAR') {
      setLines([]);
      return;
    }
    if (out instanceof Promise) {
      const pending = { text: 'working…', tone: 'muted', pending: true };
      setLines((l) => [...l, { prompt: true, text: value }, pending]);
      out.then((res) => setLines((l) => l.flatMap((line) => (line === pending ? res.map(normalize) : [line]))));
      return;
    }
    setLines((l) => [...l, { prompt: true, text: value }, ...out.map(normalize)]);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [first, ...rest] = input.split(' ');
      if (rest.length) return;
      const matches = complete(first);
      if (matches.length === 1) setInput(matches[0] + ' ');
      else if (matches.length > 1) setLines((l) => [...l, { prompt: true, text: input }, normalize(matches.join('   '))]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIdx.current + 1, history.current.length - 1);
      if (next >= 0) {
        historyIdx.current = next;
        setInput(history.current[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIdx.current - 1;
      historyIdx.current = Math.max(next, -1);
      setInput(next >= 0 ? history.current[next] : '');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.dots} aria-hidden="true">
          <i /> <i /> <i />
        </span>
        <span className={styles.title}>visitor@{profile.domain} — zsh</span>
      </div>
      <div
        className={styles.body}
        ref={bodyRef}
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
        role="log"
        aria-live="polite"
        aria-label="Interactive terminal"
      >
        {lines.map((line, i) => (
          <div key={i} className={`${styles.line} ${line.tone ? styles[line.tone] : ''}`}>
            {line.prompt && <span className={styles.prompt}>{PROMPT} </span>}
            {line.text}
          </div>
        ))}
        {!booted && (
          <div className={styles.line}>
            <span className={styles.prompt}>{PROMPT} </span>
            {typing}
            <span className={styles.caret} />
          </div>
        )}
        {booted && (
          <div className={`${styles.line} ${styles.inputLine}`}>
            <label htmlFor="term-input" className={styles.prompt}>
              {PROMPT}
            </label>
            <input
              id="term-input"
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Type a command, for example help"
              placeholder="type 'help'"
            />
          </div>
        )}
      </div>
      <div className={styles.chips} aria-label="Quick commands">
        {['help', 'whoami', 'projects', 'skills', 'contact'].map((c) => (
          <button
            key={c}
            type="button"
            className={styles.chip}
            disabled={!booted}
            onClick={() => submit(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function normalize(line) {
  return typeof line === 'string' ? { text: line } : line;
}
