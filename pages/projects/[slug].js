import EntryLayout from '../../components/EntryLayout';
import { getCollection, getEntry, getSiteData } from '../../lib/content';

export default function ProjectPage({ entry }) {
  return <EntryLayout entry={entry} basePath="/projects" backLabel="All projects" />;
}

export function getStaticPaths() {
  return { paths: getCollection('projects').map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { entry: getEntry('projects', params.slug), site: getSiteData() } };
}
