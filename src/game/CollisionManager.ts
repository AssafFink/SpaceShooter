import { getHitRadius } from './Enemy';
import type { Enemy, Projectile, Vector2 } from '../types/game';

/**
 * Collision Detection — Milestone 3+4.
 * Source: spec/ARCHITECTURE.md §13 (Projectile↔Enemy), §21 (Enemy↔Cannon), PRD §4.5.
 *
 * Projectile↔Enemy uses Swept Collision (segment vs. circle) instead of a
 * point-distance check: a projectile moves up to ~45px in a single frame
 * (900px/s * maxDeltaSeconds), more than a small enemy's diameter (30px) —
 * a point check would miss hits. See spec/plans/milestone-3.md §3.3.
 */

export interface ProjectileHit {
  projectile: Projectile;
  enemy: Enemy;
}

/** Distance from point P to segment A-B, and t (0..1) of the closest point on the segment. */
function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { distance: number; t: number } {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    return { distance: Math.hypot(px - ax, py - ay), t: 0 };
  }

  const t = Math.min(1, Math.max(0, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
  const closestX = ax + t * abx;
  const closestY = ay + t * aby;
  return { distance: Math.hypot(px - closestX, py - closestY), t };
}

/**
 * For each active projectile — finds the first enemy in its path this frame
 * (PRD §4.5: "the projectile hits the first enemy it encounters and
 * disappears"). A projectile hits at most one enemy.
 */
export function detectProjectileHits(
  projectiles: readonly Projectile[],
  enemies: readonly Enemy[],
): ProjectileHit[] {
  const hits: ProjectileHit[] = [];

  for (const projectile of projectiles) {
    if (!projectile.active) continue;

    let closest: { enemy: Enemy; t: number } | null = null;

    for (const enemy of enemies) {
      if (!enemy.active) continue;

      const { distance, t } = distanceToSegment(
        enemy.x,
        enemy.y,
        projectile.prevX,
        projectile.prevY,
        projectile.x,
        projectile.y,
      );

      if (distance <= getHitRadius(enemy.size) && (closest === null || t < closest.t)) {
        closest = { enemy, t };
      }
    }

    if (closest !== null) {
      hits.push({ projectile, enemy: closest.enemy });
    }
  }

  return hits;
}

/**
 * Whether any active enemy is touching the cannon's hit area (ARCHITECTURE §21).
 * A single touch is enough — the Hit Lock (the `player-hit` status) removes
 * exactly one life regardless of how many enemies arrive almost at once (PRD §4.8).
 */
export function detectCannonHit(
  enemies: readonly Enemy[],
  cannonPosition: Vector2,
  cannonHitRadius: number,
): boolean {
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    const distance = Math.hypot(enemy.x - cannonPosition.x, enemy.y - cannonPosition.y);
    if (distance <= cannonHitRadius + getHitRadius(enemy.size)) return true;
  }
  return false;
}
