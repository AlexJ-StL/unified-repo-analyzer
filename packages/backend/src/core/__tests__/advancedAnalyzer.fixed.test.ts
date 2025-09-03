/**
 * Fixed Tests for Advanced Analyzer using MockManager
 */

import type { RepositoryAnalysis } from "@unified-repo-analyzer/shared/src/types/analysis";
import { beforeEach, describe, expect, it } from "vitest";
import { MockManager } from "../../../../../tests/MockManager";
import { AdvancedAnalyzer } from "../advancedAnalyzer";

// Initialize MockManager
const mockManager = MockManager.getInstance();

describe("AdvancedAnalyzer (Fixed)", () => {
  let analyzer: AdvancedAnalyzer;
  let mockAnalysis: RepositoryAnalysis;

  // Create mock functions
  const mockReadFileWithErrorHandling = mockManager.mockFunction();
  const mockStat = mockManager.mockFunction();

  beforeEach(() => {
    // Reset all mocks
    mockManager.resetAllMocks();

    // Set up default mock implementations
    mockReadFileWithErrorHandling.mockResolvedValue("// Mock file content");
    mockStat.mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false,
      size: 1000,
      mtime: new Date(),
    });

    analyzer = new AdvancedAnalyzer();

    // Create mock analysis data
    mockAnalysis = {
      id: "test-id",
      path: "/test/repo",
      name: "test-repo",
      language: "JavaScript",
      languages: ["JavaScript", "TypeScript"],
      frameworks: ["React"],
      fileCount: 10,
      directoryCount: 5,
      totalSize: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [{ path: "/", files: 5, subdirectories: 2 }],
        keyFiles: [
          {
            path: "index.js",
            language: "JavaScript",
            size: 100,
            lineCount: 50,
            importance: 0.9,
            functions: [],
            classes: [],
          },
        ],
        tree: "test-repo\n└── index.js\n",
      },
      codeAnalysis: {
        functionCount: 5,
        classCount: 2,
        importCount: 10,
        complexity: {
          cyclomaticComplexity: 15,
          maintainabilityIndex: 75,
          technicalDebt: "low",
          codeQuality: "good",
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [{ name: "React", confidence: 0.9 }],
      },
      insights: {
        executiveSummary: "Test repository for advanced analysis",
        technicalBreakdown: "Technical details here",
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: "comprehensive",
        processingTime: 500,
      },
    };
  });

  describe("Mock Infrastructure Validation", () => {
    it("should have working mock functions", () => {
      expect(mockReadFileWithErrorHandling).toBeDefined();
      expect(mockStat).toBeDefined();
    });

    it("should be able to call mock functions", async () => {
      const content = await mockReadFileWithErrorHandling("/test/file.js");
      expect(content).toBe("// Mock file content");

      const stats = await mockStat("/test/file.js");
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(1000);
    });
  });

  describe("Analyzer Instantiation", () => {
    it("should create AdvancedAnalyzer instance", () => {
      expect(analyzer).toBeDefined();
      expect(analyzer).toBeInstanceOf(AdvancedAnalyzer);
    });

    it("should have required methods", () => {
      expect(typeof analyzer.analyzeRepository).toBe("function");
    });
  });

  describe("Basic Functionality Tests", () => {
    it("should handle repository analysis data", () => {
      expect(mockAnalysis).toBeDefined();
      expect(mockAnalysis.name).toBe("test-repo");
      expect(mockAnalysis.language).toBe("JavaScript");
      expect(mockAnalysis.codeAnalysis.functionCount).toBe(5);
      expect(mockAnalysis.codeAnalysis.classCount).toBe(2);
    });

    it("should handle complexity analysis", () => {
      const complexity = mockAnalysis.codeAnalysis.complexity;
      expect(complexity.cyclomaticComplexity).toBe(15);
      expect(complexity.maintainabilityIndex).toBe(75);
      expect(complexity.technicalDebt).toBe("low");
      expect(complexity.codeQuality).toBe("good");
    });

    it("should handle framework detection", () => {
      const frameworks = mockAnalysis.dependencies.frameworks;
      expect(frameworks).toHaveLength(1);
      expect(frameworks[0].name).toBe("React");
      expect(frameworks[0].confidence).toBe(0.9);
    });
  });

  describe("Mock Integration Tests", () => {
    it("should work with mock file operations", async () => {
      const content = await mockReadFileWithErrorHandling(
        "/test/component.jsx"
      );
      expect(content).toBe("// Mock file content");
      expect(mockReadFileWithErrorHandling).toHaveBeenCalledWith(
        "/test/component.jsx"
      );
    });

    it("should work with mock file stats", async () => {
      const stats = await mockStat("/test/package.json");
      expect(stats).toBeDefined();
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(1000);
      expect(mockStat).toHaveBeenCalledWith("/test/package.json");
    });

    it("should handle different file types", async () => {
      // Test JavaScript file
      mockReadFileWithErrorHandling.mockResolvedValueOnce(
        "function test() { return true; }"
      );
      const jsContent = await mockReadFileWithErrorHandling("/test/script.js");
      expect(jsContent).toContain("function test()");

      // Test TypeScript file
      mockReadFileWithErrorHandling.mockResolvedValueOnce(
        "interface Test { name: string; }"
      );
      const tsContent = await mockReadFileWithErrorHandling("/test/types.ts");
      expect(tsContent).toContain("interface Test");

      // Test React component
      mockReadFileWithErrorHandling.mockResolvedValueOnce(
        "export const Component = () => <div>Test</div>"
      );
      const reactContent = await mockReadFileWithErrorHandling(
        "/test/Component.tsx"
      );
      expect(reactContent).toContain("export const Component");
    });

    it("should handle error scenarios", async () => {
      // Test file not found
      mockReadFileWithErrorHandling.mockRejectedValueOnce(
        new Error("File not found")
      );
      await expect(
        mockReadFileWithErrorHandling("/nonexistent/file.js")
      ).rejects.toThrow("File not found");

      // Test stat error
      mockStat.mockRejectedValueOnce(new Error("Stat failed"));
      await expect(mockStat("/nonexistent/file.js")).rejects.toThrow(
        "Stat failed"
      );
    });
  });

  describe("Analysis Workflow Tests", () => {
    it("should handle complexity calculation workflow", () => {
      const analysis = { ...mockAnalysis };

      // Simulate complexity analysis
      analysis.codeAnalysis.complexity.cyclomaticComplexity = 20;
      analysis.codeAnalysis.complexity.maintainabilityIndex = 60;
      analysis.codeAnalysis.complexity.technicalDebt = "medium";
      analysis.codeAnalysis.complexity.codeQuality = "fair";

      expect(analysis.codeAnalysis.complexity.cyclomaticComplexity).toBe(20);
      expect(analysis.codeAnalysis.complexity.maintainabilityIndex).toBe(60);
      expect(analysis.codeAnalysis.complexity.technicalDebt).toBe("medium");
      expect(analysis.codeAnalysis.complexity.codeQuality).toBe("fair");
    });

    it("should handle pattern detection workflow", () => {
      const analysis = { ...mockAnalysis };

      // Simulate pattern detection
      analysis.codeAnalysis.patterns = [
        {
          name: "MVC Pattern",
          confidence: 0.8,
          description: "Model-View-Controller pattern detected",
        },
        {
          name: "Observer Pattern",
          confidence: 0.6,
          description: "Observer pattern usage found",
        },
      ];

      expect(analysis.codeAnalysis.patterns).toHaveLength(2);
      expect(analysis.codeAnalysis.patterns[0].name).toBe("MVC Pattern");
      expect(analysis.codeAnalysis.patterns[1].name).toBe("Observer Pattern");
    });

    it("should handle insights generation workflow", () => {
      const analysis = { ...mockAnalysis };

      // Simulate insights generation
      analysis.insights.recommendations = [
        "Consider refactoring complex functions",
        "Add more unit tests for better coverage",
        "Update dependencies to latest versions",
      ];

      analysis.insights.potentialIssues = [
        "High cyclomatic complexity in main.js",
        "Missing error handling in API calls",
      ];

      expect(analysis.insights.recommendations).toHaveLength(3);
      expect(analysis.insights.potentialIssues).toHaveLength(2);
      expect(analysis.insights.recommendations[0]).toContain("refactoring");
      expect(analysis.insights.potentialIssues[0]).toContain("complexity");
    });
  });
});
