import profile from '../../../content/profile';
import skills from '../../../content/skills';
import experience from '../../../content/experience';
import certifications from '../../../content/certifications';
import {
  scrollToSection,
  setTheme,
  toggleTheme,
  copyEmail,
  openResume,
  fireEgg,
  mailtoFor,
  openPath,
} from '../../../lib/actions';

// Output lines: plain strings, or { text, tone } where tone is 'accent' | 'muted' | 'warn'.
const commands = [
  {
    name: 'help',
    description: 'List available commands',
    run: () => [
      { text: 'Available commands:', tone: 'accent' },
      ...commands
        .filter((c) => !c.hidden)
        .map((c) => `  ${c.name.padEnd(12)} ${c.description}`),
      { text: 'Tip: press Tab to autocomplete, ↑/↓ for history, Ctrl+K anywhere for the command palette.', tone: 'muted' },
    ],
  },
  {
    name: 'whoami',
    description: 'Who is behind this terminal',
    run: () => {
      scrollToSection('about');
      return [
        { text: profile.name, tone: 'accent' },
        profile.tagline,
        ...profile.bio,
        { text: `● ${profile.status} — ${profile.location}`, tone: 'muted' },
      ];
    },
  },
  {
    name: 'skills',
    description: 'Service status of my tech stack',
    run: () => {
      scrollToSection('skills');
      return skills.flatMap((g) => [
        { text: `[${g.group}]`, tone: 'accent' },
        ...g.items.map((s) => `  ● ${s.name.padEnd(22)} ${'█'.repeat(Math.round(s.level / 10)).padEnd(10, '░')} ${s.level}%`),
      ]);
    },
  },
  {
    name: 'experience',
    description: 'Deployment log of my career',
    run: () => {
      scrollToSection('experience');
      return experience.map((e) => `${e.version.padEnd(6)} ${e.role} @ ${e.company}  (${e.period})`);
    },
  },
  {
    name: 'lab',
    description: 'Notebook entries: lab [name] or lab build|teardown|sketch|note',
    run: (args, site) => labCommand(args, site),
  },
  {
    name: 'projects',
    description: 'Things I built (same as: lab build)',
    run: (args, site) => labCommand(args.length ? args : ['build'], site),
  },
  {
    name: 'posts',
    description: 'Writing and events (same as: lab note)',
    run: (args, site) => labCommand(args.length ? args : ['note'], site),
  },
  {
    name: 'certs',
    description: 'Certifications',
    run: () => {
      scrollToSection('certifications');
      if (!certifications.length) return ['No certifications listed yet.'];
      return certifications.map((c) => `  ${c.date}  ${c.name} (${c.issuer})`);
    },
  },
  {
    name: 'trace',
    description: 'Trace your request through this site',
    run: async () => {
      const t0 = performance.now();
      try {
        const d = await (await fetch('/api/trace', { cache: 'no-store' })).json();
        const ms = Math.round(performance.now() - t0);
        const where = [d.visitor?.city, d.visitor?.country].filter(Boolean).join(', ') || 'your browser';
        return [
          { text: `trace to ${profile.domain}`, tone: 'accent' },
          `  1  ${where.padEnd(24)} you`,
          `  2  ${(d.edge.code || 'local').padEnd(24)} edge · ${d.edge.name}`,
          `  3  ${(d.fn.code || 'local').padEnd(24)} function · ${d.serverMs} ms`,
          `  4  ${'upstash'.padEnd(24)} redis · ${d.redisMs != null ? `${d.redisMs} ms` : 'not connected'}`,
          { text: `round trip ${ms} ms`, tone: 'muted' },
        ];
      } catch {
        return [{ text: 'trace failed: network error', tone: 'warn' }];
      }
    },
  },
  {
    name: 'ops',
    description: 'How this site is built, tested and run',
    run: () => {
      scrollToSection('operations');
      return ['Quality gates, running costs and recent commits: scrolling you there.'];
    },
  },
  {
    name: 'stats',
    description: 'Live traffic for this site',
    run: () => {
      const n = typeof window !== 'undefined' ? window.__visits : null;
      return n == null
        ? [{ text: 'Visitor counter is not connected yet.', tone: 'muted' }]
        : [`requests served   ${n.toLocaleString()}`, { text: 'Counted once per browser per day.', tone: 'muted' }];
    },
  },
  {
    name: 'contact',
    description: 'Ways to reach me',
    run: (args) => {
      scrollToSection('contact');
      if (args[0] === 'hire' || args[0] === 'hiring') {
        window.location.href = mailtoFor('hiring');
        return [{ text: 'Opening your mail client with a hiring template…', tone: 'accent' }];
      }
      return [
        `email     ${profile.email}`,
        ...profile.socials.filter((s) => s.url).map((s) => `${s.label.toLowerCase().padEnd(9)} ${s.url}`),
        { text: "Try 'email' to copy my address or 'contact hire' for a ready-made email.", tone: 'muted' },
      ];
    },
  },
  {
    name: 'email',
    description: 'Copy my email to clipboard',
    run: () => {
      copyEmail();
      return [{ text: `Copied ${profile.email} to clipboard.`, tone: 'accent' }];
    },
  },
  {
    name: 'resume',
    description: 'Open my resume (PDF)',
    run: () => {
      openResume();
      return ['Opening resume in a new tab…'];
    },
  },
  {
    name: 'theme',
    description: 'Switch theme: theme [light|dark]',
    run: (args) => {
      const t = args[0];
      if (t === 'light' || t === 'dark') {
        setTheme(t);
        return [`Theme set to ${t}.`];
      }
      return [`Theme set to ${toggleTheme()}.`];
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal',
    run: () => 'CLEAR',
  },
  {
    name: 'sudo',
    hidden: true,
    run: (args) => {
      if (args.join(' ') === 'hire-me') {
        fireEgg('confetti');
        scrollToSection('contact');
        return [{ text: 'Permission granted. Excellent decision. 🎉', tone: 'accent' }];
      }
      return [{ text: `${profile.handle} is not in the sudoers file. This incident will be reported. (Try 'sudo hire-me')`, tone: 'warn' }];
    },
  },
  {
    name: 'rm',
    hidden: true,
    run: (args) =>
      args.includes('-rf')
        ? [{ text: 'Nice try. This infrastructure has backups, immutable deploys, and a very good memory.', tone: 'warn' }]
        : ['rm: missing operand'],
  },
  {
    name: 'coffee',
    hidden: true,
    run: () => ['    ( (', '     ) )', '  ........', '  |      |]', '  \\      /', "   `----'", { text: 'Brewing… powered by caffeine and kubectl.', tone: 'muted' }],
  },
  {
    name: 'matrix',
    hidden: true,
    run: () => {
      fireEgg('matrix');
      return [{ text: 'Wake up, visitor…', tone: 'accent' }];
    },
  },
  { name: 'ls', hidden: true, run: () => ['about/  skills/  experience/  projects/  writing/  contact/  resume.pdf'] },
  { name: 'pwd', hidden: true, run: () => [`/home/visitor/${profile.domain}`] },
  { name: 'exit', hidden: true, run: () => ['There is no escape. But you can scroll ↓'] },
];

const TYPES = ['build', 'teardown', 'sketch', 'note'];

// lab            → every entry
// lab teardown   → entries of one type
// lab <slug>     → open that entry
function labCommand(args, site) {
  const entries = site.entries || [];
  const arg = (args[0] || '').toLowerCase();
  if (arg && !TYPES.includes(arg)) {
    const hit = entries.find((e) => e.slug.startsWith(arg));
    if (hit) {
      openPath(`/lab/${hit.slug}`);
      return [`Opening ${hit.title}\u2026`];
    }
    return [{ text: `No entry matches '${arg}'.`, tone: 'warn' }];
  }
  const shown = arg ? entries.filter((e) => e.type === arg) : entries;
  if (!shown.length) return ['Nothing here yet.'];
  return [
    ...shown.map((e) => `  ${e.date}  [${e.type.padEnd(8)}] ${e.slug}`),
    { text: "Open one with 'lab <name>', e.g. 'lab " + shown[0].slug + "'.", tone: 'muted' },
  ];
}

export const commandNames = commands.map((c) => c.name);

export function runCommand(input, site = { projects: [], posts: [] }) {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return [];
  const cmd = commands.find((c) => c.name === name.toLowerCase());
  if (!cmd) return [{ text: `command not found: ${name}. Type 'help' to see what I can do.`, tone: 'warn' }];
  return cmd.run(args, site);
}

export function complete(partial) {
  const p = partial.toLowerCase();
  if (!p) return [];
  return commands.filter((c) => !c.hidden && c.name.startsWith(p)).map((c) => c.name);
}
