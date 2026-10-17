import { useEffect } from 'react';
import { audioService } from '../services/audioService';

/**
 * App-wide audio lifecycle — Milestone 7. Mounted once, high in the tree
 * (App.tsx), so background music spans route changes (spec/ARCHITECTURE.md
 * §31); the music itself lives in `audioService`, not in any React component,
 * and is started/stopped by GamePage.
 *
 * Handles browser autoplay policy: audio is unlocked on the first user
 * gesture (§31) and the listener removes itself. There is no mute — sound is
 * always on.
 */
export function useAudio(): void {
  useEffect(() => {
    const unlock = () => audioService.unlock();
    // `once` auto-removes after the first gesture; the cleanup covers the case
    // where the component unmounts (or StrictMode remounts) before it fires.
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // Suspend synthesized audio while the tab/PWA is backgrounded (screen
  // locked, app switched away) — otherwise background music keeps playing
  // even though the game itself is frozen (rAF paused). Milestone 9,
  // spec/plans/milestone-9.md §1 (F7).
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        audioService.suspend();
      } else {
        audioService.resume();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}
