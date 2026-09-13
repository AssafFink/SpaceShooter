import './LevelCompleteMessage.css';

interface LevelCompleteMessageProps {
  level: number;
}

/**
 * הודעת "שלב X הושלם" — Overlay React מעל ה-Canvas (לא ציור Canvas).
 * מקור: spec/ARCHITECTURE.md §20, §41; spec/PRD.md §4.10.
 *
 * מוצג כל עוד `status === 'level-complete'` (GamePage); המעבר האוטומטי
 * לשלב הבא מתוזמן ב-GameEngine, לא ברכיב הזה. Polish של המעבר — Milestone 7.
 */
export function LevelCompleteMessage({ level }: LevelCompleteMessageProps) {
  return (
    <div className="level-complete-message" role="status" aria-live="polite">
      <span className="level-complete-message__text">שלב {level} הושלם</span>
    </div>
  );
}
