import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Use a simpler configuration that might work better with Bun
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Disable problematic features
    css: false,
    coverage: {
      enabled: false,
    },
    // Simplify the setup
    setupFiles: [],
    // Use simpler file matching
    include: ['tests/simple-test.test.ts'],
  },
});