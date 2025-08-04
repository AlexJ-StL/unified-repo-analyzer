/**
 * Integration tests for AnalysisEngine with advanced features
 */
import { AnalysisEngine } from '../AnalysisEngine';
// Mock dependencies
jest.mock('../../utils/fileSystem', () => ({
    readFileWithErrorHandling: jest.fn(),
}));
jest.mock('../../utils/repositoryDiscovery', () => ({
    discoverRepository: jest.fn(),
    analysisOptionsToDiscoveryOptions: jest.fn(),
}));
jest.mock('../../services/cache.service', () => ({
    cacheService: {
        getCachedAnalysis: jest.fn().mockResolvedValue(null),
        setCachedAnalysis: jest.fn().mockResolvedValue(undefined),
    },
}));
jest.mock('../../services/deduplication.service', () => ({
    deduplicationService: {
        deduplicateAnalysis: jest.fn().mockImplementation((path, options, fn) => fn()),
    },
}));
jest.mock('../../services/metrics.service', () => ({
    metricsService: {
        createTimer: jest.fn().mockReturnValue(() => { }),
        recordAnalysis: jest.fn(),
    },
}));
const { readFileWithErrorHandling: mockReadFile } = await import('../../utils/fileSystem');
const { discoverRepository: mockDiscoverRepository, analysisOptionsToDiscoveryOptions: mockAnalysisOptionsToDiscoveryOptions, } = await import('../../utils/repositoryDiscovery');
describe('AnalysisEngine Advanced Features Integration', () => {
    let engine;
    let mockAnalysisOptions;
    beforeEach(() => {
        engine = new AnalysisEngine();
        mockAnalysisOptions = {
            mode: 'comprehensive',
            maxFiles: 100,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: false,
            llmProvider: 'mock',
            outputFormats: ['json'],
            includeTree: true,
        };
        // Reset mocks
        jest.clearAllMocks();
        // Setup default mock implementations
        mockAnalysisOptionsToDiscoveryOptions.mockReturnValue({});
        mockDiscoverRepository.mockResolvedValue({
            id: 'test-repo-id',
            path: '/test/repo',
            name: 'test-repo',
            language: 'JavaScript',
            languages: ['JavaScript', 'TypeScript'],
            frameworks: ['React', 'Express'],
            fileCount: 25,
            directoryCount: 5,
            totalSize: 512000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
                directories: [
                    { path: 'src', files: 15, subdirectories: 2 },
                    { path: 'src/components', files: 8, subdirectories: 0 },
                    { path: 'src/services', files: 3, subdirectories: 0 },
                ],
                keyFiles: [
                    {
                        path: 'src/app.js',
                        language: 'JavaScript',
                        size: 4096,
                        lineCount: 150,
                        importance: 0.9,
                        functions: [],
                        classes: [],
                    },
                    {
                        path: 'src/config.js',
                        language: 'JavaScript',
                        size: 1024,
                        lineCount: 40,
                        importance: 0.7,
                        functions: [],
                        classes: [],
                    },
                ],
                tree: 'mock-tree-structure',
            },
            codeAnalysis: {
                functionCount: 0,
                classCount: 0,
                importCount: 0,
                complexity: {
                    cyclomaticComplexity: 1,
                    maintainabilityIndex: 100,
                    technicalDebt: 'None',
                    codeQuality: 'excellent',
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
                analysisMode: 'comprehensive',
                processingTime: 0,
            },
        });
    });
    describe('Comprehensive Mode Analysis', () => {
        it('should perform advanced analysis in comprehensive mode', async () => {
            const vulnerableContent = `
        const password = "hardcoded123";
        const apiKey = "sk-1234567890";
        
        function complexFunction() {
          if (condition1) {
            if (condition2) {
              while (loop) {
                for (let i = 0; i < 10; i++) {
                  if (condition3) {
                    // TODO: Fix this security issue
                    document.innerHTML = userInput;
                    return eval(userCode);
                  }
                }
              }
            }
          }
        }
        
        class UserService {
          constructor() {
            this.users = [];
          }
          
          createUser(data) {
            return new User(data);
          }
        }
      `;
            mockReadFile.mockResolvedValue(vulnerableContent);
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            // Verify that advanced analysis was performed
            expect(result.metadata.analysisMode).toBe('comprehensive');
            // Verify that security recommendations were added
            expect(result.insights.recommendations.length).toBeGreaterThan(0);
            const recommendations = result.insights.recommendations.join(' ');
            expect(recommendations).toContain('environment variables');
            // Verify that security issues were identified
            expect(result.insights.potentialIssues.length).toBeGreaterThan(0);
            const issues = result.insights.potentialIssues.join(' ');
            expect(issues).toContain('Security:');
            // Verify that quality issues were identified
            expect(issues).toContain('Quality:');
        });
        it('should not perform advanced analysis in quick mode', async () => {
            const quickOptions = {
                ...mockAnalysisOptions,
                mode: 'quick',
            };
            mockReadFile.mockResolvedValue('const simpleCode = "hello world";');
            const result = await engine.analyzeRepository('/test/repo', quickOptions);
            expect(result.metadata.analysisMode).toBe('quick');
            // Should have fewer recommendations since advanced analysis is skipped
            expect(result.insights.recommendations.length).toBeLessThan(5);
        });
        it('should not perform advanced analysis in standard mode', async () => {
            const standardOptions = {
                ...mockAnalysisOptions,
                mode: 'standard',
            };
            mockReadFile.mockResolvedValue('const simpleCode = "hello world";');
            const result = await engine.analyzeRepository('/test/repo', standardOptions);
            expect(result.metadata.analysisMode).toBe('standard');
            // Should have fewer recommendations since advanced analysis is skipped
            expect(result.insights.recommendations.length).toBeLessThan(5);
        });
    });
    describe('Security Integration', () => {
        it('should add high-severity security issues to potential issues', async () => {
            const criticalSecurityContent = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        const password = "admin123";
        eval(userInput);
      `;
            mockReadFile.mockResolvedValue(criticalSecurityContent);
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            const securityIssues = result.insights.potentialIssues.filter((issue) => issue.startsWith('Security:'));
            expect(securityIssues.length).toBeGreaterThan(0);
            expect(securityIssues.some((issue) => issue.includes('SQL Injection'))).toBe(true);
        });
        it('should add security recommendations', async () => {
            const reactExpressContent = `
        const express = require('express');
        const React = require('react');
        
        const app = express();
        
        app.get('/api/users', (req, res) => {
          const query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";
          // Vulnerable SQL query
        });
      `;
            mockReadFile.mockResolvedValue(reactExpressContent);
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            const recommendations = result.insights.recommendations;
            expect(recommendations.some((rec) => rec.includes('helmet.js'))).toBe(true);
            expect(recommendations.some((rec) => rec.includes('rate limiting'))).toBe(true);
            expect(recommendations.some((rec) => rec.includes('XSS'))).toBe(true);
        });
    });
    describe('Code Quality Integration', () => {
        it('should add high-severity quality issues to potential issues', async () => {
            const poorQualityContent = `
        // TODO: This is a critical issue that needs fixing
        function massiveFunction() {
          ${Array(200).fill('console.log("This is a very long method");').join('\n')}
        }
        
        const duplicatedCode = "this appears many times";
        const duplicatedCode = "this appears many times";
        const duplicatedCode = "this appears many times";
        const duplicatedCode = "this appears many times";
      `;
            mockReadFile.mockResolvedValue(poorQualityContent);
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            const qualityIssues = result.insights.potentialIssues.filter((issue) => issue.startsWith('Quality:'));
            expect(qualityIssues.length).toBeGreaterThan(0);
            expect(qualityIssues.some((issue) => issue.includes('too long'))).toBe(true);
        });
        it('should update complexity metrics', async () => {
            const complexContent = `
        function veryComplexFunction() {
          if (condition1) {
            if (condition2) {
              while (loop1) {
                for (let i = 0; i < 10; i++) {
                  if (condition3) {
                    switch (value) {
                      case 1:
                        if (subCondition1) {
                          while (loop2) {
                            if (condition4 && condition5 || condition6) {
                              return result;
                            }
                          }
                        }
                        break;
                      case 2:
                        return other;
                    }
                  }
                }
              }
            }
          }
        }
      `;
            mockReadFile.mockResolvedValue(complexContent);
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            // The complexity should be updated by the advanced analyzer
            expect(result.codeAnalysis.complexity.cyclomaticComplexity).toBeGreaterThan(1);
            expect(result.codeAnalysis.complexity.codeQuality).toBeDefined();
            expect(['excellent', 'good', 'fair', 'poor']).toContain(result.codeAnalysis.complexity.codeQuality);
        });
    });
    describe('Architectural Pattern Integration', () => {
        it('should detect and add architectural patterns', async () => {
            // Mock a repository with MVC structure
            const mvcDiscoveryResult = {
                ...mockDiscoverRepository.mockResolvedValue(),
                structure: {
                    directories: [
                        { path: 'models', files: 5, subdirectories: 0 },
                        { path: 'views', files: 10, subdirectories: 0 },
                        { path: 'controllers', files: 8, subdirectories: 0 },
                    ],
                    keyFiles: [
                        {
                            path: 'models/User.js',
                            language: 'JavaScript',
                            size: 2048,
                            lineCount: 80,
                            importance: 0.8,
                            functions: [],
                            classes: [],
                        },
                    ],
                    tree: 'mvc-tree',
                },
            };
            mockDiscoverRepository.mockResolvedValue(mvcDiscoveryResult);
            mockReadFile.mockResolvedValue('class User { constructor() {} }');
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            expect(result.codeAnalysis.patterns.length).toBeGreaterThan(0);
            const patternNames = result.codeAnalysis.patterns.map((p) => p.name);
            expect(patternNames).toContain('Model-View-Controller (MVC)');
        });
        it('should add architectural recommendations', async () => {
            // Mock a large repository without clear architecture
            const largeDiscoveryResult = {
                ...mockDiscoverRepository.mockResolvedValue(),
                fileCount: 150,
                structure: {
                    directories: [{ path: 'src', files: 150, subdirectories: 0 }],
                    keyFiles: Array(10)
                        .fill(null)
                        .map((_, i) => ({
                        path: `src/file${i}.js`,
                        language: 'JavaScript',
                        size: 1024,
                        lineCount: 50,
                        importance: 0.5,
                        functions: [],
                        classes: [],
                    })),
                    tree: 'flat-structure',
                },
            };
            mockDiscoverRepository.mockResolvedValue(largeDiscoveryResult);
            mockReadFile.mockResolvedValue('function simpleFunction() { return true; }');
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            const recommendations = result.insights.recommendations;
            expect(recommendations.some((rec) => rec.includes('layered architecture') || rec.includes('component'))).toBe(true);
        });
    });
    describe('Performance and Error Handling', () => {
        it('should handle file read errors gracefully', async () => {
            mockReadFile.mockRejectedValue(new Error('Permission denied'));
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            // Should complete successfully despite file read errors
            expect(result).toBeDefined();
            expect(result.metadata.analysisMode).toBe('comprehensive');
        });
        it('should handle malformed JSON in package.json', async () => {
            mockReadFile.mockImplementation((filePath) => {
                if (filePath.includes('package.json')) {
                    return Promise.resolve('{ invalid json }');
                }
                return Promise.resolve('const code = "test";');
            });
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            // Should complete successfully despite malformed package.json
            expect(result).toBeDefined();
            expect(result.metadata.analysisMode).toBe('comprehensive');
        });
        it('should maintain performance with large repositories', async () => {
            // Mock a large repository
            const largeKeyFiles = Array(50)
                .fill(null)
                .map((_, i) => ({
                path: `src/file${i}.js`,
                language: 'JavaScript',
                size: 2048,
                lineCount: 100,
                importance: 0.5,
                functions: [],
                classes: [],
            }));
            const largeDiscoveryResult = {
                ...mockDiscoverRepository.mockResolvedValue(),
                fileCount: 500,
                structure: {
                    ...mockDiscoverRepository.mockResolvedValue().structure,
                    keyFiles: largeKeyFiles,
                },
            };
            mockDiscoverRepository.mockResolvedValue(largeDiscoveryResult);
            mockReadFile.mockResolvedValue('function test() { return true; }');
            const startTime = Date.now();
            const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
            const endTime = Date.now();
            // Should complete in reasonable time (less than 10 seconds for this test)
            expect(endTime - startTime).toBeLessThan(10000);
            expect(result).toBeDefined();
            expect(result.metadata.processingTime).toBeGreaterThan(0);
        });
    });
    describe('Batch Analysis with Advanced Features', () => {
        it('should perform advanced analysis on multiple repositories', async () => {
            const repoPaths = ['/test/repo1', '/test/repo2'];
            mockReadFile.mockResolvedValue(`
        const password = "hardcoded123";
        function complexFunction() {
          if (a && b || c) {
            return eval(userInput);
          }
        }
      `);
            const result = await engine.analyzeMultipleRepositories(repoPaths, mockAnalysisOptions);
            expect(result.repositories.length).toBe(2);
            // Each repository should have advanced analysis results
            for (const repo of result.repositories) {
                expect(repo.metadata.analysisMode).toBe('comprehensive');
                expect(repo.insights.recommendations.length).toBeGreaterThan(0);
                expect(repo.insights.potentialIssues.length).toBeGreaterThan(0);
            }
        });
    });
});
//# sourceMappingURL=analysisEngine.advanced.test.js.map