import { GAME_CONFIG } from './gameConfig';
import { GameLoop } from './GameLoop';
import { Cannon } from './Cannon';
import { Renderer, createStars } from './Renderer';
import { createProjectile, updateProjectile, isOutOfBounds } from './Projectile';
import {
  applyHit,
  clampEnemyToBounds,
  enemySpeedScale,
  getHitRadius,
  hasPassedBottom,
  isDestroyed,
  pushEnemyOutsideRadius,
  retargetEnemy,
  updateEnemy,
} from './Enemy';
import { EnemySpawner } from './EnemySpawner';
import { LevelManager } from './LevelManager';
import { detectCannonHit, detectProjectileHits } from './CollisionManager';
import { createExplosion, createExplosionAt, isExplosionFinished, updateExplosion } from './Explosion';
import type {
  Enemy,
  Explosion,
  GameBounds,
  GameEvent,
  GameStats,
  GameStatus,
  Projectile,
  Vector2,
} from '../types/game';

/**
 * Orchestration of the game engine — Milestone 2+3+4 (through Lives, Levels & Game Rules).
 * Source: spec/ARCHITECTURE.md §51, §52, §8 (Game State).
 *
 * Not dependent on React: takes only an HTMLCanvasElement in the
 * constructor, and doesn't register Event Listeners itself (that's the
 * responsibility of the Hook that uses it, ARCHITECTURE §53).
 *
 * `update()` is a state machine keyed on `GameStatus` (§8): Spawn, enemy
 * movement, Collision and level-completion detection only run in `playing`;
 * `level-complete` and `player-hit` are waiting states (Timer only + explosion
 * updates); `won`/`lost` stop the loop. See spec/plans/milestone-4.md §9.
 */

/** Clamps a level number into the valid 1..totalLevels range. */
function clampLevel(level: number): number {
  return Math.min(Math.max(Math.round(level), 1), GAME_CONFIG.totalLevels);
}

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly loop: GameLoop;
  private readonly renderer: Renderer;
  private readonly cannon = new Cannon();
  private readonly spawner = new EnemySpawner();
  private readonly levels = new LevelManager();

  private bounds: GameBounds = { width: 0, height: 0 };
  private stars = createStars(this.bounds);
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private explosions: Explosion[] = [];
  private nextProjectileId = 1;
  private nextExplosionId = 1;

  private score = 0;
  private lives = GAME_CONFIG.maxLives;
  private currentLevel: number;
  private status: GameStatus = 'playing';
  /** Time elapsed since entering `level-complete` or `player-hit` status (seconds). */
  private statusTimerSeconds = 0;

  private stats: GameStats = this.buildStats();
  private onStatsChange: ((stats: GameStats) => void) | null = null;
  private onGameEvent: ((event: GameEvent) => void) | null = null;

  /**
   * `options.startLevel` is a **dev-only** QA hook (Milestone 9,
   * spec/plans/milestone-9.md §3.1) that jumps a fresh game straight to a
   * given level, so late levels (and Win) can be reached without replaying
   * the whole game. `useGameEngine` only ever passes it under
   * `import.meta.env.DEV`; Score/Lives always start at their normal values.
   */
  constructor(canvas: HTMLCanvasElement, options?: { startLevel?: number }) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context is not available for the game canvas');
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.loop = new GameLoop(this.onFrame);
    this.currentLevel = clampLevel(options?.startLevel ?? 1);
    this.startLevel(this.currentLevel);
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  destroy(): void {
    this.stop();
    this.onStatsChange = null;
    this.onGameEvent = null;
  }

  /** Registers a callback that fires only when GameStats actually changes (ARCHITECTURE §54). */
  setOnStatsChange(callback: ((stats: GameStats) => void) | null): void {
    this.onStatsChange = callback;
  }

  /**
   * Registers a callback for one-off game events (shoot, kill, cannon
   * explosion) — Milestone 7. The engine only "announces"; the Hook maps
   * each event to audio (ARCHITECTURE §51).
   */
  setOnGameEvent(callback: ((event: GameEvent) => void) | null): void {
    this.onGameEvent = callback;
  }

  /** Updates the game area's dimensions (CSS px) and the Canvas resolution per the DPR. */
  resize(cssWidth: number, cssHeight: number): void {
    if (cssWidth <= 0 || cssHeight <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const previousBounds = this.bounds;
    this.bounds = { width: cssWidth, height: cssHeight };
    this.cannon.setBounds(this.bounds);
    this.stars = createStars(this.bounds);

    // Reposition + re-aim + re-scale the speed of active enemies to the new
    // bounds, and drop in-flight projectiles (their target no longer makes
    // sense). A short reset of object layout is allowed on resize
    // (ARCHITECTURE §35, PRD §4.19). Also guarantees a resize can never cost
    // a life or leave an enemy misaimed/off-screen (spec/plans/
    // milestone-9.md §1, F3, F6).
    const canReposition = previousBounds.width > 0 && previousBounds.height > 0;
    const scaleX = canReposition ? this.bounds.width / previousBounds.width : 1;
    const scaleY = canReposition ? this.bounds.height / previousBounds.height : 1;
    const cannonPosition: Vector2 = { x: this.cannon.x, y: this.cannon.y };
    const oldSpeedScale = enemySpeedScale(canReposition ? previousBounds.height : this.bounds.height);
    const newSpeedScale = enemySpeedScale(this.bounds.height);
    const speedFactor = oldSpeedScale > 0 ? newSpeedScale / oldSpeedScale : 1;

    for (const enemy of this.enemies) {
      if (canReposition) {
        enemy.x *= scaleX;
        enemy.y *= scaleY;
      }
      clampEnemyToBounds(enemy, this.bounds);
      const currentSpeed = Math.hypot(enemy.velocityX, enemy.velocityY);
      retargetEnemy(enemy, cannonPosition, currentSpeed * speedFactor);
      pushEnemyOutsideRadius(
        enemy,
        cannonPosition,
        GAME_CONFIG.cannon.hitRadius + getHitRadius(enemy.size) + GAME_CONFIG.enemy.resizeSafetyMargin,
      );
    }

    this.projectiles = [];

    // Draw one frame immediately so the canvas is never left blank behind an
    // open dialog while the loop is paused (spec/plans/milestone-9.md §1, F4).
    this.render();
  }

  /** CSS px coordinates relative to the game area (ARCHITECTURE §11, §12). */
  shoot(x: number, y: number): void {
    if (this.status !== 'playing') return;
    if (this.projectiles.length >= GAME_CONFIG.projectile.maxActive) return;

    const target: Vector2 = { x, y };
    this.cannon.aimAt(target);
    const origin = this.cannon.getMuzzlePosition();
    const id = `proj-${this.nextProjectileId++}`;
    this.projectiles.push(createProjectile(id, origin, target));
    this.onGameEvent?.({ type: 'shoot' });
  }

  private readonly onFrame = (deltaSeconds: number): void => {
    this.update(deltaSeconds);
    this.render();
  };

  private update(deltaSeconds: number): void {
    switch (this.status) {
      case 'playing':
        this.updatePlaying(deltaSeconds);
        break;
      case 'level-complete':
        this.updateLevelComplete(deltaSeconds);
        break;
      case 'player-hit':
        this.updatePlayerHit(deltaSeconds);
        break;
      case 'won':
      case 'lost':
        // The loop was already stopped in enterWon/enterLost; nothing to update.
        break;
    }
    this.publishStats();
  }

  /** The normal Update sequence (ARCHITECTURE §7), extended with cannon-hit and level-completion checks. */
  private updatePlaying(deltaSeconds: number): void {
    this.cannon.update(deltaSeconds);

    const cannonPosition: Vector2 = { x: this.cannon.x, y: this.cannon.y };
    const spawned = this.spawner.update(deltaSeconds, this.bounds, cannonPosition);
    if (spawned.length > 0) this.enemies.push(...spawned);

    for (const enemy of this.enemies) {
      updateEnemy(enemy, deltaSeconds);
    }

    // Enemy–cannon collision is checked before removing enemies that
    // crossed the bottom (spec/plans/milestone-4.md §1 decision 2) — so an
    // enemy that reaches the cannon triggers a hit, rather than being
    // silently removed first.
    if (detectCannonHit(this.enemies, cannonPosition, GAME_CONFIG.cannon.hitRadius)) {
      this.enterPlayerHit();
      return;
    }

    for (const enemy of this.enemies) {
      // An enemy that missed the cannon and exited to the side — removed silently (§1 decision 1).
      if (hasPassedBottom(enemy, this.bounds)) enemy.active = false;
    }

    for (const projectile of this.projectiles) {
      updateProjectile(projectile, deltaSeconds);
      if (isOutOfBounds(projectile, this.bounds)) {
        projectile.active = false;
      }
    }

    const hits = detectProjectileHits(this.projectiles, this.enemies);
    for (const { projectile, enemy } of hits) {
      projectile.active = false;
      applyHit(enemy);
      if (isDestroyed(enemy)) {
        enemy.active = false;
        this.score += enemy.scoreValue;
        const explosionId = `explosion-${this.nextExplosionId++}`;
        this.explosions.push(createExplosion(explosionId, enemy));
        this.onGameEvent?.({ type: 'enemy-destroyed', size: enemy.size });
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.active);
    this.enemies = this.enemies.filter((e) => e.active);
    this.updateExplosions(deltaSeconds);

    if (this.spawner.isFinished && this.enemies.length === 0) {
      if (this.levels.isLastLevel(this.currentLevel)) {
        this.enterWon();
      } else {
        this.enterStatus('level-complete');
      }
    }
  }

  /** Waiting state: shows "Level X complete", freezes the game, then advances. */
  private updateLevelComplete(deltaSeconds: number): void {
    this.statusTimerSeconds += deltaSeconds;
    this.updateExplosions(deltaSeconds);
    if (this.statusTimerSeconds >= GAME_CONFIG.levelCompleteDelaySeconds) {
      this.currentLevel += 1;
      this.startLevel(this.currentLevel);
      this.enterStatus('playing');
    }
  }

  /** Waiting state: the cannon explosion plays; no Spawn/movement/Collision (Hit Lock). */
  private updatePlayerHit(deltaSeconds: number): void {
    this.statusTimerSeconds += deltaSeconds;
    this.updateExplosions(deltaSeconds);
    if (this.statusTimerSeconds >= GAME_CONFIG.cannonExplosionDurationSeconds) {
      if (this.lives > 0) {
        this.restartLevel();
        this.enterStatus('playing');
      } else {
        this.enterLost();
      }
    }
  }

  private updateExplosions(deltaSeconds: number): void {
    for (const explosion of this.explosions) {
      updateExplosion(explosion, deltaSeconds);
    }
    this.explosions = this.explosions.filter((e) => !isExplosionFinished(e));
  }

  /** An enemy hit the cannon: lose one life, explode, and enter Hit Lock (ARCHITECTURE §21). */
  private enterPlayerHit(): void {
    this.lives -= 1;
    const explosionId = `explosion-${this.nextExplosionId++}`;
    this.explosions.push(
      createExplosionAt(
        explosionId,
        this.cannon.x,
        this.cannon.y,
        GAME_CONFIG.cannonExplosion.maxRadius,
        GAME_CONFIG.cannonExplosionDurationSeconds,
        'cannon',
      ),
    );
    this.onGameEvent?.({ type: 'cannon-explosion' });
    this.enterStatus('player-hit');
  }

  private enterWon(): void {
    this.enterStatus('won');
    this.loop.stop();
  }

  private enterLost(): void {
    this.enterStatus('lost');
    this.loop.stop();
  }

  private enterStatus(status: GameStatus): void {
    this.status = status;
    this.statusTimerSeconds = 0;
  }

  /**
   * Clears enemies/projectiles/explosions and starts a given level from
   * scratch (ARCHITECTURE §22). Used both in the constructor (new game) and
   * on level transition/Restart. Does not touch score, lives, or currentLevel.
   */
  private startLevel(level: number): void {
    this.enemies = [];
    this.projectiles = [];
    this.explosions = [];
    this.spawner.reset(this.levels.getConfig(level));
  }

  /** Restarts the current level after a hit (ARCHITECTURE §22) — Score/Lives/Level are preserved. */
  private restartLevel(): void {
    this.startLevel(this.currentLevel);
  }

  private buildStats(): GameStats {
    return {
      score: this.score,
      lives: this.lives,
      currentLevel: this.currentLevel,
      enemiesRemaining: this.spawner.remainingToSpawn + this.enemies.length,
      status: this.status,
    };
  }

  /** Broadcasts an update to the UI only when a field actually changed — no setState every Frame (ARCHITECTURE §54). */
  private publishStats(): void {
    const next = this.buildStats();
    const prev = this.stats;
    if (
      next.score === prev.score &&
      next.lives === prev.lives &&
      next.currentLevel === prev.currentLevel &&
      next.enemiesRemaining === prev.enemiesRemaining &&
      next.status === prev.status
    ) {
      return;
    }
    this.stats = next;
    this.onStatsChange?.(next);
  }

  private render(): void {
    this.renderer.drawBackground(this.bounds, this.stars);
    this.renderer.drawEnemies(this.enemies);
    // The cannon "exploded" — don't draw it alongside the explosion (spec/plans/milestone-4.md §6).
    if (this.status !== 'player-hit') {
      this.renderer.drawCannon(this.cannon);
    }
    this.renderer.drawProjectiles(this.projectiles);
    this.renderer.drawExplosions(this.explosions);
  }
}
