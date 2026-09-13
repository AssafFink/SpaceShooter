import { Link } from 'react-router-dom';
import { Wordmark } from '../components/common/Wordmark';
import { ROUTES } from '../types/navigation';
import cannonUrl from '../assets/images/cannon.png';
import './HomePage.css';

/**
 * Home screen — spec/PRD.md §4.1, spec/DESIGN.md (Mockup "Home").
 * Milestone 7: the space background cut from style-guide.png as a subtle
 * backdrop, the real cannon sprite (instead of the earlier Placeholder), and
 * a large "Start" button that immediately begins a new game.
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
