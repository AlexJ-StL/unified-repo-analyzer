/**
 * Vitest configuration for integration tests
 */

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Runtime and environment-aware timeouts for integration tests
    testTimeout: process.env.CI
      ? typeof Bun !== "undefined"
        ? 180000
        : 240000 // CI: Bun 3min, Node 4min
      : typeof Bun !== "undefined"
        ? 90000
        : 120000, // Local: Bun 1.5min, Node 2min
    hookTimeout: process.env.CI
      ? typeof Bun !== "undefined"
        ? 90000
        : 120000 // CI: Bun 1.5min, Node 2min
      : typeof Bun !== "undefined"
        ? 45000
        : 60000, // Local: Bun 45s, Node 60s

    // Runtime-optimized execution for integration tests
    pool: typeof Bun !== "undefined" ? "threads" : "forks",
    poolOptions: {
      threads: {
        singleThread: process.env.CI ? false : true, // Allow parallel in CI for Bun
        isolate: true,
        useAtomics: true,
        maxThreads: process.env.CI ? 3 : 1,
        minThreads: 1,
      },
      forks: {
        singleFork: process.env.CI ? false : true, // Allow parallel in CI for Node
        isolate: true,
        maxForks: process.env.CI ? 3 : 1,
        minForks: 1,
      },
    },

    // Enhanced retry logic for integration tests
    retry: process.env.CI
      ? typeof Bun !== "undefined"
        ? 2
        : 3 // Fewer retries for Bun
      : 0,

    // Test file patterns
    include: ["**/*.test.ts", "**/*.integration.test.ts"],

    // Runtime and environment-aware setup
    env: {
      NODE_ENV: "test",
      LOG_LEVEL: process.env.CI ? "ERROR" : "WARN", // More verbose locally
      SILENT_TESTS: process.env.CI ? "true" : "false",
      TEST_RUNTIME: typeof Bun !== "undefined" ? "bun" : "node",
      TEST_PLATFORM: process.platform,
      INTEGRATION_TEST: "true",
      // Runtime-specific memory settings
      ...(typeof Bun === "undefined" &&
        process.env.CI && {
          NODE_OPTIONS: "--max-old-space-size=4096",
        }),
    },

    // Global setup and teardown
    // globalSetup: path.resolve(__dirname, "./global-setup.ts"),

    // Coverage configuration for integration tests
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "../../coverage/integration",
      include: [
        "packages/backend/src/services/**/*.ts",
        "packages/shared/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/dist/**",
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

    // Enhanced reporter configuration for CI/CD
    reporters: process.env.CI
      ? process.env.GITHUB_ACTIONS
        ? ["verbose", "json", "github-actions"]
        : ["verbose", "json"]
      : ["verbose", "json"],
    outputFile: {
      json: `./integration-test-results-${typeof Bun !== "undefined" ? "bun" : "node"}-${process.platform}.json`,
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../packages"),
      "@backend": path.resolve(__dirname, "../../packages/backend/src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@frontend": path.resolve(__dirname, "../../packages/frontend/src"),
    },
  },

  // Define configuration for different environments
  define: {
    __TEST_ENV__: '"integration"',
  },
});
