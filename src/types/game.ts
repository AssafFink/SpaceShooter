/**
 * Types בסיסיים למנוע המשחק — Milestone 2+3 (Core Game Prototype, Enemies & Combat).
 * מקור: spec/ARCHITECTURE.md §12 (Projectile System), §14-15 (Enemy Model), §45 (Explosion).
 *
 * GameState / GameStatus המלאים (lives, currentLevel, status) יתווספו ב-Milestone 4
 * כאשר יהיה בהם צורך בפועל — אין להוסיף Types לא בשימוש (ARCHITECTURE §61).
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
}

/** אנימציית פיצוץ קצרה (ARCHITECTURE §45). נמחקת כשה-elapsed עובר את ה-duration. */
export interface Explosion {
  id: string;
  x: number;
  y: number;
  /** רדיוס השיא — נגזר מגודל האויב שהתפוצץ. */
  maxRadius: number;
  elapsedSeconds: number;
  durationSeconds: number;
}

/** מה שה-UI (React) צריך לדעת מהמנוע — ותו לא (ARCHITECTURE §54). */
export interface GameStats {
  score: number;
  enemiesRemaining: number;
}
