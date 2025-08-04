/**
 * Error types for CLI operations
 */
export declare enum ErrorType {
    NETWORK = "NETWORK",
    FILESYSTEM = "FILESYSTEM",
    VALIDATION = "VALIDATION",
    AUTHENTICATION = "AUTHENTICATION",
    UNKNOWN = "UNKNOWN"
}
/**
 * Custom error class for CLI operations
 */
export declare class CLIError extends Error {
    type: ErrorType;
    constructor(message: string, type?: ErrorType);
}
/**
 * Handle errors in a user-friendly way
 */
export declare function handleError(error: unknown): void;
