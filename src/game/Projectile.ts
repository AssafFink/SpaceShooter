import { GAME_CONFIG } from './gameConfig';
import type { GameBounds, Projectile, Vector2 } from '../types/game';

const { projectile: config } = GAME_CONFIG;

/**
 * יצירה ותנועה של קליעי לייזר — פונקציות טהורות, ללא State פנימי.
 * מקור: spec/ARCHITECTURE.md §12.
 */

/**
 * יוצר קליע חדש הנע מ-origin לכיוון target (Direction Vector מנורמל, ARCHITECTURE §12).
 * הקליע אינו עוצר ב-target — הוא ממשיך באותו כיוון עד לגבולות (אין Homing).
 */
export function createProjectile(id: string, origin: Vector2, target: Vector2): Projectile {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const length = Math.hypot(dx, dy);

  // מניעת חלוקה באפס אם היעד זהה למקור (לחיצה בדיוק על קצה הקנה) — ירי ישר "קדימה".
  const [dirX, dirY] = length === 0 ? [0, -1] : [dx / length, dy / length];

  return {
    id,
    x: origin.x,
    y: origin.y,
    velocityX: dirX * config.speed,
    velocityY: dirY * config.speed,
    active: true,
  };
}

/** מקדם את הקליע לפי המהירות ו-Delta Time (ARCHITECTURE §7). */
export function updateProjectile(projectile: Projectile, deltaSeconds: number): void {
  projectile.x += projectile.velocityX * deltaSeconds;
  projectile.y += projectile.velocityY * deltaSeconds;
}

/** בודק אם הקליע יצא מגבולות אזור המשחק (כולל שוליים לשובל הזוהר). */
export function isOutOfBounds(projectile: Projectile, bounds: GameBounds): boolean {
  const margin = config.radius + config.trailLength;
  return (
    projectile.x < -margin ||
    projectile.x > bounds.width + margin ||
    projectile.y < -margin ||
    projectile.y > bounds.height + margin
  );
}
