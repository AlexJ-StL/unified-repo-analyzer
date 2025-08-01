/**
 * API integration tests
 */
import request from 'supertest';
import { app } from '../../index';
import { AnalysisEngine } from '../../core/AnalysisEngine';
import { IndexSystem } from '../../core/IndexSystem';
// Mock the AnalysisEngine and IndexSystem
jest.mock('../../core/AnalysisEngine');
jest.mock('../../core/IndexSystem');
describe('API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Health Check', () => {
        it('should return status ok', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok' });
        });
    });
    describe('Repository Analysis', () => {
        it('should analyze a repository', async () => {
            // Mock the analyzeRepository method
            const mockAnalysis = {
                id: '123',
                path: '/test/repo',
                name: 'test-repo',
                languages: ['JavaScript'],
                frameworks: ['React'],
                fileCount: 10,
                directoryCount: 5,
                totalSize: 1000,
                createdAt: new Date(),
                updatedAt: new Date(),
                structure: {
                    directories: [],
                    keyFiles: [],
                    tree: '',
                },
                codeAnalysis: {
                    functionCount: 5,
                    classCount: 2,
                    importCount: 10,
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
                    frameworks: [],
                },
                insights: {
                    executiveSummary: 'Test summary',
                    technicalBreakdown: 'Test breakdown',
                    recommendations: [],
                    potentialIssues: [],
                },
                metadata: {
                    analysisMode: 'standard',
                    processingTime: 100,
                },
            };
            AnalysisEngine.prototype.analyzeRepository.mockResolvedValue(mockAnalysis);
            const response = await request(app)
                .post('/api/analyze')
                .send({
                path: '/test/repo',
                options: {
                    mode: 'standard',
                    maxFiles: 100,
                },
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAnalysis);
            expect(AnalysisEngine.prototype.analyzeRepository).toHaveBeenCalledWith('/test/repo', expect.objectContaining({
                mode: 'standard',
                maxFiles: 100,
            }));
        });
        it('should return validation error for missing path', async () => {
            const response = await request(app)
                .post('/api/analyze')
                .send({
                options: {
                    mode: 'standard',
                },
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });
        it('should analyze multiple repositories', async () => {
            // Mock the analyzeMultipleRepositories method
            const mockBatchResult = {
                id: '456',
                repositories: [
                    {
                        id: '123',
                        path: '/test/repo1',
                        name: 'test-repo1',
                    },
                    {
                        id: '124',
                        path: '/test/repo2',
                        name: 'test-repo2',
                    },
                ],
                createdAt: new Date(),
                processingTime: 200,
            };
            AnalysisEngine.prototype.analyzeMultipleRepositories.mockResolvedValue(mockBatchResult);
            const response = await request(app)
                .post('/api/analyze/batch')
                .send({
                paths: ['/test/repo1', '/test/repo2'],
                options: {
                    mode: 'quick',
                },
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBatchResult);
            expect(AnalysisEngine.prototype.analyzeMultipleRepositories).toHaveBeenCalledWith(['/test/repo1', '/test/repo2'], expect.objectContaining({
                mode: 'quick',
            }));
        });
    });
    describe('Repository Management', () => {
        it('should get all repositories', async () => {
            // Mock the getIndex method
            const mockRepositories = [
                {
                    id: '123',
                    name: 'test-repo1',
                    path: '/test/repo1',
                    languages: ['JavaScript'],
                    frameworks: ['React'],
                    tags: ['frontend'],
                    summary: 'Test repo 1',
                    lastAnalyzed: new Date(),
                    size: 1000,
                    complexity: 5,
                },
                {
                    id: '124',
                    name: 'test-repo2',
                    path: '/test/repo2',
                    languages: ['TypeScript'],
                    frameworks: ['Express'],
                    tags: ['backend'],
                    summary: 'Test repo 2',
                    lastAnalyzed: new Date(),
                    size: 2000,
                    complexity: 8,
                },
            ];
            IndexSystem.prototype.getIndex.mockReturnValue({
                repositories: mockRepositories,
                relationships: [],
                tags: [],
                lastUpdated: new Date(),
            });
            const response = await request(app).get('/api/repositories');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRepositories);
            expect(IndexSystem.prototype.getIndex).toHaveBeenCalled();
        });
        it('should get a repository by ID', async () => {
            // Mock the getIndex method
            const mockRepository = {
                id: '123',
                name: 'test-repo1',
                path: '/test/repo1',
                languages: ['JavaScript'],
                frameworks: ['React'],
                tags: ['frontend'],
                summary: 'Test repo 1',
                lastAnalyzed: new Date(),
                size: 1000,
                complexity: 5,
            };
            IndexSystem.prototype.getIndex.mockReturnValue({
                repositories: [mockRepository],
                relationships: [],
                tags: [],
                lastUpdated: new Date(),
            });
            const response = await request(app).get('/api/repositories/123');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRepository);
            expect(IndexSystem.prototype.getIndex).toHaveBeenCalled();
        });
        it('should return 404 for non-existent repository', async () => {
            // Mock the getIndex method
            IndexSystem.prototype.getIndex.mockReturnValue({
                repositories: [],
                relationships: [],
                tags: [],
                lastUpdated: new Date(),
            });
            const response = await request(app).get('/api/repositories/999');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should search repositories', async () => {
            // Mock the searchRepositories method
            const mockSearchResults = [
                {
                    repository: {
                        id: '123',
                        name: 'test-repo1',
                        path: '/test/repo1',
                        languages: ['JavaScript'],
                        frameworks: ['React'],
                        tags: ['frontend'],
                        summary: 'Test repo 1',
                        lastAnalyzed: new Date(),
                        size: 1000,
                        complexity: 5,
                    },
                    score: 15,
                    matches: [
                        {
                            field: 'languages',
                            value: 'JavaScript',
                            score: 10,
                        },
                        {
                            field: 'frameworks',
                            value: 'React',
                            score: 5,
                        },
                    ],
                },
            ];
            AnalysisEngine.prototype.searchRepositories.mockResolvedValue(mockSearchResults);
            const response = await request(app)
                .get('/api/repositories/search')
                .query({
                languages: ['JavaScript'],
                frameworks: ['React'],
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSearchResults);
            expect(AnalysisEngine.prototype.searchRepositories).toHaveBeenCalledWith(expect.objectContaining({
                languages: ['JavaScript'],
                frameworks: ['React'],
            }));
        });
        it('should find similar repositories', async () => {
            // Mock the findSimilarRepositories method
            const mockSimilarRepositories = [
                {
                    repository: {
                        id: '124',
                        name: 'test-repo2',
                        path: '/test/repo2',
                        languages: ['JavaScript'],
                        frameworks: ['React'],
                        tags: ['frontend'],
                        summary: 'Test repo 2',
                        lastAnalyzed: new Date(),
                        size: 2000,
                        complexity: 6,
                    },
                    similarity: 0.8,
                    matchReason: 'Shares languages: JavaScript',
                },
            ];
            AnalysisEngine.prototype.findSimilarRepositories.mockResolvedValue(mockSimilarRepositories);
            const response = await request(app).get('/api/repositories/123/similar');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSimilarRepositories);
            expect(AnalysisEngine.prototype.findSimilarRepositories).toHaveBeenCalledWith('123');
        });
        it('should suggest combinations', async () => {
            // Mock the suggestCombinations method
            const mockCombinations = [
                {
                    repositories: ['123', '124'],
                    compatibility: 0.8,
                    rationale: 'Frontend-Backend pair',
                    integrationPoints: ['API integration', 'Shared data models'],
                },
            ];
            AnalysisEngine.prototype.suggestCombinations.mockResolvedValue(mockCombinations);
            const response = await request(app)
                .post('/api/repositories/combinations')
                .send({
                repoIds: ['123', '124'],
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCombinations);
            expect(AnalysisEngine.prototype.suggestCombinations).toHaveBeenCalledWith(['123', '124']);
        });
    });
});
//# sourceMappingURL=api.test.js.map