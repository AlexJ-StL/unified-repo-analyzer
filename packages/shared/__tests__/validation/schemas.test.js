"use strict";
/**
 * Tests for validation schemas
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const schemas = __importStar(require("../../src/validation/schemas"));
(0, bun_test_1.describe)('Validation Schemas', () => {
    (0, bun_test_1.describe)('FileInfo Schema', () => {
        (0, bun_test_1.test)('should validate a valid FileInfo object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.test)('should reject an invalid FileInfo object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
    (0, bun_test_1.describe)('AnalysisOptions Schema', () => {
        (0, bun_test_1.test)('should validate a valid AnalysisOptions object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.test)('should reject an invalid AnalysisOptions object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
    (0, bun_test_1.describe)('RepositoryAnalysis Schema', () => {
        (0, bun_test_1.test)('should validate a valid RepositoryAnalysis object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.test)('should reject an invalid RepositoryAnalysis object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
    (0, bun_test_1.describe)('SearchQuery Schema', () => {
        (0, bun_test_1.test)('should validate a valid SearchQuery object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.test)('should validate a partial SearchQuery object', () => {
            const partialQuery = {
                languages: ['TypeScript'],
            };
            const result = schemas.searchQuerySchema.safeParse(partialQuery);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
    });
    (0, bun_test_1.describe)('RepositoryIndex Schema', () => {
        (0, bun_test_1.test)('should validate a valid RepositoryIndex object', () => {
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
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=schemas.test.js.map