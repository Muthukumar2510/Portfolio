import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Server-only: reads content/<collection>/*.md and public/media/<collection>/<slug>/*.
const ROOT = process.cwd();
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

function mediaFor(collection, slug) {
  const dir = path.join(ROOT, 'public', 'media', collection, slug);
  if (!fs.existsSync(dir)) return { cover: null, images: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `/media/${collection}/${slug}/${encodeURIComponent(f)}`);
  const named = files.find((f) => /\/cover\.[a-z]+$/i.test(f));
  return { cover: named || files[0] || null, images: files.filter((f) => f !== named) };
}

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
    readingMinutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body),
    prev: list[i - 1] ? { slug: list[i - 1].slug, title: list[i - 1].title } : null,
    next: list[i + 1] ? { slug: list[i + 1].slug, title: list[i + 1].title } : null,
  };
}

// Site-wide data every page needs (navigation, search, terminal). Keep it small: no bodies.
export function getSiteData() {
  const strip = ({ preview, ...rest }) => rest;
  return {
    projects: getCollection('projects').map(strip),
    posts: getCollection('posts').map(strip),
  };
}

// Events (and any post with photos or an album link), newest first, for the Moments section.
export function getMoments() {
  return getCollection('posts')
    .filter((p) => p.type === 'event' || p.imageCount > 0 || p.album)
    .sort((a, b) => b.date.localeCompare(a.date));
}
