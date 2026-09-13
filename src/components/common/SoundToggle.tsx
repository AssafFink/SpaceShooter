import { useSound } from '../../hooks/useSound';
import './SoundToggle.css';

interface SoundToggleProps {
  className?: string;
}

/**
 * Shared Sound On / Sound Off icon — Milestone 5.
 * Source: spec/PRD.md §4.18, spec/ARCHITECTURE.md §32, §55 (aria-label for the icon).
 *
 * Shown both in `Navigation` (non-game screens) and in `GameHud` (game
 * screen) — both consume the same `SoundContext`, so the mute state is
 * shared across the whole app. In M5 this is UI + State only: swapping the
 * icon, with no real audio yet (Milestone 7).
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
