import type { GameEngine } from '../src/game/GameEngine';
import type {
  Enemy,
  Explosion,
  GameBounds,
  GameStatus,
  Projectile,
} from '../src/types/game';

/**
 * Shared test helpers for the game engine unit tests — Milestone 9,
 * spec/plans/milestone-9.md §2.2.
 */

/**
 * A `CanvasRenderingContext2D` stand-in for Node: every method call is a
 * no-op and every property write is accepted, so `Renderer`'s real draw
 * calls (fillRect, arc, drawImage, save/restore, …) run harmlessly without
 * hand-listing the whole Canvas API. `GameEngine.resize()` also calls
 * `ctx.setTransform` directly — covered the same way.
 */
function createFakeContext(): CanvasRenderingContext2D {
  return new Proxy(
    {},
    {
      get: () => () => undefined,
      set: () => true,
    },
  ) as unknown as CanvasRenderingContext2D;
}

/** A minimal `HTMLCanvasElement` stand-in — just enough for `new GameEngine(canvas)`. */
export function createFakeCanvas(width = 400, height = 640): HTMLCanvasElement {
  const ctx = createFakeContext();
  return {
    width,
    height,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
}

/**
 * Narrow, test-only view into `GameEngine`'s private state. TypeScript's
 * `private` is compile-time only, and bracket/element access is exempt from
 * the private-access check, so this cast is the sanctioned way to reach into
 * the engine without changing its public API for production code.
 */
export interface GameEngineInternals {
  bounds: GameBounds;
  score: number;
  lives: number;
  currentLevel: number;
  status: GameStatus;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  cannon: { x: number; y: number };
  spawner: { spawnedCount: number; plannedCount: number; isFinished: boolean; remainingToSpawn: number };
  update(deltaSeconds: number): void;
  render(): void;
}

export function internals(engine: GameEngine): GameEngineInternals {
  return engine as unknown as GameEngineInternals;
}

/**
 * Fast-forwards the engine's real `EnemySpawner` to "all planned enemies for
 * this level already spawned" without waiting out the level in simulated
 * time — used to test the level-complete/win transitions in isolation.
 */
export function forceSpawnerFinished(engine: GameEngine): void {
  const spawner = internals(engine).spawner;
  spawner.spawnedCount = spawner.plannedCount;
}

/**
 * Advances the engine by calling its private `update()` directly, in fixed
 * `dt`-second steps, for a total of `seconds`. Bypassing `GameLoop`/rAF
 * entirely keeps tests deterministic and synchronous.
 */
export function stepFrames(engine: GameEngine, seconds: number, dt = 1 / 60): void {
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) {
    internals(engine).update(dt);
  }
}

/** Deterministic `Math.random()` stub — returns each value in sequence, then repeats the last. */
export function mockRandom(sequence: number[]): { restore: () => void } {
  const original = Math.random;
  let index = 0;
  Math.random = () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return value;
  };
  return {
    restore: () => {
      Math.random = original;
    },
  };
}

/** In-memory `localStorage` stand-in, matching the Web Storage API surface storageService uses. */
export function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}
