import { useContext } from 'react';
import { SoundContext } from '../context/soundContextValue';
import type { SoundContextValue } from '../context/soundContextValue';

/** גישה ל-`SoundContext` (Milestone 5) — ראו src/context/SoundContext.tsx. */
export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound חייב לשמש בתוך SoundProvider');
  }
  return context;
}
