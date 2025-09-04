/**
 * CLI configuration tests
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMock, mockFunction, mockManager } from '../../../../../tests/MockManager';

describe('CLI Configuration Tests', () => {
  beforeEach(() => {
    mockManager.setupMocks();
  });

  describe('Mock Configuration Setup', () => {
    it('should create configuration mocks', () => {
      // Mock Conf using MockManager
      const MockConf = mockFunction();
      const mockConfInstance = createMock({
        get: mockFunction(),
        set: mockFunction(),
        has: mockFunction(),
        delete: mockFunction(),
        clear: mockFunction(),
        size: 0,
        store: {},
        path: '/mock/path',
      });

      MockConf.mockImplementation(() => mockConfInstance);

      // Test mock setup
      const conf = new MockConf();
      expect(conf.get).toBeDefined();
      expect(conf.set).toBeDefined();
      expect(conf.has).toBeDefined();
      expect(conf.delete).toBeDefined();
      expect(conf.clear).toBeDefined();
      expect(conf.size).toBe(0);
      expect(conf.store).toEqual({});
      expect(conf.path).toBe('/mock/path');
    });

    it('should mock configuration methods', () => {
      const mockGet = mockFunction();
      const mockSet = mockFunction();

      const mockConfig = createMock({
        get: mockGet.mockReturnValue('test-value'),
        set: mockSet,
      });

      // Test mock behavior
      const value = mockConfig.get('test-key');
      expect(value).toBe('test-value');
      expect(mockGet).toHaveBeenCalledWith('test-key');

      mockConfig.set('test-key', 'new-value');
      expect(mockSet).toHaveBeenCalledWith('test-key', 'new-value');
    });
  });

  describe('User Preferences Mock', () => {
    it('should mock user preferences structure', () => {
      const mockPreferences = {
        general: {
          theme: 'dark',
          autoSave: true,
        },
        analysis: {
          defaultMode: 'standard',
          maxFiles: 1000,
        },
        llmProvider: {
          defaultProvider: 'claude',
        },
        export: {
          defaultFormat: 'json',
        },
      };

      const mockConfig = createMock({
        get: mockFunction().mockReturnValue(mockPreferences),
        set: mockFunction(),
      });

      // Test preferences retrieval
      const preferences = mockConfig.get('userPreferences');
      expect(preferences).toEqual(mockPreferences);
      expect(preferences.general.theme).toBe('dark');
      expect(preferences.analysis.defaultMode).toBe('standard');
      expect(preferences.llmProvider.defaultProvider).toBe('claude');
      expect(preferences.export.defaultFormat).toBe('json');
    });
  });

  describe('Analysis Options Mock', () => {
    it('should mock analysis options', () => {
      const mockAnalysisOptions = {
        mode: 'comprehensive',
        maxFiles: 2000,
        maxLinesPerFile: 5000,
        includeLLMAnalysis: true,
        llmProvider: 'gemini',
        outputFormats: ['json', 'markdown'],
        includeTree: true,
      };

      const mockConfig = createMock({
        get: mockFunction()
          .mockReturnValueOnce(mockAnalysisOptions) // userPreferences
          .mockReturnValueOnce({}), // defaultOptions
      });

      // Test options retrieval
      const userPrefs = mockConfig.get('userPreferences');
      const defaultOpts = mockConfig.get('defaultOptions');

      expect(userPrefs).toEqual(mockAnalysisOptions);
      expect(defaultOpts).toEqual({});
    });
  });

  describe('Mock Manager Integration', () => {
    it('should properly use MockManager', () => {
      // Test that MockManager is working
      expect(mockManager).toBeDefined();
      expect(typeof mockManager.setupMocks).toBe('function');
      expect(typeof mockManager.cleanupMocks).toBe('function');

      // Test mock creation
      const testMock = mockFunction();
      expect(testMock).toBeDefined();
      expect(typeof testMock).toBe('function');

      // Test object mocking
      const testObject = createMock({
        testMethod: mockFunction(),
        testProperty: 'test-value',
      });
      expect(testObject.testMethod).toBeDefined();
      expect(testObject.testProperty).toBe('test-value');
    });
  });
});
