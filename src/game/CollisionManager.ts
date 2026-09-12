import { getHitRadius } from './Enemy';
import type { Enemy, Projectile } from '../types/game';

/**
 * Collision Detection בין Projectile ל-Enemy — Milestone 3 (Enemies & Combat).
 * מקור: spec/ARCHITECTURE.md §13, PRD §4.5.
 *
 * משתמש ב-Swept Collision (קטע מול מעגל) ולא בבדיקת מרחק נקודתית: קליע נע עד
 * ~45px בפריים אחד (900px/s * maxDeltaSeconds), יותר מקוטר אויב קטן (30px) —
 * בדיקה נקודתית הייתה מפספסת פגיעות. ראו spec/plans/milestone-3.md §3.3.
 */

export interface ProjectileHit {
  projectile: Projectile;
  enemy: Enemy;
}

/** המרחק בין נקודה P לבין הקטע A-B, וה-t (0..1) של הנקודה הקרובה ביותר על הקטע. */
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
 * לכל קליע פעיל — מוצא את האויב הראשון במסלולו בפריים הנוכחי (PRD §4.5:
 * "הקליע פוגע באויב הראשון שבו הוא נתקל ונעלם"). קליע פוגע לכל היותר באויב אחד.
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
