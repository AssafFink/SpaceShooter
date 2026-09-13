import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../game/gameConfig';
import { GameEngine } from '../game/GameEngine';
import { audioService } from '../services/audioService';
import type { GameEvent, GameStats } from '../types/game';

const INITIAL_STATS: GameStats = {
  score: 0,
  lives: GAME_CONFIG.maxLives,
  currentLevel: 1,
  enemiesRemaining: 0,
  status: 'playing',
};

/**
 * Dev-only QA hook (Milestone 9, spec/plans/milestone-9.md §3.1): reading
 * `?level=N` from the URL lets a developer jump a fresh game straight to a
 * late level (e.g. to reach Win) without replaying the whole game. Vite
 * strips this branch out of the production bundle via `import.meta.env.DEV`.
 */
function getDevStartLevel(): number | undefined {
  if (!import.meta.env.DEV) return undefined;
  const raw = new URLSearchParams(window.location.search).get('level');
  if (raw === null) return undefined;
  const level = Number(raw);
  return Number.isFinite(level) ? level : undefined;
}

/**
 * Bridge between React and the game engine (GameEngine).
 * Source: spec/ARCHITECTURE.md §51 (React/engine separation), §54.
 *
 * Responsible for: creating the Engine, listening for Resize and Input,
 * starting it, and fully cleaning up on unmount (ARCHITECTURE §53) —
 * including correct behavior under React StrictMode (the effect runs twice
 * in dev; the cleanup must be complete and idempotent).
 *
 * `stats` (score, lives, level, enemies remaining, status) updates through a
 * callback the Engine calls only when a value actually changes — no React
 * re-render on every frame (ARCHITECTURE §54).
 *
 * `pause`/`resume` (Milestone 5) expose the existing `engine.stop()`/`start()`
 * through a stable `ref` — used by the "end game" Confirmation Dialog
 * (GamePage) to freeze the game while it's open, without touching
 * GameEngine itself.
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

    const engine = new GameEngine(canvas, { startLevel: getDevStartLevel() });
    engineRef.current = engine;
    setStats(INITIAL_STATS);
    engine.setOnStatsChange(setStats);

    // Engine events → sound effects. The engine stays pure (ARCHITECTURE
    // §51); the mapping to audio lives here, in the React layer, just like setStats.
    engine.setOnGameEvent((event: GameEvent) => {
      switch (event.type) {
        case 'shoot':
          audioService.playLaser();
          break;
        case 'enemy-destroyed':
          audioService.playEnemyExplosion(event.size);
          break;
        case 'cannon-explosion':
          audioService.playCannonExplosion();
          break;
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      engine.resize(width, height);
    });
    resizeObserver.observe(container);
    // Immediate initial call — the ResizeObserver already fires once on
    // observe(), but that timing isn't guaranteed; measure directly in case
    // the dimensions are already known.
    engine.resize(container.clientWidth, container.clientHeight);

    function handlePointerDown(event: PointerEvent): void {
      if (!canvas) return;
      // Ignore secondary touch points and non-left mouse buttons — exactly
      // one shot per primary click/tap (ARCHITECTURE §11: no multi-touch
      // shooting). spec/plans/milestone-9.md §1, F5.
      if (!event.isPrimary) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
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
