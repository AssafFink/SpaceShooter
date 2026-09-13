import { GAME_CONFIG } from './gameConfig';
import { randomRange } from './random';
import type { Enemy, EnemySize, GameBounds, Vector2 } from '../types/game';

const { enemyTypes, enemy: config } = GAME_CONFIG;

/**
 * יצירה, תנועה ומצב של אויבים — פונקציות טהורות, ללא State פנימי.
 * מקור: spec/ARCHITECTURE.md §14-16.
 */

/** רדיוס הציור של אויב לפי גודל. */
export function getEnemyRadius(size: EnemySize): number {
  return enemyTypes[size].radius;
}

/** רדיוס הפגיעה (מעט גדול מהרדיוס המצויר — ראו spec/plans/milestone-3.md §1 החלטה 3). */
export function getHitRadius(size: EnemySize): number {
  return enemyTypes[size].radius + config.hitRadiusBonus;
}

/**
 * יוצר אויב חדש הנע מ-origin לכיוון target (התותח), עם סטייה אקראית קטנה
 * מהקו הישר (ARCHITECTURE §16 — "כמעט ישר", Random Variation).
 * הכיוון מחושב פעם אחת בלבד — האויב אינו עוקב (אין Homing).
 */
export function createEnemy(
  id: string,
  size: EnemySize,
  origin: Vector2,
  target: Vector2,
  speed: number,
): Enemy {
  const baseAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
  const angle = baseAngle + randomRange(-config.maxAimJitter, config.maxAimJitter);
  const type = enemyTypes[size];

  return {
    id,
    size,
    x: origin.x,
    y: origin.y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    hitPoints: type.hitPoints,
    maxHitPoints: type.hitPoints,
    scoreValue: type.score,
    active: true,
    hitFlashSeconds: 0,
  };
}

/** מקדם את האויב לפי המהירות ו-Delta Time (ARCHITECTURE §7). */
export function updateEnemy(enemy: Enemy, deltaSeconds: number): void {
  enemy.x += enemy.velocityX * deltaSeconds;
  enemy.y += enemy.velocityY * deltaSeconds;
  if (enemy.hitFlashSeconds > 0) {
    enemy.hitFlashSeconds = Math.max(0, enemy.hitFlashSeconds - deltaSeconds);
  }
}

/**
 * מפחית Hit Point אחד ומדליק הבזק משוב חזותי (Milestone 7). אינו משנה את
 * `active` — זו אחריות הקורא (GameEngine). אם הפגיעה מחסלת, האויב יוסר לפני
 * שההבזק מצויר, כך שההבזק בפועל נראה רק על פגיעה שאינה מחסלת (spec/PRD §UX).
 */
export function applyHit(enemy: Enemy): void {
  enemy.hitPoints -= 1;
  enemy.hitFlashSeconds = GAME_CONFIG.enemy.hitFlashDurationSeconds;
}

/** האם האויב הגיע ל-0 Hit Points ויש לחסל אותו. */
export function isDestroyed(enemy: Enemy): boolean {
  return enemy.hitPoints <= 0;
}

/**
 * האם האויב חצה את הגבול התחתון של אזור המשחק (כולל שוליים).
 *
 * Milestone 4: משמש לזיהוי אויב שהחמיץ את התותח ויצא בצד — התנגשות
 * אויב–תותח האמיתית (§21) נבדקת בנפרד ב-`CollisionManager.detectCannonHit`
 * ותמיד קודמת לבדיקה זו באותו פריים (ראו spec/plans/milestone-4.md §1 החלטה 2).
 * אויב שחצה את התחתית מבלי לגעת בתותח מוסר בשקט, ללא חיים וללא פיצוץ
 * (spec/plans/milestone-4.md §1 החלטה 1).
 */
export function hasPassedBottom(enemy: Enemy, bounds: GameBounds): boolean {
  return enemy.y - getEnemyRadius(enemy.size) > bounds.height + config.despawnMarginY;
}

/**
 * צמידת אויב לגבולות חדשים אחרי Resize (ARCHITECTURE §35 — Reposition קצר מותר).
 * המהירות אינה משתנה.
 */
export function clampEnemyToBounds(enemy: Enemy, bounds: GameBounds): void {
  const radius = getEnemyRadius(enemy.size);
  enemy.x = Math.min(Math.max(enemy.x, radius), Math.max(bounds.width - radius, radius));
}
