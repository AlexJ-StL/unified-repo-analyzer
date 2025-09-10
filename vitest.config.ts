import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // No plugins to avoid Vite/Vitest version conflicts
  cacheDir: 'node_modules/.vitest',

  test: {
    globals: true,
    environment: 'node', // Default environment
    setupFiles: ['./tests/setup-minimal.ts'],

    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Enable CSS processing for frontend tests
    css: true,

    coverage: {
      provider: 'v8', // Use v8 provider for better compatibility
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/tests/**',
        '**/__tests__/**',
        '**/test/**',
        '**/spec/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/temp-*/**',
        '**/mock*/**',
        '**/*.mock.*',
        '**/scripts/**',
        '**/docs/**',
        '**/examples/**',
        '**/*.example.*',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/rollup.config.*',
        '**/webpack.config.*',
        '**/jest.config.*',
        '**/babel.config.*',
        '**/tailwind.config.*',
        '**/postcss.config.*',
        '**/biome.json',
        '**/tsconfig.json',
        '**/package.json',
        '**/.env*',
        '**/README*',
        '**/CHANGELOG*',
        '**/LICENSE*',
      ],
      include: [
        'packages/*/src/**/*.{ts,tsx,js,jsx}',
        '!packages/*/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
        '!packages/*/src/**/__tests__/**',
        '!packages/*/src/**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Per-file thresholds
        perFile: true,
      },
      all: true,
      clean: true,
      skipFull: false,
      // Enable source maps for accurate coverage
      allowExternal: false,
      // Report uncovered lines
      reportOnFailure: true,
      // Watermarks for coverage colors
      watermarks: {
        statements: [70, 90],
        functions: [70, 90],
        branches: [70, 90],
        lines: [70, 90],
      },
    },

    // CRITICAL: Resource limits to prevent CPU overload and system instability
    testTimeout: process.env.CI ? 30000 : 15000,
    hookTimeout: process.env.CI ? 15000 : 8000,
    teardownTimeout: process.env.CI ? 10000 : 5000,

    // Reduced retry for faster feedback
    retry: process.env.CI ? 1 : 0,
    reporters: process.env.CI
      ? [['default', { summary: false }], 'junit']
      : [['default', { summary: true }]],
    outputFile: process.env.CI ? './test-results.xml' : undefined,

    // CRITICAL: Ultra-conservative concurrency limits to prevent system overload
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: 1,
        minThreads: 1,
      },
    },

    // CRITICAL: Force sequential execution to prevent CPU overload
    isolate: true,
    maxConcurrency: 1, // Only 1 test at a time

    // Completely disable parallelization
    fileParallelism: false,

    // Force sequential execution
    sequence: {
      shuffle: false,
      concurrent: false, // Absolutely no concurrent execution
      setupFiles: 'list',
    },

    // Fail fast to prevent runaway processes
    bail: 1,
    logHeapUsage: process.env.DEBUG_MEMORY === 'true',
    dangerouslyIgnoreUnhandledErrors: false,

    // Performance optimizations - use Vite's cacheDir instead
    // cache: { dir: "node_modules/.vitest" }, // DEPRECATED

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
