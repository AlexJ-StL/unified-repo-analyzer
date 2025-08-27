/**
 * Global test setup configuration
 * Enhanced with proper mocking support and test isolation
 */

/// <reference types="vitest" />
/// <reference types="node" />

import "@testing-library/jest-dom/vitest";
import { join } from "node:path";
import { config } from "dotenv";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

// Export mocking utilities for easy access in tests
export { vi } from "vitest";
export const mocked = vi.mocked;

// Re-export enhanced mock utilities
export * from "./mock-utils.js";

// Re-export cleanup utilities (conditional to avoid circular imports)
export * from "./cleanup-manager";
export * from "./test-cleanup-helpers";

// Re-export isolation and parallel test utilities
export * from "./test-isolation";
export * from "./parallel-test-utils";

// Re-export CI/CD utilities
export * from "./ci-test-utils";

// Load test environment variables
config({ path: join(__dirname, "../.env.test") });

// Global test configuration
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Initialize CI utilities and log environment info
  const { logEnvironmentInfo, EnvironmentDetector } = await import(
    "./ci-test-utils"
  );
  logEnvironmentInfo();

  // Enhanced CI configuration
  if (EnvironmentDetector.isCI()) {
    process.env.TEST_TIMEOUT = "120000"; // Increased for CI
    process.env.SILENT_TESTS = "true"; // Reduce noise in CI
    process.env.TEST_PARALLEL = "true"; // Enable parallel execution
  }

  // Enhanced console mocking for test environment
  if (process.env.SILENT_TESTS === "true") {
    global.console = {
      ...console,
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
    };
  }

  // Setup global error handlers for better test debugging
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });

  // Setup DOM environment if jsdom is available
  if (typeof window !== "undefined") {
    // Mock window.matchMedia for frontend tests
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: vi.fn(),
      }),
    });

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve = () => {};
      disconnect = () => {};
    } as unknown as typeof IntersectionObserver;

    // Mock requestAnimationFrame
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(16), 16) as unknown as number;
    };

    global.cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
    };
  }
});

afterAll(async () => {
  // Final comprehensive cleanup after all tests
  const { runCleanup, emergencyCleanup } = await import("./cleanup-manager");

  try {
    const stats = await runCleanup();
    if (process.env.DEBUG_CLEANUP) {
      console.log(
        `Final cleanup: ${stats.tasksRun} tasks completed in ${stats.totalTime.toFixed(2)}ms`
      );
      if (stats.errors.length > 0) {
        console.warn("Cleanup errors:", stats.errors);
      }
    }
  } catch (error) {
    console.warn("Final cleanup failed, running emergency cleanup:", error);
    emergencyCleanup();
  }
});

beforeEach(async () => {
  // Enhanced mock cleanup for better test isolation
  vi.clearAllMocks();
  vi.resetAllMocks();

  // Clear module cache to ensure fresh imports in each test
  vi.resetModules();

  // Cleanup DOM if in jsdom environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const { cleanup } = await import("@testing-library/react");
      cleanup();
    } catch (_error) {
      // @testing-library/react not available, skip
    }
  }

  // Reset environment variables that might be modified by tests
  if (process.env.NODE_ENV !== "test") {
    process.env.NODE_ENV = "test";
  }
});

afterEach(async () => {
  // Run comprehensive cleanup after each test
  const { runCleanup } = await import("./cleanup-manager");
  const stats = await runCleanup();

  // Log cleanup warnings if there were errors (but don't fail tests)
  if (stats.errors.length > 0 && process.env.DEBUG_CLEANUP) {
    console.warn(
      `Test cleanup completed with ${stats.errors.length} errors:`,
      stats.errors.map((e) => `${e.task}: ${e.error.message}`)
    );
  }
});

// Global test utilities and cleanup functions

/**
 * Cleanup test artifacts like temporary files and directories
 */
async function cleanupTestArtifacts(): Promise<void> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    // Common test artifact patterns to clean up
    const testDirs = [
      "test-logging-integration",
      "test-repo-analysis",
      "test-cache",
      "test-output",
    ];

    for (const dir of testDirs) {
      const fullPath = path.join(process.cwd(), dir);
      try {
        await fs.rm(fullPath, { recursive: true, force: true });
      } catch {
        // Ignore if directory doesn't exist
      }
    }
  } catch (error) {
    // Silently ignore cleanup errors to not interfere with test results
    console.warn("Test cleanup warning:", error);
  }
}

/**
 * Enhanced mock factory for common patterns
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): ReturnType<typeof vi.fn> {
  const mockFn = vi.fn();
  if (implementation) {
    mockFn.mockImplementation(implementation);
  }
  return mockFn;
}

/**
 * Mock a module with type safety
 */
export function mockModule<T>(modulePath: string, factory?: () => T): void {
  vi.mock(modulePath, factory);
}

/**
 * Create a mock with proper TypeScript typing
 */
export function createTypedMock<T>(): T {
  return {} as T;
}

// Type declarations for global scope
declare global {
  interface Global {
    ResizeObserver: typeof ResizeObserver;
    IntersectionObserver: typeof IntersectionObserver;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (id: number) => void;
  }
}
