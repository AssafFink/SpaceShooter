import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GameCanvas } from '../components/game-ui/GameCanvas';
import { ROUTES } from '../types/navigation';
import './GamePage.css';

/**
 * מסך המשחק — spec/PRD.md §4.3.
 *
 * ב-Milestone 2 (Core Game Prototype) הוחלף ה-placeholder ב-Canvas אמיתי:
 * רקע חלל + כוכבים, תותח בתחתית שמסתובב לכיוון הלחיצה/נגיעה, וקליע לייזר
 * הנע מהתותח אל נקודת הלחיצה (src/game/GameEngine.ts דרך useGameEngine).
 *
 * HUD ה-אמיתי (ניקוד/חיים/שלב/אויבים) מגיע ב-Milestone 3/4 — כרגע placeholder.
 * ה-Dialog "האם אתה בטוח שברצונך לסיים את המשחק?" מגיע ב-Milestone 5.
 */
export function GamePage() {
  const navigate = useNavigate();

  return (
    <div className="game-page">
      {/* HUD placeholder — הערכים האמיתיים מגיעים ב-Milestone 3/4 */}
      <div className="game-page__hud" aria-hidden="true">
        <span className="game-page__hud-item">⭐ ניקוד: 0</span>
        <span className="game-page__hud-item">❤️ חיים: 3</span>
        <span className="game-page__hud-item">🚀 שלב: 1</span>
        <span className="game-page__hud-item">👾 נותרו: 0</span>
      </div>

      <GameCanvas />

      <Button variant="danger" onClick={() => navigate(ROUTES.home)}>
        סיים משחק
      </Button>
    </div>
  );
}
