import { absolute } from '../lib/seo';

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.end(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
  return { props: {} };
}

export default function Robots() {
  return null;
}
