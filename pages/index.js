import Seo from '../components/layout/Seo';
import Hero from '../components/sections/Hero';
import Latest from '../components/sections/Latest';
import Traced from '../components/sections/Traced';
import Building from '../components/sections/Building';
import useReveal from '../lib/useReveal';
import { getSiteData } from '../lib/content';
import { getChangelog } from '../lib/github';
import { personJsonLd } from '../lib/seo';

// Today: who I am in one line, the newest notebook entries, this very page traced live, and what's on the bench.
// The résumé lives on /colophon.
export default function Today({ commits }) {
  useReveal();
  return (
    <>
      <Seo jsonLd={personJsonLd()} />
      <Hero />
      <Latest />
      <Traced />
      <Building commits={commits} />
    </>
  );
}

export async function getStaticProps() {
  return { props: { site: getSiteData(), commits: await getChangelog() }, revalidate: 3600 };
}
