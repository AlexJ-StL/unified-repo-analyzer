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
    // Use different environments based on file patterns with projects
    projects: [
      {
        name: "frontend",
        testMatch: ["**/packages/frontend/**/*.test.{ts,tsx}"],
        environment: "jsdom",
      },
      {
        name: "backend",
        testMatch: ["**/packages/backend/**/*.test.{ts,tsx}"],
        environment: "node",
      },
      {
        name: "cli",
        testMatch: ["**/packages/cli/**/*.test.{ts,tsx}"],
        environment: "node",
      },
      {
        name: "shared",
        testMatch: ["**/packages/shared/**/*.test.{ts,tsx}"],
        environment: "node",
      },
      {
        name: "root",
        testMatch: ["**/tests/**/*.test.{ts,tsx}"],
        environment: "node",
      },
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
    // Enhanced CI/CD configuration with runtime-specific adjustments
    testTimeout: process.env.CI
      ? typeof Bun !== "undefined"
        ? 180000
        : 240000 // Bun: 3min, Node: 4min in CI
      : typeof Bun !== "undefined"
        ? 45000
        : 60000, // Bun: 45s, Node: 60s locally
    hookTimeout: process.env.CI
      ? typeof Bun !== "undefined"
        ? 90000
        : 120000 // Bun: 1.5min, Node: 2min in CI
      : typeof Bun !== "undefined"
        ? 20000
        : 30000, // Bun: 20s, Node: 30s locally
    teardownTimeout: process.env.CI
      ? typeof Bun !== "undefined"
        ? 45000
        : 60000 // Bun: 45s, Node: 60s in CI
      : typeof Bun !== "undefined"
        ? 15000
        : 20000, // Bun: 15s, Node: 20s locally
    // Enhanced retry configuration for flaky tests with runtime awareness
    retry: process.env.CI
      ? typeof Bun !== "undefined"
        ? 3
        : 5 // Bun: 3 retries, Node: 5 retries in CI
      : 0, // No retries locally
    // Enhanced error reporting for different environments and runtimes
    reporter: process.env.CI
      ? process.env.GITHUB_ACTIONS
        ? ["verbose", "junit", "json", "github-actions"]
        : ["verbose", "junit", "json"]
      : process.env.DEBUG_TESTS
        ? ["verbose", "html"]
        : ["default"],
    outputFile: process.env.CI
      ? {
          junit: `./test-results-${typeof Bun !== "undefined" ? "bun" : "node"}.xml`,
          json: `./test-results-${typeof Bun !== "undefined" ? "bun" : "node"}.json`,
        }
      : process.env.DEBUG_TESTS
        ? "./test-results.html"
        : undefined,
    // Enhanced parallel execution for CI with runtime-specific optimizations
    pool: process.env.CI
      ? typeof Bun !== "undefined"
        ? "threads"
        : "forks" // Bun prefers threads, Node prefers forks
      : "forks",
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: process.env.CI
          ? typeof Bun !== "undefined"
            ? 6
            : 4 // Bun can handle more threads
          : typeof Bun !== "undefined"
            ? 3
            : 2,
        minThreads: process.env.CI ? (typeof Bun !== "undefined" ? 3 : 2) : 1,
      },
      forks: {
        singleFork: false,
        isolate: true,
        maxForks: process.env.CI
          ? typeof Bun !== "undefined"
            ? 4
            : 6 // Node can handle more forks
          : typeof Bun !== "undefined"
            ? 2
            : 3,
        minForks: process.env.CI ? (typeof Bun !== "undefined" ? 2 : 3) : 1,
      },
    },
    // Better test isolation
    isolate: true,
    // Runtime-aware parallel execution configuration
    maxConcurrency: process.env.CI
      ? typeof Bun !== "undefined"
        ? 8
        : 6 // Bun can handle higher concurrency
      : typeof Bun !== "undefined"
        ? 4
        : 3,
    minThreads: process.env.CI ? (typeof Bun !== "undefined" ? 3 : 2) : 1,
    maxThreads: process.env.CI
      ? typeof Bun !== "undefined"
        ? 8
        : 6
      : typeof Bun !== "undefined"
        ? 4
        : 3,
    // File parallelization
    fileParallelism: true,
    // Sequence configuration for better isolation
    sequence: {
      shuffle: !process.env.CI, // Deterministic in CI
      concurrent: true,
      setupFiles: "parallel",
    },
    // Enhanced error handling for CI with runtime-specific behavior
    bail: process.env.CI
      ? process.env.GITHUB_ACTIONS
        ? 0
        : 1 // Don't bail in GitHub Actions for better reporting
      : 0,
    // Memory management for CI environments with runtime awareness
    logHeapUsage: process.env.CI || process.env.DEBUG_MEMORY,
    // Enhanced error handling and debugging
    dangerouslyIgnoreUnhandledErrors: false,
    // Enable proper ESM mocking with better module resolution

    // Better module mocking support
    deps: {
      optimizer: {
        ssr: {
          include: [
            // Include dependencies that need to be transformed for mocking
            /@unified-repo-analyzer\/.*/,
            /vitest/,
          ],
          exclude: [/^node:/],
        },
      },
      moduleDirectories: ["node_modules", "packages"],
    },
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
