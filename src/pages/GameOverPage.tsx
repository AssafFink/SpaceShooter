import { Link, Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../types/navigation';
import type { GameOverState } from '../types/navigation';
import './GameOverPage.css';

/**
 * מסך סיום משחק — spec/PRD.md §4.13.
 *
 * Milestone 4: קורא את תוצאת המשחק (win/loss, ניקוד, שלב) מ-`location.state`,
 * שמועבר מ-`GamePage` בניווט. אם המסך נפתח בלי state (למשל כניסה ישירה
 * ל-`/game-over` או Refresh) — אין תוצאה אמיתית להציג, ולכן מפנים בחזרה
 * ל-`/` (spec/plans/milestone-4.md §1 החלטה 4).
 *
 * עיצוב מלא לפי ה-Mockups — Milestone 5. שמירת התוצאה בסטטיסטיקות — Milestone 6.
 */
export function GameOverPage() {
  const location = useLocation();
  const state = location.state as GameOverState | null;

  if (!state) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const isWin = state.result === 'win';

  return (
    <div className="page game-over-page">
      <div className="game-over-page__icon" aria-hidden="true">
        {isWin ? '🏆' : '💥'}
      </div>
      <h1
        className={`game-over-page__result game-over-page__result--${isWin ? 'win' : 'loss'}`}
      >
        {isWin ? 'ניצחון!' : 'הפסד'}
      </h1>
      <div className="panel game-over-page__stats">
        <p>
          ניקוד סופי: <strong>{state.finalScore}</strong>
        </p>
        <p>
          השלב שהושג: <strong>{state.levelReached}</strong>
        </p>
      </div>
      <Link to={ROUTES.game} className="btn btn--success">
        משחק חדש
      </Link>
    </div>
  );
}
