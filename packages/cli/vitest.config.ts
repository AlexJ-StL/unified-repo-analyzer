import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Ultra-conservative resource limits to prevent system overload
    maxConcurrency: 1,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Disable coverage for now to avoid issues
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../shared/src'),
      '@backend': path.resolve(__dirname, '../backend/src'),
      '@frontend': path.resolve(__dirname, '../frontend/src'),
      '@cli': path.resolve(__dirname, './src'),
    },
  },
});
