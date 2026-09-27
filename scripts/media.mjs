#!/usr/bin/env node
// Photo pipeline for public/media.
//   npm run media        → auto-rotate, strip ALL metadata (GPS, camera, time), cap size, write manifest
//   npm run media:check  → exit 1 if any photo still has metadata or the manifest is stale (used by CI)
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = path.join(process.cwd(), 'public', 'media');
const MANIFEST = path.join(ROOT, 'manifest.json');
const MAX_EDGE = 2400;
const BLUR_WIDTH = 16;
const IMAGE = /\.(jpe?g|png|webp)$/i;
const check = process.argv.includes('--check');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (IMAGE.test(e.name)) out.push(p);
  }
  return out.sort();
}

function encoder(img, ext) {
  if (ext === '.png') return img.png({ compressionLevel: 9, palette: false });
  if (ext === '.webp') return img.webp({ quality: 82 });
  return img.jpeg({ quality: 82, mozjpeg: true });
}

const needsWork = (meta) => Boolean(meta.exif || meta.xmp || meta.iptc || (meta.orientation && meta.orientation !== 1) || Math.max(meta.width, meta.height) > MAX_EDGE);

const manifest = {};
const problems = [];
let changed = 0;

for (const file of walk(ROOT)) {
  const rel = `/media/${path.relative(ROOT, file).split(path.sep).map(encodeURIComponent).join('/')}`;
  const ext = path.extname(file).toLowerCase();
  let meta = await sharp(file).metadata();

  if (needsWork(meta)) {
    if (check) {
      problems.push(`${rel}: ${meta.exif ? 'has EXIF metadata (may include GPS location)' : 'not optimised'}`);
    } else {
      const buf = await encoder(sharp(file).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true }), ext).toBuffer();
      fs.writeFileSync(file, buf);
      meta = await sharp(buf).metadata();
      changed++;
      console.log(`optimised ${rel} → ${meta.width}×${meta.height}, ${(buf.length / 1024).toFixed(0)} KB`);
    }
  }

  const blur = await sharp(file).resize({ width: BLUR_WIDTH }).jpeg({ quality: 50 }).toBuffer();
  manifest[rel] = { width: meta.width, height: meta.height, blur: `data:image/jpeg;base64,${blur.toString('base64')}` };
}

const next = `${JSON.stringify(manifest, null, 2)}\n`;
const prev = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, 'utf8') : '';

if (check) {
  if (next !== prev && Object.keys(manifest).length) problems.push('public/media/manifest.json is out of date');
  if (problems.length) {
    console.error(`Media check failed:\n  ${problems.join('\n  ')}\nRun: npm run media`);
    process.exit(1);
  }
  console.log(`Media: OK (${Object.keys(manifest).length} images)`);
} else {
  if (next !== prev) fs.writeFileSync(MANIFEST, next);
  console.log(`Media: ${Object.keys(manifest).length} images, ${changed} optimised, manifest ${next !== prev ? 'updated' : 'unchanged'}`);
}
