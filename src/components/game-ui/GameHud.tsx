import './GameHud.css';

interface GameHudProps {
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
}

/**
 * HUD של מסך המשחק — Milestone 4 (Lives, Levels & Game Rules).
 * מקור: spec/PRD.md §4.3, spec/ARCHITECTURE.md §41.
 *
 * כל ארבעת הפריטים מוזנים מהמנוע (GameEngine דרך useGameEngine) ומתעדכנים
 * בזמן אמת. עיצוב מלא לפי ה-Mockups — Milestone 5 Slice 2.
 */
export function GameHud({ score, lives, currentLevel, enemiesRemaining }: GameHudProps) {
  return (
    <div className="game-hud">
      <span className="game-hud__item">⭐ ניקוד: {score}</span>
      <span className="game-hud__item">❤️ חיים: {lives}</span>
      <span className="game-hud__item">🚀 שלב: {currentLevel}</span>
      <span className="game-hud__item">👾 נותרו: {enemiesRemaining}</span>
    </div>
  );
}
