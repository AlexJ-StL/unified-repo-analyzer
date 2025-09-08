import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Force single thread execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Disable features that might cause issues
    css: false,
    // Use absolute paths for setup files
    setupFiles: [resolve(__dirname, 'tests/setup-minimal.ts')],
    // Include only the simple test with absolute path
    include: [resolve(__dirname, 'tests/simple-test.test.ts')],
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
  // Ensure proper resolution
  resolve: {
    preserveSymlinks: false,
  },
});
