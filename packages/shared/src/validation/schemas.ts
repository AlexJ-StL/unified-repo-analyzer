/**
 * Zod validation schemas for data models
 */

import { z } from 'zod';

// Basic schemas
export const functionInfoSchema = z.object({
  name: z.string(),
  lineNumber: z.number().int().nonnegative(),
  parameters: z.array(z.string()),
  description: z.string().optional(),
});

export const classInfoSchema = z.object({
  name: z.string(),
  lineNumber: z.number().int().nonnegative(),
  methods: z.array(z.string()),
  description: z.string().optional(),
});

export const fileInfoSchema = z.object({
  path: z.string(),
  language: z.string(),
  size: z.number().nonnegative(),
  lineCount: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative().optional(),
  importance: z.number().min(0).max(1),
  functions: z.array(functionInfoSchema),
  classes: z.array(classInfoSchema),
  description: z.string().optional(),
  useCase: z.string().optional(),
});

export const directoryInfoSchema = z.object({
  path: z.string(),
  files: z.number().int().nonnegative(),
  subdirectories: z.number().int().nonnegative(),
  role: z.string().optional(),
});

export const dependencySchema = z.object({
  name: z.string(),
  version: z.string(),
  type: z.enum(['production', 'development']),
  description: z.string().optional(),
});

export const frameworkSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

// Analysis related schemas
export const analysisOptionsSchema = z.object({
  mode: z.enum(['quick', 'standard', 'comprehensive']),
  maxFiles: z.number().int().positive(),
  maxLinesPerFile: z.number().int().positive(),
  includeLLMAnalysis: z.boolean(),
  llmProvider: z.string(),
  outputFormats: z.array(z.enum(['json', 'markdown', 'html'])),
  includeTree: z.boolean(),
});

export const tokenUsageSchema = z.object({
  prompt: z.number().int().nonnegative(),
  completion: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const complexityMetricsSchema = z.object({
  cyclomaticComplexity: z.number().nonnegative(),
  maintainabilityIndex: z.number(),
  technicalDebt: z.string(),
  codeQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
});

export const architecturalPatternSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  description: z.string(),
});

export const repositoryAnalysisSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  name: z.string(),
  description: z.string().optional(),
  language: z.string(),
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  fileCount: z.number().int().nonnegative(),
  directoryCount: z.number().int().nonnegative(),
  totalSize: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),

  structure: z.object({
    directories: z.array(directoryInfoSchema),
    keyFiles: z.array(fileInfoSchema),
    tree: z.string(),
  }),

  codeAnalysis: z.object({
    functionCount: z.number().int().nonnegative(),
    classCount: z.number().int().nonnegative(),
    importCount: z.number().int().nonnegative(),
    complexity: complexityMetricsSchema,
    patterns: z.array(architecturalPatternSchema),
  }),

  dependencies: z.object({
    production: z.array(dependencySchema),
    development: z.array(dependencySchema),
    frameworks: z.array(frameworkSchema),
  }),

  insights: z.object({
    executiveSummary: z.string(),
    technicalBreakdown: z.string(),
    recommendations: z.array(z.string()),
    potentialIssues: z.array(z.string()),
  }),

  metadata: z.object({
    analysisMode: z.enum(['quick', 'standard', 'comprehensive']),
    llmProvider: z.string().optional(),
    processingTime: z.number().nonnegative(),
    tokenUsage: tokenUsageSchema.optional(),
  }),
});

// Repository index related schemas
export const repositoryRelationshipSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.enum(['similar', 'complementary', 'dependency', 'fork']),
  strength: z.number().min(0).max(1),
  reason: z.string(),
});

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string().optional(),
  color: z.string().optional(),
});

export const indexedRepositorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  tags: z.array(z.string()),
  summary: z.string(),
  lastAnalyzed: z.date(),
  size: z.number().nonnegative(),
  complexity: z.number(),
});

export const repositoryIndexSchema = z.object({
  repositories: z.array(indexedRepositorySchema),
  relationships: z.array(repositoryRelationshipSchema),
  tags: z.array(tagSchema),
  lastUpdated: z.date(),
});

// Search related schemas
export const dateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export const searchQuerySchema = z.object({
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  fileTypes: z.array(z.string()).optional(),
  dateRange: dateRangeSchema.optional(),
});

export const searchResultMatchSchema = z.object({
  field: z.string(),
  value: z.string(),
  score: z.number(),
});

export const searchResultSchema = z.object({
  repository: indexedRepositorySchema,
  score: z.number(),
  matches: z.array(searchResultMatchSchema),
});

// LLM Provider related schemas
export const providerConfigSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(1).optional(),
});

export const llmResponseSchema = z.object({
  content: z.string(),
  tokenUsage: tokenUsageSchema,
});

export const fileAnalysisSchema = z.object({
  path: z.string(),
  lineCount: z.number().int().nonnegative(),
  functionCount: z.number().int().nonnegative(),
  classCount: z.number().int().nonnegative(),
  importCount: z.number().int().nonnegative(),
  comments: z.array(z.string()),
  functions: z.array(z.string()),
  classes: z.array(z.string()),
  sample: z.string().optional(),
});

export const projectInfoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  language: z.string().nullable(),
  fileCount: z.number().int().nonnegative(),
  directoryCount: z.number().int().nonnegative(),
  directories: z.array(z.string()),
  keyFiles: z.array(z.string()),
  dependencies: z.record(z.string(), z.string()).nullable().optional(),
  devDependencies: z.record(z.string(), z.string()).nullable().optional(),
  readme: z.string().nullable().optional(),
  fileAnalysis: z.array(fileAnalysisSchema),
});

// Configuration related schemas
export const generalPreferencesSchema = z.object({
  defaultWorkspace: z.string().optional(),
  autoSave: z.boolean(),
  autoIndex: z.boolean(),
  enableNotifications: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
});

export const analysisPreferencesSchema = z.object({
  defaultMode: z.enum(['quick', 'standard', 'comprehensive']),
  maxFiles: z.number().int().positive(),
  maxLinesPerFile: z.number().int().positive(),
  includeLLMAnalysis: z.boolean(),
  includeTree: z.boolean(),
  ignorePatterns: z.array(z.string()),
  maxFileSize: z.number().int().positive(),
  cacheDirectory: z.string(),
  cacheTTL: z.number().int().positive(),
});

export const providerConfigurationSchema = z.object({
  name: z.string(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  maxTokens: z.number().int().positive(),
  temperature: z.number().min(0).max(1),
  enabled: z.boolean(),
  customEndpoint: z.string().url().optional(),
});

export const llmProviderPreferencesSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), providerConfigurationSchema),
});

export const exportPreferencesSchema = z.object({
  defaultFormat: z.enum(['json', 'markdown', 'html']),
  outputDirectory: z.string(),
  includeMetadata: z.boolean(),
  compressLargeFiles: z.boolean(),
  customTemplates: z.record(z.string(), z.string()),
});

export const uiPreferencesSchema = z.object({
  compactMode: z.boolean(),
  showAdvancedOptions: z.boolean(),
  defaultView: z.enum(['grid', 'list']),
  itemsPerPage: z.number().int().positive(),
  enableAnimations: z.boolean(),
});

export const userPreferencesSchema = z.object({
  general: generalPreferencesSchema,
  analysis: analysisPreferencesSchema,
  llmProvider: llmProviderPreferencesSchema,
  export: exportPreferencesSchema,
  ui: uiPreferencesSchema,
});

export const analysisModePresetSchema = z.object({
  name: z.enum(['quick', 'standard', 'comprehensive']),
  displayName: z.string(),
  description: z.string(),
  maxFiles: z.number().int().positive(),
  maxLinesPerFile: z.number().int().positive(),
  includeLLMAnalysis: z.boolean(),
  includeTree: z.boolean(),
  estimatedTime: z.string(),
  recommended: z.boolean(),
});

export const workspaceConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  preferences: userPreferencesSchema.partial(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const projectConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  workspaceId: z.string().uuid().optional(),
  preferences: userPreferencesSchema.partial(),
  customIgnorePatterns: z.array(z.string()).optional(),
  customAnalysisOptions: analysisPreferencesSchema.partial().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const configurationProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  preferences: userPreferencesSchema,
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const configurationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
});

export const configurationWarningSchema = z.object({
  field: z.string(),
  message: z.string(),
  suggestion: z.string().optional(),
});

export const configurationValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(configurationErrorSchema),
  warnings: z.array(configurationWarningSchema),
});

export const configurationBackupSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  version: z.string(),
  preferences: userPreferencesSchema,
  reason: z.enum(['manual', 'auto', 'migration']),
});
