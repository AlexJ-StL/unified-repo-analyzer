/**
 * API integration tests
 */

import fs from 'node:fs/promises';
import type { Request, Response } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    stat: vi.fn(() =>
      Promise.resolve({
        isFile: () => true,
        isDirectory: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        dev: 0,
        ino: 0,
        mode: 0,
        nlink: 0,
        uid: 0,
        gid: 0,
        rdev: 0,
        size: 100,
        blksize: 0,
        blocks: 0,
        atimeMs: 0,
        mtimeMs: 0,
        ctimeMs: 0,
        birthtimeMs: 0,
        atime: new Date(),
        mtime: new Date(),
        ctime: new Date(),
        birthtime: new Date(),
      })
    ),
  };
});

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      stat: vi.fn(() =>
        Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isSymbolicLink: () => false,
          isFIFO: () => false,
          isSocket: () => false,
          dev: 0,
          ino: 0,
          mode: 0,
          nlink: 0,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: 100,
          blksize: 0,
          blocks: 0,
          atimeMs: 0,
          mtimeMs: 0,
          ctimeMs: 0,
          birthtimeMs: 0,
          atime: new Date(),
          mtime: new Date(),
          ctime: new Date(),
          birthtime: new Date(),
        })
      ),
    },
  };
});

import { pathHandler } from '../../services/path-handler.service.js';

vi.mock('../../services/logger.service', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setRequestId: vi.fn(),
    getRequestId: vi.fn(),
  },
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
  requestLogger: vi.fn((_req, _res, next) => next()),
}));

// Moved mockHealthService definition before the vi.mock call
const mockHealthService = vi.hoisted(() => ({
  healthCheckHandler: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy' });
  }),
  readinessHandler: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ready' });
  }),
  livenessHandler: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'alive' });
  }),
}));

vi.mock('../../services/health.service', async () => {
  const actual = await vi.importActual('../../services/health.service');
  return {
    ...actual,
    HealthService: class MockHealthService {
      healthCheckHandler = mockHealthService.healthCheckHandler;
      readinessHandler = mockHealthService.readinessHandler;
      livenessHandler = mockHealthService.livenessHandler;
    },
  };
});

// Removed redundant logger mock - async mock at lines 12-35 covers it

// Import before mocking

import { app } from '../../index.js';

// Create mock instances for top-level mocking
const mockAnalysisEngine = vi.hoisted(() => ({
  analyzeRepository: vi.fn(() =>
    Promise.resolve({
      id: '123',
      path: '/test/repo',
      name: 'test-repo',
      language: 'JavaScript',
      languages: ['JavaScript'],
      frameworks: ['React'],
      files: [],
      fileCount: 10,
      directoryCount: 5,
      totalSize: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [],
        keyFiles: [],
        tree: '',
      },
      codeAnalysis: {
        functionCount: 5,
        classCount: 2,
        importCount: 10,
        complexity: {
          cyclomaticComplexity: 5,
          maintainabilityIndex: 80,
          technicalDebt: 'low',
          codeQuality: 'good' as const,
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [],
      },
      insights: {
        executiveSummary: 'Test summary',
        technicalBreakdown: 'Test breakdown',
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: 'standard' as const,
        analysisTime: 100,
      },
    })
  ),
  analyzeMultipleRepositoriesWithQueue: vi.fn(() =>
    Promise.resolve({
      id: 'default-batch-id',
      repositories: [],
      createdAt: new Date(),
      analysisTime: 0,
    })
  ),
  analyzeMultipleRepositories: vi.fn(() =>
    Promise.resolve({
      id: 'default-batch-id',
      repositories: [],
      createdAt: new Date(),
      analysisTime: 0,
    })
  ),
  generateSynopsis: vi.fn(() => Promise.resolve('')),
  updateIndex: vi.fn(() => Promise.resolve()),
  searchRepositories: vi.fn(() => Promise.resolve([])),
  findSimilarRepositories: vi.fn(() => Promise.resolve([])),
}));

const mockIndexSystem = vi.hoisted(() => ({
  addRepository: vi.fn(() => Promise.resolve()),
  updateRepository: vi.fn(() => Promise.resolve()),
  findSimilarRepositories: vi.fn(() => Promise.resolve([])),
  suggestCombinations: vi.fn(() => Promise.resolve([])),
  getIndex: vi.fn(() => ({
    repositories: [],
    relationships: [],
    tags: [],
    lastUpdated: new Date(),
  })),
}));

const mockPathHandler = vi.hoisted(() => ({
  validatePath: vi.fn(() =>
    Promise.resolve({
      isValid: true,
      normalizedPath: '/test/nonexistent-repo',
      errors: [],
      warnings: [],
      metadata: {
        exists: true,
        isDirectory: true,
        permissions: {
          read: true,
        },
      },
    })
  ),
}));

const mockMetricsService = vi.hoisted(() => ({
  requestMiddleware: vi.fn(() => (_req: Request, _res: Response, next: () => void) => next()),
  metricsHandler: vi.fn((_req: Request, res: Response) => {
    res.status(200).json({ metrics: {} });
  }),
  prometheusHandler: vi.fn((_req: Request, res: Response) => {
    res.status(200).send('# Prometheus metrics\n');
  }),
}));

const mockServiceContainer = vi.hoisted(() => ({
  initialize: vi.fn(() => Promise.resolve()),
  healthService: mockHealthService,
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock modules using Bun's mocking system
vi.mock('../../core/AnalysisEngine', () => ({
  AnalysisEngine: class MockAnalysisEngine {
    analyzeRepository = mockAnalysisEngine.analyzeRepository;
    analyzeMultipleRepositoriesWithQueue = mockAnalysisEngine.analyzeMultipleRepositoriesWithQueue;
    analyzeMultipleRepositories = mockAnalysisEngine.analyzeMultipleRepositories;
    generateSynopsis = mockAnalysisEngine.generateSynopsis;
    updateIndex = mockAnalysisEngine.updateIndex;
    searchRepositories = mockAnalysisEngine.searchRepositories;
    findSimilarRepositories = mockAnalysisEngine.findSimilarRepositories;
  },
}));

vi.mock('../../core/IndexSystem', () => ({
  IndexSystem: class MockIndexSystem {
    addRepository = mockIndexSystem.addRepository;
    updateRepository = mockIndexSystem.updateRepository;
    findSimilarRepositories = mockIndexSystem.findSimilarRepositories;
    suggestCombinations = mockIndexSystem.suggestCombinations;
    getIndex = mockIndexSystem.getIndex;
  },
}));

vi.mock('../../services/path-handler.service', () => ({
  pathHandler: mockPathHandler,
}));

vi.mock('../../services/metrics.service', () => ({
  metricsService: mockMetricsService,
}));

vi.mock('../../container/ServiceContainer', () => ({
  serviceContainer: mockServiceContainer,
}));

describe('API Integration Tests', () => {
  // Default mock for BatchAnalysisResult
  const defaultMockBatchResult = {
    id: 'default-batch-id',
    repositories: [],
    createdAt: new Date(),
    analysisTime: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock behaviors
    mockAnalysisEngine.analyzeRepository.mockResolvedValue({
      id: '123',
      path: '/test/repo',
      name: 'test-repo',
      language: 'JavaScript',
      languages: ['JavaScript'],
      frameworks: ['React'],
      files: [],
      fileCount: 10,
      directoryCount: 5,
      totalSize: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [],
        keyFiles: [],
        tree: '',
      },
      codeAnalysis: {
        functionCount: 5,
        classCount: 2,
        importCount: 10,
        complexity: {
          cyclomaticComplexity: 5,
          maintainabilityIndex: 80,
          technicalDebt: 'low',
          codeQuality: 'good' as const,
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [],
      },
      insights: {
        executiveSummary: 'Test summary',
        technicalBreakdown: 'Test breakdown',
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: 'standard' as const,
        analysisTime: 100,
      },
    });

    mockAnalysisEngine.analyzeMultipleRepositories.mockResolvedValue(defaultMockBatchResult);
    mockAnalysisEngine.analyzeMultipleRepositoriesWithQueue.mockResolvedValue(
      defaultMockBatchResult
    );
    mockAnalysisEngine.generateSynopsis.mockResolvedValue('');
    mockAnalysisEngine.updateIndex.mockResolvedValue(undefined);
    mockAnalysisEngine.searchRepositories.mockResolvedValue([]);
    mockAnalysisEngine.findSimilarRepositories.mockResolvedValue([]);

    mockIndexSystem.getIndex.mockReturnValue({
      repositories: [],
      relationships: [],
      tags: [],
      lastUpdated: new Date(),
    });

    // Mock pathHandler for path validation
    pathHandler.validatePath.mockResolvedValue({
      isValid: true,
      normalizedPath: '/test/nonexistent-repo',
      errors: [],
      warnings: [],
      metadata: {
        exists: true,
        isDirectory: true,
        permissions: {
          read: true,
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health Check', () => {
    it('should return status ok', async () => {
      // Mock fs operations to succeed for health check
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
      vi.spyOn(fs, 'unlink').mockResolvedValue(undefined);

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('Repository Analysis', () => {
    it('should analyze a repository', async () => {
      // Mock the analyzeRepository method for this specific test
      const mockAnalysis = {
        id: '123',
        path: '/test/nonexistent-repo',
        name: 'test-repo',
        language: 'JavaScript',
        languages: ['JavaScript'],
        frameworks: ['React'],
        files: [],
        fileCount: 10,
        directoryCount: 5,
        totalSize: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        structure: {
          directories: [],
          keyFiles: [],
          tree: '',
        },
        codeAnalysis: {
          functionCount: 5,
          classCount: 2,
          importCount: 10,
          complexity: {
            cyclomaticComplexity: 5,
            maintainabilityIndex: 80,
            technicalDebt: 'low',
            codeQuality: 'good' as const,
          },
          patterns: [],
        },
        dependencies: {
          production: [],
          development: [],
          frameworks: [],
        },
        insights: {
          executiveSummary: 'Test summary',
          technicalBreakdown: 'Test breakdown',
          recommendations: [],
          potentialIssues: [],
        },
        metadata: {
          analysisMode: 'standard' as const,
          analysisTime: 100,
        },
      };

      // Override the mock for this test
      mockAnalysisEngine.analyzeRepository.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: '/test/nonexistent-repo',
          options: {
            mode: 'standard',
            maxFiles: 100,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
      expect(mockAnalysisEngine.analyzeRepository).toHaveBeenCalledWith(
        '/test/nonexistent-repo',
        expect.objectContaining({
          mode: 'standard',
          maxFiles: 100,
        })
      );
    });

    it('should return validation error for missing path', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          options: {
            mode: 'standard',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should analyze multiple repositories', async () => {
      // Mock the analyzeMultipleRepositories method for this specific test
      const mockBatchResult = {
        id: '456',
        repositories: [
          {
            id: '123',
            path: '/test/repo1',
            name: 'test-repo1',
            language: 'JavaScript',
            languages: ['JavaScript'],
            frameworks: ['React'],
            files: [],
            fileCount: 10,
            directoryCount: 5,
            totalSize: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: '',
            },
            codeAnalysis: {
              functionCount: 5,
              classCount: 2,
              importCount: 10,
              complexity: {
                cyclomaticComplexity: 5,
                maintainabilityIndex: 80,
                technicalDebt: 'low',
                codeQuality: 'good' as const,
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: 'Test summary',
              technicalBreakdown: 'Test breakdown',
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: 'standard' as const,
              analysisTime: 100,
            },
          },
          {
            id: '124',
            path: '/test/repo2',
            name: 'test-repo2',
            language: 'TypeScript',
            languages: ['TypeScript'],
            frameworks: ['Express'],
            files: [],
            fileCount: 15,
            directoryCount: 8,
            totalSize: 2000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
              directories: [],
              keyFiles: [],
              tree: '',
            },
            codeAnalysis: {
              functionCount: 8,
              classCount: 3,
              importCount: 15,
              complexity: {
                cyclomaticComplexity: 7,
                maintainabilityIndex: 75,
                technicalDebt: 'medium',
                codeQuality: 'fair' as const,
              },
              patterns: [],
            },
            dependencies: {
              production: [],
              development: [],
              frameworks: [],
            },
            insights: {
              executiveSummary: 'Test summary 2',
              technicalBreakdown: 'Test breakdown 2',
              recommendations: [],
              potentialIssues: [],
            },
            metadata: {
              analysisMode: 'standard' as const,
              analysisTime: 150,
            },
          },
        ],
        createdAt: new Date(),
        analysisTime: 200,
      };

      // Override the mock for this test
      mockAnalysisEngine.analyzeMultipleRepositories.mockResolvedValue(mockBatchResult);

      const response = await request(app)
        .post('/api/analyze/batch')
        .send({
          paths: ['/test/repo1', '/test/repo2'],
          options: {
            mode: 'quick',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBatchResult);
      expect(mockAnalysisEngine.analyzeMultipleRepositories).toHaveBeenCalledWith(
        ['/test/repo1', '/test/repo2'],
        expect.objectContaining({
          mode: 'quick',
        })
      );
    });
  });

  describe('Repository Management', () => {
    it('should get all repositories', async () => {
      // Mock the getIndex method for this specific test
      const mockRepositories = [
        {
          id: '123',
          name: 'test-repo1',
          path: '/test/repo1',
          languages: ['JavaScript'],
          frameworks: ['React'],
          tags: ['frontend'],
          summary: 'Test repo 1',
          lastAnalyzed: new Date(),
          size: 1000,
          complexity: 5,
        },
        {
          id: '124',
          name: 'test-repo2',
          path: '/test/repo2',
          languages: ['TypeScript'],
          frameworks: ['Express'],
          tags: ['backend'],
          summary: 'Test repo 2',
          lastAnalyzed: new Date(),
          size: 2000,
          complexity: 8,
        },
      ];

      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const response = await request(app).get('/api/repositories');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories);
      expect(mockIndexSystem.getIndex).toHaveBeenCalled();
    });

    it('should get a repository by ID', async () => {
      // Mock the getIndex method for this specific test
      const mockRepository = {
        id: '123',
        name: 'test-repo1',
        path: '/test/repo1',
        languages: ['JavaScript'],
        frameworks: ['React'],
        tags: ['frontend'],
        summary: 'Test repo 1',
        lastAnalyzed: new Date(),
        size: 1000,
        complexity: 5,
      };

      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: [mockRepository],
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const response = await request(app).get('/api/repositories/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepository);
      expect(mockIndexSystem.getIndex).toHaveBeenCalled();
    });

    it('should return 404 for non-existent repository', async () => {
      // Override the mock for this test
      mockIndexSystem.getIndex.mockReturnValue({
        repositories: [],
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const response = await request(app).get('/api/repositories/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should search repositories', async () => {
      // Mock the searchRepositories method for this specific test
      const mockSearchResults = [
        {
          repository: {
            id: '123',
            name: 'test-repo1',
            path: '/test/repo1',
            languages: ['JavaScript'],
            frameworks: ['React'],
            tags: ['frontend'],
            summary: 'Test repo 1',
            lastAnalyzed: new Date(),
            size: 1000,
            complexity: 5,
          },
          score: 15,
          matches: [
            {
              field: 'languages',
              value: 'JavaScript',
              score: 10,
            },
            {
              field: 'frameworks',
              value: 'React',
              score: 5,
            },
          ],
        },
      ];

      // Override the mock for this test
      mockAnalysisEngine.searchRepositories.mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .get('/api/repositories/search')
        .query({
          languages: ['JavaScript'],
          frameworks: ['React'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSearchResults);
      expect(mockAnalysisEngine.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: ['JavaScript'],
          frameworks: ['React'],
        })
      );
    });

    it('should find similar repositories', async () => {
      // Mock the findSimilarRepositories method for this specific test
      const mockSimilarRepositories = [
        {
          repository: {
            id: '124',
            name: 'test-repo2',
            path: '/test/repo2',
            languages: ['JavaScript'],
            frameworks: ['React'],
            tags: ['frontend'],
            summary: 'Similar repo',
            lastAnalyzed: new Date(),
            size: 1200,
            complexity: 6,
          },
          similarity: 0.85,
          matchReason: 'High similarity due to shared languages and frameworks',
          reasons: ['Same language', 'Same framework'],
        },
      ];

      // Override the mock for this test
      mockAnalysisEngine.findSimilarRepositories.mockResolvedValue(mockSimilarRepositories);

      const response = await request(app).get('/api/repositories/123/similar');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSimilarRepositories);
      expect(mockAnalysisEngine.findSimilarRepositories).toHaveBeenCalledWith('123');
    });

    it('should suggest combinations', async () => {
      // Mock the suggestCombinations method for this specific test
      const mockCombinations = [
        {
          repositories: ['123', '124'],
          synergy: 0.9,
          benefits: ['Complementary technologies', 'Shared dependencies'],
          risks: ['Version conflicts'],
        },
      ];

      // Override the mock for this test
      mockAnalysisEngine.suggestCombinations.mockResolvedValue(mockCombinations);

      const response = await request(app)
        .get('/api/repositories/combinations')
        .query({
          ids: ['123', '124'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCombinations);
      expect(mockAnalysisEngine.suggestCombinations).toHaveBeenCalledWith(['123', '124']);
    });
  });
});
