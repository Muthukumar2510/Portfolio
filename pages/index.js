import Seo from '../components/layout/Seo';
import Hero from '../components/sections/Hero';
import Projects from '../components/sections/Projects';
import About from '../components/sections/About';
import Experience from '../components/sections/Experience';
import Skills from '../components/sections/Skills';
import Certifications from '../components/sections/Certifications';
import Moments from '../components/sections/Moments';
import Writing from '../components/sections/Writing';
import Operations from '../components/sections/Operations';
import Contact from '../components/sections/Contact';
import useReveal from '../lib/useReveal';
import useScene from '../lib/useScene';
import { getSiteData, getMoments } from '../lib/content';
import { getChangelog, withRepoStats } from '../lib/github';
import { personJsonLd } from '../lib/seo';

export default function Home({ moments, commits }) {
  useReveal();
  useScene();
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
      <Operations commits={commits} />
      <Contact />
    </>
  );
}

export async function getStaticProps() {
  return {
    props: { site: await siteWithStats(), moments: getMoments(), commits: await getChangelog() },
    revalidate: 3600,
  };
}

async function siteWithStats() {
  const site = getSiteData();
  return { ...site, projects: await withRepoStats(site.projects) };
}
