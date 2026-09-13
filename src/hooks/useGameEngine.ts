import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../game/gameConfig';
import { GameEngine } from '../game/GameEngine';
import type { GameStats } from '../types/game';

const INITIAL_STATS: GameStats = {
  score: 0,
  lives: GAME_CONFIG.maxLives,
  currentLevel: 1,
  enemiesRemaining: 0,
  status: 'playing',
};

/**
 * הגשר בין React למנוע המשחק (GameEngine).
 * מקור: spec/ARCHITECTURE.md §51 (הפרדה בין React למנוע), §54.
 *
 * אחראי על: יצירת ה-Engine, האזנה ל-Resize ול-Input, הפעלה, וניקוי מלא
 * ב-unmount (ARCHITECTURE §53) — כולל טיפול נכון ב-React StrictMode
 * (ה-effect רץ פעמיים ב-dev; ה-cleanup חייב להיות מלא ואידמפוטנטי).
 *
 * `stats` (ניקוד, חיים, שלב, אויבים שנותרו, status) מתעדכן דרך callback
 * שה-Engine קורא לו רק כשערך משתנה בפועל — אין Re-render של React בכל
 * Frame (ARCHITECTURE §54).
 *
 * `pause`/`resume` (Milestone 5) חושפים את `engine.stop()`/`start()` הקיימים
 * דרך `ref` יציב — משמשים את Confirmation Dialog של "סיים משחק" (GamePage)
 * כדי להקפיא את המשחק כל עוד ה-Dialog פתוח, בלי לגעת ב-GameEngine עצמו.
 */
export function useGameEngine() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    setStats(INITIAL_STATS);
    engine.setOnStatsChange(setStats);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      engine.resize(width, height);
    });
    resizeObserver.observe(container);
    // קריאה ראשונית מיידית — ה-ResizeObserver כבר יורה קריאה בעת ה-observe,
    // אך אין להסתמך על תזמון זה; מודדים ישירות למקרה שהמידות כבר ידועות.
    engine.resize(container.clientWidth, container.clientHeight);

    function handlePointerDown(event: PointerEvent): void {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      engine.shoot(event.clientX - rect.left, event.clientY - rect.top);
      event.preventDefault();
    }
    canvas.addEventListener('pointerdown', handlePointerDown);

    engine.start();

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const pause = useCallback(() => engineRef.current?.stop(), []);
  const resume = useCallback(() => engineRef.current?.start(), []);

  return { containerRef, canvasRef, stats, pause, resume };
}
