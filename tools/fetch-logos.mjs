// Collect signatory logo originals from the sources in logo-sources.json.
//
//   npm run logos:fetch              every entry
//   npm run logos:fetch -- vdid tum  only these slugs
//
// Writes originals to assets/source/logos/, then `node logos.mjs` turns
// them into the WebP the page uses. Also writes tools/out/logo-sheet.png
// (every logo on a chip-sized white tile) and prints the chip markup to
// paste into the banner in index.html.
//
// Finding a better file for a logo: search the organisation's site (view
// source, look for "logo" in img src) or Wikimedia Commons. Only use it if
// it is the same design as the one we were sent. Put its URL in the
// manifest and run this again.

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');
const SUPPLIED = path.join(ROOT, 'assets/new logos');
const SRC = path.join(ROOT, 'assets/source/logos');
const OUT = path.join(TOOLS, 'out');

// A chip's content box is 130x50 (2.6:1); a wide chip's is 210x50 (4.2:1).
// Past this ratio a logo reads better in the wide chip.
const WIDE_RATIO = 3.2;

const { logos } = JSON.parse(readFileSync(path.join(TOOLS, 'logo-sources.json'), 'utf8'));
const only = process.argv.slice(2);
const todo = only.length ? logos.filter((l) => only.includes(l.slug)) : logos;
if (only.length && todo.length !== only.length) {
  console.error('Unknown slug in:', only.join(', '));
  process.exit(1);
}

mkdirSync(SRC, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Downloaded SVGs come from other people's servers. They are only ever
// rasterised, never served, but refuse anything active or that reaches out.
function checkSvg(text, slug) {
  const bad = [
    [/<script/i, 'a script'],
    [/\son[a-z]+\s*=/i, 'an event handler'],
    [/<foreignObject/i, 'foreignObject'],
    [/(?:xlink:)?href\s*=\s*["'](?:https?:)?\/\//i, 'an external reference'],
  ].find(([re]) => re.test(text));
  if (bad) throw new Error(`${slug}: SVG contains ${bad[1]}, refusing it`);
}

async function download(entry) {
  const res = await fetch(entry.url, {
    headers: { 'User-Agent': 'design4europe-logo-tool/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${entry.slug}: HTTP ${res.status} from ${entry.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 512).toString('utf8');
  if (/<svg/i.test(head) || /<svg/i.test(buf.toString('utf8', 0, 4096))) {
    checkSvg(buf.toString('utf8'), entry.slug);
    return { buf, ext: 'svg' };
  }
  const { format } = await sharp(buf).metadata(); // throws on non-images
  return { buf: await sharp(buf).trim({ threshold: 12 }).png().toBuffer(), ext: 'png', format };
}

// Supplied files are often screenshots or exports with a white margin;
// trim it, or the chip padding plus the margin shrinks the logo.
async function supplied(entry) {
  const buf = await sharp(path.join(SUPPLIED, entry.supplied))
    .trim({ threshold: 12 })
    .png()
    .toBuffer();
  return { buf, ext: 'png' };
}

// Render on white, as the chip shows it. A logo that comes out blank was
// white-on-transparent (sites often serve those for dark headers).
async function render(file, w, h) {
  const isSvg = file.endsWith('.svg');
  return sharp(file, isSvg ? { density: 300 } : {})
    .resize(w, h, { fit: 'contain', background: '#fff' })
    .flatten({ background: '#fff' })
    .png()
    .toBuffer();
}

const results = [];
for (const entry of todo) {
  try {
    const got = entry.url ? await download(entry) : await supplied(entry);
    // One original per slug: drop any older file with another extension.
    for (const f of readdirSync(SRC)) {
      if (path.parse(f).name === entry.slug) rmSync(path.join(SRC, f));
    }
    const file = path.join(SRC, `${entry.slug}.${got.ext}`);
    writeFileSync(file, got.buf);

    const { width, height } = await sharp(file, got.ext === 'svg' ? { density: 300 } : {}).metadata();
    const stats = await sharp(await render(file, 200, 80)).stats();
    if (stats.channels.every((c) => c.stdev < 1)) {
      throw new Error(`${entry.slug}: renders blank on white (a white logo?). Find a dark version.`);
    }
    const ratio = width / height;
    results.push({ ...entry, file, ratio, wide: ratio > WIDE_RATIO });
    console.log(`ok   ${entry.slug.padEnd(22)} ${entry.url ? 'web     ' : 'supplied'} ${got.ext}  ${ratio.toFixed(2)}:1`);
  } catch (err) {
    console.log(`FAIL ${err.message}`);
    process.exitCode = 1;
  }
}

// Review sheet: each logo at the size and padding of its chip.
if (results.length) {
  const TILE_W = 260, TILE_H = 120, COLS = 4;
  const rows = Math.ceil(results.length / COLS);
  const layers = [];
  for (const [i, r] of results.entries()) {
    const x = (i % COLS) * TILE_W, y = Math.floor(i / COLS) * TILE_H;
    const boxW = r.wide ? 210 : 130;
    layers.push({ input: await render(r.file, boxW, 50), left: x + (TILE_W - boxW) / 2, top: y + 20 });
    const label = `${r.slug}${r.wide ? ' (wide)' : ''}${r.url ? '' : ' *supplied'}`;
    layers.push({
      input: Buffer.from(`<svg width="${TILE_W}" height="24"><text x="8" y="16" font-size="12" font-family="monospace" fill="#555">${label}</text></svg>`),
      left: x, top: y + 90,
    });
  }
  await sharp({ create: { width: TILE_W * COLS, height: TILE_H * rows, channels: 3, background: '#f7f9fc' } })
    .composite(layers)
    .png()
    .toFile(path.join(OUT, 'logo-sheet.png'));
  console.log('\nReview sheet: tools/out/logo-sheet.png');

  console.log('\nChip markup for the banner in index.html (then run `node logos.mjs`):\n');
  for (const r of results) {
    const alt = r.name.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    console.log(`        <div class="logo-chip${r.wide ? ' wide' : ''}"><img src="assets/logos/${r.slug}.webp" alt="${alt}" /></div>`);
  }
}
