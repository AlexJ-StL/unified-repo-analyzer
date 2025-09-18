/**
 * Tests for batch analysis API endpoint
 */

import type { Server as HttpServer } from 'node:http';
import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { AnalysisEngine } from '../../core/AnalysisEngine.js';

// Create mock instance for top-level mocking
const mockAnalysisEngine = mock<typeof AnalysisEngine.prototype>();

vi.mock('../../core/AnalysisEngine', () => ({
  AnalysisEngine: vi.fn(() => mockAnalysisEngine),
}));
vi.mock('../../services/logger.service', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setRequestId: vi.fn(),
    getRequestId: vi.fn(),
  },
  logAnalysis: vi.fn(),
  logPerformance: vi.fn(),
}));

describe('Batch Analysis API', () => {
  let app: express.Application;
  let httpServer: unknown;
  let _io: Server;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock behaviors
    mockAnalysisEngine.analyzeRepository.mockResolvedValue({
      name: 'test-repo',
      path: '/test/path',
      languages: ['JavaScript'],
      frameworks: ['React'],
      summary: 'Test repository',
      files: [],
      dependencies: {},
      metrics: { fileCount: 10, totalSize: 1000 },
    });
    mockAnalysisEngine.analyzeMultipleRepositories.mockResolvedValue([]);
    mockAnalysisEngine.analyzeMultipleRepositoriesWithQueue.mockImplementation(
      async (paths, _options, _concurrency, progressCallback) => {
        // Call progress callback a few times to simulate progress
        if (progressCallback) {
          progressCallback({
            batchId: 'test-batch',
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
            batchId: 'test-batch',
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
          id: 'test-batch',
          repositories: paths.map((path: string) => ({
            id: `repo-${path.replace(/\//g, '-')}`,
            path,
            name: path.split('/').pop(),
            language: 'JavaScript',
            languages: ['JavaScript', 'TypeScript'],
            frameworks: [],
            fileCount: 100,
            directoryCount: 10,
            totalSize: 1024 * 1024,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: 'mock-tree',
            },
            codeAnalysis: {
              functionCount: 0,
              classCount: 0,
              importCount: 0,
              complexity: {
                cyclomaticComplexity: 0,
                maintainabilityIndex: 0,
                technicalDebt: 'Low',
                codeQuality: 'good',
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: '',
              technicalBreakdown: '',
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: 'standard',
              processingTime: 0,
            },
          })),
          combinedInsights: {
            commonalities: ['Common language: JavaScript'],
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
    mockAnalysisEngine.generateCombinedInsights.mockResolvedValue({
      commonalities: ['Common language: JavaScript'],
      differences: [],
      integrationOpportunities: [],
    });
    mockAnalysisEngine.generateSynopsis.mockResolvedValue('');
    mockAnalysisEngine.updateIndex.mockResolvedValue(undefined);
    mockAnalysisEngine.searchRepositories.mockResolvedValue([]);
    mockAnalysisEngine.findSimilarRepositories.mockResolvedValue([]);
    mockAnalysisEngine.suggestCombinations.mockResolvedValue([]);
    mockAnalysisEngine.advancedAnalyzer = {};
    mockAnalysisEngine.getIndexSystem.mockReturnValue(null);
    mockAnalysisEngine._indexSystem = null;
    mockAnalysisEngine.processFilesForAnalysis.mockResolvedValue([]);

    // Create Express app
    app = express();
    app.use(express.json());

    // Create HTTP server
    httpServer = createServer(app);

    // Create Socket.IO server
    // Typecast httpServer to satisfy Server constructor's expected type for the first argument
    _io = new Server(httpServer as HttpServer);

    // Mock Socket.IO
    (global as Record<string, unknown>).io = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    };

    // Import routes
    const { default: analyzeRoutes } = await import('../routes/analyze.js');
    app.use('/api/analyze', analyzeRoutes);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (httpServer && typeof httpServer === 'object' && 'close' in httpServer) {
      (httpServer as { close: () => void }).close();
    }
  });

  test('should return 400 for invalid request', async () => {
    const response = await request(app)
      .post('/api/analyze/batch')
      .send({
        // Missing paths
        options: {
          mode: 'quick',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test('should analyze multiple repositories', async () => {
    const response = await request(app)
      .post('/api/analyze/batch')
      .send({
        paths: ['/path/to/repo1', '/path/to/repo2', '/path/to/repo3'],
        options: {
          mode: 'quick',
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
    expect(AnalysisEngine.prototype.analyzeMultipleRepositoriesWithQueue).toHaveBeenCalledWith(
      ['/path/to/repo1', '/path/to/repo2', '/path/to/repo3'],
      expect.objectContaining({
        mode: 'quick',
        maxFiles: 10,
        maxLinesPerFile: 100,
        includeLLMAnalysis: false,
      }),
      2,
      expect.any(Function)
    );
  });

  test('should handle errors during batch analysis', async () => {
    // Mock analyzeMultipleRepositoriesWithQueue to throw an error
    const mockInstance = vi.mocked(AnalysisEngine).mock.results[0]?.value;
    if (mockInstance) {
      mockInstance.analyzeMultipleRepositoriesWithQueue.mockRejectedValueOnce(
        new Error('Batch analysis failed')
      );
    }

    const response = await request(app)
      .post('/api/analyze/batch')
      .send({
        paths: ['/path/to/repo1', '/path/to/repo2'],
        options: {
          mode: 'quick',
        },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to analyze repositories');
    expect(response.body.message).toBe('Batch analysis failed');
  });
});
