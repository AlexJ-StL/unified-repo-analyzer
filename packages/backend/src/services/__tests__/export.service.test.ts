/**
 * Tests for export service
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import exportService from '../export.service';
import {
  RepositoryAnalysis,
  BatchAnalysisResult,
  OutputFormat,
} from '@unified-repo-analyzer/shared/src/types/analysis';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

// Mock repository analysis
const mockAnalysis: Partial<RepositoryAnalysis> = {
  id: 'test-id',
  name: 'test-repo',
  path: '/path/to/repo',
  language: 'TypeScript',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['React', 'Express'],
  fileCount: 100,
  directoryCount: 10,
  totalSize: 1024 * 1024,
  createdAt: new Date(),
  updatedAt: new Date(),
  structure: {
    directories: [],
    keyFiles: [
      {
        path: 'src/index.ts',
        language: 'TypeScript',
        size: 1024,
        lineCount: 100,
        importance: 0.9,
        functions: [],
        classes: [],
      },
    ],
    tree: 'src/\n  index.ts\n',
  },
  codeAnalysis: {
    functionCount: 10,
    classCount: 5,
    importCount: 20,
    complexity: {
      cyclomaticComplexity: 5,
      maintainabilityIndex: 80,
      technicalDebt: 'Low',
      codeQuality: 'good',
    },
    patterns: [
      {
        name: 'MVC',
        confidence: 80,
        description: 'Model-View-Controller pattern',
      },
    ],
  },
  dependencies: {
    production: [],
    development: [],
    frameworks: [],
  },
  insights: {
    executiveSummary: 'This is a test repository',
    technicalBreakdown: 'Technical details here',
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    potentialIssues: ['Issue 1', 'Issue 2'],
  },
  metadata: {
    analysisMode: 'standard',
    processingTime: 1000,
    tokenUsage: {
      prompt: 100,
      completion: 50,
      total: 150,
    },
  },
};

// Mock batch analysis result
const mockBatchResult: Partial<BatchAnalysisResult> = {
  id: 'batch-test-id',
  repositories: [mockAnalysis as RepositoryAnalysis],
  combinedInsights: {
    commonalities: ['Common language: TypeScript'],
    differences: ['Different framework usage'],
    integrationOpportunities: ['Could be integrated'],
  },
  createdAt: new Date(),
  processingTime: 2000,
  status: {
    total: 1,
    completed: 1,
    failed: 0,
    inProgress: 0,
    pending: 0,
    progress: 100,
  },
};

// Test directory for file operations
const TEST_DIR = path.join(__dirname, 'test-exports');

describe('Export Service', () => {
  // Set up test directory
  beforeAll(async () => {
    try {
      await mkdir(TEST_DIR, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }
  });

  // Clean up test directory
  afterAll(async () => {
    try {
      const files = fs.readdirSync(TEST_DIR);
      for (const file of files) {
        await unlink(path.join(TEST_DIR, file));
      }
      await rmdir(TEST_DIR);
    } catch (error) {
      // Directory may not exist or be empty
    }
  });

  describe('exportAnalysis', () => {
    test('should export analysis to JSON format', async () => {
      const result = await exportService.exportAnalysis(mockAnalysis as RepositoryAnalysis, 'json');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe(mockAnalysis.id);
      expect(parsed.name).toBe(mockAnalysis.name);
    });

    test('should export analysis to Markdown format', async () => {
      const result = await exportService.exportAnalysis(
        mockAnalysis as RepositoryAnalysis,
        'markdown'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should contain Markdown headers
      expect(result).toContain('# test-repo Repository Analysis');
      expect(result).toContain('## Overview');
      expect(result).toContain('## Executive Summary');
    });

    test('should export analysis to HTML format', async () => {
      const result = await exportService.exportAnalysis(mockAnalysis as RepositoryAnalysis, 'html');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should contain HTML tags
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>test-repo Repository Analysis</title>');
      expect(result).toContain('<h1>test-repo Repository Analysis</h1>');
    });

    test('should throw error for unsupported format', async () => {
      await expect(
        exportService.exportAnalysis(mockAnalysis as RepositoryAnalysis, 'pdf' as OutputFormat)
      ).rejects.toThrow('Unsupported export format: pdf');
    });
  });

  describe('exportBatchAnalysis', () => {
    test('should export batch analysis to JSON format', async () => {
      const result = await exportService.exportBatchAnalysis(
        mockBatchResult as BatchAnalysisResult,
        'json'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe(mockBatchResult.id);
      expect(parsed.repositories).toHaveLength(1);
    });

    test('should export batch analysis to Markdown format', async () => {
      const result = await exportService.exportBatchAnalysis(
        mockBatchResult as BatchAnalysisResult,
        'markdown'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should contain Markdown headers
      expect(result).toContain('# Batch Repository Analysis');
      expect(result).toContain('## Overview');
      expect(result).toContain('## Repositories');
    });

    test('should export batch analysis to HTML format', async () => {
      const result = await exportService.exportBatchAnalysis(
        mockBatchResult as BatchAnalysisResult,
        'html'
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Should contain HTML tags
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>Batch Repository Analysis</title>');
      expect(result).toContain('<h1>Batch Repository Analysis</h1>');
    });
  });

  describe('saveToFile', () => {
    test('should save content to file', async () => {
      const content = 'Test content';
      const filePath = path.join(TEST_DIR, 'test-export.txt');

      const result = await exportService.saveToFile(content, filePath);

      expect(result).toBe(filePath);

      // File should exist and contain the content
      const fileContent = fs.readFileSync(filePath, 'utf8');
      expect(fileContent).toBe(content);
    });
  });
});
