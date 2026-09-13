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
 * Orchestration של מנוע המשחק — Milestone 2+3+4 (עד Lives, Levels & Game Rules).
 * מקור: spec/ARCHITECTURE.md §51, §52, §8 (Game State).
 *
 * אינו תלוי ב-React: מקבל HTMLCanvasElement בלבד ב-constructor, ואינו רושם
 * Event Listeners בעצמו (זו אחריות ה-Hook שמשתמש בו, ARCHITECTURE §53).
 *
 * `update()` הוא מכונת מצבים לפי `GameStatus` (§8): רק ב-`playing` רצים Spawn,
 * תנועת אויבים, Collision וזיהוי סיום שלב; `level-complete` ו-`player-hit` הם
 * מצבי המתנה (Timer בלבד + עדכון פיצוצים); `won`/`lost` עוצרים את הלולאה.
 * ראו spec/plans/milestone-4.md §9.
 */
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
  private currentLevel = 1;
  private status: GameStatus = 'playing';
  /** זמן שחלף מאז הכניסה למצב `level-complete` או `player-hit` (שניות). */
  private statusTimerSeconds = 0;

  private stats: GameStats = this.buildStats();
  private onStatsChange: ((stats: GameStats) => void) | null = null;
  private onGameEvent: ((event: GameEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context לא זמין עבור ה-Canvas של המשחק');
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.loop = new GameLoop(this.onFrame);
    this.startLevel(1);
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

  /** רושם callback שנקרא רק כאשר GameStats משתנה בפועל (ARCHITECTURE §54). */
  setOnStatsChange(callback: ((stats: GameStats) => void) | null): void {
    this.onStatsChange = callback;
  }

  /**
   * רושם callback לאירועי משחק חד-פעמיים (ירי, חיסול, פיצוץ תותח) — Milestone 7.
   * המנוע רק "מכריז"; ה-Hook הוא שממפה כל אירוע לאודיו (ARCHITECTURE §51).
   */
  setOnGameEvent(callback: ((event: GameEvent) => void) | null): void {
    this.onGameEvent = callback;
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
        // הלולאה נעצרה כבר ב-enterWon/enterLost; אין מה לעדכן.
        break;
    }
    this.publishStats();
  }

  /** רצף ה-Update הרגיל (ARCHITECTURE §7), מורחב בבדיקת תותח וסיום שלב. */
  private updatePlaying(deltaSeconds: number): void {
    this.cannon.update(deltaSeconds);

    const cannonPosition: Vector2 = { x: this.cannon.x, y: this.cannon.y };
    const spawned = this.spawner.update(deltaSeconds, this.bounds, cannonPosition);
    if (spawned.length > 0) this.enemies.push(...spawned);

    for (const enemy of this.enemies) {
      updateEnemy(enemy, deltaSeconds);
    }

    // התנגשות אויב–תותח נבדקת לפני הסרת אויבים שחצו את התחתית (spec/plans/
    // milestone-4.md §1 החלטה 2) — כך שאויב שמגיע לתותח מפעיל פגיעה, ולא
    // נמחק בשקט קודם.
    if (detectCannonHit(this.enemies, cannonPosition, GAME_CONFIG.cannon.hitRadius)) {
      this.enterPlayerHit();
      return;
    }

    for (const enemy of this.enemies) {
      // אויב שהחמיץ את התותח ויצא בצד — מוסר בשקט (§1 החלטה 1).
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

  /** מצב המתנה: מציגים "שלב X הושלם", מקפיאים את המשחק, ואז מתקדמים. */
  private updateLevelComplete(deltaSeconds: number): void {
    this.statusTimerSeconds += deltaSeconds;
    this.updateExplosions(deltaSeconds);
    if (this.statusTimerSeconds >= GAME_CONFIG.levelCompleteDelaySeconds) {
      this.currentLevel += 1;
      this.startLevel(this.currentLevel);
      this.enterStatus('playing');
    }
  }

  /** מצב המתנה: פיצוץ התותח מתנגן; אין Spawn/תנועה/Collision (Hit Lock). */
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

  /** אויב פגע בתותח: הורדת חיים אחד, פיצוץ, וכניסה ל-Hit Lock (ARCHITECTURE §21). */
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
   * מנקה אויבים/קליעים/פיצוצים ומתחיל שלב נתון מההתחלה (ARCHITECTURE §22).
   * משמש גם ב-constructor (משחק חדש) וגם במעבר/Restart שלב.
   * אינו נוגע ב-score, lives או currentLevel.
   */
  private startLevel(level: number): void {
    this.enemies = [];
    this.projectiles = [];
    this.explosions = [];
    this.spawner.reset(this.levels.getConfig(level));
  }

  /** Restart של השלב הנוכחי אחרי פגיעה (ARCHITECTURE §22) — Score/Lives/Level נשמרים. */
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

  /** משדר עדכון ל-UI רק כששדה השתנה בפועל — אין setState לכל Frame (ARCHITECTURE §54). */
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
    // התותח "התפוצץ" — לא מציירים אותו במקביל לפיצוץ (spec/plans/milestone-4.md §6).
    if (this.status !== 'player-hit') {
      this.renderer.drawCannon(this.cannon);
    }
    this.renderer.drawProjectiles(this.projectiles);
    this.renderer.drawExplosions(this.explosions);
  }
}
