import './LevelCompleteMessage.css';

interface LevelCompleteMessageProps {
  level: number;
}

/**
 * "Level X complete" message — a React Overlay above the Canvas (not a Canvas drawing).
 * Source: spec/ARCHITECTURE.md §20, §41; spec/PRD.md §4.10.
 *
 * Shown for as long as `status === 'level-complete'` (GamePage); the
 * automatic transition to the next level is timed in GameEngine, not in
 * this component. Transition Polish — Milestone 7.
 */
export function LevelCompleteMessage({ level }: LevelCompleteMessageProps) {
  return (
    <div className="level-complete-message" role="status" aria-live="polite">
      <span className="level-complete-message__text">שלב {level} הושלם</span>
    </div>
  );
}
