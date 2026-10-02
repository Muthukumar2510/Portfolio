import { useEffect, useState } from 'react';
import profile from '../../content/profile';
import { copyEmail, mailtoPresets, toast } from '../../lib/actions';
import notes from '../../content/notes';
import Section from '../ui/Section';
import SocialLinks from '../layout/SocialLinks';
import Icon from '../shell/Icon';
import styles from './Contact.module.css';

const ICONS = { hiring: 'badge', collab: 'layers', hello: 'mail' };
const MAX = 2000;

// With a Formspree ID the form posts directly; without one it opens the visitor's mail app, pre-filled.
function composeMailto({ reason, name, email, message }) {
  const preset = mailtoPresets[reason] || mailtoPresets.hello;
  const body = `${message}\n\n${name}${email ? ` <${email}>` : ''}`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(preset.subject)}&body=${encodeURIComponent(body)}`;
}

// Real local time where I am, so visitors know when to expect a reply. Rendered client-side only.
function useLocalTime(tz) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now || !tz) return null;
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
  const hour = Number(now.toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: tz }));
  return { time, awake: hour >= 8 && hour < 22 };
}

export default function Contact() {
  const [reason, setReason] = useState('hiring');
  const [state, setState] = useState('idle');
  const [draft, setDraft] = useState({ name: '', email: '', message: '' });
  const local = useLocalTime(profile.timezone);
  const preset = mailtoPresets[reason];

  const keys = Object.keys(mailtoPresets);
  // Number keys pick a reason while focus is on the reason list (1, 2, 3…).
  const onReasonKey = (e) => {
    const k = keys[Number(e.key) - 1];
    if (k) setReason(k);
  };

  // Ctrl/⌘ + Enter sends from anywhere in the form.
  const onFormKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

  const onChange = (e) => setDraft((d) => ({ ...d, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (!profile.formspreeId) {
      window.location.href = composeMailto({ ...data, reason });
      setState('drafted');
      return;
    }
    setState('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${profile.formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, reason: preset.label }),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setDraft({ name: '', email: '', message: '' });
      setState('sent');
      toast('Message delivered. I’ll get back to you soon.');
    } catch {
      setState('error');
    }
  }

  const label = { sending: 'Sending…', sent: 'Delivered', drafted: 'Opened in your mail app' }[state] || 'Send message';

  return (
    <Section stage="none" note={notes.contact} id="contact" title="Let's talk" intro={`Hiring, a project, or just comparing notes on infrastructure. I reply ${profile.replyTime}.`}>
      <div className={styles.card}>
        <aside className={styles.panel}>
          <p className={styles.spec} suppressHydrationWarning>
            {profile.location}
            {local && ` · ${local.time} local`}
          </p>
          <p className={styles.big}>What brings you here?</p>

          <div className={styles.reasons} role="radiogroup" aria-label="Reason for contact" onKeyDown={onReasonKey}>
            {Object.entries(mailtoPresets).map(([key, p], i) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={reason === key}
                className={`${styles.reason} ${reason === key ? styles.on : ''}`}
                onClick={() => setReason(key)}
              >
                <kbd className={styles.key}>{i + 1}</kbd>
                <span>{p.label}</span>
                <Icon name={ICONS[key] || 'mail'} size={16} />
              </button>
            ))}
          </div>

          <ul className={styles.facts}>
            {local && (
              <li suppressHydrationWarning>
                <span className={`${styles.pulse} ${local.awake ? styles.awake : ''}`} aria-hidden="true" />
                {local.awake ? 'Probably online now' : 'Probably asleep, I’ll reply in the morning'}
              </li>
            )}
            <li>Replies {profile.replyTime}</li>
          </ul>

          <div className={styles.panelFoot}>
            <button type="button" className={styles.copy} onClick={copyEmail}>
              <Icon name="mail" size={16} />
              {profile.email}
            </button>
            <SocialLinks />
          </div>
        </aside>

        <form className={styles.form} onSubmit={onSubmit} onKeyDown={onFormKey}>
          {/* Live preview of the message as a letter: the form reads as writing to a person, not filling a ticket. */}
          <div className={styles.letter} aria-hidden="true">
            <dl>
              <div>
                <dt>To</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>From</dt>
                <dd>{draft.name || 'you'}</dd>
              </div>
              <div>
                <dt>Re</dt>
                <dd>{preset.subject}</dd>
              </div>
            </dl>
            <span className={styles.franking}>
              <span className={styles.stamp}>{profile.location.split(',').pop().trim().slice(0, 2).toUpperCase()}</span>
              <span className={styles.postmark}>{profile.location.split(',')[0].toUpperCase()}</span>
            </span>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <input name="name" required autoComplete="name" placeholder=" " value={draft.name} onChange={onChange} />
              <span>Your name</span>
            </label>
            <label className={styles.field}>
              <input name="email" type="email" required autoComplete="email" placeholder=" " value={draft.email} onChange={onChange} />
              <span>Email</span>
            </label>
          </div>
          <label className={styles.field}>
            <textarea name="message" rows={5} required maxLength={MAX} placeholder=" " value={draft.message} onChange={onChange} />
            <span>Message</span>
            <small className={styles.hint}>{draft.message ? `${draft.message.length} / ${MAX}` : preset.placeholder}</small>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.send} disabled={state === 'sending'}>
              {label}
            </button>
          </div>
          {state === 'error' && <p className={styles.error}>Couldn&apos;t send. Please use the email address instead.</p>}
          {!profile.formspreeId && <p className={styles.note}>This opens your email app with the message ready to send.</p>}
        </form>
      </div>
    </Section>
  );
}
