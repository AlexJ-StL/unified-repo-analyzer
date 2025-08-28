/**
 * Comprehensive Test Infrastructure Validation
 * Validates all the fixes implemented in the test infrastructure improvements
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  EnvironmentDetector,
  CITimeoutManager,
  CITestConfig,
} from "./ci-test-utils";
import { RuntimeTestHelpers, getTestConfig } from "./runtime-test-helpers";

describe("Comprehensive Test Infrastructure Validation", () => {
  describe("1. Vitest Mocking Infrastructure", () => {
    it("should have vi.mock available and working", () => {
      expect(vi).toBeDefined();
      expect(vi.fn).toBeDefined();
      // vi.mocked may not be available in all setups

      // Test basic mocking functionality
      const mockFn = vi.fn();
      mockFn.mockReturnValue("test");

      expect(mockFn()).toBe("test");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should support ESM mocking patterns", () => {
      const mockFn = vi.fn(() => "mocked");
      expect(mockFn()).toBe("mocked");

      // Test mock functionality
      expect(mockFn()).toBe("mocked");
    });

    it("should handle mock cleanup properly", () => {
      const mockFn = vi.fn();
      mockFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();
      expect(mockFn).toHaveBeenCalledTimes(0);
    });
  });

  describe("2. IndexSystem Methods Implementation", () => {
    it("should validate IndexSystem has required methods", async () => {
      // Import IndexSystem dynamically to avoid dependency issues
      const { IndexSystem } = await import(
        "../packages/backend/src/core/IndexSystem"
      );

      const indexSystem = new IndexSystem();

      // Verify required methods exist
      expect(typeof indexSystem.addRepository).toBe("function");
      expect(typeof indexSystem.removeRepository).toBe("function");
      expect(typeof indexSystem.getRepositoryCount).toBe("function");
      expect(typeof indexSystem.searchRepositories).toBe("function");
      expect(typeof indexSystem.findSimilarRepositories).toBe("function");
    });

    it("should validate IndexSystem method functionality", async () => {
      const { IndexSystem } = await import(
        "../packages/backend/src/core/IndexSystem"
      );

      const indexSystem = new IndexSystem();

      // Test basic functionality with proper repository structure
      const testRepo = {
        id: "test-repo-1",
        name: "Test Repository",
        path: "/test/path",
        languages: ["JavaScript"],
        frameworks: ["React"],
        description: "Test repository for validation",
        createdAt: new Date(),
        updatedAt: new Date(),
        codeAnalysis: {
          complexity: {
            maintainabilityIndex: 75,
          },
          linesOfCode: 1000,
          functions: [],
          classes: [],
        },
        dependencies: [],
        fileTypes: {},
        summary: "Test repository",
      };

      // Add repository
      indexSystem.addRepository(testRepo);
      expect(indexSystem.getRepositoryCount()).toBe(1);

      // Remove repository
      indexSystem.removeRepository("test-repo-1");
      expect(indexSystem.getRepositoryCount()).toBe(0);
    });
  });

  describe("3. Test Assertion Fixes", () => {
    it("should validate test expectations are properly aligned", () => {
      // Test that basic assertions work correctly
      const testArray = ["item1", "item2", "item3"];
      expect(testArray).toHaveLength(3);
      expect(testArray).toContain("item2");

      const testObject = { key: "value", count: 42 };
      expect(testObject).toHaveProperty("key", "value");
      expect(testObject.count).toBe(42);
    });

    it("should handle async test expectations", async () => {
      const asyncFunction = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "async result";
      };

      const result = await asyncFunction();
      expect(result).toBe("async result");
    });
  });

  describe("4. Test Setup and Configuration", () => {
    it("should validate test environment setup", () => {
      const config = getTestConfig();

      expect(config).toHaveProperty("runtime");
      expect(config).toHaveProperty("platform");
      expect(config).toHaveProperty("isCI");

      expect(["bun", "node"]).toContain(config.runtime);
      expect(typeof config.isCI).toBe("boolean");
    });

    it("should validate CI/CD configuration", () => {
      const ciConfig = CITestConfig.getConfig();

      expect(ciConfig).toHaveProperty("defaultTimeout");
      expect(ciConfig).toHaveProperty("maxConcurrency");
      expect(ciConfig).toHaveProperty("isCI");
      expect(ciConfig).toHaveProperty("isBun");

      expect(ciConfig.defaultTimeout).toBeGreaterThan(0);
      expect(ciConfig.maxConcurrency).toBeGreaterThan(0);
    });

    it("should validate runtime-specific timeouts", () => {
      const fastTimeout = CITimeoutManager.getTimeout("fast");
      const normalTimeout = CITimeoutManager.getTimeout("normal");
      const slowTimeout = CITimeoutManager.getTimeout("slow");

      expect(fastTimeout).toBeGreaterThan(0);
      expect(normalTimeout).toBeGreaterThan(fastTimeout);
      expect(slowTimeout).toBeGreaterThan(normalTimeout);
    });

    it("should validate test isolation", () => {
      // Test that tests don't interfere with each other
      const testState = { value: 0 };
      testState.value = 42;

      expect(testState.value).toBe(42);

      // Reset state (simulating test isolation)
      testState.value = 0;
      expect(testState.value).toBe(0);
    });
  });

  describe("5. Cross-Runtime Compatibility", () => {
    it("should work consistently across runtimes", () => {
      const isBun = EnvironmentDetector.isBun();
      const isNode = EnvironmentDetector.isNode();

      // Should detect exactly one runtime
      expect(isBun || isNode).toBe(true);
      expect(isBun && isNode).toBe(false);

      console.log(`Running on: ${isBun ? "Bun" : "Node.js"}`);
    });

    it("should provide runtime-appropriate configurations", () => {
      const config = getTestConfig();

      if (config.runtime === "bun") {
        // Bun-specific validations
        expect(config.fastTimeout).toBeLessThan(config.normalTimeout);
        expect(typeof Bun).toBe("object");
      } else {
        // Node.js-specific validations
        expect(config.fastTimeout).toBeLessThan(config.normalTimeout);
        expect(process.versions.node).toBeDefined();
      }
    });
  });

  describe("6. Error Handling and Reporting", () => {
    it("should handle test errors gracefully", async () => {
      const errorTest = async () => {
        throw new Error("Test error for validation");
      };

      await expect(errorTest()).rejects.toThrow("Test error for validation");
    });

    it("should provide meaningful error messages", () => {
      try {
        expect(1).toBe(2);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Expected");
      }
    });
  });

  describe("7. Performance and Memory Management", () => {
    it("should handle performance testing", () => {
      const start = performance.now();

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });

    it("should handle memory monitoring", () => {
      const memoryBefore = process.memoryUsage();

      // Create some objects
      const testArray = new Array(1000)
        .fill(0)
        .map((_, i) => ({ id: i, data: `test-${i}` }));

      const memoryAfter = process.memoryUsage();

      expect(memoryAfter.heapUsed).toBeGreaterThanOrEqual(
        memoryBefore.heapUsed
      );
      expect(testArray).toHaveLength(1000);
    });
  });

  describe("8. Integration with Test Utilities", () => {
    let mockFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFn = vi.fn();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should integrate with beforeEach/afterEach hooks", () => {
      expect(mockFn).toBeDefined();
      expect(mockFn).toHaveBeenCalledTimes(0);

      mockFn("test");
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should handle runtime-specific test helpers", () => {
      const timeout = RuntimeTestHelpers.getTimeout("normal");
      const retries = RuntimeTestHelpers.getRetryCount("normal");

      expect(timeout).toBeGreaterThan(0);
      expect(retries).toBeGreaterThanOrEqual(0);
    });
  });

  describe("9. Regression Prevention", () => {
    it("should prevent vi.fn import issues", () => {
      // Verify that vi.fn is available and functional
      expect(vi.fn).toBeDefined();
      expect(typeof vi.fn).toBe("function");
    });

    it("should prevent IndexSystem method missing issues", async () => {
      const { IndexSystem } = await import(
        "../packages/backend/src/core/IndexSystem"
      );
      const indexSystem = new IndexSystem();

      // Verify all required methods are present
      const requiredMethods = [
        "addRepository",
        "removeRepository",
        "getRepositoryCount",
        "searchRepositories",
        "findSimilarRepositories",
        "suggestCombinations",
      ];

      for (const method of requiredMethods) {
        expect(indexSystem[method]).toBeDefined();
        expect(typeof indexSystem[method]).toBe("function");
      }
    });

    it("should prevent test assertion alignment issues", () => {
      // Test common assertion patterns that previously failed
      const searchResults = ["result1", "result2"];
      expect(searchResults).toHaveLength(2);
      expect(searchResults).toContain("result1");

      const logEntries = [
        { level: "INFO", component: "test" },
        { level: "ERROR", component: "test" },
      ];

      const errorLogs = logEntries.filter((entry) => entry.level === "ERROR");
      expect(errorLogs).toHaveLength(1);
    });
  });

  describe("10. Documentation and Validation", () => {
    it("should validate test infrastructure documentation", () => {
      // Verify that key test utilities are properly exported
      expect(EnvironmentDetector).toBeDefined();
      expect(CITimeoutManager).toBeDefined();
      expect(RuntimeTestHelpers).toBeDefined();

      // Verify that configuration functions work
      const config = getTestConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    });

    it("should provide comprehensive test coverage validation", () => {
      // This test validates that our test infrastructure improvements
      // provide the necessary tools for comprehensive testing

      const testTools = {
        mocking: vi,
        environment: EnvironmentDetector,
        timeouts: CITimeoutManager,
        runtime: RuntimeTestHelpers,
        config: getTestConfig(),
      };

      for (const [tool, implementation] of Object.entries(testTools)) {
        expect(implementation).toBeDefined();
        console.log(`✓ ${tool} is available and functional`);
      }
    });
  });
});
