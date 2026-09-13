import type { RefObject } from 'react';
import './GameCanvas.css';

interface GameCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * React component wrapping the game area's Canvas.
 * Source: spec/ARCHITECTURE.md §6.
 *
 * Contains no game logic — all logic lives in GameEngine (via
 * useGameEngine). Receives the refs as props: the Hook itself runs in
 * GamePage (Milestone 3) because the HUD (React, outside the Canvas) needs
 * the same data — ARCHITECTURE §41. The outer div is the ResizeObserver's
 * "size gauge"; the canvas fills it.
 */
export function GameCanvas({ containerRef, canvasRef }: GameCanvasProps) {
  return (
    <div ref={containerRef} className="game-canvas" role="img" aria-label="אזור המשחק">
      <canvas ref={canvasRef} className="game-canvas__el" />
    </div>
  );
}
