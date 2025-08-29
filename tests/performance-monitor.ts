/**
 * Test performance monitoring utilities
 * Provides utilities for monitoring and optimizing test performance
 */

/**
 * Performance metrics interface
 */
export interface TestPerformanceMetrics {
  testName: string;
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  timestamp: number;
}

/**
 * Performance monitor class
 */
export class TestPerformanceMonitor {
  private static instance: TestPerformanceMonitor;
  private metrics: TestPerformanceMetrics[] = [];
  private startTimes: Map<string, number> = new Map();

  static getInstance(): TestPerformanceMonitor {
    if (!TestPerformanceMonitor.instance) {
      TestPerformanceMonitor.instance = new TestPerformanceMonitor();
    }
    return TestPerformanceMonitor.instance;
  }

  /**
   * Start monitoring a test
   */
  startTest(testName: string): void {
    this.startTimes.set(testName, performance.now());
  }

  /**
   * End monitoring a test and record metrics
   */
  endTest(testName: string): TestPerformanceMetrics | null {
    const startTime = this.startTimes.get(testName);
    if (!startTime) {
      return null;
    }

    const duration = performance.now() - startTime;
    const memoryUsage = this.getMemoryUsage();

    const metrics: TestPerformanceMetrics = {
      testName,
      duration,
      memoryUsage,
      timestamp: Date.now(),
    };

    this.metrics.push(metrics);
    this.startTimes.delete(testName);

    return metrics;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
      };
    }
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
    };
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): TestPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get slow tests (above threshold)
   */
  getSlowTests(thresholdMs = 5000): TestPerformanceMetrics[] {
    return this.metrics.filter((metric) => metric.duration > thresholdMs);
  }

  /**
   * Get memory-intensive tests
   */
  getMemoryIntensiveTests(thresholdMB = 100): TestPerformanceMetrics[] {
    const thresholdBytes = thresholdMB * 1024 * 1024;
    return this.metrics.filter((metric) => metric.memoryUsage.heapUsed > thresholdBytes);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.metrics.length === 0) {
      return 'No performance metrics recorded.';
    }

    const totalTests = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageDuration = totalDuration / totalTests;
    const slowTests = this.getSlowTests();
    const memoryIntensiveTests = this.getMemoryIntensiveTests();

    let report = '\n=== Test Performance Report ===\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`;
    report += `Average Duration: ${averageDuration.toFixed(2)}ms\n`;

    if (slowTests.length > 0) {
      report += '\nSlow Tests (>5s):\n';
      slowTests
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .forEach((test) => {
          report += `  - ${test.testName}: ${(test.duration / 1000).toFixed(2)}s\n`;
        });
    }

    if (memoryIntensiveTests.length > 0) {
      report += '\nMemory Intensive Tests (>100MB):\n';
      memoryIntensiveTests
        .sort((a, b) => b.memoryUsage.heapUsed - a.memoryUsage.heapUsed)
        .slice(0, 10)
        .forEach((test) => {
          const memoryMB = (test.memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
          report += `  - ${test.testName}: ${memoryMB}MB\n`;
        });
    }

    return report;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.startTimes.clear();
  }
}

/**
 * Performance monitoring decorator for tests
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  testName: string,
  testFunction: T
): T {
  return ((...args: any[]) => {
    const monitor = TestPerformanceMonitor.getInstance();
    monitor.startTest(testName);

    try {
      const result = testFunction(...args);

      if (result && typeof result.then === 'function') {
        // Handle async functions
        return result.finally(() => {
          monitor.endTest(testName);
        });
      }
      // Handle sync functions
      monitor.endTest(testName);
      return result;
    } catch (error) {
      monitor.endTest(testName);
      throw error;
    }
  }) as T;
}

/**
 * Memory usage checker
 */
export class MemoryUsageChecker {
  private static warningThreshold = 500 * 1024 * 1024; // 500MB
  private static criticalThreshold = 1024 * 1024 * 1024; // 1GB

  static checkMemoryUsage(): {
    status: 'ok' | 'warning' | 'critical';
    usage: number;
    message: string;
  } {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return {
        status: 'ok',
        usage: 0,
        message: 'Memory usage monitoring not available',
      };
    }

    const usage = process.memoryUsage();
    const heapUsed = usage.heapUsed;

    if (heapUsed > MemoryUsageChecker.criticalThreshold) {
      return {
        status: 'critical',
        usage: heapUsed,
        message: `Critical memory usage: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`,
      };
    }
    if (heapUsed > MemoryUsageChecker.warningThreshold) {
      return {
        status: 'warning',
        usage: heapUsed,
        message: `High memory usage: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`,
      };
    }
    return {
      status: 'ok',
      usage: heapUsed,
      message: `Memory usage: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  static async forceGarbageCollection(): Promise<void> {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
      // Wait a bit for GC to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Test timeout utilities
 */
export class TestTimeoutManager {
  private static defaultTimeout = 30000; // 30 seconds
  private static slowTestThreshold = 10000; // 10 seconds

  static createTimeoutPromise(timeoutMs: number, testName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Test "${testName}" timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = TestTimeoutManager.defaultTimeout,
    testName = 'unknown'
  ): Promise<T> {
    return Promise.race([promise, TestTimeoutManager.createTimeoutPromise(timeoutMs, testName)]);
  }

  static isSlowTest(duration: number): boolean {
    return duration > TestTimeoutManager.slowTestThreshold;
  }
}
