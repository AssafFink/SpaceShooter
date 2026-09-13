import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/game/GameEngine';
import { GAME_CONFIG } from '../src/game/gameConfig';
import { createEnemy, getHitRadius } from '../src/game/Enemy';
import { createFakeCanvas, forceSpawnerFinished, internals, stepFrames } from './helpers';

describe('GameEngine — new game (ARCHITECTURE §9, §64)', () => {
  it('starts at level 1 with max lives and zero score', () => {
    const engine = new GameEngine(createFakeCanvas());
    const state = internals(engine);
    expect(state.currentLevel).toBe(1);
    expect(state.lives).toBe(GAME_CONFIG.maxLives);
    expect(state.score).toBe(0);
    expect(state.status).toBe('playing');
  });
});

describe('GameEngine — combat & score (ARCHITECTURE §13, PRD §4.7)', () => {
  it('destroys a stationary enemy hit by a projectile and awards its score', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);

    const enemy = createEnemy('e1', 'small', { x: 200, y: 300 }, { x: 200, y: 300 }, 0);
    state.enemies.push(enemy);
    state.projectiles.push({
      id: 'p1',
      x: 200,
      y: 300,
      prevX: 200,
      prevY: 300,
      velocityX: 0,
      velocityY: 0,
      active: true,
    });

    state.update(1 / 60);

    expect(state.score).toBe(1);
    expect(state.enemies.find((e) => e.id === 'e1')).toBeUndefined();
    expect(state.explosions.length).toBeGreaterThan(0);
    expect(state.status).toBe('playing');
  });
});

describe('GameEngine — lives & cannon collision (ARCHITECTURE §21-22, PRD §4.8)', () => {
  it('loses at most one life even if multiple enemies reach the cannon in the same frame', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    const cannonPosition = { x: state.cannon.x, y: state.cannon.y };
    state.enemies.push(
      createEnemy('e1', 'small', cannonPosition, cannonPosition, 0),
      createEnemy('e2', 'small', cannonPosition, cannonPosition, 0),
    );

    state.update(1 / 60);

    expect(state.lives).toBe(GAME_CONFIG.maxLives - 1);
    expect(state.status).toBe('player-hit');
  });

  it('explodes the cannon, then restarts the level preserving score/lives after the delay', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    state.score = 9;
    const cannonPosition = { x: state.cannon.x, y: state.cannon.y };
    state.enemies.push(createEnemy('e1', 'small', cannonPosition, cannonPosition, 0));

    state.update(1 / 60);
    expect(state.status).toBe('player-hit');
    expect(state.lives).toBe(GAME_CONFIG.maxLives - 1);
    expect(state.score).toBe(9);
    expect(state.explosions.length).toBeGreaterThan(0);

    stepFrames(engine, GAME_CONFIG.cannonExplosionDurationSeconds + 0.05);

    expect(state.status).toBe('playing');
    expect(state.score).toBe(9);
    expect(state.lives).toBe(GAME_CONFIG.maxLives - 1);
    expect(state.currentLevel).toBe(1);
    expect(state.enemies).toHaveLength(0);
  });

  it('ends the game in loss once lives reach zero', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    state.lives = 1;
    const cannonPosition = { x: state.cannon.x, y: state.cannon.y };
    state.enemies.push(createEnemy('e1', 'small', cannonPosition, cannonPosition, 0));

    state.update(1 / 60);
    stepFrames(engine, GAME_CONFIG.cannonExplosionDurationSeconds + 0.05);

    expect(state.lives).toBe(0);
    expect(state.status).toBe('lost');
  });
});

describe('GameEngine — level & game completion (ARCHITECTURE §20, §24)', () => {
  it('shows level-complete once all enemies are spawned and cleared, then advances after the delay', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    state.score = 7;
    forceSpawnerFinished(engine);
    state.enemies = [];

    state.update(1 / 60);
    expect(state.status).toBe('level-complete');
    expect(state.currentLevel).toBe(1);
    expect(state.score).toBe(7);

    stepFrames(engine, GAME_CONFIG.levelCompleteDelaySeconds - 0.1);
    expect(state.status).toBe('level-complete');

    stepFrames(engine, 0.2);
    expect(state.status).toBe('playing');
    expect(state.currentLevel).toBe(2);
    expect(state.score).toBe(7);
    expect(state.lives).toBe(GAME_CONFIG.maxLives);
  });

  it('wins the game after completing level 10', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    state.currentLevel = GAME_CONFIG.totalLevels;
    forceSpawnerFinished(engine);
    state.enemies = [];

    state.update(1 / 60);

    expect(state.status).toBe('won');
  });
});

describe('GameEngine — shoot() (ARCHITECTURE §12)', () => {
  it('ignores shoot() while the game is not in "playing" status', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(400, 640);
    const state = internals(engine);
    state.status = 'won';

    engine.shoot(200, 300);

    expect(state.projectiles).toHaveLength(0);
  });
});

describe('GameEngine — resize / orientation change (ARCHITECTURE §35-36, F3/F4/F6)', () => {
  it('preserves score, lives and level across a resize', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(390, 844);
    const state = internals(engine);
    state.score = 12;
    state.lives = 2;
    state.currentLevel = 5;

    engine.resize(844, 390);

    expect(state.score).toBe(12);
    expect(state.lives).toBe(2);
    expect(state.currentLevel).toBe(5);
    expect(state.status).toBe('playing');
  });

  it('never leaves an active enemy inside the cannon hit radius after resize (no free hit)', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(390, 844);
    const state = internals(engine);
    // Sitting right where the OLD cannon was — a naive resize (just clamping
    // X) would leave this on top of the NEW cannon after rotating to a much
    // shorter Landscape canvas.
    const enemy = createEnemy('e1', 'medium', { x: 195, y: 800 }, { x: 195, y: 800 }, 40);
    state.enemies.push(enemy);

    engine.resize(844, 390);

    expect(state.status).toBe('playing');
    const repositioned = state.enemies.find((e) => e.id === 'e1')!;
    expect(repositioned).toBeDefined();
    const distance = Math.hypot(
      repositioned.x - state.cannon.x,
      repositioned.y - state.cannon.y,
    );
    const minSafeDistance =
      GAME_CONFIG.cannon.hitRadius + getHitRadius('medium') + GAME_CONFIG.enemy.resizeSafetyMargin;
    expect(distance).toBeGreaterThanOrEqual(minSafeDistance - 0.5);
  });

  it('re-aims repositioned enemies toward the new cannon position', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(390, 844);
    const state = internals(engine);
    const enemy = createEnemy('e1', 'small', { x: 50, y: 50 }, { x: 50, y: 50 }, 60);
    state.enemies.push(enemy);

    engine.resize(844, 390);

    const repositioned = state.enemies.find((e) => e.id === 'e1')!;
    const angleToCannon = Math.atan2(
      state.cannon.y - repositioned.y,
      state.cannon.x - repositioned.x,
    );
    const velocityAngle = Math.atan2(repositioned.velocityY, repositioned.velocityX);
    expect(Math.abs(angleToCannon - velocityAngle)).toBeLessThan(0.01);
  });

  it('clears in-flight projectiles on resize', () => {
    const engine = new GameEngine(createFakeCanvas());
    engine.resize(390, 844);
    const state = internals(engine);
    state.projectiles.push({
      id: 'p1',
      x: 100,
      y: 100,
      prevX: 100,
      prevY: 100,
      velocityX: 0,
      velocityY: -900,
      active: true,
    });

    engine.resize(844, 390);

    expect(state.projectiles).toHaveLength(0);
  });

  it('does not draw a blank frame while paused (renders once on resize, F4)', () => {
    const engine = new GameEngine(createFakeCanvas());
    // The fake context accepts any draw call as a no-op; this only verifies
    // resize() does not throw when it renders immediately.
    expect(() => engine.resize(390, 844)).not.toThrow();
  });
});
