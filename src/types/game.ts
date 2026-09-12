/**
 * Types בסיסיים למנוע המשחק — Milestone 2 (Core Game Prototype).
 * מקור: spec/ARCHITECTURE.md §12 (Projectile System).
 *
 * Enemy / GameState / GameStatus יתווספו ב-Milestone 3/4 כאשר יהיה בהם צורך
 * בפועל — אין להוסיף Types לא בשימוש (ARCHITECTURE §61).
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
}
