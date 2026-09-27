import ListPage from '../components/ListPage';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { getSiteData } from '../lib/content';
import { getInfra } from '../lib/infra';
import profile from '../content/profile';
import styles from '../components/InfraPage.module.css';

export default function InfraPage({ infra }) {
  const repo = `https://github.com/${profile.repo}`;
  return (
    <ListPage
      title="Infrastructure as code"
      intro={`This site's infrastructure is ${infra.count} Terraform resources across ${infra.providers.join(', ')}. The diagram below is generated from the code at build time, so it can't drift from reality.`}
    >
      <ArchitectureDiagram spec={infra.spec} />
      <div className={styles.meta}>
        <a href={`${repo}/tree/main/infra/terraform`}>infra/terraform ↗</a>
        <span>Validated by CI on every change (fmt, init, validate).</span>
      </div>
      <h2 className={styles.h2}>main.tf</h2>
      <pre className={styles.code}>
        <code>{infra.source}</code>
      </pre>
    </ListPage>
  );
}

export function getStaticProps() {
  const infra = getInfra();
  if (!infra) return { notFound: true };
  return { props: { site: getSiteData(), infra } };
}
