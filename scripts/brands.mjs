#!/usr/bin/env node
// Builds public/brands/ from content/brands.js.
//   npm run brands        → copy simple-icons SVGs, write public/brands/manifest.json
//   npm run brands:check  → exit 1 if files or manifest are out of date (CI)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import brands from '../content/brands.js';

const require = createRequire(import.meta.url);
const OUT = path.join(process.cwd(), 'public', 'brands');
const check = process.argv.includes('--check');
const icons = require('simple-icons');

const key = (slug) => `si${slug[0].toUpperCase()}${slug.slice(1)}`;
// Near-black brand colours (GitHub, X, Vercel…) would vanish on the dark theme; those use the text colour instead.
const usable = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.12 ? `#${hex}` : null;
};
const problems = [];
const manifest = {};
const write = (file, content) => {
  const p = path.join(OUT, file);
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (prev === content) return;
  if (check) problems.push(`${file} is out of date`);
  else fs.writeFileSync(p, content);
};

fs.mkdirSync(OUT, { recursive: true });

for (const b of brands) {
  if (b.source === 'simple-icons') {
    const icon = icons[key(b.slug)];
    if (!icon) {
      problems.push(`${b.slug}: not in simple-icons (use source 'local' or 'text')`);
      continue;
    }
    write(`${b.slug}.svg`, `${icon.svg}\n`);
    manifest[b.slug] = { name: b.name || icon.title, color: b.color || usable(icon.hex), file: `/brands/${b.slug}.svg` };
  } else if (b.source === 'local') {
    if (!fs.existsSync(path.join(OUT, `${b.slug}.svg`))) problems.push(`${b.slug}: public/brands/${b.slug}.svg is missing`);
    manifest[b.slug] = { name: b.name, color: b.color || null, file: `/brands/${b.slug}.svg` };
  } else {
    manifest[b.slug] = { name: b.name, color: b.color || null, text: b.text };
  }
}

write('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

if (problems.length) {
  console.error(`Brand logos:\n  ${problems.join('\n  ')}${check ? '\nRun: npm run brands' : ''}`);
  process.exit(1);
}
console.log(`Brand logos: ${Object.keys(manifest).length} ${check ? 'up to date' : 'written to public/brands/'}`);
