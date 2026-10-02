import EntryLayout from '../../components/layout/EntryLayout';
import { getCollection, getEntry, getSiteData } from '../../lib/content';
import { getRepoStats } from '../../lib/github';

export default function ProjectPage({ entry }) {
  return <EntryLayout entry={entry} basePath="/projects" backLabel="All projects" />;
}

export function getStaticPaths() {
  return { paths: getCollection('projects').map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const entry = getEntry('projects', params.slug);
  const repoStats = entry.github ? await getRepoStats(entry.github) : null;
  return { props: { entry: { ...entry, repoStats }, site: getSiteData() }, revalidate: 3600 };
}
