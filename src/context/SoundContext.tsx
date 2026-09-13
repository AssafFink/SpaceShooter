import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getSoundMuted, setSoundMuted } from '../services/storageService';
import { SoundContext } from './soundContextValue';
import type { SoundContextValue } from './soundContextValue';

/**
 * The app's global mute state — Milestone 5, persistence from Milestone 6.
 * Source: spec/ARCHITECTURE.md §32 (a single `soundMuted` State), §33 (Sound
 * Persistence), §50 (Context where needed).
 *
 * The initial value is loaded from `storageService.getSoundMuted()`
 * (default: unmuted if no value is saved / the value is corrupt), and
 * `toggle()` saves the new value via `setSoundMuted()`. Milestone 7:
 * `useAudio` (composed in `App`) listens to `muted` and applies it to
 * `audioService` in practice (music + effects). The Context remains the
 * single source of truth for the mute state, and the components that
 * consume it (`SoundToggle`, `GameHud`, `Navigation`) are unchanged.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState<boolean>(() => getSoundMuted());

  const value = useMemo<SoundContextValue>(
    () => ({
      muted,
      toggle: () =>
        setMuted((prev) => {
          const next = !prev;
          setSoundMuted(next);
          return next;
        }),
    }),
    [muted],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
