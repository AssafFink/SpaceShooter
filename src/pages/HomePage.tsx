import { Link } from 'react-router-dom';
import { Wordmark } from '../components/common/Wordmark';
import { ROUTES } from '../types/navigation';
import './HomePage.css';

/**
 * מסך ראשי — spec/PRD.md §4.1, spec/DESIGN.md (Mockup "ראשי").
 * Wordmark + איור תותח (Placeholder ויזואלי — Milestone 7 יחליף ב-Assets
 * אמיתיים) + כפתור "התחל" גדול שמתחיל מיד משחק חדש בשלב 1.
 */
export function HomePage() {
  return (
    <div className="page home-page">
      <Wordmark />

      <div className="home-page__art" aria-hidden="true">
        <span className="home-page__cannon">🚀</span>
        <span className="home-page__beam" />
      </div>

      <p className="home-page__tagline">חסלו את כל האויבים והשלימו 10 שלבים!</p>

      <Link to={ROUTES.game} className="btn btn--success home-page__start">
        התחל
      </Link>
    </div>
  );
}
