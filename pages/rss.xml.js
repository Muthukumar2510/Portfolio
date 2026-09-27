import profile from '../content/profile';
import { getCollection } from '../lib/content';
import { absolute, siteUrl } from '../lib/seo';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function getServerSideProps({ res }) {
  const posts = getCollection('posts').sort((a, b) => b.date.localeCompare(a.date));
  const items = posts
    .map((p) => {
      const url = absolute(`/writing/${p.slug}`);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.type)}</category>
      <description>${esc(p.summary)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)}: writing &amp; events</title>
    <link>${siteUrl}/writing</link>
    <description>${esc(profile.tagline)}</description>
    <language>en</language>
    <atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.end(xml);
  return { props: {} };
}

export default function Rss() {
  return null;
}
