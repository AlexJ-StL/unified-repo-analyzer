/**
 * Zod validation schemas for data models
 */
import { z } from 'zod';
export declare const functionInfoSchema: z.ZodObject<
  {
    name: z.ZodString;
    lineNumber: z.ZodNumber;
    parameters: z.ZodArray<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const classInfoSchema: z.ZodObject<
  {
    name: z.ZodString;
    lineNumber: z.ZodNumber;
    methods: z.ZodArray<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const fileInfoSchema: z.ZodObject<
  {
    path: z.ZodString;
    language: z.ZodString;
    size: z.ZodNumber;
    lineCount: z.ZodNumber;
    tokenCount: z.ZodOptional<z.ZodNumber>;
    importance: z.ZodNumber;
    functions: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          lineNumber: z.ZodNumber;
          parameters: z.ZodArray<z.ZodString>;
          description: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    classes: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          lineNumber: z.ZodNumber;
          methods: z.ZodArray<z.ZodString>;
          description: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    description: z.ZodOptional<z.ZodString>;
    useCase: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const directoryInfoSchema: z.ZodObject<
  {
    path: z.ZodString;
    files: z.ZodNumber;
    subdirectories: z.ZodNumber;
    role: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const dependencySchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodString;
    type: z.ZodEnum<{
      development: 'development';
      production: 'production';
    }>;
    description: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const frameworkSchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const analysisOptionsSchema: z.ZodObject<
  {
    mode: z.ZodEnum<{
      standard: 'standard';
      quick: 'quick';
      comprehensive: 'comprehensive';
    }>;
    maxFiles: z.ZodNumber;
    maxLinesPerFile: z.ZodNumber;
    includeLLMAnalysis: z.ZodBoolean;
    llmProvider: z.ZodString;
    outputFormats: z.ZodArray<
      z.ZodEnum<{
        html: 'html';
        json: 'json';
        markdown: 'markdown';
      }>
    >;
    includeTree: z.ZodBoolean;
  },
  z.core.$strip
>;
export declare const tokenUsageSchema: z.ZodObject<
  {
    prompt: z.ZodNumber;
    completion: z.ZodNumber;
    total: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const complexityMetricsSchema: z.ZodObject<
  {
    cyclomaticComplexity: z.ZodNumber;
    maintainabilityIndex: z.ZodNumber;
    technicalDebt: z.ZodString;
    codeQuality: z.ZodEnum<{
      good: 'good';
      poor: 'poor';
      excellent: 'excellent';
      fair: 'fair';
    }>;
  },
  z.core.$strip
>;
export declare const architecturalPatternSchema: z.ZodObject<
  {
    name: z.ZodString;
    confidence: z.ZodNumber;
    description: z.ZodString;
  },
  z.core.$strip
>;
export declare const repositoryAnalysisSchema: z.ZodObject<
  {
    id: z.ZodString;
    path: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    language: z.ZodString;
    languages: z.ZodArray<z.ZodString>;
    frameworks: z.ZodArray<z.ZodString>;
    fileCount: z.ZodNumber;
    directoryCount: z.ZodNumber;
    totalSize: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    structure: z.ZodObject<
      {
        directories: z.ZodArray<
          z.ZodObject<
            {
              path: z.ZodString;
              files: z.ZodNumber;
              subdirectories: z.ZodNumber;
              role: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >
        >;
        keyFiles: z.ZodArray<
          z.ZodObject<
            {
              path: z.ZodString;
              language: z.ZodString;
              size: z.ZodNumber;
              lineCount: z.ZodNumber;
              tokenCount: z.ZodOptional<z.ZodNumber>;
              importance: z.ZodNumber;
              functions: z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    lineNumber: z.ZodNumber;
                    parameters: z.ZodArray<z.ZodString>;
                    description: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >
              >;
              classes: z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    lineNumber: z.ZodNumber;
                    methods: z.ZodArray<z.ZodString>;
                    description: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >
              >;
              description: z.ZodOptional<z.ZodString>;
              useCase: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >
        >;
        tree: z.ZodString;
      },
      z.core.$strip
    >;
    codeAnalysis: z.ZodObject<
      {
        functionCount: z.ZodNumber;
        classCount: z.ZodNumber;
        importCount: z.ZodNumber;
        complexity: z.ZodObject<
          {
            cyclomaticComplexity: z.ZodNumber;
            maintainabilityIndex: z.ZodNumber;
            technicalDebt: z.ZodString;
            codeQuality: z.ZodEnum<{
              good: 'good';
              poor: 'poor';
              excellent: 'excellent';
              fair: 'fair';
            }>;
          },
          z.core.$strip
        >;
        patterns: z.ZodArray<
          z.ZodObject<
            {
              name: z.ZodString;
              confidence: z.ZodNumber;
              description: z.ZodString;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
    dependencies: z.ZodObject<
      {
        production: z.ZodArray<z.ZodAny>;
        development: z.ZodArray<z.ZodAny>;
        frameworks: z.ZodArray<z.ZodAny>;
      },
      z.core.$strip
    >;
    insights: z.ZodObject<
      {
        executiveSummary: z.ZodString;
        technicalBreakdown: z.ZodString;
        recommendations: z.ZodArray<z.ZodString>;
        potentialIssues: z.ZodArray<z.ZodString>;
      },
      z.core.$strip
    >;
    metadata: z.ZodObject<
      {
        analysisMode: z.ZodEnum<{
          standard: 'standard';
          quick: 'quick';
          comprehensive: 'comprehensive';
        }>;
        llmProvider: z.ZodOptional<z.ZodString>;
        processingTime: z.ZodNumber;
        tokenUsage: z.ZodOptional<
          z.ZodObject<
            {
              prompt: z.ZodNumber;
              completion: z.ZodNumber;
              total: z.ZodNumber;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export declare const repositoryRelationshipSchema: z.ZodObject<
  {
    sourceId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodEnum<{
      similar: 'similar';
      complementary: 'complementary';
      dependency: 'dependency';
      fork: 'fork';
    }>;
    strength: z.ZodNumber;
    reason: z.ZodString;
  },
  z.core.$strip
>;
export declare const tagSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const indexedRepositorySchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    languages: z.ZodArray<z.ZodString>;
    frameworks: z.ZodArray<z.ZodString>;
    tags: z.ZodArray<z.ZodString>;
    summary: z.ZodString;
    lastAnalyzed: z.ZodDate;
    size: z.ZodNumber;
    complexity: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const repositoryIndexSchema: z.ZodObject<
  {
    repositories: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          path: z.ZodString;
          languages: z.ZodArray<z.ZodString>;
          frameworks: z.ZodArray<z.ZodString>;
          tags: z.ZodArray<z.ZodString>;
          summary: z.ZodString;
          lastAnalyzed: z.ZodDate;
          size: z.ZodNumber;
          complexity: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
    relationships: z.ZodArray<
      z.ZodObject<
        {
          sourceId: z.ZodString;
          targetId: z.ZodString;
          type: z.ZodEnum<{
            similar: 'similar';
            complementary: 'complementary';
            dependency: 'dependency';
            fork: 'fork';
          }>;
          strength: z.ZodNumber;
          reason: z.ZodString;
        },
        z.core.$strip
      >
    >;
    tags: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          category: z.ZodOptional<z.ZodString>;
          color: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    lastUpdated: z.ZodDate;
  },
  z.core.$strip
>;
export declare const dateRangeSchema: z.ZodObject<
  {
    start: z.ZodDate;
    end: z.ZodDate;
  },
  z.core.$strip
>;
export declare const searchQuerySchema: z.ZodObject<
  {
    languages: z.ZodOptional<z.ZodArray<z.ZodString>>;
    frameworks: z.ZodOptional<z.ZodArray<z.ZodString>>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    fileTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dateRange: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodDate;
          end: z.ZodDate;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const searchResultMatchSchema: z.ZodObject<
  {
    field: z.ZodString;
    value: z.ZodString;
    score: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const searchResultSchema: z.ZodObject<
  {
    repository: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        path: z.ZodString;
        languages: z.ZodArray<z.ZodString>;
        frameworks: z.ZodArray<z.ZodString>;
        tags: z.ZodArray<z.ZodString>;
        summary: z.ZodString;
        lastAnalyzed: z.ZodDate;
        size: z.ZodNumber;
        complexity: z.ZodNumber;
      },
      z.core.$strip
    >;
    score: z.ZodNumber;
    matches: z.ZodArray<
      z.ZodObject<
        {
          field: z.ZodString;
          value: z.ZodString;
          score: z.ZodNumber;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const providerConfigSchema: z.ZodObject<
  {
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
export declare const llmResponseSchema: z.ZodObject<
  {
    content: z.ZodString;
    tokenUsage: z.ZodObject<
      {
        prompt: z.ZodNumber;
        completion: z.ZodNumber;
        total: z.ZodNumber;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export declare const fileAnalysisSchema: z.ZodObject<
  {
    path: z.ZodString;
    lineCount: z.ZodNumber;
    functionCount: z.ZodNumber;
    classCount: z.ZodNumber;
    importCount: z.ZodNumber;
    comments: z.ZodArray<z.ZodString>;
    functions: z.ZodArray<z.ZodString>;
    classes: z.ZodArray<z.ZodString>;
    sample: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const projectInfoSchema: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    language: z.ZodNullable<z.ZodString>;
    fileCount: z.ZodNumber;
    directoryCount: z.ZodNumber;
    directories: z.ZodArray<z.ZodString>;
    keyFiles: z.ZodArray<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    devDependencies: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    readme: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fileAnalysis: z.ZodArray<
      z.ZodObject<
        {
          path: z.ZodString;
          lineCount: z.ZodNumber;
          functionCount: z.ZodNumber;
          classCount: z.ZodNumber;
          importCount: z.ZodNumber;
          comments: z.ZodArray<z.ZodString>;
          functions: z.ZodArray<z.ZodString>;
          classes: z.ZodArray<z.ZodString>;
          sample: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const generalPreferencesSchema: z.ZodObject<
  {
    defaultWorkspace: z.ZodOptional<z.ZodString>;
    autoSave: z.ZodBoolean;
    autoIndex: z.ZodBoolean;
    enableNotifications: z.ZodBoolean;
    theme: z.ZodEnum<{
      system: 'system';
      light: 'light';
      dark: 'dark';
    }>;
    language: z.ZodString;
  },
  z.core.$strip
>;
export declare const analysisPreferencesSchema: z.ZodObject<
  {
    defaultMode: z.ZodEnum<{
      standard: 'standard';
      quick: 'quick';
      comprehensive: 'comprehensive';
    }>;
    maxFiles: z.ZodNumber;
    maxLinesPerFile: z.ZodNumber;
    includeLLMAnalysis: z.ZodBoolean;
    includeTree: z.ZodBoolean;
    ignorePatterns: z.ZodArray<z.ZodString>;
    maxFileSize: z.ZodNumber;
    cacheDirectory: z.ZodString;
    cacheTTL: z.ZodNumber;
  },
  z.core.$strip
>;
export declare const providerConfigurationSchema: z.ZodObject<
  {
    name: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodNumber;
    temperature: z.ZodNumber;
    enabled: z.ZodBoolean;
    customEndpoint: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const llmProviderPreferencesSchema: z.ZodObject<
  {
    defaultProvider: z.ZodString;
    providers: z.ZodRecord<
      z.ZodString,
      z.ZodObject<
        {
          name: z.ZodString;
          apiKey: z.ZodOptional<z.ZodString>;
          model: z.ZodOptional<z.ZodString>;
          maxTokens: z.ZodNumber;
          temperature: z.ZodNumber;
          enabled: z.ZodBoolean;
          customEndpoint: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const exportPreferencesSchema: z.ZodObject<
  {
    defaultFormat: z.ZodEnum<{
      html: 'html';
      json: 'json';
      markdown: 'markdown';
    }>;
    outputDirectory: z.ZodString;
    includeMetadata: z.ZodBoolean;
    compressLargeFiles: z.ZodBoolean;
    customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
  },
  z.core.$strip
>;
export declare const uiPreferencesSchema: z.ZodObject<
  {
    compactMode: z.ZodBoolean;
    showAdvancedOptions: z.ZodBoolean;
    defaultView: z.ZodEnum<{
      grid: 'grid';
      list: 'list';
    }>;
    itemsPerPage: z.ZodNumber;
    enableAnimations: z.ZodBoolean;
  },
  z.core.$strip
>;
export declare const userPreferencesSchema: z.ZodObject<
  {
    general: z.ZodObject<
      {
        defaultWorkspace: z.ZodOptional<z.ZodString>;
        autoSave: z.ZodBoolean;
        autoIndex: z.ZodBoolean;
        enableNotifications: z.ZodBoolean;
        theme: z.ZodEnum<{
          system: 'system';
          light: 'light';
          dark: 'dark';
        }>;
        language: z.ZodString;
      },
      z.core.$strip
    >;
    analysis: z.ZodObject<
      {
        defaultMode: z.ZodEnum<{
          standard: 'standard';
          quick: 'quick';
          comprehensive: 'comprehensive';
        }>;
        maxFiles: z.ZodNumber;
        maxLinesPerFile: z.ZodNumber;
        includeLLMAnalysis: z.ZodBoolean;
        includeTree: z.ZodBoolean;
        ignorePatterns: z.ZodArray<z.ZodString>;
        maxFileSize: z.ZodNumber;
        cacheDirectory: z.ZodString;
        cacheTTL: z.ZodNumber;
      },
      z.core.$strip
    >;
    llmProvider: z.ZodObject<
      {
        defaultProvider: z.ZodString;
        providers: z.ZodRecord<
          z.ZodString,
          z.ZodObject<
            {
              name: z.ZodString;
              apiKey: z.ZodOptional<z.ZodString>;
              model: z.ZodOptional<z.ZodString>;
              maxTokens: z.ZodNumber;
              temperature: z.ZodNumber;
              enabled: z.ZodBoolean;
              customEndpoint: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
    export: z.ZodObject<
      {
        defaultFormat: z.ZodEnum<{
          html: 'html';
          json: 'json';
          markdown: 'markdown';
        }>;
        outputDirectory: z.ZodString;
        includeMetadata: z.ZodBoolean;
        compressLargeFiles: z.ZodBoolean;
        customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
      },
      z.core.$strip
    >;
    ui: z.ZodObject<
      {
        compactMode: z.ZodBoolean;
        showAdvancedOptions: z.ZodBoolean;
        defaultView: z.ZodEnum<{
          grid: 'grid';
          list: 'list';
        }>;
        itemsPerPage: z.ZodNumber;
        enableAnimations: z.ZodBoolean;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export declare const analysisModePresetSchema: z.ZodObject<
  {
    name: z.ZodEnum<{
      standard: 'standard';
      quick: 'quick';
      comprehensive: 'comprehensive';
    }>;
    displayName: z.ZodString;
    description: z.ZodString;
    maxFiles: z.ZodNumber;
    maxLinesPerFile: z.ZodNumber;
    includeLLMAnalysis: z.ZodBoolean;
    includeTree: z.ZodBoolean;
    estimatedTime: z.ZodString;
    recommended: z.ZodBoolean;
  },
  z.core.$strip
>;
export declare const workspaceConfigurationSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    preferences: z.ZodObject<
      {
        general: z.ZodOptional<
          z.ZodObject<
            {
              defaultWorkspace: z.ZodOptional<z.ZodString>;
              autoSave: z.ZodBoolean;
              autoIndex: z.ZodBoolean;
              enableNotifications: z.ZodBoolean;
              theme: z.ZodEnum<{
                system: 'system';
                light: 'light';
                dark: 'dark';
              }>;
              language: z.ZodString;
            },
            z.core.$strip
          >
        >;
        analysis: z.ZodOptional<
          z.ZodObject<
            {
              defaultMode: z.ZodEnum<{
                standard: 'standard';
                quick: 'quick';
                comprehensive: 'comprehensive';
              }>;
              maxFiles: z.ZodNumber;
              maxLinesPerFile: z.ZodNumber;
              includeLLMAnalysis: z.ZodBoolean;
              includeTree: z.ZodBoolean;
              ignorePatterns: z.ZodArray<z.ZodString>;
              maxFileSize: z.ZodNumber;
              cacheDirectory: z.ZodString;
              cacheTTL: z.ZodNumber;
            },
            z.core.$strip
          >
        >;
        llmProvider: z.ZodOptional<
          z.ZodObject<
            {
              defaultProvider: z.ZodString;
              providers: z.ZodRecord<
                z.ZodString,
                z.ZodObject<
                  {
                    name: z.ZodString;
                    apiKey: z.ZodOptional<z.ZodString>;
                    model: z.ZodOptional<z.ZodString>;
                    maxTokens: z.ZodNumber;
                    temperature: z.ZodNumber;
                    enabled: z.ZodBoolean;
                    customEndpoint: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >
              >;
            },
            z.core.$strip
          >
        >;
        export: z.ZodOptional<
          z.ZodObject<
            {
              defaultFormat: z.ZodEnum<{
                html: 'html';
                json: 'json';
                markdown: 'markdown';
              }>;
              outputDirectory: z.ZodString;
              includeMetadata: z.ZodBoolean;
              compressLargeFiles: z.ZodBoolean;
              customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
            },
            z.core.$strip
          >
        >;
        ui: z.ZodOptional<
          z.ZodObject<
            {
              compactMode: z.ZodBoolean;
              showAdvancedOptions: z.ZodBoolean;
              defaultView: z.ZodEnum<{
                grid: 'grid';
                list: 'list';
              }>;
              itemsPerPage: z.ZodNumber;
              enableAnimations: z.ZodBoolean;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  z.core.$strip
>;
export declare const projectConfigurationSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    workspaceId: z.ZodOptional<z.ZodString>;
    preferences: z.ZodObject<
      {
        general: z.ZodOptional<
          z.ZodObject<
            {
              defaultWorkspace: z.ZodOptional<z.ZodString>;
              autoSave: z.ZodBoolean;
              autoIndex: z.ZodBoolean;
              enableNotifications: z.ZodBoolean;
              theme: z.ZodEnum<{
                system: 'system';
                light: 'light';
                dark: 'dark';
              }>;
              language: z.ZodString;
            },
            z.core.$strip
          >
        >;
        analysis: z.ZodOptional<
          z.ZodObject<
            {
              defaultMode: z.ZodEnum<{
                standard: 'standard';
                quick: 'quick';
                comprehensive: 'comprehensive';
              }>;
              maxFiles: z.ZodNumber;
              maxLinesPerFile: z.ZodNumber;
              includeLLMAnalysis: z.ZodBoolean;
              includeTree: z.ZodBoolean;
              ignorePatterns: z.ZodArray<z.ZodString>;
              maxFileSize: z.ZodNumber;
              cacheDirectory: z.ZodString;
              cacheTTL: z.ZodNumber;
            },
            z.core.$strip
          >
        >;
        llmProvider: z.ZodOptional<
          z.ZodObject<
            {
              defaultProvider: z.ZodString;
              providers: z.ZodRecord<
                z.ZodString,
                z.ZodObject<
                  {
                    name: z.ZodString;
                    apiKey: z.ZodOptional<z.ZodString>;
                    model: z.ZodOptional<z.ZodString>;
                    maxTokens: z.ZodNumber;
                    temperature: z.ZodNumber;
                    enabled: z.ZodBoolean;
                    customEndpoint: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >
              >;
            },
            z.core.$strip
          >
        >;
        export: z.ZodOptional<
          z.ZodObject<
            {
              defaultFormat: z.ZodEnum<{
                html: 'html';
                json: 'json';
                markdown: 'markdown';
              }>;
              outputDirectory: z.ZodString;
              includeMetadata: z.ZodBoolean;
              compressLargeFiles: z.ZodBoolean;
              customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
            },
            z.core.$strip
          >
        >;
        ui: z.ZodOptional<
          z.ZodObject<
            {
              compactMode: z.ZodBoolean;
              showAdvancedOptions: z.ZodBoolean;
              defaultView: z.ZodEnum<{
                grid: 'grid';
                list: 'list';
              }>;
              itemsPerPage: z.ZodNumber;
              enableAnimations: z.ZodBoolean;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
    customIgnorePatterns: z.ZodOptional<z.ZodArray<z.ZodString>>;
    customAnalysisOptions: z.ZodOptional<
      z.ZodObject<
        {
          defaultMode: z.ZodOptional<
            z.ZodEnum<{
              standard: 'standard';
              quick: 'quick';
              comprehensive: 'comprehensive';
            }>
          >;
          maxFiles: z.ZodOptional<z.ZodNumber>;
          maxLinesPerFile: z.ZodOptional<z.ZodNumber>;
          includeLLMAnalysis: z.ZodOptional<z.ZodBoolean>;
          includeTree: z.ZodOptional<z.ZodBoolean>;
          ignorePatterns: z.ZodOptional<z.ZodArray<z.ZodString>>;
          maxFileSize: z.ZodOptional<z.ZodNumber>;
          cacheDirectory: z.ZodOptional<z.ZodString>;
          cacheTTL: z.ZodOptional<z.ZodNumber>;
        },
        z.core.$strip
      >
    >;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  z.core.$strip
>;
export declare const configurationProfileSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    preferences: z.ZodObject<
      {
        general: z.ZodObject<
          {
            defaultWorkspace: z.ZodOptional<z.ZodString>;
            autoSave: z.ZodBoolean;
            autoIndex: z.ZodBoolean;
            enableNotifications: z.ZodBoolean;
            theme: z.ZodEnum<{
              system: 'system';
              light: 'light';
              dark: 'dark';
            }>;
            language: z.ZodString;
          },
          z.core.$strip
        >;
        analysis: z.ZodObject<
          {
            defaultMode: z.ZodEnum<{
              standard: 'standard';
              quick: 'quick';
              comprehensive: 'comprehensive';
            }>;
            maxFiles: z.ZodNumber;
            maxLinesPerFile: z.ZodNumber;
            includeLLMAnalysis: z.ZodBoolean;
            includeTree: z.ZodBoolean;
            ignorePatterns: z.ZodArray<z.ZodString>;
            maxFileSize: z.ZodNumber;
            cacheDirectory: z.ZodString;
            cacheTTL: z.ZodNumber;
          },
          z.core.$strip
        >;
        llmProvider: z.ZodObject<
          {
            defaultProvider: z.ZodString;
            providers: z.ZodRecord<
              z.ZodString,
              z.ZodObject<
                {
                  name: z.ZodString;
                  apiKey: z.ZodOptional<z.ZodString>;
                  model: z.ZodOptional<z.ZodString>;
                  maxTokens: z.ZodNumber;
                  temperature: z.ZodNumber;
                  enabled: z.ZodBoolean;
                  customEndpoint: z.ZodOptional<z.ZodString>;
                },
                z.core.$strip
              >
            >;
          },
          z.core.$strip
        >;
        export: z.ZodObject<
          {
            defaultFormat: z.ZodEnum<{
              html: 'html';
              json: 'json';
              markdown: 'markdown';
            }>;
            outputDirectory: z.ZodString;
            includeMetadata: z.ZodBoolean;
            compressLargeFiles: z.ZodBoolean;
            customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
          },
          z.core.$strip
        >;
        ui: z.ZodObject<
          {
            compactMode: z.ZodBoolean;
            showAdvancedOptions: z.ZodBoolean;
            defaultView: z.ZodEnum<{
              grid: 'grid';
              list: 'list';
            }>;
            itemsPerPage: z.ZodNumber;
            enableAnimations: z.ZodBoolean;
          },
          z.core.$strip
        >;
      },
      z.core.$strip
    >;
    isDefault: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  z.core.$strip
>;
export declare const configurationErrorSchema: z.ZodObject<
  {
    field: z.ZodString;
    message: z.ZodString;
    code: z.ZodString;
  },
  z.core.$strip
>;
export declare const configurationWarningSchema: z.ZodObject<
  {
    field: z.ZodString;
    message: z.ZodString;
    suggestion: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const configurationValidationResultSchema: z.ZodObject<
  {
    isValid: z.ZodBoolean;
    errors: z.ZodArray<
      z.ZodObject<
        {
          field: z.ZodString;
          message: z.ZodString;
          code: z.ZodString;
        },
        z.core.$strip
      >
    >;
    warnings: z.ZodArray<
      z.ZodObject<
        {
          field: z.ZodString;
          message: z.ZodString;
          suggestion: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const configurationBackupSchema: z.ZodObject<
  {
    id: z.ZodString;
    timestamp: z.ZodDate;
    version: z.ZodString;
    preferences: z.ZodObject<
      {
        general: z.ZodObject<
          {
            defaultWorkspace: z.ZodOptional<z.ZodString>;
            autoSave: z.ZodBoolean;
            autoIndex: z.ZodBoolean;
            enableNotifications: z.ZodBoolean;
            theme: z.ZodEnum<{
              system: 'system';
              light: 'light';
              dark: 'dark';
            }>;
            language: z.ZodString;
          },
          z.core.$strip
        >;
        analysis: z.ZodObject<
          {
            defaultMode: z.ZodEnum<{
              standard: 'standard';
              quick: 'quick';
              comprehensive: 'comprehensive';
            }>;
            maxFiles: z.ZodNumber;
            maxLinesPerFile: z.ZodNumber;
            includeLLMAnalysis: z.ZodBoolean;
            includeTree: z.ZodBoolean;
            ignorePatterns: z.ZodArray<z.ZodString>;
            maxFileSize: z.ZodNumber;
            cacheDirectory: z.ZodString;
            cacheTTL: z.ZodNumber;
          },
          z.core.$strip
        >;
        llmProvider: z.ZodObject<
          {
            defaultProvider: z.ZodString;
            providers: z.ZodRecord<
              z.ZodString,
              z.ZodObject<
                {
                  name: z.ZodString;
                  apiKey: z.ZodOptional<z.ZodString>;
                  model: z.ZodOptional<z.ZodString>;
                  maxTokens: z.ZodNumber;
                  temperature: z.ZodNumber;
                  enabled: z.ZodBoolean;
                  customEndpoint: z.ZodOptional<z.ZodString>;
                },
                z.core.$strip
              >
            >;
          },
          z.core.$strip
        >;
        export: z.ZodObject<
          {
            defaultFormat: z.ZodEnum<{
              html: 'html';
              json: 'json';
              markdown: 'markdown';
            }>;
            outputDirectory: z.ZodString;
            includeMetadata: z.ZodBoolean;
            compressLargeFiles: z.ZodBoolean;
            customTemplates: z.ZodRecord<z.ZodString, z.ZodString>;
          },
          z.core.$strip
        >;
        ui: z.ZodObject<
          {
            compactMode: z.ZodBoolean;
            showAdvancedOptions: z.ZodBoolean;
            defaultView: z.ZodEnum<{
              grid: 'grid';
              list: 'list';
            }>;
            itemsPerPage: z.ZodNumber;
            enableAnimations: z.ZodBoolean;
          },
          z.core.$strip
        >;
      },
      z.core.$strip
    >;
    reason: z.ZodEnum<{
      manual: 'manual';
      auto: 'auto';
      migration: 'migration';
    }>;
  },
  z.core.$strip
>;
