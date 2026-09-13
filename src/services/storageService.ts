import type { GameResult, GameResultType } from '../types/statistics';

/**
 * Centralized localStorage access — Milestone 6.
 * Source: spec/ARCHITECTURE.md §26 (keys), §27 (statistics storage),
 * §32-33 (sound persistence), §48 (error handling), §49 (single service).
 *
 * No other module in the app reads or writes localStorage directly.
 * Every read/write here is wrapped so corrupted data or a blocked storage
 * API (private mode, quota, disabled storage) never crashes the app —
 * callers always get a safe default value instead.
 */

const STATISTICS_KEY = 'spaceShooter.statistics';
const SOUND_MUTED_KEY = 'spaceShooter.soundMuted';

/** Type guard for a single, well-formed GameResult entry. */
function isGameResult(value: unknown): value is GameResult {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.date === 'string' &&
    typeof record.finalScore === 'number' &&
    typeof record.levelReached === 'number' &&
    (record.result === 'win' || record.result === 'loss')
  );
}

/**
 * All saved game results, in the order they were saved (oldest first).
 * Returns [] if nothing is saved, or if the stored value is missing/corrupt.
 */
export function getStatistics(): GameResult[] {
  try {
    const raw = localStorage.getItem(STATISTICS_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isGameResult);
  } catch {
    return [];
  }
}

/**
 * Appends a new game result. Only called for a finished game (win/loss) —
 * see GamePage.tsx. Silently no-ops if storage is unavailable or full.
 */
export function saveGameResult(input: {
  result: GameResultType;
  finalScore: number;
  levelReached: number;
}): void {
  try {
    const newResult: GameResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      finalScore: input.finalScore,
      levelReached: input.levelReached,
      result: input.result,
    };

    const existing = getStatistics();
    localStorage.setItem(STATISTICS_KEY, JSON.stringify([...existing, newResult]));
  } catch {
    // Best-effort persistence — a failed save must not break the game flow.
  }
}

/** Whether audio is muted. Defaults to false (unmuted) if unset or corrupt. */
export function getSoundMuted(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_MUTED_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
}

/** Persists the mute preference. Silently no-ops if storage is unavailable. */
export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, JSON.stringify(muted));
  } catch {
    // Best-effort persistence — a failed write must not break the toggle.
  }
}
