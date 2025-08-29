/**
 * Mock utilities for enhanced test support
 * Provides type-safe mocking helpers and common mock patterns
 */

import { vi } from 'vitest';

/**
 * Enhanced mock function with better type inference
 */
export function createMock<T extends (...args: any[]) => any>(
  implementation?: T
): ReturnType<typeof vi.fn> & T {
  const mockFn = vi.fn() as ReturnType<typeof vi.fn> & T;
  if (implementation) {
    mockFn.mockImplementation(implementation);
  }
  return mockFn;
}

/**
 * Mock an entire module with type safety
 */
export function mockModule<T extends Record<string, any>>(
  modulePath: string,
  mockImplementation: Partial<T>
): void {
  if (typeof vi.mock === 'function') {
    vi.mock(modulePath, () => mockImplementation);
  } else {
  }
}

/**
 * Create a partial mock of an object with type safety
 */
export function createPartialMock<T extends Record<string, any>>(partial: Partial<T>): T {
  return partial as T;
}

/**
 * Mock a class constructor with proper typing
 */
export function mockClass<T extends new (...args: any[]) => any>(
  _constructor: T,
  mockImplementation?: Partial<InstanceType<T>>
): ReturnType<typeof vi.fn> {
  const mockConstructor = vi.fn();

  if (mockImplementation) {
    mockConstructor.mockImplementation(() => mockImplementation);
  }

  return mockConstructor;
}

/**
 * Mock Node.js modules with common patterns
 */
export const mockNodeModules = {
  fs: () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
  }),

  path: () => ({
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => args.join('/')),
    dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
    basename: vi.fn((p) => p.split('/').pop()),
    extname: vi.fn((p) => {
      const parts = p.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    }),
  }),

  crypto: () => ({
    randomUUID: vi.fn(() => 'mock-uuid-123'),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'mock-hash'),
    })),
  }),
};

/**
 * Mock async functions with proper promise handling
 */
export function mockAsync<T>(implementation?: () => Promise<T> | T): ReturnType<typeof vi.fn> {
  const mockFn = vi.fn();

  if (implementation) {
    mockFn.mockImplementation(async () => {
      const result = implementation();
      return Promise.resolve(result);
    });
  } else {
    mockFn.mockResolvedValue(undefined);
  }

  return mockFn;
}

/**
 * Mock rejected promises for error testing
 */
export function mockRejected(error: Error | string): ReturnType<typeof vi.fn> {
  const mockFn = vi.fn();
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  mockFn.mockRejectedValue(errorObj);
  return mockFn;
}

/**
 * Create a spy on an existing object method
 */
export function spyOn<T extends Record<string, any>, K extends keyof T>(
  object: T,
  method: K
): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(object, method);
}

/**
 * Mock timers with common patterns and automatic cleanup
 */
export const mockTimers = {
  setup: () => {
    if (typeof vi.useFakeTimers === 'function') {
      vi.useFakeTimers();
    }
  },

  cleanup: () => {
    if (typeof vi.clearAllTimers === 'function') {
      vi.clearAllTimers();
    }
    if (typeof vi.useRealTimers === 'function') {
      vi.useRealTimers();
    }
  },

  advanceTime: (ms: number) => {
    if (typeof vi.advanceTimersByTime === 'function') {
      vi.advanceTimersByTime(ms);
    }
  },

  runAllTimers: () => {
    if (typeof vi.runAllTimers === 'function') {
      vi.runAllTimers();
    }
  },

  /**
   * Setup timers with automatic cleanup registration
   */
  setupWithCleanup: async () => {
    if (typeof vi.useFakeTimers === 'function') {
      vi.useFakeTimers();
    }
    try {
      const { registerCleanupTask } = await import('./cleanup-manager');
      registerCleanupTask(
        'mock-timers',
        () => {
          if (typeof vi.clearAllTimers === 'function') {
            vi.clearAllTimers();
          }
          if (typeof vi.useRealTimers === 'function') {
            vi.useRealTimers();
          }
        },
        1
      );
    } catch {
      // Cleanup manager not available, skip registration
    }
  },
};

/**
 * Mock environment variables
 */
export function mockEnv(envVars: Record<string, string>): void {
  Object.entries(envVars).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
}

/**
 * Restore environment variables
 */
export function restoreEnv(): void {
  vi.unstubAllEnvs();
}

/**
 * Common test patterns for mocking external dependencies
 */
export const commonMocks = {
  logger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setRequestId: vi.fn(),
    getConfig: vi.fn(() => ({})),
  }),

  database: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    query: vi.fn(),
    transaction: vi.fn(),
  }),

  httpClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }),
};
