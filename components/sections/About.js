import profile from '../../content/profile';
import styles from './Sections.module.css';

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container reveal">
        <p className="section-label">$ cat about.md</p>
        <h2 className="section-title">About</h2>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>role</dt>
              <dd>{profile.title}</dd>
            </div>
            <div>
              <dt>location</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>status</dt>
              <dd className={styles.ok}>{profile.status}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
