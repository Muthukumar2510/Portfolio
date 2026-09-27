import { useState } from 'react';
import profile from '../../content/profile';
import { copyEmail, mailtoFor, mailtoPresets, toast } from '../../lib/actions';
import SocialLinks from '../SocialLinks';
import styles from './Sections.module.css';

export default function Contact() {
  const [reason, setReason] = useState('hiring');
  const [state, setState] = useState('idle');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setState('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${profile.formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setState('sent');
      toast('Message delivered. I’ll get back to you soon.');
    } catch {
      setState('error');
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container reveal">
        <h2 className="section-title">Let&apos;s talk</h2>
        <div className={styles.contactGrid}>
          <div>
            <p className={styles.lead}>What brings you here? I&apos;ll draft the email for you.</p>
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
            <div className={styles.heroCtas}>
              <a href={mailtoFor(reason)} className={styles.btnPrimary} data-magnetic>
                Open drafted email
              </a>
              <button type="button" className={styles.btnGhost} onClick={copyEmail}>
                Copy email
              </button>
              {profile.bookingUrl && (
                <a href={profile.bookingUrl} className={styles.btnGhost} target="_blank" rel="noopener noreferrer">
                  Book a call ↗
                </a>
              )}
            </div>
            <SocialLinks labels className={styles.socials} />
          </div>

          {profile.formspreeId ? (
            <form className={styles.form} onSubmit={onSubmit}>
              <input type="hidden" name="reason" value={mailtoPresets[reason].label} />
              <label>
                <span>name</span>
                <input name="name" required autoComplete="name" />
              </label>
              <label>
                <span>email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                <span>message</span>
                <textarea name="message" rows={4} required />
              </label>
              <button type="submit" className={styles.btnPrimary} disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent ✓' : 'Send message'}
              </button>
              {state === 'error' && <p className={styles.error}>Couldn&apos;t send. Please use the email button instead.</p>}
            </form>
          ) : (
            <div className={styles.contactCard}>
              <p className={styles.muted}>Prefer the keyboard?</p>
              <code>$ contact hire</code>
              <p className={styles.muted}>in the terminal above drafts a hiring email instantly.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
