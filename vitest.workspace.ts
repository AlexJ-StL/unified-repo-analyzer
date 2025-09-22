import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineWorkspace } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base configuration for all packages - ultra-conservative resource limits
const baseConfig = {
  test: {
    // CRITICAL: Ultra-conservative resource limits to prevent system overload
    maxConcurrency: 1,
    pool: 'threads'
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // CRITICAL: Force sequential execution to prevent resource conflicts
    isolate: true,
    fileParallelism: false,
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
    teardownTimeout: process.env.CI ? 10000 : 5000,

    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Disable coverage by default in workspace - enable per-package if needed
    coverage: {
      enabled: false,
    },

    // Global exclusions for all packages
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/temp-test-repos/**',
      '**/large-performance-test/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
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
};

export default defineWorkspace([
  // Backend package configuration
  {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      name: 'backend',
      root: 'packages/backend',
      environment: 'node',
      globals: true,
      setupFiles: ['../../tests/setup-minimal-simple.ts'],

      // Backend-specific test patterns
      include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    },
  },

  // CLI package configuration
  {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      name: 'cli',
      root: 'packages/cli',
      environment: 'node',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],

      // CLI-specific test patterns
      include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    },
  },

  // Frontend package configuration
  {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      name: 'frontend',
      root: 'packages/frontend',
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],

      // Enable CSS processing for frontend tests
      css: true,

      // Frontend-specific test patterns
      include: ['**/__tests__/**/*.test.ts', '**/*.test.ts', '**/*.test.tsx'],
    },
  },

  // Shared package configuration
  {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      name: 'shared',
      root: 'packages/shared',
      environment: 'node',
      globals: true,
      setupFiles: ['../../tests/setup-minimal.ts'],

      // Shared-specific test patterns
      include: ['__tests__/**/*.test.ts'],
    },
  },

  // Root-level test configuration (for tests/ directory)
  {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      name: 'root',
      root: '.',
      environment: 'node',
      globals: true,
      setupFiles: ['./tests/setup.ts'],

      // Root-level test patterns
      include: [
        'tests/**/*.test.ts',
        'tests/**/*.test.js',
        'tests/**/*.spec.ts',
        'tests/**/*.spec.js',
      ],

      // Root-level exclusions
      exclude: [...baseConfig.test.exclude, 'packages/**', '**/node_modules/**', '**/dist/**'],
    },
  },
]);
