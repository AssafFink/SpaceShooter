import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickWeighted } from '../src/game/random';

describe('pickWeighted', () => {
  afterEach(() => vi.restoreAllMocks());

  it('never returns a zero-weight entry, even at the top of the roll range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999999999999);
    const entries = [
      ['small', 0.55],
      ['medium', 0.3],
      ['large', 0.15],
      ['huge', 0],
    ] as const;
    expect(pickWeighted(entries)).toBe('large');
  });

  it('returns the only positive-weight entry', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(pickWeighted([['a', 0], ['b', 1], ['c', 0]] as const)).toBe('b');
  });
});
