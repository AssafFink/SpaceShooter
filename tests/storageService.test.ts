import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSoundMuted, getStatistics, saveGameResult, setSoundMuted } from '../src/services/storageService';
import { createMemoryStorage } from './helpers';

// storageService reads the `localStorage` global at call time (ARCHITECTURE
// §49), so stubbing the global before each test is enough — no module
// reset needed. Each test starts from a clean, isolated in-memory store.
beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('storageService — statistics (ARCHITECTURE §27-28, PRD §4.15)', () => {
  it('returns an empty array when nothing was saved yet', () => {
    expect(getStatistics()).toEqual([]);
  });

  it('saves a win result', () => {
    saveGameResult({ result: 'win', finalScore: 42, levelReached: 10 });
    const results = getStatistics();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ result: 'win', finalScore: 42, levelReached: 10 });
    expect(typeof results[0].id).toBe('string');
    expect(results[0].id.length).toBeGreaterThan(0);
    expect(new Date(results[0].date).toString()).not.toBe('Invalid Date');
  });

  it('saves a loss result', () => {
    saveGameResult({ result: 'loss', finalScore: 7, levelReached: 3 });
    expect(getStatistics()[0]).toMatchObject({ result: 'loss', finalScore: 7, levelReached: 3 });
  });

  it('appends results in save order (oldest first) — callers reverse for display', () => {
    saveGameResult({ result: 'loss', finalScore: 1, levelReached: 1 });
    saveGameResult({ result: 'win', finalScore: 2, levelReached: 10 });
    const results = getStatistics();
    expect(results.map((r) => r.finalScore)).toEqual([1, 2]);
  });

  it('falls back to [] for corrupt JSON in localStorage', () => {
    localStorage.setItem('spaceShooter.statistics', '{not valid json');
    expect(getStatistics()).toEqual([]);
  });

  it('falls back to [] when the stored value is not an array', () => {
    localStorage.setItem('spaceShooter.statistics', JSON.stringify({ oops: true }));
    expect(getStatistics()).toEqual([]);
  });

  it('filters out malformed entries but keeps valid ones', () => {
    localStorage.setItem(
      'spaceShooter.statistics',
      JSON.stringify([
        { id: 'ok', date: '2026-01-01T00:00:00.000Z', finalScore: 5, levelReached: 2, result: 'win' },
        { id: 'bad', finalScore: 'not-a-number' },
        null,
        { id: 'bad-result', date: '2026-01-01T00:00:00.000Z', finalScore: 1, levelReached: 1, result: 'draw' },
      ]),
    );
    const results = getStatistics();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('ok');
  });

  it('does not crash when localStorage throws (private mode / quota / disabled)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new DOMException('blocked');
      },
      setItem: () => {
        throw new DOMException('blocked');
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage);
    expect(getStatistics()).toEqual([]);
    expect(() => saveGameResult({ result: 'win', finalScore: 1, levelReached: 1 })).not.toThrow();
  });

  it('still saves a result when crypto.randomUUID is unavailable (F2 — non-secure context)', () => {
    const originalRandomUUID = crypto.randomUUID;
    // Simulate a browser context where crypto.randomUUID throws (e.g. a
    // plain http:// LAN address, which is not a Secure Context).
    crypto.randomUUID = () => {
      throw new DOMException('randomUUID requires a secure context');
    };
    try {
      saveGameResult({ result: 'win', finalScore: 3, levelReached: 2 });
      const results = getStatistics();
      expect(results).toHaveLength(1);
      expect(typeof results[0].id).toBe('string');
      expect(results[0].id.length).toBeGreaterThan(0);
    } finally {
      crypto.randomUUID = originalRandomUUID;
    }
  });
});

describe('storageService — sound preference (ARCHITECTURE §32-33)', () => {
  it('defaults to unmuted (false) when nothing was saved', () => {
    expect(getSoundMuted()).toBe(false);
  });

  it('persists the mute preference across reads', () => {
    setSoundMuted(true);
    expect(getSoundMuted()).toBe(true);
    setSoundMuted(false);
    expect(getSoundMuted()).toBe(false);
  });

  it('falls back to false for corrupt stored value', () => {
    localStorage.setItem('spaceShooter.soundMuted', 'not-json{{');
    expect(getSoundMuted()).toBe(false);
  });
});
