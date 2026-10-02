import Head from 'next/head';
import { useRouter } from 'next/router';
import profile from '../../content/profile';
import { absolute, ogImage } from '../../lib/seo';

// ogEntry: an entry slug; its share image draws that entry's diagram (pages/api/og.js).
export default function Seo({ title, description, image, ogEntry, jsonLd, type = 'website' }) {
  const { asPath } = useRouter();
  const fullTitle = title ? `${title} · ${profile.name}` : `${profile.name} · ${profile.title}`;
  const desc = description || `${profile.tagline}. ${profile.bio[0]}`;
  const img = image ? absolute(image) : ogImage({ title: title || profile.name, subtitle: title ? profile.name : profile.title, entry: ogEntry });
  const url = absolute(asPath.split(/[?#]/)[0]);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </Head>
  );
}
