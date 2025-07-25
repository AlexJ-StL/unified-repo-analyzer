/**
 * Global test setup configuration
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';
import { join } from 'path';

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
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
});

afterEach(() => {
  // Cleanup after each test
});

// Global test utilities
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeValidRepositoryAnalysis(): T;
      toBeValidSearchResult(): T;
      toBeValidExportFormat(format: string): T;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidRepositoryAnalysis(received) {
    const required = ['id', 'name', 'path', 'language', 'languages', 'fileCount'];
    const missing = required.filter((prop) => !(prop in received));

    if (missing.length > 0) {
      return {
        message: () => `Expected valid repository analysis, missing: ${missing.join(', ')}`,
        pass: false,
      };
    }

    return {
      message: () => 'Expected invalid repository analysis',
      pass: true,
    };
  },

  toBeValidSearchResult(received) {
    if (!Array.isArray(received)) {
      return {
        message: () => 'Expected search result to be an array',
        pass: false,
      };
    }

    const invalidItems = received.filter(
      (item) => !item.id || !item.name || !Array.isArray(item.languages)
    );

    if (invalidItems.length > 0) {
      return {
        message: () => `Expected valid search results, found ${invalidItems.length} invalid items`,
        pass: false,
      };
    }

    return {
      message: () => 'Expected invalid search results',
      pass: true,
    };
  },

  toBeValidExportFormat(received, format) {
    switch (format) {
      case 'json':
        try {
          JSON.parse(received);
          return { message: () => 'Expected invalid JSON', pass: true };
        } catch {
          return { message: () => 'Expected valid JSON', pass: false };
        }

      case 'markdown':
        if (typeof received !== 'string' || !received.includes('#')) {
          return { message: () => 'Expected valid Markdown', pass: false };
        }
        return { message: () => 'Expected invalid Markdown', pass: true };

      case 'html':
        if (typeof received !== 'string' || !received.includes('<html')) {
          return { message: () => 'Expected valid HTML', pass: false };
        }
        return { message: () => 'Expected invalid HTML', pass: true };

      default:
        return { message: () => `Unknown format: ${format}`, pass: false };
    }
  },
});
