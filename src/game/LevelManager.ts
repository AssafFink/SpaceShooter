import { GAME_CONFIG, LEVELS } from './gameConfig';
import type { LevelConfig } from '../types/game';

/**
 * גישה מרכזית להגדרת 10 השלבים — Milestone 4 (Lives, Levels & Game Rules).
 * מקור: spec/ARCHITECTURE.md §18.
 *
 * מחלקה דקה בלבד: אינה מחזיקה State של משחק (currentLevel חי ב-GameEngine),
 * רק מספקת גישה בטוחה לטבלת ה-LevelConfig.
 */
export class LevelManager {
  get totalLevels(): number {
    return GAME_CONFIG.totalLevels;
  }

  /** מחזיר את ה-Config של שלב נתון (1-based). Clamp הגנתי לטווח החוקי. */
  getConfig(level: number): LevelConfig {
    const index = Math.min(Math.max(level, 1), LEVELS.length) - 1;
    return LEVELS[index];
  }

  isLastLevel(level: number): boolean {
    return level >= this.totalLevels;
  }
}
