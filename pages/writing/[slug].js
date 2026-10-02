import EntryLayout from '../../components/layout/EntryLayout';
import { getCollection, getEntry, getSiteData } from '../../lib/content';

export default function PostPage({ entry }) {
  return <EntryLayout entry={entry} basePath="/writing" backLabel="All writing" />;
}

export function getStaticPaths() {
  return { paths: getCollection('posts').map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { entry: getEntry('posts', params.slug), site: getSiteData() } };
}
