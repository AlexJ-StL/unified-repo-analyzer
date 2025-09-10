import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    // Inherit from root config but override for backend-specific needs
    globals: true,
    environment: 'node', // Backend is always Node.js environment
    setupFiles: ['../../tests/setup-minimal.ts'],

    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // CRITICAL: Ultra-conservative resource limits (same as root)
    testTimeout: process.env.CI ? 30000 : 15000,
    hookTimeout: process.env.CI ? 15000 : 8000,
    teardownTimeout: process.env.CI ? 10000 : 5000,

    // CRITICAL: Force single process execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
        maxForks: 1,
        minForks: 1,
      },
    },

    // CRITICAL: Sequential execution only
    isolate: true,
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      shuffle: false,
      concurrent: false,
      setupFiles: 'list',
    },

    // Fail fast
    bail: 1,
    retry: process.env.CI ? 1 : 0,

    // Backend-specific coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,js}'],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },

    // Backend-specific excludes
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/temp-test-repos/**',
    ],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../../packages/shared/src'),
      '@backend': resolve(__dirname, './src'),
      '@frontend': resolve(__dirname, '../frontend/src'),
      '@cli': resolve(__dirname, '../cli/src'),
    },
  },
});
