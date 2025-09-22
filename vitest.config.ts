import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Modern projects-based configuration for monorepo
    projects: [
      // Backend package
      {
        extends: './packages/backend/vitest.config.ts',
        test: {
          name: 'backend',
          root: 'packages/backend',
        },
      },

      // CLI package
      {
        extends: './packages/cli/vitest.config.ts',
        test: {
          name: 'cli',
          root: 'packages/cli',
        },
      },

      // Frontend package
      {
        extends: './packages/frontend/vitest.config.ts',
        test: {
          name: 'frontend',
          root: 'packages/frontend',
        },
      },

      // Shared package
      {
        extends: './packages/shared/vitest.config.ts',
        test: {
          name: 'shared',
          root: 'packages/shared',
        },
      },

      // Root-level tests (for tests/ directory)
      {
        test: {
          name: 'root',
          root: '.',
          environment: 'node',
          globals: true,
          setupFiles: ['./tests/setup.ts'],

          // CRITICAL: Ultra-conservative resource limits to prevent system overload
          maxConcurrency: 1,
          pool: 'threads',
          poolOptions: {
            threads: {
              singleThread: true,
            },
          },

          // CRITICAL: Force sequential execution to prevent resource conflicts
          isolate: true,
          sequence: {
            shuffle: false,
            concurrent: false,
          },

          // Fail fast to prevent runaway processes
          bail: 1,
          retry: process.env.CI ? 1 : 0,

          // Timeouts - conservative to prevent hanging
          testTimeout: process.env.CI ? 30000 : 15000,
          hookTimeout: process.env.CI ? 15000 : 8000,

          // Enhanced mocking support
          mockReset: true,
          clearMocks: true,
          restoreMocks: true,
          unstubEnvs: true,
          unstubGlobals: true,

          // Root-level test patterns
          include: [
            'tests/**/*.test.ts',
            'tests/**/*.test.js',
            'tests/**/*.spec.ts',
            'tests/**/*.spec.js',
          ],

          // Root-level exclusions
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            'packages/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/temp-test-repos/**',
            '**/large-performance-test/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
          ],
        },
      },
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'packages/shared/src'),
      '@backend': path.resolve(__dirname, 'packages/backend/src'),
      '@frontend': path.resolve(__dirname, 'packages/frontend/src'),
      '@cli': path.resolve(__dirname, 'packages/cli/src'),
    },
  },
});
