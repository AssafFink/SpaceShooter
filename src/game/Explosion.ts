import { GAME_CONFIG } from './gameConfig';
import { getEnemyRadius } from './Enemy';
import type { Enemy, Explosion, ExplosionVariant } from '../types/game';

const { explosion: config } = GAME_CONFIG;

/**
 * Creation and update of short explosion animations — pure functions, no
 * internal state. Source: spec/ARCHITECTURE.md §45.
 *
 * Vector-only in Milestone 3 — real Sprite Sheet / assets arrive in Milestone 7.
 */

/** Creates an explosion at a destroyed enemy's position, sized relative to the enemy. */
export function createExplosion(id: string, enemy: Enemy): Explosion {
  return createExplosionAt(
    id,
    enemy.x,
    enemy.y,
    getEnemyRadius(enemy.size) * config.radiusMultiplier,
    config.durationSeconds,
    enemy.size,
  );
}

/**
 * Creates an explosion at a given position and radius — also used for the
 * cannon explosion (ARCHITECTURE §21, §45; Milestone 4), not just enemy
 * kills. `variant` selects the Sprite/color in the Renderer.
 */
export function createExplosionAt(
  id: string,
  x: number,
  y: number,
  maxRadius: number,
  durationSeconds: number,
  variant: ExplosionVariant,
): Explosion {
  return { id, x, y, maxRadius, elapsedSeconds: 0, durationSeconds, variant };
}

/** Advances the explosion's elapsed time (ARCHITECTURE §7). */
export function updateExplosion(explosion: Explosion, deltaSeconds: number): void {
  explosion.elapsedSeconds += deltaSeconds;
}

/** Whether the animation has finished and the explosion can be removed. */
export function isExplosionFinished(explosion: Explosion): boolean {
  return explosion.elapsedSeconds >= explosion.durationSeconds;
}
