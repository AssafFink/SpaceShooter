import { GAME_CONFIG } from './gameConfig';
import { createEnemy, enemySpeedScale, getEnemyRadius } from './Enemy';
import { pickWeighted, randomInt, randomRange } from './random';
import type { Enemy, EnemySize, GameBounds, LevelConfig, Vector2 } from '../types/game';

const { enemy: enemyConfig } = GAME_CONFIG;

/**
 * Adds enemies gradually over the course of a level (ARCHITECTURE §17).
 * Source: spec/plans/milestone-4.md §4.
 *
 * Receives a `LevelConfig` in `reset()` — the count, speed, intervals and
 * probabilities are rolled from that level's ranges (ARCHITECTURE §19), so
 * the same level looks slightly different between games but stays at the
 * same difficulty.
 */
export class EnemySpawner {
  private config: LevelConfig | null = null;
  private plannedCount = 0;
  private spawnedCount = 0;
  private timeUntilNextSpawnSeconds = 0;
  private nextId = 1;

  /** Resets the counter and timer per the level definition — called on Restart Level and at the start of every level. */
  reset(config: LevelConfig): void {
    this.config = config;
    this.plannedCount = randomInt(config.enemyCountMin, config.enemyCountMax);
    this.spawnedCount = 0;
    this.timeUntilNextSpawnSeconds = GAME_CONFIG.firstSpawnDelaySeconds;
  }

  /** The number of enemies not yet created — feeds into the `enemiesRemaining` calculation. */
  get remainingToSpawn(): number {
    return this.plannedCount - this.spawnedCount;
  }

  /** Whether every planned enemy has already been created. */
  get isFinished(): boolean {
    return this.spawnedCount >= this.plannedCount;
  }

  /** Advances the timer and returns 0 or more new enemies created this frame. */
  update(deltaSeconds: number, bounds: GameBounds, cannonPosition: Vector2): Enemy[] {
    if (!this.config || this.isFinished || bounds.width <= 0) return [];

    this.timeUntilNextSpawnSeconds -= deltaSeconds;
    if (this.timeUntilNextSpawnSeconds > 0) return [];

    this.timeUntilNextSpawnSeconds += randomRange(
      this.config.spawnIntervalMinSeconds,
      this.config.spawnIntervalMaxSeconds,
    );

    return [this.spawnOne(this.config, bounds, cannonPosition)];
  }

  private spawnOne(config: LevelConfig, bounds: GameBounds, cannonPosition: Vector2): Enemy {
    const sizeWeights: ReadonlyArray<readonly [EnemySize, number]> = [
      ['small', config.smallProbability],
      ['medium', config.mediumProbability],
      ['large', config.largeProbability],
    ];
    const size = pickWeighted(sizeWeights);
    const radius = getEnemyRadius(size);
    const margin = enemyConfig.spawnMarginX + radius;
    const x =
      bounds.width > margin * 2
        ? randomRange(margin, bounds.width - margin)
        : bounds.width / 2;
    // Speed is defined per level as px/s, but the on-screen travel distance
    // depends on the game area's height — normalize so Landscape isn't
    // unfairly harder than Portrait (ARCHITECTURE §16; F6).
    const speed =
      randomRange(config.enemySpeedMin, config.enemySpeedMax) * enemySpeedScale(bounds.height);

    this.spawnedCount += 1;
    const id = `enemy-${this.nextId++}`;
    return createEnemy(id, size, { x, y: -radius }, cannonPosition, speed);
  }
}
