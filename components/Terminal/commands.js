import profile from '../../content/profile';
import skills from '../../content/skills';
import experience from '../../content/experience';
import {
  scrollToSection,
  setTheme,
  toggleTheme,
  copyEmail,
  openResume,
  fireEgg,
  mailtoFor,
  openPath,
} from '../../lib/actions';

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
    name: 'projects',
    description: 'Services I have deployed: projects [name]',
    run: (args, site) => {
      const hit = args[0] && site.projects.find((p) => p.slug.startsWith(args[0].toLowerCase()));
      if (hit) {
        openPath(`/projects/${hit.slug}`);
        return [`Opening ${hit.title}\u2026`];
      }
      scrollToSection('projects');
      return [
        ...site.projects.map((p) => `  [${p.status}] ${p.slug.padEnd(18)} ${p.summary}`),
        { text: "Open one with 'projects <name>', e.g. 'projects " + (site.projects[0]?.slug || '') + "'.", tone: 'muted' },
      ];
    },
  },
  {
    name: 'posts',
    description: 'Blog posts and events',
    run: (args, site) => {
      scrollToSection('writing');
      if (!site.posts.length) return ['No posts yet.'];
      return site.posts.map((p) => `  ${p.date}  [${p.type}] ${p.title}`);
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
