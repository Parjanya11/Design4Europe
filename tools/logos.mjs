// Resize signatory logos for the marquee.
//
//   node logos.mjs
//
// Reads originals from assets/source/logos/, writes WebP to assets/logos/
// sized to 3x the chip's content box (sharp on high-density phones, no
// bigger), after trimming any margin in the file (see logo-trim.mjs).
// Originals usually arrive through `npm run logos:fetch`; see the README.

import sharp from 'sharp';
import { trimmed, isSvg } from './logo-trim.mjs';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/source/logos');
const OUT = path.join(ROOT, 'assets/logos');
// Chip content box is 130x50 (wide chips 210x50); 3x of the wide box
// covers both, and `inside` keeps every logo's own proportions.
const BOX = { width: 630, height: 150 };

mkdirSync(OUT, { recursive: true });
let before = 0, after = 0;
for (const file of readdirSync(SRC)) {
  const input = path.join(SRC, file);
  const name = path.parse(file).name;
  const output = path.join(OUT, `${name}.webp`);
  await (await trimmed(input))
    .resize({ ...BOX, fit: 'inside', withoutEnlargement: !isSvg(file) })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(output);
  const a = statSync(input).size, b = statSync(output).size;
  before += a; after += b;
  const { width, height } = await sharp(output).metadata();
  console.log(`${file.padEnd(34)} ${(a / 1024).toFixed(0).padStart(6)} KB -> ${(b / 1024).toFixed(1).padStart(6)} KB  ${width}x${height}`);
}
console.log(`\nTotal ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
