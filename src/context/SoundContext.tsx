import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SoundContext } from './soundContextValue';
import type { SoundContextValue } from './soundContextValue';

/**
 * מצב ההשתקה הגלובלי של האפליקציה — Milestone 5.
 * מקור: spec/ARCHITECTURE.md §32 (State יחיד `soundMuted`), §50 (Context כשנדרש).
 *
 * ב-M5 זהו State בזיכרון בלבד (ברירת מחדל: לא מושתק). **הכנה ל-המשך, בלי
 * לממש עכשיו:**
 * - Milestone 6 יאתחל את הערך ההתחלתי מ-`storageService.getSoundMuted()`
 *   ו-`toggle()` יקרא גם ל-`setSoundMuted()` (persistence).
 * - Milestone 7 יוסיף Audio Service שמאזין ל-`muted` ומשתיק/מפעיל בפועל
 *   מוזיקה ואפקטים.
 * הרכיבים הצורכים את ה-Context (`SoundToggle`, `GameHud`, `Navigation`)
 * לא ישתנו כאשר שכבות אלה יתווספו.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);

  const value = useMemo<SoundContextValue>(
    () => ({ muted, toggle: () => setMuted((prev) => !prev) }),
    [muted],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
