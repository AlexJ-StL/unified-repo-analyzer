/**
 * Tests for batch analysis API endpoint
 */

import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AnalysisEngine } from "../../core/AnalysisEngine";

describe("Batch Analysis API", () => {
  let app: express.Application;
  let httpServer: unknown;
  let _io: Server;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a simple mock implementation
    const mockAnalysisEngine = {
      analyzeRepository: vi.fn().mockResolvedValue({
        name: "test-repo",
        path: "/test/path",
        languages: ["JavaScript"],
        frameworks: ["React"],
        summary: "Test repository",
        files: [],
        dependencies: {},
        metrics: { fileCount: 10, totalSize: 1000 },
      }),
      analyzeMultipleRepositories: vi.fn(),
      analyzeMultipleRepositoriesWithQueue: vi
        .fn()
        .mockImplementation(
          async (paths, _options, _concurrency, progressCallback) => {
            // Call progress callback a few times to simulate progress
            if (progressCallback) {
              progressCallback({
                batchId: "test-batch",
                status: {
                  total: paths.length,
                  completed: 0,
                  failed: 0,
                  inProgress: 1,
                  pending: paths.length - 1,
                  progress: 0,
                },
                currentRepository: [paths[0]],
              });

              progressCallback({
                batchId: "test-batch",
                status: {
                  total: paths.length,
                  completed: paths.length,
                  failed: 0,
                  inProgress: 0,
                  pending: 0,
                  progress: 100,
                },
                currentRepository: [],
              });
            }

            // Return mock batch result
            return {
              id: "test-batch",
              repositories: paths.map((path) => ({
                id: `repo-${path.replace(/\//g, "-")}`,
                path,
                name: path.split("/").pop(),
                language: "JavaScript",
                languages: ["JavaScript", "TypeScript"],
                frameworks: [],
                fileCount: 100,
                directoryCount: 10,
                totalSize: 1024 * 1024,
                createdAt: new Date(),
                updatedAt: new Date(),
                structure: {
                  directories: [],
                  keyFiles: [],
                  tree: "mock-tree",
                },
                codeAnalysis: {
                  functionCount: 0,
                  classCount: 0,
                  importCount: 0,
                  complexity: {
                    cyclomaticComplexity: 0,
                    maintainabilityIndex: 0,
                    technicalDebt: "Low",
                    codeQuality: "good",
                  },
                  patterns: [],
                },
                dependencies: {
                  production: [],
                  development: [],
                  frameworks: [],
                },
                insights: {
                  executiveSummary: "",
                  technicalBreakdown: "",
                  recommendations: [],
                  potentialIssues: [],
                },
                metadata: {
                  analysisMode: "standard",
                  processingTime: 0,
                },
              })),
              combinedInsights: {
                commonalities: ["Common language: JavaScript"],
                differences: [],
                integrationOpportunities: [],
              },
              createdAt: new Date(),
              processingTime: 1000,
              status: {
                total: paths.length,
                completed: paths.length,
                failed: 0,
                inProgress: 0,
                pending: 0,
                progress: 100,
              },
            };
          }
        ),
      generateCombinedInsights: vi.fn(),
      generateSynopsis: vi.fn(),
      updateIndex: vi.fn(),
      searchRepositories: vi.fn(),
      findSimilarRepositories: vi.fn(),
      suggestCombinations: vi.fn(),
      // Add missing properties
      advancedAnalyzer: {},
      getIndexSystem: vi.fn(),
      _indexSystem: null,
      processFilesForAnalysis: vi.fn(),
    };

    // Replace the AnalysisEngine constructor with our mock
    Object.setPrototypeOf(AnalysisEngine, function () {
      return mockAnalysisEngine;
    });

    // Create Express app
    app = express();
    app.use(express.json());

    // Create HTTP server
    httpServer = createServer(app);

    // Create Socket.IO server
    // Typecast httpServer to satisfy Server constructor's expected type for the first argument
    _io = new Server(httpServer as any);

    // Mock Socket.IO
    (global as Record<string, unknown>).io = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    };

    // Mock AnalysisEngine
    (
      AnalysisEngine.prototype
        .analyzeMultipleRepositoriesWithQueue as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockImplementation(
      async (paths, _options, _concurrency, progressCallback) => {
        // Call progress callback a few times to simulate progress
        if (progressCallback) {
          progressCallback({
            batchId: "test-batch",
            status: {
              total: paths.length,
              completed: 0,
              failed: 0,
              inProgress: 1,
              pending: paths.length - 1,
              progress: 0,
            },
            currentRepository: [paths[0]],
          });

          progressCallback({
            batchId: "test-batch",
            status: {
              total: paths.length,
              completed: paths.length,
              failed: 0,
              inProgress: 0,
              pending: 0,
              progress: 100,
            },
            currentRepository: [],
          });
        }

        // Return mock batch result
        return {
          id: "test-batch",
          repositories: paths.map((path) => ({
            id: `repo-${path.replace(/\//g, "-")}`,
            path,
            name: path.split("/").pop(),
            language: "JavaScript",
            languages: ["JavaScript", "TypeScript"],
            frameworks: [],
            fileCount: 100,
            directoryCount: 10,
            totalSize: 1024 * 1024,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: "mock-tree",
            },
            codeAnalysis: {
              functionCount: 0,
              classCount: 0,
              importCount: 0,
              complexity: {
                cyclomaticComplexity: 0,
                maintainabilityIndex: 0,
                technicalDebt: "Low",
                codeQuality: "good",
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: "",
              technicalBreakdown: "",
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: "standard",
              processingTime: 0,
            },
          })),
          combinedInsights: {
            commonalities: ["Common language: JavaScript"],
            differences: [],
            integrationOpportunities: [],
          },
          createdAt: new Date(),
          processingTime: 1000,
          status: {
            total: paths.length,
            completed: paths.length,
            failed: 0,
            inProgress: 0,
            pending: 0,
            progress: 100,
          },
        };
      }
    );

    // Import routes
    const { default: analyzeRoutes } = await import("../routes/analyze");
    app.use("/api/analyze", analyzeRoutes);
  });

  afterEach(() => {
    if (httpServer && typeof httpServer === "object" && "close" in httpServer) {
      (httpServer as { close: () => void }).close();
    }
  });

  test("should return 400 for invalid request", async () => {
    const response = await request(app)
      .post("/api/analyze/batch")
      .send({
        // Missing paths
        options: {
          mode: "quick",
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test("should analyze multiple repositories", async () => {
    const response = await request(app)
      .post("/api/analyze/batch")
      .send({
        paths: ["/path/to/repo1", "/path/to/repo2", "/path/to/repo3"],
        options: {
          mode: "quick",
          maxFiles: 10,
          maxLinesPerFile: 100,
          includeLLMAnalysis: false,
        },
        concurrency: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.repositories).toHaveLength(3);
    expect(response.body.combinedInsights).toBeDefined();
    expect(response.body.status).toBeDefined();
    expect(response.body.status.progress).toBe(100);

    // Verify that analyzeMultipleRepositoriesWithQueue was called with correct parameters
    expect(
      AnalysisEngine.prototype.analyzeMultipleRepositoriesWithQueue
    ).toHaveBeenCalledWith(
      ["/path/to/repo1", "/path/to/repo2", "/path/to/repo3"],
      expect.objectContaining({
        mode: "quick",
        maxFiles: 10,
        maxLinesPerFile: 100,
        includeLLMAnalysis: false,
      }),
      2,
      expect.any(Function)
    );
  });

  test("should handle errors during batch analysis", async () => {
    // Mock analyzeMultipleRepositoriesWithQueue to throw an error
    (
      AnalysisEngine.prototype
        .analyzeMultipleRepositoriesWithQueue as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValueOnce(new Error("Batch analysis failed"));

    const response = await request(app)
      .post("/api/analyze/batch")
      .send({
        paths: ["/path/to/repo1", "/path/to/repo2"],
        options: {
          mode: "quick",
        },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Failed to analyze repositories");
    expect(response.body.message).toBe("Batch analysis failed");
  });
});
