import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Enable proper ESM mocking with better module resolution
    deps: {
      external: [/^(?!.*vitest).*$/],
      moduleDirectories: ["node_modules", "packages"],
    },
    // Better module mocking support
    server: {
      deps: {
        inline: [
          // Inline dependencies that need to be transformed for mocking
          /@unified-repo-analyzer\/.*/,
        ],
      },
    },
    // Use different environments based on file patterns
    environmentMatchGlobs: [
      ["**/packages/frontend/**", "jsdom"],
      ["**/packages/backend/**", "node"],
      ["**/packages/cli/**", "node"],
      ["**/packages/shared/**", "node"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
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
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Enhanced CI/CD configuration
    testTimeout: process.env.CI ? 120000 : 30000, // Increased timeout for CI
    hookTimeout: process.env.CI ? 60000 : 15000,
    teardownTimeout: process.env.CI ? 30000 : 10000,
    // Enhanced retry configuration for flaky tests
    retry: process.env.CI ? 3 : 0, // More retries in CI
    // Better error reporting for different environments
    reporter: process.env.CI
      ? ["verbose", "junit", "json"]
      : process.env.DEBUG_TESTS
        ? ["verbose", "html"]
        : ["default"],
    outputFile: process.env.CI
      ? {
          junit: "./test-results.xml",
          json: "./test-results.json",
        }
      : process.env.DEBUG_TESTS
        ? "./test-results.html"
        : undefined,
    // Enhanced parallel execution for CI
    pool: process.env.CI ? "threads" : "forks",
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: process.env.CI ? 4 : 2,
        minThreads: process.env.CI ? 2 : 1,
      },
      forks: {
        singleFork: false,
        isolate: true,
        maxForks: process.env.CI ? 4 : 2,
        minForks: process.env.CI ? 2 : 1,
      },
    },
    // Better test isolation
    isolate: true,
    // Parallel execution configuration
    maxConcurrency: process.env.CI ? 6 : 3,
    minThreads: process.env.CI ? 2 : 1,
    maxThreads: process.env.CI ? 6 : 3,
    // File parallelization
    fileParallelism: true,
    // Sequence configuration for better isolation
    sequence: {
      shuffle: process.env.CI ? false : true, // Deterministic in CI
      concurrent: true,
      setupFiles: "parallel",
    },
    // Enhanced error handling for CI
    bail: process.env.CI ? 1 : 0, // Fail fast in CI if there are critical errors
    // Memory management for CI environments
    logHeapUsage: process.env.CI || process.env.DEBUG_MEMORY,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./packages/shared/src"),
      "@backend": resolve(__dirname, "./packages/backend/src"),
      "@frontend": resolve(__dirname, "./packages/frontend/src"),
      "@cli": resolve(__dirname, "./packages/cli/src"),
    },
  },
});
