#!/usr/bin/env node
// Scroll smoothness check for the home page (run against `next start`).
//   BASE=http://localhost:3000 node scripts/smoothness.mjs
// Scrolls the whole page on a desktop and on a phone with a 4× slower CPU, and fails if frames average over 20 ms,
// any frame is long (> 50 ms), or the layout shifts. Needs Playwright: `npm i -D playwright` (CHROME_PATH to reuse a browser).
const { chromium } = await import('playwright').catch(() => {
  console.error('Install Playwright first: npm i -D playwright');
  process.exit(1);
});

const BASE = process.env.BASE || 'http://localhost:3000';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
let failed = false;

for (const [name, opts, cpu] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }, 1],
  ['phone, 4x slower CPU', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 4],
]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    let cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (cls += e.value))).observe({ type: 'layout-shift' });
    const frames = [];
    let last = performance.now();
    let running = true;
    const tick = (t) => {
      frames.push(t - last);
      last = t;
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const H = document.documentElement.scrollHeight - innerHeight;
    for (let y = 0; y <= H; y += 40) {
      window.scrollTo(0, y);
      await new Promise((res) => requestAnimationFrame(res));
    }
    running = false;
    frames.shift();
    return { avg: frames.reduce((a, b) => a + b, 0) / frames.length, long: frames.filter((f) => f > 50).length, cls };
  });
  const ok = r.avg <= 20 && r.long === 0 && r.cls < 0.01;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✕'} ${name}: avg frame ${r.avg.toFixed(1)} ms, long frames ${r.long}, layout shift ${r.cls.toFixed(3)}`);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
