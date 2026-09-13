import { describe, expect, it } from 'vitest';
import { detectCannonHit, detectProjectileHits } from '../src/game/CollisionManager';
import { createEnemy } from '../src/game/Enemy';
import type { Projectile } from '../src/types/game';

function projectileAt(id: string, x: number, y: number, prevX: number, prevY: number): Projectile {
  return { id, x, y, prevX, prevY, velocityX: 0, velocityY: 0, active: true };
}

describe('detectProjectileHits (ARCHITECTURE §13, PRD §4.5)', () => {
  it('detects a hit when the projectile is on the enemy at frame end', () => {
    const enemy = createEnemy('e1', 'small', { x: 100, y: 100 }, { x: 100, y: 500 }, 50);
    const projectile = projectileAt('p1', 100, 100, 100, 60);
    const hits = detectProjectileHits([projectile], [enemy]);
    expect(hits).toHaveLength(1);
    expect(hits[0].enemy.id).toBe('e1');
  });

  it('detects a hit via swept collision even when the segment only passes near the enemy', () => {
    const enemy = createEnemy('e1', 'small', { x: 100, y: 100 }, { x: 100, y: 500 }, 50);
    // Projectile travels from well above to well below the enemy in one frame,
    // never resting exactly on it — the fast-projectile case (spec/plans/milestone-3.md §3.3).
    const projectile = projectileAt('p1', 100, 140, 100, 60);
    const hits = detectProjectileHits([projectile], [enemy]);
    expect(hits).toHaveLength(1);
  });

  it('misses when firing at empty space (no enemy near the path)', () => {
    const enemy = createEnemy('e1', 'small', { x: 300, y: 300 }, { x: 300, y: 500 }, 50);
    const projectile = projectileAt('p1', 100, 100, 100, 60);
    const hits = detectProjectileHits([projectile], [enemy]);
    expect(hits).toHaveLength(0);
  });

  it('hits the first enemy in its path, not necessarily the original click target', () => {
    const nearEnemy = createEnemy('near', 'small', { x: 100, y: 80 }, { x: 100, y: 500 }, 50);
    const farEnemy = createEnemy('far', 'small', { x: 100, y: 200 }, { x: 100, y: 500 }, 50);
    // Projectile sweeps from y=60 to y=220, passing through the near enemy first.
    const projectile = projectileAt('p1', 100, 220, 100, 60);
    const hits = detectProjectileHits([projectile], [nearEnemy, farEnemy]);
    expect(hits).toHaveLength(1);
    expect(hits[0].enemy.id).toBe('near');
  });

  it('a single projectile hits at most one enemy', () => {
    const a = createEnemy('a', 'small', { x: 100, y: 100 }, { x: 100, y: 500 }, 50);
    const b = createEnemy('b', 'small', { x: 100, y: 101 }, { x: 100, y: 500 }, 50);
    const projectile = projectileAt('p1', 100, 100, 100, 100);
    const hits = detectProjectileHits([projectile], [a, b]);
    expect(hits).toHaveLength(1);
  });

  it('ignores inactive projectiles and inactive enemies', () => {
    const enemy = createEnemy('e1', 'small', { x: 100, y: 100 }, { x: 100, y: 500 }, 50);
    enemy.active = false;
    const projectile = projectileAt('p1', 100, 100, 100, 100);
    expect(detectProjectileHits([projectile], [enemy])).toHaveLength(0);

    const activeEnemy = createEnemy('e2', 'small', { x: 100, y: 100 }, { x: 100, y: 500 }, 50);
    const inactiveProjectile = { ...projectileAt('p2', 100, 100, 100, 100), active: false };
    expect(detectProjectileHits([inactiveProjectile], [activeEnemy])).toHaveLength(0);
  });
});

describe('detectCannonHit (ARCHITECTURE §21)', () => {
  it('returns true when an enemy is within the combined hit radius', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 10 }, 10);
    enemy.x = 100;
    enemy.y = 100;
    expect(detectCannonHit([enemy], { x: 100, y: 100 }, 30)).toBe(true);
  });

  it('returns false when every enemy is out of range', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 10 }, 10);
    enemy.x = 100;
    enemy.y = 100;
    expect(detectCannonHit([enemy], { x: 500, y: 500 }, 30)).toBe(false);
  });

  it('ignores inactive enemies', () => {
    const enemy = createEnemy('e1', 'small', { x: 0, y: 0 }, { x: 0, y: 10 }, 10);
    enemy.x = 100;
    enemy.y = 100;
    enemy.active = false;
    expect(detectCannonHit([enemy], { x: 100, y: 100 }, 30)).toBe(false);
  });
});
