import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

/**
 * CI-specific Vitest configuration
 * Optimized for automated testing environments
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // CI-specific overrides
      testTimeout: 180000, // 3 minutes for complex tests
      hookTimeout: 90000, // 1.5 minutes for setup/teardown
      teardownTimeout: 60000, // 1 minute for cleanup

      // More aggressive retry for CI flakiness
      retry: 5,

      // Optimized for CI reporting
      reporter: ["verbose", "junit", "json", "github-actions"],
      outputFile: {
        junit: "./ci-test-results.xml",
        json: "./ci-test-results.json",
      },

      // CI-optimized parallel execution
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true,
          useAtomics: true,
          maxThreads: 8, // Higher for CI machines
          minThreads: 4,
        },
      },

      // Enhanced concurrency for CI
      maxConcurrency: 10,
      minThreads: 4,
      maxThreads: 8,

      // Deterministic execution for CI
      sequence: {
        shuffle: false,
        concurrent: true,
        setupFiles: "parallel",
      },

      // Fail fast on critical errors
      bail: 1,

      // Memory and performance monitoring
      logHeapUsage: true,

      // Enhanced coverage for CI
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov", "cobertura"],
        exclude: [
          "node_modules/",
          "dist/",
          "coverage/",
          "**/*.d.ts",
          "**/*.config.*",
          "**/tests/**",
          "**/__tests__/**",
          "**/*.test.*",
          "**/*.spec.*",
          // CI-specific exclusions
          "**/scripts/**",
          "**/docs/**",
          "**/*.md",
        ],
        thresholds: {
          global: {
            branches: 85, // Higher thresholds for CI
            functions: 85,
            lines: 85,
            statements: 85,
          },
          // Per-package thresholds
          "packages/backend/": {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
          },
          "packages/shared/": {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
          },
        },
        // Fail CI if coverage drops below threshold
        skipFull: false,
        all: true,
      },

      // Environment-specific settings
      env: {
        CI: "true",
        NODE_ENV: "test",
        SILENT_TESTS: "true", // Reduce noise in CI logs
        DEBUG_CLEANUP: "false", // Disable debug output in CI
        TEST_PARALLEL: "true",
        // Memory limits for CI
        NODE_OPTIONS: "--max-old-space-size=4096",
      },

      // Enhanced watch mode disabled in CI
      watch: false,

      // Better error handling for CI
      dangerouslyIgnoreUnhandledErrors: false,

      // Ensure clean state between test runs
      clearScreen: false,

      // Enhanced globals for CI environment
      globals: true,

      // Stricter type checking in CI
      typecheck: {
        enabled: true,
        tsconfig: "./tsconfig.json",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      },
    },
  })
);
