/**
 * Persistence types for saved game results — Milestone 6.
 * Source: spec/ARCHITECTURE.md §25 (Game Result Model), §27 (Statistics Storage).
 */

/** Outcome of a finished game. Only 'win' or 'loss' results are ever persisted. */
export type GameResultType = 'win' | 'loss';

/** One row in the statistics history, as stored in localStorage. */
export interface GameResult {
  id: string;
  /** ISO 8601 timestamp, e.g. new Date().toISOString(). */
  date: string;
  finalScore: number;
  levelReached: number;
  result: GameResultType;
}
