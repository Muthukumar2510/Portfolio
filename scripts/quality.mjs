#!/usr/bin/env node
// Quality gates against a running production build (run by .github/workflows/quality.yml).
//   BASE=http://localhost:3000 node scripts/quality.mjs
// Checks: security headers, broken internal links, Lighthouse scores vs budget.
// With PUBLISH=1 and Redis configured, stores the result so the site can show it.
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { redisConfig, redis } from '../lib/monitor.mjs';

const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/$/, '');
export const QUALITY_KEY = 'portfolio:quality';
const BUDGET = { performance: 85, accessibility: 95, 'best-practices': 95, seo: 95 };
const REQUIRED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];
const LH_PAGES = ['/', '/lab/this-site', '/lab'];
const LH_RUNS = Number(process.env.LH_RUNS || 3);
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.log(`  ✕ ${msg}`);
};

// 1. Security headers
console.log('Security headers');
const home = await fetch(`${BASE}/`);
const missing = REQUIRED_HEADERS.filter((h) => !home.headers.get(h));
if (missing.length) fail(`missing headers: ${missing.join(', ')}`);
if (/unsafe-inline/.test((home.headers.get('content-security-policy') || '').match(/script-src[^;]*/)?.[0] || '')) fail("CSP script-src allows 'unsafe-inline'");
const headersScore = REQUIRED_HEADERS.length - missing.length;
console.log(`  ${headersScore}/${REQUIRED_HEADERS.length} present`);

// 2. Crawl internal links from the sitemap
console.log('Links');
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const seen = new Map();
const check = async (p) => {
  if (!seen.has(p)) seen.set(p, fetch(`${BASE}${p}`, { redirect: 'follow' }).then((r) => r.status).catch(() => 0));
  return seen.get(p);
};
const broken = [];
for (const page of pages) {
  const status = await check(page);
  if (status !== 200) {
    broken.push(`${page} (${status})`);
    continue;
  }
  const html = await (await fetch(`${BASE}${page}`)).text();
  const links = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]).filter((l) => !l.startsWith('/_next/') && !l.startsWith('/api/'));
  for (const l of new Set(links)) {
    const s = await check(decodeURI(l));
    if (s !== 200) broken.push(`${l} (${s}) on ${page}`);
  }
}
if (broken.length) fail(`broken links: ${[...new Set(broken)].join('; ')}`);
console.log(`  ${seen.size} URLs checked, ${broken.length} broken`);

// 3. Lighthouse: median of LH_RUNS runs per page (Lighthouse's recommended way to cut variance);
//    the worst page's median must meet the budget.
console.log('Lighthouse');
const scores = { performance: 100, accessibility: 100, 'best-practices': 100, seo: 100 };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lh-'));

// Lighthouse occasionally fails to record a trace (e.g. NO_NAVSTART). That's a tool error, not a
// score, so retry the run; scores themselves are never retried or averaged.
function runLighthouse(page, out, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      execFileSync(
        'npx',
        [
          '--yes',
          'lighthouse@12',
          `${BASE}${page}`,
          '--quiet',
          '--output=json',
          `--output-path=${out}`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--chrome-flags=--headless=new --no-sandbox',
        ],
        { stdio: ['ignore', 'ignore', 'inherit'] }
      );
      return;
    } catch (e) {
      if (i === attempts) throw e;
      console.log(`  ${page}: Lighthouse run failed (attempt ${i}/${attempts}), retrying`);
    }
  }
}
// Warm the server and route caches so the first audited page isn't penalised for a cold start.
for (const page of LH_PAGES) await fetch(`${BASE}${page}`).then((r) => r.arrayBuffer());

for (const page of LH_PAGES) {
  const runs = {};
  for (let i = 0; i < LH_RUNS; i++) {
    const out = path.join(tmp, `${page.replace(/\W+/g, '_') || 'home'}-${i}.json`);
    runLighthouse(page, out);
    const report = JSON.parse(fs.readFileSync(out, 'utf8'));
    for (const [k, v] of Object.entries(report.categories)) (runs[k] ||= []).push(Math.round(v.score * 100));
  }
  const line = [];
  for (const [k, xs] of Object.entries(runs)) {
    const m = median(xs);
    scores[k] = Math.min(scores[k], m);
    line.push(`${k} ${m}${xs.length > 1 ? ` (${xs.join('/')})` : ''}`);
  }
  console.log(`  ${page}: ${line.join(' · ')}`);
}
for (const [k, min] of Object.entries(BUDGET)) if (scores[k] < min) fail(`${k} ${scores[k]} < budget ${min}`);

const result = {
  t: Date.now(),
  commit: (process.env.GITHUB_SHA || 'local').slice(0, 7),
  lighthouse: scores,
  headers: { present: headersScore, total: REQUIRED_HEADERS.length },
  links: { checked: seen.size, broken: broken.length },
  passed: failures.length === 0,
};
console.log(`\n${result.passed ? 'All quality gates passed.' : `${failures.length} gate(s) failed.`}`);

const cfg = redisConfig();
if (process.env.PUBLISH === '1' && cfg) {
  await redis(cfg, [['SET', QUALITY_KEY, JSON.stringify(result)]]);
  console.log('Published to Redis.');
}
process.exit(result.passed ? 0 : 1);
