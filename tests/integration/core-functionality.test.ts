/**
 * Core Functionality Integration Tests
 * Tests the integration of core components without requiring a full server
 */

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createMock, mockFunction, mockManager } from '../MockManager';

describe('Core Functionality Integration Tests', () => {
  beforeEach(() => {
    mockManager.setupMocks();
  });

  afterEach(() => {
    mockManager.cleanupMocks();
  });

  describe('Analysis Workflow Integration', () => {
    test('should integrate analysis components', async () => {
      // Mock the analysis engine
      const mockAnalysisEngine = createMock({
        analyzeRepository: mockFunction().mockResolvedValue({
          id: 'test-analysis-id',
          name: 'test-repository',
          path: '/test/repo',
          language: 'TypeScript',
          languages: ['TypeScript', 'JavaScript'],
          fileCount: 25,
          directoryCount: 5,
          totalSize: 1024000,
          codeAnalysis: {
            complexity: {
              cyclomaticComplexity: 10,
              maintainabilityIndex: 80,
              technicalDebt: 'Low',
              codeQuality: 'good',
            },
            linesOfCode: 2500,
            functions: [],
            classes: [],
          },
          dependencies: [],
          fileTypes: {
            '.ts': 15,
            '.js': 8,
            '.json': 2,
          },
          summary: 'A TypeScript project with good code quality',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      // Mock the file system utilities
      const mockFileSystem = createMock({
        validateRepositoryPath: mockFunction().mockReturnValue('/validated/repo/path'),
        readDirectory: mockFunction().mockResolvedValue([
          'src/index.ts',
          'src/utils.ts',
          'package.json',
          'README.md',
        ]),
        readFile: mockFunction().mockResolvedValue('file content'),
      });

      // Mock the validation system
      const mockValidator = createMock({
        validateRepositoryAnalysis: mockFunction().mockReturnValue(true),
        validateAnalysisOptions: mockFunction().mockReturnValue(true),
      });

      // Test the integration workflow
      const repositoryPath = '/test/repository';
      const validatedPath = mockFileSystem.validateRepositoryPath(repositoryPath);
      expect(validatedPath).toBe('/validated/repo/path');

      const files = await mockFileSystem.readDirectory(validatedPath);
      expect(files).toHaveLength(4);
      expect(files).toContain('src/index.ts');

      const analysisResult = await mockAnalysisEngine.analyzeRepository(validatedPath);
      expect(analysisResult.id).toBe('test-analysis-id');
      expect(analysisResult.name).toBe('test-repository');
      expect(analysisResult.language).toBe('TypeScript');

      const isValid = mockValidator.validateRepositoryAnalysis(analysisResult);
      expect(isValid).toBe(true);

      // Verify all mocks were called
      expect(mockFileSystem.validateRepositoryPath).toHaveBeenCalledWith(repositoryPath);
      expect(mockFileSystem.readDirectory).toHaveBeenCalledWith(validatedPath);
      expect(mockAnalysisEngine.analyzeRepository).toHaveBeenCalledWith(validatedPath);
      expect(mockValidator.validateRepositoryAnalysis).toHaveBeenCalledWith(analysisResult);
    });

    test('should handle analysis errors gracefully', async () => {
      // Mock an analysis engine that throws an error
      const mockAnalysisEngine = createMock({
        analyzeRepository: mockFunction().mockRejectedValue(new Error('Analysis failed')),
      });

      // Mock error handling
      const mockErrorHandler = createMock({
        handleError: mockFunction().mockReturnValue({
          id: 'error-id',
          code: 'ANALYSIS_FAILED',
          message: 'Repository analysis failed',
          suggestions: ['Check repository path', 'Verify file permissions'],
        }),
      });

      // Test error handling workflow
      try {
        await mockAnalysisEngine.analyzeRepository('/invalid/path');
        expect.fail('Should have thrown an error');
      } catch (error) {
        const handledError = mockErrorHandler.handleError(error);
        expect(handledError.code).toBe('ANALYSIS_FAILED');
        expect(handledError.suggestions).toHaveLength(2);
      }

      expect(mockAnalysisEngine.analyzeRepository).toHaveBeenCalledWith('/invalid/path');
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('Search and Index Integration', () => {
    test('should integrate search and indexing components', async () => {
      // Mock the index system
      const mockIndexSystem = createMock({
        indexRepository: mockFunction().mockResolvedValue(undefined),
        searchRepositories: mockFunction().mockResolvedValue([
          {
            id: 'repo1',
            name: 'test-repo-1',
            path: '/repos/test1',
            languages: ['TypeScript'],
            score: 0.95,
          },
          {
            id: 'repo2',
            name: 'test-repo-2',
            path: '/repos/test2',
            languages: ['JavaScript'],
            score: 0.87,
          },
        ]),
        getIndexStatus: mockFunction().mockResolvedValue({
          totalRepositories: 2,
          lastUpdated: new Date().toISOString(),
          languages: ['TypeScript', 'JavaScript'],
        }),
      });

      // Mock search query validation
      const mockSearchValidator = createMock({
        validateSearchQuery: mockFunction().mockReturnValue(true),
      });

      // Test indexing workflow
      await mockIndexSystem.indexRepository('/repos/test1');
      await mockIndexSystem.indexRepository('/repos/test2');

      // Test search workflow
      const searchQuery = {
        languages: ['TypeScript'],
        limit: 10,
      };

      const isValidQuery = mockSearchValidator.validateSearchQuery(searchQuery);
      expect(isValidQuery).toBe(true);

      const searchResults = await mockIndexSystem.searchRepositories(searchQuery);
      expect(searchResults).toHaveLength(2);
      expect(searchResults[0].name).toBe('test-repo-1');
      expect(searchResults[0].score).toBe(0.95);

      const indexStatus = await mockIndexSystem.getIndexStatus();
      expect(indexStatus.totalRepositories).toBe(2);
      expect(indexStatus.languages).toContain('TypeScript');

      // Verify all mocks were called
      expect(mockIndexSystem.indexRepository).toHaveBeenCalledTimes(2);
      expect(mockSearchValidator.validateSearchQuery).toHaveBeenCalledWith(searchQuery);
      expect(mockIndexSystem.searchRepositories).toHaveBeenCalledWith(searchQuery);
      expect(mockIndexSystem.getIndexStatus).toHaveBeenCalled();
    });
  });

  describe('Export and Format Integration', () => {
    test('should integrate export and formatting components', async () => {
      // Mock analysis data
      const mockAnalysisData = {
        id: 'analysis-123',
        name: 'export-test-repo',
        summary: 'Test repository for export functionality',
        language: 'TypeScript',
        fileCount: 50,
      };

      // Mock export system
      const mockExportSystem = createMock({
        exportToJSON: mockFunction().mockReturnValue(JSON.stringify(mockAnalysisData, null, 2)),
        exportToMarkdown: mockFunction().mockReturnValue(
          `# ${mockAnalysisData.name}\n\n${mockAnalysisData.summary}`
        ),
        exportToHTML: mockFunction().mockReturnValue(
          `<h1>${mockAnalysisData.name}</h1><p>${mockAnalysisData.summary}</p>`
        ),
      });

      // Mock file writer
      const mockFileWriter = createMock({
        writeFile: mockFunction().mockResolvedValue('/output/file.json'),
      });

      // Test export workflow
      const jsonExport = mockExportSystem.exportToJSON(mockAnalysisData);
      expect(jsonExport).toContain('"name": "export-test-repo"');

      const markdownExport = mockExportSystem.exportToMarkdown(mockAnalysisData);
      expect(markdownExport).toContain('# export-test-repo');

      const htmlExport = mockExportSystem.exportToHTML(mockAnalysisData);
      expect(htmlExport).toContain('<h1>export-test-repo</h1>');

      // Test file writing
      const outputPath = await mockFileWriter.writeFile('/output/analysis.json', jsonExport);
      expect(outputPath).toBe('/output/file.json');

      // Verify all mocks were called
      expect(mockExportSystem.exportToJSON).toHaveBeenCalledWith(mockAnalysisData);
      expect(mockExportSystem.exportToMarkdown).toHaveBeenCalledWith(mockAnalysisData);
      expect(mockExportSystem.exportToHTML).toHaveBeenCalledWith(mockAnalysisData);
      expect(mockFileWriter.writeFile).toHaveBeenCalledWith('/output/analysis.json', jsonExport);
    });
  });

  describe('Configuration Integration', () => {
    test('should integrate configuration management', () => {
      // Mock configuration system
      const mockConfigSystem = createMock({
        loadConfiguration: mockFunction().mockReturnValue({
          apiUrl: 'http://localhost:3000/api',
          defaultMode: 'standard',
          maxFiles: 1000,
          outputFormats: ['json'],
        }),
        updateConfiguration: mockFunction().mockReturnValue(true),
        validateConfiguration: mockFunction().mockReturnValue({
          isValid: true,
          errors: [],
        }),
      });

      // Mock user preferences
      const mockUserPreferences = createMock({
        getPreferences: mockFunction().mockReturnValue({
          theme: 'dark',
          autoSave: true,
          defaultOutputDir: './analysis-results',
        }),
        updatePreferences: mockFunction().mockReturnValue(true),
      });

      // Test configuration workflow
      const config = mockConfigSystem.loadConfiguration();
      expect(config.apiUrl).toBe('http://localhost:3000/api');
      expect(config.defaultMode).toBe('standard');

      const preferences = mockUserPreferences.getPreferences();
      expect(preferences.theme).toBe('dark');
      expect(preferences.autoSave).toBe(true);

      // Test configuration updates
      const newConfig = { ...config, maxFiles: 2000 };
      const updateResult = mockConfigSystem.updateConfiguration(newConfig);
      expect(updateResult).toBe(true);

      const validation = mockConfigSystem.validateConfiguration(newConfig);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Verify all mocks were called
      expect(mockConfigSystem.loadConfiguration).toHaveBeenCalled();
      expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
      expect(mockConfigSystem.updateConfiguration).toHaveBeenCalledWith(newConfig);
      expect(mockConfigSystem.validateConfiguration).toHaveBeenCalledWith(newConfig);
    });
  });

  describe('Error Handling Integration', () => {
    test('should integrate error classification and formatting', () => {
      // Mock error classifier
      const mockErrorClassifier = createMock({
        classifyError: mockFunction().mockReturnValue({
          id: 'error-123',
          code: 'PATH_NOT_FOUND',
          category: 'PATH_VALIDATION',
          severity: 'HIGH',
          message: 'Repository path not found',
          suggestions: [
            { action: 'Check path exists', platform: 'all' },
            { action: 'Verify permissions', platform: 'all' },
          ],
        }),
      });

      // Mock error formatter
      const mockErrorFormatter = createMock({
        formatForAPI: mockFunction().mockReturnValue({
          error: {
            id: 'error-123',
            code: 'PATH_NOT_FOUND',
            message: 'Repository path not found',
          },
          suggestions: ['Check path exists', 'Verify permissions'],
        }),
        formatForConsole: mockFunction().mockReturnValue(
          'ERROR [PATH_NOT_FOUND]: Repository path not found\n' +
            'Suggestions:\n' +
            '  1. Check path exists\n' +
            '  2. Verify permissions'
        ),
      });

      // Test error handling workflow
      const originalError = new Error('ENOENT: no such file or directory');
      const classifiedError = mockErrorClassifier.classifyError(originalError, {
        path: '/nonexistent/path',
      });

      expect(classifiedError.code).toBe('PATH_NOT_FOUND');
      expect(classifiedError.severity).toBe('HIGH');
      expect(classifiedError.suggestions).toHaveLength(2);

      const apiFormat = mockErrorFormatter.formatForAPI(classifiedError);
      expect(apiFormat.error.code).toBe('PATH_NOT_FOUND');
      expect(apiFormat.suggestions).toHaveLength(2);

      const consoleFormat = mockErrorFormatter.formatForConsole(classifiedError);
      expect(consoleFormat).toContain('ERROR [PATH_NOT_FOUND]');
      expect(consoleFormat).toContain('Suggestions:');

      // Verify all mocks were called
      expect(mockErrorClassifier.classifyError).toHaveBeenCalledWith(originalError, {
        path: '/nonexistent/path',
      });
      expect(mockErrorFormatter.formatForAPI).toHaveBeenCalledWith(classifiedError);
      expect(mockErrorFormatter.formatForConsole).toHaveBeenCalledWith(classifiedError);
    });
  });
});
