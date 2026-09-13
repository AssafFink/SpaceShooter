import { Wordmark } from '../components/common/Wordmark';
import './AboutPage.css';

/**
 * About screen — spec/PRD.md §4.17, spec/DESIGN.md (Mockup "About").
 * Uses the `Wordmark` shared with the home screen for consistency.
 */
export function AboutPage() {
  return (
    <div className="page about-page">
      <Wordmark />
      <p className="caption">גרסה 1.0</p>
      <p className="about-page__text">
        Space Shooter הוא משחק ארקייד חללי מהנה ומאתגר, שבו עליכם להשמיד אויבים,
        לצבור ניקוד ולעבור את כל 10 השלבים. האם תצליחו להגיע לשלב הגבוה ביותר?
      </p>
      <hr className="about-page__divider" />
      <p className="about-page__credit">מתכנת: אסף פינקלשטיין</p>
    </div>
  );
}
