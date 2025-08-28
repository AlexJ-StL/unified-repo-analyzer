/**
 * Simple Regression Prevention Validation
 * Tests core regression prevention functionality
 */

import { describe, expect, it, vi } from "vitest";
import { MockValidation, RegressionPrevention } from "./regression-prevention";
import { AssertionHelpers } from "./assertion-helpers";

describe("Regression Prevention Validation", () => {
  describe("Mock Infrastructure", () => {
    it("should validate mocking infrastructure works", () => {
      expect(() => {
        MockValidation.validateMockingInfrastructure();
      }).not.toThrow();
    });

    it("should create and validate mock functions", () => {
      const mockFn = MockValidation.createValidatedMock(
        "testMock",
        () => "result"
      );

      expect(mockFn).toBeDefined();
      expect(typeof mockFn).toBe("function");
      expect(mockFn.mock).toBeDefined(); // Check for mock properties instead
      expect(mockFn()).toBe("result");

      MockValidation.validateMock(mockFn, "testMock");
    });
  });

  describe("Assertion Helpers", () => {
    it("should validate array structures", () => {
      const testArray = [
        { id: 1, name: "item1" },
        { id: 2, name: "item2" },
      ];

      expect(() => {
        AssertionHelpers.validateArrayStructure(testArray, {
          exactLength: 2,
          itemValidator: (item) => {
            expect(item).toHaveProperty("id");
            expect(item).toHaveProperty("name");
          },
        });
      }).not.toThrow();
    });

    it("should validate search results", () => {
      const searchResults = [
        { id: "1", name: "repo1", path: "/path1", languages: ["JavaScript"] },
        { id: "2", name: "repo2", path: "/path2", languages: ["TypeScript"] },
      ];

      expect(() => {
        AssertionHelpers.validateSearchResults(searchResults, {
          requiredProperties: ["id", "name", "path"],
          optionalProperties: ["languages"],
          maxResults: 10,
        });
      }).not.toThrow();
    });

    it("should validate repository structure", () => {
      const repository = {
        id: "repo-1",
        name: "Test Repository",
        path: "/path/to/repo",
        languages: ["JavaScript", "TypeScript"],
        frameworks: ["React"],
        tags: ["frontend"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        AssertionHelpers.validateRepositoryStructure(repository);
      }).not.toThrow();
    });

    it("should validate mock function calls", () => {
      const mockFn = vi.fn();
      mockFn("arg1", "arg2");
      mockFn("arg3");

      expect(() => {
        AssertionHelpers.validateMockCalls(mockFn, {
          callCount: 2,
          calledWith: [["arg1", "arg2"], ["arg3"]],
        });
      }).not.toThrow();
    });
  });

  describe("Class API Validation", () => {
    it("should validate complete class APIs", () => {
      class TestClass {
        property1 = "value";
        property2 = 42;

        method1() {
          return "result1";
        }
        method2(param: string) {
          return param;
        }
        method3() {
          return true;
        }
      }

      expect(() => {
        RegressionPrevention.validateClassAPI(
          TestClass,
          ["method1", "method2", "method3"],
          ["property1", "property2"]
        );
      }).not.toThrow();
    });

    it("should detect missing methods", () => {
      class IncompleteClass {
        method1() {
          return "result";
        }
        // Missing method2
      }

      expect(() => {
        RegressionPrevention.validateClassAPI(IncompleteClass, [
          "method1",
          "method2",
        ]);
      }).toThrow("Class is missing required method: method2");
    });
  });

  describe("Configuration Validation", () => {
    it("should validate configuration objects", () => {
      const config = {
        timeout: 5000,
        retries: 3,
        enabled: true,
        tags: ["test", "ci"],
        metadata: { version: "1.0.0" },
      };

      const schema = {
        timeout: { type: "number", required: true },
        retries: { type: "number", required: true },
        enabled: { type: "boolean", required: true },
        tags: { type: "array", required: false },
        metadata: { type: "object", required: false },
      };

      expect(() => {
        AssertionHelpers.validateConfiguration(config, schema);
      }).not.toThrow();
    });
  });

  describe("Error Structure Validation", () => {
    it("should validate error objects", () => {
      const error = new Error("Test error message");
      error.name = "TestError";

      expect(() => {
        AssertionHelpers.validateErrorStructure(error, "TestError");
      }).not.toThrow();
    });
  });

  describe("Performance Validation", () => {
    it("should validate performance metrics", () => {
      const metrics = {
        duration: 150,
        memoryUsage: 1024,
        operations: 100,
      };

      expect(() => {
        AssertionHelpers.validatePerformanceMetrics(metrics, {
          maxDuration: 200,
          maxMemory: 2048,
          requiredMetrics: ["duration", "operations"],
        });
      }).not.toThrow();
    });
  });

  describe("Comprehensive Validation", () => {
    it("should run all regression prevention checks", () => {
      expect(() => {
        RegressionPrevention.runAllChecks();
      }).not.toThrow();
    });
  });
});
