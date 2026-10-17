/**
 * One-off favicon generation (post-MVP).
 *
 * Builds the browser-tab icon from the shared green-enemy tile
 * (tools/icon-tile.mjs) — the same artwork as the installed-app icon.
 *
 * Run once from the project root:
 *
 *   node tools/generate-favicon.mjs
 *
 * Outputs to public/: favicon-16.png, favicon-32.png, favicon-48.png and
 * favicon-192.png (referenced from index.html).
 */

import path from 'node:path';
import { ROOT, renderTile, writeIcon } from './icon-tile.mjs';

const OUT_DIR = path.join(ROOT, 'public');
const SIZES = [16, 32, 48, 192];

async function main() {
  const master = await renderTile({ rounded: true, spriteScale: 0.78 });
  for (const size of SIZES) {
    await writeIcon(master, size, path.join(OUT_DIR, `favicon-${size}.png`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
