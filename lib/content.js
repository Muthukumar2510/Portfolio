import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { DIAGRAMS } from '../content/diagrams';
import { parseDiagramText } from './diagramText';

// Server-only: reads content/<collection>/*.md and public/media/<collection>/<slug>/*.
// The notebook has one collection, `entries`; each entry has a `type` (see ENTRY_TYPES).
const ROOT = process.cwd();

// Entry types, in the order the Lab shows its filters.
export const ENTRY_TYPES = [
  { id: 'build', label: 'Builds', hint: 'things I made' },
  { id: 'teardown', label: 'Teardowns', hint: 'how things work' },
  { id: 'sketch', label: 'Sketches', hint: 'UI studies' },
  { id: 'note', label: 'Notes', hint: 'writing and events' },
];
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

let manifestCache;
// Written by scripts/media.mjs: { "/media/...": { width, height, blur } }.
function manifest() {
  if (!manifestCache) {
    const file = path.join(ROOT, 'public', 'media', 'manifest.json');
    manifestCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  }
  return manifestCache;
}

// Image objects: { src, width, height, blur } (dimensions/blur are null until `npm run media` has run).
function image(src) {
  const m = manifest()[src] || {};
  return { src, width: m.width ?? null, height: m.height ?? null, blur: m.blur ?? null };
}

function mediaFor(collection, slug) {
  const dir = path.join(ROOT, 'public', 'media', collection, slug);
  if (!fs.existsSync(dir)) return { cover: null, images: [], before: null, after: null };
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => image(`/media/${collection}/${slug}/${encodeURIComponent(f)}`));
  // Sketches: before.* and after.* are a comparison pair, not gallery photos.
  const pair = (name) => files.find((f) => new RegExp(`/${name}\\.[a-z]+$`, 'i').test(f.src)) || null;
  const before = pair('before');
  const after = pair('after');
  const rest = files.filter((f) => f !== before && f !== after);
  const named = rest.find((f) => /\/cover\.[a-z]+$/i.test(f.src));
  return { cover: named || rest[0] || after || null, images: rest.filter((f) => f !== named), before, after };
}

// Drafts (`draft: true`) render in `npm run dev` and are hidden in production unless SHOW_DRAFTS=1.
const showDrafts = process.env.NODE_ENV !== 'production' || process.env.SHOW_DRAFTS === '1';

function toDateString(d) {
  if (!d) return '';
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d);
}

function readEntry(collection, slug) {
  const file = path.join(ROOT, 'content', collection, `${slug}.md`);
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const media = mediaFor(collection, slug);
  return {
    slug,
    collection,
    ...data,
    date: toDateString(data.date),
    cover: media.cover,
    images: media.images,
    before: media.before,
    after: media.after,
    body: content,
  };
}

const PREVIEW_IMAGES = 9;

function summary({ body, images, ...rest }) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    ...rest,
    imageCount: images.length,
    preview: images.slice(0, PREVIEW_IMAGES),
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

export function getCollection(collection) {
  const dir = path.join(ROOT, 'content', collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readEntry(collection, f.replace(/\.md$/, '')))
    .filter((e) => showDrafts || !e.draft)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.date.localeCompare(a.date))
    .map(summary);
}

export function getEntry(collection, slug) {
  const entry = readEntry(collection, slug);
  const list = getCollection(collection);
  const i = list.findIndex((e) => e.slug === slug);
  const { body, ...rest } = entry;
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    ...rest,
    diagram: resolveDiagram(rest.diagram, rest.title),
    readingMinutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body),
    prev: list[i - 1] ? { slug: list[i - 1].slug, title: list[i - 1].title } : null,
    next: list[i + 1] ? { slug: list[i + 1].slug, title: list[i + 1].title } : null,
  };
}

// An entry's `diagram:` is either the name of one in content/diagrams.js, or the diagram itself written as text
// (see lib/diagramText.js), e.g. from the GitHub issue form. Returns diagram data or null.
export function resolveDiagram(value, title) {
  if (!value) return null;
  if (typeof value === 'string' && DIAGRAMS[value.trim()]) return DIAGRAMS[value.trim()];
  if (typeof value === 'string' && value.includes('->')) return parseDiagramText(value, title);
  return null;
}

// Site-wide data every page needs (navigation, search, terminal). Keep it small: no bodies.
export function getSiteData() {
  const strip = ({ preview, architecture, metrics, ...rest }) => rest;
  return { entries: getEntries().map(strip) };
}

// Every entry, newest first (featured builds first), for the Lab and the home page.
export function getEntries() {
  return getCollection('entries');
}

// Events (and any entry with photos or an album link), newest first, for the Moments section.
export function getMoments() {
  return getEntries()
    .filter((e) => e.event || e.imageCount > 0 || e.album)
    .sort((a, b) => b.date.localeCompare(a.date));
}
