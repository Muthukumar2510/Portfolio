import ListPage from '../../components/ListPage';
import ProjectCard from '../../components/cards/ProjectCard';
import grid from '../../components/ui/Grid.module.css';
import { getSiteData } from '../../lib/content';
import { withRepoStats } from '../../lib/github';

export default function ProjectsIndex({ site }) {
  return (
    <ListPage title="Projects" intro="Every system I've written up, newest first. Each one covers the problem, the decisions, and the results.">
      <div className={grid.two}>
        {site.projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </ListPage>
  );
}

export async function getStaticProps() {
  const site = getSiteData();
  return { props: { site: { ...site, projects: await withRepoStats(site.projects) } }, revalidate: 3600 };
}
