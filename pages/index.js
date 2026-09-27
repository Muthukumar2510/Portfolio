import Seo from '../components/Seo';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Experience from '../components/sections/Experience';
import Projects from '../components/sections/Projects';
import Writing from '../components/sections/Writing';
import Contact from '../components/sections/Contact';
import useReveal from '../lib/useReveal';
import { getSiteData } from '../lib/content';

export default function Home() {
  useReveal();
  return (
    <>
      <Seo />
      <Hero />
      <div className="divider" />
      <Projects />
      <div className="divider" />
      <About />
      <div className="divider" />
      <Skills />
      <div className="divider" />
      <Experience />
      <div className="divider" />
      <Writing />
      <div className="divider" />
      <Contact />
    </>
  );
}

export function getStaticProps() {
  return { props: { site: getSiteData() } };
}
