import { useContext } from 'react';
import { SoundContext } from '../context/soundContextValue';
import type { SoundContextValue } from '../context/soundContextValue';

/** Access to `SoundContext` (Milestone 5) — see src/context/SoundContext.tsx. */
export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
