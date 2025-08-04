/**
 * Language detection utilities for repository analysis
 */
/**
 * Language information
 */
export interface LanguageInfo {
    /**
     * Language name
     */
    name: string;
    /**
     * Associated file extensions
     */
    extensions: string[];
    /**
     * Associated filenames
     */
    filenames?: string[];
    /**
     * Associated shebang patterns
     */
    shebangs?: string[];
    /**
     * Associated frameworks
     */
    frameworks?: {
        name: string;
        files: string[];
        dependencies?: string[];
    }[];
}
/**
 * Common programming languages with their extensions and associated files
 */
export declare const LANGUAGES: LanguageInfo[];
/**
 * Detects language based on file extension and name
 *
 * @param filePath - Path to the file
 * @returns Detected language name or 'Unknown'
 */
export declare function detectLanguageFromPath(filePath: string): string;
/**
 * Detects language based on file content (shebang)
 *
 * @param content - File content
 * @returns Detected language name or null if not detected
 */
export declare function detectLanguageFromShebang(content: string): string | null;
/**
 * Detects language based on file path and content
 *
 * @param filePath - Path to the file
 * @param content - Optional file content
 * @returns Promise resolving to detected language name
 */
export declare function detectLanguage(filePath: string, content?: string): Promise<string>;
/**
 * Detects frameworks used in a repository based on file patterns and dependencies
 *
 * @param files - List of files in the repository
 * @param packageJsonPath - Optional path to package.json for Node.js projects
 * @returns Promise resolving to list of detected frameworks
 */
export declare function detectFrameworks(files: string[], packageJsonPath?: string): Promise<{
    name: string;
    confidence: number;
}[]>;
