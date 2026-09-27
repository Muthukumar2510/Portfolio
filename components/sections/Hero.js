import { useState } from 'react';
import profile from '../../content/profile';
import InfraMap from '../InfraMap';
import DotField from '../DotField';
import Avatar from '../Avatar';
import SocialLinks from '../SocialLinks';
import StatusBar from '../StatusBar';
import Button from '../ui/Button';
import { openConsole } from '../../lib/actions';
import styles from './Hero.module.css';

// Shows instead of tells: the hero is a live trace of how this very page reached the visitor.
export default function Hero() {
  const [trace, setTrace] = useState(null);
  const edge = trace?.edge?.name && trace.edge.name !== 'local' ? trace.edge.name : null;

  return (
    <section id="top" className={styles.hero}>
      <DotField className={styles.dotField} />
      <div className="container">
        <div className={styles.top}>
          <p className={styles.byline}>
            {profile.avatar && <Avatar size={28} />}
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.sep} aria-hidden="true">/</span>
            <span>{profile.title}</span>
            <span className={styles.sep} aria-hidden="true">/</span>
            <span>{profile.location}</span>
          </p>
          {/* Static headline (it's the LCP element); live values go in the line below. */}
          <h1 className={styles.title}>Your request just crossed four systems to reach this page.</h1>
          <p className={styles.sub}>
            {edge ? (
              <>
                It entered through <span className={styles.accent}>{edge}</span>
                {trace?.rtt != null && <> in {trace.rtt} ms</>}.{' '}
              </>
            ) : (
              'Here\u2019s the path it took, measured live. '
            )}
            Hover over any part to see what it does and why it&apos;s built that way.
          </p>
        </div>

        <InfraMap onTrace={setTrace} />

        <div className={styles.bottom}>
          <div className={styles.ctas}>
            <Button href="#projects">See what else I&apos;ve built</Button>
            <Button href="#contact" variant="ghost">
              Get in touch
            </Button>
          </div>
          <div className={styles.meta}>
            <SocialLinks withEmail />
            <button type="button" className={styles.consoleHint} onClick={openConsole}>
              Open the terminal <kbd>`</kbd>
            </button>
          </div>
        </div>
      </div>
      <StatusBar trace={trace} />
    </section>
  );
}
