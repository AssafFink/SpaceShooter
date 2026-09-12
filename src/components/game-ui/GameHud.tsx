import './GameHud.css';

interface GameHudProps {
  score: number;
  enemiesRemaining: number;
}

/**
 * HUD ראשוני של מסך המשחק — Milestone 3 (Enemies & Combat).
 * מקור: spec/PRD.md §4.3, spec/ARCHITECTURE.md §41.
 *
 * ניקוד ואויבים שנותרו מוזנים מהמנוע (GameEngine דרך useGameEngine) ומתעדכנים
 * בזמן אמת. חיים ושלב עדיין קבועים — Slices של Milestone 4.
 * עיצוב מלא לפי ה-Mockups — Milestone 5 Slice 2.
 */
export function GameHud({ score, enemiesRemaining }: GameHudProps) {
  return (
    <div className="game-hud">
      <span className="game-hud__item">⭐ ניקוד: {score}</span>
      {/* חיים — קבוע זמנית, יתחבר למנוע ב-Milestone 4 (מערכת חיים) */}
      <span className="game-hud__item">❤️ חיים: 3</span>
      {/* שלב — קבוע זמנית, יתחבר למנוע ב-Milestone 4 (שלבים) */}
      <span className="game-hud__item">🚀 שלב: 1</span>
      <span className="game-hud__item">👾 נותרו: {enemiesRemaining}</span>
    </div>
  );
}
