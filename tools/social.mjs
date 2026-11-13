// Render the share image.
//
//   npm run social
//
// Screenshots tools/social/card.html at 1200 x 630 into
// assets/social-preview.png, using the site's own self-hosted fonts.

import { chromium } from 'playwright';
import path from 'node:path';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/social-preview.png');
const PORT = 8126;

const server = await startServer(PORT);
const browser = await chromium.launch();
// The card uses an inline <style>, which the site's CSP (applied by the
// local server) forbids. It is a build tool page, never deployed, so the
// policy is bypassed here only.
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, bypassCSP: true });
const page = await context.newPage();
await page.goto(`http://localhost:${PORT}/tools/social/card.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// document.fonts.check() is true even when no face exists at all, so
// count the faces that actually loaded instead.
const fontsOk = await page.evaluate(() => {
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
  return loaded.includes('Archivo') && loaded.includes('IBM Plex Sans');
});
if (!fontsOk) throw new Error('Fonts did not load; the image would use fallback type.');
await page.screenshot({ path: OUT });
await browser.close();
server.close();
console.log(`Wrote ${path.relative(ROOT, OUT)} (${Math.round(statSync(OUT).size / 1024)} KB)`);
