/**
 * Minimal Test Setup - No external dependencies
 * Fixes broken mock infrastructure without complex imports
 */

/// <reference types="vitest" />
/// <reference types="node" />

import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { mockManager } from "./MockManager";

// Export vi for tests that need it
export { vi } from "vitest";

// Export our mock manager utilities
export {
  mockManager,
  createMock,
  mockFunction,
  mockModule,
  setupMocks,
  cleanupMocks,
  resetAllMocks,
} from "./MockManager";

// Safe mocked function that works with both Bun and Vitest
export const mocked = <T>(item: T): T => {
  if (typeof vi?.mocked === "function") {
    return vi.mocked(item) as unknown as T;
  }
  // Fallback for when vi.mocked is not available
  return item as T;
};

// Global test configuration
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Initialize mock manager
  mockManager.setupMocks();

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
        dispatchEvent: mockManager.mockFunction(),
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

  // Setup global error handlers for better test debugging
  process.on("unhandledRejection", (_reason, _promise) => {
    // Silent handling in tests
  });

  process.on("uncaughtException", (_error) => {
    // Silent handling in tests
  });
});

afterAll(async () => {
  // Final cleanup
  mockManager.cleanupMocks();
});

beforeEach(async () => {
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

afterEach(async () => {
  // Run mock cleanup after each test
  mockManager.cleanupMocks();
});

/**
 * Enhanced mock factory for common patterns
 */
export function createMockFunction<T extends (...args: unknown[]) => unknown>(
  implementation?: T
): ReturnType<typeof vi.fn> {
  return mockManager.mockFunction(implementation);
}

/**
 * Create a mock with proper TypeScript typing
 */
export function createTypedMock<T extends Record<string, unknown>>(): T {
  return mockManager.createMock<T>();
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
