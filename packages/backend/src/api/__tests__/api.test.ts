/**
 * API integration tests
 */

import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import after mocking
const { AnalysisEngine } = await import("../../core/AnalysisEngine");
const { IndexSystem } = await import("../../core/IndexSystem");

import { app } from "../../index";

describe("API Integration Tests", () => {
  // Default mock for BatchAnalysisResult
  const defaultMockBatchResult = {
    id: "default-batch-id",
    repositories: [],
    createdAt: new Date(),
    processingTime: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock AnalysisEngine prototype methods
    const mockAnalyzeRepository = vi.fn().mockResolvedValue({
      id: "123",
      path: "/test/repo",
      name: "test-repo",
      language: "JavaScript",
      languages: ["JavaScript"],
      frameworks: ["React"],
      fileCount: 10,
      directoryCount: 5,
      totalSize: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [],
        keyFiles: [],
        tree: "",
      },
      codeAnalysis: {
        functionCount: 5,
        classCount: 2,
        importCount: 10,
        complexity: {
          cyclomaticComplexity: 5,
          maintainabilityIndex: 80,
          technicalDebt: "low",
          codeQuality: "good" as const,
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [],
      },
      insights: {
        executiveSummary: "Test summary",
        technicalBreakdown: "Test breakdown",
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: "standard" as const,
        processingTime: 100,
      },
    });
    const mockAnalyzeMultipleRepositories = vi
      .fn()
      .mockResolvedValue(defaultMockBatchResult);
    const mockAnalyzeMultipleRepositoriesWithQueue = vi
      .fn()
      .mockResolvedValue(defaultMockBatchResult);
    const mockGenerateSynopsis = vi.fn().mockResolvedValue("");
    const mockUpdateIndex = vi.fn().mockResolvedValue(undefined);
    const mockSearchRepositories = vi.fn().mockResolvedValue([]);
    const mockFindSimilarRepositories = vi.fn().mockResolvedValue([]);
    // Note: mockSuggestCombinations is intentionally not set here to allow test-specific overrides

    // Apply mocks to the prototype
    AnalysisEngine.prototype.analyzeRepository = mockAnalyzeRepository;
    AnalysisEngine.prototype.analyzeMultipleRepositories =
      mockAnalyzeMultipleRepositories;
    AnalysisEngine.prototype.analyzeMultipleRepositoriesWithQueue =
      mockAnalyzeMultipleRepositoriesWithQueue;
    AnalysisEngine.prototype.generateSynopsis = mockGenerateSynopsis;
    AnalysisEngine.prototype.updateIndex = mockUpdateIndex;
    AnalysisEngine.prototype.searchRepositories = mockSearchRepositories;
    AnalysisEngine.prototype.findSimilarRepositories =
      mockFindSimilarRepositories;
    // Note: suggestCombinations is intentionally not mocked in global beforeEach to allow test-specific overrides

    // Mock IndexSystem prototype methods
    const mockAddRepository = vi.fn().mockResolvedValue(undefined);
    const mockGetIndex = vi.fn().mockReturnValue({
      repositories: [],
      relationships: [],
      tags: [],
      lastUpdated: new Date(),
    });
    const mockIndexSearchRepositories = vi.fn().mockResolvedValue([]);
    const mockIndexFindSimilarRepositories = vi.fn().mockResolvedValue([]);

    IndexSystem.prototype.addRepository = mockAddRepository;
    IndexSystem.prototype.getIndex = mockGetIndex;
    IndexSystem.prototype.searchRepositories = mockIndexSearchRepositories;
    IndexSystem.prototype.findSimilarRepositories =
      mockIndexFindSimilarRepositories;
  });

  describe("Health Check", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Repository Analysis", () => {
    it("should analyze a repository", async () => {
      // Mock the analyzeRepository method
      const mockAnalysis = {
        id: "123",
        path: "/test/repo",
        name: "test-repo",
        language: "JavaScript",
        languages: ["JavaScript"],
        frameworks: ["React"],
        fileCount: 10,
        directoryCount: 5,
        totalSize: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        structure: {
          directories: [],
          keyFiles: [],
          tree: "",
        },
        codeAnalysis: {
          functionCount: 5,
          classCount: 2,
          importCount: 10,
          complexity: {
            cyclomaticComplexity: 5,
            maintainabilityIndex: 80,
            technicalDebt: "low",
            codeQuality: "good" as const,
          },
          patterns: [],
        },
        dependencies: {
          production: [],
          development: [],
          frameworks: [],
        },
        insights: {
          executiveSummary: "Test summary",
          technicalBreakdown: "Test breakdown",
          recommendations: [],
          potentialIssues: [],
        },
        metadata: {
          analysisMode: "standard" as const,
          processingTime: 100,
        },
      };

      const mockAnalyzeRepository = vi.fn();
      mockAnalyzeRepository.mockResolvedValue(mockAnalysis);
      // Replace the method on the prototype for this test
      const originalAnalyzeRepository =
        AnalysisEngine.prototype.analyzeRepository;
      AnalysisEngine.prototype.analyzeRepository = mockAnalyzeRepository;

      // ... rest of the test ...

      // Restore the original method after the test
      AnalysisEngine.prototype.analyzeRepository = originalAnalyzeRepository;

      const response = await request(app)
        .post("/api/analyze")
        .send({
          path: "/test/repo",
          options: {
            mode: "standard",
            maxFiles: 100,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
      expect(AnalysisEngine.prototype.analyzeRepository).toHaveBeenCalledWith(
        "/test/repo",
        expect.objectContaining({
          mode: "standard",
          maxFiles: 100,
        })
      );
    });

    it("should return validation error for missing path", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          options: {
            mode: "standard",
          },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should analyze multiple repositories", async () => {
      // Mock the analyzeMultipleRepositories method
      const mockBatchResult = {
        id: "456",
        repositories: [
          {
            id: "123",
            path: "/test/repo1",
            name: "test-repo1",
            language: "JavaScript",
            languages: ["JavaScript"],
            frameworks: ["React"],
            fileCount: 10,
            directoryCount: 5,
            totalSize: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: "",
            },
            codeAnalysis: {
              functionCount: 5,
              classCount: 2,
              importCount: 10,
              complexity: {
                cyclomaticComplexity: 5,
                maintainabilityIndex: 80,
                technicalDebt: "low",
                codeQuality: "good" as const,
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: "Test summary",
              technicalBreakdown: "Test breakdown",
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: "standard" as const,
              processingTime: 100,
            },
          },
          {
            id: "124",
            path: "/test/repo2",
            name: "test-repo2",
            language: "TypeScript",
            languages: ["TypeScript"],
            frameworks: ["Express"],
            fileCount: 15,
            directoryCount: 8,
            totalSize: 2000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: "",
            },
            codeAnalysis: {
              functionCount: 8,
              classCount: 3,
              importCount: 15,
              complexity: {
                cyclomaticComplexity: 7,
                maintainabilityIndex: 75,
                technicalDebt: "medium",
                codeQuality: "fair" as const,
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: "Test summary 2",
              technicalBreakdown: "Test breakdown 2",
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: "standard" as const,
              processingTime: 150,
            },
          },
        ],
        createdAt: new Date(),
        processingTime: 200,
      };

      const mockAnalyzeMultipleRepositories = vi.fn();
      mockAnalyzeMultipleRepositories.mockResolvedValue(mockBatchResult);
      const originalAnalyzeMultipleRepositories =
        AnalysisEngine.prototype.analyzeMultipleRepositories;
      AnalysisEngine.prototype.analyzeMultipleRepositories =
        mockAnalyzeMultipleRepositories;

      // ... rest of the test ...

      AnalysisEngine.prototype.analyzeMultipleRepositories =
        originalAnalyzeMultipleRepositories;

      const response = await request(app)
        .post("/api/analyze/batch")
        .send({
          paths: ["/test/repo1", "/test/repo2"],
          options: {
            mode: "quick",
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBatchResult);
      expect(
        AnalysisEngine.prototype.analyzeMultipleRepositories
      ).toHaveBeenCalledWith(
        ["/test/repo1", "/test/repo2"],
        expect.objectContaining({
          mode: "quick",
        })
      );
    });
  });

  describe("Repository Management", () => {
    it("should get all repositories", async () => {
      // Mock the getIndex method
      const mockRepositories = [
        {
          id: "123",
          name: "test-repo1",
          path: "/test/repo1",
          languages: ["JavaScript"],
          frameworks: ["React"],
          tags: ["frontend"],
          summary: "Test repo 1",
          lastAnalyzed: new Date(),
          size: 1000,
          complexity: 5,
        },
        {
          id: "124",
          name: "test-repo2",
          path: "/test/repo2",
          languages: ["TypeScript"],
          frameworks: ["Express"],
          tags: ["backend"],
          summary: "Test repo 2",
          lastAnalyzed: new Date(),
          size: 2000,
          complexity: 8,
        },
      ];

      const mockGetIndex = vi.fn();
      mockGetIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });
      const originalGetIndex = IndexSystem.prototype.getIndex;
      IndexSystem.prototype.getIndex = mockGetIndex;

      // ... rest of the test ...

      IndexSystem.prototype.getIndex = originalGetIndex;

      const response = await request(app).get("/api/repositories");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories);
      expect(IndexSystem.prototype.getIndex).toHaveBeenCalled();
    });

    it("should get a repository by ID", async () => {
      // Mock the getIndex method
      const mockRepository = {
        id: "123",
        name: "test-repo1",
        path: "/test/repo1",
        languages: ["JavaScript"],
        frameworks: ["React"],
        tags: ["frontend"],
        summary: "Test repo 1",
        lastAnalyzed: new Date(),
        size: 1000,
        complexity: 5,
      };

      const mockGetIndex = vi.fn();
      mockGetIndex.mockReturnValue({
        repositories: [mockRepository],
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });
      const originalGetIndex = IndexSystem.prototype.getIndex;
      IndexSystem.prototype.getIndex = mockGetIndex;

      // ... rest of the test ...

      IndexSystem.prototype.getIndex = originalGetIndex;

      const response = await request(app).get("/api/repositories/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepository);
      expect(IndexSystem.prototype.getIndex).toHaveBeenCalled();
    });

    it("should return 404 for non-existent repository", async () => {
      // Mock the getIndex method
      const mockGetIndex = vi.fn();
      mockGetIndex.mockReturnValue({
        repositories: [],
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });
      const originalGetIndex = IndexSystem.prototype.getIndex;
      IndexSystem.prototype.getIndex = mockGetIndex;

      // ... rest of the test ...

      IndexSystem.prototype.getIndex = originalGetIndex;

      const response = await request(app).get("/api/repositories/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("should search repositories", async () => {
      // Mock the searchRepositories method
      const mockSearchResults = [
        {
          repository: {
            id: "123",
            name: "test-repo1",
            path: "/test/repo1",
            languages: ["JavaScript"],
            frameworks: ["React"],
            tags: ["frontend"],
            summary: "Test repo 1",
            lastAnalyzed: new Date(),
            size: 1000,
            complexity: 5,
          },
          score: 15,
          matches: [
            {
              field: "languages",
              value: "JavaScript",
              score: 10,
            },
            {
              field: "frameworks",
              value: "React",
              score: 5,
            },
          ],
        },
      ];

      const mockSearchRepositories = vi.fn();
      mockSearchRepositories.mockResolvedValue(mockSearchResults);
      const originalSearchRepositories =
        AnalysisEngine.prototype.searchRepositories;
      AnalysisEngine.prototype.searchRepositories = mockSearchRepositories;

      const response = await request(app)
        .get("/api/repositories/search")
        .query({
          languages: ["JavaScript"],
          frameworks: ["React"],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSearchResults);
      expect(AnalysisEngine.prototype.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: ["JavaScript"],
          frameworks: ["React"],
        })
      );

      // Restore original method after assertions
      AnalysisEngine.prototype.searchRepositories = originalSearchRepositories;
    });

    it("should find similar repositories", async () => {
      // Mock the findSimilarRepositories method
      const mockSimilarRepositories = [
        {
          repository: {
            id: "124",
            name: "test-repo2",
            path: "/test/repo2",
            languages: ["JavaScript"],
            frameworks: ["React"],
            tags: ["frontend"],
            summary: "Test repo 2",
            lastAnalyzed: "2025-09-02T13:15:22.944Z",
            size: 2000,
            complexity: 6,
          },
          similarity: 0.8,
          matchReason: "Shares languages: JavaScript",
        },
      ];

      const mockFindSimilarRepositories = vi.fn();
      mockFindSimilarRepositories.mockResolvedValue(mockSimilarRepositories);
      const originalFindSimilarRepositories =
        AnalysisEngine.prototype.findSimilarRepositories;
      AnalysisEngine.prototype.findSimilarRepositories =
        mockFindSimilarRepositories;

      const response = await request(app).get("/api/repositories/123/similar");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSimilarRepositories);
      expect(
        AnalysisEngine.prototype.findSimilarRepositories
      ).toHaveBeenCalledWith("123");

      // Restore original method after assertions
      AnalysisEngine.prototype.findSimilarRepositories =
        originalFindSimilarRepositories;
    });

    it("should suggest combinations", async () => {
      // Mock the suggestCombinations method
      const mockCombinations = [
        {
          repositories: ["123", "124"],
          compatibility: 0.8,
          rationale: "Frontend-Backend pair",
          integrationPoints: ["API integration", "Shared data models"],
        },
      ];

      const mockSuggestCombinations = vi.fn();
      mockSuggestCombinations.mockResolvedValue(mockCombinations);
      const originalSuggestCombinations =
        AnalysisEngine.prototype.suggestCombinations;
      AnalysisEngine.prototype.suggestCombinations = mockSuggestCombinations;

      const response = await request(app)
        .post("/api/repositories/combinations")
        .send({
          repoIds: ["123", "124"],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCombinations);
      expect(AnalysisEngine.prototype.suggestCombinations).toHaveBeenCalledWith(
        ["123", "124"]
      );

      // Restore the original method
      AnalysisEngine.prototype.suggestCombinations =
        originalSuggestCombinations;
    });
  });
});
