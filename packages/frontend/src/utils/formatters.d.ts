/**
 * Format file size in bytes to a human-readable string
 */
export declare const formatFileSize: (bytes: number) => string;
/**
 * Format date string to a human-readable format
 */
export declare const formatDate: (dateString: string) => string;
/**
 * Truncate text to a specified length
 */
export declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Convert camelCase to Title Case
 */
export declare const camelToTitleCase: (camelCase: string) => string;
/**
 * Get file extension from path
 */
export declare const getFileExtension: (path: string) => string;
/**
 * Get language from file extension
 */
export declare const getLanguageFromExtension: (extension: string) => string;
