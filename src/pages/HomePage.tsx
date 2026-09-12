import { Link } from 'react-router-dom';
import { ROUTES } from '../types/navigation';
import './HomePage.css';

/**
 * מסך ראשי — spec/PRD.md §4.1, spec/DESIGN.md.
 * לוגו + שם המשחק + כפתור "התחל" שמתחיל מיד משחק חדש בשלב 1.
 */
export function HomePage() {
  return (
    <div className="page home-page">
      <div className="home-page__logo" aria-hidden="true">
        🪐
      </div>
      <h1 className="home-page__title">Space Shooter</h1>
      <p className="home-page__tagline">חסלו את כל האויבים והשלימו 10 שלבים!</p>
      <Link to={ROUTES.game} className="btn btn--success home-page__start">
        התחל
      </Link>
    </div>
  );
}
