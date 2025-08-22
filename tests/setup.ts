/**
 * Global test setup configuration
 */

/// <reference types="vitest" />
/// <reference types="node" />

import '@testing-library/jest-dom/vitest';
import { join } from 'node:path';
import { config } from 'dotenv';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

// Load test environment variables
config({ path: join(__dirname, '../.env.test') });

// Global test configuration
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Increase timeout for CI environments
  if (process.env.CI) {
    process.env.TEST_TIMEOUT = '60000';
  }

  // Mock console methods in test environment
  if (process.env.SILENT_TESTS === 'true') {
    global.console = {
      ...console,
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  // Setup DOM environment if jsdom is available
  if (typeof window !== 'undefined') {
    // Mock window.matchMedia for frontend tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: jest.fn(),
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
  // Cleanup after all tests
});

beforeEach(async () => {
  // Reset mocks before each test
  // Vitest mocks are automatically reset

  // Cleanup DOM if in jsdom environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const { cleanup } = await import('@testing-library/react');
      cleanup();
    } catch (_error) {
      // @testing-library/react not available, skip
    }
  }
});

afterEach(() => {
  // Cleanup after each test
});

// Global test utilities
// Custom assertions can be added here if needed

// Type declarations for global scope
declare global {
  interface Global {
    ResizeObserver: typeof ResizeObserver;
    IntersectionObserver: typeof IntersectionObserver;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (id: number) => void;
  }
}
