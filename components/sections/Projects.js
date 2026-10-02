import { useSite } from '../../lib/SiteContext';
import notes from '../../content/notes';
import Section from '../ui/Section';
import ProjectCard from '../cards/ProjectCard';
import grid from '../ui/Grid.module.css';

const HOME_LIMIT = 5;

export default function Projects() {
  const { projects } = useSite();
  if (!projects.length) return null;
  const shown = projects.slice(0, HOME_LIMIT);
  return (
    <Section
      notebook
      note={notes.projects}
      stage="band"
      id="projects"
      title="Projects"
      intro="Systems I've designed and run: the problem, the decisions, and what changed."
      action={{ href: '/projects', label: projects.length > HOME_LIMIT ? `All ${projects.length} projects` : 'All projects' }}
    >
      <div className={grid.two}>
        {shown.map((p, i) => (
          <ProjectCard key={p.slug} project={p} large={i === 0 && p.featured} />
        ))}
      </div>
    </Section>
  );
}
