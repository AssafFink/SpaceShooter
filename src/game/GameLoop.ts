import { GAME_CONFIG } from './gameConfig';

/**
 * Generic Game Loop based on requestAnimationFrame + Delta Time.
 * Source: spec/ARCHITECTURE.md §7.
 *
 * Not dependent on React or Canvas — a pure class that fires a callback on every Frame.
 */
export class GameLoop {
  private readonly onFrame: (deltaSeconds: number) => void;
  private frameId: number | null = null;
  private lastTimeMs: number | null = null;

  constructor(onFrame: (deltaSeconds: number) => void) {
    this.onFrame = onFrame;
  }

  get isRunning(): boolean {
    return this.frameId !== null;
  }

  start(): void {
    if (this.isRunning) return;
    this.lastTimeMs = null;
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.lastTimeMs = null;
  }

  private readonly tick = (nowMs: number): void => {
    const deltaSeconds =
      this.lastTimeMs === null
        ? 0
        : Math.min((nowMs - this.lastTimeMs) / 1000, GAME_CONFIG.maxDeltaSeconds);
    this.lastTimeMs = nowMs;

    this.onFrame(deltaSeconds);

    // The callback may have stopped the loop (stop()) — don't schedule another Frame if so.
    if (this.frameId !== null) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}
