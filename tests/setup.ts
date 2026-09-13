/**
 * Global test environment stubs — Milestone 9, spec/plans/milestone-9.md §2.2.
 * Loaded once (see vitest.config.ts `setupFiles`) before any test module, so
 * it runs before the game engine's transitive imports (Renderer → sprites.ts,
 * which creates `new Image()` per sprite at module load time).
 *
 * The test environment is plain Node (`environment: 'node'`), which has none
 * of the browser globals the engine assumes exist. These stubs are the
 * minimum needed to import and exercise the engine's pure game logic without
 * a real browser or a DOM library.
 */

class FakeImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

if (typeof (globalThis as Record<string, unknown>).Image === 'undefined') {
  (globalThis as unknown as { Image: typeof FakeImage }).Image = FakeImage;
}

if (typeof (globalThis as Record<string, unknown>).window === 'undefined') {
  (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
}

const testWindow = (globalThis as unknown as { window: { devicePixelRatio?: number } }).window;
if (typeof testWindow.devicePixelRatio === 'undefined') {
  testWindow.devicePixelRatio = 1;
}
