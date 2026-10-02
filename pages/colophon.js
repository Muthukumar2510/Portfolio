import Seo from '../components/layout/Seo';
import About from '../components/sections/About';
import Experience from '../components/sections/Experience';
import Skills from '../components/sections/Skills';
import Certifications from '../components/sections/Certifications';
import Moments from '../components/sections/Moments';
import Operations from '../components/sections/Operations';
import Contact from '../components/sections/Contact';
import useReveal from '../lib/useReveal';
import { getSiteData, getMoments } from '../lib/content';
import { getChangelog } from '../lib/github';
import styles from '../styles/pages/Colophon.module.css';

// The colophon: who keeps this notebook, how it's built and what it costs, and how to get in touch.
export default function Colophon({ moments, commits }) {
  useReveal();
  return (
    <>
      <Seo title="Colophon" description="Who keeps this notebook, how it is built and run, and how to reach me." />
      <header className={`container ${styles.head}`}>
        <h1 className={styles.title}>Colophon</h1>
        <p className={styles.intro}>Who keeps this notebook, how it&apos;s built and run, and how to reach me.</p>
      </header>
      <About />
      <Experience />
      <Skills />
      <Certifications />
      <Moments moments={moments} />
      <Operations commits={commits} />
      <Contact />
    </>
  );
}

export async function getStaticProps() {
  return { props: { site: getSiteData(), moments: getMoments(), commits: await getChangelog() }, revalidate: 3600 };
}
