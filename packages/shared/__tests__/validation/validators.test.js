"use strict";
/**
 * Tests for validation utility functions
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
const zod_1 = require("zod");
const validators = __importStar(require("../../src/validation/validators"));
(0, bun_test_1.describe)('Validation Utilities', () => {
    (0, bun_test_1.describe)('validate function', () => {
        (0, bun_test_1.test)('should validate data against a schema', () => {
            const schema = zod_1.z.object({
                name: zod_1.z.string(),
                age: zod_1.z.number().int().positive(),
            });
            const validData = { name: 'John', age: 30 };
            (0, bun_test_1.expect)(() => validators.validate(schema, validData)).not.toThrow();
            (0, bun_test_1.expect)(validators.validate(schema, validData)).toEqual(validData);
        });
        (0, bun_test_1.test)('should throw an error for invalid data', () => {
            const schema = zod_1.z.object({
                name: zod_1.z.string(),
                age: zod_1.z.number().int().positive(),
            });
            const invalidData = { name: 'John', age: -5 };
            (0, bun_test_1.expect)(() => validators.validate(schema, invalidData)).toThrow();
        });
    });
    (0, bun_test_1.describe)('validateSafe function', () => {
        (0, bun_test_1.test)('should return success and data for valid input', () => {
            const schema = zod_1.z.object({
                name: zod_1.z.string(),
                age: zod_1.z.number().int().positive(),
            });
            const validData = { name: 'John', age: 30 };
            const result = validators.validateSafe(schema, validData);
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(result.data).toEqual(validData);
            (0, bun_test_1.expect)(result.errors).toBeUndefined();
        });
        (0, bun_test_1.test)('should return failure and errors for invalid input', () => {
            const schema = zod_1.z.object({
                name: zod_1.z.string(),
                age: zod_1.z.number().int().positive(),
            });
            const invalidData = { name: 'John', age: -5 };
            const result = validators.validateSafe(schema, invalidData);
            (0, bun_test_1.expect)(result.success).toBe(false);
            (0, bun_test_1.expect)(result.data).toBeUndefined();
            (0, bun_test_1.expect)(result.errors).toBeInstanceOf(zod_1.z.ZodError);
        });
    });
    (0, bun_test_1.describe)('Specific validators', () => {
        (0, bun_test_1.test)('should validate repository analysis data', () => {
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
            (0, bun_test_1.expect)(() => validators.validateRepositoryAnalysis(validAnalysis)).not.toThrow();
        });
        (0, bun_test_1.test)('should validate file info data', () => {
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
            (0, bun_test_1.expect)(() => validators.validateFileInfo(validFileInfo)).not.toThrow();
        });
        (0, bun_test_1.test)('should validate analysis options data', () => {
            const validOptions = {
                mode: 'standard',
                maxFiles: 100,
                maxLinesPerFile: 1000,
                includeLLMAnalysis: true,
                llmProvider: 'claude',
                outputFormats: ['json', 'markdown'],
                includeTree: true,
            };
            (0, bun_test_1.expect)(() => validators.validateAnalysisOptions(validOptions)).not.toThrow();
        });
    });
});
//# sourceMappingURL=validators.test.js.map