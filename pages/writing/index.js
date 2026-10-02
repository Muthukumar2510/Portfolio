import { useState } from 'react';
import ListPage from '../../components/layout/ListPage';
import PostCard from '../../components/cards/PostCard';
import grid from '../../components/ui/Grid.module.css';
import { getSiteData } from '../../lib/content';

export default function WritingIndex({ site }) {
  const [type, setType] = useState('all');
  const posts = [...site.posts].sort((a, b) => b.date.localeCompare(a.date));
  const shown = type === 'all' ? posts : posts.filter((p) => p.type === type);
  const filters = [
    { key: 'all', label: 'All', count: posts.length },
    { key: 'blog', label: 'Blog', count: posts.filter((p) => p.type === 'blog').length },
    { key: 'event', label: 'Events', count: posts.filter((p) => p.type === 'event').length },
  ];

  return (
    <ListPage
      title="Writing & events"
      intro="Blog posts from production, and photo stories from conferences and meetups."
      filters={filters}
      active={type}
      onFilter={setType}
    >
      <div className={grid.three}>
        {shown.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </ListPage>
  );
}

export function getStaticProps() {
  return { props: { site: getSiteData() } };
}
