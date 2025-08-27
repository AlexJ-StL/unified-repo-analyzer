/**
 * Test CI/CD configuration and environment detection
 */

import { describe, expect, it, vi } from "vitest";
import {
  EnvironmentDetector,
  CITimeoutManager,
  CIPerformanceMonitor,
  CIAsyncOperations,
  CIMockUtils,
  CITestConfig,
  ciTest,
  logEnvironmentInfo,
} from "../ci-test-utils";

describe("CI Configuration", () => {
  describe("Environment Detection", () => {
    it("should detect CI environment correctly", () => {
      const originalCI = process.env.CI;

      try {
        // Test CI detection
        process.env.CI = "true";
        expect(EnvironmentDetector.isCI()).toBe(true);

        delete process.env.CI;
        expect(EnvironmentDetector.isCI()).toBe(false);

        // Test GitHub Actions detection
        process.env.GITHUB_ACTIONS = "true";
        expect(EnvironmentDetector.isCI()).toBe(true);
        expect(EnvironmentDetector.getCIProvider()).toBe("github-actions");
      } finally {
        // Restore original environment
        if (originalCI) {
          process.env.CI = originalCI;
        } else {
          delete process.env.CI;
        }
        delete process.env.GITHUB_ACTIONS;
      }
    });

    it("should detect runtime environment", () => {
      expect(typeof EnvironmentDetector.isBun()).toBe("boolean");
      expect(typeof EnvironmentDetector.isNode()).toBe("boolean");
      expect(typeof EnvironmentDetector.getPlatform()).toBe("string");
      expect(typeof EnvironmentDetector.getArchitecture()).toBe("string");
    });

    it("should get version information", () => {
      if (EnvironmentDetector.isBun()) {
        expect(EnvironmentDetector.getBunVersion()).toBeDefined();
      } else {
        expect(EnvironmentDetector.getNodeVersion()).toBeDefined();
      }
    });
  });

  describe("Timeout Management", () => {
    it("should provide appropriate timeouts for different operations", () => {
      const fastTimeout = CITimeoutManager.getTimeout("fast");
      const normalTimeout = CITimeoutManager.getTimeout("normal");
      const slowTimeout = CITimeoutManager.getTimeout("slow");
      const verySlowTimeout = CITimeoutManager.getTimeout("very-slow");

      expect(fastTimeout).toBeLessThan(normalTimeout);
      expect(normalTimeout).toBeLessThan(slowTimeout);
      expect(slowTimeout).toBeLessThan(verySlowTimeout);

      expect(fastTimeout).toBeGreaterThan(0);
      expect(verySlowTimeout).toBeLessThan(60000); // Reasonable upper bound
    });

    it("should provide retry counts based on operation type", () => {
      const fastRetries = CITimeoutManager.getRetryCount("fast");
      const normalRetries = CITimeoutManager.getRetryCount("normal");
      const slowRetries = CITimeoutManager.getRetryCount("slow");

      expect(fastRetries).toBeGreaterThanOrEqual(0);
      expect(normalRetries).toBeGreaterThanOrEqual(0);
      expect(slowRetries).toBeGreaterThanOrEqual(0);

      if (EnvironmentDetector.isCI()) {
        expect(normalRetries).toBeGreaterThan(0);
      }
    });
  });

  describe("Performance Monitoring", () => {
    it("should track performance metrics", async () => {
      const monitor = new CIPerformanceMonitor("test-performance");

      // Add some checkpoints
      await new Promise((resolve) => setTimeout(resolve, 10));
      monitor.checkpoint("checkpoint1");

      await new Promise((resolve) => setTimeout(resolve, 10));
      monitor.checkpoint("checkpoint2");

      const totalTime = monitor.getElapsedTime();
      const checkpoint1Time = monitor.getCheckpointTime("checkpoint1");
      const checkpoint2Time = monitor.getCheckpointTime("checkpoint2");

      expect(totalTime).toBeGreaterThan(0);
      expect(checkpoint1Time).toBeGreaterThan(0);
      expect(checkpoint2Time).toBeGreaterThan(checkpoint1Time);

      const report = monitor.generateReport();
      expect(report).toContain("Performance Report");
      expect(report).toContain("checkpoint1");
      expect(report).toContain("checkpoint2");
    });

    it("should track memory usage when enabled", () => {
      const monitor = new CIPerformanceMonitor("memory-test");
      monitor.checkpoint("memory-check");

      const memoryUsage = monitor.getMemoryUsage("memory-check");

      if (EnvironmentDetector.isCI() || process.env.DEBUG_MEMORY) {
        expect(memoryUsage).toBeDefined();
        expect(memoryUsage?.heapUsed).toBeGreaterThan(0);
      }
    });
  });

  describe("Async Operations", () => {
    it("should handle timeout operations", async () => {
      const fastOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "success";
      };

      const result = await CIAsyncOperations.withTimeout(
        fastOperation,
        1000,
        "fast-op"
      );
      expect(result).toBe("success");
    });

    it("should timeout slow operations", async () => {
      const slowOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return "success";
      };

      await expect(
        CIAsyncOperations.withTimeout(slowOperation, 50, "slow-op")
      ).rejects.toThrow("slow-op timed out after 50ms");
    });

    it("should retry failed operations", async () => {
      let attempts = 0;
      const flakyOperation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Not ready yet");
        }
        return "success";
      };

      const result = await CIAsyncOperations.withRetry(
        flakyOperation,
        5,
        10,
        "flaky-op"
      );
      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should combine timeout and retry", async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("Temporary failure");
        }
        return "success";
      };

      const result = await CIAsyncOperations.withTimeoutAndRetry(
        operation,
        1000,
        3,
        10,
        "combined-op"
      );
      expect(result).toBe("success");
      expect(attempts).toBe(2);
    });
  });

  describe("Mock Utilities", () => {
    it("should create stable mocks", () => {
      const mock = CIMockUtils.createStableMock(() => "test-result");
      expect(mock).toBeDefined();
      expect(typeof mock).toBe("function");
      expect(mock()).toBe("test-result");
    });

    it("should create stable timers", () => {
      const timer = CIMockUtils.createStableTimer();
      expect(timer.advanceTime).toBeDefined();
      expect(timer.cleanup).toBeDefined();

      // Test timer functionality only if fake timers are available
      if (typeof vi.useFakeTimers === "function") {
        let timerFired = false;
        setTimeout(() => {
          timerFired = true;
        }, 1000);

        timer.advanceTime(1000);
        expect(timerFired).toBe(true);
      }

      timer.cleanup();
    });
  });

  describe("Test Configuration", () => {
    it("should provide environment-specific configuration", () => {
      const config = CITestConfig.getConfig();

      expect(config.defaultTimeout).toBeGreaterThan(0);
      expect(config.fastTimeout).toBeGreaterThan(0);
      expect(config.slowTimeout).toBeGreaterThan(config.defaultTimeout);
      expect(config.maxConcurrency).toBeGreaterThan(0);

      expect(typeof config.isCI).toBe("boolean");
      expect(typeof config.isBun).toBe("boolean");
      expect(typeof config.isNode).toBe("boolean");
      expect(typeof config.platform).toBe("string");
    });
  });

  describe("CI Test Wrapper", () => {
    it("should wrap tests with CI configuration", async () => {
      const testFn = ciTest(
        "wrapped-test",
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return "test-completed";
        },
        {
          timeout: "fast",
          trackPerformance: true,
        }
      );

      const result = await testFn();
      expect(result).toBe("test-completed");
    });

    it("should skip tests based on environment", async () => {
      const ciOnlyTest = ciTest(
        "ci-only",
        async () => {
          return "should-not-run-locally";
        },
        {
          skipInLocal: true,
        }
      );

      const localOnlyTest = ciTest(
        "local-only",
        async () => {
          return "should-not-run-in-ci";
        },
        {
          skipInCI: true,
        }
      );

      if (EnvironmentDetector.isCI()) {
        const result = await localOnlyTest();
        expect(result).toBeUndefined();
      } else {
        const result = await ciOnlyTest();
        expect(result).toBeUndefined();
      }
    });
  });

  describe("Environment Logging", () => {
    it("should log environment information without errors", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        logEnvironmentInfo();
        // Should not throw any errors
        expect(true).toBe(true);
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});
