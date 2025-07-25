/**
 * CLI configuration tests
 */

import Conf from 'conf';
import { DEFAULT_USER_PREFERENCES } from '@unified-repo-analyzer/shared';
import config, {
  getEffectiveAnalysisOptions,
  updateUserPreferences,
  getUserPreferences,
  resetPreferences,
} from '../config';

// Mock Conf
jest.mock('conf');

const MockConf = Conf as jest.MockedClass<typeof Conf>;

describe('CLI Configuration', () => {
  let mockConfInstance: jest.Mocked<Conf<any>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfInstance = {
      get: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      size: 0,
      store: {},
      path: '/mock/path',
    } as any;

    MockConf.mockImplementation(() => mockConfInstance);
  });

  describe('getEffectiveAnalysisOptions', () => {
    it('should return analysis options from user preferences', () => {
      const mockPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        analysis: {
          ...DEFAULT_USER_PREFERENCES.analysis,
          defaultMode: 'comprehensive' as const,
          maxFiles: 1000,
        },
        llmProvider: {
          ...DEFAULT_USER_PREFERENCES.llmProvider,
          defaultProvider: 'gemini',
        },
        export: {
          ...DEFAULT_USER_PREFERENCES.export,
          defaultFormat: 'markdown' as const,
        },
      };

      mockConfInstance.get
        .mockReturnValueOnce(mockPreferences) // userPreferences
        .mockReturnValueOnce({}); // defaultOptions

      const options = getEffectiveAnalysisOptions();

      expect(options.mode).toBe('comprehensive');
      expect(options.maxFiles).toBe(1000);
      expect(options.llmProvider).toBe('gemini');
      expect(options.outputFormats).toEqual(['markdown']);
    });

    it('should merge with default options', () => {
      const mockPreferences = DEFAULT_USER_PREFERENCES;
      const mockDefaultOptions = {
        maxLinesPerFile: 2000,
        includeTree: false,
      };

      mockConfInstance.get
        .mockReturnValueOnce(mockPreferences)
        .mockReturnValueOnce(mockDefaultOptions);

      const options = getEffectiveAnalysisOptions();

      expect(options.maxLinesPerFile).toBe(2000); // From default options
      expect(options.includeTree).toBe(false); // From default options
      expect(options.mode).toBe('standard'); // From preferences
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', () => {
      const currentPreferences = DEFAULT_USER_PREFERENCES;
      const updates = {
        general: {
          theme: 'dark' as const,
        },
      };

      mockConfInstance.get.mockReturnValue(currentPreferences);

      updateUserPreferences(updates);

      expect(mockConfInstance.set).toHaveBeenCalledWith('userPreferences', {
        ...currentPreferences,
        ...updates,
      });
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', () => {
      const mockPreferences = DEFAULT_USER_PREFERENCES;
      mockConfInstance.get.mockReturnValue(mockPreferences);

      const result = getUserPreferences();

      expect(result).toEqual(mockPreferences);
      expect(mockConfInstance.get).toHaveBeenCalledWith('userPreferences');
    });
  });

  describe('resetPreferences', () => {
    it('should reset preferences to defaults', () => {
      resetPreferences();

      expect(mockConfInstance.set).toHaveBeenCalledWith(
        'userPreferences',
        DEFAULT_USER_PREFERENCES
      );
    });
  });

  describe('config initialization', () => {
    it('should initialize with correct defaults', () => {
      expect(MockConf).toHaveBeenCalledWith({
        projectName: 'unified-repo-analyzer',
        defaults: {
          apiUrl: 'http://localhost:3000/api',
          defaultOptions: {
            mode: 'standard',
            maxFiles: 500,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: true,
            llmProvider: 'claude',
            outputFormats: ['json'],
            includeTree: true,
          },
          outputDir: './analysis-results',
          userPreferences: DEFAULT_USER_PREFERENCES,
        },
      });
    });
  });
});
