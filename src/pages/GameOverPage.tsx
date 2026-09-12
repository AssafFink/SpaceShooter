import { Link } from 'react-router-dom';
import { ROUTES } from '../types/navigation';
import './GameOverPage.css';

/**
 * מסך סיום משחק — spec/PRD.md §4.13.
 *
 * ב-Milestone 1 זהו שלד סטטי בלבד (תצוגת ניצחון לדוגמה).
 * העברת התוצאה בפועל (win/loss, ניקוד, שלב) מהמשחק תגיע ב-Milestone 4/5.
 */
export function GameOverPage() {
  return (
    <div className="page game-over-page">
      <div className="game-over-page__icon" aria-hidden="true">
        🏆
      </div>
      <h1 className="game-over-page__result">ניצחון!</h1>
      <div className="panel game-over-page__stats">
        <p>
          ניקוד סופי: <strong>0</strong>
        </p>
        <p>
          השלב שהושג: <strong>1</strong>
        </p>
      </div>
      <Link to={ROUTES.game} className="btn btn--success">
        משחק חדש
      </Link>
    </div>
  );
}
