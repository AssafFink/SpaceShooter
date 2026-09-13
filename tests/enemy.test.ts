import { describe, expect, it } from 'vitest';
import {
  applyHit,
  clampEnemyToBounds,
  createEnemy,
  enemySpeedScale,
  getEnemyRadius,
  isDestroyed,
  pushEnemyOutsideRadius,
  retargetEnemy,
  updateEnemy,
} from '../src/game/Enemy';

describe('Enemy — hit points & score by size (ARCHITECTURE §15, PRD §4.6)', () => {
  it.each([
    ['small', 1, 1],
    ['medium', 2, 2],
    ['large', 3, 3],
  ] as const)('%s enemy requires %d hit(s) and is worth %d point(s)', (size, hits, score) => {
    const enemy = createEnemy('e1', size, { x: 100, y: 0 }, { x: 100, y: 500 }, 50);
    expect(enemy.hitPoints).toBe(hits);
    expect(enemy.maxHitPoints).toBe(hits);
    expect(enemy.scoreValue).toBe(score);

    for (let i = 0; i < hits - 1; i++) {
      applyHit(enemy);
      expect(isDestroyed(enemy)).toBe(false);
    }
    applyHit(enemy);
    expect(isDestroyed(enemy)).toBe(true);
  });
});

describe('createEnemy — direction & movement', () => {
  it('moves roughly toward the target (near-straight line, ARCHITECTURE §16)', () => {
    const origin = { x: 200, y: 0 };
    const target = { x: 200, y: 600 };
    const enemy = createEnemy('e1', 'small', origin, target, 100);
    const speed = Math.hypot(enemy.velocityX, enemy.velocityY);
    expect(speed).toBeCloseTo(100, 5);
    // Straight down: velocityY should dominate, velocityX small (jitter-bounded).
    expect(enemy.velocityY).toBeGreaterThan(0);
    expect(Math.abs(enemy.velocityX)).toBeLessThan(enemy.velocityY);
  });

  it('does not track the target after spawn (no homing)', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 50);
    const initialVelocity = { x: enemy.velocityX, y: enemy.velocityY };
    updateEnemy(enemy, 0.5);
    expect(enemy.velocityX).toBe(initialVelocity.x);
    expect(enemy.velocityY).toBe(initialVelocity.y);
  });
});

describe('clampEnemyToBounds', () => {
  it('keeps the enemy within [radius, width - radius]', () => {
    const enemy = createEnemy('e1', 'small', { x: -50, y: 0 }, { x: 0, y: 100 }, 10);
    clampEnemyToBounds(enemy, { width: 300, height: 500 });
    const radius = getEnemyRadius('small');
    expect(enemy.x).toBeGreaterThanOrEqual(radius - 0.01);
    expect(enemy.x).toBeLessThanOrEqual(300);
  });
});

describe('retargetEnemy (F3 — orientation change)', () => {
  it('re-aims toward the new target while preserving speed magnitude by default', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 80);
    const originalSpeed = Math.hypot(enemy.velocityX, enemy.velocityY);
    retargetEnemy(enemy, { x: 500, y: 0 });
    expect(Math.hypot(enemy.velocityX, enemy.velocityY)).toBeCloseTo(originalSpeed, 5);
    // Now aimed to the right (positive X), not downward.
    expect(enemy.velocityX).toBeGreaterThan(0);
  });

  it('accepts an explicit speed override (used to rescale on resize, F6)', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 80);
    retargetEnemy(enemy, { x: 100, y: 100 }, 40);
    expect(Math.hypot(enemy.velocityX, enemy.velocityY)).toBeCloseTo(40, 5);
  });

  it('leaves velocity untouched when the given speed is zero', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 80);
    const before = { x: enemy.velocityX, y: enemy.velocityY };
    retargetEnemy(enemy, { x: 999, y: 999 }, 0);
    expect(enemy.velocityX).toBe(before.x);
    expect(enemy.velocityY).toBe(before.y);
  });
});

describe('pushEnemyOutsideRadius (F3 — resize must never cost a life)', () => {
  it('leaves an enemy untouched when already far enough away', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 10);
    enemy.x = 500;
    enemy.y = 500;
    pushEnemyOutsideRadius(enemy, { x: 0, y: 0 }, 50);
    expect(enemy.x).toBe(500);
    expect(enemy.y).toBe(500);
  });

  it('pushes an enemy outward to exactly minDistance when too close', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 10);
    enemy.x = 10;
    enemy.y = 0;
    pushEnemyOutsideRadius(enemy, { x: 0, y: 0 }, 50);
    expect(Math.hypot(enemy.x, enemy.y)).toBeCloseTo(50, 5);
  });

  it('pushes straight up when exactly on top of the center', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 100 }, 10);
    enemy.x = 0;
    enemy.y = 0;
    pushEnemyOutsideRadius(enemy, { x: 0, y: 0 }, 30);
    expect(enemy.x).toBe(0);
    expect(enemy.y).toBe(-30);
  });
});

describe('enemySpeedScale (F6 — height normalization)', () => {
  it('returns 1 at the reference height (640px)', () => {
    expect(enemySpeedScale(640)).toBeCloseTo(1, 5);
  });

  it('scales down for a short Landscape screen, clamped at the floor', () => {
    expect(enemySpeedScale(280)).toBeGreaterThanOrEqual(0.5);
    expect(enemySpeedScale(280)).toBeLessThan(1);
    expect(enemySpeedScale(1)).toBe(0.5);
  });

  it('scales up for a tall screen, clamped at the ceiling', () => {
    expect(enemySpeedScale(2000)).toBe(1.2);
  });
});
