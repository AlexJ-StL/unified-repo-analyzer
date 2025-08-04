/**
 * File system utilities for repository discovery and traversal
 */
import { DirectoryInfo } from '@unified-repo-analyzer/shared/src/types/repository';
/**
 * Options for directory traversal
 */
export interface TraversalOptions {
    /**
     * Maximum depth to traverse (0 = unlimited)
     */
    maxDepth?: number;
    /**
     * Maximum number of files to process
     */
    maxFiles?: number;
    /**
     * Ignore patterns (gitignore format)
     */
    ignorePatterns?: string[];
    /**
     * Custom function to determine if a file should be included
     */
    fileFilter?: (filePath: string) => boolean;
}
/**
 * Result of directory traversal
 */
export interface TraversalResult {
    /**
     * List of discovered files
     */
    files: string[];
    /**
     * List of discovered directories
     */
    directories: string[];
    /**
     * Total size of all files in bytes
     */
    totalSize: number;
    /**
     * Files that were skipped due to errors
     */
    skippedFiles: {
        path: string;
        error: string;
    }[];
}
/**
 * Error types for file system operations
 */
export declare enum FileSystemErrorType {
    PERMISSION_DENIED = "PERMISSION_DENIED",
    NOT_FOUND = "NOT_FOUND",
    INVALID_PATH = "INVALID_PATH",
    READ_ERROR = "READ_ERROR",
    UNKNOWN = "UNKNOWN"
}
/**
 * Custom error class for file system operations
 */
export declare class FileSystemError extends Error {
    type: FileSystemErrorType;
    path: string;
    constructor(message: string, type: FileSystemErrorType, filePath: string);
}
/**
 * Traverses a directory recursively with configurable options
 *
 * @param dirPath - Path to the directory to traverse
 * @param options - Traversal options
 * @returns Promise resolving to traversal result
 */
export declare function traverseDirectory(dirPath: string, options?: TraversalOptions): Promise<TraversalResult>;
/**
 * Reads a file with error handling
 *
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: 'utf8')
 * @returns Promise resolving to file content
 */
export declare function readFileWithErrorHandling(filePath: string, encoding?: BufferEncoding): Promise<string>;
/**
 * Gets common ignore patterns for repository analysis
 *
 * @returns Array of common ignore patterns
 */
export declare function getCommonIgnorePatterns(): string[];
/**
 * Reads and parses .gitignore file if it exists
 *
 * @param repoPath - Path to the repository
 * @returns Promise resolving to array of ignore patterns
 */
export declare function readGitignore(repoPath: string): Promise<string[]>;
/**
 * Combines custom ignore patterns with .gitignore patterns
 *
 * @param repoPath - Path to the repository
 * @param customPatterns - Custom ignore patterns
 * @returns Promise resolving to combined ignore patterns
 */
export declare function getCombinedIgnorePatterns(repoPath: string, customPatterns?: string[]): Promise<string[]>;
/**
 * Extracts directory information for repository analysis
 *
 * @param traversalResult - Result of directory traversal
 * @param basePath - Base path of the repository
 * @returns Array of directory information
 */
export declare function extractDirectoryInfo(traversalResult: TraversalResult, basePath: string): DirectoryInfo[];
