// PLACEHOLDER content. status: 'live' | 'building' | 'archived'
const projects = [
  {
    slug: 'infra-blueprint',
    title: 'Infra Blueprint',
    description: 'Production-ready Terraform modules for a multi-account AWS landing zone with guardrails baked in.',
    tags: ['Terraform', 'AWS', 'GitHub Actions'],
    status: 'live',
    repo: 'https://github.com/muthukumar2510',
    live: '',
  },
  {
    slug: 'k8s-autopilot',
    title: 'K8s Autopilot',
    description: 'GitOps setup that auto-deploys, scales, and rolls back services on Kubernetes using Argo CD.',
    tags: ['Kubernetes', 'Argo CD', 'Helm'],
    status: 'building',
    repo: 'https://github.com/muthukumar2510',
    live: '',
  },
  {
    slug: 'pager-quiet',
    title: 'Pager Quiet',
    description: 'Self-healing runbooks that resolve common alerts automatically before anyone gets paged.',
    tags: ['Python', 'Prometheus', 'Lambda'],
    status: 'archived',
    repo: 'https://github.com/muthukumar2510',
    live: '',
  },
];

export default projects;
