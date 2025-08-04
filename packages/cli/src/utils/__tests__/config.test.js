"use strict";
/**
 * CLI configuration tests
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conf_1 = __importDefault(require("conf"));
const shared_1 = require("@unified-repo-analyzer/shared");
const config_1 = require("../config");
// Mock Conf
jest.mock('conf');
const MockConf = conf_1.default;
describe('CLI Configuration', () => {
    let mockConfInstance;
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
        };
        MockConf.mockImplementation(() => mockConfInstance);
    });
    describe('getEffectiveAnalysisOptions', () => {
        it('should return analysis options from user preferences', () => {
            const mockPreferences = {
                ...shared_1.DEFAULT_USER_PREFERENCES,
                analysis: {
                    ...shared_1.DEFAULT_USER_PREFERENCES.analysis,
                    defaultMode: 'comprehensive',
                    maxFiles: 1000,
                },
                llmProvider: {
                    ...shared_1.DEFAULT_USER_PREFERENCES.llmProvider,
                    defaultProvider: 'gemini',
                },
                export: {
                    ...shared_1.DEFAULT_USER_PREFERENCES.export,
                    defaultFormat: 'markdown',
                },
            };
            mockConfInstance.get
                .mockReturnValueOnce(mockPreferences) // userPreferences
                .mockReturnValueOnce({}); // defaultOptions
            const options = (0, config_1.getEffectiveAnalysisOptions)();
            expect(options.mode).toBe('comprehensive');
            expect(options.maxFiles).toBe(1000);
            expect(options.llmProvider).toBe('gemini');
            expect(options.outputFormats).toEqual(['markdown']);
        });
        it('should merge with default options', () => {
            const mockPreferences = shared_1.DEFAULT_USER_PREFERENCES;
            const mockDefaultOptions = {
                maxLinesPerFile: 2000,
                includeTree: false,
            };
            mockConfInstance.get
                .mockReturnValueOnce(mockPreferences)
                .mockReturnValueOnce(mockDefaultOptions);
            const options = (0, config_1.getEffectiveAnalysisOptions)();
            expect(options.maxLinesPerFile).toBe(2000); // From default options
            expect(options.includeTree).toBe(false); // From default options
            expect(options.mode).toBe('standard'); // From preferences
        });
    });
    describe('updateUserPreferences', () => {
        it('should update user preferences', () => {
            const currentPreferences = shared_1.DEFAULT_USER_PREFERENCES;
            const updates = {
                general: {
                    theme: 'dark',
                },
            };
            mockConfInstance.get.mockReturnValue(currentPreferences);
            (0, config_1.updateUserPreferences)(updates);
            expect(mockConfInstance.set).toHaveBeenCalledWith('userPreferences', {
                ...currentPreferences,
                ...updates,
            });
        });
    });
    describe('getUserPreferences', () => {
        it('should return user preferences', () => {
            const mockPreferences = shared_1.DEFAULT_USER_PREFERENCES;
            mockConfInstance.get.mockReturnValue(mockPreferences);
            const result = (0, config_1.getUserPreferences)();
            expect(result).toEqual(mockPreferences);
            expect(mockConfInstance.get).toHaveBeenCalledWith('userPreferences');
        });
    });
    describe('resetPreferences', () => {
        it('should reset preferences to defaults', () => {
            (0, config_1.resetPreferences)();
            expect(mockConfInstance.set).toHaveBeenCalledWith('userPreferences', shared_1.DEFAULT_USER_PREFERENCES);
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
                    userPreferences: shared_1.DEFAULT_USER_PREFERENCES,
                },
            });
        });
    });
});
//# sourceMappingURL=config.test.js.map