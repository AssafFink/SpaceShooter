/**
 * Shared icon artwork for tools/generate-favicon.mjs and
 * tools/generate-pwa-icons.mjs: the green "small" enemy sprite
 * (src/assets/images/enemy-small.png, cut from spec/style-guide.png) centered
 * on a dark-navy tile with a soft green glow. One source keeps the browser-tab
 * favicon and the installed-app (home screen) icon identical.
 */

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SPRITE = path.join(ROOT, 'src', 'assets', 'images', 'enemy-small.png');

/** Master canvas size; every output is downscaled from this for clean edges. */
const MASTER = 512;

/**
 * Renders the tile as a MASTER×MASTER PNG buffer.
 *
 * @param {object} options
 * @param {boolean} options.rounded  Rounded corners (favicon / "any" icons).
 *   Off for icons the OS masks or rounds itself (maskable, apple-touch-icon),
 *   which need a full-bleed square background.
 * @param {number} options.spriteScale  Share of the tile the sprite fills (0..1).
 *   Maskable icons use a smaller value to stay inside the ~80% safe zone.
 */
export async function renderTile({ rounded, spriteScale }) {
  const sprite = await readFile(SPRITE);
  const meta = await sharp(sprite).metadata();
  const spriteData = `data:image/png;base64,${sprite.toString('base64')}`;

  const box = MASTER * spriteScale;
  const scale = box / Math.max(meta.width, meta.height);
  const w = meta.width * scale;
  const h = meta.height * scale;
  const x = (MASTER - w) / 2;
  const y = (MASTER - h) / 2;
  const radius = rounded ? MASTER * 0.22 : 0;
  // The glow tracks the sprite size so it stays balanced at every scale.
  const haloRadius = box * 0.54;

  // Colors from spec/DESIGN.md: #1A1F3D panel → #0B1026 space; #4CD964 success green.
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${MASTER}" height="${MASTER}" viewBox="0 0 ${MASTER} ${MASTER}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1A1F3D"/>
      <stop offset="100%" stop-color="#0B1026"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4CD964" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#4CD964" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${MASTER}" height="${MASTER}" rx="${radius}" fill="url(#bg)"/>
  <circle cx="${MASTER / 2}" cy="${MASTER / 2}" r="${haloRadius}" fill="url(#halo)"/>
  <image x="${x}" y="${y}" width="${w}" height="${h}" href="${spriteData}" xlink:href="${spriteData}"/>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Downscales a master tile to `size` and writes it as PNG. */
export async function writeIcon(master, size, outPath, { opaque = false } = {}) {
  let image = sharp(master).resize(size, size, { kernel: 'lanczos3' });
  if (opaque) image = image.flatten({ background: '#0B1026' });
  await image.png().toFile(outPath);
  console.log(`Wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
}
