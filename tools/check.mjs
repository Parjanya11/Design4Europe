// QA check. Run before every push, and in CI on every pull request.
//
//   npm run check                    run everything, exit 1 on any failure
//   npm run check:update-baseline    accept today's known accessibility issues
//
// Checks, at 360 / 768 / 1280 / 1600 px:
//   - no horizontal page scroll                    (brief: must hold at 360px)
//   - no text smaller than 11px                    (brief: site minimum)
//   - no failed requests, no console errors
//   - no axe-core accessibility violation that is not already in the
//     baseline. Known issues waiting on a design decision live in
//     axe-baseline.json; anything new fails the run.
// Full-page screenshots are written to tools/out/ for a visual pass.

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const BASELINE = path.join(HERE, 'axe-baseline.json');
const WIDTHS = [360, 768, 1280, 1600];
const MIN_FONT_PX = 11;
const PORT = 8123;
const updateBaseline = process.argv.includes('--update-baseline');

mkdirSync(OUT, { recursive: true });
const axeSource = readFileSync(path.join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');
const baseline = existsSync(BASELINE) ? new Set(JSON.parse(readFileSync(BASELINE, 'utf8'))) : new Set();

const server = await startServer(PORT);
const browser = await chromium.launch();
const failures = [];
const seenAxe = new Set();

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console error: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`script error: ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
  page.on('requestfailed', (r) => {
    // Google Fonts or other third parties would show here; the site should make none.
    problems.push(`request failed: ${r.url()}`);
  });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  // Lazy images below the fold only load when scrolled to; scroll through once.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');

  const layout = await page.evaluate((minPx) => {
    const doc = document.documentElement;
    const small = [...document.querySelectorAll('body *')]
      .filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .filter((el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.fontSize) < minPx && !el.closest('.u-sr'); })
      .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} @${getComputedStyle(el).fontSize}`);
    const thirdParty = performance.getEntriesByType('resource').map((e) => e.name).filter((u) => !u.startsWith(location.origin));
    return { scrollW: doc.scrollWidth, clientW: doc.clientWidth, small: [...new Set(small)], thirdParty };
  }, MIN_FONT_PX);

  if (layout.scrollW > layout.clientW + 1) problems.push(`horizontal scroll: page is ${layout.scrollW}px in a ${layout.clientW}px viewport`);
  if (layout.small.length) problems.push(`text under ${MIN_FONT_PX}px: ${layout.small.join(', ')}`);
  if (layout.thirdParty.length) problems.push(`third-party requests: ${[...new Set(layout.thirdParty)].join(', ')}`);

  if (width === 360 || width === 1280) {
    // axe is injected as an inline script, which the site's own CSP rightly
    // forbids. Scan in a separate context allowed to bypass it, so the main
    // page above still runs under the real policy and reports violations.
    const axeContext = await browser.newContext({ viewport: { width, height: 900 }, bypassCSP: true });
    const axePage = await axeContext.newPage();
    await axePage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await axePage.addScriptTag({ content: axeSource });
    const res = await axePage.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
    await axeContext.close();
    for (const v of res.violations) for (const n of v.nodes) {
      const id = `${v.id} | ${n.target.join(' ')}`;
      seenAxe.add(id);
      if (!baseline.has(id) && !updateBaseline) problems.push(`axe [${v.impact}] ${id}`);
    }
  }

  await page.screenshot({ path: path.join(OUT, `page-${width}.png`), fullPage: true });
  await page.close();

  const unique = [...new Set(problems)];
  console.log(`${unique.length ? '✗' : '✓'} ${width}px${unique.length ? '' : '  clean'}`);
  unique.forEach((p) => console.log(`    ${p}`));
  failures.push(...unique.map((p) => `${width}px ${p}`));
}

await browser.close();
server.close();

if (updateBaseline) {
  writeFileSync(BASELINE, JSON.stringify([...seenAxe].sort(), null, 1) + '\n');
  console.log(`\nBaseline updated: ${seenAxe.size} known accessibility issue(s) recorded in axe-baseline.json`);
  process.exit(0);
}
const fixed = [...baseline].filter((id) => !seenAxe.has(id));
if (fixed.length) console.log(`\n${fixed.length} baseline issue(s) no longer occur. Run check:update-baseline to drop them.`);
console.log(failures.length ? `\nFAILED: ${failures.length} problem(s). Screenshots in tools/out/` : `\nAll checks passed. Screenshots in tools/out/`);
process.exit(failures.length ? 1 : 0);
