/**
 * Types בסיסיים למנוע המשחק — Milestone 2+3+4.
 * מקור: spec/ARCHITECTURE.md §8 (Game State), §12 (Projectile System),
 * §14-15 (Enemy Model), §18 (Level Configuration), §45 (Explosion).
 */

/** נקודה או וקטור דו-ממדי, ב-CSS Pixels יחסית לאזור המשחק. */
export interface Vector2 {
  x: number;
  y: number;
}

/** מידות אזור המשחק (ה-Canvas) ב-CSS Pixels. */
export interface GameBounds {
  width: number;
  height: number;
}

/** מקור: spec/ARCHITECTURE.md §12. */
export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
  /** המיקום בתחילת הפריים הנוכחי — נדרש ל-Swept Collision (Milestone 3). */
  prevX: number;
  prevY: number;
}

/** מקור: spec/ARCHITECTURE.md §14-15. הגודל הוא גם מדד החוזק (PRD §4.6). */
export type EnemySize = 'small' | 'medium' | 'large';

/** מקור: spec/ARCHITECTURE.md §14. */
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
   * זמן שנותר להבזק "נפגע אך לא חוסל" (שניות), Milestone 7. גדול מ-0 מיד אחרי
   * פגיעה שאינה מחסלת; יורד ל-0 ב-`updateEnemy`. משמש רק למשוב חזותי ב-Renderer
   * (spec/PRD §UX — "משוב חזותי ברור כאשר Enemy סופג פגיעה גם אם לא חוסל").
   */
  hitFlashSeconds: number;
}

/** סוג הפיצוץ — קובע איזה Sprite/גודל מצויר (Milestone 7). */
export type ExplosionVariant = EnemySize | 'cannon';

/** אנימציית פיצוץ קצרה (ARCHITECTURE §45). נמחקת כשה-elapsed עובר את ה-duration. */
export interface Explosion {
  id: string;
  x: number;
  y: number;
  /** רדיוס השיא — נגזר מגודל האויב שהתפוצץ. */
  maxRadius: number;
  elapsedSeconds: number;
  durationSeconds: number;
  /** סוג הפיצוץ — בחירת Sprite ב-Renderer (Milestone 7). */
  variant: ExplosionVariant;
}

/**
 * אירוע חד-פעמי שהמנוע פולט ברגעי מפתח, לצורך אפקטי קול (Milestone 7).
 * מקור: spec/ARCHITECTURE.md §51 — המנוע אינו תלוי ב-React או ב-Audio; הוא רק
 * מכריז מה קרה, וה-Hook (`useGameEngine`) ממפה כל אירוע לקריאת `audioService`.
 */
export type GameEvent =
  | { type: 'shoot' }
  | { type: 'enemy-destroyed'; size: EnemySize }
  | { type: 'cannon-explosion' };

/**
 * מצב המשחק הכללי (ARCHITECTURE §8). `GameEngine.update()` מתפצל לפי שדה זה —
 * רק ב-`playing` רצים Spawn, תנועת אויבים ו-Collision (Milestone 4).
 */
export type GameStatus =
  | 'playing'
  | 'level-complete'
  | 'player-hit'
  | 'won'
  | 'lost';

/**
 * טווחים בלבד — הערכים בפועל מוגרלים בתוכם בכל תחילת שלב (ARCHITECTURE §18-19).
 * הבדלת סוגי האויבים היא לפי גודל בלבד; שלוש ההסתברויות סוכמות ל-1.
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

/** מה שה-UI (React) צריך לדעת מהמנוע — ותו לא (ARCHITECTURE §54). */
export interface GameStats {
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
  status: GameStatus;
}
