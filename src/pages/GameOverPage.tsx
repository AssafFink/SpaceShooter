import { Link, Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../types/navigation';
import type { GameOverState } from '../types/navigation';
import './GameOverPage.css';

/**
 * מסך סיום משחק — spec/PRD.md §4.13, spec/DESIGN.md (Mockup "סיום משחק").
 *
 * קורא את תוצאת המשחק (win/loss, ניקוד, שלב) מ-`location.state`, שמועבר
 * מ-`GamePage` בניווט. אם המסך נפתח בלי state (כניסה ישירה או Refresh) —
 * אין תוצאה אמיתית להציג, ולכן מפנים בחזרה ל-`/`.
 *
 * שמירת התוצאה בסטטיסטיקות — Milestone 6.
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
      <div
        className={`game-over-page__icon game-over-page__icon--${isWin ? 'win' : 'loss'}`}
        aria-hidden="true"
      >
        {isWin ? '🏆' : '💥'}
      </div>
      <h1
        className={`game-over-page__result game-over-page__result--${isWin ? 'win' : 'loss'}`}
      >
        {isWin ? 'ניצחון!' : 'הפסד'}
      </h1>
      <div className="panel game-over-page__stats">
        <p>
          ניקוד סופי: <strong className="game-over-page__score">{state.finalScore}</strong>
        </p>
        <p>
          השלב שהושג: <strong className="game-over-page__level">{state.levelReached}</strong>
        </p>
      </div>
      <Link to={ROUTES.game} className="btn btn--success game-over-page__new-game">
        משחק חדש
      </Link>
    </div>
  );
}
