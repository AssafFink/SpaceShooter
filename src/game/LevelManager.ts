import { GAME_CONFIG, LEVELS } from './gameConfig';
import type { LevelConfig } from '../types/game';

/**
 * Central access to the 10-level definition — Milestone 4 (Lives, Levels & Game Rules).
 * Source: spec/ARCHITECTURE.md §18.
 *
 * A thin class only: holds no game State (currentLevel lives in GameEngine),
 * just provides safe access to the LevelConfig table.
 */
export class LevelManager {
  get totalLevels(): number {
    return GAME_CONFIG.totalLevels;
  }

  /** Returns the Config for a given level (1-based). Defensive clamp to the valid range. */
  getConfig(level: number): LevelConfig {
    const index = Math.min(Math.max(level, 1), LEVELS.length) - 1;
    return LEVELS[index];
  }

  isLastLevel(level: number): boolean {
    return level >= this.totalLevels;
  }
}
