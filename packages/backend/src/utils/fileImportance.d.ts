/**
 * File importance scoring algorithm for repository analysis
 */
/**
 * Importance score factors
 */
export interface ImportanceFactors {
    /**
     * Base score for the file
     */
    baseScore: number;
    /**
     * Score based on file location
     */
    locationScore: number;
    /**
     * Score based on file type
     */
    typeScore: number;
    /**
     * Score based on file name
     */
    nameScore: number;
    /**
     * Score based on file size
     */
    sizeScore: number;
}
/**
 * Important file patterns by category
 */
export declare const IMPORTANT_FILE_PATTERNS: {
    config: string[];
    documentation: string[];
    entryPoint: string[];
    test: string[];
    core: string[];
};
/**
 * Important file extensions by language
 */
export declare const IMPORTANT_EXTENSIONS: {
    js: string[];
    python: string[];
    jvm: string[];
    dotnet: string[];
    go: string[];
    rust: string[];
    ruby: string[];
    php: string[];
    swift: string[];
    cpp: string[];
    web: string[];
    data: string[];
    docs: string[];
};
/**
 * Calculates importance score for a file
 *
 * @param filePath - Path to the file
 * @param fileSize - Size of the file in bytes
 * @param repoPath - Base path of the repository
 * @returns Importance score between 0 and 1
 */
export declare function calculateFileImportance(filePath: string, fileSize: number, repoPath: string): number;
/**
 * Calculates detailed importance factors for a file
 *
 * @param filePath - Path to the file
 * @param fileSize - Size of the file in bytes
 * @param repoPath - Base path of the repository
 * @returns Importance factors
 */
export declare function calculateImportanceFactors(filePath: string, fileSize: number, repoPath: string): ImportanceFactors;
/**
 * Sorts files by importance score
 *
 * @param files - Array of file paths
 * @param repoPath - Base path of the repository
 * @param fileSizes - Map of file sizes
 * @returns Sorted array of files with importance scores
 */
export declare function sortFilesByImportance(files: string[], repoPath: string, fileSizes: Map<string, number>): {
    path: string;
    importance: number;
}[];
