import { GAME_CONFIG } from './gameConfig';
import { randomRange } from './random';
import type { Enemy, EnemySize, GameBounds, Vector2 } from '../types/game';

const { enemyTypes, enemy: config } = GAME_CONFIG;

/**
 * Creation, movement and state of enemies — pure functions, no internal state.
 * Source: spec/ARCHITECTURE.md §14-16.
 */

/** The drawn radius of an enemy by size. */
export function getEnemyRadius(size: EnemySize): number {
  return enemyTypes[size].radius;
}

/** The hit radius (slightly larger than the drawn radius — see spec/plans/milestone-3.md §1 decision 3). */
export function getHitRadius(size: EnemySize): number {
  return enemyTypes[size].radius + config.hitRadiusBonus;
}

/**
 * Creates a new enemy moving from origin toward target (the cannon), with a
 * small random deviation from the straight line (ARCHITECTURE §16 — "near-
 * straight", Random Variation). The direction is computed once only — the
 * enemy doesn't track the target (no Homing).
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

/** Advances the enemy by its velocity and Delta Time (ARCHITECTURE §7). */
export function updateEnemy(enemy: Enemy, deltaSeconds: number): void {
  enemy.x += enemy.velocityX * deltaSeconds;
  enemy.y += enemy.velocityY * deltaSeconds;
  if (enemy.hitFlashSeconds > 0) {
    enemy.hitFlashSeconds = Math.max(0, enemy.hitFlashSeconds - deltaSeconds);
  }
}

/**
 * Reduces one Hit Point and lights up the visual-feedback flash (Milestone 7).
 * Does not change `active` — that's the caller's responsibility (GameEngine).
 * If the hit is lethal, the enemy is removed before the flash would be
 * drawn, so the flash is only ever visible on a non-lethal hit (spec/PRD §UX).
 */
export function applyHit(enemy: Enemy): void {
  enemy.hitPoints -= 1;
  enemy.hitFlashSeconds = GAME_CONFIG.enemy.hitFlashDurationSeconds;
}

/** Whether the enemy has reached 0 Hit Points and should be destroyed. */
export function isDestroyed(enemy: Enemy): boolean {
  return enemy.hitPoints <= 0;
}

/**
 * Whether the enemy has crossed the bottom edge of the game area (including margin).
 *
 * Milestone 4: used to detect an enemy that missed the cannon and exited to
 * the side — the real enemy–cannon collision (§21) is checked separately in
 * `CollisionManager.detectCannonHit` and always runs before this check in
 * the same frame (see spec/plans/milestone-4.md §1 decision 2). An enemy
 * that crosses the bottom without touching the cannon is removed silently,
 * with no life lost and no explosion (spec/plans/milestone-4.md §1 decision 1).
 */
export function hasPassedBottom(enemy: Enemy, bounds: GameBounds): boolean {
  return enemy.y - getEnemyRadius(enemy.size) > bounds.height + config.despawnMarginY;
}

/**
 * Clamps an enemy to new bounds after a Resize (ARCHITECTURE §35 — a short
 * reposition is allowed). Speed is unchanged.
 */
export function clampEnemyToBounds(enemy: Enemy, bounds: GameBounds): void {
  const radius = getEnemyRadius(enemy.size);
  enemy.x = Math.min(Math.max(enemy.x, radius), Math.max(bounds.width - radius, radius));
}

/**
 * Scales a base enemy speed by the game area's height, so an enemy's travel
 * time from spawn to the cannon stays roughly constant across Portrait,
 * Landscape and Desktop (ARCHITECTURE §16). Without this, a short Landscape
 * screen makes every level far harder than the same level in Portrait —
 * spec/plans/milestone-9.md §1 (F6).
 */
export function enemySpeedScale(height: number): number {
  const { referenceHeight, speedScaleMin, speedScaleMax } = config;
  return Math.min(Math.max(height / referenceHeight, speedScaleMin), speedScaleMax);
}

/**
 * Re-aims an active enemy toward a new cannon position after a resize
 * (ARCHITECTURE §35 — a short reposition is allowed). `speed` defaults to
 * the enemy's current speed magnitude but can be overridden (GameEngine
 * rescales it to the new bounds height via `enemySpeedScale`). No aim
 * jitter is reapplied — spec/plans/milestone-9.md §1 (F3).
 */
export function retargetEnemy(
  enemy: Enemy,
  target: Vector2,
  speed: number = Math.hypot(enemy.velocityX, enemy.velocityY),
): void {
  if (speed === 0) return;
  const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
  enemy.velocityX = Math.cos(angle) * speed;
  enemy.velocityY = Math.sin(angle) * speed;
}

/**
 * Ensures an enemy is at least `minDistance` away from `center`, pushing it
 * straight outward along the center→enemy vector (or straight up if exactly
 * on top of it). Used after resize so repositioning/re-aiming can never
 * place an enemy inside the cannon's hit radius — a resize must never cost
 * a life. spec/plans/milestone-9.md §1 (F3).
 */
export function pushEnemyOutsideRadius(enemy: Enemy, center: Vector2, minDistance: number): void {
  const dx = enemy.x - center.x;
  const dy = enemy.y - center.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= minDistance) return;
  if (distance === 0) {
    enemy.y = center.y - minDistance;
    return;
  }
  const scale = minDistance / distance;
  enemy.x = center.x + dx * scale;
  enemy.y = center.y + dy * scale;
}
