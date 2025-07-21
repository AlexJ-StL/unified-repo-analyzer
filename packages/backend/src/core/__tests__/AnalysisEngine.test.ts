/**
 * Tests for Analysis Engine
 */

import path from 'path';
import fs from 'fs';
import { AnalysisEngine } from '../AnalysisEngine';
import { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';

// Mock dependencies
jest.mock('../codeStructureAnalyzer', () => ({
  analyzeCodeStructure: jest.fn().mockReturnValue({
    functions: [{ name: 'testFunction', lineNumber: 1, parameters: [] }],
    classes: [{ name: 'TestClass', lineNumber: 5, methods: [] }],
    importCount: 3,
  }),
}));

jest.mock('../tokenAnalyzer', () => ({
  countTokens: jest.fn().mockReturnValue(100),
  sampleText: jest.fn().mockImplementation((text) => text),
}));

jest.mock('../../utils/repositoryDiscovery', () => ({
  discoverRepository: jest.fn().mockResolvedValue({
    id: 'test-id',
    path: '/test/repo',
    name: 'test-repo',
    language: 'JavaScript',
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React'],
    fileCount: 10,
    directoryCount: 5,
    totalSize: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    structure: {
      directories: [{ path: '/', files: 5, subdirectories: 2 }],
      keyFiles: [
        {
          path: 'index.js',
          language: 'JavaScript',
          size: 100,
          lineCount: 50,
          importance: 0.9,
          functions: [],
          classes: [],
        },
      ],
      tree: 'test-repo\n└── index.js\n',
    },
    codeAnalysis: {
      functionCount: 0,
      classCount: 0,
      importCount: 0,
      complexity: {
        cyclomaticComplexity: 0,
        maintainabilityIndex: 0,
        technicalDebt: 'Unknown',
        codeQuality: 'fair',
      },
      patterns: [],
    },
    dependencies: {
      production: [],
      development: [],
      frameworks: [{ name: 'React', confidence: 0.9 }],
    },
    insights: {
      executiveSummary: '',
      technicalBreakdown: '',
      recommendations: [],
      potentialIssues: [],
    },
    metadata: {
      analysisMode: 'standard',
      processingTime: 100,
    },
  }),
  analysisOptionsToDiscoveryOptions: jest.fn().mockReturnValue({
    maxFiles: 500,
    maxLinesPerFile: 1000,
    includeTree: true,
  }),
}));

jest.mock('../../utils/fileSystem', () => ({
  readFileWithErrorHandling: jest.fn().mockResolvedValue('// Test file content'),
  FileSystemError: class FileSystemError extends Error {
    constructor(message: string, type: string, path: string) {
      super(message);
    }
  },
}));

describe('Analysis Engine', () => {
  let engine: AnalysisEngine;

  beforeEach(() => {
    engine = new AnalysisEngine();
    jest.clearAllMocks();
  });

  describe('analyzeRepository', () => {
    test('should analyze a repository', async () => {
      const options: AnalysisOptions = {
        mode: 'standard',
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: true,
      };

      const result = await engine.analyzeRepository('/test/repo', options);

      expect(result).toBeDefined();
      expect(result.name).toBe('test-repo');
      expect(result.language).toBe('JavaScript');
      expect(result.metadata.analysisMode).toBe('standard');
      expect(result.codeAnalysis.functionCount).toBe(1);
      expect(result.codeAnalysis.classCount).toBe(1);
      expect(result.codeAnalysis.importCount).toBe(3);
    });
  });

  describe('analyzeMultipleRepositories', () => {
    test('should analyze multiple repositories', async () => {
      const options: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 200,
        maxLinesPerFile: 500,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      const result = await engine.analyzeMultipleRepositories(
        ['/test/repo1', '/test/repo2'],
        options
      );

      expect(result).toBeDefined();
      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0].name).toBe('test-repo');
      expect(result.repositories[1].name).toBe('test-repo');
    });

    test('should handle errors in individual repositories', async () => {
      const mockDiscoverRepository = require('../../utils/repositoryDiscovery').discoverRepository;

      // Make the second repository analysis fail
      mockDiscoverRepository
        .mockResolvedValueOnce({
          id: 'test-id-1',
          name: 'test-repo-1',
          language: 'JavaScript',
          languages: ['JavaScript'],
          frameworks: [],
          fileCount: 5,
          directoryCount: 2,
          totalSize: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
          structure: {
            directories: [],
            keyFiles: [],
            tree: '',
          },
          codeAnalysis: {
            functionCount: 0,
            classCount: 0,
            importCount: 0,
            complexity: {
              cyclomaticComplexity: 0,
              maintainabilityIndex: 0,
              technicalDebt: 'Unknown',
              codeQuality: 'fair',
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
            processingTime: 50,
          },
        })
        .mockRejectedValueOnce(new Error('Repository not found'));

      const options: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 200,
        maxLinesPerFile: 500,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      const result = await engine.analyzeMultipleRepositories(
        ['/test/repo1', '/test/repo2'],
        options
      );

      expect(result).toBeDefined();
      expect(result.repositories).toHaveLength(1);
    });
  });

  describe('generateSynopsis', () => {
    test('should generate JSON synopsis', async () => {
      const analysis = await engine.analyzeRepository('/test/repo', {
        mode: 'standard',
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: true,
      });

      const synopsis = await engine.generateSynopsis(analysis, 'json');

      expect(synopsis).toBeDefined();
      expect(typeof synopsis).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(synopsis);
      expect(parsed.name).toBe('test-repo');
    });

    test('should generate Markdown synopsis', async () => {
      const analysis = await engine.analyzeRepository('/test/repo', {
        mode: 'standard',
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['markdown'],
        includeTree: true,
      });

      const synopsis = await engine.generateSynopsis(analysis, 'markdown');

      expect(synopsis).toBeDefined();
      expect(typeof synopsis).toBe('string');
      expect(synopsis).toContain('# test-repo Repository Analysis');
      expect(synopsis).toContain('## Overview');
    });

    test('should generate HTML synopsis', async () => {
      const analysis = await engine.analyzeRepository('/test/repo', {
        mode: 'standard',
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['html'],
        includeTree: true,
      });

      const synopsis = await engine.generateSynopsis(analysis, 'html');

      expect(synopsis).toBeDefined();
      expect(typeof synopsis).toBe('string');
      expect(synopsis).toContain('<!DOCTYPE html>');
      expect(synopsis).toContain('<title>test-repo Repository Analysis</title>');
    });

    test('should throw error for unsupported format', async () => {
      const analysis = await engine.analyzeRepository('/test/repo', {
        mode: 'standard',
        maxFiles: 500,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: true,
      });

      await expect(engine.generateSynopsis(analysis, 'pdf' as any)).rejects.toThrow(
        'Unsupported output format: pdf'
      );
    });
  });
});
