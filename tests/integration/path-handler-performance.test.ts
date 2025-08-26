/**
 * Performance and timeout integration tests for PathHandler service
 * Tests performance characteristics, timeout handling, and resource usage
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";
import { PathHandler } from "../../packages/backend/src/services/path-handler.service.js";
import type { PathValidationResult } from "../../packages/backend/src/services/path-handler.service.js";

describe("PathHandler Performance and Timeout Integration Tests", () => {
  let pathHandler: PathHandler;
  let testDir: string;
  let testFiles: string[] = [];
  const performanceMetrics: Array<{
    operation: string;
    duration: number;
    pathCount: number;
    success: boolean;
  }> = [];

  beforeAll(async () => {
    testDir = path.join(tmpdir(), "path-handler-performance-tests");
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Log performance metrics
    console.log("\n=== PathHandler Performance Metrics ===");
    performanceMetrics.forEach((metric) => {
      console.log(
        `${metric.operation}: ${metric.duration}ms (${metric.pathCount} paths, ${metric.success ? "success" : "failed"})`
      );
    });

    // Calculate averages
    const groupedMetrics = performanceMetrics.reduce(
      (acc, metric) => {
        if (!acc[metric.operation]) {
          acc[metric.operation] = { durations: [], successes: 0, total: 0 };
        }
        acc[metric.operation].durations.push(metric.duration);
        acc[metric.operation].total++;
        if (metric.success) acc[metric.operation].successes++;
        return acc;
      },
      {} as Record<
        string,
        { durations: number[]; successes: number; total: number }
      >
    );

    Object.entries(groupedMetrics).forEach(([operation, data]) => {
      const avg =
        data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      const min = Math.min(...data.durations);
      const max = Math.max(...data.durations);
      const successRate = (data.successes / data.total) * 100;
      console.log(
        `${operation} - Avg: ${avg.toFixed(2)}ms, Min: ${min}ms, Max: ${max}ms, Success: ${successRate.toFixed(1)}%`
      );
    });

    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (_error) {}
  });

  beforeEach(() => {
    pathHandler = new PathHandler();
    testFiles = [];
  });

  afterEach(async () => {
    await Promise.all(
      testFiles.map(async (file) => {
        try {
          await fs.rm(file, { recursive: true, force: true });
        } catch (_error) {
          // Ignore cleanup errors
        }
      })
    );
  });

  describe("Path Validation Performance", () => {
    it("should validate single paths within performance thresholds", async () => {
      const testPaths = [
        path.join(testDir, "simple-file.txt"),
        path.join(testDir, "nested", "deep", "file.txt"),
        path.join(testDir, "very-long-filename-that-tests-performance.txt"),
        path.join(testDir, "unicode-测试-файл.txt")
      ];

      for (const testPath of testPaths) {
        const startTime = Date.now();

        const result = await pathHandler.validatePath(testPath);

        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "single-path-validation",
          duration,
          pathCount: 1,
          success: result !== null
        });

        // Should complete within 1 second for simple paths
        expect(duration).toBeLessThan(1000);
        expect(result).toBeDefined();
      }
    });

    it("should handle batch path validation efficiently", async () => {
      // Create multiple test paths
      const testPaths = Array.from({ length: 50 }, (_, i) =>
        path.join(testDir, `batch-test-${i}.txt`)
      );

      const startTime = Date.now();

      // Validate all paths concurrently
      const results = await Promise.all(
        testPaths.map((testPath) => pathHandler.validatePath(testPath))
      );

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "batch-path-validation",
        duration,
        pathCount: testPaths.length,
        success: results.every((r) => r !== null)
      });

      // Batch validation should be more efficient than sequential
      expect(duration).toBeLessThan(testPaths.length * 100); // Less than 100ms per path
      expect(results).toHaveLength(testPaths.length);
      expect(results.every((result) => result !== null)).toBe(true);
    });

    it("should handle deep directory structures efficiently", async () => {
      // Create a deep directory structure
      const deepPath = path.join(testDir, ...Array(20).fill("deep"));

      const startTime = Date.now();

      const result = await pathHandler.validatePath(deepPath);

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "deep-path-validation",
        duration,
        pathCount: 1,
        success: result !== null
      });

      // Should handle deep paths without significant performance impact
      expect(duration).toBeLessThan(2000);
      expect(result).toBeDefined();
    });

    it("should handle paths with many components efficiently", async () => {
      // Create a path with many components
      const manyComponents = Array.from(
        { length: 100 },
        (_, i) => `component-${i}`
      );
      const complexPath = path.join(testDir, ...manyComponents);

      const startTime = Date.now();

      const result = await pathHandler.validatePath(complexPath);

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "complex-path-validation",
        duration,
        pathCount: 1,
        success: result !== null
      });

      // Should handle complex paths efficiently
      expect(duration).toBeLessThan(3000);
      expect(result).toBeDefined();
    });
  });

  describe("Permission Checking Performance", () => {
    it("should check permissions within performance thresholds", async () => {
      // Create test files with different permission scenarios
      const testFile = path.join(testDir, "permission-test.txt");
      await fs.writeFile(testFile, "test content");
      testFiles.push(testFile);

      const startTime = Date.now();

      const result = await pathHandler.checkPermissions(testFile);
      if (result && result.errors) {
        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "permission-check",
          duration,
          pathCount: 1,
          success: result.errors.length === 0
        });

        // Permission checks should be fast
        expect(duration).toBeLessThan(500);
        expect(result).toBeDefined();
      }
    });

    it("should handle batch permission checks efficiently", async () => {
      // Create multiple test files
      const testFilesLocal: string[] = [];
      for (let i = 0; i < 20; i++) {
        const testFile = path.join(testDir, `perm-test-${i}.txt`);
        await fs.writeFile(testFile, `test content ${i}`);
        testFilesLocal.push(testFile);
      }
      testFiles.push(...testFilesLocal);

      const startTime = Date.now();

      // Check permissions for all files concurrently
      const results = await Promise.all(
        testFiles.map((file) => pathHandler.checkPermissions(file))
      );

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "batch-permission-check",
        duration,
        pathCount: testFiles.length,
        success: results.every((r) => r !== null)
      });

      // Batch permission checks should be efficient
      expect(duration).toBeLessThan(testFiles.length * 50); // Less than 50ms per file
      expect(results).toHaveLength(testFiles.length);
    });
  });

  describe("Timeout Handling", () => {
    it("should respect validation timeout settings", async () => {
      const shortTimeout = 100; // 100ms
      const testPath = path.join(testDir, "timeout-test.txt");

      const startTime = Date.now();

      try {
        const result = await pathHandler.validatePath(testPath, {
          timeoutMs: shortTimeout
        });

        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "timeout-validation",
          duration,
          pathCount: 1,
          success: !result.errors.some((e) => e.code === "VALIDATION_ERROR")
        });

        // Should either complete quickly or timeout
        if (result.errors.some((e) => e.code === "VALIDATION_ERROR")) {
          expect(duration).toBeLessThan(shortTimeout + 100);
        } else {
          expect(duration).toBeLessThan(shortTimeout);
        }
      } catch (error) {
        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "timeout-validation",
          duration,
          pathCount: 1,
          success: false
        });

        expect((error as Error).name).toBe("TimeoutError");
        expect(duration).toBeLessThan(shortTimeout + 100);
      }
    });

    it("should respect permission check timeout settings", async () => {
      const shortTimeout = 50; // 50ms
      const testPath = path.join(testDir, "permission-timeout-test.txt");

      const startTime = Date.now();

      try {
        const result = await pathHandler.checkPermissions(testPath, {
          timeoutMs: shortTimeout
        });

        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "timeout-permission-check",
          duration,
          pathCount: 1,
          success: result.errors.length === 0
        });

        // Should either complete quickly or have timeout-related errors
        if (result.errors.some((e) => e.code === "PERMISSION_CHECK_ERROR")) {
          expect(duration).toBeLessThan(shortTimeout + 100);
        } else {
          expect(duration).toBeLessThan(shortTimeout);
        }
      } catch (error) {
        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "timeout-permission-check",
          duration,
          pathCount: 1,
          success: false
        });

        expect((error as Error).name).toBe("TimeoutError");
        expect(duration).toBeLessThan(shortTimeout + 100);
      }
    });

    it("should handle operation cancellation promptly", async () => {
      const controller = pathHandler.createAbortController();
      const testPath = path.join(testDir, "cancellation-test.txt");

      // Cancel after a short delay
      const cancelDelay = 50;
      setTimeout(() => controller.abort(), cancelDelay);

      const startTime = Date.now();

      try {
        const result = await pathHandler.validatePath(testPath, {
          signal: controller.signal
        });

        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "cancellation-test",
          duration,
          pathCount: 1,
          success: result.errors.some((e) => e.code === "OPERATION_CANCELLED")
        });

        // Should detect cancellation quickly
        expect(
          result.errors.some((e) => e.code === "OPERATION_CANCELLED")
        ).toBe(true);
        expect(duration).toBeLessThan(cancelDelay + 100);
      } catch (error) {
        const duration = Date.now() - startTime;

        performanceMetrics.push({
          operation: "cancellation-test",
          duration,
          pathCount: 1,
          success: true
        });

        expect((error as Error).name).toBe("AbortError");
        expect(duration).toBeLessThan(cancelDelay + 100);
      }
    });

    it("should handle multiple concurrent operations with timeouts", async () => {
      const concurrentCount = 10;
      const timeout = 200;
      const testPaths = Array.from({ length: concurrentCount }, (_, i) =>
        path.join(testDir, `concurrent-timeout-${i}.txt`)
      );

      const startTime = Date.now();

      const promises = testPaths.map((testPath) =>
        pathHandler
          .validatePath(testPath, { timeoutMs: timeout })
          .catch((error) => ({ error: error.message }))
      );

      const results = await Promise.all(promises);

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "concurrent-timeout-operations",
        duration,
        pathCount: concurrentCount,
        success: results.every((r) => r !== null)
      });

      // Concurrent operations should not significantly increase total time
      expect(duration).toBeLessThan(timeout * 2); // Should be much less than sequential
      expect(results).toHaveLength(concurrentCount);
    });
  });

  describe("Progress Reporting Performance", () => {
    it("should provide progress updates without significant overhead", async () => {
      const progressUpdates: Array<{
        stage: string;
        percentage: number;
        timestamp: number;
      }> = [];
      const testPath = path.join(testDir, "progress-test.txt");

      const startTime = Date.now();

      const _result = await pathHandler.validatePath(testPath, {
        onProgress: (progress) => {
          progressUpdates.push({
            ...progress,
            timestamp: Date.now()
          });
        }
      });

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "progress-reporting",
        duration,
        pathCount: 1,
        success: progressUpdates.length > 0
      });

      // Progress reporting should not add significant overhead
      expect(duration).toBeLessThan(2000);
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Progress updates should be reasonably spaced
      if (progressUpdates.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < progressUpdates.length; i++) {
          intervals.push(
            progressUpdates[i].timestamp - progressUpdates[i - 1].timestamp
          );
        }
        const avgInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        expect(avgInterval).toBeLessThan(500); // Updates should be frequent enough
      }
    });

    it("should handle high-frequency progress updates efficiently", async () => {
      let updateCount = 0;
      const testPath = path.join(testDir, "high-freq-progress-test.txt");

      const startTime = Date.now();

      const _result = await pathHandler.validatePath(testPath, {
        onProgress: () => {
          updateCount++;
          // Simulate some processing in the progress callback
          const _dummy = Math.random() * 1000;
        }
      });

      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "high-frequency-progress",
        duration,
        pathCount: 1,
        success: updateCount > 0
      });

      // Should handle progress callbacks efficiently
      expect(duration).toBeLessThan(3000);
      expect(updateCount).toBeGreaterThan(0);
    });
  });

  describe("Memory and Resource Usage", () => {
    it("should handle large numbers of path validations without memory leaks", async () => {
      const largeCount = 200;
      const testPaths = Array.from({ length: largeCount }, (_, i) =>
        path.join(testDir, `memory-test-${i}`, "subdir", `file-${i}.txt`)
      );

      const startTime = Date.now();
      const initialMemory = process.memoryUsage();

      // Process paths in batches to avoid overwhelming the system
      const batchSize = 20;
      const results: PathValidationResult[] = [];

      for (let i = 0; i < testPaths.length; i += batchSize) {
        const batch = testPaths.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((testPath) => pathHandler.validatePath(testPath))
        );
        results.push(...batchResults);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "memory-stress-test",
        duration,
        pathCount: largeCount,
        success: results.length === largeCount
      });

      // Memory usage should not grow excessively
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      expect(results).toHaveLength(largeCount);
      expect(memoryGrowthMB).toBeLessThan(100); // Should not use more than 100MB additional memory
      expect(duration).toBeLessThan(largeCount * 50); // Should average less than 50ms per path
    });

    it("should clean up resources properly after operations", async () => {
      const testPath = path.join(testDir, "resource-cleanup-test.txt");
      const iterations = 50;

      const initialMemory = process.memoryUsage();
      const startTime = Date.now();

      // Perform multiple operations to test resource cleanup
      for (let i = 0; i < iterations; i++) {
        const controller = pathHandler.createAbortController();

        try {
          await pathHandler.validatePath(testPath, {
            signal: controller.signal,
            timeoutMs: 100,
            onProgress: () => {
              // Progress callback to test cleanup
            }
          });
        } catch (_error) {
          // Ignore errors, we're testing resource cleanup
        }

        // Occasionally abort operations to test cleanup
        if (i % 10 === 0) {
          controller.abort();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const duration = Date.now() - startTime;

      performanceMetrics.push({
        operation: "resource-cleanup-test",
        duration,
        pathCount: iterations,
        success: true
      });

      // Memory should not grow significantly after cleanup
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      expect(memoryGrowthMB).toBeLessThan(50); // Should not leak significant memory
      expect(duration).toBeLessThan(iterations * 200); // Should average less than 200ms per operation
    });
  });

  describe("Platform-Specific Performance", () => {
    it("should perform consistently across different path formats", async () => {
      const pathFormats = [
        path.join(testDir, "format-test-1.txt"), // Native format
        `${testDir.replace(/\\/g, "/")}/format-test-2.txt`, // Forward slashes
        `${testDir.replace(/\//g, "\\")}\\format-test-3.txt`, // Backslashes
        path.join(testDir, "..", path.basename(testDir), "format-test-4.txt") // Relative components
      ];

      const durations: number[] = [];

      for (const testPath of pathFormats) {
        const startTime = Date.now();

        const result = await pathHandler.validatePath(testPath);

        const duration = Date.now() - startTime;
        durations.push(duration);

        performanceMetrics.push({
          operation: "format-performance-test",
          duration,
          pathCount: 1,
          success: result !== null
        });

        expect(result).toBeDefined();
      }

      // Performance should be consistent across formats
      const avgDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDeviation = Math.max(
        ...durations.map((d) => Math.abs(d - avgDuration))
      );

      // No single format should be significantly slower than others
      expect(maxDeviation).toBeLessThan(avgDuration * 2);
    });

    it("should handle Windows-specific performance characteristics", async () => {
      const windowsHandler = new PathHandler("win32");

      const windowsSpecificPaths = [
        "C:\\Users\\Test\\Documents\\file.txt",
        "D:\\Program Files\\Application\\bin\\app.exe",
        "\\\\server\\share\\folder\\file.txt",
        `C:\\${"a".repeat(200)}\\file.txt` // Long path
      ];

      const durations: number[] = [];

      for (const testPath of windowsSpecificPaths) {
        const startTime = Date.now();

        const result = await windowsHandler.validatePath(testPath);

        const duration = Date.now() - startTime;
        durations.push(duration);

        performanceMetrics.push({
          operation: "windows-specific-performance",
          duration,
          pathCount: 1,
          success: result !== null
        });

        expect(result).toBeDefined();
        expect(duration).toBeLessThan(1000); // Should complete within 1 second
      }

      // Windows-specific validations should be reasonably fast
      const avgDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(500);
    });
  });
});
