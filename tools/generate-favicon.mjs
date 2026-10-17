/**
 * One-off favicon generation (post-MVP).
 *
 * Builds the browser-tab icon from the green "small" enemy sprite
 * (src/assets/images/enemy-small.png, itself cut from spec/style-guide.png):
 * the creature centered on a rounded, dark-navy tile with a soft green glow,
 * so it reads on both light and dark browser tab strips.
 *
 * Run once from the project root:
 *
 *   node tools/generate-favicon.mjs
 *
 * Outputs to public/: favicon-16.png, favicon-32.png, favicon-48.png and
 * favicon-192.png (referenced from index.html).
 */

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SPRITE = path.join(ROOT, 'src', 'assets', 'images', 'enemy-small.png');
const OUT_DIR = path.join(ROOT, 'public');

/** Master canvas size; every output is downscaled from this for clean edges. */
const MASTER = 512;
const SIZES = [16, 32, 48, 192];

async function buildMasterSvg() {
  const sprite = await readFile(SPRITE);
  const meta = await sharp(sprite).metadata();
  const spriteData = `data:image/png;base64,${sprite.toString('base64')}`;

  // Sprite fills ~78% of the tile, preserving its aspect ratio.
  const box = MASTER * 0.78;
  const scale = box / Math.max(meta.width, meta.height);
  const w = meta.width * scale;
  const h = meta.height * scale;
  const x = (MASTER - w) / 2;
  const y = (MASTER - h) / 2;

  // Colors from spec/DESIGN.md: #1A1F3D panel → #0B1026 space; #4CD964 success green.
  return `
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
  <rect width="${MASTER}" height="${MASTER}" rx="${MASTER * 0.22}" fill="url(#bg)"/>
  <circle cx="${MASTER / 2}" cy="${MASTER / 2}" r="${MASTER * 0.42}" fill="url(#halo)"/>
  <image x="${x}" y="${y}" width="${w}" height="${h}" href="${spriteData}" xlink:href="${spriteData}"/>
</svg>`;
}

async function main() {
  const master = await sharp(Buffer.from(await buildMasterSvg()))
    .png()
    .toBuffer();

  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `favicon-${size}.png`);
    await sharp(master).resize(size, size, { kernel: 'lanczos3' }).png().toFile(outPath);
    console.log(`Wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
