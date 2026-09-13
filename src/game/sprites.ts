import enemySmallUrl from '../assets/images/enemy-small.png';
import enemyMediumUrl from '../assets/images/enemy-medium.png';
import enemyLargeUrl from '../assets/images/enemy-large.png';
import cannonUrl from '../assets/images/cannon.png';
import laserUrl from '../assets/images/laser.png';
import explosionSmallUrl from '../assets/images/explosion-small.png';
import explosionMediumUrl from '../assets/images/explosion-medium.png';
import explosionLargeUrl from '../assets/images/explosion-large.png';
import explosionCannonUrl from '../assets/images/explosion-cannon.png';

/**
 * Loads the game sprites extracted from spec/style-guide.png (Milestone 7).
 * Source: spec/ARCHITECTURE.md §42-45; spec/plans/milestone-7.md §1.4.
 *
 * Vite resolves each `import` to a hashed URL string; we create one HTMLImage
 * per sprite and start loading immediately at module load. The Renderer draws a
 * sprite only when `isReady()` confirms it decoded, and otherwise falls back to
 * the existing vector drawing — so a slow load or a missing/renamed file never
 * throws and never leaves a blank frame (Sprite-first, Vector-fallback).
 *
 * The space `background.png` is a React-side hero backdrop (see HomePage), not a
 * canvas sprite: the game canvas keeps its resolution-independent vector
 * starfield, which stays crisp at any device size.
 */
export type SpriteName =
  | 'enemy-small'
  | 'enemy-medium'
  | 'enemy-large'
  | 'cannon'
  | 'laser'
  | 'explosion-small'
  | 'explosion-medium'
  | 'explosion-large'
  | 'explosion-cannon';

const URLS: Record<SpriteName, string> = {
  'enemy-small': enemySmallUrl,
  'enemy-medium': enemyMediumUrl,
  'enemy-large': enemyLargeUrl,
  cannon: cannonUrl,
  laser: laserUrl,
  'explosion-small': explosionSmallUrl,
  'explosion-medium': explosionMediumUrl,
  'explosion-large': explosionLargeUrl,
  'explosion-cannon': explosionCannonUrl,
};

const images: Record<SpriteName, HTMLImageElement> = Object.fromEntries(
  (Object.keys(URLS) as SpriteName[]).map((name) => {
    const img = new Image();
    img.src = URLS[name];
    return [name, img];
  }),
) as Record<SpriteName, HTMLImageElement>;

/** The image element for a sprite (may not be decoded yet — check `isReady`). */
export function getSprite(name: SpriteName): HTMLImageElement {
  return images[name];
}

/** True once the sprite has finished decoding and can be drawn safely. */
export function isReady(name: SpriteName): boolean {
  const img = images[name];
  return img.complete && img.naturalWidth > 0;
}
