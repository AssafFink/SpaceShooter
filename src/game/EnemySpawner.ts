import { GAME_CONFIG } from './gameConfig';
import { createEnemy, getEnemyRadius } from './Enemy';
import { pickWeighted, randomRange } from './random';
import type { Enemy, EnemySize, GameBounds, Vector2 } from '../types/game';

const { prototypeWave: config, enemy: enemyConfig } = GAME_CONFIG;

const SIZE_WEIGHTS: ReadonlyArray<readonly [EnemySize, number]> = [
  ['small', config.smallProbability],
  ['medium', config.mediumProbability],
  ['large', config.largeProbability],
];

/**
 * מוסיף אויבים בהדרגה לאורך גל (ARCHITECTURE §17).
 * מקור: spec/plans/milestone-3.md §5.
 *
 * Milestone 3: גל Prototype יחיד מתוך `GAME_CONFIG.prototypeWave`.
 * Milestone 4: יוחלף ב-Level Configuration (`§18`) — ה-API (reset/update) נשאר זהה.
 */
export class EnemySpawner {
  private plannedCount = 0;
  private spawnedCount = 0;
  private timeUntilNextSpawnSeconds = 0;
  private nextId = 1;

  /** מאפס מונה וטיימר — Milestone 4 ישתמש בזה ב-Restart Level ובתחילת כל שלב. */
  reset(): void {
    this.plannedCount = config.enemyCount;
    this.spawnedCount = 0;
    this.timeUntilNextSpawnSeconds = config.firstSpawnDelaySeconds;
  }

  /** מספר האויבים שעדיין לא נוצרו (Milestone 3 §1 — נכנס לחישוב `enemiesRemaining`). */
  get remainingToSpawn(): number {
    return this.plannedCount - this.spawnedCount;
  }

  /** האם כל האויבים המתוכננים כבר נוצרו. */
  get isFinished(): boolean {
    return this.spawnedCount >= this.plannedCount;
  }

  /** מקדם את הטיימר ומחזיר 0 או יותר אויבים חדשים שנוצרו בפריים הזה. */
  update(deltaSeconds: number, bounds: GameBounds, cannonPosition: Vector2): Enemy[] {
    if (this.isFinished || bounds.width <= 0) return [];

    this.timeUntilNextSpawnSeconds -= deltaSeconds;
    if (this.timeUntilNextSpawnSeconds > 0) return [];

    this.timeUntilNextSpawnSeconds += randomRange(
      config.spawnIntervalMinSeconds,
      config.spawnIntervalMaxSeconds,
    );

    return [this.spawnOne(bounds, cannonPosition)];
  }

  private spawnOne(bounds: GameBounds, cannonPosition: Vector2): Enemy {
    const size = pickWeighted(SIZE_WEIGHTS);
    const radius = getEnemyRadius(size);
    const margin = enemyConfig.spawnMarginX + radius;
    const x =
      bounds.width > margin * 2
        ? randomRange(margin, bounds.width - margin)
        : bounds.width / 2;
    const speed = randomRange(config.speedMin, config.speedMax);

    this.spawnedCount += 1;
    const id = `enemy-${this.nextId++}`;
    return createEnemy(id, size, { x, y: -radius }, cannonPosition, speed);
  }
}
