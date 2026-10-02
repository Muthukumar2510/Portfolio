import EntryLayout from '../../components/layout/EntryLayout';
import { getEntries, getEntry, getSiteData } from '../../lib/content';
import { getRepoStats } from '../../lib/github';

export default function EntryPage({ entry }) {
  return <EntryLayout entry={entry} />;
}

export function getStaticPaths() {
  return { paths: getEntries().map((e) => ({ params: { slug: e.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const entry = getEntry('entries', params.slug);
  const repoStats = entry.github ? await getRepoStats(entry.github) : null;
  return { props: { entry: { ...entry, repoStats }, site: getSiteData() }, revalidate: 3600 };
}
