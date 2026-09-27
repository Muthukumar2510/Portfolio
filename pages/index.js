import Seo from '../components/Seo';
import Hero from '../components/sections/Hero';
import Projects from '../components/sections/Projects';
import About from '../components/sections/About';
import Experience from '../components/sections/Experience';
import Skills from '../components/sections/Skills';
import Certifications from '../components/sections/Certifications';
import Moments from '../components/sections/Moments';
import Writing from '../components/sections/Writing';
import Changelog from '../components/sections/Changelog';
import Contact from '../components/sections/Contact';
import useReveal from '../lib/useReveal';
import { getSiteData, getMoments } from '../lib/content';
import { getChangelog } from '../lib/github';
import { personJsonLd } from '../lib/seo';

export default function Home({ moments, commits }) {
  useReveal();
  return (
    <>
      <Seo jsonLd={personJsonLd()} />
      <Hero />
      <Projects />
      <About />
      <Experience />
      <Skills />
      <Certifications />
      <Moments moments={moments} />
      <Writing />
      <Changelog commits={commits} />
      <Contact />
    </>
  );
}

export async function getStaticProps() {
  return {
    props: { site: getSiteData(), moments: getMoments(), commits: await getChangelog() },
    revalidate: 3600,
  };
}
