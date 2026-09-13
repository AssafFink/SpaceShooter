import { GAME_CONFIG } from './gameConfig';
import { createEnemy, getEnemyRadius } from './Enemy';
import { pickWeighted, randomInt, randomRange } from './random';
import type { Enemy, EnemySize, GameBounds, LevelConfig, Vector2 } from '../types/game';

const { enemy: enemyConfig } = GAME_CONFIG;

/**
 * מוסיף אויבים בהדרגה לאורך שלב (ARCHITECTURE §17).
 * מקור: spec/plans/milestone-4.md §4.
 *
 * מקבל `LevelConfig` ב-`reset()` — הכמות, המהירות, המרווחים וההסתברויות
 * מוגרלות מתוך הטווחים של אותו שלב (ARCHITECTURE §19), כך שאותו שלב נראה
 * שונה מעט בין משחקים אך נשאר באותה רמת קושי.
 */
export class EnemySpawner {
  private config: LevelConfig | null = null;
  private plannedCount = 0;
  private spawnedCount = 0;
  private timeUntilNextSpawnSeconds = 0;
  private nextId = 1;

  /** מאפס מונה וטיימר לפי הגדרת השלב — נקרא ב-Restart Level ובתחילת כל שלב. */
  reset(config: LevelConfig): void {
    this.config = config;
    this.plannedCount = randomInt(config.enemyCountMin, config.enemyCountMax);
    this.spawnedCount = 0;
    this.timeUntilNextSpawnSeconds = GAME_CONFIG.firstSpawnDelaySeconds;
  }

  /** מספר האויבים שעדיין לא נוצרו — נכנס לחישוב `enemiesRemaining`. */
  get remainingToSpawn(): number {
    return this.plannedCount - this.spawnedCount;
  }

  /** האם כל האויבים המתוכננים כבר נוצרו. */
  get isFinished(): boolean {
    return this.spawnedCount >= this.plannedCount;
  }

  /** מקדם את הטיימר ומחזיר 0 או יותר אויבים חדשים שנוצרו בפריים הזה. */
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
    const speed = randomRange(config.enemySpeedMin, config.enemySpeedMax);

    this.spawnedCount += 1;
    const id = `enemy-${this.nextId++}`;
    return createEnemy(id, size, { x, y: -radius }, cannonPosition, speed);
  }
}
