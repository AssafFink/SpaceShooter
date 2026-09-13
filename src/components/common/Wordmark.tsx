import './Wordmark.css';

/**
 * "SPACE SHOOTER" מעוצב — Milestone 5.
 * מקור: spec/DESIGN.md (Mockups: מסך ראשי + מסך אודות).
 *
 * Placeholder ויזואלי מבוסס CSS (Gradient + Glow) — לא קובץ גרפיקה. שימוש
 * חוזר ב-HomePage וב-AboutPage לעקביות. החלפה באיור/לוגו אמיתי — Milestone 7.
 */
export function Wordmark() {
  return (
    <h1 className="wordmark">
      <span className="wordmark__line wordmark__line--top">SPACE</span>
      <span className="wordmark__line wordmark__line--bottom">SHOOTER</span>
    </h1>
  );
}
