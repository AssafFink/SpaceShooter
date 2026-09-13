/**
 * One-off asset generation for Milestone 8 (Responsive, Mobile & PWA).
 *
 * Renders `public/favicon.svg` (the project's own wordmark bolt, already used
 * as the browser-tab icon) onto solid brand-color square backgrounds to
 * produce the PNG icons a Web App Manifest requires (ARCHITECTURE §46).
 * First-party asset, consistent with tools/extract-sprites.py (Milestone 7).
 *
 * Run once from the project root:
 *
 *   node tools/generate-pwa-icons.mjs
 *
 * Two "any" icons (192/512) use generous padding for a normal app icon look.
 * The 512 "maskable" icon uses a smaller logo scale so the artwork survives
 * OS icon masks (circle, squircle, ...) that crop up to ~20% off each edge
 * — see https://web.dev/articles/maskable-icon. apple-touch-icon (180) has
 * no transparency, as iOS ignores alpha and shows checkerboard artifacts.
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SVG_SOURCE = path.join(ROOT, 'public', 'favicon.svg');
const OUT_DIR = path.join(ROOT, 'public', 'icons');

/** spec/DESIGN.md — space background (--color-bg). */
const BACKGROUND = '#0B1026';

const TARGETS = [
  { file: 'icon-192.png', size: 192, logoScale: 0.72, alpha: true },
  { file: 'icon-512.png', size: 512, logoScale: 0.72, alpha: true },
  { file: 'maskable-512.png', size: 512, logoScale: 0.5, alpha: true },
  { file: 'apple-touch-icon.png', size: 180, logoScale: 0.72, alpha: false },
];

async function renderIcon({ file, size, logoScale, alpha }) {
  const logoSize = Math.round(size * logoScale);
  const logoBuffer = await sharp(SVG_SOURCE)
    .resize({ width: logoSize, height: logoSize, fit: 'inside' })
    .png()
    .toBuffer();

  let image = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  }).composite([{ input: logoBuffer, gravity: 'center' }]);

  if (!alpha) {
    image = image.flatten({ background: BACKGROUND });
  }

  const outPath = path.join(OUT_DIR, file);
  await image.png().toFile(outPath);
  console.log(`Wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const target of TARGETS) {
    await renderIcon(target);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
