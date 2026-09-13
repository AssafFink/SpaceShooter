import { createContext } from 'react';

/**
 * ה-Context עצמו, מופרד מ-`SoundContext.tsx` (שמייצא רק את רכיב ה-Provider)
 * כדי ש-React Fast Refresh יעבוד נכון על שני הקבצים.
 * ראו src/context/SoundContext.tsx לתיעוד המלא.
 */
export interface SoundContextValue {
  muted: boolean;
  toggle: () => void;
}

export const SoundContext = createContext<SoundContextValue | null>(null);
