import { useGameEngine } from '../../hooks/useGameEngine';
import './GameCanvas.css';

/**
 * רכיב React עוטף ל-Canvas של אזור המשחק.
 * מקור: spec/ARCHITECTURE.md §6.
 *
 * אינו מכיל לוגיקת משחק — כל הלוגיקה ב-GameEngine (דרך useGameEngine).
 * ה-div החיצוני הוא "מודד הגודל" של ResizeObserver; ה-canvas ממלא אותו.
 */
export function GameCanvas() {
  const { containerRef, canvasRef } = useGameEngine();

  return (
    <div ref={containerRef} className="game-canvas" role="img" aria-label="אזור המשחק">
      <canvas ref={canvasRef} className="game-canvas__el" />
    </div>
  );
}
