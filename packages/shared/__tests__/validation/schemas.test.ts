/**
 * Tests for validation schemas
 */

import { describe, expect, test } from 'vitest';
import * as schemas from '../../src/validation/schemas';

describe('Validation Schemas', () => {
  describe('FileInfo Schema', () => {
    test('should validate a valid FileInfo object', () => {
      const validFileInfo = {
        path: 'src/index.ts',
        language: 'TypeScript',
        size: 1024,
        lineCount: 100,
        tokenCount: 500,
        importance: 0.8,
        functions: [
          {
            name: 'main',
            lineNumber: 10,
            parameters: ['arg1', 'arg2'],
            description: 'Main function',
          },
        ],
        classes: [
          {
            name: 'MyClass',
            lineNumber: 20,
            methods: ['method1', 'method2'],
            description: 'My class description',
          },
        ],
        description: 'Main file',
        useCase: 'Entry point',
      };

      const result = schemas.fileInfoSchema.safeParse(validFileInfo);
      expect(result.success).toBe(true);
    });

    test('should reject an invalid FileInfo object', () => {
      const invalidFileInfo = {
        path: 'src/index.ts',
        language: 'TypeScript',
        size: -1, // Invalid: negative size
        lineCount: 100,
        importance: 0.8,
        functions: [],
        classes: [],
      };

      const result = schemas.fileInfoSchema.safeParse(invalidFileInfo);
      expect(result.success).toBe(false);
    });
  });

  describe('AnalysisOptions Schema', () => {
    test('should validate a valid AnalysisOptions object', () => {
      const validOptions = {
        mode: 'standard',
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
        llmProvider: 'claude',
        outputFormats: ['json', 'markdown'],
        includeTree: true,
      };

      const result = schemas.analysisOptionsSchema.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    test('should reject an invalid AnalysisOptions object', () => {
      const invalidOptions = {
        mode: 'invalid-mode', // Invalid: not in enum
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
        llmProvider: 'claude',
        outputFormats: ['json', 'markdown'],
        includeTree: true,
      };

      const result = schemas.analysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });
  });

  describe('RepositoryAnalysis Schema', () => {
    test('should validate a valid RepositoryAnalysis object', () => {
      const validAnalysis = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        path: '/path/to/repo',
        name: 'my-repo',
        description: 'My repository',
        language: 'TypeScript',
        languages: ['TypeScript', 'JavaScript'],
        frameworks: ['React', 'Express'],
        fileCount: 100,
        directoryCount: 10,
        totalSize: 1024000,
        createdAt: new Date(),
        updatedAt: new Date(),

        structure: {
          directories: [
            {
              path: 'src',
              files: 50,
              subdirectories: 5,
              role: 'source code',
            },
          ],
          keyFiles: [
            {
              path: 'src/index.ts',
              language: 'TypeScript',
              size: 1024,
              lineCount: 100,
              importance: 0.8,
              functions: [],
              classes: [],
            },
          ],
          tree: 'src/\n  index.ts\n',
        },

        codeAnalysis: {
          functionCount: 50,
          classCount: 10,
          importCount: 30,
          complexity: {
            cyclomaticComplexity: 15,
            maintainabilityIndex: 75,
            technicalDebt: 'Low',
            codeQuality: 'good',
          },
          patterns: [
            {
              name: 'MVC',
              confidence: 0.9,
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
          executiveSummary: 'This is a summary',
          technicalBreakdown: 'This is a breakdown',
          recommendations: ['Recommendation 1', 'Recommendation 2'],
          potentialIssues: ['Issue 1', 'Issue 2'],
        },

        metadata: {
          analysisMode: 'standard',
          llmProvider: 'claude',
          processingTime: 1500,
          tokenUsage: {
            prompt: 1000,
            completion: 500,
            total: 1500,
          },
        },
      };

      const result = schemas.repositoryAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    test('should reject an invalid RepositoryAnalysis object', () => {
      const invalidAnalysis = {
        id: 'not-a-uuid', // Invalid: not a UUID
        path: '/path/to/repo',
        name: 'my-repo',
        language: 'TypeScript',
        languages: ['TypeScript', 'JavaScript'],
        frameworks: ['React', 'Express'],
        fileCount: 100,
        directoryCount: 10,
        totalSize: 1024000,
        createdAt: new Date(),
        updatedAt: new Date(),

        // Missing required fields
      };

      const result = schemas.repositoryAnalysisSchema.safeParse(invalidAnalysis);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchQuery Schema', () => {
    test('should validate a valid SearchQuery object', () => {
      const validQuery = {
        languages: ['TypeScript', 'JavaScript'],
        frameworks: ['React', 'Express'],
        keywords: ['api', 'backend'],
        fileTypes: ['.ts', '.js'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
      };

      const result = schemas.searchQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    test('should validate a partial SearchQuery object', () => {
      const partialQuery = {
        languages: ['TypeScript'],
      };

      const result = schemas.searchQuerySchema.safeParse(partialQuery);
      expect(result.success).toBe(true);
    });
  });

  describe('RepositoryIndex Schema', () => {
    test('should validate a valid RepositoryIndex object', () => {
      const validIndex = {
        repositories: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'my-repo',
            path: '/path/to/repo',
            languages: ['TypeScript', 'JavaScript'],
            frameworks: ['React', 'Express'],
            tags: ['api', 'backend'],
            summary: 'This is a summary',
            lastAnalyzed: new Date(),
            size: 1024000,
            complexity: 15,
          },
        ],
        relationships: [
          {
            sourceId: '123e4567-e89b-12d3-a456-426614174000',
            targetId: '223e4567-e89b-12d3-a456-426614174000',
            type: 'similar',
            strength: 0.8,
            reason: 'Similar technologies',
          },
        ],
        tags: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            name: 'api',
            category: 'functionality',
            color: '#ff0000',
          },
        ],
        lastUpdated: new Date(),
      };

      const result = schemas.repositoryIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });
  });
});
