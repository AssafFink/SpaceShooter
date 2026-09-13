import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getSoundMuted, setSoundMuted } from '../services/storageService';
import { SoundContext } from './soundContextValue';
import type { SoundContextValue } from './soundContextValue';

/**
 * מצב ההשתקה הגלובלי של האפליקציה — Milestone 5, persistence מ-Milestone 6.
 * מקור: spec/ARCHITECTURE.md §32 (State יחיד `soundMuted`), §33 (Sound
 * Persistence), §50 (Context כשנדרש).
 *
 * הערך ההתחלתי נטען מ-`storageService.getSoundMuted()` (ברירת מחדל: לא
 * מושתק אם אין ערך שמור/הערך פגום), ו-`toggle()` שומר את הערך החדש דרך
 * `setSoundMuted()`. Milestone 7: `useAudio` (מורכב ב-`App`) מאזין ל-`muted`
 * ומחיל אותו על `audioService` בפועל (מוזיקה + אפקטים). ה-Context נשאר מקור
 * האמת היחיד למצב ההשתקה, והרכיבים הצורכים אותו (`SoundToggle`, `GameHud`,
 * `Navigation`) לא השתנו.
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
