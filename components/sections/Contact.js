import { useState } from 'react';
import profile from '../../content/profile';
import { copyEmail, mailtoPresets, toast } from '../../lib/actions';
import Section from '../ui/Section';
import Button from '../ui/Button';
import SocialLinks from '../SocialLinks';
import styles from './Contact.module.css';

// With a Formspree ID the form posts directly; without one it opens the visitor's mail app, pre-filled.
function composeMailto({ reason, name, email, message }) {
  const preset = mailtoPresets[reason] || mailtoPresets.hello;
  const body = `${message}\n\n${name}${email ? ` <${email}>` : ''}`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(preset.subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  const [reason, setReason] = useState('hiring');
  const [state, setState] = useState('idle');

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
        body: JSON.stringify({ ...data, reason: mailtoPresets[reason].label }),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setState('sent');
      toast('Message delivered. I’ll get back to you soon.');
    } catch {
      setState('error');
    }
  }

  const label = { sending: 'Sending…', sent: 'Sent ✓', drafted: 'Opened in your mail app' }[state] || 'Send message';

  return (
    <Section id="contact" title="Let's talk" intro="Hiring, a project, or just comparing notes on infrastructure. I reply within a day or two.">
      <div className={styles.grid}>
        <div className={styles.side}>
          <p className={styles.lead}>What brings you here?</p>
          <div className={styles.reasons} role="radiogroup" aria-label="Reason for contact">
            {Object.entries(mailtoPresets).map(([key, p]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={reason === key}
                className={reason === key ? styles.reasonOn : styles.reason}
                onClick={() => setReason(key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.direct}>
            <Button variant="ghost" onClick={copyEmail}>
              Copy email
            </Button>
            {profile.bookingUrl && (
              <Button href={profile.bookingUrl} variant="ghost">
                Book a call ↗
              </Button>
            )}
          </div>
          <SocialLinks labels />
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Name</span>
            <input name="name" required autoComplete="name" />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea name="message" rows={5} required placeholder={mailtoPresets[reason].placeholder} />
          </label>
          <Button type="submit" disabled={state === 'sending'} magnetic={false}>
            {label}
          </Button>
          {state === 'error' && <p className={styles.error}>Couldn&apos;t send. Please use Copy email instead.</p>}
          {!profile.formspreeId && <p className={styles.hint}>This opens your email app with the message ready to send.</p>}
        </form>
      </div>
    </Section>
  );
}
