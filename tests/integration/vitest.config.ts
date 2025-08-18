/**
 * Vitest configuration for integration tests
 */

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests may take longer than unit tests
    testTimeout: 60000, // 60 seconds
    hookTimeout: 30000, // 30 seconds for setup/teardown

    // Run integration tests sequentially to avoid resource conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Test file patterns
    include: ['**/*.test.ts', '**/*.integration.test.ts'],

    // Environment setup
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'ERROR', // Reduce log noise during tests
      SILENT_TESTS: 'true',
    },

    // Global setup and teardown
    // globalSetup: path.resolve(__dirname, "./global-setup.ts"),

    // Coverage configuration for integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../../coverage/integration',
      include: ['packages/backend/src/services/**/*.ts', 'packages/shared/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/node_modules/**', '**/dist/**'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Reporter configuration
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './integration-test-results.json',
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../packages'),
      '@backend': path.resolve(__dirname, '../../packages/backend/src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@frontend': path.resolve(__dirname, '../../packages/frontend/src'),
    },
  },

  // Define configuration for different environments
  define: {
    __TEST_ENV__: '"integration"',
  },
});
