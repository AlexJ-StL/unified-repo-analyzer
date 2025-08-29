import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Use environment based on file patterns
    environmentMatchGlobs: [
      ['**/packages/frontend/**/*.test.{ts,tsx}', 'jsdom'],
      ['**/packages/backend/**/*.test.{ts,tsx}', 'node'],
      ['**/packages/cli/**/*.test.{ts,tsx}', 'node'],
      ['**/packages/shared/**/*.test.{ts,tsx}', 'node'],
      ['**/tests/**/*.test.{ts,tsx}', 'node'],
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Optimized timeouts for better performance
    testTimeout: process.env.CI ? 45000 : 20000,
    hookTimeout: process.env.CI ? 20000 : 10000,
    teardownTimeout: process.env.CI ? 15000 : 8000,

    // Reduced retry for faster feedback
    retry: process.env.CI ? 1 : 0,
    reporters: process.env.CI ? ['verbose', 'junit'] : ['default'],
    outputFile: process.env.CI ? './test-results.xml' : undefined,

    // Optimized parallel execution based on runtime
    pool: typeof Bun !== 'undefined' ? 'threads' : 'forks',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: process.env.CI ? 8 : 4,
        minThreads: process.env.CI ? 4 : 2,
      },
      forks: {
        singleFork: false,
        isolate: true,
        maxForks: process.env.CI ? 6 : 3,
        minForks: 1,
      },
    },

    // Enhanced test isolation with better performance
    isolate: true,
    maxConcurrency: process.env.CI ? 8 : 4,

    // Optimized file parallelization
    fileParallelism: true,

    // Performance-optimized sequence configuration
    sequence: {
      shuffle: false, // Disable shuffle for consistent performance
      concurrent: true,
      setupFiles: 'parallel',
    },

    // Fail fast for better performance
    bail: process.env.CI ? 3 : 1,
    logHeapUsage: process.env.DEBUG_MEMORY === 'true',
    dangerouslyIgnoreUnhandledErrors: false,

    // Performance optimizations
    cache: {
      dir: 'node_modules/.vitest',
    },

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
      '@': resolve(__dirname, './packages/shared/src'),
      '@backend': resolve(__dirname, './packages/backend/src'),
      '@frontend': resolve(__dirname, './packages/frontend/src'),
      '@cli': resolve(__dirname, './packages/cli/src'),
    },
  },
});
