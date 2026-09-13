/**
 * Core types for the game engine — Milestone 2+3+4.
 * Source: spec/ARCHITECTURE.md §8 (Game State), §12 (Projectile System),
 * §14-15 (Enemy Model), §18 (Level Configuration), §45 (Explosion).
 */

/** A point or 2D vector, in CSS Pixels relative to the game area. */
export interface Vector2 {
  x: number;
  y: number;
}

/** Dimensions of the game area (the Canvas) in CSS Pixels. */
export interface GameBounds {
  width: number;
  height: number;
}

/** Source: spec/ARCHITECTURE.md §12. */
export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
  /** Position at the start of the current frame — needed for Swept Collision (Milestone 3). */
  prevX: number;
  prevY: number;
}

/** Source: spec/ARCHITECTURE.md §14-15. Size also doubles as the strength measure (PRD §4.6). */
export type EnemySize = 'small' | 'medium' | 'large';

/** Source: spec/ARCHITECTURE.md §14. */
export interface Enemy {
  id: string;
  size: EnemySize;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  hitPoints: number;
  maxHitPoints: number;
  scoreValue: number;
  active: boolean;
  /**
   * Time remaining on the "hit but not destroyed" flash (seconds),
   * Milestone 7. Greater than 0 right after a non-lethal hit; decays to 0
   * in `updateEnemy`. Used only for visual feedback in the Renderer
   * (spec/PRD §UX — "clear visual feedback when an Enemy takes a hit even
   * if not destroyed").
   */
  hitFlashSeconds: number;
}

/** The explosion's variant — determines which Sprite/size is drawn (Milestone 7). */
export type ExplosionVariant = EnemySize | 'cannon';

/** A short explosion animation (ARCHITECTURE §45). Removed once elapsed passes duration. */
export interface Explosion {
  id: string;
  x: number;
  y: number;
  /** Peak radius — derived from the size of the enemy that was destroyed. */
  maxRadius: number;
  elapsedSeconds: number;
  durationSeconds: number;
  /** The explosion's variant — selects the Sprite in the Renderer (Milestone 7). */
  variant: ExplosionVariant;
}

/**
 * A one-off event the engine emits at key moments, for sound effects
 * (Milestone 7). Source: spec/ARCHITECTURE.md §51 — the engine doesn't
 * depend on React or Audio; it only announces what happened, and the Hook
 * (`useGameEngine`) maps each event to an `audioService` call.
 */
export type GameEvent =
  | { type: 'shoot' }
  | { type: 'enemy-destroyed'; size: EnemySize }
  | { type: 'cannon-explosion' };

/**
 * The overall game status (ARCHITECTURE §8). `GameEngine.update()` branches
 * on this field — Spawn, enemy movement and Collision only run in
 * `playing` (Milestone 4).
 */
export type GameStatus =
  | 'playing'
  | 'level-complete'
  | 'player-hit'
  | 'won'
  | 'lost';

/**
 * Ranges only — the actual values are rolled from them at the start of
 * every level (ARCHITECTURE §18-19). Enemy types are distinguished by size
 * alone; the three probabilities sum to 1.
 */
export interface LevelConfig {
  level: number;
  enemyCountMin: number;
  enemyCountMax: number;
  spawnIntervalMinSeconds: number;
  spawnIntervalMaxSeconds: number;
  enemySpeedMin: number;
  enemySpeedMax: number;
  smallProbability: number;
  mediumProbability: number;
  largeProbability: number;
}

/** What the UI (React) needs to know from the engine — and nothing more (ARCHITECTURE §54). */
export interface GameStats {
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
  status: GameStatus;
}
