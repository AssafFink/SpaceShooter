import { GAME_CONFIG } from './gameConfig';
import { GameLoop } from './GameLoop';
import { Cannon } from './Cannon';
import { Renderer, createStars } from './Renderer';
import { createProjectile, updateProjectile, isOutOfBounds } from './Projectile';
import {
  applyHit,
  clampEnemyToBounds,
  hasPassedBottom,
  isDestroyed,
  updateEnemy,
} from './Enemy';
import { EnemySpawner } from './EnemySpawner';
import { detectProjectileHits } from './CollisionManager';
import { createExplosion, isExplosionFinished, updateExplosion } from './Explosion';
import type { Enemy, Explosion, GameBounds, GameStats, Projectile, Vector2 } from '../types/game';

/**
 * Orchestration של מנוע המשחק — Milestone 2+3 (Core Game Prototype, Enemies & Combat).
 * מקור: spec/ARCHITECTURE.md §51, §52.
 *
 * אינו תלוי ב-React: מקבל HTMLCanvasElement בלבד ב-constructor, ואינו רושם
 * Event Listeners בעצמו (זו אחריות ה-Hook שמשתמש בו, ARCHITECTURE §53).
 *
 * Score/Lives/Levels/Win/Loss יתווספו ב-Milestone 4 — update() בנוי כרצף
 * קריאות מסודר כדי שהוספתם תהיה הרחבה ולא שכתוב (ראו spec/plans/milestone-3.md §15).
 */
export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly loop: GameLoop;
  private readonly renderer: Renderer;
  private readonly cannon = new Cannon();
  private readonly spawner = new EnemySpawner();

  private bounds: GameBounds = { width: 0, height: 0 };
  private stars = createStars(this.bounds);
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private explosions: Explosion[] = [];
  private nextProjectileId = 1;
  private nextExplosionId = 1;
  private score = 0;

  private stats: GameStats = { score: 0, enemiesRemaining: 0 };
  private onStatsChange: ((stats: GameStats) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context לא זמין עבור ה-Canvas של המשחק');
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.loop = new GameLoop(this.onFrame);
    this.spawner.reset();
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
  }

  /** רושם callback שנקרא רק כאשר score/enemiesRemaining משתנים בפועל (ARCHITECTURE §54). */
  setOnStatsChange(callback: ((stats: GameStats) => void) | null): void {
    this.onStatsChange = callback;
  }

  /** מעדכן את מידות אזור המשחק (CSS px) ואת רזולוציית ה-Canvas בהתאם ל-DPR. */
  resize(cssWidth: number, cssHeight: number): void {
    if (cssWidth <= 0 || cssHeight <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.bounds = { width: cssWidth, height: cssHeight };
    this.cannon.setBounds(this.bounds);
    this.stars = createStars(this.bounds);

    for (const enemy of this.enemies) {
      clampEnemyToBounds(enemy, this.bounds);
    }
  }

  /** קואורדינטות CSS px יחסית לאזור המשחק (ARCHITECTURE §11, §12). */
  shoot(x: number, y: number): void {
    if (this.projectiles.length >= GAME_CONFIG.projectile.maxActive) return;

    const target: Vector2 = { x, y };
    this.cannon.aimAt(target);
    const origin = this.cannon.getMuzzlePosition();
    const id = `proj-${this.nextProjectileId++}`;
    this.projectiles.push(createProjectile(id, origin, target));
  }

  private readonly onFrame = (deltaSeconds: number): void => {
    this.update(deltaSeconds);
    this.render();
  };

  private update(deltaSeconds: number): void {
    this.cannon.update(deltaSeconds);

    const cannonPosition: Vector2 = { x: this.cannon.x, y: this.cannon.y };
    const spawned = this.spawner.update(deltaSeconds, this.bounds, cannonPosition);
    if (spawned.length > 0) this.enemies.push(...spawned);

    for (const enemy of this.enemies) {
      updateEnemy(enemy, deltaSeconds);
      // Milestone 3 בלבד: אויב שחצה את הגבול התחתון מוסר בשקט. ב-Milestone 4
      // יוחלף בהתנגשות אויב–תותח + אובדן חיים (spec/plans/milestone-3.md §1).
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
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.active);
    this.enemies = this.enemies.filter((e) => e.active);

    for (const explosion of this.explosions) {
      updateExplosion(explosion, deltaSeconds);
    }
    this.explosions = this.explosions.filter((e) => !isExplosionFinished(e));

    this.publishStats();
  }

  /** משדר עדכון ל-UI רק כששדה השתנה בפועל — אין setState לכל Frame (ARCHITECTURE §54). */
  private publishStats(): void {
    const enemiesRemaining = this.spawner.remainingToSpawn + this.enemies.length;
    if (enemiesRemaining === this.stats.enemiesRemaining && this.score === this.stats.score) {
      return;
    }
    this.stats = { score: this.score, enemiesRemaining };
    this.onStatsChange?.(this.stats);
  }

  private render(): void {
    this.renderer.drawBackground(this.bounds, this.stars);
    this.renderer.drawEnemies(this.enemies);
    this.renderer.drawCannon(this.cannon);
    this.renderer.drawProjectiles(this.projectiles);
    this.renderer.drawExplosions(this.explosions);
  }
}
