import { createContext } from 'react';

/**
 * The Context itself, separated from `SoundContext.tsx` (which exports only
 * the Provider component) so React Fast Refresh works correctly on both files.
 * See src/context/SoundContext.tsx for full documentation.
 */
export interface SoundContextValue {
  muted: boolean;
  toggle: () => void;
}

export const SoundContext = createContext<SoundContextValue | null>(null);
