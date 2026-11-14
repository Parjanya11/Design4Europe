// Shared by logos.mjs and fetch-logos.mjs.
//
// Many logo files carry a margin: white around a JPEG, transparent space in
// an SVG's viewBox. The chip adds its own padding, so a margin in the file
// only makes the logo smaller than its neighbours. Trim it before sizing.

import sharp from 'sharp';

export const isSvg = (file) => file.toLowerCase().endsWith('.svg');

// A sharp instance holding the trimmed logo as a PNG. Only a white or
// transparent margin is trimmed. If the corner is any other colour, the
// logo is a filled box (CLICKNL, The Design Education Trust) and trimming
// would cut into it.
export async function trimmed(file) {
  const png = await sharp(file, isSvg(file) ? { density: 300 } : {}).png().toBuffer();
  const data = await sharp(png).ensureAlpha().extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  const [r, g, b, a] = data;
  const margin = a < 16 || (r > 235 && g > 235 && b > 235);
  if (!margin) return sharp(png);
  return sharp(await sharp(png).trim({ threshold: 12 }).png().toBuffer());
}
