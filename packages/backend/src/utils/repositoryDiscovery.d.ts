/**
 * Repository discovery and analysis utilities
 */
import { AnalysisOptions, RepositoryAnalysis } from '@unified-repo-analyzer/shared/src/types/analysis';
/**
 * Repository discovery options
 */
export interface RepositoryDiscoveryOptions {
    /**
     * Maximum number of files to process
     */
    maxFiles?: number;
    /**
     * Maximum number of lines per file
     */
    maxLinesPerFile?: number;
    /**
     * Custom ignore patterns
     */
    ignorePatterns?: string[];
    /**
     * Whether to include file content in the result
     */
    includeContent?: boolean;
    /**
     * Whether to include file tree in the result
     */
    includeTree?: boolean;
}
/**
 * Discovers and analyzes a repository
 *
 * @param repoPath - Path to the repository
 * @param options - Discovery options
 * @returns Promise resolving to repository analysis
 */
export declare function discoverRepository(repoPath: string, options?: RepositoryDiscoveryOptions): Promise<RepositoryAnalysis>;
/**
 * Generates a simple file tree representation
 *
 * @param basePath - Base path of the repository
 * @param files - List of files
 * @returns String representation of the file tree
 */
export declare function generateFileTree(basePath: string, files: string[]): string;
/**
 * Converts analysis options to repository discovery options
 *
 * @param options - Analysis options
 * @returns Repository discovery options
 */
export declare function analysisOptionsToDiscoveryOptions(options: AnalysisOptions): RepositoryDiscoveryOptions;
