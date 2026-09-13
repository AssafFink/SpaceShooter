import { Link } from 'react-router-dom';
import { Wordmark } from '../components/common/Wordmark';
import { ROUTES } from '../types/navigation';
import cannonUrl from '../assets/images/cannon.png';
import './HomePage.css';

/**
 * מסך ראשי — spec/PRD.md §4.1, spec/DESIGN.md (Mockup "ראשי").
 * Milestone 7: רקע החלל הגזור מ-style-guide.png כ-backdrop עדין, ספרייט התותח
 * האמיתי (במקום ה-Placeholder הקודם), וכפתור "התחל" גדול שמתחיל מיד משחק חדש.
 */
export function HomePage() {
  return (
    <div className="page home-page">
      <div className="home-page__backdrop" aria-hidden="true" />
      <Wordmark />

      <img className="home-page__cannon" src={cannonUrl} alt="" aria-hidden="true" />

      <p className="home-page__tagline">חסלו את כל האויבים והשלימו 10 שלבים!</p>

      <Link to={ROUTES.game} className="btn btn--success home-page__start">
        התחל
      </Link>
    </div>
  );
}
