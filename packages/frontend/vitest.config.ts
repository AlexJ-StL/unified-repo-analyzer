import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],

    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Enable CSS processing for frontend tests
    css: true,

    // CRITICAL: Resource limits to prevent CPU overload
    testTimeout: process.env.CI ? 30000 : 15000,
    hookTimeout: process.env.CI ? 15000 : 8000,
    teardownTimeout: process.env.CI ? 10000 : 5000,

    // Reduced retry for faster feedback
    retry: process.env.CI ? 1 : 0,
    reporters: process.env.CI
      ? [['default', { summary: false }], 'junit']
      : [['default', { summary: true }]],

    // CRITICAL: Ultra-conservative concurrency limits
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
        maxForks: 1,
        minForks: 1,
      },
    },

    // CRITICAL: Force sequential execution
    isolate: true,
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      shuffle: false,
      concurrent: false,
      setupFiles: 'list',
    },

    // Fail fast to prevent runaway processes
    bail: 1,
    logHeapUsage: process.env.DEBUG_MEMORY === 'true',
    dangerouslyIgnoreUnhandledErrors: false,

    // Exclude performance test directories and temp files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/temp-test-repos/**',
      '**/large-performance-test/**',
    ],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../../packages/shared/src'),
      '@backend': resolve(__dirname, '../../packages/backend/src'),
      '@frontend': resolve(__dirname, './src'),
      '@cli': resolve(__dirname, '../../packages/cli/src'),
    },
  },
});
