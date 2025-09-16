import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Inherit ultra-conservative settings from root config
    maxConcurrency: 1,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Environment settings
    environment: 'node',

    // Test files
    include: ['__tests__/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],

    // Setup and teardown
    setupFiles: ['../../tests/setup-minimal.ts'],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '__tests__/**', '**/*.d.ts'],
    },

    // Mock settings
    clearMocks: true,
    restoreMocks: true,

    // Bail on first failure to prevent resource issues
    bail: 1,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../../packages/shared/src'),
      '@backend': resolve(__dirname, '../backend/src'),
      '@frontend': resolve(__dirname, '../frontend/src'),
      '@cli': resolve(__dirname, '../cli/src'),
    },
  },
});
