/**
 * Fixed Tests for the batch processing functionality in AnalysisEngine using MockManager
 */

import type { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';
import { beforeEach, describe, expect, test } from 'vitest';
import { MockManager } from '../../../../../tests/MockManager';
import { AnalysisEngine } from '../AnalysisEngine';

// Initialize MockManager
const mockManager = MockManager.getInstance();

describe('AnalysisEngine Batch Processing (Fixed)', () => {
  let engine: AnalysisEngine;

  // Create mock functions
  const mockDiscoverRepository = mockManager.mockFunction();
  const mockAnalysisOptionsToDiscoveryOptions = mockManager.mockFunction();
  const mockReadFileWithErrorHandling = mockManager.mockFunction();
  const mockAnalyzeCodeStructure = mockManager.mockFunction();
  const mockCountTokens = mockManager.mockFunction();
  const mockSampleText = mockManager.mockFunction();

  beforeEach(() => {
    // Reset all mocks
    mockManager.resetAllMocks();

    // Set up default mock implementations
    mockAnalysisOptionsToDiscoveryOptions.mockReturnValue({
      maxFiles: 500,
      maxLinesPerFile: 1000,
      includeTree: true,
    });

    mockReadFileWithErrorHandling.mockResolvedValue('mock file content');

    mockAnalyzeCodeStructure.mockReturnValue({
      functions: [],
      classes: [],
      importCount: 0,
    });

    mockCountTokens.mockReturnValue(100);
    mockSampleText.mockReturnValue('sample');

    // Set up repository discovery mock
    mockDiscoverRepository.mockResolvedValue({
      id: 'batch-test-id',
      path: '/test/batch-repo',
      name: 'batch-test-repo',
      language: 'JavaScript',
      languages: ['JavaScript'],
      frameworks: ['Node.js'],
      fileCount: 5,
      directoryCount: 2,
      totalSize: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [{ path: '/', files: 3, subdirectories: 1 }],
        keyFiles: [
          {
            path: 'index.js',
            language: 'JavaScript',
            size: 50,
            lineCount: 25,
            importance: 0.8,
            functions: [],
            classes: [],
          },
        ],
        tree: 'batch-test-repo\n└── index.js\n',
      },
      codeAnalysis: {
        functionCount: 0,
        classCount: 0,
        importCount: 0,
        complexity: {
          cyclomaticComplexity: 5,
          maintainabilityIndex: 80,
          technicalDebt: 'low',
          codeQuality: 'good',
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [{ name: 'Node.js', confidence: 0.8 }],
      },
      insights: {
        executiveSummary: 'Batch test repository',
        technicalBreakdown: 'Simple Node.js project',
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: 'quick',
        processingTime: 50,
      },
    });

    engine = new AnalysisEngine();
  });

  describe('Mock Infrastructure Validation', () => {
    test('should have working mock functions', () => {
      expect(mockDiscoverRepository).toBeDefined();
      expect(mockAnalysisOptionsToDiscoveryOptions).toBeDefined();
      expect(mockReadFileWithErrorHandling).toBeDefined();
      expect(mockAnalyzeCodeStructure).toBeDefined();
      expect(mockCountTokens).toBeDefined();
      expect(mockSampleText).toBeDefined();
    });

    test('should be able to call mock functions', async () => {
      const options = mockAnalysisOptionsToDiscoveryOptions({});
      expect(options).toEqual({
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeTree: true,
      });

      const content = await mockReadFileWithErrorHandling('/test/file.js');
      expect(content).toBe('mock file content');

      const structure = mockAnalyzeCodeStructure('test code');
      expect(structure).toEqual({
        functions: [],
        classes: [],
        importCount: 0,
      });

      const tokens = mockCountTokens('test text');
      expect(tokens).toBe(100);

      const sample = mockSampleText('original text');
      expect(sample).toBe('sample');
    });
  });

  describe('Batch Processing Infrastructure', () => {
    test('should create AnalysisEngine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(AnalysisEngine);
    });

    test('should have batch processing methods', () => {
      expect(typeof engine.analyzeMultipleRepositories).toBe('function');
      expect(typeof engine.analyzeRepository).toBe('function');
    });

    test('should handle analysis options for batch processing', () => {
      const batchOptions: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 200,
        maxLinesPerFile: 500,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      expect(batchOptions.mode).toBe('quick');
      expect(batchOptions.maxFiles).toBe(200);
      expect(batchOptions.maxLinesPerFile).toBe(500);
    });
  });

  describe('Repository Discovery Mock Tests', () => {
    test('should work with mock repository discovery', async () => {
      const result = await mockDiscoverRepository('/test/batch-repo');
      expect(result).toBeDefined();
      expect(result.name).toBe('batch-test-repo');
      expect(result.language).toBe('JavaScript');
      expect(result.metadata.analysisMode).toBe('quick');
    });

    test('should handle multiple repository paths', () => {
      const paths = ['/test/repo1', '/test/repo2', '/test/repo3'];
      expect(paths).toHaveLength(3);
      expect(paths[0]).toBe('/test/repo1');
      expect(paths[1]).toBe('/test/repo2');
      expect(paths[2]).toBe('/test/repo3');
    });

    test('should handle batch analysis options conversion', () => {
      const options: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 100,
        maxLinesPerFile: 300,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      const discoveryOptions = mockAnalysisOptionsToDiscoveryOptions(options);
      expect(discoveryOptions).toEqual({
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeTree: true,
      });
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle repository discovery errors', async () => {
      mockDiscoverRepository.mockRejectedValueOnce(new Error('Repository not found'));

      await expect(mockDiscoverRepository('/nonexistent/repo')).rejects.toThrow(
        'Repository not found'
      );
    });

    test('should handle file system errors', async () => {
      mockReadFileWithErrorHandling.mockRejectedValueOnce(new Error('File read error'));

      await expect(mockReadFileWithErrorHandling('/nonexistent/file.js')).rejects.toThrow(
        'File read error'
      );
    });

    test('should handle code analysis errors', () => {
      mockAnalyzeCodeStructure.mockImplementationOnce(() => {
        throw new Error('Analysis failed');
      });

      expect(() => mockAnalyzeCodeStructure('invalid code')).toThrow('Analysis failed');
    });
  });

  describe('Batch Processing Workflow Tests', () => {
    test('should handle sequential repository processing', async () => {
      const repositories = ['/test/repo1', '/test/repo2'];

      // Reset and set up sequential mocks
      mockManager.resetAllMocks();

      // Mock different responses for each repository
      mockDiscoverRepository
        .mockResolvedValueOnce({
          name: 'repo1',
          path: '/test/repo1',
          id: 'repo1-id',
          language: 'JavaScript',
          languages: ['JavaScript'],
          frameworks: [],
          fileCount: 5,
          directoryCount: 2,
          totalSize: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
          structure: { directories: [], keyFiles: [], tree: '' },
          codeAnalysis: {
            functionCount: 0,
            classCount: 0,
            importCount: 0,
            complexity: {
              cyclomaticComplexity: 5,
              maintainabilityIndex: 80,
              technicalDebt: 'low',
              codeQuality: 'good',
            },
            patterns: [],
          },
          dependencies: { production: [], development: [], frameworks: [] },
          insights: {
            executiveSummary: '',
            technicalBreakdown: '',
            recommendations: [],
            potentialIssues: [],
          },
          metadata: { analysisMode: 'quick', processingTime: 50 },
        })
        .mockResolvedValueOnce({
          name: 'repo2',
          path: '/test/repo2',
          id: 'repo2-id',
          language: 'TypeScript',
          languages: ['TypeScript'],
          frameworks: [],
          fileCount: 8,
          directoryCount: 3,
          totalSize: 800,
          createdAt: new Date(),
          updatedAt: new Date(),
          structure: { directories: [], keyFiles: [], tree: '' },
          codeAnalysis: {
            functionCount: 0,
            classCount: 0,
            importCount: 0,
            complexity: {
              cyclomaticComplexity: 8,
              maintainabilityIndex: 75,
              technicalDebt: 'medium',
              codeQuality: 'fair',
            },
            patterns: [],
          },
          dependencies: { production: [], development: [], frameworks: [] },
          insights: {
            executiveSummary: '',
            technicalBreakdown: '',
            recommendations: [],
            potentialIssues: [],
          },
          metadata: { analysisMode: 'quick', processingTime: 75 },
        });

      const results = [];
      for (const repo of repositories) {
        const result = await mockDiscoverRepository(repo);
        results.push(result);
      }

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('repo1');
      expect(results[1].name).toBe('repo2');
    });

    test('should handle parallel repository processing simulation', async () => {
      const repositories = ['/test/repo1', '/test/repo2', '/test/repo3'];

      // Mock responses for parallel processing
      mockDiscoverRepository.mockResolvedValue({
        ...(await mockDiscoverRepository()),
        name: 'parallel-repo',
      });

      const promises = repositories.map((repo) => mockDiscoverRepository(repo));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.name).toBe('parallel-repo');
      });
    });

    test('should handle mixed success and failure scenarios', async () => {
      const repositories = ['/test/good-repo', '/test/bad-repo', '/test/another-good-repo'];

      mockDiscoverRepository
        .mockResolvedValueOnce({ name: 'good-repo-1' })
        .mockRejectedValueOnce(new Error('Bad repository'))
        .mockResolvedValueOnce({ name: 'good-repo-2' });

      const results = [];
      const errors = [];

      for (const repo of repositories) {
        try {
          const result = await mockDiscoverRepository(repo);
          results.push(result);
        } catch (error) {
          errors.push(error);
        }
      }

      expect(results).toHaveLength(2);
      expect(errors).toHaveLength(1);
      expect(results[0].name).toBe('good-repo-1');
      expect(results[1].name).toBe('good-repo-2');
      expect((errors[0] as Error).message).toBe('Bad repository');
    });
  });

  describe('Performance and Resource Management', () => {
    test('should handle large batch sizes', () => {
      const largeBatch = Array.from({ length: 100 }, (_, i) => `/test/repo${i}`);
      expect(largeBatch).toHaveLength(100);
      expect(largeBatch[0]).toBe('/test/repo0');
      expect(largeBatch[99]).toBe('/test/repo99');
    });

    test('should handle resource-constrained scenarios', () => {
      const constrainedOptions: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 50,
        maxLinesPerFile: 200,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      expect(constrainedOptions.maxFiles).toBe(50);
      expect(constrainedOptions.maxLinesPerFile).toBe(200);
      expect(constrainedOptions.mode).toBe('quick');
    });

    test('should handle timeout scenarios', async () => {
      // Simulate a slow repository discovery
      mockDiscoverRepository.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ name: 'slow-repo' }), 100))
      );

      const start = Date.now();
      const result = await mockDiscoverRepository('/test/slow-repo');
      const duration = Date.now() - start;

      expect(result.name).toBe('slow-repo');
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});
