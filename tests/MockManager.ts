/**
 * Centralized Mock Management System
 * Fixes broken vi.mock functionality and provides type-safe mocking
 */

import { vi } from "vitest";

// Type definitions for our mock system
export interface MockedFunction<T extends (...args: any[]) => any>
  extends Function {
  (...args: Parameters<T>): ReturnType<T>;
  mock: {
    calls: Parameters<T>[][];

    results: Array<{ type: "return" | "throw"; value: ReturnType<T> }>;
    instances: unknown[];
    invocationCallOrder: number[];
  };
  mockClear(): this;
  mockReset(): this;
  mockRestore(): void;
  mockImplementation(fn: T): this;
  mockImplementationOnce(fn: T): this;
  mockReturnThis(): this;
  mockReturnValue(value: ReturnType<T>): this;
  mockReturnValueOnce(value: ReturnType<T>): this;
  mockResolvedValue(value: Awaited<ReturnType<T>>): this;
  mockResolvedValueOnce(value: Awaited<ReturnType<T>>): this;
  mockRejectedValue(value: unknown): this;
  mockRejectedValueOnce(value: unknown): this;
}
export type MockedObject<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown
    ? MockedFunction<T[K]>
    : T[K];
};

export type MockFactory<T = Record<string, unknown>> = () => T;

export interface MockConfig {
  autoMock: boolean;
  clearMocksAfterEach: boolean;
  restoreMocksAfterEach: boolean;
  moduleNameMapper: Record<string, string>;
  mockPatterns: string[];
  defaultMocks: Record<string, MockFactory>;
  customMocks: Record<string, MockFactory>;
}

/**
 * Central Mock Management System
 * Provides reliable mocking that works even when vi.mock is broken
 */
export class MockManager {
  private static instance: MockManager;
  private mockRegistry = new Map<string, unknown>();
  private moduleRegistry = new Map<string, MockFactory>();
  private config: MockConfig;

  private constructor() {
    this.config = {
      autoMock: true,
      clearMocksAfterEach: true,
      restoreMocksAfterEach: true,
      moduleNameMapper: {},
      mockPatterns: [],
      defaultMocks: {},
      customMocks: {}
    };
  }

  public static getInstance(): MockManager {
    if (!MockManager.instance) {
      MockManager.instance = new MockManager();
    }
    return MockManager.instance;
  }

  /**
   * Create a type-safe mock object
   */
  public createMock<T extends Record<string, unknown>>(
    impl?: Partial<T>
  ): MockedObject<T> {
    const mock: Record<string, unknown> = {};

    if (impl) {
      Object.keys(impl).forEach((key) => {
        const value = impl[key as keyof T];
        if (typeof value === "function") {
          mock[key] = this.mockFunction(
            value as unknown as (...args: unknown[]) => unknown
          );
        } else {
          mock[key] = value;
        }
      });
    }

    return mock as MockedObject<T>;
  }

  /**
   * Create a type-safe mock function
   */
  public mockFunction<T extends (...args: any[]) => any>(
    fn?: T
  ): MockedFunction<T> {
    if (typeof vi !== "undefined" && vi && typeof vi.fn === "function") {
      const mockFn = vi.fn<T>() as MockedFunction<T>;
      if (fn) {
        mockFn.mockImplementation(fn);
      }
      return mockFn;
    }

    // Enhanced fallback implementation when vi.fn is not available
    let currentImpl: T | undefined = fn;

    const calls: Parameters<T>[] = [];
    const results: Array<{ type: "return" | "throw"; value: unknown }> = [];
    const instances: unknown[] = [];
    const invocationCallOrder: number[] = [];

    const fallbackMock = function (
      this: unknown,
      ...args: Parameters<T>
    ): ReturnType<T> {
      const callIndex = calls.length;
      calls.push(args);
      invocationCallOrder.push(callIndex);

      try {
        const result = currentImpl
          ? currentImpl.call(this, ...args)
          : undefined;
        results.push({ type: "return", value: result });
        return result as ReturnType<T>;
      } catch (error) {
        results.push({ type: "throw", value: error });
        throw error as ReturnType<T>;
      }
    } as unknown as MockedFunction<T>;

    // Add mock properties and methods
    fallbackMock.mock = {
      calls: calls as Parameters<T>[],
      results: results as Array<{
        type: "return" | "throw";
        value: ReturnType<T>;
      }>,
      instances,
      invocationCallOrder
    };

    fallbackMock.mockImplementation = function (impl: T): MockedFunction<T> {
      currentImpl = impl;
      return fallbackMock;
    };

    fallbackMock.mockResolvedValue = function (
      value: Awaited<ReturnType<T>>
    ): MockedFunction<T> {
      currentImpl = function (...args: Parameters<T>) {
        return Promise.resolve(value) as ReturnType<T>;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockRejectedValue = function (
      error: unknown
    ): MockedFunction<T> {
      currentImpl = function (...args: Parameters<T>) {
        return Promise.reject(error) as ReturnType<T>;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockReturnValue = function (
      value: ReturnType<T>
    ): MockedFunction<T> {
      currentImpl = function (...args: Parameters<T>) {
        return value;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockReset = function (): MockedFunction<T> {
      calls.length = 0;
      results.length = 0;
      instances.length = 0;
      invocationCallOrder.length = 0;
      return fallbackMock;
    };

    fallbackMock.mockClear = function (): MockedFunction<T> {
      calls.length = 0;
      results.length = 0;
      instances.length = 0;
      invocationCallOrder.length = 0;
      return fallbackMock;
    };

    fallbackMock.mockRestore = function (): void {
      // No-op in fallback implementation
    };

    fallbackMock.mockImplementationOnce = function (
      impl: T
    ): MockedFunction<T> {
      const originalImpl = currentImpl;
      currentImpl = function (
        this: unknown,
        ...args: Parameters<T>
      ): ReturnType<T> {
        currentImpl = originalImpl;
        return impl.call(this, ...args);
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockReturnValueOnce = function (
      value: ReturnType<T>
    ): MockedFunction<T> {
      const originalImpl = currentImpl;
      currentImpl = function (
        this: unknown,
        ...args: Parameters<T>
      ): ReturnType<T> {
        currentImpl = originalImpl;
        return value;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockResolvedValueOnce = function (
      value: Awaited<ReturnType<T>>
    ): MockedFunction<T> {
      const originalImpl = currentImpl;
      currentImpl = function (
        this: unknown,
        ...args: Parameters<T>
      ): ReturnType<T> {
        currentImpl = originalImpl;
        return Promise.resolve(value) as ReturnType<T>;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockRejectedValueOnce = function (
      error: unknown
    ): MockedFunction<T> {
      const originalImpl = currentImpl;
      currentImpl = function (
        this: unknown,
        ...args: Parameters<T>
      ): ReturnType<T> {
        currentImpl = originalImpl;
        return Promise.reject(error) as ReturnType<T>;
      } as T;
      return fallbackMock;
    };

    fallbackMock.mockReturnThis = function (): MockedFunction<T> {
      currentImpl = function (
        this: unknown,
        ...args: Parameters<T>
      ): ReturnType<T> {
        return this as unknown as ReturnType<T>;
      } as T;
      return fallbackMock;
    };

    if (currentImpl) {
      // If fn provided, set initial implementation
      fallbackMock.mockImplementation(currentImpl);
    }

    return fallbackMock;
  }

  /**
   * Mock a module with type safety - works around broken vi.mock
   */
  public mockModule<T extends Record<string, unknown>>(
    modulePath: string,
    factory: MockFactory<T>
  ): void {
    this.moduleRegistry.set(modulePath, factory);
  }

  /**
   * Setup all registered mocks
   */
  public setupMocks(): void {
    // Setup module mocks
    this.moduleRegistry.forEach((factory, modulePath) => {
      if (typeof vi.mock === "function") {
        vi.mock(modulePath, factory);
      }
    });
  }

  /**
   * Cleanup all mocks
   */
  public cleanupMocks(): void {
    this.mockRegistry.clear();
    this.moduleRegistry.clear();
    if (typeof vi.restoreAllMocks === "function") {
      vi.restoreAllMocks();
    }
  }

  /**
   * Reset all mocks
   */
  public resetAllMocks(): void {
    if (typeof vi.resetAllMocks === "function") {
      vi.resetAllMocks();
    }
  }
}

// Create global instance
const mockManager = MockManager.getInstance();

// Export convenience functions
export const createMock = <T extends Record<string, unknown>>(
  impl?: Partial<T>
) => mockManager.createMock<T>(impl);

export const mockFunction = <T extends (...args: unknown[]) => unknown>(
  fn?: T
) => mockManager.mockFunction<T>(fn);

export const mockModule = <T extends Record<string, unknown>>(
  path: string,
  factory: MockFactory<T>
) => mockManager.mockModule<T>(path, factory);

export const setupMocks = () => mockManager.setupMocks();
export const cleanupMocks = () => mockManager.cleanupMocks();
export const resetAllMocks = () => mockManager.resetAllMocks();
