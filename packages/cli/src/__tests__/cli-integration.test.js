"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const index_1 = require("../index");
const utils_1 = require("../utils");
// Mock the API client
bun_test_1.mock.module('../utils/api-client', () => ({
    ApiClient: (0, bun_test_1.mock)(() => ({
        analyzeRepository: (0, bun_test_1.mock)(() => Promise.resolve({})),
    })),
}));
// Mock the progress tracker
bun_test_1.mock.module('../utils/progress', () => ({
    ProgressTracker: (0, bun_test_1.mock)(() => ({
        start: (0, bun_test_1.mock)(() => { }),
        succeed: (0, bun_test_1.mock)(() => { }),
        fail: (0, bun_test_1.mock)(() => { }),
        update: (0, bun_test_1.mock)(() => { }),
    })),
}));
// Mock fs functions
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn().mockReturnValue(true),
    writeFileSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([
        { name: 'repo1', isDirectory: () => true },
        { name: 'repo2', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.git', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
    ]),
}));
// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
console.log = jest.fn();
// Reset mocks before each test
(0, bun_test_1.beforeEach)(() => {
    jest.clearAllMocks();
    MockApiClient.mockClear();
});
// Restore console.log after all tests
afterAll(() => {
    console.log = originalConsoleLog;
});
(0, bun_test_1.describe)('CLI Integration Tests', () => {
    (0, bun_test_1.describe)('analyze command', () => {
        (0, bun_test_1.test)('should call analyzeRepository with correct parameters', async () => {
            // Mock API response
            const mockAnalyzeRepository = jest.fn().mockResolvedValue({
                id: 'test-id',
                name: 'test-repo',
                language: 'TypeScript',
                fileCount: 100,
                directoryCount: 10,
                totalSize: 1024 * 1024,
                metadata: { processingTime: 1000 },
            });
            MockApiClient.prototype.analyzeRepository = mockAnalyzeRepository;
            // Execute command
            await index_1.program.parseAsync([
                'node',
                'test',
                'analyze',
                './test-repo',
                '--output',
                'json',
                '--mode',
                'quick',
            ]);
            // Verify API client was called with correct parameters
            (0, bun_test_1.expect)(mockAnalyzeRepository).toHaveBeenCalledWith(bun_test_1.expect.stringContaining('test-repo'), bun_test_1.expect.objectContaining({
                mode: 'quick',
                outputFormats: ['json'],
            }));
        });
    });
    (0, bun_test_1.describe)('batch command', () => {
        (0, bun_test_1.test)('should call analyzeBatch with correct parameters', async () => {
            // Mock API response
            const mockAnalyzeBatch = jest.fn().mockResolvedValue({
                id: 'batch-id',
                repositories: [
                    { id: 'repo1-id', name: 'repo1', path: '/path/to/repo1' },
                    { id: 'repo2-id', name: 'repo2', path: '/path/to/repo2' },
                ],
                status: {
                    total: 2,
                    completed: 2,
                    failed: 0,
                    inProgress: 0,
                    pending: 0,
                    progress: 100,
                },
                processingTime: 2000,
            });
            MockApiClient.prototype.analyzeBatch = mockAnalyzeBatch;
            // Execute command
            await index_1.program.parseAsync([
                'node',
                'test',
                'batch',
                './repos',
                '--output',
                'markdown',
                '--depth',
                '2',
                '--combined',
            ]);
            // Verify API client was called with correct parameters
            (0, bun_test_1.expect)(mockAnalyzeBatch).toHaveBeenCalledWith(bun_test_1.expect.any(Array), bun_test_1.expect.objectContaining({
                outputFormats: ['markdown'],
            }));
        });
    });
    (0, bun_test_1.describe)('search command', () => {
        (0, bun_test_1.test)('should call searchRepositories with correct parameters', async () => {
            // Mock API response
            const mockSearchRepositories = jest.fn().mockResolvedValue([
                {
                    repository: {
                        id: 'repo1-id',
                        name: 'repo1',
                        path: '/path/to/repo1',
                        languages: ['TypeScript'],
                        frameworks: ['React'],
                        tags: ['frontend'],
                        summary: 'A test repository',
                        lastAnalyzed: new Date(),
                        size: 1024 * 1024,
                        complexity: 0.5,
                    },
                    score: 0.95,
                    matches: [
                        { field: 'name', value: 'repo1', score: 1.0 },
                        { field: 'summary', value: 'test repository', score: 0.9 },
                    ],
                },
            ]);
            MockApiClient.prototype.searchRepositories = mockSearchRepositories;
            // Execute command
            await index_1.program.parseAsync([
                'node',
                'test',
                'search',
                'test',
                '--language',
                'typescript',
                '--limit',
                '10',
            ]);
            // Verify API client was called with correct parameters
            (0, bun_test_1.expect)(mockSearchRepositories).toHaveBeenCalledWith(bun_test_1.expect.stringContaining('q=test'));
        });
    });
    (0, bun_test_1.describe)('export command', () => {
        (0, bun_test_1.test)('should call exportAnalysis with correct parameters', async () => {
            // Mock API response
            const mockExportAnalysis = jest.fn().mockResolvedValue(Buffer.from('test data'));
            MockApiClient.prototype.exportAnalysis = mockExportAnalysis;
            // Execute command
            await index_1.program.parseAsync(['node', 'test', 'export', 'analysis-123', '--format', 'html']);
            // Verify API client was called with correct parameters
            (0, bun_test_1.expect)(mockExportAnalysis).toHaveBeenCalledWith('analysis-123', 'html');
        });
    });
    (0, bun_test_1.describe)('index command', () => {
        (0, bun_test_1.test)('should call rebuildIndex when --rebuild flag is used', async () => {
            // Mock API response
            const mockRebuildIndex = jest.fn().mockResolvedValue(undefined);
            MockApiClient.prototype.rebuildIndex = mockRebuildIndex;
            // Execute command
            await index_1.program.parseAsync(['node', 'test', 'index', '--rebuild']);
            // Verify API client was called
            (0, bun_test_1.expect)(mockRebuildIndex).toHaveBeenCalled();
        });
        (0, bun_test_1.test)('should call updateIndex when --update flag is used', async () => {
            // Mock API response
            const mockUpdateIndex = jest.fn().mockResolvedValue(undefined);
            MockApiClient.prototype.updateIndex = mockUpdateIndex;
            // Execute command
            await index_1.program.parseAsync(['node', 'test', 'index', '--update', '--path', './repos']);
            // Verify API client was called with correct parameters
            (0, bun_test_1.expect)(mockUpdateIndex).toHaveBeenCalledWith('./repos');
        });
        (0, bun_test_1.test)('should call getIndexStatus when no flags are provided', async () => {
            // Mock API response
            const mockGetIndexStatus = jest.fn().mockResolvedValue({
                totalRepositories: 10,
                lastUpdated: new Date().toISOString(),
                languages: ['TypeScript', 'JavaScript'],
                frameworks: ['React', 'Express'],
                tags: ['frontend', 'backend'],
            });
            MockApiClient.prototype.getIndexStatus = mockGetIndexStatus;
            // Execute command
            await index_1.program.parseAsync(['node', 'test', 'index']);
            // Verify API client was called
            (0, bun_test_1.expect)(mockGetIndexStatus).toHaveBeenCalled();
        });
    });
    (0, bun_test_1.describe)('config command', () => {
        (0, bun_test_1.test)('should update configuration when --set flag is used', async () => {
            // Spy on config.set
            const configSetSpy = jest.spyOn(utils_1.config, 'set');
            // Execute command
            await index_1.program.parseAsync([
                'node',
                'test',
                'config',
                '--set',
                'apiUrl=http://localhost:4000/api',
            ]);
            // Verify config.set was called with correct parameters
            (0, bun_test_1.expect)(configSetSpy).toHaveBeenCalledWith('apiUrl', 'http://localhost:4000/api');
        });
        (0, bun_test_1.test)('should create a new profile when --create-profile flag is used', async () => {
            // Mock config.get and config.set
            const configGetSpy = jest.spyOn(utils_1.config, 'get').mockImplementation((key) => {
                if (key === 'profiles')
                    return {};
                if (key === 'apiUrl')
                    return 'http://localhost:3000/api';
                if (key === 'defaultOptions')
                    return { mode: 'standard' };
                if (key === 'outputDir')
                    return './output';
                return undefined;
            });
            const configSetSpy = jest.spyOn(utils_1.config, 'set');
            // Execute command
            await index_1.program.parseAsync(['node', 'test', 'config', '--create-profile', 'dev']);
            // Verify config.set was called with correct parameters
            (0, bun_test_1.expect)(configSetSpy).toHaveBeenCalledWith('profiles', {
                dev: {
                    apiUrl: 'http://localhost:3000/api',
                    defaultOptions: { mode: 'standard' },
                    outputDir: './output',
                },
            });
            (0, bun_test_1.expect)(configSetSpy).toHaveBeenCalledWith('activeProfile', 'dev');
        });
    });
});
//# sourceMappingURL=cli-integration.test.js.map