import { useSite } from '../../lib/SiteContext';
import Section from '../ui/Section';
import PostCard from '../cards/PostCard';
import grid from '../ui/Grid.module.css';

const HOME_LIMIT = 3;

export default function Writing() {
  const { posts } = useSite();
  if (!posts.length) return null;
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, HOME_LIMIT);
  return (
    <Section
      id="writing"
      title="Writing & events"
      intro="Notes from production, and the conferences and meetups where I learn out loud."
      action={{ href: '/writing', label: 'All posts' }}
    >
      <div className={grid.three}>
        {latest.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </Section>
  );
}
