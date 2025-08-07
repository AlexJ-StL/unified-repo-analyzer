/**
 * Global test setup configuration
 */

import { join } from 'node:path';
import { config } from 'dotenv';
import { afterAll, afterEach, beforeAll, beforeEach, expect } from 'vitest';

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
    // Import and setup jest-dom matchers for frontend tests
    try {
      const { default: jestDom } = await import('@testing-library/jest-dom');
      expect.extend(jestDom);
    } catch (_error) {
      // jest-dom not available, skip
    }

    // Mock window.matchMedia for frontend tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock requestAnimationFrame
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 16);
    };

    global.cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
    };
  }
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
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
