import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // No plugins to avoid Vite/Vitest version conflicts
  cacheDir: "node_modules/.vitest",

  test: {
    globals: true,
    environment: "node", // Default environment
    setupFiles: ["./tests/setup-minimal.ts"],

    // Enhanced mocking support
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Use projects for environment-specific configurations
    projects: [
      {
        name: "frontend",
        test: {
          environment: "jsdom",
          include: ["**/packages/frontend/**/*.test.{ts,tsx}"],
        },
      },
      {
        name: "backend",
        test: {
          environment: "node",
          include: ["**/packages/backend/**/*.test.{ts,tsx}"],
        },
      },
      {
        name: "cli",
        test: {
          environment: "node",
          include: ["**/packages/cli/**/*.test.{ts,tsx}"],
        },
      },
      {
        name: "shared",
        test: {
          environment: "node",
          include: ["**/packages/shared/**/*.test.{ts,tsx}"],
        },
      },
      {
        name: "tests",
        test: {
          environment: "node",
          include: ["**/tests/**/*.test.{ts,tsx}"],
        },
      },
    ],

    // Enable CSS processing for frontend tests
    css: true,

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
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
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // CRITICAL: Resource limits to prevent CPU overload and system instability
    testTimeout: process.env.CI ? 30000 : 15000,
    hookTimeout: process.env.CI ? 15000 : 8000,
    teardownTimeout: process.env.CI ? 10000 : 5000,

    // Reduced retry for faster feedback
    retry: process.env.CI ? 1 : 0,
    reporters: process.env.CI
      ? [["default", { summary: false }], "junit"]
      : [["default", { summary: true }]],
    outputFile: process.env.CI ? "./test-results.xml" : undefined,

    // CRITICAL: Ultra-conservative concurrency limits to prevent system overload
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Force single process to prevent Bun explosion
        isolate: true,
        maxForks: 1, // ABSOLUTE MAXIMUM 1 process
        minForks: 1,
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
      setupFiles: "list",
    },

    // Fail fast to prevent runaway processes
    bail: 1,
    logHeapUsage: process.env.DEBUG_MEMORY === "true",
    dangerouslyIgnoreUnhandledErrors: false,

    // Performance optimizations - use Vite's cacheDir instead
    // cache: { dir: "node_modules/.vitest" }, // DEPRECATED

    // Exclude performance test directories and temp files
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/temp-test-repos/**",
      "**/large-performance-test/**",
    ],
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
