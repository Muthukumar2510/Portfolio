#!/usr/bin/env node
// Captures the before/after pair for a Sketch entry, so every UI experiment leaves a record.
//
//   npm run dev                                   (or next start)
//   npm run sketch -- <slug> before /#lab         → public/media/entries/<slug>/before.webp
//   …make the design change…
//   npm run sketch -- <slug> after /#lab          → public/media/entries/<slug>/after.webp
//   npm run media                                 (strips metadata, writes the manifest)
//
// Options: --theme=dark, --width=375 (phone), --selector=#lab (capture one element instead of the viewport).
// BASE defaults to http://localhost:3000. Needs Playwright: npm i -D playwright (CHROME_PATH to reuse a browser).
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [slug, state, route = '/'] = args.filter((a) => !a.startsWith('--'));
if (!/^[a-z0-9-]+$/.test(slug || '') || !['before', 'after'].includes(state)) {
  console.error('Usage: npm run sketch -- <slug> <before|after> [path] [--theme=dark] [--width=375] [--selector=#id]');
  process.exit(1);
}

const { chromium } = await import('playwright').catch(() => {
  console.error('Install Playwright first: npm i -D playwright');
  process.exit(1);
});

const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/$/, '');
const width = Number(opt.width || 1440);
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({
  viewport: { width, height: width < 768 ? 812 : 900 },
  deviceScaleFactor: 2,
  isMobile: width < 768,
  colorScheme: opt.theme === 'dark' ? 'dark' : 'light',
  reducedMotion: 'reduce', // drawings appear finished, no mid-animation frames
});
const [pathname, hash] = route.split('#');
await page.goto(`${BASE}${pathname || '/'}`, { waitUntil: 'load' });
if (hash) await page.evaluate((id) => document.getElementById(id)?.scrollIntoView(), hash);
await page.waitForTimeout(1200);
const target = opt.selector ? await page.$(opt.selector) : null;
const png = target ? await target.screenshot() : await page.screenshot();
await browser.close();

const dir = path.join(process.cwd(), 'public', 'media', 'entries', slug);
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, `${state}.webp`);
await sharp(png).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
console.log(`Saved ${path.relative(process.cwd(), out)}. Run npm run media when both are captured.`);
