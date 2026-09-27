import Head from 'next/head';
import profile from '../data/profile';
import Navbar from '../components/Navbar';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Experience from '../components/sections/Experience';
import Projects from '../components/sections/Projects';
import Contact from '../components/sections/Contact';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import EasterEggs from '../components/EasterEggs';
import Toast from '../components/Toast';
import useReveal from '../lib/useReveal';

export default function Home() {
  useReveal();
  const title = `${profile.name} — ${profile.title}`;
  const description = `${profile.tagline}. ${profile.bio[0]}`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#0d0f12" />
      </Head>
      <a href="#about" className="sr-only">Skip to content</a>
      <Navbar />
      <main>
        <Hero />
        <div className="divider" />
        <About />
        <div className="divider" />
        <Skills />
        <div className="divider" />
        <Experience />
        <div className="divider" />
        <Projects />
        <div className="divider" />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
      <EasterEggs />
      <Toast />
    </>
  );
}
