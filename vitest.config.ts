import { defineConfig } from 'vitest/config';

// Standalone Vitest config, separate from vite.config.ts, so running the test
// suite never pulls in VitePWA (Milestone 9, spec/plans/milestone-9.md §2.1).
// Pure unit tests over the game engine and services — no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    passWithNoTests: false,
  },
});
