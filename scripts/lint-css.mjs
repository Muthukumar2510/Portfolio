#!/usr/bin/env node
// Enforces the design-token rule: raw colours and raw font sizes only in styles/tokens.css.
// Usage: npm run lint:css
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ALLOWED = new Set(['styles/tokens.css']);
const RULES = [
  { name: 'raw colour', re: /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\((?!var\()/gi, hint: 'use a colour token, e.g. var(--accent)' },
  { name: 'raw font-size', re: /font-size:\s*[\d.]+(px|rem|em)\b/gi, hint: 'use a type token, e.g. var(--text-sm)' },
  { name: 'raw z-index', re: /z-index:\s*\d{2,}/gi, hint: 'use a layer token, e.g. var(--z-nav)' },
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
}

let problems = 0;
for (const file of [...walk(path.join(ROOT, 'styles')), ...walk(path.join(ROOT, 'components'))]) {
  const rel = path.relative(ROOT, file);
  if (ALLOWED.has(rel)) continue;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('lint-css-ignore')) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      if (rule.re.test(line)) {
        problems++;
        console.log(`${rel}:${i + 1}  ${rule.name}: ${line.trim()}\n    → ${rule.hint}`);
      }
    }
  });
}

if (problems) {
  console.log(`\n${problems} problem(s). Add or reuse a token in styles/tokens.css.`);
  process.exit(1);
}
console.log('CSS tokens: OK');
