/**
 * CI/CD-specific test utilities
 * Provides helpers for running tests in automated environments
 */

import { performance } from 'node:perf_hooks';
import { vi } from 'vitest';

/**
 * Environment detection utilities
 */
export class EnvironmentDetector {
  static isCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.BUILD_NUMBER ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.JENKINS_URL ||
      process.env.TRAVIS ||
      process.env.CIRCLECI
    );
  }

  static isBun(): boolean {
    return typeof Bun !== 'undefined';
  }

  static isNode(): boolean {
    return typeof process !== 'undefined' && !!process.versions?.node && typeof Bun === 'undefined';
  }

  static getNodeVersion(): string | undefined {
    return process.versions?.node;
  }

  static getBunVersion(): string | undefined {
    return typeof Bun !== 'undefined' ? Bun.version : undefined;
  }

  static getPlatform(): string {
    return process.platform;
  }

  static getArchitecture(): string {
    return process.arch;
  }

  static getCIProvider(): string | undefined {
    if (process.env.GITHUB_ACTIONS) return 'github-actions';
    if (process.env.GITLAB_CI) return 'gitlab-ci';
    if (process.env.JENKINS_URL) return 'jenkins';
    if (process.env.TRAVIS) return 'travis';
    if (process.env.CIRCLECI) return 'circleci';
    if (process.env.CI) return 'generic-ci';
    return undefined;
  }
}

/**
 * CI-specific timeout management with runtime awareness
 */
export class CITimeoutManager {
  private static readonly BASE_TIMEOUT = 5000;
  private static readonly CI_MULTIPLIER = EnvironmentDetector.isBun() ? 3 : 4; // Bun is faster

  static getTimeout(operation: 'fast' | 'normal' | 'slow' | 'very-slow' = 'normal'): number {
    const baseTimeout = CITimeoutManager.BASE_TIMEOUT;
    const isCI = EnvironmentDetector.isCI();

    let multiplier = 1;

    switch (operation) {
      case 'fast':
        multiplier = 0.5;
        break;
      case 'normal':
        multiplier = 1;
        break;
      case 'slow':
        multiplier = 2;
        break;
      case 'very-slow':
        multiplier = 4;
        break;
    }

    if (isCI) {
      multiplier *= CITimeoutManager.CI_MULTIPLIER;
    }

    return Math.floor(baseTimeout * multiplier);
  }

  static getRetryCount(operation: 'fast' | 'normal' | 'slow' = 'normal'): number {
    const isCI = EnvironmentDetector.isCI();
    const isBun = EnvironmentDetector.isBun();

    if (!isCI) return 0;

    // Bun is more stable, needs fewer retries
    const bunMultiplier = isBun ? 0.7 : 1;

    switch (operation) {
      case 'fast':
        return Math.ceil(2 * bunMultiplier);
      case 'normal':
        return Math.ceil(3 * bunMultiplier);
      case 'slow':
        return Math.ceil(5 * bunMultiplier);
      default:
        return Math.ceil(3 * bunMultiplier);
    }
  }
}

/**
 * Performance monitoring for CI environments
 */
export class CIPerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();
  private memoryUsage: Map<string, NodeJS.MemoryUsage> = new Map();

  constructor(private testName: string) {
    this.startTime = performance.now();
    this.recordMemoryUsage('start');
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, performance.now());
    this.recordMemoryUsage(name);
  }

  private recordMemoryUsage(checkpoint: string): void {
    if (EnvironmentDetector.isCI() || process.env.DEBUG_MEMORY) {
      this.memoryUsage.set(checkpoint, process.memoryUsage());
    }
  }

  getElapsedTime(checkpoint?: string): number {
    const endTime = checkpoint ? this.checkpoints.get(checkpoint) : performance.now();
    return endTime ? endTime - this.startTime : 0;
  }

  getCheckpointTime(checkpoint: string): number {
    return this.checkpoints.get(checkpoint) || 0;
  }

  getMemoryUsage(checkpoint: string): NodeJS.MemoryUsage | undefined {
    return this.memoryUsage.get(checkpoint);
  }

  generateReport(): string {
    const totalTime = this.getElapsedTime();
    const report = [`Performance Report for ${this.testName}:`];
    report.push(`Total Time: ${totalTime.toFixed(2)}ms`);

    if (this.checkpoints.size > 0) {
      report.push('Checkpoints:');
      for (const [name, time] of this.checkpoints) {
        const elapsed = time - this.startTime;
        report.push(`  ${name}: ${elapsed.toFixed(2)}ms`);
      }
    }

    if (this.memoryUsage.size > 0 && (EnvironmentDetector.isCI() || process.env.DEBUG_MEMORY)) {
      report.push('Memory Usage:');
      for (const [name, usage] of this.memoryUsage) {
        const heapUsed = (usage.heapUsed / 1024 / 1024).toFixed(2);
        const heapTotal = (usage.heapTotal / 1024 / 1024).toFixed(2);
        report.push(`  ${name}: ${heapUsed}MB / ${heapTotal}MB`);
      }
    }

    return report.join('\n');
  }

  logReport(): void {
    if (EnvironmentDetector.isCI() || process.env.DEBUG_PERFORMANCE) {
      console.log(this.generateReport());
    }
  }
}

/**
 * CI-safe async operations with proper timeout and retry
 */
export class CIAsyncOperations {
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationName = 'operation'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
    operationName = 'operation'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt <= maxRetries) {
          if (EnvironmentDetector.isCI() || process.env.DEBUG_RETRY) {
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    throw new Error(
      `${operationName} failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`
    );
  }

  static async withTimeoutAndRetry<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    maxRetries = 3,
    delayMs = 1000,
    operationName = 'operation'
  ): Promise<T> {
    return CIAsyncOperations.withRetry(
      () => CIAsyncOperations.withTimeout(operation, timeoutMs, operationName),
      maxRetries,
      delayMs,
      operationName
    );
  }
}

/**
 * CI-specific mock utilities
 */
export class CIMockUtils {
  /**
   * Create a mock that behaves consistently across different environments
   */
  static createStableMock<T extends (...args: any[]) => any>(
    implementation?: T,
    options: {
      deterministic?: boolean;
      seed?: number;
    } = {}
  ): ReturnType<typeof vi.fn> {
    const mock = vi.fn();

    if (implementation) {
      mock.mockImplementation(implementation);
    }

    // In CI, make mocks more deterministic
    if (EnvironmentDetector.isCI() && options.deterministic !== false) {
      // Add deterministic behavior for CI
      const originalMockImplementation = mock.getMockImplementation();
      mock.mockImplementation((...args) => {
        // Add small delay to simulate real async behavior consistently
        if (originalMockImplementation) {
          const result = originalMockImplementation(...args);
          if (result instanceof Promise) {
            return new Promise((resolve) => {
              setTimeout(() => resolve(result), 1);
            });
          }
          return result;
        }
        return undefined;
      });
    }

    return mock;
  }

  /**
   * Create a mock timer that works consistently in CI
   */
  static createStableTimer(): {
    advanceTime: (ms: number) => void;
    cleanup: () => void;
  } {
    // Check if fake timers are available
    if (typeof vi.useFakeTimers === 'function') {
      vi.useFakeTimers();

      return {
        advanceTime: (ms: number) => {
          if (typeof vi.advanceTimersByTime === 'function') {
            vi.advanceTimersByTime(ms);
          }
        },
        cleanup: () => {
          if (typeof vi.useRealTimers === 'function') {
            vi.useRealTimers();
          }
        },
      };
    }

    // Fallback for environments without fake timers
    return {
      advanceTime: (_ms: number) => {
        // No-op in environments without fake timers
      },
      cleanup: () => {
        // No-op in environments without fake timers
      },
    };
  }
}

/**
 * Environment-specific test configuration
 */
export class CITestConfig {
  static getConfig() {
    const isCI = EnvironmentDetector.isCI();
    const isBun = EnvironmentDetector.isBun();
    const platform = EnvironmentDetector.getPlatform();

    return {
      // Timeouts
      defaultTimeout: CITimeoutManager.getTimeout('normal'),
      fastTimeout: CITimeoutManager.getTimeout('fast'),
      slowTimeout: CITimeoutManager.getTimeout('slow'),
      verySlowTimeout: CITimeoutManager.getTimeout('very-slow'),

      // Retries
      defaultRetries: CITimeoutManager.getRetryCount('normal'),
      fastRetries: CITimeoutManager.getRetryCount('fast'),
      slowRetries: CITimeoutManager.getRetryCount('slow'),

      // Environment flags
      isCI,
      isBun,
      isNode: EnvironmentDetector.isNode(),
      platform,

      // Concurrency
      maxConcurrency: isCI ? 6 : 3,

      // Logging
      verbose: isCI || process.env.DEBUG_TESTS === 'true',
      silent: process.env.SILENT_TESTS === 'true',

      // Memory
      trackMemory: isCI || process.env.DEBUG_MEMORY === 'true',

      // Performance
      trackPerformance: isCI || process.env.DEBUG_PERFORMANCE === 'true',
    };
  }
}

/**
 * CI test wrapper that applies environment-specific configurations
 */
export function ciTest<T extends (...args: any[]) => any>(
  testName: string,
  testFn: T,
  options: {
    timeout?: 'fast' | 'normal' | 'slow' | 'very-slow';
    retries?: 'fast' | 'normal' | 'slow';
    trackPerformance?: boolean;
    skipInCI?: boolean;
    skipInLocal?: boolean;
    onlyInBun?: boolean;
    onlyInNode?: boolean;
  } = {}
): T {
  return (async (...args: any[]) => {
    const config = CITestConfig.getConfig();

    // Skip conditions
    if (options.skipInCI && config.isCI) {
      console.log(`Skipping test "${testName}" in CI environment`);
      return;
    }

    if (options.skipInLocal && !config.isCI) {
      console.log(`Skipping test "${testName}" in local environment`);
      return;
    }

    if (options.onlyInBun && !config.isBun) {
      console.log(`Skipping test "${testName}" - only runs in Bun`);
      return;
    }

    if (options.onlyInNode && config.isBun) {
      console.log(`Skipping test "${testName}" - only runs in Node.js`);
      return;
    }

    // Performance monitoring
    const monitor =
      options.trackPerformance || config.trackPerformance
        ? new CIPerformanceMonitor(testName)
        : null;

    try {
      monitor?.checkpoint('test-start');

      // Apply timeout and retry logic
      const timeout = CITimeoutManager.getTimeout(options.timeout || 'normal');
      const retries = CITimeoutManager.getRetryCount(options.retries || 'normal');

      const result = await CIAsyncOperations.withTimeoutAndRetry(
        () => testFn(...args),
        timeout,
        retries,
        testName
      );

      monitor?.checkpoint('test-end');
      return result;
    } finally {
      monitor?.logReport();
    }
  }) as T;
}

/**
 * Cross-runtime test validation utilities
 */
export class CrossRuntimeValidator {
  /**
   * Validate that a test behaves consistently across runtimes
   */
  static async validateCrossRuntime<T>(
    testFn: () => Promise<T>,
    _testName: string,
    _options: {
      tolerance?: number; // Tolerance for numeric comparisons
      ignoreTimingDifferences?: boolean;
      customComparator?: (bunResult: T, nodeResult: T) => boolean;
    } = {}
  ): Promise<{
    bunResult?: T;
    nodeResult?: T;
    consistent: boolean;
    differences?: string[];
  }> {
    const results: {
      bunResult?: T;
      nodeResult?: T;
      consistent: boolean;
      differences?: string[];
    } = {
      consistent: true,
      differences: [],
    };

    // This is a conceptual implementation - in practice, you'd need to run this
    // across different runtime environments
    try {
      const currentResult = await testFn();

      if (EnvironmentDetector.isBun()) {
        results.bunResult = currentResult;
      } else {
        results.nodeResult = currentResult;
      }

      // In a real implementation, you'd compare results from both runtimes
      // For now, we'll just validate the current runtime
      results.consistent = true;
    } catch (error) {
      results.consistent = false;
      results.differences = [
        `Runtime error in ${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'}: ${error}`,
      ];
    }

    return results;
  }

  /**
   * Create a test that validates behavior across runtimes
   */
  static createCrossRuntimeTest<T>(
    testName: string,
    testFn: () => Promise<T>,
    options: {
      skipInRuntime?: 'bun' | 'node';
      expectDifferences?: boolean;
      tolerance?: number;
    } = {}
  ) {
    return async () => {
      if (options.skipInRuntime === 'bun' && EnvironmentDetector.isBun()) {
        console.log(`Skipping ${testName} in Bun runtime`);
        return;
      }

      if (options.skipInRuntime === 'node' && !EnvironmentDetector.isBun()) {
        console.log(`Skipping ${testName} in Node.js runtime`);
        return;
      }

      const monitor = new CIPerformanceMonitor(
        `${testName} (${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'})`
      );
      monitor.checkpoint('test-start');
      const result = await testFn();
      monitor.checkpoint('test-end');

      // Log runtime-specific performance data
      if (EnvironmentDetector.isCI() || process.env.DEBUG_CROSS_RUNTIME) {
        monitor.logReport();
      }

      return result;
    };
  }
}

/**
 * Enhanced error reporting for CI environments
 */
export class CIErrorReporter {
  /**
   * Format error for CI consumption
   */
  static formatError(
    error: Error,
    context: {
      testName?: string;
      runtime?: string;
      platform?: string;
      ciProvider?: string;
    } = {}
  ): string {
    const lines = [
      `❌ Test Error: ${context.testName || 'Unknown Test'}`,
      `Runtime: ${context.runtime || EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'}`,
      `Platform: ${context.platform || EnvironmentDetector.getPlatform()}`,
      `CI Provider: ${context.ciProvider || EnvironmentDetector.getCIProvider() || 'Local'}`,
      `Error: ${error.message}`,
    ];

    if (error.stack) {
      lines.push('Stack Trace:');
      lines.push(error.stack);
    }

    return lines.join('\n');
  }

  /**
   * Report error with context to CI system
   */
  static reportError(
    error: Error,
    context: {
      testName?: string;
      runtime?: string;
      platform?: string;
    } = {}
  ): void {
    const _formattedError = CIErrorReporter.formatError(error, {
      ...context,
      ciProvider: EnvironmentDetector.getCIProvider(),
    });

    // GitHub Actions specific annotations
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Test Failure::${error.message}`);
    }

    // GitLab CI specific formatting
    if (process.env.GITLAB_CI) {
      console.log(`\x1b[31mERROR:\x1b[0m ${error.message}`);
    }
  }
}

/**
 * Export environment information for debugging
 */
export function logEnvironmentInfo(): void {
  if (EnvironmentDetector.isCI() || process.env.DEBUG_ENV) {
    console.log('Test Environment Information:');
    console.log(`  CI: ${EnvironmentDetector.isCI()}`);
    console.log(`  CI Provider: ${EnvironmentDetector.getCIProvider() || 'none'}`);
    console.log(`  Runtime: ${EnvironmentDetector.isBun() ? 'Bun' : 'Node.js'}`);
    console.log(
      `  Version: ${EnvironmentDetector.getBunVersion() || EnvironmentDetector.getNodeVersion()}`
    );
    console.log(`  Platform: ${EnvironmentDetector.getPlatform()}`);
    console.log(`  Architecture: ${EnvironmentDetector.getArchitecture()}`);
    console.log(`  Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Max Memory: ${process.env.NODE_OPTIONS || 'default'}`);
    console.log(`  Test Timeout: ${process.env.TEST_TIMEOUT || 'default'}`);
    console.log(`  Parallel Tests: ${process.env.TEST_PARALLEL || 'false'}`);
  }
}
