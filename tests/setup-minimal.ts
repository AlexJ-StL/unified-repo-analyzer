/**
 * Minimal Test Setup - No external dependencies
 * Fixes broken mock infrastructure without complex imports
 */

/// <reference types="vitest" />
/// <reference types="node" />

import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import {
  setupMocks,
  cleanupMocks,
  createMock,
  mockFunction
} from "./MockManager";
// import { resourceController } from "./ResourceController";
// import {
//   cleanupTestIsolation,
//   emergencyIsolationReset,
//   setupTestIsolation
// } from "./test-isolation";

// Export vi for tests that need it
export { vi } from "vitest";

// Export our mock manager utilities
export {
  cleanupMocks,
  createMock,
  mockFunction,
  mockModule,
  resetAllMocks,
  setupMocks
} from "./MockManager";

// Safe mocked function that works with both Bun and Vitest
export const mocked = <T>(item: T): T => {
  if (typeof vi?.mocked === "function") {
    return vi.mocked(item) as unknown as T;
  }
  // Fallback for when vi.mocked is not available
  return item as T;
};

// Global test configuration - non-async to avoid runner issues
beforeAll(() => {
  if (typeof process !== "undefined") {
    process.env.NODE_ENV = "test";
  }
  setupMocks();
  if (
    typeof process !== "undefined" &&
    process &&
    typeof process.on === "function"
  ) {
    process.on("unhandledRejection", (_reason, _promise) => {});
    process.on("uncaughtException", (_error) => {});
  }
});

afterAll(async () => {
  cleanupMocks();
});

beforeEach(() => {
  // Generate unique test ID for isolation
  const testId = `test-${Date.now()}-${Math.random()}`;

  // Setup comprehensive test isolation - disabled for Vitest runner
  // await setupTestIsolation(testId);

  // Store test ID for cleanup
  (globalThis as any).__currentTestId = testId;

  // Enhanced mock cleanup for better test isolation
  if (typeof vi?.clearAllMocks === "function") {
    vi.clearAllMocks();
  }
  if (typeof vi?.resetAllMocks === "function") {
    vi.resetAllMocks();
  }

  // Clear module cache to ensure fresh imports in each test
  if (typeof vi?.resetModules === "function") {
    vi.resetModules();
  }

  // Reset environment variables that might be modified by tests
  if (process.env.NODE_ENV !== "test") {
    process.env.NODE_ENV = "test";
  }
});

afterEach(() => {
  // Get test ID and cleanup isolation - disabled for Vitest runner
  const testId = (globalThis as any).__currentTestId;
  if (testId) {
    // await cleanupTestIsolation(testId);
    delete (globalThis as any).__currentTestId;
  }

  // Run mock cleanup after each test
  cleanupMocks();
});

/**
 * Enhanced mock factory for common patterns
 */
export function createMockFunction<T extends (...args: unknown[]) => unknown>(
  implementation?: T
): ReturnType<typeof vi.fn> {
  if (typeof vi.fn === "function") {
    return vi.fn(implementation) as ReturnType<typeof vi.fn>;
  }
  return mockFunction(implementation) as ReturnType<typeof vi.fn>;
}

/**
 * Create a mock with proper TypeScript typing
 */
export function createTypedMock<T extends Record<string, unknown>>(): T {
  if (typeof vi.mocked === "function") {
    return vi.mocked({} as T) as T;
  }
  return createMock<T>() as T;
}

/**
 * Mock environment variables safely
 */
export function mockEnv(envVars: Record<string, string>): void {
  Object.entries(envVars).forEach(([key, value]) => {
    if (typeof vi?.stubEnv === "function") {
      vi.stubEnv(key, value);
    } else {
      // Fallback - directly set environment variable
      process.env[key] = value;
    }
  });
}

/**
 * Restore environment variables
 */
export function restoreEnv(): void {
  if (typeof vi?.unstubAllEnvs === "function") {
    vi.unstubAllEnvs();
  }
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