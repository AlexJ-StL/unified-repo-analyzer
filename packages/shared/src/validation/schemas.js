/**
 * Zod validation schemas for data models
 *
 * This file contains comprehensive validation schemas for all data models
 * used across the unified repository analyzer. Each schema is designed
 * with strict type safety, clear documentation, and consistent naming.
 *
 * @module validation/schemas
 */
import { z } from 'zod';
// =============================================================================
// COMMON PATTERNS & SHARED SCHEMAS
// =============================================================================
/**
 * Common string patterns used across schemas
 */
const commonPatterns = {
  // UUID v4 pattern
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  // Email pattern (RFC 5322 compliant)
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  // URL pattern
  url: /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/i,
  // File path patterns
  absolutePath: /^(?:[a-zA-Z]:\\|\/)(?:[^<>:"|?*\n\r]+(?:\\|\/))*[^<>:"|?*\n\r]*$/,
  relativePath: /^(?:\.{1,2}\/|\.{1,2}\\|[^/\\][^<>:"|?*\n\r]*)$/,
  // Semantic versioning pattern
  semver:
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  // Date-time pattern (ISO 8601)
  isoDateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/,
};
/**
 * Common numeric constraints
 */
const numericConstraints = {
  // File size limits (in bytes)
  maxFileSize: 100 * 1024 * 1024, // 100MB
  minFileSize: 0,
  // Line count limits
  maxLinesPerFile: 100000,
  minLinesPerFile: 0,
  // Token limits
  maxTokens: 1000000,
  minTokens: 0,
  // Temperature range for LLM
  minTemperature: 0,
  maxTemperature: 1,
  // Pagination limits
  maxItemsPerPage: 1000,
  minItemsPerPage: 1,
};
/**
 * Common string constraints
 */
const stringConstraints = {
  maxNameLength: 255,
  minNameLength: 1,
  maxDescriptionLength: 2000,
  minDescriptionLength: 0,
  maxPathLength: 4096,
  minPathLength: 1,
};
// =============================================================================
// BASIC ENTITY SCHEMAS
// =============================================================================
/**
 * Schema for function information
 * Represents metadata about a function in source code
 */
export const functionInfoSchema = z.object({
  name: z
    .string()
    .min(stringConstraints.minNameLength, 'Function name cannot be empty')
    .max(stringConstraints.maxNameLength, 'Function name too long')
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Invalid function name format'),
  lineNumber: z
    .number()
    .int('Line number must be an integer')
    .nonnegative('Line number cannot be negative')
    .finite('Line number must be finite'),
  parameters: z.array(z.string()).max(100, 'Too many parameters (max 100)').default([]),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  returnType: z
    .string()
    .max(stringConstraints.maxNameLength, 'Return type name too long')
    .optional(),
  isAsync: z.boolean().optional().default(false),
  isExported: z.boolean().optional().default(false),
});
/**
 * Schema for class information
 * Represents metadata about a class in source code
 */
export const classInfoSchema = z.object({
  name: z
    .string()
    .min(stringConstraints.minNameLength, 'Class name cannot be empty')
    .max(stringConstraints.maxNameLength, 'Class name too long')
    .regex(/^[A-Z][a-zA-Z0-9_$]*$/, 'Invalid class name format'),
  lineNumber: z
    .number()
    .int('Line number must be an integer')
    .nonnegative('Line number cannot be negative')
    .finite('Line number must be finite'),
  methods: z.array(z.string()).max(1000, 'Too many methods (max 1000)').default([]),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  extends: z.string().max(stringConstraints.maxNameLength, 'Parent class name too long').optional(),
  implements: z.array(z.string()).max(50, 'Too many interfaces (max 50)').default([]),
  isExported: z.boolean().optional().default(false),
});
/**
 * Schema for file information
 * Represents comprehensive metadata about a source file
 */
export const fileInfoSchema = z.object({
  path: z
    .string()
    .min(stringConstraints.minPathLength, 'File path cannot be empty')
    .max(stringConstraints.maxPathLength, 'File path too long')
    .refine(
      (path) => commonPatterns.absolutePath.test(path) || commonPatterns.relativePath.test(path),
      'Invalid file path format'
    ),
  language: z.string().min(1, 'Language cannot be empty').max(50, 'Language name too long'),
  size: z
    .number()
    .int('File size must be an integer')
    .nonnegative('File size cannot be negative')
    .max(
      numericConstraints.maxFileSize,
      `File size exceeds ${numericConstraints.maxFileSize} bytes limit`
    ),
  lineCount: z
    .number()
    .int('Line count must be an integer')
    .nonnegative('Line count cannot be negative')
    .max(
      numericConstraints.maxLinesPerFile,
      `Line count exceeds ${numericConstraints.maxLinesPerFile} limit`
    ),
  tokenCount: z
    .number()
    .int('Token count must be an integer')
    .nonnegative('Token count cannot be negative')
    .max(numericConstraints.maxTokens, `Token count exceeds ${numericConstraints.maxTokens} limit`)
    .optional(),
  importance: z
    .number()
    .min(0, 'Importance cannot be negative')
    .max(1, 'Importance must be between 0 and 1')
    .default(0.5),
  functions: z.array(functionInfoSchema).max(1000, 'Too many functions (max 1000)').default([]),
  classes: z.array(classInfoSchema).max(500, 'Too many classes (max 500)').default([]),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  useCase: z.string().max(500, 'Use case description too long').optional(),
  lastModified: z.date().optional(),
  encoding: z.enum(['utf8', 'utf16', 'ascii', 'binary']).default('utf8'),
});
/**
 * Schema for directory information
 * Represents metadata about a directory in the project structure
 */
export const directoryInfoSchema = z.object({
  path: z
    .string()
    .min(stringConstraints.minPathLength, 'Directory path cannot be empty')
    .max(stringConstraints.maxPathLength, 'Directory path too long')
    .refine(
      (path) => commonPatterns.absolutePath.test(path) || commonPatterns.relativePath.test(path),
      'Invalid directory path format'
    ),
  files: z
    .number()
    .int('File count must be an integer')
    .nonnegative('File count cannot be negative')
    .max(100000, 'File count exceeds reasonable limit'),
  subdirectories: z
    .number()
    .int('Subdirectory count must be an integer')
    .nonnegative('Subdirectory count cannot be negative')
    .max(10000, 'Subdirectory count exceeds reasonable limit'),
  role: z.string().max(100, 'Role description too long').optional(),
  totalSize: z
    .number()
    .int('Total size must be an integer')
    .nonnegative('Total size cannot be negative')
    .optional(),
});
/**
 * Schema for dependency information
 * Represents a project dependency with metadata
 */
export const dependencySchema = z.object({
  name: z
    .string()
    .min(1, 'Dependency name cannot be empty')
    .max(100, 'Dependency name too long')
    .regex(/^[a-zA-Z0-9@\-_/]+$/, 'Invalid dependency name format'),
  version: z
    .string()
    .min(1, 'Version cannot be empty')
    .max(50, 'Version string too long')
    .regex(commonPatterns.semver, 'Invalid semantic version format')
    .or(z.string().regex(/^[\w\-.]+$/)), // Allow non-semver versions
  type: z.enum(['development', 'production', 'peer', 'optional']).default('production'),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  homepage: z
    .string()
    .url('Invalid homepage URL')
    .max(stringConstraints.maxPathLength, 'Homepage URL too long')
    .optional(),
  repository: z
    .string()
    .url('Invalid repository URL')
    .max(stringConstraints.maxPathLength, 'Repository URL too long')
    .optional(),
});
/**
 * Schema for framework detection
 * Represents a detected framework with confidence score
 */
export const frameworkSchema = z.object({
  name: z.string().min(1, 'Framework name cannot be empty').max(100, 'Framework name too long'),
  version: z
    .string()
    .max(50, 'Version string too long')
    .regex(commonPatterns.semver, 'Invalid semantic version format')
    .optional(),
  confidence: z
    .number()
    .min(0, 'Confidence cannot be negative')
    .max(1, 'Confidence must be between 0 and 1')
    .default(0.5),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  category: z
    .enum([
      'frontend',
      'backend',
      'testing',
      'build-tools',
      'database',
      'devops',
      'mobile',
      'desktop',
      'game',
      'ai-ml',
      'other',
    ])
    .optional(),
});
// =============================================================================
// ANALYSIS CONFIGURATION SCHEMAS
// =============================================================================
/**
 * Schema for analysis options
 * Configuration for repository analysis parameters
 */
export const analysisOptionsSchema = z.object({
  mode: z.enum(['quick', 'standard', 'comprehensive']).default('standard'),
  maxFiles: z
    .number()
    .int('Max files must be an integer')
    .positive('Max files must be positive')
    .max(10000, 'Max files exceeds reasonable limit')
    .default(1000),
  maxLinesPerFile: z
    .number()
    .int('Max lines per file must be an integer')
    .positive('Max lines per file must be positive')
    .max(
      numericConstraints.maxLinesPerFile,
      `Max lines exceeds ${numericConstraints.maxLinesPerFile} limit`
    )
    .default(10000),
  includeLLMAnalysis: z.boolean().default(false),
  llmProvider: z
    .string()
    .min(1, 'LLM provider cannot be empty')
    .max(50, 'LLM provider name too long')
    .default('openai'),
  outputFormats: z
    .array(z.enum(['json', 'markdown', 'html', 'csv', 'xml']))
    .min(1, 'At least one output format must be specified')
    .max(5, 'Too many output formats (max 5)')
    .default(['json']),
  includeTree: z.boolean().default(true),
  ignorePatterns: z
    .array(z.string())
    .max(100, 'Too many ignore patterns (max 100)')
    .default(['node_modules/**', '.git/**', '*.log']),
  includePatterns: z
    .array(z.string())
    .max(100, 'Too many include patterns (max 100)')
    .default(['**/*']),
  maxFileSize: z
    .number()
    .int('Max file size must be an integer')
    .positive('Max file size must be positive')
    .max(
      numericConstraints.maxFileSize,
      `Max file size exceeds ${numericConstraints.maxFileSize} bytes limit`
    )
    .default(numericConstraints.maxFileSize),
});
/**
 * Schema for token usage tracking
 * Tracks LLM API usage for cost monitoring
 */
export const tokenUsageSchema = z.object({
  prompt: z
    .number()
    .int('Prompt tokens must be an integer')
    .nonnegative('Prompt tokens cannot be negative')
    .default(0),
  completion: z
    .number()
    .int('Completion tokens must be an integer')
    .nonnegative('Completion tokens cannot be negative')
    .default(0),
  total: z
    .number()
    .int('Total tokens must be an integer')
    .nonnegative('Total tokens cannot be negative')
    .default(0),
  estimatedCost: z.number().nonnegative('Cost cannot be negative').optional(),
  model: z.string().max(100, 'Model name too long').optional(),
});
/**
 * Schema for complexity metrics
 * Represents code complexity analysis results
 */
export const complexityMetricsSchema = z.object({
  cyclomaticComplexity: z
    .number()
    .int('Cyclomatic complexity must be an integer')
    .nonnegative('Cyclomatic complexity cannot be negative')
    .default(0),
  maintainabilityIndex: z
    .number()
    .min(0, 'Maintainability index cannot be negative')
    .max(100, 'Maintainability index must be between 0 and 100')
    .default(100),
  technicalDebt: z.string().max(100, 'Technical debt description too long').default('none'),
  codeQuality: z.enum(['excellent', 'good', 'fair', 'poor']).default('good'),
  testCoverage: z
    .number()
    .min(0, 'Test coverage cannot be negative')
    .max(100, 'Test coverage must be between 0 and 100')
    .optional(),
  documentationCoverage: z
    .number()
    .min(0, 'Documentation coverage cannot be negative')
    .max(100, 'Documentation coverage must be between 0 and 100')
    .optional(),
});
/**
 * Schema for architectural pattern detection
 * Represents detected architectural patterns
 */
export const architecturalPatternSchema = z.object({
  name: z.string().min(1, 'Pattern name cannot be empty').max(100, 'Pattern name too long'),
  confidence: z
    .number()
    .min(0, 'Confidence cannot be negative')
    .max(1, 'Confidence must be between 0 and 1')
    .default(0.5),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  category: z
    .enum(['creational', 'structural', 'behavioral', 'architectural', 'microservices', 'other'])
    .optional(),
  examples: z.array(z.string()).max(50, 'Too many examples (max 50)').default([]),
});
// =============================================================================
// LLM & AI ANALYSIS SCHEMAS
// =============================================================================
/**
 * Schema for LLM request configuration
 * Configuration for LLM API requests
 */
export const llmRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(10000, 'Prompt too long (max 10000 characters)'),
  model: z
    .string()
    .min(1, 'Model name cannot be empty')
    .max(100, 'Model name too long')
    .default('gpt-4'),
  maxTokens: z
    .number()
    .int('Max tokens must be an integer')
    .positive('Max tokens must be positive')
    .max(numericConstraints.maxTokens, `Max tokens exceeds ${numericConstraints.maxTokens} limit`)
    .default(1000),
  temperature: z
    .number()
    .min(
      numericConstraints.minTemperature,
      `Temperature must be at least ${numericConstraints.minTemperature}`
    )
    .max(
      numericConstraints.maxTemperature,
      `Temperature must be at most ${numericConstraints.maxTemperature}`
    )
    .default(0.7),
  topP: z.number().min(0, 'Top-p must be at least 0').max(1, 'Top-p must be at most 1').optional(),
  frequencyPenalty: z
    .number()
    .min(-2, 'Frequency penalty must be at least -2')
    .max(2, 'Frequency penalty must be at most 2')
    .optional(),
  presencePenalty: z
    .number()
    .min(-2, 'Presence penalty must be at least -2')
    .max(2, 'Presence penalty must be at most 2')
    .optional(),
});
/**
 * Schema for LLM response
 * Represents a response from an LLM API
 */
export const llmResponseSchema = z.object({
  content: z
    .string()
    .min(1, 'Response content cannot be empty')
    .max(50000, 'Response content too long (max 50000 characters)'),
  tokenUsage: tokenUsageSchema,
  model: z.string().max(100, 'Model name too long').optional(),
  finishReason: z.enum(['stop', 'length', 'content_filter', 'tool_calls']).optional(),
  created: z.date().default(() => new Date()),
});
// =============================================================================
// FILE & PROJECT ANALYSIS SCHEMAS
// =============================================================================
/**
 * Schema for detailed file analysis
 * Comprehensive analysis of a single file
 */
export const fileAnalysisSchema = z.object({
  path: z
    .string()
    .min(stringConstraints.minPathLength, 'File path cannot be empty')
    .max(stringConstraints.maxPathLength, 'File path too long'),
  lineCount: z
    .number()
    .int('Line count must be an integer')
    .nonnegative('Line count cannot be negative')
    .max(
      numericConstraints.maxLinesPerFile,
      `Line count exceeds ${numericConstraints.maxLinesPerFile} limit`
    ),
  functionCount: z
    .number()
    .int('Function count must be an integer')
    .nonnegative('Function count cannot be negative')
    .max(1000, 'Function count exceeds reasonable limit'),
  classCount: z
    .number()
    .int('Class count must be an integer')
    .nonnegative('Class count cannot be negative')
    .max(500, 'Class count exceeds reasonable limit'),
  importCount: z
    .number()
    .int('Import count must be an integer')
    .nonnegative('Import count cannot be negative')
    .max(1000, 'Import count exceeds reasonable limit'),
  comments: z.array(z.string()).max(1000, 'Too many comments (max 1000)').default([]),
  functions: z.array(z.string()).max(1000, 'Too many functions (max 1000)').default([]),
  classes: z.array(z.string()).max(500, 'Too many classes (max 500)').default([]),
  sample: z.string().max(5000, 'Sample code too long (max 5000 characters)').optional(),
  complexity: complexityMetricsSchema.optional(),
  dependencies: z.array(dependencySchema).max(100, 'Too many dependencies (max 100)').default([]),
  frameworks: z.array(frameworkSchema).max(50, 'Too many frameworks (max 50)').default([]),
});
/**
 * Schema for comprehensive project information
 * Complete analysis results for a repository
 */
export const projectInfoSchema = z.object({
  id: z.string().uuid('Invalid project ID format').optional(),
  name: z
    .string()
    .min(stringConstraints.minNameLength, 'Project name cannot be empty')
    .max(stringConstraints.maxNameLength, 'Project name too long'),
  description: z
    .string()
    .max(stringConstraints.maxDescriptionLength, 'Description too long')
    .optional(),
  language: z.string().max(50, 'Language name too long').nullable().optional(),
  languages: z.array(z.string()).max(50, 'Too many languages (max 50)').default([]),
  fileCount: z
    .number()
    .int('File count must be an integer')
    .nonnegative('File count cannot be negative')
    .max(100000, 'File count exceeds reasonable limit'),
  directoryCount: z
    .number()
    .int('Directory count must be an integer')
    .nonnegative('Directory count cannot be negative')
    .max(10000, 'Directory count exceeds reasonable limit'),
  directories: z.array(z.string()).max(10000, 'Too many directories (max 10000)').default([]),
  keyFiles: z.array(z.string()).max(1000, 'Too many key files (max 1000)').default([]),
  dependencies: z.record(z.string(), z.string()).nullable().optional(),
  devDependencies: z.record(z.string(), z.string()).nullable().optional(),
  readme: z
    .string()
    .max(50000, 'README content too long (max 50000 characters)')
    .nullable()
    .optional(),
  fileAnalysis: z
    .array(fileAnalysisSchema)
    .max(10000, 'Too many file analyses (max 10000)')
    .default([]),
  totalSize: z
    .number()
    .int('Total size must be an integer')
    .nonnegative('Total size cannot be negative')
    .optional(),
  frameworks: z.array(frameworkSchema).max(100, 'Too many frameworks (max 100)').default([]),
  architecturalPatterns: z
    .array(architecturalPatternSchema)
    .max(50, 'Too many architectural patterns (max 50)')
    .default([]),
  complexity: complexityMetricsSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
// =============================================================================
// CONFIGURATION SCHEMAS
// =============================================================================
/**
 * Schema for general user preferences
 */
export const generalPreferencesSchema = z.object({
  defaultWorkspace: z
    .string()
    .max(stringConstraints.maxPathLength, 'Workspace path too long')
    .optional(),
  autoSave: z.boolean().default(true),
  autoIndex: z.boolean().default(true),
  enableNotifications: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().max(50, 'Language name too long').default('en'),
  timezone: z.string().max(50, 'Timezone name too long').default('UTC'),
});
/**
 * Schema for analysis preferences
 */
export const analysisPreferencesSchema = z.object({
  defaultMode: z.enum(['quick', 'standard', 'comprehensive']).default('standard'),
  maxFiles: z
    .number()
    .int('Max files must be an integer')
    .positive('Max files must be positive')
    .max(10000, 'Max files exceeds reasonable limit')
    .default(1000),
  maxLinesPerFile: z
    .number()
    .int('Max lines per file must be an integer')
    .positive('Max lines per file must be positive')
    .max(
      numericConstraints.maxLinesPerFile,
      `Max lines exceeds ${numericConstraints.maxLinesPerFile} limit`
    )
    .default(10000),
  includeLLMAnalysis: z.boolean().default(false),
  includeTree: z.boolean().default(true),
  ignorePatterns: z
    .array(z.string())
    .max(100, 'Too many ignore patterns (max 100)')
    .default(['node_modules/**', '.git/**', '*.log', 'dist/**', 'build/**']),
  includePatterns: z
    .array(z.string())
    .max(100, 'Too many include patterns (max 100)')
    .default(['**/*']),
  maxFileSize: z
    .number()
    .int('Max file size must be an integer')
    .positive('Max file size must be positive')
    .max(
      numericConstraints.maxFileSize,
      `Max file size exceeds ${numericConstraints.maxFileSize} bytes limit`
    )
    .default(numericConstraints.maxFileSize),
  cacheDirectory: z
    .string()
    .max(stringConstraints.maxPathLength, 'Cache directory path too long')
    .default('.cache'),
  cacheTTL: z
    .number()
    .int('Cache TTL must be an integer')
    .positive('Cache TTL must be positive')
    .max(86400 * 30, 'Cache TTL exceeds 30 days')
    .default(3600), // 1 hour
  parallelProcessing: z.boolean().default(true),
  maxConcurrency: z
    .number()
    .int('Max concurrency must be an integer')
    .positive('Max concurrency must be positive')
    .max(100, 'Max concurrency exceeds reasonable limit')
    .default(10),
});
/**
 * Schema for LLM provider configuration
 */
export const providerConfigurationSchema = z.object({
  name: z.string().min(1, 'Provider name cannot be empty').max(50, 'Provider name too long'),
  apiKey: z.string().min(10, 'API key too short').max(1000, 'API key too long').optional(),
  model: z.string().min(1, 'Model name cannot be empty').max(100, 'Model name too long').optional(),
  maxTokens: z
    .number()
    .int('Max tokens must be an integer')
    .positive('Max tokens must be positive')
    .max(numericConstraints.maxTokens, `Max tokens exceeds ${numericConstraints.maxTokens} limit`)
    .default(1000),
  temperature: z
    .number()
    .min(
      numericConstraints.minTemperature,
      `Temperature must be at least ${numericConstraints.minTemperature}`
    )
    .max(
      numericConstraints.maxTemperature,
      `Temperature must be at most ${numericConstraints.maxTemperature}`
    )
    .default(0.7),
  enabled: z.boolean().default(false),
  customEndpoint: z
    .string()
    .url('Invalid custom endpoint URL')
    .max(stringConstraints.maxPathLength, 'Custom endpoint URL too long')
    .optional(),
  timeout: z
    .number()
    .int('Timeout must be an integer')
    .positive('Timeout must be positive')
    .max(300, 'Timeout exceeds 5 minutes')
    .default(30),
  retryAttempts: z
    .number()
    .int('Retry attempts must be an integer')
    .nonnegative('Retry attempts cannot be negative')
    .max(10, 'Retry attempts exceeds reasonable limit')
    .default(3),
});
/**
 * Schema for LLM provider preferences
 */
export const llmProviderPreferencesSchema = z.object({
  defaultProvider: z
    .string()
    .min(1, 'Default provider cannot be empty')
    .max(50, 'Default provider name too long')
    .default('openai'),
  providers: z.record(z.string(), providerConfigurationSchema).default({}),
});
/**
 * Schema for export preferences
 */
export const exportPreferencesSchema = z.object({
  defaultFormat: z.enum(['json', 'markdown', 'html', 'csv', 'xml']).default('json'),
  outputDirectory: z
    .string()
    .max(stringConstraints.maxPathLength, 'Output directory path too long')
    .default('./reports'),
  includeMetadata: z.boolean().default(true),
  compressLargeFiles: z.boolean().default(true),
  customTemplates: z.record(z.string(), z.string()).default({}),
  dateFormat: z.string().max(50, 'Date format string too long').default('YYYY-MM-DD HH:mm:ss'),
  timezone: z.string().max(50, 'Timezone name too long').default('UTC'),
});
// =============================================================================
// COMPOSITE SCHEMAS
// =============================================================================
/**
 * Schema for complete user preferences
 */
export const userPreferencesSchema = z.object({
  general: generalPreferencesSchema,
  analysis: analysisPreferencesSchema,
  llmProvider: llmProviderPreferencesSchema,
  export: exportPreferencesSchema,
});
/**
 * Schema for repository analysis results
 */
export const repositoryAnalysisSchema = z.object({
  id: z.string().uuid('Invalid repository ID format').optional(),
  name: z.string().min(1, 'Repository name cannot be empty').max(255, 'Repository name too long'),
  path: z.string().min(1, 'Repository path cannot be empty').max(4096, 'Repository path too long'),
  language: z.string().max(50, 'Language name too long').nullable().optional(),
  languages: z.array(z.string()).max(50, 'Too many languages (max 50)').default([]),
  frameworks: z.array(frameworkSchema).max(100, 'Too many frameworks (max 100)').default([]),
  description: z.string().max(2000, 'Description too long').optional(),
  fileCount: z.number().int().nonnegative().max(100000, 'File count exceeds reasonable limit'),
  directoryCount: z
    .number()
    .int()
    .nonnegative()
    .max(10000, 'Directory count exceeds reasonable limit'),
  totalSize: z.number().int().nonnegative().optional(),
  codeAnalysis: z.object({
    complexity: complexityMetricsSchema,
    linesOfCode: z.number().int().nonnegative().default(0),
    functions: z.array(functionInfoSchema).default([]),
    classes: z.array(classInfoSchema).default([]),
  }),
  dependencies: z.array(dependencySchema).default([]),
  fileTypes: z.record(z.string(), z.number()).default({}),
  summary: z.string().max(5000, 'Summary too long').optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
/**
 * Schema for search query parameters
 */
export const searchQuerySchema = z.object({
  query: z.string().max(1000, 'Search query too long').optional(),
  language: z.string().max(50, 'Language name too long').optional(),
  framework: z.string().max(100, 'Framework name too long').optional(),
  minSize: z.number().int().nonnegative().optional(),
  maxSize: z.number().int().nonnegative().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().int().positive().max(1000, 'Limit exceeds maximum').default(50),
  offset: z.number().int().nonnegative().default(0),
});
/**
 * Schema for repository index
 */
export const repositoryIndexSchema = z.object({
  repositories: z.array(repositoryAnalysisSchema).default([]),
  totalCount: z.number().int().nonnegative().default(0),
  lastUpdated: z.date().default(() => new Date()),
  version: z.string().max(50, 'Version string too long').default('1.0.0'),
});
/**
 * Schema for provider configuration
 */
export const providerConfigSchema = z.object({
  name: z.string().min(1, 'Provider name cannot be empty').max(50, 'Provider name too long'),
  apiKey: z.string().min(10, 'API key too short').max(1000, 'API key too long').optional(),
  model: z.string().min(1, 'Model name cannot be empty').max(100, 'Model name too long').optional(),
  maxTokens: z.number().int().positive().max(100000, 'Max tokens exceeds limit').default(1000),
  temperature: z.number().min(0).max(1).default(0.7),
  enabled: z.boolean().default(false),
});
//# sourceMappingURL=schemas.js.map
