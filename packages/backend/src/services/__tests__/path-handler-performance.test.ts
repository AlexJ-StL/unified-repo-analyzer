import fs from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PathHandler } from '../path-handler.service.js';
import { performanceMonitor } from '../performance-monitor.service.js';

vi.mock('../logger.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logger.service.js')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock fs promises
vi.mock('node:fs/promises', () => ({
  default: {
    stat: vi.fn(),
    access: vi.fn(),
  },
  constants: {
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  },
}));

describe('PathHandler Performance', () => {
  let pathHandler: PathHandler;
  const mockStat = vi.mocked(fs.stat);
  const mockAccess = vi.mocked(fs.access);

  beforeEach(() => {
    pathHandler = new PathHandler('win32', { enabled: true });

    // Mock successful file system operations
    mockStat.mockResolvedValue({
      isDirectory: () => true,
      size: 1024,
    } as any);

    mockAccess.mockResolvedValue(undefined);

    // Clear performance data
    performanceMonitor.clearData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    pathHandler.clearCache();
  });

  describe('Single Path Validation Performance', () => {
    it('should validate paths within acceptable time limits', async () => {
      const testPath = 'C:\\Users\\Test\\Documents';
      const maxAcceptableTime = 100; // 100ms

      const startTime = Date.now();
      const result = await pathHandler.validatePath(testPath);
      const duration = Date.now() - startTime;

      expect(result.metadata.exists).toBe(true);
      expect(duration).toBeLessThan(maxAcceptableTime);

      // Check that performance metrics were recorded
      const metrics = performanceMonitor.getMetrics();
      const pathValidationMetrics = metrics.filter((m) => m.name === 'path-validation.duration');
      expect(pathValidationMetrics.length).toBeGreaterThan(0);
    });

    it('should show performance improvement with caching', async () => {
      const testPath = 'C:\\Users\\Test\\Documents';
      const iterations = 5;
      const timings: number[] = [];

      // First validation (cache miss)
      let startTime = Date.now();
      await pathHandler.validatePath(testPath);
      timings.push(Date.now() - startTime);

      // Subsequent validations (cache hits)
      for (let i = 0; i < iterations - 1; i++) {
        startTime = Date.now();
        await pathHandler.validatePath(testPath);
        timings.push(Date.now() - startTime);
      }

      // Cache hits should be significantly faster
      const firstValidation = timings[0];
      const averageCacheHit =
        timings.slice(1).reduce((sum, t) => sum + t, 0) / (timings.length - 1);

      expect(averageCacheHit).toBeLessThan(firstValidation * 0.5); // At least 50% faster

      // Check cache statistics
      const cacheStats = pathHandler.getCacheStats();
      expect(cacheStats.hits).toBe(iterations - 1);
      expect(cacheStats.misses).toBe(1);
      expect(cacheStats.hitRate).toBeCloseTo(0.8, 1); // 4/5 = 0.8
    });

    it('should handle timeout scenarios gracefully', async () => {
      const testPath = 'C:\\Users\\Test\\VerySlowPath';
      const shortTimeout = 50; // 50ms

      // Mock slow file system operation
      mockStat.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isDirectory: () => true,
                  size: 1024,
                } as any),
              100
            )
          ) // 100ms delay
      );

      const startTime = Date.now();

      try {
        const result = await pathHandler.validatePath(testPath, {
          timeoutMs: shortTimeout,
        });
        // If it doesn't timeout, it should still be invalid due to the slow operation
        expect(result.isValid).toBe(false);
      } catch (error) {
        // Timeout error is expected
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('timeout');
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(shortTimeout + 50); // Allow some margin
    });
  });

  describe('Concurrent Path Validation Performance', () => {
    it('should handle concurrent validations efficiently', async () => {
      const paths = [
        'C:\\Users\\Test1\\Documents',
        'C:\\Users\\Test2\\Documents',
        'C:\\Users\\Test3\\Documents',
        'C:\\Users\\Test4\\Documents',
        'C:\\Users\\Test5\\Documents',
      ];

      const startTime = Date.now();
      const promises = paths.map((path) => pathHandler.validatePath(path));
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;

      // All validations should succeed
      results.forEach((result) => {
        expect(result.metadata.exists).toBe(true);
      });

      // Concurrent execution should be faster than sequential
      const maxSequentialTime = paths.length * 50; // Assume 50ms per validation
      expect(totalDuration).toBeLessThan(maxSequentialTime);

      // Check performance metrics
      const stats = performanceMonitor.getOperationStats('path-validation');
      expect(stats.count).toBe(paths.length);
      expect(stats.successRate).toBe(1.0);
    });

    it('should maintain performance under load', async () => {
      const concurrentRequests = 20;
      const testPath = 'C:\\Users\\LoadTest\\Documents';

      const startTime = Date.now();
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        pathHandler.validatePath(`${testPath}\\File${i}`)
      );
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;

      // All validations should succeed
      results.forEach((result) => {
        expect(result.metadata.exists).toBe(true);
      });

      // Average time per validation should be reasonable
      const averageTime = totalDuration / concurrentRequests;
      expect(averageTime).toBeLessThan(100); // 100ms average

      // Check that performance monitoring captured the load
      const report = performanceMonitor.generateReport();
      expect(report.summary.totalOperations).toBeGreaterThanOrEqual(concurrentRequests);
    });
  });

  describe('Cache Performance', () => {
    it('should demonstrate cache performance benefits', async () => {
      const testPaths = [
        'C:\\Users\\Cache1\\Documents',
        'C:\\Users\\Cache2\\Documents',
        'C:\\Users\\Cache3\\Documents',
      ];

      // Warm up cache
      for (const path of testPaths) {
        await pathHandler.validatePath(path);
      }

      // Measure cache hit performance
      const cacheHitTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        for (const path of testPaths) {
          const startTime = Date.now();
          await pathHandler.validatePath(path);
          cacheHitTimes.push(Date.now() - startTime);
        }
      }

      const averageCacheHitTime =
        cacheHitTimes.reduce((sum, t) => sum + t, 0) / cacheHitTimes.length;

      // Cache hits should be very fast
      expect(averageCacheHitTime).toBeLessThan(10); // Less than 10ms

      // Check cache statistics
      const cacheStats = pathHandler.getCacheStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0.8); // High hit rate
    });

    it('should handle cache invalidation performance', async () => {
      const testPaths = Array.from({ length: 100 }, (_, i) => `C:\\Users\\Test${i}\\Documents`);

      // Populate cache
      for (const path of testPaths) {
        await pathHandler.validatePath(path);
      }

      let cacheStats = pathHandler.getCacheStats();
      expect(cacheStats.size).toBe(testPaths.length);

      // Measure cache invalidation performance
      const startTime = Date.now();
      pathHandler.clearCache();
      const invalidationTime = Date.now() - startTime;

      // Cache invalidation should be fast
      expect(invalidationTime).toBeLessThan(50); // Less than 50ms

      cacheStats = pathHandler.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during repeated validations', async () => {
      const testPath = 'C:\\Users\\MemoryTest\\Documents';
      const iterations = 100;

      // Get initial memory usage
      const initialUsage = await performanceMonitor.getCurrentResourceUsage();

      // Perform many validations
      for (let i = 0; i < iterations; i++) {
        await pathHandler.validatePath(`${testPath}\\File${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait a bit for cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get final memory usage
      const finalUsage = await performanceMonitor.getCurrentResourceUsage();

      // Memory increase should be reasonable (less than 10MB)
      const memoryIncrease = finalUsage.memory.used - initialUsage.memory.used;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      expect(memoryIncreaseMB).toBeLessThan(10);

      console.log(
        `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB for ${iterations} validations`
      );
    });

    it('should maintain reasonable cache memory usage', async () => {
      const maxCacheSize = 1000;
      const pathHandler = new PathHandler('win32', {
        enabled: true,
        maxEntries: maxCacheSize,
      });

      // Fill cache beyond limit
      for (let i = 0; i < maxCacheSize + 100; i++) {
        await pathHandler.validatePath(`C:\\Users\\Test${i}\\Documents`);
      }

      const cacheStats = pathHandler.getCacheStats();

      // Cache should not exceed maximum size
      expect(cacheStats.size).toBeLessThanOrEqual(maxCacheSize);

      // Memory usage should be reasonable
      expect(cacheStats.cacheMemoryUsage).toBeLessThan(maxCacheSize * 2048); // 2KB per entry max
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in path validation', async () => {
      const testPath = 'C:\\Users\\RegressionTest\\Documents';
      let regressionDetected = false;

      // Listen for regression events
      performanceMonitor.on('performanceRegression', (data) => {
        if (data.operation === 'path-validation') {
          regressionDetected = true;
        }
      });

      // Establish baseline with normal operations
      for (let i = 0; i < 15; i++) {
        await pathHandler.validatePath(testPath);
      }

      // Simulate slow operation (regression)
      mockStat.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isDirectory: () => true,
                  size: 1024,
                } as any),
              200
            )
          ) // Much slower
      );

      await pathHandler.validatePath(testPath);

      // Give time for regression detection
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(regressionDetected).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance benchmarks for different path types', async () => {
      const benchmarks = [
        { type: 'simple', path: 'C:\\Users\\Test', maxTime: 250 },
        {
          type: 'nested',
          path: 'C:\\Users\\Test\\Documents\\Projects\\MyProject',
          maxTime: 300,
        },
        { type: 'unc', path: '\\\\server\\share\\folder', maxTime: 350 },
      ];

      for (const benchmark of benchmarks) {
        const startTime = Date.now();
        const result = await pathHandler.validatePath(benchmark.path);
        const duration = Date.now() - startTime;

        expect(result.metadata.exists).toBe(true);
        expect(duration).toBeLessThan(benchmark.maxTime);

        console.log(
          `${benchmark.type} path validation: ${duration}ms (max: ${benchmark.maxTime}ms)`
        );
      }
    });

    it('should generate performance report', async () => {
      // Perform various operations
      const operations = [
        'C:\\Users\\Report1\\Documents',
        'C:\\Users\\Report2\\Documents',
        'C:\\Users\\Report3\\Documents',
      ];

      for (const path of operations) {
        await pathHandler.validatePath(path);
      }

      // Wait for resource monitoring
      await new Promise((resolve) => setTimeout(resolve, 200));

      const report = performanceMonitor.generateReport();

      expect(report.summary.totalOperations).toBeGreaterThan(0);
      expect(report.summary.averageResponseTime).toBeGreaterThan(0);
      expect(report.operations.length).toBeGreaterThan(0);
      expect(report.resourceUsage.current).toBeDefined();

      console.log('Performance Report:', JSON.stringify(report, null, 2));
    });
  });
});
