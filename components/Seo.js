import Head from 'next/head';
import profile from '../content/profile';

export default function Seo({ title, description, image }) {
  const fullTitle = title ? `${title} · ${profile.name}` : `${profile.name} · ${profile.title}`;
  const desc = description || `${profile.tagline}. ${profile.bio[0]}`;
  const img = image || '/og-image.png';
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
