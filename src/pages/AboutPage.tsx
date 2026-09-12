import './AboutPage.css';

/**
 * מסך אודות — spec/PRD.md §4.17.
 */
export function AboutPage() {
  return (
    <div className="page about-page">
      <div className="about-page__logo" aria-hidden="true">
        🪐
      </div>
      <h1 className="about-page__title">Space Shooter</h1>
      <p className="caption">גרסה 1.0</p>
      <p className="about-page__text">
        Space Shooter הוא משחק ארקייד חללי מהנה ומאתגר, שבו עליכם להשמיד אויבים,
        לצבור ניקוד ולעבור את כל 10 השלבים. האם תצליחו להגיע לשלב הגבוה ביותר?
      </p>
      <p className="about-page__credit">מתכנת: אסף פינקלשטיין</p>
    </div>
  );
}
