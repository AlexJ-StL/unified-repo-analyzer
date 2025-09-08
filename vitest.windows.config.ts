import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Force single thread execution to avoid concurrency issues
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Disable features that might cause issues
    css: false,
    // Use a minimal setup
    setupFiles: [],
    // Include only the simple test to isolate the issue
    include: ['tests/simple-test.test.ts'],
    // Disable coverage to avoid additional complexity
    coverage: {
      enabled: false,
    },
    // Windows-specific settings
    testTimeout: 10000,
    hookTimeout: 5000,
    // Disable file parallelism
    fileParallelism: false,
    // Force sequential execution
    sequence: {
      concurrent: false,
    },
  },
});
