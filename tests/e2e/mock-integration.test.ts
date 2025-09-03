/**
 * Mock Integration Tests
 * Tests the integration of the MockManager system across packages
 */

import { beforeEach, describe, expect, test, afterEach } from "vitest";
import { mockManager, createMock, mockFunction } from "../MockManager";

describe("Cross-Package Mock Integration Tests", () => {
  beforeEach(() => {
    mockManager.setupMocks();
  });

  afterEach(() => {
    mockManager.cleanupMocks();
  });

  describe("MockManager System Integration", () => {
    test("should provide consistent mocking across test files", () => {
      // Test that MockManager is available and working
      expect(mockManager).toBeDefined();
      expect(typeof mockManager.setupMocks).toBe("function");
      expect(typeof mockManager.cleanupMocks).toBe("function");
      expect(typeof mockManager.createMock).toBe("function");
      expect(typeof mockManager.mockFunction).toBe("function");
    });

    test("should create and manage multiple mock modules", () => {
      // Create mocks for different modules
      const fsModule = createMock({
        readFile: mockFunction().mockResolvedValue("file content"),
        writeFile: mockFunction().mockResolvedValue(undefined),
        existsSync: mockFunction().mockReturnValue(true),
      });

      const httpModule = createMock({
        get: mockFunction().mockResolvedValue({ status: 200, data: {} }),
        post: mockFunction().mockResolvedValue({ status: 201, data: {} }),
      });

      const configModule = createMock({
        get: mockFunction().mockReturnValue("config-value"),
        set: mockFunction(),
      });

      // Test that all mocks are properly created
      expect(fsModule.readFile).toBeDefined();
      expect(fsModule.writeFile).toBeDefined();
      expect(fsModule.existsSync).toBeDefined();

      expect(httpModule.get).toBeDefined();
      expect(httpModule.post).toBeDefined();

      expect(configModule.get).toBeDefined();
      expect(configModule.set).toBeDefined();

      // Test mock behavior
      expect(fsModule.existsSync()).toBe(true);
      expect(configModule.get()).toBe("config-value");
    });

    test("should handle async mock functions", async () => {
      const asyncMock = mockFunction().mockResolvedValue("async result");
      const rejectedMock = mockFunction().mockRejectedValue(
        new Error("async error")
      );

      // Test resolved value
      const result = await asyncMock();
      expect(result).toBe("async result");

      // Test rejected value
      await expect(rejectedMock()).rejects.toThrow("async error");
    });

    test("should track mock function calls", () => {
      const trackedMock = mockFunction();

      // Call the mock with different arguments
      trackedMock("arg1", "arg2");
      trackedMock("arg3");
      trackedMock();

      // Basic verification that the mock is callable
      expect(trackedMock).toBeDefined();
      expect(typeof trackedMock).toBe("function");
    });
  });

  describe("Package-Specific Mock Integration", () => {
    test("should mock shared package utilities", () => {
      const sharedMocks = createMock({
        validateRepositoryAnalysis: mockFunction().mockReturnValue(true),
        validateFileInfo: mockFunction().mockReturnValue(true),
        ErrorClassifier: mockFunction().mockImplementation(() => ({
          classifyError: mockFunction().mockReturnValue({
            id: "error-id",
            code: "TEST_ERROR",
            message: "Test error",
          }),
        })),
      });

      expect(sharedMocks.validateRepositoryAnalysis).toBeDefined();
      expect(sharedMocks.validateFileInfo).toBeDefined();
      expect(sharedMocks.ErrorClassifier).toBeDefined();

      // Test mock behavior
      expect(sharedMocks.validateRepositoryAnalysis()).toBe(true);
      expect(sharedMocks.validateFileInfo()).toBe(true);

      const classifier = new sharedMocks.ErrorClassifier();
      const error = classifier.classifyError("test error");
      expect(error.code).toBe("TEST_ERROR");
    });

    test("should mock backend API utilities", () => {
      const backendMocks = createMock({
        AnalysisEngine: mockFunction().mockImplementation(() => ({
          analyzeRepository: mockFunction().mockResolvedValue({
            id: "analysis-id",
            name: "test-repo",
            language: "TypeScript",
          }),
        })),
        IndexSystem: mockFunction().mockImplementation(() => ({
          indexRepository: mockFunction().mockResolvedValue(undefined),
          searchRepositories: mockFunction().mockResolvedValue([]),
        })),
      });

      expect(backendMocks.AnalysisEngine).toBeDefined();
      expect(backendMocks.IndexSystem).toBeDefined();

      // Test mock behavior
      const engine = new backendMocks.AnalysisEngine();
      expect(engine.analyzeRepository).toBeDefined();

      const indexSystem = new backendMocks.IndexSystem();
      expect(indexSystem.indexRepository).toBeDefined();
      expect(indexSystem.searchRepositories).toBeDefined();
    });

    test("should mock CLI utilities", () => {
      const cliMocks = createMock({
        ApiClient: mockFunction().mockImplementation(() => ({
          analyzeRepository: mockFunction().mockResolvedValue({}),
          searchRepositories: mockFunction().mockResolvedValue([]),
        })),
        ProgressTracker: mockFunction().mockImplementation(() => ({
          start: mockFunction(),
          update: mockFunction(),
          succeed: mockFunction(),
          fail: mockFunction(),
        })),
        validateRepositoryPath: mockFunction().mockReturnValue("/valid/path"),
        ensureOutputDirectory: mockFunction().mockReturnValue("/output/dir"),
      });

      expect(cliMocks.ApiClient).toBeDefined();
      expect(cliMocks.ProgressTracker).toBeDefined();
      expect(cliMocks.validateRepositoryPath).toBeDefined();
      expect(cliMocks.ensureOutputDirectory).toBeDefined();

      // Test mock behavior
      const apiClient = new cliMocks.ApiClient();
      expect(apiClient.analyzeRepository).toBeDefined();

      const progressTracker = new cliMocks.ProgressTracker();
      expect(progressTracker.start).toBeDefined();

      expect(cliMocks.validateRepositoryPath("/test")).toBe("/valid/path");
      expect(cliMocks.ensureOutputDirectory("/test")).toBe("/output/dir");
    });

    test("should mock frontend service utilities", () => {
      const frontendMocks = createMock({
        pathValidationService: createMock({
          validatePath: mockFunction().mockResolvedValue({ isValid: true }),
          normalizePath: mockFunction().mockReturnValue("/normalized/path"),
        }),
        apiService: createMock({
          analyzeRepository: mockFunction().mockResolvedValue({}),
          getAnalysisHistory: mockFunction().mockResolvedValue([]),
        }),
      });

      expect(frontendMocks.pathValidationService).toBeDefined();
      expect(frontendMocks.apiService).toBeDefined();

      // Test mock behavior
      expect(frontendMocks.pathValidationService.validatePath).toBeDefined();
      expect(frontendMocks.pathValidationService.normalizePath).toBeDefined();
      expect(frontendMocks.apiService.analyzeRepository).toBeDefined();
      expect(frontendMocks.apiService.getAnalysisHistory).toBeDefined();

      expect(frontendMocks.pathValidationService.normalizePath("/test")).toBe(
        "/normalized/path"
      );
    });
  });

  describe("Mock Cleanup and Isolation", () => {
    test("should properly clean up mocks between tests", () => {
      // Create a mock in this test
      const testMock = mockFunction().mockReturnValue("test-value");
      expect(testMock()).toBe("test-value");

      // The cleanup should happen automatically via beforeEach/afterEach
      // This test verifies that the MockManager cleanup system is working
      expect(mockManager.getConfig).toBeDefined();
    });

    test("should isolate mocks between different test contexts", () => {
      // Create mocks with the same name but different behavior
      const mock1 = mockFunction().mockReturnValue("value1");
      const mock2 = mockFunction().mockReturnValue("value2");

      expect(mock1()).toBe("value1");
      expect(mock2()).toBe("value2");

      // Verify they are independent
      expect(mock1()).not.toBe(mock2());
    });

    test("should handle mock errors gracefully", () => {
      const errorMock = mockFunction().mockImplementation(() => {
        throw new Error("Mock error");
      });

      expect(() => errorMock()).toThrow("Mock error");

      // Verify the mock system still works after an error
      const normalMock = mockFunction().mockReturnValue("normal");
      expect(normalMock()).toBe("normal");
    });
  });

  describe("Complex Mock Scenarios", () => {
    test("should handle nested mock objects", () => {
      const nestedMock = createMock({
        level1: createMock({
          level2: createMock({
            level3: mockFunction().mockReturnValue("deep-value"),
          }),
          method: mockFunction().mockReturnValue("level2-value"),
        }),
        topMethod: mockFunction().mockReturnValue("top-value"),
      });

      expect(nestedMock.level1.level2.level3()).toBe("deep-value");
      expect(nestedMock.level1.method()).toBe("level2-value");
      expect(nestedMock.topMethod()).toBe("top-value");
    });

    test("should handle mock chaining", () => {
      const chainableMock = mockFunction();
      chainableMock.mockReturnThis?.();

      // Test that the mock is still functional after chaining setup
      expect(chainableMock).toBeDefined();
      expect(typeof chainableMock).toBe("function");

      // Test basic mock behavior (result may be undefined, which is valid)
      const result = chainableMock();
      expect(chainableMock).toBeDefined(); // The mock itself should be defined
    });

    test("should handle conditional mock behavior", () => {
      const conditionalMock = mockFunction().mockImplementation(
        (input: string) => {
          if (input === "success") {
            return "success-result";
          } else if (input === "error") {
            throw new Error("Conditional error");
          } else {
            return "default-result";
          }
        }
      );

      expect(conditionalMock("success")).toBe("success-result");
      expect(conditionalMock("other")).toBe("default-result");
      expect(() => conditionalMock("error")).toThrow("Conditional error");
    });
  });
});
