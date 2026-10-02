// Diagrams as code: every drawing on the site is described here as data and drawn by lib/diagram.js.
// Coordinates are grid units. `atTall` / `sizeTall` etc. give the phone (portrait) layout.
// Keep them true: each diagram describes how this site actually works.
// Notes are handwritten; use \n for a line break.

// What happens when you open a page on this site.
export const request = {
  title: 'What happens when you open this page',
  size: [15, 5.6],
  sizeTall: [7.8, 13],
  nodes: [
    { id: 'you', label: 'You', kind: 'user', at: [1.2, 2.4], atTall: [2.4, 1.2] },
    { id: 'dns', label: 'DNS', sub: 'name → address', at: [4.6, 2.4], atTall: [2.4, 3.8] },
    { id: 'edge', label: 'Vercel edge', kind: 'cloud', at: [8.4, 2.4], atTall: [2.4, 6.4], lit: true },
    { id: 'fn', label: '/api/trace', sub: 'function', at: [12.6, 2.4], atTall: [2.4, 9] },
    { id: 'redis', label: 'Redis', sub: 'Upstash', kind: 'store', at: [12.6, 4.7], atTall: [2.4, 11.6] },
  ],
  links: [
    { from: 'you', to: 'dns', label: 'lookup' },
    { from: 'dns', to: 'edge', label: 'PoP' },
    { from: 'edge', to: 'fn', label: 'HTTPS', lit: true },
    { from: 'fn', to: 'redis', label: 'ping', dash: true },
  ],
  notes: [
    { text: 'static pages\nstop here', at: [6, 4.6], point: [7.7, 3.4], atTall: [4.4, 6.9], pointTall: [3.6, 6.6] },
  ],
  dims: [{ from: [1.2, 0.5], to: [12.6, 0.5], label: 'one request, timed live', fromTall: [7.5, 1.2], toTall: [7.5, 9] }],
};

// How a change reaches the live site.
export const deploy = {
  title: 'How a change goes live',
  size: [15, 5.2],
  sizeTall: [7.4, 12.6],
  nodes: [
    { id: 'push', label: 'git push', sub: 'pull request', at: [1.8, 2.2], atTall: [2.4, 1.2] },
    { id: 'ci', label: 'CI', sub: 'lint · build', at: [5.6, 2.2], atTall: [2.4, 3.8] },
    { id: 'gates', label: 'Quality gates', sub: 'Lighthouse ≥ 85', at: [9.4, 2.2], atTall: [2.4, 6.4], lit: true },
    { id: 'vercel', label: 'Vercel', kind: 'cloud', at: [13.2, 2.2], atTall: [2.4, 9.2] },
    { id: 'preview', label: 'preview URL', sub: 'every PR', at: [13.2, 4.3], atTall: [2.4, 11.4] },
  ],
  links: [
    { from: 'push', to: 'ci' },
    { from: 'ci', to: 'gates', lit: true },
    { from: 'gates', to: 'vercel', label: 'merge' },
    { from: 'vercel', to: 'preview', dash: true },
  ],
  notes: [{ text: 'a slower page\nfails the PR', at: [7.6, 4.5], point: [9, 3.1], atTall: [4.3, 7.2], pointTall: [3.6, 6.7] }],
};

// Where the words and photos on this site come from.
export const content = {
  title: 'Where this site’s content comes from',
  size: [15, 5.4],
  sizeTall: [7.4, 12.6],
  nodes: [
    { id: 'md', label: 'Markdown', sub: 'content/*.md', at: [1.9, 1.5], atTall: [2.4, 1.2] },
    { id: 'photos', label: 'Photos', sub: 'public/media', at: [1.9, 4.1], atTall: [5.6, 1.2] },
    { id: 'media', label: 'npm run media', sub: 'strips GPS', at: [5.9, 4.1], atTall: [5.6, 3.8] },
    { id: 'build', label: 'build', sub: 'lib/content.js', at: [9.6, 2.8], atTall: [2.4, 6.6], lit: true },
    { id: 'pages', label: 'static pages', sub: 'on the edge', at: [13.2, 2.8], atTall: [2.4, 9.4] },
  ],
  links: [
    { from: 'md', to: 'build', via: [[9.6, 1.5]], viaTall: [] },
    { from: 'photos', to: 'media' },
    { from: 'media', to: 'build', via: [[9.6, 4.1]], viaTall: [[5.6, 6.6]] },
    { from: 'build', to: 'pages', lit: true },
  ],
  notes: [{ text: 'no CMS,\njust files', at: [3.6, 2.9], point: [2.6, 2.35], atTall: [4.2, 9.3], pointTall: [3.7, 9.4] }],
};

// How the status page knows whether the site is up.
export const monitor = {
  title: 'How the status page knows',
  size: [15, 5],
  sizeTall: [7.4, 11.8],
  nodes: [
    { id: 'cron', label: 'GitHub cron', sub: 'every 15 min', at: [1.9, 2.4], atTall: [2.4, 1.2] },
    { id: 'site', label: 'this site', kind: 'cloud', at: [5.8, 2.4], atTall: [2.4, 3.8] },
    { id: 'redis', label: 'Redis', sub: 'last checks', kind: 'store', at: [9.6, 2.4], atTall: [2.4, 6.4], lit: true },
    { id: 'status', label: '/status', sub: 'uptime + latency', at: [13.2, 2.4], atTall: [2.4, 9] },
  ],
  links: [
    { from: 'cron', to: 'site', label: 'probe' },
    { from: 'site', to: 'redis', label: 'ok · ms', lit: true },
    { from: 'redis', to: 'status' },
  ],
  notes: [{ text: 'a failed check\nemails me', at: [1, 4.4], point: [1.9, 3.3], atTall: [4.3, 1.6], pointTall: [3.6, 1.4] }],
};

export const DIAGRAMS = { request, deploy, content, monitor };

// Which diagram is drawn faintly behind which home section (watermark).
export const WATERMARK_DIAGRAMS = {
  lab: 'content',
  building: 'deploy',
  operations: 'request',
  contact: 'monitor',
};

// The legend on /design: every shape and line the diagram language has.
export const legend = {
  title: 'The vocabulary',
  size: [15, 4.6],
  sizeTall: [7.4, 10],
  nodes: [
    { id: 'u', label: 'person', kind: 'user', at: [1.2, 1.8], atTall: [1.4, 1.2] },
    { id: 'b', label: 'service', sub: 'box', at: [4.9, 1.8], atTall: [5.2, 1.2] },
    { id: 's', label: 'data', sub: 'store', kind: 'store', at: [9, 1.8], atTall: [1.6, 4.2] },
    { id: 'c', label: 'network', kind: 'cloud', at: [12.4, 1.8], atTall: [5.2, 4.2] },
    { id: 'l', label: 'lit', sub: 'what matters', at: [13.6, 3.9], atTall: [5.2, 7.6], lit: true },
  ],
  links: [
    { from: 'u', to: 'b', label: 'request' },
    { from: 'b', to: 's', label: 'async', dash: true },
    { from: 'c', to: 'l', lit: true },
  ],
  notes: [{ text: 'handwritten note', at: [4.8, 3.9], point: [8.2, 2.9], atTall: [0.4, 7.4], pointTall: [1.6, 5.2] }],
};
