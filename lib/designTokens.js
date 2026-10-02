import fs from 'fs';
import path from 'path';

// Reads styles/tokens.css at build time so the /design page documents every token, always in sync.
// Colours come with their light and dark values; everything else is grouped by name prefix.
const GROUPS = [
  ['Type', /^--(text-|font-)/],
  ['Space', /^--space-/],
  ['Radius', /^--radius/],
  ['Motion', /^--(dur|ease|stagger)/],
  ['Size', /^--(size-|max|gutter|nav-h|tabbar-h)/],
  ['Shadow', /^--shadow/],
  ['Layer', /^--z-/],
];

function block(css, selector) {
  const i = css.indexOf(selector);
  if (i < 0) return {};
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('\n}', i));
  const out = {};
  for (const m of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

export function getDesignTokens() {
  const css = fs.readFileSync(path.join(process.cwd(), 'styles/tokens.css'), 'utf8');
  const light = block(css, ":root[data-theme='light']");
  const dark = block(css, ":root[data-theme='dark']");
  const scale = block(css, '/* ---------- Scale ---------- */');
  const colours = Object.keys(light).map((name) => ({ name, light: light[name], dark: dark[name] || null }));
  const groups = GROUPS.map(([title, re]) => ({
    title,
    tokens: Object.entries(scale)
      .filter(([name]) => re.test(name))
      .map(([name, value]) => ({ name, value })),
  })).filter((g) => g.tokens.length);
  return { colours, groups, count: colours.length + groups.reduce((n, g) => n + g.tokens.length, 0) };
}
