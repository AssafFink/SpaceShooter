import type { RefObject } from 'react';
import './GameCanvas.css';

interface GameCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * רכיב React עוטף ל-Canvas של אזור המשחק.
 * מקור: spec/ARCHITECTURE.md §6.
 *
 * אינו מכיל לוגיקת משחק — כל הלוגיקה ב-GameEngine (דרך useGameEngine).
 * מקבל את ה-refs כ-props: ה-Hook עצמו רץ ב-GamePage (Milestone 3) כי ה-HUD
 * (React, מחוץ ל-Canvas) זקוק לאותם נתונים — ARCHITECTURE §41.
 * ה-div החיצוני הוא "מודד הגודל" של ResizeObserver; ה-canvas ממלא אותו.
 */
export function GameCanvas({ containerRef, canvasRef }: GameCanvasProps) {
  return (
    <div ref={containerRef} className="game-canvas" role="img" aria-label="אזור המשחק">
      <canvas ref={canvasRef} className="game-canvas__el" />
    </div>
  );
}
