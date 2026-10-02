import { useSite } from '../../lib/SiteContext';
import notes from '../../content/notes';
import Section from '../ui/Section';
import EntryCard from '../cards/EntryCard';
import grid from '../ui/Grid.module.css';

const HOME_LIMIT = 3;

// The newest notebook entries, whatever their type.
export default function Latest() {
  const { entries } = useSite();
  if (!entries?.length) return null;
  const latest = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, HOME_LIMIT);
  return (
    <Section
      id="lab"
      stage="none"
      title="From the lab"
      intro="The newest pages of the notebook: things I built, took apart, or sketched."
      note={notes.lab}
      action={{ href: '/lab', label: `All ${entries.length} entries` }}
    >
      <div className={grid.three}>
        {latest.map((e) => (
          <EntryCard key={e.slug} entry={e} />
        ))}
      </div>
    </Section>
  );
}
