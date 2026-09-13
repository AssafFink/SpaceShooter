import { describe, expect, it } from 'vitest';
import { GAME_CONFIG, LEVELS } from '../src/game/gameConfig';

const { enemyTypes } = GAME_CONFIG;

/** Expected hit points for a random enemy under a level's size probabilities. */
function expectedHitPoints(level: (typeof LEVELS)[number]): number {
  return (
    level.smallProbability * enemyTypes.small.hitPoints +
    level.mediumProbability * enemyTypes.medium.hitPoints +
    level.largeProbability * enemyTypes.large.hitPoints
  );
}

describe('LEVELS — shape (ARCHITECTURE §18, PRD §4.9)', () => {
  it('defines exactly 10 levels, numbered 1..10 in order', () => {
    expect(LEVELS).toHaveLength(GAME_CONFIG.totalLevels);
    LEVELS.forEach((level, index) => expect(level.level).toBe(index + 1));
  });

  it('has min <= max for every range in every level', () => {
    for (const level of LEVELS) {
      expect(level.enemyCountMin).toBeLessThanOrEqual(level.enemyCountMax);
      expect(level.spawnIntervalMinSeconds).toBeLessThanOrEqual(level.spawnIntervalMaxSeconds);
      expect(level.enemySpeedMin).toBeLessThanOrEqual(level.enemySpeedMax);
    }
  });

  it('has size probabilities that sum to 1 for every level', () => {
    for (const level of LEVELS) {
      const sum = level.smallProbability + level.mediumProbability + level.largeProbability;
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});

describe('LEVELS — monotonic difficulty (PRD §4.9: gradually increasing)', () => {
  it('never makes a level easier than the one before it, on any axis', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const prev = LEVELS[i - 1];
      const curr = LEVELS[i];
      expect(curr.enemyCountMax).toBeGreaterThanOrEqual(prev.enemyCountMax);
      expect(curr.enemySpeedMax).toBeGreaterThanOrEqual(prev.enemySpeedMax);
      // Shorter spawn interval = harder (more enemies on screen at once).
      expect(curr.spawnIntervalMaxSeconds).toBeLessThanOrEqual(prev.spawnIntervalMaxSeconds);
      expect(expectedHitPoints(curr)).toBeGreaterThanOrEqual(expectedHitPoints(prev) - 1e-9);
    }
  });
});

describe('LEVELS — child-friendly difficulty ceiling (PRD §4.9, §5; F6 tuning)', () => {
  it('never demands more than 1.8 hits per second even on the hardest level, at the fastest normalized speed', () => {
    const hardest = LEVELS[LEVELS.length - 1];
    const avgInterval = (hardest.spawnIntervalMinSeconds + hardest.spawnIntervalMaxSeconds) / 2;
    const requiredHitsPerSecond = expectedHitPoints(hardest) / avgInterval;
    expect(requiredHitsPerSecond).toBeLessThanOrEqual(1.8);
  });

  it('gives an enemy at least 6 seconds to cross the reference game area, even at max speed', () => {
    for (const level of LEVELS) {
      const travelSeconds = GAME_CONFIG.enemy.referenceHeight / level.enemySpeedMax;
      expect(travelSeconds).toBeGreaterThanOrEqual(6);
    }
  });
});
