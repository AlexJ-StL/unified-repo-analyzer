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
      // CI-specific overrides with runtime detection
      testTimeout: typeof Bun !== "undefined" ? 240000 : 300000, // Bun: 4min, Node: 5min
      hookTimeout: typeof Bun !== "undefined" ? 120000 : 150000, // Bun: 2min, Node: 2.5min
      teardownTimeout: typeof Bun !== "undefined" ? 90000 : 120000, // Bun: 1.5min, Node: 2min

      // Runtime-aware retry configuration for CI flakiness
      retry: typeof Bun !== "undefined" ? 3 : 5, // Bun is more stable, needs fewer retries

      // Enhanced CI reporting with runtime and environment awareness
      reporter: process.env.GITHUB_ACTIONS
        ? ["verbose", "junit", "json", "github-actions"]
        : process.env.GITLAB_CI
          ? ["verbose", "junit", "json"]
          : ["verbose", "junit", "json"],
      outputFile: {
        junit: `./ci-test-results-${typeof Bun !== "undefined" ? "bun" : "node"}-${process.platform}.xml`,
        json: `./ci-test-results-${typeof Bun !== "undefined" ? "bun" : "node"}-${process.platform}.json`,
      },

      // Runtime-optimized parallel execution for CI
      pool: typeof Bun !== "undefined" ? "threads" : "forks",
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true,
          useAtomics: true,
          maxThreads: typeof Bun !== "undefined" ? 10 : 8, // Bun handles more threads better
          minThreads: typeof Bun !== "undefined" ? 5 : 4,
        },
        forks: {
          singleFork: false,
          isolate: true,
          maxForks: typeof Bun !== "undefined" ? 6 : 10, // Node handles more forks better
          minForks: typeof Bun !== "undefined" ? 3 : 5,
        },
      },

      // Runtime-aware enhanced concurrency for CI
      maxConcurrency: typeof Bun !== "undefined" ? 12 : 10,
      minThreads: typeof Bun !== "undefined" ? 5 : 4,
      maxThreads: typeof Bun !== "undefined" ? 10 : 8,

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

      // Runtime and environment-specific settings
      env: {
        CI: "true",
        NODE_ENV: "test",
        SILENT_TESTS: "true", // Reduce noise in CI logs
        DEBUG_CLEANUP: "false", // Disable debug output in CI
        TEST_PARALLEL: "true",
        TEST_RUNTIME: typeof Bun !== "undefined" ? "bun" : "node",
        TEST_PLATFORM: process.platform,
        // Runtime-specific memory limits for CI
        ...(typeof Bun === "undefined" && {
          NODE_OPTIONS: "--max-old-space-size=6144", // Increased for Node.js in CI
        }),
        // Enhanced error reporting
        FORCE_COLOR: "1", // Ensure colored output in CI
        DEBUG_COLORS: "1",
      },

      // Enhanced watch mode disabled in CI
      watch: false,

      // Better error handling for CI
      dangerouslyIgnoreUnhandledErrors: false,

      // Ensure clean state between test runs
      clearScreen: false,

      // Enhanced globals for CI environment
      globals: true,

      // Runtime-aware type checking in CI
      typecheck: {
        enabled: true,
        tsconfig: "./tsconfig.json",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        // Runtime-specific type checking options
        ...(typeof Bun !== "undefined" && {
          // Bun-specific type checking optimizations
          checker: "tsc",
          allowJs: true,
        }),
      },

      // Enhanced error handling for different CI environments
      onConsoleLog: (log, type) => {
        // Filter out noisy logs in CI but keep errors
        if (
          type === "stderr" ||
          log.includes("ERROR") ||
          log.includes("FAIL")
        ) {
          return true;
        }
        // Suppress debug logs in CI unless explicitly enabled
        return process.env.DEBUG_TESTS === "true";
      },

      // Runtime-specific test isolation
      isolate: true,

      // Enhanced cleanup for CI environments
      restoreMocks: true,
      clearMocks: true,
      resetMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  })
);
