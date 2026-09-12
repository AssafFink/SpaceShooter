import { GAME_CONFIG } from './gameConfig';

/**
 * Game Loop גנרי מבוסס requestAnimationFrame + Delta Time.
 * מקור: spec/ARCHITECTURE.md §7.
 *
 * לא תלוי ב-React ולא ב-Canvas — מחלקה טהורה שמפעילה callback בכל Frame.
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

    // ייתכן שה-callback עצר את הלולאה (stop()) — לא לתזמן Frame נוסף במקרה כזה.
    if (this.frameId !== null) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}
