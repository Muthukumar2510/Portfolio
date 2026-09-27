#!/usr/bin/env node
// Turns a "New post or event" issue (see .github/ISSUE_TEMPLATE/new-post.yml) into
// content/posts/<slug>.md plus public/media/posts/<slug>/NN.jpg. Run by .github/workflows/new-post.yml.
// Input via env only (never interpolated into a shell): ISSUE_BODY, ISSUE_NUMBER, GITHUB_TOKEN.
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const body = process.env.ISSUE_BODY || '';
const EMPTY = '_No response_';
const IMAGE_HOSTS = ['github.com', 'user-images.githubusercontent.com', 'private-user-images.githubusercontent.com'];
const MAX_IMAGES = 40;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Issue forms render as "### Label\n\nvalue" blocks.
function sections(md) {
  const out = {};
  const parts = md.split(/^### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const label = part.slice(0, nl).trim();
    const value = part.slice(nl + 1).trim();
    out[label] = value === EMPTY ? '' : value;
  }
  return out;
}

const f = sections(body);
const title = (f['Title'] || '').replace(/\s+/g, ' ').trim().slice(0, 120);
if (!title) {
  console.error('Title is required.');
  process.exit(1);
}
const type = f['Type'] === 'blog' ? 'blog' : 'event';
const date = /^\d{4}-\d{2}-\d{2}$/.test(f['Date'] || '') ? f['Date'] : new Date().toISOString().slice(0, 10);
const album = /^https:\/\/(photos\.app\.goo\.gl|photos\.google\.com)\//.test(f['Google Photos album link'] || '') ? f['Google Photos album link'] : '';
const draft = /\[x\]\s*Save as draft/i.test(f['Options'] || '');

let slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/[\s_]+/g, '-')
  .replace(/-+/g, '-')
  .slice(0, 60)
  .replace(/-$/, '');
if (!slug) slug = `post-${process.env.ISSUE_NUMBER || Date.now()}`;
for (let i = 2; fs.existsSync(path.join(ROOT, 'content', 'posts', `${slug}.md`)); i++) slug = `${slug.replace(/-\d+$/, '')}-${i}`;

// Pull attached images out of the story; they become the collage instead.
let story = f['Story'] || '';
const urls = [];
story = story.replace(/!\[[^\]]*\]\((https:[^)\s]+)\)|<img[^>]*src="(https:[^"]+)"[^>]*>/g, (m, a, b) => {
  const u = a || b;
  try {
    if (IMAGE_HOSTS.includes(new URL(u).hostname) && urls.length < MAX_IMAGES) {
      urls.push(u);
      return '';
    }
  } catch {}
  return m;
});
story = story.replace(/\n{3,}/g, '\n\n').trim();

const mediaDir = path.join(ROOT, 'public', 'media', 'posts', slug);
let saved = 0;
for (const u of urls) {
  const r = await fetch(u, { headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}, redirect: 'follow' });
  const ext = EXT[(r.headers.get('content-type') || '').split(';')[0]];
  if (!r.ok || !ext) {
    console.warn(`skipped ${u} (${r.status} ${r.headers.get('content-type')})`);
    continue;
  }
  fs.mkdirSync(mediaDir, { recursive: true });
  saved++;
  fs.writeFileSync(path.join(mediaDir, `${String(saved).padStart(2, '0')}.${ext}`), Buffer.from(await r.arrayBuffer()));
}

// JSON strings are valid YAML scalars, so values can't break the front matter.
const q = (s) => JSON.stringify(s);
const front = [
  '---',
  `title: ${q(title)}`,
  `type: ${type}`,
  `summary: ${q((f['One-line summary'] || '').slice(0, 200))}`,
  `date: ${date}`,
  f['Location'] ? `location: ${q(f['Location'].slice(0, 80))}` : null,
  `album: ${q(album)}`,
  draft ? 'draft: true' : null,
  '---',
]
  .filter(Boolean)
  .join('\n');

fs.writeFileSync(path.join(ROOT, 'content', 'posts', `${slug}.md`), `${front}\n\n${story}\n`);
console.log(`Created content/posts/${slug}.md with ${saved} photo(s).`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\ntitle=${title.replace(/[\r\n]/g, ' ')}\nphotos=${saved}\n`);
