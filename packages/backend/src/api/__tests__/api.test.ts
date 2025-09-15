/**
 * API integration tests
 */

import fs from "node:fs/promises";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MockProxy, mock } from "vitest-mock-extended";

// Import types for proper typing
import type { AnalysisEngine } from "../../core/AnalysisEngine.js";
import type { IndexSystem } from "../../core/IndexSystem.js";

// Import before mocking

import { app } from "../../index.js";

describe("API Integration Tests", () => {
  // Default mock for BatchAnalysisResult
  const defaultMockBatchResult = {
    id: "default-batch-id",
    repositories: [],
    createdAt: new Date(),
    processingTime: 0
  };

  let mockAnalysisEngine: MockProxy<AnalysisEngine>;
  let mockIndexSystem: MockProxy<IndexSystem>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock instances
    mockAnalysisEngine = mock<AnalysisEngine>();
    mockIndexSystem = mock<IndexSystem>();

    // Set up default mock behaviors
    mockAnalysisEngine.analyzeRepository.mockResolvedValue({
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
        tree: ""
      },
      codeAnalysis: {
        functionCount: 5,
        classCount: 2,
        importCount: 10,
        complexity: {
          cyclomaticComplexity: 5,
          maintainabilityIndex: 80,
          technicalDebt: "low",
          codeQuality: "good" as const
        },
        patterns: []
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: []
      },
      insights: {
        executiveSummary: "Test summary",
        technicalBreakdown: "Test breakdown",
        recommendations: [],
        potentialIssues: []
      },
      metadata: {
        analysisMode: "standard" as const,
        processingTime: 100
      }
    });

    mockAnalysisEngine.analyzeMultipleRepositories.mockResolvedValue(
      defaultMockBatchResult
    );
    mockAnalysisEngine.analyzeMultipleRepositoriesWithQueue.mockResolvedValue(
      defaultMockBatchResult
    );
    mockAnalysisEngine.generateSynopsis.mockResolvedValue("");
    mockAnalysisEngine.updateIndex.mockResolvedValue(undefined);
    mockAnalysisEngine.searchRepositories.mockResolvedValue([]);
    mockAnalysisEngine.findSimilarRepositories.mockResolvedValue([]);

    mockIndexSystem.getIndex.mockReturnValue({
      repositories: [],
      relationships: [],
      tags: [],
      lastUpdated: new Date()
    });

    // Mock the constructors to return our mock instances
    const AnalysisEngineMock = vi.fn(() => mockAnalysisEngine as any);
    const IndexSystemMock = vi.fn(() => mockIndexSystem as any);

    // Replace the constructors
    vi.doMock("../../core/AnalysisEngine", () => ({
      AnalysisEngine: AnalysisEngineMock
    }));
    vi.doMock("../../core/IndexSystem", () => ({
      IndexSystem: IndexSystemMock
    }));
  });

  describe("Health Check", () => {
    it("should return status ok", async () => {
      // Mock fs.writeFile to succeed for health check
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined as any);
      vi.mocked(fs.stat).mockResolvedValue({} as any);

      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "healthy");
    });
  });

  describe("Repository Analysis", () => {
    it("should analyze a repository", async () => {
      // Mock the analyzeRepository method for this specific test
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
          tree: ""
        },
        codeAnalysis: {
          functionCount: 5,
          classCount: 2,
          importCount: 10,
          complexity: {
            cyclomaticComplexity: 5,
            maintainabilityIndex: 80,
            technicalDebt: "low",
            codeQuality: "good" as const
          },
          patterns: []
        },
        dependencies: {
          production: [],
          development: [],
          frameworks: []
        },
        insights: {
          executiveSummary: "Test summary",
          technicalBreakdown: "Test breakdown",
          recommendations: [],
          potentialIssues: []
        },
        metadata: {
          analysisMode: "standard" as const,
          processingTime: 100
        }
      };

      // Override the mock for this test
      mockAnalysisEngine.analyzeRepository.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post("/api/analyze")
        .send({
          path: "/test/repo",
          options: {
            mode: "standard",
            maxFiles: 100
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
      expect(mockAnalysisEngine.analyzeRepository).toHaveBeenCalledWith(
        "/test/repo",
        expect.objectContaining({
          mode: "standard",
          maxFiles: 100
        })
      );
    });

    it("should return validation error for missing path", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          options: {
            mode: "standard"
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should analyze multiple repositories", async () => {
      // Mock the analyzeMultipleRepositories method for this specific test
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
              tree: ""
            },
            codeAnalysis: {
              functionCount: 5,
              classCount: 2,
              importCount: 10,
              complexity: {
                cyclomaticComplexity: 5,
                maintainabilityIndex: 80,
                technicalDebt: "low",
                codeQuality: "good" as const
              },
              patterns: []
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: []
            },
            insights: {
              executiveSummary: "Test summary",
              technicalBreakdown: "Test breakdown",
              recommendations: [],
              potentialIssues: []
            },
            metadata: {
              analysisMode: "standard" as const,
              processingTime: 100
            }
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
              tree: ""
            },
            codeAnalysis: {
              functionCount: 8,
              classCount: 3,
              importCount: 15,
              complexity: {
                cyclomaticComplexity: 7,
                maintainabilityIndex: 75,
                technicalDebt: "medium",
                codeQuality: "fair" as const
              },
              patterns: []
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: []
            },
            insights: {
              executiveSummary: "Test summary 2",
              technicalBreakdown: "Test breakdown 2",
              recommendations: [],
              potentialIssues: []
            },
            metadata: {
              analysisMode: "standard" as const,
              processingTime: 150
            }
          }
        ],
        createdAt: new Date(),
        processingTime: 200
      };

      // Override the mock for this test
      mockAnalysisEngine.analyzeMultipleRepositories.mockResolvedValue(
        mockBatchResult
      );

      const response = await request(app)
        .post("/api/analyze/batch")
        .send({
          paths: ["/test/repo1", "/test/repo2"],
          options: {
            mode: "quick"
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBatchResult);
      expect(
        mockAnalysisEngine.analyzeMultipleRepositories
      ).toHaveBeenCalledWith(
        ["/test/repo1", "/test/repo2"],
        expect.objectContaining({
          mode: "quick"
        })
      );
    });
  });

  describe("Repository Management", () => {
    it("should get all repositories", async () => {
      // Mock the getIndex method for this specific test
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
          complexity: 5
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
          complexity: 8
        }
      ];

      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date()
      });

      const response = await request(app).get("/api/repositories");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories);
      expect(mockIndexSystem.getIndex).toHaveBeenCalled();
    });

    it("should get a repository by ID", async () => {
      // Mock the getIndex method for this specific test
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
        complexity: 5
      };

      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: [mockRepository],
        relationships: [],
        tags: [],
        lastUpdated: new Date()
      });

      const response = await request(app).get("/api/repositories/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepository);
      expect(mockIndexSystem.getIndex).toHaveBeenCalled();
    });

    it("should return 404 for non-existent repository", async () => {
      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: [],
        relationships: [],
        tags: [],
        lastUpdated: new Date()
      });

      const response = await request(app).get("/api/repositories/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("should search repositories", async () => {
      // Mock the searchRepositories method for this specific test
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
            complexity: 5
          },
          score: 15,
          matches: [
            {
              field: "languages",
              value: "JavaScript",
              score: 10
            },
            {
              field: "frameworks",
              value: "React",
              score: 5
            }
          ]
        }
      ];

      // Override the mock for this test
      mockAnalysisEngine.searchRepositories.mockResolvedValue(
        mockSearchResults
      );

      const response = await request(app)
        .get("/api/repositories/search")
        .query({
          languages: ["JavaScript"],
          frameworks: ["React"]
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSearchResults);
      expect(mockAnalysisEngine.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: ["JavaScript"],
          frameworks: ["React"]
        })
      );
    });

    it("should find similar repositories", async () => {
      // Mock the findSimilarRepositories method for this specific test
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
            lastAnalyzed: new Date("2025-09-02T13:15:22.944Z"),
            size: 2000,
            complexity: 6
          },
          similarity: 0.8,
          matchReason: "Shares languages: JavaScript"
        }
      ];

      // Override the mock for this test
      mockAnalysisEngine.findSimilarRepositories.mockResolvedValue(
        mockSimilarRepositories
      );

      const response = await request(app).get("/api/repositories/123/similar");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSimilarRepositories);
      expect(mockAnalysisEngine.findSimilarRepositories).toHaveBeenCalledWith(
        "123"
      );
    });

    it("should suggest combinations", async () => {
      // Mock the suggestCombinations method for this specific test
      const mockCombinations = [
        {
          repositories: ["123", "124"],
          compatibility: 0.8,
          rationale: "Frontend-Backend pair",
          integrationPoints: ["API integration", "Shared data models"]
        }
      ];

      // Override the mock for this test
      mockAnalysisEngine.suggestCombinations.mockResolvedValue(
        mockCombinations
      );

      const response = await request(app)
        .post("/api/repositories/combinations")
        .send({
          repoIds: ["123", "124"]
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCombinations);
      expect(mockAnalysisEngine.suggestCombinations).toHaveBeenCalledWith([
        "123",
        "124"
      ]);
    });
  });
});
