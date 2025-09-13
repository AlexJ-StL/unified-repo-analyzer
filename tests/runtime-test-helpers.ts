/**
 * Runtime-specific test helpers for cross-platform compatibility
 */

import { vi } from 'vitest';
import { CIErrorReporter, CITimeoutManager, EnvironmentDetector } from './ci-test-utils';

/**
 * Runtime-aware test utilities
 */
/**
 * Create runtime test helper utilities
 */
export function createRuntimeTestHelper() {
  /**
   * Get runtime-appropriate timeout for test operations
   */
  const getTimeout = (operation: 'fast' | 'normal' | 'slow' | 'very-slow' = 'normal'): number => {
    return CITimeoutManager.getTimeout(operation);
  };

  /**
   * Get runtime-appropriate retry count
   */
  const getRetryCount = (operation: 'fast' | 'normal' | 'slow' = 'normal'): number => {
    return CITimeoutManager.getRetryCount(operation);
  };

  /**
   * Create a runtime-aware mock that behaves consistently
   */
  const createRuntimeMock = <T extends (...args: unknown[]) => unknown>(
    implementation?: T,
    options: {
      deterministic?: boolean;
      bunBehavior?: T;
      nodeBehavior?: T;
    } = {}
  ): ReturnType<typeof vi.fn> => {
    const mock = vi.fn();

    // Use runtime-specific behavior if provided
    if (EnvironmentDetector.isBun() && options.bunBehavior) {
      mock.mockImplementation(options.bunBehavior);
    } else if (!EnvironmentDetector.isBun() && options.nodeBehavior) {
      mock.mockImplementation(options.nodeBehavior);
    } else if (implementation) {
      mock.mockImplementation(implementation);
    }

    // Make behavior more deterministic in CI
    if (EnvironmentDetector.isCI() && options.deterministic !== false) {
      const originalImpl = mock.getMockImplementation();
      mock.mockImplementation((...args) => {
        if (originalImpl) {
          const result = originalImpl(...args);
          // Add consistent small delay for async operations
          if (result instanceof Promise) {
            return new Promise((resolve) => {
              setTimeout(() => resolve(result), EnvironmentDetector.isBun() ? 1 : 2);
            });
          }
          return result;
        }
        return undefined;
      });
    }

    return mock;
  };

  /**
   * Execute a test with runtime-specific error handling
   */
  const executeWithErrorHandling = async <T>(
    testFn: () => Promise<T>,
    testName: string,
    options: {
      timeout?: 'fast' | 'normal' | 'slow' | 'very-slow';
      retries?: 'fast' | 'normal' | 'slow';
      expectRuntimeDifferences?: boolean;
    } = {}
  ): Promise<T> => {
    const timeout = getTimeout(options.timeout || 'normal');
    const retries = getRetryCount(options.retries || 'normal');

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          testFn(),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Test "${testName}" timed out after ${timeout}ms`));
            }, timeout);
          }),
        ]);
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          const delay = Math.min(1000 * 2 ** attempt, 5000); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Report the final error with context
    CIErrorReporter.reportError(lastError ?? new Error('No error captured'), {
      testName,
      runtime: EnvironmentDetector.isBun() ? 'Bun' : 'Node.js',
      platform: EnvironmentDetector.getPlatform(),
    });

    throw lastError ?? new Error('No error captured');
  };

  /**
   * Skip test based on runtime conditions
   */
  const skipIf = (condition: {
    runtime?: 'bun' | 'node';
    platform?: string;
    ci?: boolean;
    reason?: string;
  }): boolean => {
    if (condition.runtime === 'bun' && EnvironmentDetector.isBun()) {
      console.log(`Skipping test: ${condition.reason || 'Bun runtime'}`);
      return true;
    }

    if (condition.runtime === 'node' && !EnvironmentDetector.isBun()) {
      console.log(`Skipping test: ${condition.reason || 'Node.js runtime'}`);
      return true;
    }

    if (condition.platform && EnvironmentDetector.getPlatform() === condition.platform) {
      console.log(`Skipping test: ${condition.reason || `Platform ${condition.platform}`}`);
      return true;
    }

    if (condition.ci !== undefined && EnvironmentDetector.isCI() !== condition.ci) {
      console.log(`Skipping test: ${condition.reason || `CI environment: ${condition.ci}`}`);
      return true;
    }

    return false;
  };

  /**
   * Get runtime-specific test configuration
   */
  const getTestConfig = () => {
    return {
      runtime: EnvironmentDetector.isBun() ? 'bun' : 'node',
      platform: EnvironmentDetector.getPlatform(),
      isCI: EnvironmentDetector.isCI(),
      ciProvider: EnvironmentDetector.getCIProvider(),
      version: EnvironmentDetector.getBunVersion() || EnvironmentDetector.getNodeVersion(),

      // Timeouts
      fastTimeout: getTimeout('fast'),
      normalTimeout: getTimeout('normal'),
      slowTimeout: getTimeout('slow'),
      verySlowTimeout: getTimeout('very-slow'),

      // Retries
      fastRetries: getRetryCount('fast'),
      normalRetries: getRetryCount('normal'),
      slowRetries: getRetryCount('slow'),

      // Memory settings
      memoryLimit: EnvironmentDetector.isBun()
        ? undefined // Bun manages memory automatically
        : process.env.NODE_OPTIONS?.includes('max-old-space-size')
          ? process.env.NODE_OPTIONS
          : '--max-old-space-size=4096',
    };
  };

  /**
   * Create a test wrapper that applies runtime-specific configurations
   */
  const createRuntimeTest = <T extends (...args: unknown[]) => unknown>(
    testName: string,
    testFn: T,
    options: {
      timeout?: 'fast' | 'normal' | 'slow' | 'very-slow';
      retries?: 'fast' | 'normal' | 'slow';
      skipIf?: {
        runtime?: 'bun' | 'node';
        platform?: string;
        ci?: boolean;
        reason?: string;
      };
      expectRuntimeDifferences?: boolean;
    } = {}
  ): T => {
    return (async (...args: unknown[]) => {
      // Check skip conditions
      if (options.skipIf && skipIf(options.skipIf)) {
        return;
      }

      // Execute with runtime-specific error handling
      return await executeWithErrorHandling(async () => testFn(...args), testName, {
        timeout: options.timeout,
        retries: options.retries,
        expectRuntimeDifferences: options.expectRuntimeDifferences,
      });
    }) as T;
  };

  return {
    getTimeout,
    getRetryCount,
    createRuntimeMock,
    executeWithErrorHandling,
    skipIf,
    getTestConfig,
    createRuntimeTest,
  };
}

/**
 * Runtime-specific assertion helpers
 */
/**
 * Runtime-specific assertion helpers
 */
export function assertRuntime() {
  /**
   * Assert with runtime-specific tolerance
   */
  const assertWithTolerance = (
    actual: number,
    expected: number,
    tolerance?: number,
    message?: string
  ): void => {
    const defaultTolerance = EnvironmentDetector.isBun() ? 0.1 : 0.2; // Bun is more precise
    const actualTolerance = tolerance ?? defaultTolerance;

    const diff = Math.abs(actual - expected);
    if (diff > actualTolerance) {
      throw new Error(
        message ||
          `Expected ${actual} to be within ${actualTolerance} of ${expected}, but difference was ${diff} (Runtime: ${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'})`
      );
    }
  };

  /**
   * Assert timing with runtime-specific expectations
   */
  const assertTiming = (actualMs: number, expectedMs: number, operation = 'operation'): void => {
    // Bun is generally faster, so we adjust expectations
    const runtimeMultiplier = EnvironmentDetector.isBun() ? 0.8 : 1.2;
    const adjustedExpected = expectedMs * runtimeMultiplier;

    // Allow for more variance in CI environments
    const tolerance = EnvironmentDetector.isCI() ? adjustedExpected * 0.5 : adjustedExpected * 0.3;

    assertWithTolerance(
      actualMs,
      adjustedExpected,
      tolerance,
      `${operation} timing assertion failed (Runtime: ${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'}, CI: ${EnvironmentDetector.isCI()})`
    );
  };

  /**
   * Assert memory usage with runtime-specific expectations
   */
  const assertMemoryUsage = (
    actualMB: number,
    expectedMB: number,
    operation = 'operation'
  ): void => {
    // Bun typically uses less memory
    const runtimeMultiplier = EnvironmentDetector.isBun() ? 0.7 : 1.0;
    const adjustedExpected = expectedMB * runtimeMultiplier;

    // Allow for more variance in different environments
    const tolerance = adjustedExpected * 0.4;

    assertWithTolerance(
      actualMB,
      adjustedExpected,
      tolerance,
      `${operation} memory usage assertion failed (Runtime: ${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'})`
    );
  };

  return {
    assertWithTolerance,
    assertTiming,
    assertMemoryUsage,
  };
}

/**
 * Export convenience functions
 */
export const {
  getTimeout,
  getRetryCount,
  createRuntimeMock,
  executeWithErrorHandling,
  skipIf,
  getTestConfig,
  createRuntimeTest,
} = createRuntimeTestHelper();

export const { assertWithTolerance, assertTiming, assertMemoryUsage } = assertRuntime();
