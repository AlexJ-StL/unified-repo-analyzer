/**
 * Validation utility functions
 */
import { z } from 'zod';
/**
 * Validates data against a schema and returns the validated data or throws an error
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
export declare function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T>;
/**
 * Validates data against a schema and returns a result object
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Object with success flag, validated data, and any errors
 */
export declare function validateSafe<T extends z.ZodType>(schema: T, data: unknown): {
    success: boolean;
    data?: z.infer<T>;
    errors?: z.ZodError;
};
/**
 * Validates repository analysis data
 * @param data Repository analysis data to validate
 * @returns Validated repository analysis data
 */
export declare function validateRepositoryAnalysis(data: unknown): {
    id: string;
    path: string;
    name: string;
    language: string;
    languages: string[];
    frameworks: string[];
    fileCount: number;
    directoryCount: number;
    totalSize: number;
    createdAt: Date;
    updatedAt: Date;
    structure: {
        directories: {
            path: string;
            files: number;
            subdirectories: number;
            role?: string | undefined;
        }[];
        keyFiles: {
            path: string;
            language: string;
            size: number;
            lineCount: number;
            importance: number;
            functions: {
                name: string;
                lineNumber: number;
                parameters: string[];
                description?: string | undefined;
            }[];
            classes: {
                name: string;
                lineNumber: number;
                methods: string[];
                description?: string | undefined;
            }[];
            tokenCount?: number | undefined;
            description?: string | undefined;
            useCase?: string | undefined;
        }[];
        tree: string;
    };
    codeAnalysis: {
        functionCount: number;
        classCount: number;
        importCount: number;
        complexity: {
            cyclomaticComplexity: number;
            maintainabilityIndex: number;
            technicalDebt: string;
            codeQuality: "good" | "poor" | "excellent" | "fair";
        };
        patterns: {
            name: string;
            confidence: number;
            description: string;
        }[];
    };
    dependencies: {
        production: any[];
        development: any[];
        frameworks: any[];
    };
    insights: {
        executiveSummary: string;
        technicalBreakdown: string;
        recommendations: string[];
        potentialIssues: string[];
    };
    metadata: {
        analysisMode: "standard" | "quick" | "comprehensive";
        processingTime: number;
        llmProvider?: string | undefined;
        tokenUsage?: {
            prompt: number;
            completion: number;
            total: number;
        } | undefined;
    };
    description?: string | undefined;
};
/**
 * Validates file info data
 * @param data File info data to validate
 * @returns Validated file info data
 */
export declare function validateFileInfo(data: unknown): {
    path: string;
    language: string;
    size: number;
    lineCount: number;
    importance: number;
    functions: {
        name: string;
        lineNumber: number;
        parameters: string[];
        description?: string | undefined;
    }[];
    classes: {
        name: string;
        lineNumber: number;
        methods: string[];
        description?: string | undefined;
    }[];
    tokenCount?: number | undefined;
    description?: string | undefined;
    useCase?: string | undefined;
};
/**
 * Validates analysis options data
 * @param data Analysis options data to validate
 * @returns Validated analysis options data
 */
export declare function validateAnalysisOptions(data: unknown): {
    mode: "standard" | "quick" | "comprehensive";
    maxFiles: number;
    maxLinesPerFile: number;
    includeLLMAnalysis: boolean;
    llmProvider: string;
    outputFormats: ("html" | "json" | "markdown")[];
    includeTree: boolean;
};
/**
 * Validates repository index data
 * @param data Repository index data to validate
 * @returns Validated repository index data
 */
export declare function validateRepositoryIndex(data: unknown): {
    repositories: {
        id: string;
        name: string;
        path: string;
        languages: string[];
        frameworks: string[];
        tags: string[];
        summary: string;
        lastAnalyzed: Date;
        size: number;
        complexity: number;
    }[];
    relationships: {
        sourceId: string;
        targetId: string;
        type: "similar" | "complementary" | "dependency" | "fork";
        strength: number;
        reason: string;
    }[];
    tags: {
        id: string;
        name: string;
        category?: string | undefined;
        color?: string | undefined;
    }[];
    lastUpdated: Date;
};
/**
 * Validates search query data
 * @param data Search query data to validate
 * @returns Validated search query data
 */
export declare function validateSearchQuery(data: unknown): {
    languages?: string[] | undefined;
    frameworks?: string[] | undefined;
    keywords?: string[] | undefined;
    fileTypes?: string[] | undefined;
    dateRange?: {
        start: Date;
        end: Date;
    } | undefined;
};
/**
 * Validates LLM provider config data
 * @param data LLM provider config data to validate
 * @returns Validated LLM provider config data
 */
export declare function validateProviderConfig(data: unknown): {
    apiKey?: string | undefined;
    model?: string | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
};
