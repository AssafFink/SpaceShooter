import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameStats } from '../types/game';

const INITIAL_STATS: GameStats = { score: 0, enemiesRemaining: 0 };

/**
 * הגשר בין React למנוע המשחק (GameEngine).
 * מקור: spec/ARCHITECTURE.md §51 (הפרדה בין React למנוע), §54 (Milestone 3).
 *
 * אחראי על: יצירת ה-Engine, האזנה ל-Resize ול-Input, הפעלה, וניקוי מלא
 * ב-unmount (ARCHITECTURE §53) — כולל טיפול נכון ב-React StrictMode
 * (ה-effect רץ פעמיים ב-dev; ה-cleanup חייב להיות מלא ואידמפוטנטי).
 *
 * `stats` (ניקוד + אויבים שנותרו) מתעדכן דרך callback שה-Engine קורא לו רק
 * כשערך משתנה בפועל — אין Re-render של React בכל Frame (ARCHITECTURE §54).
 */
export function useGameEngine() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = new GameEngine(canvas);
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
    };
  }, []);

  return { containerRef, canvasRef, stats };
}
