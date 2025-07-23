/**
 * Tests for the batch processing functionality in AnalysisEngine
 */

import { AnalysisEngine } from '../AnalysisEngine';
import { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';

// Mock dependencies
jest.mock('../../utils/repositoryDiscovery', () => ({
  discoverRepository: jest.fn().mockImplementation(async (repoPath) => {
    return {
      id: `repo-${repoPath.replace(/\//g, '-')}`,
      path: repoPath,
      name: repoPath.split('/').pop(),
      language: 'JavaScript',
      languages: ['JavaScript', 'TypeScript'],
      frameworks: repoPath.includes('react') ? ['React'] : ['Express'],
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
    };
  }),
  analysisOptionsToDiscoveryOptions: jest.fn().mockReturnValue({}),
}));

jest.mock('../../utils/fileSystem', () => ({
  readFileWithErrorHandling: jest.fn().mockResolvedValue('mock file content'),
}));

jest.mock('../codeStructureAnalyzer', () => ({
  analyzeCodeStructure: jest.fn().mockReturnValue({
    functions: [],
    classes: [],
    importCount: 0,
  }),
}));

jest.mock('../tokenAnalyzer', () => ({
  countTokens: jest.fn().mockReturnValue(100),
  sampleText: jest.fn().mockReturnValue('sample'),
}));

describe('AnalysisEngine - Batch Processing', () => {
  let engine: AnalysisEngine;
  let options: AnalysisOptions;

  beforeEach(() => {
    engine = new AnalysisEngine();
    options = {
      mode: 'quick',
      maxFiles: 10,
      maxLinesPerFile: 100,
      includeLLMAnalysis: false,
      llmProvider: 'none',
      outputFormats: ['json'],
      includeTree: true,
    };
  });

  test('should analyze multiple repositories', async () => {
    const repoPaths = ['/path/to/repo1', '/path/to/repo2', '/path/to/repo3'];

    const result = await engine.analyzeMultipleRepositories(repoPaths, options);

    expect(result).toBeDefined();
    expect(result.repositories).toHaveLength(3);
    expect(result.repositories[0].path).toBe('/path/to/repo1');
    expect(result.repositories[1].path).toBe('/path/to/repo2');
    expect(result.repositories[2].path).toBe('/path/to/repo3');
    expect(result.status).toBeDefined();
    expect(result.status?.total).toBe(3);
    expect(result.status?.completed).toBe(3);
    expect(result.status?.progress).toBe(100);
  });

  test('should handle errors in repository analysis', async () => {
    // Mock discoverRepository to fail for the second repository
    const discoverRepository = require('../../utils/repositoryDiscovery').discoverRepository;
    discoverRepository.mockImplementationOnce(async (repoPath) => {
      return {
        id: `repo-${repoPath.replace(/\//g, '-')}`,
        path: repoPath,
        name: repoPath.split('/').pop(),
        language: 'JavaScript',
        languages: ['JavaScript'],
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
      };
    });
    discoverRepository.mockImplementationOnce(async () => {
      throw new Error('Repository analysis failed');
    });
    discoverRepository.mockImplementationOnce(async (repoPath) => {
      return {
        id: `repo-${repoPath.replace(/\//g, '-')}`,
        path: repoPath,
        name: repoPath.split('/').pop(),
        language: 'TypeScript',
        languages: ['TypeScript'],
        frameworks: [],
        fileCount: 50,
        directoryCount: 5,
        totalSize: 512 * 1024,
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
      };
    });

    const repoPaths = ['/path/to/repo1', '/path/to/repo2', '/path/to/repo3'];

    const result = await engine.analyzeMultipleRepositories(repoPaths, options);

    expect(result).toBeDefined();
    expect(result.repositories).toHaveLength(2);
    expect(result.repositories[0].path).toBe('/path/to/repo1');
    expect(result.repositories[1].path).toBe('/path/to/repo3');
    expect(result.status).toBeDefined();
    expect(result.status?.total).toBe(3);
    expect(result.status?.completed).toBe(2);
    expect(result.status?.failed).toBe(1);
    expect(result.status?.progress).toBe(100);
  });

  test('should generate combined insights for multiple repositories', async () => {
    // Mock repositories with different languages and frameworks
    const discoverRepository = require('../../utils/repositoryDiscovery').discoverRepository;
    discoverRepository.mockImplementationOnce(async (repoPath) => {
      return {
        id: `repo-${repoPath.replace(/\//g, '-')}`,
        path: repoPath,
        name: 'frontend',
        language: 'JavaScript',
        languages: ['JavaScript', 'TypeScript'],
        frameworks: ['React', 'Redux'],
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
      };
    });
    discoverRepository.mockImplementationOnce(async (repoPath) => {
      return {
        id: `repo-${repoPath.replace(/\//g, '-')}`,
        path: repoPath,
        name: 'backend',
        language: 'TypeScript',
        languages: ['TypeScript', 'JavaScript'],
        frameworks: ['Express', 'Nest.js'],
        fileCount: 80,
        directoryCount: 8,
        totalSize: 768 * 1024,
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
      };
    });

    const repoPaths = ['/path/to/frontend', '/path/to/backend'];

    const result = await engine.analyzeMultipleRepositories(repoPaths, options);

    expect(result).toBeDefined();
    expect(result.repositories).toHaveLength(2);
    expect(result.combinedInsights).toBeDefined();
    expect(result.combinedInsights?.commonalities).toContain(
      'All repositories use the following languages: JavaScript, TypeScript'
    );
    expect(result.combinedInsights?.differences).toBeDefined();
    expect(result.combinedInsights?.integrationOpportunities).toContain(
      'Potential for frontend-backend integration detected'
    );
  });

  test('should analyze multiple repositories with queue', async () => {
    const repoPaths = ['/path/to/repo1', '/path/to/repo2', '/path/to/repo3'];

    // Mock progress callback
    const progressCallback = jest.fn();

    const result = await engine.analyzeMultipleRepositoriesWithQueue(
      repoPaths,
      options,
      2,
      progressCallback
    );

    expect(result).toBeDefined();
    expect(result.repositories).toHaveLength(3);
    expect(progressCallback).toHaveBeenCalled();
  });
});
