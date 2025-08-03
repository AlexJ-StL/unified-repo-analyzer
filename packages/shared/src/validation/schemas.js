"use strict";
/**
 * Zod validation schemas for data models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationBackupSchema = exports.configurationValidationResultSchema = exports.configurationWarningSchema = exports.configurationErrorSchema = exports.configurationProfileSchema = exports.projectConfigurationSchema = exports.workspaceConfigurationSchema = exports.analysisModePresetSchema = exports.userPreferencesSchema = exports.uiPreferencesSchema = exports.exportPreferencesSchema = exports.llmProviderPreferencesSchema = exports.providerConfigurationSchema = exports.analysisPreferencesSchema = exports.generalPreferencesSchema = exports.projectInfoSchema = exports.fileAnalysisSchema = exports.llmResponseSchema = exports.providerConfigSchema = exports.searchResultSchema = exports.searchResultMatchSchema = exports.searchQuerySchema = exports.dateRangeSchema = exports.repositoryIndexSchema = exports.indexedRepositorySchema = exports.tagSchema = exports.repositoryRelationshipSchema = exports.repositoryAnalysisSchema = exports.architecturalPatternSchema = exports.complexityMetricsSchema = exports.tokenUsageSchema = exports.analysisOptionsSchema = exports.frameworkSchema = exports.dependencySchema = exports.directoryInfoSchema = exports.fileInfoSchema = exports.classInfoSchema = exports.functionInfoSchema = void 0;
const zod_1 = require("zod");
// Basic schemas
exports.functionInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    lineNumber: zod_1.z.number().int().nonnegative(),
    parameters: zod_1.z.array(zod_1.z.string()),
    description: zod_1.z.string().optional(),
});
exports.classInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    lineNumber: zod_1.z.number().int().nonnegative(),
    methods: zod_1.z.array(zod_1.z.string()),
    description: zod_1.z.string().optional(),
});
exports.fileInfoSchema = zod_1.z.object({
    path: zod_1.z.string(),
    language: zod_1.z.string(),
    size: zod_1.z.number().nonnegative(),
    lineCount: zod_1.z.number().int().nonnegative(),
    tokenCount: zod_1.z.number().int().nonnegative().optional(),
    importance: zod_1.z.number().min(0).max(1),
    functions: zod_1.z.array(exports.functionInfoSchema),
    classes: zod_1.z.array(exports.classInfoSchema),
    description: zod_1.z.string().optional(),
    useCase: zod_1.z.string().optional(),
});
exports.directoryInfoSchema = zod_1.z.object({
    path: zod_1.z.string(),
    files: zod_1.z.number().int().nonnegative(),
    subdirectories: zod_1.z.number().int().nonnegative(),
    role: zod_1.z.string().optional(),
});
exports.dependencySchema = zod_1.z.object({
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    type: zod_1.z.enum(['production', 'development']),
    description: zod_1.z.string().optional(),
});
exports.frameworkSchema = zod_1.z.object({
    name: zod_1.z.string(),
    version: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1),
});
// Analysis related schemas
exports.analysisOptionsSchema = zod_1.z.object({
    mode: zod_1.z.enum(['quick', 'standard', 'comprehensive']),
    maxFiles: zod_1.z.number().int().positive(),
    maxLinesPerFile: zod_1.z.number().int().positive(),
    includeLLMAnalysis: zod_1.z.boolean(),
    llmProvider: zod_1.z.string(),
    outputFormats: zod_1.z.array(zod_1.z.enum(['json', 'markdown', 'html'])),
    includeTree: zod_1.z.boolean(),
});
exports.tokenUsageSchema = zod_1.z.object({
    prompt: zod_1.z.number().int().nonnegative(),
    completion: zod_1.z.number().int().nonnegative(),
    total: zod_1.z.number().int().nonnegative(),
});
exports.complexityMetricsSchema = zod_1.z.object({
    cyclomaticComplexity: zod_1.z.number().nonnegative(),
    maintainabilityIndex: zod_1.z.number(),
    technicalDebt: zod_1.z.string(),
    codeQuality: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']),
});
exports.architecturalPatternSchema = zod_1.z.object({
    name: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    description: zod_1.z.string(),
});
exports.repositoryAnalysisSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    path: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    language: zod_1.z.string(),
    languages: zod_1.z.array(zod_1.z.string()),
    frameworks: zod_1.z.array(zod_1.z.string()),
    fileCount: zod_1.z.number().int().nonnegative(),
    directoryCount: zod_1.z.number().int().nonnegative(),
    totalSize: zod_1.z.number().nonnegative(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    structure: zod_1.z.object({
        directories: zod_1.z.array(exports.directoryInfoSchema),
        keyFiles: zod_1.z.array(exports.fileInfoSchema),
        tree: zod_1.z.string(),
    }),
    codeAnalysis: zod_1.z.object({
        functionCount: zod_1.z.number().int().nonnegative(),
        classCount: zod_1.z.number().int().nonnegative(),
        importCount: zod_1.z.number().int().nonnegative(),
        complexity: exports.complexityMetricsSchema,
        patterns: zod_1.z.array(exports.architecturalPatternSchema),
    }),
    dependencies: zod_1.z.object({
        production: zod_1.z.array(zod_1.z.any()),
        development: zod_1.z.array(zod_1.z.any()),
        frameworks: zod_1.z.array(zod_1.z.any()),
    }),
    insights: zod_1.z.object({
        executiveSummary: zod_1.z.string(),
        technicalBreakdown: zod_1.z.string(),
        recommendations: zod_1.z.array(zod_1.z.string()),
        potentialIssues: zod_1.z.array(zod_1.z.string()),
    }),
    metadata: zod_1.z.object({
        analysisMode: zod_1.z.enum(['quick', 'standard', 'comprehensive']),
        llmProvider: zod_1.z.string().optional(),
        processingTime: zod_1.z.number().nonnegative(),
        tokenUsage: exports.tokenUsageSchema.optional(),
    }),
});
// Repository index related schemas
exports.repositoryRelationshipSchema = zod_1.z.object({
    sourceId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['similar', 'complementary', 'dependency', 'fork']),
    strength: zod_1.z.number().min(0).max(1),
    reason: zod_1.z.string(),
});
exports.tagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    category: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
});
exports.indexedRepositorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    languages: zod_1.z.array(zod_1.z.string()),
    frameworks: zod_1.z.array(zod_1.z.string()),
    tags: zod_1.z.array(zod_1.z.string()),
    summary: zod_1.z.string(),
    lastAnalyzed: zod_1.z.date(),
    size: zod_1.z.number().nonnegative(),
    complexity: zod_1.z.number(),
});
exports.repositoryIndexSchema = zod_1.z.object({
    repositories: zod_1.z.array(exports.indexedRepositorySchema),
    relationships: zod_1.z.array(exports.repositoryRelationshipSchema),
    tags: zod_1.z.array(exports.tagSchema),
    lastUpdated: zod_1.z.date(),
});
// Search related schemas
exports.dateRangeSchema = zod_1.z.object({
    start: zod_1.z.date(),
    end: zod_1.z.date(),
});
exports.searchQuerySchema = zod_1.z.object({
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    frameworks: zod_1.z.array(zod_1.z.string()).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    fileTypes: zod_1.z.array(zod_1.z.string()).optional(),
    dateRange: exports.dateRangeSchema.optional(),
});
exports.searchResultMatchSchema = zod_1.z.object({
    field: zod_1.z.string(),
    value: zod_1.z.string(),
    score: zod_1.z.number(),
});
exports.searchResultSchema = zod_1.z.object({
    repository: exports.indexedRepositorySchema,
    score: zod_1.z.number(),
    matches: zod_1.z.array(exports.searchResultMatchSchema),
});
// LLM Provider related schemas
exports.providerConfigSchema = zod_1.z.object({
    apiKey: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    maxTokens: zod_1.z.number().int().positive().optional(),
    temperature: zod_1.z.number().min(0).max(1).optional(),
});
exports.llmResponseSchema = zod_1.z.object({
    content: zod_1.z.string(),
    tokenUsage: exports.tokenUsageSchema,
});
exports.fileAnalysisSchema = zod_1.z.object({
    path: zod_1.z.string(),
    lineCount: zod_1.z.number().int().nonnegative(),
    functionCount: zod_1.z.number().int().nonnegative(),
    classCount: zod_1.z.number().int().nonnegative(),
    importCount: zod_1.z.number().int().nonnegative(),
    comments: zod_1.z.array(zod_1.z.string()),
    functions: zod_1.z.array(zod_1.z.string()),
    classes: zod_1.z.array(zod_1.z.string()),
    sample: zod_1.z.string().optional(),
});
exports.projectInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    language: zod_1.z.string().nullable(),
    fileCount: zod_1.z.number().int().nonnegative(),
    directoryCount: zod_1.z.number().int().nonnegative(),
    directories: zod_1.z.array(zod_1.z.string()),
    keyFiles: zod_1.z.array(zod_1.z.string()),
    dependencies: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).nullable().optional(),
    devDependencies: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).nullable().optional(),
    readme: zod_1.z.string().nullable().optional(),
    fileAnalysis: zod_1.z.array(exports.fileAnalysisSchema),
});
// Configuration related schemas
exports.generalPreferencesSchema = zod_1.z.object({
    defaultWorkspace: zod_1.z.string().optional(),
    autoSave: zod_1.z.boolean(),
    autoIndex: zod_1.z.boolean(),
    enableNotifications: zod_1.z.boolean(),
    theme: zod_1.z.enum(['light', 'dark', 'system']),
    language: zod_1.z.string(),
});
exports.analysisPreferencesSchema = zod_1.z.object({
    defaultMode: zod_1.z.enum(['quick', 'standard', 'comprehensive']),
    maxFiles: zod_1.z.number().int().positive(),
    maxLinesPerFile: zod_1.z.number().int().positive(),
    includeLLMAnalysis: zod_1.z.boolean(),
    includeTree: zod_1.z.boolean(),
    ignorePatterns: zod_1.z.array(zod_1.z.string()),
    maxFileSize: zod_1.z.number().int().positive(),
    cacheDirectory: zod_1.z.string(),
    cacheTTL: zod_1.z.number().int().positive(),
});
exports.providerConfigurationSchema = zod_1.z.object({
    name: zod_1.z.string(),
    apiKey: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    maxTokens: zod_1.z.number().int().positive(),
    temperature: zod_1.z.number().min(0).max(1),
    enabled: zod_1.z.boolean(),
    customEndpoint: zod_1.z.string().url().optional(),
});
exports.llmProviderPreferencesSchema = zod_1.z.object({
    defaultProvider: zod_1.z.string(),
    providers: zod_1.z.record(zod_1.z.string(), exports.providerConfigurationSchema),
});
exports.exportPreferencesSchema = zod_1.z.object({
    defaultFormat: zod_1.z.enum(['json', 'markdown', 'html']),
    outputDirectory: zod_1.z.string(),
    includeMetadata: zod_1.z.boolean(),
    compressLargeFiles: zod_1.z.boolean(),
    customTemplates: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
});
exports.uiPreferencesSchema = zod_1.z.object({
    compactMode: zod_1.z.boolean(),
    showAdvancedOptions: zod_1.z.boolean(),
    defaultView: zod_1.z.enum(['grid', 'list']),
    itemsPerPage: zod_1.z.number().int().positive(),
    enableAnimations: zod_1.z.boolean(),
});
exports.userPreferencesSchema = zod_1.z.object({
    general: exports.generalPreferencesSchema,
    analysis: exports.analysisPreferencesSchema,
    llmProvider: exports.llmProviderPreferencesSchema,
    export: exports.exportPreferencesSchema,
    ui: exports.uiPreferencesSchema,
});
exports.analysisModePresetSchema = zod_1.z.object({
    name: zod_1.z.enum(['quick', 'standard', 'comprehensive']),
    displayName: zod_1.z.string(),
    description: zod_1.z.string(),
    maxFiles: zod_1.z.number().int().positive(),
    maxLinesPerFile: zod_1.z.number().int().positive(),
    includeLLMAnalysis: zod_1.z.boolean(),
    includeTree: zod_1.z.boolean(),
    estimatedTime: zod_1.z.string(),
    recommended: zod_1.z.boolean(),
});
exports.workspaceConfigurationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    preferences: exports.userPreferencesSchema.partial(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.projectConfigurationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    workspaceId: zod_1.z.string().uuid().optional(),
    preferences: exports.userPreferencesSchema.partial(),
    customIgnorePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    customAnalysisOptions: exports.analysisPreferencesSchema.partial().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.configurationProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    preferences: exports.userPreferencesSchema,
    isDefault: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.configurationErrorSchema = zod_1.z.object({
    field: zod_1.z.string(),
    message: zod_1.z.string(),
    code: zod_1.z.string(),
});
exports.configurationWarningSchema = zod_1.z.object({
    field: zod_1.z.string(),
    message: zod_1.z.string(),
    suggestion: zod_1.z.string().optional(),
});
exports.configurationValidationResultSchema = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    errors: zod_1.z.array(exports.configurationErrorSchema),
    warnings: zod_1.z.array(exports.configurationWarningSchema),
});
exports.configurationBackupSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    timestamp: zod_1.z.date(),
    version: zod_1.z.string(),
    preferences: exports.userPreferencesSchema,
    reason: zod_1.z.enum(['manual', 'auto', 'migration']),
});
//# sourceMappingURL=schemas.js.map