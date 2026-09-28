// Brand logos used across the site. `npm run brands` builds public/brands/ from this list:
//   source 'simple-icons' → copied from the simple-icons package (CC0), colour taken from it
//   source 'local'        → your own SVG already in public/brands/<slug>.svg (never overwritten)
//   source 'text'         → no logo file; shown as a small text badge (brands whose owners don't license an icon)
// `aliases` let skills, stack tags and certifications find a logo by name (case-insensitive).
// To use an official logo instead, drop it in public/brands/<slug>.svg and set source: 'local'.
const brands = [
  // Social
  { slug: 'github', source: 'simple-icons', aliases: ['github'] },
  { slug: 'linkedin', source: 'local', name: 'LinkedIn', color: '#0A66C2', aliases: ['linkedin'] },
  { slug: 'x', source: 'simple-icons', aliases: ['x', 'twitter'] },
  { slug: 'medium', source: 'simple-icons', aliases: ['medium'] },
  { slug: 'devdotto', source: 'simple-icons', aliases: ['dev.to', 'devto'] },
  { slug: 'youtube', source: 'simple-icons', aliases: ['youtube'] },
  { slug: 'instagram', source: 'simple-icons', aliases: ['instagram'] },
  { slug: 'stackoverflow', source: 'simple-icons', aliases: ['stack overflow', 'stackoverflow'] },
  { slug: 'credly', source: 'simple-icons', aliases: ['credly'] },

  // Cloud
  { slug: 'aws', source: 'text', name: 'Amazon Web Services', text: 'AWS', color: '#FF9900', aliases: ['aws', 'amazon web services', 'lambda', 'aws lambda'] },
  { slug: 'azure', source: 'text', name: 'Microsoft Azure', text: 'Az', color: '#0078D4', aliases: ['azure', 'microsoft azure'] },
  { slug: 'googlecloud', source: 'simple-icons', aliases: ['gcp', 'google cloud'] },

  // Platform & tooling
  { slug: 'kubernetes', source: 'simple-icons', aliases: ['kubernetes', 'k8s'] },
  { slug: 'docker', source: 'simple-icons', aliases: ['docker'] },
  { slug: 'helm', source: 'simple-icons', aliases: ['helm'] },
  { slug: 'argo', source: 'simple-icons', aliases: ['argo', 'argo cd', 'argocd'] },
  { slug: 'terraform', source: 'simple-icons', aliases: ['terraform', 'hashicorp'] },
  { slug: 'opentofu', source: 'simple-icons', aliases: ['opentofu'] },
  { slug: 'ansible', source: 'simple-icons', aliases: ['ansible'] },
  { slug: 'githubactions', source: 'simple-icons', aliases: ['github actions'] },
  { slug: 'git', source: 'simple-icons', aliases: ['git'] },
  { slug: 'prometheus', source: 'simple-icons', aliases: ['prometheus', 'prometheus / grafana'] },
  { slug: 'grafana', source: 'simple-icons', aliases: ['grafana'] },
  { slug: 'openpolicyagent', source: 'text', name: 'Open Policy Agent', text: 'OPA', color: '#7D9199', aliases: ['opa', 'open policy agent'] },
  { slug: 'linux', source: 'simple-icons', aliases: ['linux'] },
  { slug: 'linuxfoundation', source: 'simple-icons', aliases: ['the linux foundation', 'linux foundation'] },
  { slug: 'cncf', source: 'simple-icons', aliases: ['cncf'] },
  { slug: 'redis', source: 'simple-icons', aliases: ['redis'] },
  { slug: 'upstash', source: 'simple-icons', aliases: ['upstash', 'upstash redis'] },
  { slug: 'vercel', source: 'simple-icons', aliases: ['vercel'] },
  { slug: 'nextdotjs', source: 'simple-icons', aliases: ['next.js', 'nextjs'] },
  { slug: 'lighthouse', source: 'simple-icons', aliases: ['lighthouse'] },

  // Languages
  { slug: 'python', source: 'simple-icons', aliases: ['python'] },
  { slug: 'gnubash', source: 'simple-icons', aliases: ['bash', 'shell'] },
];

export default brands;
