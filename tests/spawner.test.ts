import { describe, expect, it } from 'vitest';
import { EnemySpawner } from '../src/game/EnemySpawner';
import { GAME_CONFIG, LEVELS } from '../src/game/gameConfig';
import { mockRandom } from './helpers';

const bounds = { width: 400, height: 640 };
const cannon = { x: 200, y: 600 };

describe('EnemySpawner (ARCHITECTURE §17-19)', () => {
  it('plans a count within [enemyCountMin, enemyCountMax] for the level', () => {
    const level = LEVELS[0]; // enemyCountMin: 4, enemyCountMax: 6
    for (let trial = 0; trial < 20; trial++) {
      const spawner = new EnemySpawner();
      spawner.reset(level);
      expect(spawner.remainingToSpawn).toBeGreaterThanOrEqual(level.enemyCountMin);
      expect(spawner.remainingToSpawn).toBeLessThanOrEqual(level.enemyCountMax);
    }
  });

  it('spawns gradually, not all at once', () => {
    const level = LEVELS[0];
    const spawner = new EnemySpawner();
    spawner.reset(level);
    const planned = spawner.remainingToSpawn;

    // Just past the first-spawn delay: at most one enemy should have appeared.
    const firstBatch = spawner.update(GAME_CONFIG.firstSpawnDelaySeconds + 0.01, bounds, cannon);
    expect(firstBatch.length).toBeLessThanOrEqual(1);
    expect(spawner.remainingToSpawn).toBeGreaterThan(0);
    expect(spawner.remainingToSpawn).toBeLessThan(planned);
  });

  it('eventually spawns exactly the planned count and then stops', () => {
    const level = LEVELS[0];
    const spawner = new EnemySpawner();
    spawner.reset(level);
    const planned = spawner.remainingToSpawn;

    let spawned = 0;
    for (let i = 0; i < 2000 && !spawner.isFinished; i++) {
      spawned += spawner.update(0.05, bounds, cannon).length;
    }
    expect(spawned).toBe(planned);
    expect(spawner.isFinished).toBe(true);
    expect(spawner.remainingToSpawn).toBe(0);
    // No further enemies once finished.
    expect(spawner.update(1, bounds, cannon)).toHaveLength(0);
  });

  it('spawns enemies within the horizontal margin, inside the bounds', () => {
    const level = LEVELS[9]; // hardest level — widest speed/type range
    const spawner = new EnemySpawner();
    spawner.reset(level);
    const enemies = [];
    for (let i = 0; i < 500 && !spawner.isFinished; i++) {
      enemies.push(...spawner.update(0.05, bounds, cannon));
    }
    expect(enemies.length).toBeGreaterThan(0);
    for (const enemy of enemies) {
      expect(enemy.x).toBeGreaterThan(0);
      expect(enemy.x).toBeLessThan(bounds.width);
      expect(enemy.y).toBeLessThanOrEqual(0);
    }
  });

  it('applies the height-based speed scale (F6) on top of the level speed range', () => {
    const level = LEVELS[0]; // enemySpeedMin: 30, enemySpeedMax: 45
    // An all-zero Math.random() sequence makes every randomRange()/randomInt()
    // call resolve to its minimum — including enemySpeedMin (30) — so the
    // only remaining unknown in the final velocity magnitude is the height
    // scale itself.
    const random = mockRandom([0]);
    try {
      const spawner = new EnemySpawner();
      spawner.reset(level);
      const shortBounds = { width: 400, height: 280 }; // Landscape — scale clamped to 0.5
      const [enemy] = spawner.update(GAME_CONFIG.firstSpawnDelaySeconds + 0.01, shortBounds, cannon);
      const speed = Math.hypot(enemy.velocityX, enemy.velocityY);
      expect(speed).toBeCloseTo(level.enemySpeedMin * 0.5, 3);
    } finally {
      random.restore();
    }
  });
});
