import fs from 'fs';
import path from 'path';

// Server-only: turns infra/terraform/main.tf into a diagram spec for <ArchitectureDiagram>.
// Nodes are resources; an edge A → B means B references A (so A must exist first).
const FILE = path.join(process.cwd(), 'infra', 'terraform', 'main.tf');

const LABELS = {
  upstash_redis_database: 'Redis database',
  vercel_project: 'Vercel project',
  vercel_project_environment_variable: 'Env variable',
  vercel_project_domain: 'Custom domain',
  github_actions_secret: 'Actions secret',
  github_actions_variable: 'Actions variable',
};

const PROVIDER = (type) => (type.startsWith('vercel_') ? 'Vercel' : type.startsWith('upstash_') ? 'Upstash' : type.startsWith('github_') ? 'GitHub' : 'Terraform');

export function getInfra() {
  if (!fs.existsSync(FILE)) return null;
  const src = fs.readFileSync(FILE, 'utf8');
  const re = /((?:^#[^\n]*\n)*)resource\s+"(\w+)"\s+"(\w+)"\s*\{/gm;
  const blocks = [];
  let m;
  while ((m = re.exec(src))) {
    // Find the matching closing brace for this block.
    let depth = 1;
    let i = re.lastIndex;
    while (depth && i < src.length) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    const body = src.slice(re.lastIndex, i - 1);
    const comment = m[1]
      .split('\n')
      .map((l) => l.replace(/^#\s?/, '').trim())
      .filter(Boolean)
      .join(' ');
    blocks.push({ type: m[2], name: m[3], id: `${m[2]}.${m[3]}`, body, comment, conditional: /\bcount\s*=/.test(body) });
  }

  const ids = new Set(blocks.map((b) => b.id));
  const links = [];
  for (const b of blocks) {
    const refs = new Set([...b.body.matchAll(/\b([a-z]+_[a-z_]+)\.(\w+)\b/g)].map((r) => `${r[1]}.${r[2]}`).filter((r) => ids.has(r) && r !== b.id));
    refs.forEach((r) => links.push([r, b.id]));
  }

  // Columns by provider so edges fan out without crossing: GitHub ← Upstash → Vercel resources ← Vercel project.
  const colOf = (type) => (type.startsWith('github_') ? 0 : type.startsWith('upstash_') ? 1 : type === 'vercel_project' ? 3 : 2);
  const byCol = {};
  blocks.forEach((b) => (byCol[colOf(b.type)] ||= []).push(b));
  const tallest = Math.max(...Object.values(byCol).map((c) => c.length));
  const nodes = blocks.map((b) => {
    const col = colOf(b.type);
    const list = byCol[col];
    // Centre short columns vertically against the tallest one.
    const row = list.indexOf(b) + (tallest - list.length) / 2;
    return {
      id: b.id,
      label: LABELS[b.type] || b.type,
      sub: b.name,
      col,
      row,
      note: `${PROVIDER(b.type)} · ${b.id}${b.conditional ? ' (only when configured)' : ''}. ${b.comment || ''}`.trim(),
    };
  });

  return { spec: { nodes, links }, source: src, count: blocks.length, providers: [...new Set(blocks.map((b) => PROVIDER(b.type)))] };
}
