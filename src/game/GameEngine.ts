import { GAME_CONFIG } from './gameConfig';
import { GameLoop } from './GameLoop';
import { Cannon } from './Cannon';
import { Renderer, createStars } from './Renderer';
import { createProjectile, updateProjectile, isOutOfBounds } from './Projectile';
import type { GameBounds, Projectile, Vector2 } from '../types/game';

/**
 * Orchestration של מנוע המשחק — Milestone 2 (Core Game Prototype).
 * מקור: spec/ARCHITECTURE.md §51, §52.
 *
 * אינו תלוי ב-React: מקבל HTMLCanvasElement בלבד ב-constructor, ואינו רושם
 * Event Listeners בעצמו (זו אחריות ה-Hook שמשתמש בו, ARCHITECTURE §53).
 *
 * Enemy/Collision/Score/Lives/Levels יתווספו ב-Milestone 3/4 — update() בנוי
 * כרצף קריאות מסודר כדי שהוספתם תהיה הרחבה ולא שכתוב.
 */
export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly loop: GameLoop;
  private readonly renderer: Renderer;
  private readonly cannon = new Cannon();

  private bounds: GameBounds = { width: 0, height: 0 };
  private stars = createStars(this.bounds);
  private projectiles: Projectile[] = [];
  private nextProjectileId = 1;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context לא זמין עבור ה-Canvas של המשחק');
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.loop = new GameLoop(this.onFrame);
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  destroy(): void {
    this.stop();
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

    for (const projectile of this.projectiles) {
      updateProjectile(projectile, deltaSeconds);
      if (isOutOfBounds(projectile, this.bounds)) {
        projectile.active = false;
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  private render(): void {
    this.renderer.drawBackground(this.bounds, this.stars);
    this.renderer.drawCannon(this.cannon);
    this.renderer.drawProjectiles(this.projectiles);
  }
}
