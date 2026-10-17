/**
 * Asset generation for the PWA (installed-app / home-screen) icons —
 * Milestone 8 (ARCHITECTURE §46), updated post-MVP to use the same
 * green-enemy artwork as the favicon (tools/icon-tile.mjs).
 *
 * Run once from the project root:
 *
 *   node tools/generate-pwa-icons.mjs
 *
 * - icon-192 / icon-512 ("any"): the rounded tile, identical to the favicon.
 * - maskable-512: full-bleed square background, sprite scaled down so the
 *   artwork survives OS icon masks (circle, squircle, ...) that crop up to
 *   ~20% off each edge — see https://web.dev/articles/maskable-icon.
 * - apple-touch-icon (180): full-bleed and opaque — iOS rounds the corners
 *   itself and ignores alpha (it would show black/checkerboard corners).
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, renderTile, writeIcon } from './icon-tile.mjs';

const OUT_DIR = path.join(ROOT, 'public', 'icons');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const tile = await renderTile({ rounded: true, spriteScale: 0.78 });
  await writeIcon(tile, 192, path.join(OUT_DIR, 'icon-192.png'));
  await writeIcon(tile, 512, path.join(OUT_DIR, 'icon-512.png'));

  const maskable = await renderTile({ rounded: false, spriteScale: 0.6 });
  await writeIcon(maskable, 512, path.join(OUT_DIR, 'maskable-512.png'));

  const apple = await renderTile({ rounded: false, spriteScale: 0.72 });
  await writeIcon(apple, 180, path.join(OUT_DIR, 'apple-touch-icon.png'), { opaque: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
