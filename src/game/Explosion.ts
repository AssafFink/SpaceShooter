import { GAME_CONFIG } from './gameConfig';
import { getEnemyRadius } from './Enemy';
import type { Enemy, Explosion } from '../types/game';

const { explosion: config } = GAME_CONFIG;

/**
 * יצירה ועדכון של אנימציות פיצוץ קצרות — פונקציות טהורות, ללא State פנימי.
 * מקור: spec/ARCHITECTURE.md §45.
 *
 * וקטורי בלבד ב-Milestone 3 — Sprite Sheet / Assets אמיתיים מגיעים ב-Milestone 7.
 */

/** יוצר פיצוץ במיקום אויב שחוסל, בגודל יחסי לגודל האויב. */
export function createExplosion(id: string, enemy: Enemy): Explosion {
  return createExplosionAt(
    id,
    enemy.x,
    enemy.y,
    getEnemyRadius(enemy.size) * config.radiusMultiplier,
    config.durationSeconds,
  );
}

/**
 * יוצר פיצוץ במיקום ורדיוס נתונים — משמש גם את פיצוץ התותח (ARCHITECTURE §21,
 * §45; Milestone 4), ולא רק חיסול אויב.
 */
export function createExplosionAt(
  id: string,
  x: number,
  y: number,
  maxRadius: number,
  durationSeconds: number,
): Explosion {
  return { id, x, y, maxRadius, elapsedSeconds: 0, durationSeconds };
}

/** מקדם את זמן הפיצוץ (ARCHITECTURE §7). */
export function updateExplosion(explosion: Explosion, deltaSeconds: number): void {
  explosion.elapsedSeconds += deltaSeconds;
}

/** האם האנימציה הסתיימה ואפשר להסיר את הפיצוץ. */
export function isExplosionFinished(explosion: Explosion): boolean {
  return explosion.elapsedSeconds >= explosion.durationSeconds;
}
