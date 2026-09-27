import { getCollection } from '../lib/content';
import { absolute } from '../lib/seo';

export async function getServerSideProps({ res }) {
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/projects', priority: '0.8' },
    { loc: '/writing', priority: '0.8' },
    { loc: '/status', priority: '0.5' },
    ...getCollection('projects').map((p) => ({ loc: `/projects/${p.slug}`, lastmod: p.date, priority: '0.7' })),
    ...getCollection('posts').map((p) => ({ loc: `/writing/${p.slug}`, lastmod: p.date, priority: '0.6' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${absolute(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.end(xml);
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
