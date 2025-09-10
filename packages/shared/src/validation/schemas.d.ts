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
/**
 * Schema for function information
 * Represents metadata about a function in source code
 */
export declare const functionInfoSchema: z.ZodObject<
  {
    name: z.ZodString;
    lineNumber: z.ZodNumber;
    parameters: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    description: z.ZodOptional<z.ZodString>;
    returnType: z.ZodOptional<z.ZodString>;
    isAsync: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    lineNumber: number;
    parameters: string[];
    isAsync: boolean;
    isExported: boolean;
    description?: string | undefined;
    returnType?: string | undefined;
  },
  {
    name: string;
    lineNumber: number;
    description?: string | undefined;
    parameters?: string[] | undefined;
    returnType?: string | undefined;
    isAsync?: boolean | undefined;
    isExported?: boolean | undefined;
  }
>;
/**
 * Schema for class information
 * Represents metadata about a class in source code
 */
export declare const classInfoSchema: z.ZodObject<
  {
    name: z.ZodString;
    lineNumber: z.ZodNumber;
    methods: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    description: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    implements: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    lineNumber: number;
    isExported: boolean;
    methods: string[];
    implements: string[];
    description?: string | undefined;
    extends?: string | undefined;
  },
  {
    name: string;
    lineNumber: number;
    description?: string | undefined;
    isExported?: boolean | undefined;
    methods?: string[] | undefined;
    extends?: string | undefined;
    implements?: string[] | undefined;
  }
>;
/**
 * Schema for file information
 * Represents comprehensive metadata about a source file
 */
export declare const fileInfoSchema: z.ZodObject<
  {
    path: z.ZodEffects<z.ZodString, string, string>;
    language: z.ZodString;
    size: z.ZodNumber;
    lineCount: z.ZodNumber;
    tokenCount: z.ZodOptional<z.ZodNumber>;
    importance: z.ZodDefault<z.ZodNumber>;
    functions: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            lineNumber: z.ZodNumber;
            parameters: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            description: z.ZodOptional<z.ZodString>;
            returnType: z.ZodOptional<z.ZodString>;
            isAsync: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            lineNumber: number;
            parameters: string[];
            isAsync: boolean;
            isExported: boolean;
            description?: string | undefined;
            returnType?: string | undefined;
          },
          {
            name: string;
            lineNumber: number;
            description?: string | undefined;
            parameters?: string[] | undefined;
            returnType?: string | undefined;
            isAsync?: boolean | undefined;
            isExported?: boolean | undefined;
          }
        >,
        'many'
      >
    >;
    classes: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            lineNumber: z.ZodNumber;
            methods: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            description: z.ZodOptional<z.ZodString>;
            extends: z.ZodOptional<z.ZodString>;
            implements: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            lineNumber: number;
            isExported: boolean;
            methods: string[];
            implements: string[];
            description?: string | undefined;
            extends?: string | undefined;
          },
          {
            name: string;
            lineNumber: number;
            description?: string | undefined;
            isExported?: boolean | undefined;
            methods?: string[] | undefined;
            extends?: string | undefined;
            implements?: string[] | undefined;
          }
        >,
        'many'
      >
    >;
    description: z.ZodOptional<z.ZodString>;
    useCase: z.ZodOptional<z.ZodString>;
    lastModified: z.ZodOptional<z.ZodDate>;
    encoding: z.ZodDefault<z.ZodEnum<['utf8', 'utf16', 'ascii', 'binary']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    path: string;
    language: string;
    size: number;
    lineCount: number;
    importance: number;
    functions: {
      name: string;
      lineNumber: number;
      parameters: string[];
      isAsync: boolean;
      isExported: boolean;
      description?: string | undefined;
      returnType?: string | undefined;
    }[];
    classes: {
      name: string;
      lineNumber: number;
      isExported: boolean;
      methods: string[];
      implements: string[];
      description?: string | undefined;
      extends?: string | undefined;
    }[];
    encoding: 'ascii' | 'utf8' | 'binary' | 'utf16';
    description?: string | undefined;
    tokenCount?: number | undefined;
    useCase?: string | undefined;
    lastModified?: Date | undefined;
  },
  {
    path: string;
    language: string;
    size: number;
    lineCount: number;
    description?: string | undefined;
    tokenCount?: number | undefined;
    importance?: number | undefined;
    functions?:
      | {
          name: string;
          lineNumber: number;
          description?: string | undefined;
          parameters?: string[] | undefined;
          returnType?: string | undefined;
          isAsync?: boolean | undefined;
          isExported?: boolean | undefined;
        }[]
      | undefined;
    classes?:
      | {
          name: string;
          lineNumber: number;
          description?: string | undefined;
          isExported?: boolean | undefined;
          methods?: string[] | undefined;
          extends?: string | undefined;
          implements?: string[] | undefined;
        }[]
      | undefined;
    useCase?: string | undefined;
    lastModified?: Date | undefined;
    encoding?: 'ascii' | 'utf8' | 'binary' | 'utf16' | undefined;
  }
>;
/**
 * Schema for directory information
 * Represents metadata about a directory in the project structure
 */
export declare const directoryInfoSchema: z.ZodObject<
  {
    path: z.ZodEffects<z.ZodString, string, string>;
    files: z.ZodNumber;
    subdirectories: z.ZodNumber;
    role: z.ZodOptional<z.ZodString>;
    totalSize: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    path: string;
    files: number;
    subdirectories: number;
    role?: string | undefined;
    totalSize?: number | undefined;
  },
  {
    path: string;
    files: number;
    subdirectories: number;
    role?: string | undefined;
    totalSize?: number | undefined;
  }
>;
/**
 * Schema for dependency information
 * Represents a project dependency with metadata
 */
export declare const dependencySchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodUnion<[z.ZodString, z.ZodString]>;
    type: z.ZodDefault<z.ZodEnum<['development', 'production', 'peer', 'optional']>>;
    description: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    repository: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'production' | 'development' | 'peer' | 'optional';
    name: string;
    version: string;
    description?: string | undefined;
    homepage?: string | undefined;
    repository?: string | undefined;
  },
  {
    name: string;
    version: string;
    type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
    description?: string | undefined;
    homepage?: string | undefined;
    repository?: string | undefined;
  }
>;
/**
 * Schema for framework detection
 * Represents a detected framework with confidence score
 */
export declare const frameworkSchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    confidence: z.ZodDefault<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<
      z.ZodEnum<
        [
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
        ]
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    confidence: number;
    category?:
      | 'frontend'
      | 'backend'
      | 'testing'
      | 'build-tools'
      | 'database'
      | 'devops'
      | 'mobile'
      | 'desktop'
      | 'game'
      | 'ai-ml'
      | 'other'
      | undefined;
    description?: string | undefined;
    version?: string | undefined;
  },
  {
    name: string;
    category?:
      | 'frontend'
      | 'backend'
      | 'testing'
      | 'build-tools'
      | 'database'
      | 'devops'
      | 'mobile'
      | 'desktop'
      | 'game'
      | 'ai-ml'
      | 'other'
      | undefined;
    description?: string | undefined;
    version?: string | undefined;
    confidence?: number | undefined;
  }
>;
/**
 * Schema for analysis options
 * Configuration for repository analysis parameters
 */
export declare const analysisOptionsSchema: z.ZodObject<
  {
    mode: z.ZodDefault<z.ZodEnum<['quick', 'standard', 'comprehensive']>>;
    maxFiles: z.ZodDefault<z.ZodNumber>;
    maxLinesPerFile: z.ZodDefault<z.ZodNumber>;
    includeLLMAnalysis: z.ZodDefault<z.ZodBoolean>;
    llmProvider: z.ZodDefault<z.ZodString>;
    outputFormats: z.ZodDefault<
      z.ZodArray<z.ZodEnum<['json', 'markdown', 'html', 'csv', 'xml']>, 'many'>
    >;
    includeTree: z.ZodDefault<z.ZodBoolean>;
    ignorePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    maxFileSize: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    maxFiles: number;
    mode: 'quick' | 'standard' | 'comprehensive';
    maxLinesPerFile: number;
    includeLLMAnalysis: boolean;
    llmProvider: string;
    outputFormats: ('json' | 'markdown' | 'html' | 'csv' | 'xml')[];
    includeTree: boolean;
    ignorePatterns: string[];
    includePatterns: string[];
    maxFileSize: number;
  },
  {
    maxFiles?: number | undefined;
    mode?: 'quick' | 'standard' | 'comprehensive' | undefined;
    maxLinesPerFile?: number | undefined;
    includeLLMAnalysis?: boolean | undefined;
    llmProvider?: string | undefined;
    outputFormats?: ('json' | 'markdown' | 'html' | 'csv' | 'xml')[] | undefined;
    includeTree?: boolean | undefined;
    ignorePatterns?: string[] | undefined;
    includePatterns?: string[] | undefined;
    maxFileSize?: number | undefined;
  }
>;
/**
 * Schema for token usage tracking
 * Tracks LLM API usage for cost monitoring
 */
export declare const tokenUsageSchema: z.ZodObject<
  {
    prompt: z.ZodDefault<z.ZodNumber>;
    completion: z.ZodDefault<z.ZodNumber>;
    total: z.ZodDefault<z.ZodNumber>;
    estimatedCost: z.ZodOptional<z.ZodNumber>;
    model: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    prompt: number;
    completion: number;
    total: number;
    model?: string | undefined;
    estimatedCost?: number | undefined;
  },
  {
    model?: string | undefined;
    prompt?: number | undefined;
    completion?: number | undefined;
    total?: number | undefined;
    estimatedCost?: number | undefined;
  }
>;
/**
 * Schema for complexity metrics
 * Represents code complexity analysis results
 */
export declare const complexityMetricsSchema: z.ZodObject<
  {
    cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
    maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
    technicalDebt: z.ZodDefault<z.ZodString>;
    codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
    testCoverage: z.ZodOptional<z.ZodNumber>;
    documentationCoverage: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    technicalDebt: string;
    codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
    testCoverage?: number | undefined;
    documentationCoverage?: number | undefined;
  },
  {
    cyclomaticComplexity?: number | undefined;
    maintainabilityIndex?: number | undefined;
    technicalDebt?: string | undefined;
    codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
    testCoverage?: number | undefined;
    documentationCoverage?: number | undefined;
  }
>;
/**
 * Schema for architectural pattern detection
 * Represents detected architectural patterns
 */
export declare const architecturalPatternSchema: z.ZodObject<
  {
    name: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<
      z.ZodEnum<
        ['creational', 'structural', 'behavioral', 'architectural', 'microservices', 'other']
      >
    >;
    examples: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    confidence: number;
    examples: string[];
    category?:
      | 'other'
      | 'creational'
      | 'structural'
      | 'behavioral'
      | 'architectural'
      | 'microservices'
      | undefined;
    description?: string | undefined;
  },
  {
    name: string;
    category?:
      | 'other'
      | 'creational'
      | 'structural'
      | 'behavioral'
      | 'architectural'
      | 'microservices'
      | undefined;
    description?: string | undefined;
    confidence?: number | undefined;
    examples?: string[] | undefined;
  }
>;
/**
 * Schema for LLM request configuration
 * Configuration for LLM API requests
 */
export declare const llmRequestSchema: z.ZodObject<
  {
    prompt: z.ZodString;
    model: z.ZodDefault<z.ZodString>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    temperature: z.ZodDefault<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    model: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
  },
  {
    prompt: string;
    model?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
  }
>;
/**
 * Schema for LLM response
 * Represents a response from an LLM API
 */
export declare const llmResponseSchema: z.ZodObject<
  {
    content: z.ZodString;
    tokenUsage: z.ZodObject<
      {
        prompt: z.ZodDefault<z.ZodNumber>;
        completion: z.ZodDefault<z.ZodNumber>;
        total: z.ZodDefault<z.ZodNumber>;
        estimatedCost: z.ZodOptional<z.ZodNumber>;
        model: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        prompt: number;
        completion: number;
        total: number;
        model?: string | undefined;
        estimatedCost?: number | undefined;
      },
      {
        model?: string | undefined;
        prompt?: number | undefined;
        completion?: number | undefined;
        total?: number | undefined;
        estimatedCost?: number | undefined;
      }
    >;
    model: z.ZodOptional<z.ZodString>;
    finishReason: z.ZodOptional<z.ZodEnum<['stop', 'length', 'content_filter', 'tool_calls']>>;
    created: z.ZodDefault<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    created: Date;
    content: string;
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
      model?: string | undefined;
      estimatedCost?: number | undefined;
    };
    model?: string | undefined;
    finishReason?: 'length' | 'stop' | 'content_filter' | 'tool_calls' | undefined;
  },
  {
    content: string;
    tokenUsage: {
      model?: string | undefined;
      prompt?: number | undefined;
      completion?: number | undefined;
      total?: number | undefined;
      estimatedCost?: number | undefined;
    };
    created?: Date | undefined;
    model?: string | undefined;
    finishReason?: 'length' | 'stop' | 'content_filter' | 'tool_calls' | undefined;
  }
>;
/**
 * Schema for detailed file analysis
 * Comprehensive analysis of a single file
 */
export declare const fileAnalysisSchema: z.ZodObject<
  {
    path: z.ZodString;
    lineCount: z.ZodNumber;
    functionCount: z.ZodNumber;
    classCount: z.ZodNumber;
    importCount: z.ZodNumber;
    comments: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    functions: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    classes: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    sample: z.ZodOptional<z.ZodString>;
    complexity: z.ZodOptional<
      z.ZodObject<
        {
          cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
          maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
          technicalDebt: z.ZodDefault<z.ZodString>;
          codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
          testCoverage: z.ZodOptional<z.ZodNumber>;
          documentationCoverage: z.ZodOptional<z.ZodNumber>;
        },
        'strip',
        z.ZodTypeAny,
        {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        },
        {
          cyclomaticComplexity?: number | undefined;
          maintainabilityIndex?: number | undefined;
          technicalDebt?: string | undefined;
          codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      >
    >;
    dependencies: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            version: z.ZodUnion<[z.ZodString, z.ZodString]>;
            type: z.ZodDefault<z.ZodEnum<['development', 'production', 'peer', 'optional']>>;
            description: z.ZodOptional<z.ZodString>;
            homepage: z.ZodOptional<z.ZodString>;
            repository: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            type: 'production' | 'development' | 'peer' | 'optional';
            name: string;
            version: string;
            description?: string | undefined;
            homepage?: string | undefined;
            repository?: string | undefined;
          },
          {
            name: string;
            version: string;
            type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
            description?: string | undefined;
            homepage?: string | undefined;
            repository?: string | undefined;
          }
        >,
        'many'
      >
    >;
    frameworks: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            confidence: z.ZodDefault<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<
              z.ZodEnum<
                [
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
                ]
              >
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            confidence: number;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
          },
          {
            name: string;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        'many'
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    path: string;
    lineCount: number;
    functions: string[];
    classes: string[];
    functionCount: number;
    classCount: number;
    importCount: number;
    comments: string[];
    dependencies: {
      type: 'production' | 'development' | 'peer' | 'optional';
      name: string;
      version: string;
      description?: string | undefined;
      homepage?: string | undefined;
      repository?: string | undefined;
    }[];
    frameworks: {
      name: string;
      confidence: number;
      category?:
        | 'frontend'
        | 'backend'
        | 'testing'
        | 'build-tools'
        | 'database'
        | 'devops'
        | 'mobile'
        | 'desktop'
        | 'game'
        | 'ai-ml'
        | 'other'
        | undefined;
      description?: string | undefined;
      version?: string | undefined;
    }[];
    sample?: string | undefined;
    complexity?:
      | {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      | undefined;
  },
  {
    path: string;
    lineCount: number;
    functionCount: number;
    classCount: number;
    importCount: number;
    functions?: string[] | undefined;
    classes?: string[] | undefined;
    comments?: string[] | undefined;
    sample?: string | undefined;
    complexity?:
      | {
          cyclomaticComplexity?: number | undefined;
          maintainabilityIndex?: number | undefined;
          technicalDebt?: string | undefined;
          codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      | undefined;
    dependencies?:
      | {
          name: string;
          version: string;
          type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
          description?: string | undefined;
          homepage?: string | undefined;
          repository?: string | undefined;
        }[]
      | undefined;
    frameworks?:
      | {
          name: string;
          category?:
            | 'frontend'
            | 'backend'
            | 'testing'
            | 'build-tools'
            | 'database'
            | 'devops'
            | 'mobile'
            | 'desktop'
            | 'game'
            | 'ai-ml'
            | 'other'
            | undefined;
          description?: string | undefined;
          version?: string | undefined;
          confidence?: number | undefined;
        }[]
      | undefined;
  }
>;
/**
 * Schema for comprehensive project information
 * Complete analysis results for a repository
 */
export declare const projectInfoSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    fileCount: z.ZodNumber;
    directoryCount: z.ZodNumber;
    directories: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    keyFiles: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    dependencies: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    devDependencies: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    readme: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fileAnalysis: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            path: z.ZodString;
            lineCount: z.ZodNumber;
            functionCount: z.ZodNumber;
            classCount: z.ZodNumber;
            importCount: z.ZodNumber;
            comments: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            functions: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            classes: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            sample: z.ZodOptional<z.ZodString>;
            complexity: z.ZodOptional<
              z.ZodObject<
                {
                  cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
                  maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
                  technicalDebt: z.ZodDefault<z.ZodString>;
                  codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
                  testCoverage: z.ZodOptional<z.ZodNumber>;
                  documentationCoverage: z.ZodOptional<z.ZodNumber>;
                },
                'strip',
                z.ZodTypeAny,
                {
                  cyclomaticComplexity: number;
                  maintainabilityIndex: number;
                  technicalDebt: string;
                  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                },
                {
                  cyclomaticComplexity?: number | undefined;
                  maintainabilityIndex?: number | undefined;
                  technicalDebt?: string | undefined;
                  codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                }
              >
            >;
            dependencies: z.ZodDefault<
              z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    version: z.ZodUnion<[z.ZodString, z.ZodString]>;
                    type: z.ZodDefault<
                      z.ZodEnum<['development', 'production', 'peer', 'optional']>
                    >;
                    description: z.ZodOptional<z.ZodString>;
                    homepage: z.ZodOptional<z.ZodString>;
                    repository: z.ZodOptional<z.ZodString>;
                  },
                  'strip',
                  z.ZodTypeAny,
                  {
                    type: 'production' | 'development' | 'peer' | 'optional';
                    name: string;
                    version: string;
                    description?: string | undefined;
                    homepage?: string | undefined;
                    repository?: string | undefined;
                  },
                  {
                    name: string;
                    version: string;
                    type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                    description?: string | undefined;
                    homepage?: string | undefined;
                    repository?: string | undefined;
                  }
                >,
                'many'
              >
            >;
            frameworks: z.ZodDefault<
              z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    version: z.ZodOptional<z.ZodString>;
                    confidence: z.ZodDefault<z.ZodNumber>;
                    description: z.ZodOptional<z.ZodString>;
                    category: z.ZodOptional<
                      z.ZodEnum<
                        [
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
                        ]
                      >
                    >;
                  },
                  'strip',
                  z.ZodTypeAny,
                  {
                    name: string;
                    confidence: number;
                    category?:
                      | 'frontend'
                      | 'backend'
                      | 'testing'
                      | 'build-tools'
                      | 'database'
                      | 'devops'
                      | 'mobile'
                      | 'desktop'
                      | 'game'
                      | 'ai-ml'
                      | 'other'
                      | undefined;
                    description?: string | undefined;
                    version?: string | undefined;
                  },
                  {
                    name: string;
                    category?:
                      | 'frontend'
                      | 'backend'
                      | 'testing'
                      | 'build-tools'
                      | 'database'
                      | 'devops'
                      | 'mobile'
                      | 'desktop'
                      | 'game'
                      | 'ai-ml'
                      | 'other'
                      | undefined;
                    description?: string | undefined;
                    version?: string | undefined;
                    confidence?: number | undefined;
                  }
                >,
                'many'
              >
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            path: string;
            lineCount: number;
            functions: string[];
            classes: string[];
            functionCount: number;
            classCount: number;
            importCount: number;
            comments: string[];
            dependencies: {
              type: 'production' | 'development' | 'peer' | 'optional';
              name: string;
              version: string;
              description?: string | undefined;
              homepage?: string | undefined;
              repository?: string | undefined;
            }[];
            frameworks: {
              name: string;
              confidence: number;
              category?:
                | 'frontend'
                | 'backend'
                | 'testing'
                | 'build-tools'
                | 'database'
                | 'devops'
                | 'mobile'
                | 'desktop'
                | 'game'
                | 'ai-ml'
                | 'other'
                | undefined;
              description?: string | undefined;
              version?: string | undefined;
            }[];
            sample?: string | undefined;
            complexity?:
              | {
                  cyclomaticComplexity: number;
                  maintainabilityIndex: number;
                  technicalDebt: string;
                  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                }
              | undefined;
          },
          {
            path: string;
            lineCount: number;
            functionCount: number;
            classCount: number;
            importCount: number;
            functions?: string[] | undefined;
            classes?: string[] | undefined;
            comments?: string[] | undefined;
            sample?: string | undefined;
            complexity?:
              | {
                  cyclomaticComplexity?: number | undefined;
                  maintainabilityIndex?: number | undefined;
                  technicalDebt?: string | undefined;
                  codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                }
              | undefined;
            dependencies?:
              | {
                  name: string;
                  version: string;
                  type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                  description?: string | undefined;
                  homepage?: string | undefined;
                  repository?: string | undefined;
                }[]
              | undefined;
            frameworks?:
              | {
                  name: string;
                  category?:
                    | 'frontend'
                    | 'backend'
                    | 'testing'
                    | 'build-tools'
                    | 'database'
                    | 'devops'
                    | 'mobile'
                    | 'desktop'
                    | 'game'
                    | 'ai-ml'
                    | 'other'
                    | undefined;
                  description?: string | undefined;
                  version?: string | undefined;
                  confidence?: number | undefined;
                }[]
              | undefined;
          }
        >,
        'many'
      >
    >;
    totalSize: z.ZodOptional<z.ZodNumber>;
    frameworks: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            confidence: z.ZodDefault<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<
              z.ZodEnum<
                [
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
                ]
              >
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            confidence: number;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
          },
          {
            name: string;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        'many'
      >
    >;
    architecturalPatterns: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            confidence: z.ZodDefault<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<
              z.ZodEnum<
                [
                  'creational',
                  'structural',
                  'behavioral',
                  'architectural',
                  'microservices',
                  'other',
                ]
              >
            >;
            examples: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            confidence: number;
            examples: string[];
            category?:
              | 'other'
              | 'creational'
              | 'structural'
              | 'behavioral'
              | 'architectural'
              | 'microservices'
              | undefined;
            description?: string | undefined;
          },
          {
            name: string;
            category?:
              | 'other'
              | 'creational'
              | 'structural'
              | 'behavioral'
              | 'architectural'
              | 'microservices'
              | undefined;
            description?: string | undefined;
            confidence?: number | undefined;
            examples?: string[] | undefined;
          }
        >,
        'many'
      >
    >;
    complexity: z.ZodOptional<
      z.ZodObject<
        {
          cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
          maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
          technicalDebt: z.ZodDefault<z.ZodString>;
          codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
          testCoverage: z.ZodOptional<z.ZodNumber>;
          documentationCoverage: z.ZodOptional<z.ZodNumber>;
        },
        'strip',
        z.ZodTypeAny,
        {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        },
        {
          cyclomaticComplexity?: number | undefined;
          maintainabilityIndex?: number | undefined;
          technicalDebt?: string | undefined;
          codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      >
    >;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    frameworks: {
      name: string;
      confidence: number;
      category?:
        | 'frontend'
        | 'backend'
        | 'testing'
        | 'build-tools'
        | 'database'
        | 'devops'
        | 'mobile'
        | 'desktop'
        | 'game'
        | 'ai-ml'
        | 'other'
        | undefined;
      description?: string | undefined;
      version?: string | undefined;
    }[];
    languages: string[];
    fileCount: number;
    directoryCount: number;
    directories: string[];
    keyFiles: string[];
    fileAnalysis: {
      path: string;
      lineCount: number;
      functions: string[];
      classes: string[];
      functionCount: number;
      classCount: number;
      importCount: number;
      comments: string[];
      dependencies: {
        type: 'production' | 'development' | 'peer' | 'optional';
        name: string;
        version: string;
        description?: string | undefined;
        homepage?: string | undefined;
        repository?: string | undefined;
      }[];
      frameworks: {
        name: string;
        confidence: number;
        category?:
          | 'frontend'
          | 'backend'
          | 'testing'
          | 'build-tools'
          | 'database'
          | 'devops'
          | 'mobile'
          | 'desktop'
          | 'game'
          | 'ai-ml'
          | 'other'
          | undefined;
        description?: string | undefined;
        version?: string | undefined;
      }[];
      sample?: string | undefined;
      complexity?:
        | {
            cyclomaticComplexity: number;
            maintainabilityIndex: number;
            technicalDebt: string;
            codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
            testCoverage?: number | undefined;
            documentationCoverage?: number | undefined;
          }
        | undefined;
    }[];
    architecturalPatterns: {
      name: string;
      confidence: number;
      examples: string[];
      category?:
        | 'other'
        | 'creational'
        | 'structural'
        | 'behavioral'
        | 'architectural'
        | 'microservices'
        | undefined;
      description?: string | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    language?: string | null | undefined;
    totalSize?: number | undefined;
    complexity?:
      | {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      | undefined;
    dependencies?: Record<string, string> | null | undefined;
    id?: string | undefined;
    devDependencies?: Record<string, string> | null | undefined;
    readme?: string | null | undefined;
  },
  {
    name: string;
    fileCount: number;
    directoryCount: number;
    description?: string | undefined;
    language?: string | null | undefined;
    totalSize?: number | undefined;
    complexity?:
      | {
          cyclomaticComplexity?: number | undefined;
          maintainabilityIndex?: number | undefined;
          technicalDebt?: string | undefined;
          codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        }
      | undefined;
    dependencies?: Record<string, string> | null | undefined;
    frameworks?:
      | {
          name: string;
          category?:
            | 'frontend'
            | 'backend'
            | 'testing'
            | 'build-tools'
            | 'database'
            | 'devops'
            | 'mobile'
            | 'desktop'
            | 'game'
            | 'ai-ml'
            | 'other'
            | undefined;
          description?: string | undefined;
          version?: string | undefined;
          confidence?: number | undefined;
        }[]
      | undefined;
    id?: string | undefined;
    languages?: string[] | undefined;
    directories?: string[] | undefined;
    keyFiles?: string[] | undefined;
    devDependencies?: Record<string, string> | null | undefined;
    readme?: string | null | undefined;
    fileAnalysis?:
      | {
          path: string;
          lineCount: number;
          functionCount: number;
          classCount: number;
          importCount: number;
          functions?: string[] | undefined;
          classes?: string[] | undefined;
          comments?: string[] | undefined;
          sample?: string | undefined;
          complexity?:
            | {
                cyclomaticComplexity?: number | undefined;
                maintainabilityIndex?: number | undefined;
                technicalDebt?: string | undefined;
                codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                testCoverage?: number | undefined;
                documentationCoverage?: number | undefined;
              }
            | undefined;
          dependencies?:
            | {
                name: string;
                version: string;
                type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                description?: string | undefined;
                homepage?: string | undefined;
                repository?: string | undefined;
              }[]
            | undefined;
          frameworks?:
            | {
                name: string;
                category?:
                  | 'frontend'
                  | 'backend'
                  | 'testing'
                  | 'build-tools'
                  | 'database'
                  | 'devops'
                  | 'mobile'
                  | 'desktop'
                  | 'game'
                  | 'ai-ml'
                  | 'other'
                  | undefined;
                description?: string | undefined;
                version?: string | undefined;
                confidence?: number | undefined;
              }[]
            | undefined;
        }[]
      | undefined;
    architecturalPatterns?:
      | {
          name: string;
          category?:
            | 'other'
            | 'creational'
            | 'structural'
            | 'behavioral'
            | 'architectural'
            | 'microservices'
            | undefined;
          description?: string | undefined;
          confidence?: number | undefined;
          examples?: string[] | undefined;
        }[]
      | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
  }
>;
/**
 * Schema for general user preferences
 */
export declare const generalPreferencesSchema: z.ZodObject<
  {
    defaultWorkspace: z.ZodOptional<z.ZodString>;
    autoSave: z.ZodDefault<z.ZodBoolean>;
    autoIndex: z.ZodDefault<z.ZodBoolean>;
    enableNotifications: z.ZodDefault<z.ZodBoolean>;
    theme: z.ZodDefault<z.ZodEnum<['light', 'dark', 'system']>>;
    language: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    language: string;
    autoSave: boolean;
    autoIndex: boolean;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    defaultWorkspace?: string | undefined;
  },
  {
    language?: string | undefined;
    defaultWorkspace?: string | undefined;
    autoSave?: boolean | undefined;
    autoIndex?: boolean | undefined;
    enableNotifications?: boolean | undefined;
    theme?: 'light' | 'dark' | 'system' | undefined;
    timezone?: string | undefined;
  }
>;
/**
 * Schema for analysis preferences
 */
export declare const analysisPreferencesSchema: z.ZodObject<
  {
    defaultMode: z.ZodDefault<z.ZodEnum<['quick', 'standard', 'comprehensive']>>;
    maxFiles: z.ZodDefault<z.ZodNumber>;
    maxLinesPerFile: z.ZodDefault<z.ZodNumber>;
    includeLLMAnalysis: z.ZodDefault<z.ZodBoolean>;
    includeTree: z.ZodDefault<z.ZodBoolean>;
    ignorePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    maxFileSize: z.ZodDefault<z.ZodNumber>;
    cacheDirectory: z.ZodDefault<z.ZodString>;
    cacheTTL: z.ZodDefault<z.ZodNumber>;
    parallelProcessing: z.ZodDefault<z.ZodBoolean>;
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    maxFiles: number;
    maxLinesPerFile: number;
    includeLLMAnalysis: boolean;
    includeTree: boolean;
    ignorePatterns: string[];
    includePatterns: string[];
    maxFileSize: number;
    defaultMode: 'quick' | 'standard' | 'comprehensive';
    cacheDirectory: string;
    cacheTTL: number;
    parallelProcessing: boolean;
    maxConcurrency: number;
  },
  {
    maxFiles?: number | undefined;
    maxLinesPerFile?: number | undefined;
    includeLLMAnalysis?: boolean | undefined;
    includeTree?: boolean | undefined;
    ignorePatterns?: string[] | undefined;
    includePatterns?: string[] | undefined;
    maxFileSize?: number | undefined;
    defaultMode?: 'quick' | 'standard' | 'comprehensive' | undefined;
    cacheDirectory?: string | undefined;
    cacheTTL?: number | undefined;
    parallelProcessing?: boolean | undefined;
    maxConcurrency?: number | undefined;
  }
>;
/**
 * Schema for LLM provider configuration
 */
export declare const providerConfigurationSchema: z.ZodObject<
  {
    name: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    temperature: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    customEndpoint: z.ZodOptional<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    timeout: number;
    name: string;
    maxTokens: number;
    temperature: number;
    enabled: boolean;
    retryAttempts: number;
    model?: string | undefined;
    apiKey?: string | undefined;
    customEndpoint?: string | undefined;
  },
  {
    name: string;
    timeout?: number | undefined;
    model?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    apiKey?: string | undefined;
    enabled?: boolean | undefined;
    customEndpoint?: string | undefined;
    retryAttempts?: number | undefined;
  }
>;
/**
 * Schema for LLM provider preferences
 */
export declare const llmProviderPreferencesSchema: z.ZodObject<
  {
    defaultProvider: z.ZodDefault<z.ZodString>;
    providers: z.ZodDefault<
      z.ZodRecord<
        z.ZodString,
        z.ZodObject<
          {
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
            temperature: z.ZodDefault<z.ZodNumber>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            customEndpoint: z.ZodOptional<z.ZodString>;
            timeout: z.ZodDefault<z.ZodNumber>;
            retryAttempts: z.ZodDefault<z.ZodNumber>;
          },
          'strip',
          z.ZodTypeAny,
          {
            timeout: number;
            name: string;
            maxTokens: number;
            temperature: number;
            enabled: boolean;
            retryAttempts: number;
            model?: string | undefined;
            apiKey?: string | undefined;
            customEndpoint?: string | undefined;
          },
          {
            name: string;
            timeout?: number | undefined;
            model?: string | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            apiKey?: string | undefined;
            enabled?: boolean | undefined;
            customEndpoint?: string | undefined;
            retryAttempts?: number | undefined;
          }
        >
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    defaultProvider: string;
    providers: Record<
      string,
      {
        timeout: number;
        name: string;
        maxTokens: number;
        temperature: number;
        enabled: boolean;
        retryAttempts: number;
        model?: string | undefined;
        apiKey?: string | undefined;
        customEndpoint?: string | undefined;
      }
    >;
  },
  {
    defaultProvider?: string | undefined;
    providers?:
      | Record<
          string,
          {
            name: string;
            timeout?: number | undefined;
            model?: string | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            apiKey?: string | undefined;
            enabled?: boolean | undefined;
            customEndpoint?: string | undefined;
            retryAttempts?: number | undefined;
          }
        >
      | undefined;
  }
>;
/**
 * Schema for export preferences
 */
export declare const exportPreferencesSchema: z.ZodObject<
  {
    defaultFormat: z.ZodDefault<z.ZodEnum<['json', 'markdown', 'html', 'csv', 'xml']>>;
    outputDirectory: z.ZodDefault<z.ZodString>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    compressLargeFiles: z.ZodDefault<z.ZodBoolean>;
    customTemplates: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    dateFormat: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    timezone: string;
    defaultFormat: 'json' | 'markdown' | 'html' | 'csv' | 'xml';
    outputDirectory: string;
    includeMetadata: boolean;
    compressLargeFiles: boolean;
    customTemplates: Record<string, string>;
    dateFormat: string;
  },
  {
    timezone?: string | undefined;
    defaultFormat?: 'json' | 'markdown' | 'html' | 'csv' | 'xml' | undefined;
    outputDirectory?: string | undefined;
    includeMetadata?: boolean | undefined;
    compressLargeFiles?: boolean | undefined;
    customTemplates?: Record<string, string> | undefined;
    dateFormat?: string | undefined;
  }
>;
/**
 * Schema for complete user preferences
 */
export declare const userPreferencesSchema: z.ZodObject<
  {
    general: z.ZodObject<
      {
        defaultWorkspace: z.ZodOptional<z.ZodString>;
        autoSave: z.ZodDefault<z.ZodBoolean>;
        autoIndex: z.ZodDefault<z.ZodBoolean>;
        enableNotifications: z.ZodDefault<z.ZodBoolean>;
        theme: z.ZodDefault<z.ZodEnum<['light', 'dark', 'system']>>;
        language: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        language: string;
        autoSave: boolean;
        autoIndex: boolean;
        enableNotifications: boolean;
        theme: 'light' | 'dark' | 'system';
        timezone: string;
        defaultWorkspace?: string | undefined;
      },
      {
        language?: string | undefined;
        defaultWorkspace?: string | undefined;
        autoSave?: boolean | undefined;
        autoIndex?: boolean | undefined;
        enableNotifications?: boolean | undefined;
        theme?: 'light' | 'dark' | 'system' | undefined;
        timezone?: string | undefined;
      }
    >;
    analysis: z.ZodObject<
      {
        defaultMode: z.ZodDefault<z.ZodEnum<['quick', 'standard', 'comprehensive']>>;
        maxFiles: z.ZodDefault<z.ZodNumber>;
        maxLinesPerFile: z.ZodDefault<z.ZodNumber>;
        includeLLMAnalysis: z.ZodDefault<z.ZodBoolean>;
        includeTree: z.ZodDefault<z.ZodBoolean>;
        ignorePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
        includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
        maxFileSize: z.ZodDefault<z.ZodNumber>;
        cacheDirectory: z.ZodDefault<z.ZodString>;
        cacheTTL: z.ZodDefault<z.ZodNumber>;
        parallelProcessing: z.ZodDefault<z.ZodBoolean>;
        maxConcurrency: z.ZodDefault<z.ZodNumber>;
      },
      'strip',
      z.ZodTypeAny,
      {
        maxFiles: number;
        maxLinesPerFile: number;
        includeLLMAnalysis: boolean;
        includeTree: boolean;
        ignorePatterns: string[];
        includePatterns: string[];
        maxFileSize: number;
        defaultMode: 'quick' | 'standard' | 'comprehensive';
        cacheDirectory: string;
        cacheTTL: number;
        parallelProcessing: boolean;
        maxConcurrency: number;
      },
      {
        maxFiles?: number | undefined;
        maxLinesPerFile?: number | undefined;
        includeLLMAnalysis?: boolean | undefined;
        includeTree?: boolean | undefined;
        ignorePatterns?: string[] | undefined;
        includePatterns?: string[] | undefined;
        maxFileSize?: number | undefined;
        defaultMode?: 'quick' | 'standard' | 'comprehensive' | undefined;
        cacheDirectory?: string | undefined;
        cacheTTL?: number | undefined;
        parallelProcessing?: boolean | undefined;
        maxConcurrency?: number | undefined;
      }
    >;
    llmProvider: z.ZodObject<
      {
        defaultProvider: z.ZodDefault<z.ZodString>;
        providers: z.ZodDefault<
          z.ZodRecord<
            z.ZodString,
            z.ZodObject<
              {
                name: z.ZodString;
                apiKey: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                maxTokens: z.ZodDefault<z.ZodNumber>;
                temperature: z.ZodDefault<z.ZodNumber>;
                enabled: z.ZodDefault<z.ZodBoolean>;
                customEndpoint: z.ZodOptional<z.ZodString>;
                timeout: z.ZodDefault<z.ZodNumber>;
                retryAttempts: z.ZodDefault<z.ZodNumber>;
              },
              'strip',
              z.ZodTypeAny,
              {
                timeout: number;
                name: string;
                maxTokens: number;
                temperature: number;
                enabled: boolean;
                retryAttempts: number;
                model?: string | undefined;
                apiKey?: string | undefined;
                customEndpoint?: string | undefined;
              },
              {
                name: string;
                timeout?: number | undefined;
                model?: string | undefined;
                maxTokens?: number | undefined;
                temperature?: number | undefined;
                apiKey?: string | undefined;
                enabled?: boolean | undefined;
                customEndpoint?: string | undefined;
                retryAttempts?: number | undefined;
              }
            >
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        defaultProvider: string;
        providers: Record<
          string,
          {
            timeout: number;
            name: string;
            maxTokens: number;
            temperature: number;
            enabled: boolean;
            retryAttempts: number;
            model?: string | undefined;
            apiKey?: string | undefined;
            customEndpoint?: string | undefined;
          }
        >;
      },
      {
        defaultProvider?: string | undefined;
        providers?:
          | Record<
              string,
              {
                name: string;
                timeout?: number | undefined;
                model?: string | undefined;
                maxTokens?: number | undefined;
                temperature?: number | undefined;
                apiKey?: string | undefined;
                enabled?: boolean | undefined;
                customEndpoint?: string | undefined;
                retryAttempts?: number | undefined;
              }
            >
          | undefined;
      }
    >;
    export: z.ZodObject<
      {
        defaultFormat: z.ZodDefault<z.ZodEnum<['json', 'markdown', 'html', 'csv', 'xml']>>;
        outputDirectory: z.ZodDefault<z.ZodString>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        compressLargeFiles: z.ZodDefault<z.ZodBoolean>;
        customTemplates: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        dateFormat: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        timezone: string;
        defaultFormat: 'json' | 'markdown' | 'html' | 'csv' | 'xml';
        outputDirectory: string;
        includeMetadata: boolean;
        compressLargeFiles: boolean;
        customTemplates: Record<string, string>;
        dateFormat: string;
      },
      {
        timezone?: string | undefined;
        defaultFormat?: 'json' | 'markdown' | 'html' | 'csv' | 'xml' | undefined;
        outputDirectory?: string | undefined;
        includeMetadata?: boolean | undefined;
        compressLargeFiles?: boolean | undefined;
        customTemplates?: Record<string, string> | undefined;
        dateFormat?: string | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    analysis: {
      maxFiles: number;
      maxLinesPerFile: number;
      includeLLMAnalysis: boolean;
      includeTree: boolean;
      ignorePatterns: string[];
      includePatterns: string[];
      maxFileSize: number;
      defaultMode: 'quick' | 'standard' | 'comprehensive';
      cacheDirectory: string;
      cacheTTL: number;
      parallelProcessing: boolean;
      maxConcurrency: number;
    };
    llmProvider: {
      defaultProvider: string;
      providers: Record<
        string,
        {
          timeout: number;
          name: string;
          maxTokens: number;
          temperature: number;
          enabled: boolean;
          retryAttempts: number;
          model?: string | undefined;
          apiKey?: string | undefined;
          customEndpoint?: string | undefined;
        }
      >;
    };
    general: {
      language: string;
      autoSave: boolean;
      autoIndex: boolean;
      enableNotifications: boolean;
      theme: 'light' | 'dark' | 'system';
      timezone: string;
      defaultWorkspace?: string | undefined;
    };
    export: {
      timezone: string;
      defaultFormat: 'json' | 'markdown' | 'html' | 'csv' | 'xml';
      outputDirectory: string;
      includeMetadata: boolean;
      compressLargeFiles: boolean;
      customTemplates: Record<string, string>;
      dateFormat: string;
    };
  },
  {
    analysis: {
      maxFiles?: number | undefined;
      maxLinesPerFile?: number | undefined;
      includeLLMAnalysis?: boolean | undefined;
      includeTree?: boolean | undefined;
      ignorePatterns?: string[] | undefined;
      includePatterns?: string[] | undefined;
      maxFileSize?: number | undefined;
      defaultMode?: 'quick' | 'standard' | 'comprehensive' | undefined;
      cacheDirectory?: string | undefined;
      cacheTTL?: number | undefined;
      parallelProcessing?: boolean | undefined;
      maxConcurrency?: number | undefined;
    };
    llmProvider: {
      defaultProvider?: string | undefined;
      providers?:
        | Record<
            string,
            {
              name: string;
              timeout?: number | undefined;
              model?: string | undefined;
              maxTokens?: number | undefined;
              temperature?: number | undefined;
              apiKey?: string | undefined;
              enabled?: boolean | undefined;
              customEndpoint?: string | undefined;
              retryAttempts?: number | undefined;
            }
          >
        | undefined;
    };
    general: {
      language?: string | undefined;
      defaultWorkspace?: string | undefined;
      autoSave?: boolean | undefined;
      autoIndex?: boolean | undefined;
      enableNotifications?: boolean | undefined;
      theme?: 'light' | 'dark' | 'system' | undefined;
      timezone?: string | undefined;
    };
    export: {
      timezone?: string | undefined;
      defaultFormat?: 'json' | 'markdown' | 'html' | 'csv' | 'xml' | undefined;
      outputDirectory?: string | undefined;
      includeMetadata?: boolean | undefined;
      compressLargeFiles?: boolean | undefined;
      customTemplates?: Record<string, string> | undefined;
      dateFormat?: string | undefined;
    };
  }
>;
/**
 * Schema for repository analysis results
 */
export declare const repositoryAnalysisSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    path: z.ZodString;
    language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
    frameworks: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            confidence: z.ZodDefault<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<
              z.ZodEnum<
                [
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
                ]
              >
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            confidence: number;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
          },
          {
            name: string;
            category?:
              | 'frontend'
              | 'backend'
              | 'testing'
              | 'build-tools'
              | 'database'
              | 'devops'
              | 'mobile'
              | 'desktop'
              | 'game'
              | 'ai-ml'
              | 'other'
              | undefined;
            description?: string | undefined;
            version?: string | undefined;
            confidence?: number | undefined;
          }
        >,
        'many'
      >
    >;
    description: z.ZodOptional<z.ZodString>;
    fileCount: z.ZodNumber;
    directoryCount: z.ZodNumber;
    totalSize: z.ZodOptional<z.ZodNumber>;
    codeAnalysis: z.ZodObject<
      {
        complexity: z.ZodObject<
          {
            cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
            maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
            technicalDebt: z.ZodDefault<z.ZodString>;
            codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
            testCoverage: z.ZodOptional<z.ZodNumber>;
            documentationCoverage: z.ZodOptional<z.ZodNumber>;
          },
          'strip',
          z.ZodTypeAny,
          {
            cyclomaticComplexity: number;
            maintainabilityIndex: number;
            technicalDebt: string;
            codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
            testCoverage?: number | undefined;
            documentationCoverage?: number | undefined;
          },
          {
            cyclomaticComplexity?: number | undefined;
            maintainabilityIndex?: number | undefined;
            technicalDebt?: string | undefined;
            codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
            testCoverage?: number | undefined;
            documentationCoverage?: number | undefined;
          }
        >;
        linesOfCode: z.ZodDefault<z.ZodNumber>;
        functions: z.ZodDefault<
          z.ZodArray<
            z.ZodObject<
              {
                name: z.ZodString;
                lineNumber: z.ZodNumber;
                parameters: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                description: z.ZodOptional<z.ZodString>;
                returnType: z.ZodOptional<z.ZodString>;
                isAsync: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
              },
              'strip',
              z.ZodTypeAny,
              {
                name: string;
                lineNumber: number;
                parameters: string[];
                isAsync: boolean;
                isExported: boolean;
                description?: string | undefined;
                returnType?: string | undefined;
              },
              {
                name: string;
                lineNumber: number;
                description?: string | undefined;
                parameters?: string[] | undefined;
                returnType?: string | undefined;
                isAsync?: boolean | undefined;
                isExported?: boolean | undefined;
              }
            >,
            'many'
          >
        >;
        classes: z.ZodDefault<
          z.ZodArray<
            z.ZodObject<
              {
                name: z.ZodString;
                lineNumber: z.ZodNumber;
                methods: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                description: z.ZodOptional<z.ZodString>;
                extends: z.ZodOptional<z.ZodString>;
                implements: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
              },
              'strip',
              z.ZodTypeAny,
              {
                name: string;
                lineNumber: number;
                isExported: boolean;
                methods: string[];
                implements: string[];
                description?: string | undefined;
                extends?: string | undefined;
              },
              {
                name: string;
                lineNumber: number;
                description?: string | undefined;
                isExported?: boolean | undefined;
                methods?: string[] | undefined;
                extends?: string | undefined;
                implements?: string[] | undefined;
              }
            >,
            'many'
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        functions: {
          name: string;
          lineNumber: number;
          parameters: string[];
          isAsync: boolean;
          isExported: boolean;
          description?: string | undefined;
          returnType?: string | undefined;
        }[];
        classes: {
          name: string;
          lineNumber: number;
          isExported: boolean;
          methods: string[];
          implements: string[];
          description?: string | undefined;
          extends?: string | undefined;
        }[];
        complexity: {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        };
        linesOfCode: number;
      },
      {
        complexity: {
          cyclomaticComplexity?: number | undefined;
          maintainabilityIndex?: number | undefined;
          technicalDebt?: string | undefined;
          codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        };
        functions?:
          | {
              name: string;
              lineNumber: number;
              description?: string | undefined;
              parameters?: string[] | undefined;
              returnType?: string | undefined;
              isAsync?: boolean | undefined;
              isExported?: boolean | undefined;
            }[]
          | undefined;
        classes?:
          | {
              name: string;
              lineNumber: number;
              description?: string | undefined;
              isExported?: boolean | undefined;
              methods?: string[] | undefined;
              extends?: string | undefined;
              implements?: string[] | undefined;
            }[]
          | undefined;
        linesOfCode?: number | undefined;
      }
    >;
    dependencies: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            version: z.ZodUnion<[z.ZodString, z.ZodString]>;
            type: z.ZodDefault<z.ZodEnum<['development', 'production', 'peer', 'optional']>>;
            description: z.ZodOptional<z.ZodString>;
            homepage: z.ZodOptional<z.ZodString>;
            repository: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            type: 'production' | 'development' | 'peer' | 'optional';
            name: string;
            version: string;
            description?: string | undefined;
            homepage?: string | undefined;
            repository?: string | undefined;
          },
          {
            name: string;
            version: string;
            type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
            description?: string | undefined;
            homepage?: string | undefined;
            repository?: string | undefined;
          }
        >,
        'many'
      >
    >;
    fileTypes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    summary: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    path: string;
    name: string;
    dependencies: {
      type: 'production' | 'development' | 'peer' | 'optional';
      name: string;
      version: string;
      description?: string | undefined;
      homepage?: string | undefined;
      repository?: string | undefined;
    }[];
    frameworks: {
      name: string;
      confidence: number;
      category?:
        | 'frontend'
        | 'backend'
        | 'testing'
        | 'build-tools'
        | 'database'
        | 'devops'
        | 'mobile'
        | 'desktop'
        | 'game'
        | 'ai-ml'
        | 'other'
        | undefined;
      description?: string | undefined;
      version?: string | undefined;
    }[];
    languages: string[];
    fileCount: number;
    directoryCount: number;
    createdAt: Date;
    updatedAt: Date;
    codeAnalysis: {
      functions: {
        name: string;
        lineNumber: number;
        parameters: string[];
        isAsync: boolean;
        isExported: boolean;
        description?: string | undefined;
        returnType?: string | undefined;
      }[];
      classes: {
        name: string;
        lineNumber: number;
        isExported: boolean;
        methods: string[];
        implements: string[];
        description?: string | undefined;
        extends?: string | undefined;
      }[];
      complexity: {
        cyclomaticComplexity: number;
        maintainabilityIndex: number;
        technicalDebt: string;
        codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
        testCoverage?: number | undefined;
        documentationCoverage?: number | undefined;
      };
      linesOfCode: number;
    };
    fileTypes: Record<string, number>;
    description?: string | undefined;
    language?: string | null | undefined;
    totalSize?: number | undefined;
    id?: string | undefined;
    summary?: string | undefined;
  },
  {
    path: string;
    name: string;
    fileCount: number;
    directoryCount: number;
    codeAnalysis: {
      complexity: {
        cyclomaticComplexity?: number | undefined;
        maintainabilityIndex?: number | undefined;
        technicalDebt?: string | undefined;
        codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
        testCoverage?: number | undefined;
        documentationCoverage?: number | undefined;
      };
      functions?:
        | {
            name: string;
            lineNumber: number;
            description?: string | undefined;
            parameters?: string[] | undefined;
            returnType?: string | undefined;
            isAsync?: boolean | undefined;
            isExported?: boolean | undefined;
          }[]
        | undefined;
      classes?:
        | {
            name: string;
            lineNumber: number;
            description?: string | undefined;
            isExported?: boolean | undefined;
            methods?: string[] | undefined;
            extends?: string | undefined;
            implements?: string[] | undefined;
          }[]
        | undefined;
      linesOfCode?: number | undefined;
    };
    description?: string | undefined;
    language?: string | null | undefined;
    totalSize?: number | undefined;
    dependencies?:
      | {
          name: string;
          version: string;
          type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
          description?: string | undefined;
          homepage?: string | undefined;
          repository?: string | undefined;
        }[]
      | undefined;
    frameworks?:
      | {
          name: string;
          category?:
            | 'frontend'
            | 'backend'
            | 'testing'
            | 'build-tools'
            | 'database'
            | 'devops'
            | 'mobile'
            | 'desktop'
            | 'game'
            | 'ai-ml'
            | 'other'
            | undefined;
          description?: string | undefined;
          version?: string | undefined;
          confidence?: number | undefined;
        }[]
      | undefined;
    id?: string | undefined;
    languages?: string[] | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    fileTypes?: Record<string, number> | undefined;
    summary?: string | undefined;
  }
>;
/**
 * Schema for search query parameters
 */
export declare const searchQuerySchema: z.ZodObject<
  {
    query: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodString>;
    minSize: z.ZodOptional<z.ZodNumber>;
    maxSize: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    limit: number;
    offset: number;
    maxSize?: number | undefined;
    query?: string | undefined;
    language?: string | undefined;
    framework?: string | undefined;
    minSize?: number | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
  },
  {
    maxSize?: number | undefined;
    query?: string | undefined;
    limit?: number | undefined;
    language?: string | undefined;
    framework?: string | undefined;
    minSize?: number | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    offset?: number | undefined;
  }
>;
/**
 * Schema for repository index
 */
export declare const repositoryIndexSchema: z.ZodObject<
  {
    repositories: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            path: z.ZodString;
            language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            languages: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
            frameworks: z.ZodDefault<
              z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    version: z.ZodOptional<z.ZodString>;
                    confidence: z.ZodDefault<z.ZodNumber>;
                    description: z.ZodOptional<z.ZodString>;
                    category: z.ZodOptional<
                      z.ZodEnum<
                        [
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
                        ]
                      >
                    >;
                  },
                  'strip',
                  z.ZodTypeAny,
                  {
                    name: string;
                    confidence: number;
                    category?:
                      | 'frontend'
                      | 'backend'
                      | 'testing'
                      | 'build-tools'
                      | 'database'
                      | 'devops'
                      | 'mobile'
                      | 'desktop'
                      | 'game'
                      | 'ai-ml'
                      | 'other'
                      | undefined;
                    description?: string | undefined;
                    version?: string | undefined;
                  },
                  {
                    name: string;
                    category?:
                      | 'frontend'
                      | 'backend'
                      | 'testing'
                      | 'build-tools'
                      | 'database'
                      | 'devops'
                      | 'mobile'
                      | 'desktop'
                      | 'game'
                      | 'ai-ml'
                      | 'other'
                      | undefined;
                    description?: string | undefined;
                    version?: string | undefined;
                    confidence?: number | undefined;
                  }
                >,
                'many'
              >
            >;
            description: z.ZodOptional<z.ZodString>;
            fileCount: z.ZodNumber;
            directoryCount: z.ZodNumber;
            totalSize: z.ZodOptional<z.ZodNumber>;
            codeAnalysis: z.ZodObject<
              {
                complexity: z.ZodObject<
                  {
                    cyclomaticComplexity: z.ZodDefault<z.ZodNumber>;
                    maintainabilityIndex: z.ZodDefault<z.ZodNumber>;
                    technicalDebt: z.ZodDefault<z.ZodString>;
                    codeQuality: z.ZodDefault<z.ZodEnum<['excellent', 'good', 'fair', 'poor']>>;
                    testCoverage: z.ZodOptional<z.ZodNumber>;
                    documentationCoverage: z.ZodOptional<z.ZodNumber>;
                  },
                  'strip',
                  z.ZodTypeAny,
                  {
                    cyclomaticComplexity: number;
                    maintainabilityIndex: number;
                    technicalDebt: string;
                    codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
                    testCoverage?: number | undefined;
                    documentationCoverage?: number | undefined;
                  },
                  {
                    cyclomaticComplexity?: number | undefined;
                    maintainabilityIndex?: number | undefined;
                    technicalDebt?: string | undefined;
                    codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                    testCoverage?: number | undefined;
                    documentationCoverage?: number | undefined;
                  }
                >;
                linesOfCode: z.ZodDefault<z.ZodNumber>;
                functions: z.ZodDefault<
                  z.ZodArray<
                    z.ZodObject<
                      {
                        name: z.ZodString;
                        lineNumber: z.ZodNumber;
                        parameters: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                        description: z.ZodOptional<z.ZodString>;
                        returnType: z.ZodOptional<z.ZodString>;
                        isAsync: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                        isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                      },
                      'strip',
                      z.ZodTypeAny,
                      {
                        name: string;
                        lineNumber: number;
                        parameters: string[];
                        isAsync: boolean;
                        isExported: boolean;
                        description?: string | undefined;
                        returnType?: string | undefined;
                      },
                      {
                        name: string;
                        lineNumber: number;
                        description?: string | undefined;
                        parameters?: string[] | undefined;
                        returnType?: string | undefined;
                        isAsync?: boolean | undefined;
                        isExported?: boolean | undefined;
                      }
                    >,
                    'many'
                  >
                >;
                classes: z.ZodDefault<
                  z.ZodArray<
                    z.ZodObject<
                      {
                        name: z.ZodString;
                        lineNumber: z.ZodNumber;
                        methods: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                        description: z.ZodOptional<z.ZodString>;
                        extends: z.ZodOptional<z.ZodString>;
                        implements: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
                        isExported: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                      },
                      'strip',
                      z.ZodTypeAny,
                      {
                        name: string;
                        lineNumber: number;
                        isExported: boolean;
                        methods: string[];
                        implements: string[];
                        description?: string | undefined;
                        extends?: string | undefined;
                      },
                      {
                        name: string;
                        lineNumber: number;
                        description?: string | undefined;
                        isExported?: boolean | undefined;
                        methods?: string[] | undefined;
                        extends?: string | undefined;
                        implements?: string[] | undefined;
                      }
                    >,
                    'many'
                  >
                >;
              },
              'strip',
              z.ZodTypeAny,
              {
                functions: {
                  name: string;
                  lineNumber: number;
                  parameters: string[];
                  isAsync: boolean;
                  isExported: boolean;
                  description?: string | undefined;
                  returnType?: string | undefined;
                }[];
                classes: {
                  name: string;
                  lineNumber: number;
                  isExported: boolean;
                  methods: string[];
                  implements: string[];
                  description?: string | undefined;
                  extends?: string | undefined;
                }[];
                complexity: {
                  cyclomaticComplexity: number;
                  maintainabilityIndex: number;
                  technicalDebt: string;
                  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                };
                linesOfCode: number;
              },
              {
                complexity: {
                  cyclomaticComplexity?: number | undefined;
                  maintainabilityIndex?: number | undefined;
                  technicalDebt?: string | undefined;
                  codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                  testCoverage?: number | undefined;
                  documentationCoverage?: number | undefined;
                };
                functions?:
                  | {
                      name: string;
                      lineNumber: number;
                      description?: string | undefined;
                      parameters?: string[] | undefined;
                      returnType?: string | undefined;
                      isAsync?: boolean | undefined;
                      isExported?: boolean | undefined;
                    }[]
                  | undefined;
                classes?:
                  | {
                      name: string;
                      lineNumber: number;
                      description?: string | undefined;
                      isExported?: boolean | undefined;
                      methods?: string[] | undefined;
                      extends?: string | undefined;
                      implements?: string[] | undefined;
                    }[]
                  | undefined;
                linesOfCode?: number | undefined;
              }
            >;
            dependencies: z.ZodDefault<
              z.ZodArray<
                z.ZodObject<
                  {
                    name: z.ZodString;
                    version: z.ZodUnion<[z.ZodString, z.ZodString]>;
                    type: z.ZodDefault<
                      z.ZodEnum<['development', 'production', 'peer', 'optional']>
                    >;
                    description: z.ZodOptional<z.ZodString>;
                    homepage: z.ZodOptional<z.ZodString>;
                    repository: z.ZodOptional<z.ZodString>;
                  },
                  'strip',
                  z.ZodTypeAny,
                  {
                    type: 'production' | 'development' | 'peer' | 'optional';
                    name: string;
                    version: string;
                    description?: string | undefined;
                    homepage?: string | undefined;
                    repository?: string | undefined;
                  },
                  {
                    name: string;
                    version: string;
                    type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                    description?: string | undefined;
                    homepage?: string | undefined;
                    repository?: string | undefined;
                  }
                >,
                'many'
              >
            >;
            fileTypes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            summary: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
          },
          'strip',
          z.ZodTypeAny,
          {
            path: string;
            name: string;
            dependencies: {
              type: 'production' | 'development' | 'peer' | 'optional';
              name: string;
              version: string;
              description?: string | undefined;
              homepage?: string | undefined;
              repository?: string | undefined;
            }[];
            frameworks: {
              name: string;
              confidence: number;
              category?:
                | 'frontend'
                | 'backend'
                | 'testing'
                | 'build-tools'
                | 'database'
                | 'devops'
                | 'mobile'
                | 'desktop'
                | 'game'
                | 'ai-ml'
                | 'other'
                | undefined;
              description?: string | undefined;
              version?: string | undefined;
            }[];
            languages: string[];
            fileCount: number;
            directoryCount: number;
            createdAt: Date;
            updatedAt: Date;
            codeAnalysis: {
              functions: {
                name: string;
                lineNumber: number;
                parameters: string[];
                isAsync: boolean;
                isExported: boolean;
                description?: string | undefined;
                returnType?: string | undefined;
              }[];
              classes: {
                name: string;
                lineNumber: number;
                isExported: boolean;
                methods: string[];
                implements: string[];
                description?: string | undefined;
                extends?: string | undefined;
              }[];
              complexity: {
                cyclomaticComplexity: number;
                maintainabilityIndex: number;
                technicalDebt: string;
                codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
                testCoverage?: number | undefined;
                documentationCoverage?: number | undefined;
              };
              linesOfCode: number;
            };
            fileTypes: Record<string, number>;
            description?: string | undefined;
            language?: string | null | undefined;
            totalSize?: number | undefined;
            id?: string | undefined;
            summary?: string | undefined;
          },
          {
            path: string;
            name: string;
            fileCount: number;
            directoryCount: number;
            codeAnalysis: {
              complexity: {
                cyclomaticComplexity?: number | undefined;
                maintainabilityIndex?: number | undefined;
                technicalDebt?: string | undefined;
                codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                testCoverage?: number | undefined;
                documentationCoverage?: number | undefined;
              };
              functions?:
                | {
                    name: string;
                    lineNumber: number;
                    description?: string | undefined;
                    parameters?: string[] | undefined;
                    returnType?: string | undefined;
                    isAsync?: boolean | undefined;
                    isExported?: boolean | undefined;
                  }[]
                | undefined;
              classes?:
                | {
                    name: string;
                    lineNumber: number;
                    description?: string | undefined;
                    isExported?: boolean | undefined;
                    methods?: string[] | undefined;
                    extends?: string | undefined;
                    implements?: string[] | undefined;
                  }[]
                | undefined;
              linesOfCode?: number | undefined;
            };
            description?: string | undefined;
            language?: string | null | undefined;
            totalSize?: number | undefined;
            dependencies?:
              | {
                  name: string;
                  version: string;
                  type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                  description?: string | undefined;
                  homepage?: string | undefined;
                  repository?: string | undefined;
                }[]
              | undefined;
            frameworks?:
              | {
                  name: string;
                  category?:
                    | 'frontend'
                    | 'backend'
                    | 'testing'
                    | 'build-tools'
                    | 'database'
                    | 'devops'
                    | 'mobile'
                    | 'desktop'
                    | 'game'
                    | 'ai-ml'
                    | 'other'
                    | undefined;
                  description?: string | undefined;
                  version?: string | undefined;
                  confidence?: number | undefined;
                }[]
              | undefined;
            id?: string | undefined;
            languages?: string[] | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            fileTypes?: Record<string, number> | undefined;
            summary?: string | undefined;
          }
        >,
        'many'
      >
    >;
    totalCount: z.ZodDefault<z.ZodNumber>;
    lastUpdated: z.ZodDefault<z.ZodDate>;
    version: z.ZodDefault<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    version: string;
    repositories: {
      path: string;
      name: string;
      dependencies: {
        type: 'production' | 'development' | 'peer' | 'optional';
        name: string;
        version: string;
        description?: string | undefined;
        homepage?: string | undefined;
        repository?: string | undefined;
      }[];
      frameworks: {
        name: string;
        confidence: number;
        category?:
          | 'frontend'
          | 'backend'
          | 'testing'
          | 'build-tools'
          | 'database'
          | 'devops'
          | 'mobile'
          | 'desktop'
          | 'game'
          | 'ai-ml'
          | 'other'
          | undefined;
        description?: string | undefined;
        version?: string | undefined;
      }[];
      languages: string[];
      fileCount: number;
      directoryCount: number;
      createdAt: Date;
      updatedAt: Date;
      codeAnalysis: {
        functions: {
          name: string;
          lineNumber: number;
          parameters: string[];
          isAsync: boolean;
          isExported: boolean;
          description?: string | undefined;
          returnType?: string | undefined;
        }[];
        classes: {
          name: string;
          lineNumber: number;
          isExported: boolean;
          methods: string[];
          implements: string[];
          description?: string | undefined;
          extends?: string | undefined;
        }[];
        complexity: {
          cyclomaticComplexity: number;
          maintainabilityIndex: number;
          technicalDebt: string;
          codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
          testCoverage?: number | undefined;
          documentationCoverage?: number | undefined;
        };
        linesOfCode: number;
      };
      fileTypes: Record<string, number>;
      description?: string | undefined;
      language?: string | null | undefined;
      totalSize?: number | undefined;
      id?: string | undefined;
      summary?: string | undefined;
    }[];
    totalCount: number;
    lastUpdated: Date;
  },
  {
    version?: string | undefined;
    repositories?:
      | {
          path: string;
          name: string;
          fileCount: number;
          directoryCount: number;
          codeAnalysis: {
            complexity: {
              cyclomaticComplexity?: number | undefined;
              maintainabilityIndex?: number | undefined;
              technicalDebt?: string | undefined;
              codeQuality?: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
              testCoverage?: number | undefined;
              documentationCoverage?: number | undefined;
            };
            functions?:
              | {
                  name: string;
                  lineNumber: number;
                  description?: string | undefined;
                  parameters?: string[] | undefined;
                  returnType?: string | undefined;
                  isAsync?: boolean | undefined;
                  isExported?: boolean | undefined;
                }[]
              | undefined;
            classes?:
              | {
                  name: string;
                  lineNumber: number;
                  description?: string | undefined;
                  isExported?: boolean | undefined;
                  methods?: string[] | undefined;
                  extends?: string | undefined;
                  implements?: string[] | undefined;
                }[]
              | undefined;
            linesOfCode?: number | undefined;
          };
          description?: string | undefined;
          language?: string | null | undefined;
          totalSize?: number | undefined;
          dependencies?:
            | {
                name: string;
                version: string;
                type?: 'production' | 'development' | 'peer' | 'optional' | undefined;
                description?: string | undefined;
                homepage?: string | undefined;
                repository?: string | undefined;
              }[]
            | undefined;
          frameworks?:
            | {
                name: string;
                category?:
                  | 'frontend'
                  | 'backend'
                  | 'testing'
                  | 'build-tools'
                  | 'database'
                  | 'devops'
                  | 'mobile'
                  | 'desktop'
                  | 'game'
                  | 'ai-ml'
                  | 'other'
                  | undefined;
                description?: string | undefined;
                version?: string | undefined;
                confidence?: number | undefined;
              }[]
            | undefined;
          id?: string | undefined;
          languages?: string[] | undefined;
          createdAt?: Date | undefined;
          updatedAt?: Date | undefined;
          fileTypes?: Record<string, number> | undefined;
          summary?: string | undefined;
        }[]
      | undefined;
    totalCount?: number | undefined;
    lastUpdated?: Date | undefined;
  }
>;
/**
 * Schema for provider configuration
 */
export declare const providerConfigSchema: z.ZodObject<
  {
    name: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    temperature: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    maxTokens: number;
    temperature: number;
    enabled: boolean;
    model?: string | undefined;
    apiKey?: string | undefined;
  },
  {
    name: string;
    model?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    apiKey?: string | undefined;
    enabled?: boolean | undefined;
  }
>;
