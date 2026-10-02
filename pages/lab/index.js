import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ListPage from '../../components/layout/ListPage';
import EntryCard from '../../components/cards/EntryCard';
import grid from '../../components/ui/Grid.module.css';
import { ENTRY_TYPES, getSiteData } from '../../lib/content';

// The Lab: every notebook entry, newest first, filterable by type (?type=teardown keeps the filter shareable).
export default function Lab({ site, types }) {
  const router = useRouter();
  const [type, setType] = useState('all');
  useEffect(() => {
    const q = router.query.type;
    if (typeof q === 'string' && types.some((t) => t.id === q)) setType(q);
  }, [router.query.type, types]);

  const entries = [...site.entries].sort((a, b) => b.date.localeCompare(a.date));
  const shown = type === 'all' ? entries : entries.filter((e) => e.type === type);
  const filters = [
    { key: 'all', label: 'All', count: entries.length },
    ...types.map((t) => ({ key: t.id, label: t.label, count: entries.filter((e) => e.type === t.id).length })).filter((f) => f.count),
  ];
  const choose = (key) => {
    setType(key);
    router.replace({ pathname: '/lab', query: key === 'all' ? {} : { type: key } }, undefined, { shallow: true, scroll: false });
  };

  return (
    <ListPage
      title="Lab"
      intro="Builds, teardowns of how things work, UI sketches and notes. A working notebook, not a showcase."
      filters={filters}
      active={type}
      onFilter={choose}
    >
      <div className={grid.three}>
        {shown.map((e) => (
          <EntryCard key={e.slug} entry={e} />
        ))}
      </div>
    </ListPage>
  );
}

export function getStaticProps() {
  return { props: { site: getSiteData(), types: ENTRY_TYPES } };
}
