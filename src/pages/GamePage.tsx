import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ROUTES } from '../types/navigation';
import './GamePage.css';

/**
 * מסך המשחק — spec/PRD.md §4.3.
 *
 * ב-Milestone 1 זהו שלד בלבד: placeholder לאזור המשחק וכפתור "סיים משחק"
 * (שכרגע פשוט חוזר למסך הראשי, ללא Dialog אישור).
 *
 * ה-Canvas, ה-Game Loop, ה-HUD האמיתי, התותח והאויבים מגיעים ב-Milestone 2+.
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

      <div className="game-page__canvas-placeholder">
        <p>אזור המשחק (Canvas) יתווסף ב-Milestone הבא</p>
      </div>

      <Button variant="danger" onClick={() => navigate(ROUTES.home)}>
        סיים משחק
      </Button>
    </div>
  );
}
