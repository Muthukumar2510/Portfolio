import profile from '../content/profile';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || profile.siteUrl).replace(/\/$/, '');

export const absolute = (path = '/') => (/^https?:/.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`);

// Generated share card for pages without their own cover image.
export function ogImage({ title, subtitle } = {}) {
  const q = new URLSearchParams();
  if (title) q.set('title', title);
  if (subtitle) q.set('subtitle', subtitle);
  return absolute(`/api/og${q.toString() ? `?${q}` : ''}`);
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    url: siteUrl,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profile.socials.filter((s) => s.url).map((s) => s.url),
  };
}

export function articleJsonLd(entry, path) {
  return {
    '@context': 'https://schema.org',
    '@type': entry.type === 'build' ? 'CreativeWork' : 'BlogPosting',
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.date,
    url: absolute(path),
    image: entry.cover ? absolute(entry.cover.src) : ogImage({ title: entry.title }),
    author: { '@type': 'Person', name: profile.name, url: siteUrl },
  };
}
