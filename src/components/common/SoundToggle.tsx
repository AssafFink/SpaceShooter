import { useSound } from '../../hooks/useSound';
import './SoundToggle.css';

interface SoundToggleProps {
  className?: string;
}

/**
 * אייקון Sound On / Sound Off משותף — Milestone 5.
 * מקור: spec/PRD.md §4.18, spec/ARCHITECTURE.md §32, §55 (aria-label לאייקון).
 *
 * מוצג הן ב-`Navigation` (מסכים שאינם משחק) והן ב-`GameHud` (מסך משחק) —
 * שניהם צורכים את אותו `SoundContext`, כך שמצב ההשתקה משותף לכל האפליקציה.
 * ב-M5 מדובר ב-UI + State בלבד: החלפת אייקון, ללא אודיו בפועל (Milestone 7).
 */
export function SoundToggle({ className }: SoundToggleProps) {
  const { muted, toggle } = useSound();
  const classes = ['sound-toggle', className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? 'הפעלת הקול' : 'השתקת הקול'}
    >
      <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
    </button>
  );
}
