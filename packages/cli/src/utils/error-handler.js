"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIError = exports.ErrorType = void 0;
exports.handleError = handleError;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Error types for CLI operations
 */
var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["FILESYSTEM"] = "FILESYSTEM";
    ErrorType["VALIDATION"] = "VALIDATION";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorType["UNKNOWN"] = "UNKNOWN";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
/**
 * Custom error class for CLI operations
 */
class CLIError extends Error {
    type;
    constructor(message, type = ErrorType.UNKNOWN) {
        super(message);
        this.name = 'CLIError';
        this.type = type;
    }
}
exports.CLIError = CLIError;
/**
 * Handle errors in a user-friendly way
 */
function handleError(error) {
    if (error instanceof CLIError) {
        printFormattedError(error.message, error.type);
    }
    else if (error instanceof Error) {
        printFormattedError(error.message);
    }
    else {
        printFormattedError('An unknown error occurred');
    }
    // Exit with error code in production
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}
/**
 * Print a formatted error message
 */
function printFormattedError(message, type = ErrorType.UNKNOWN) {
    const errorPrefix = chalk_1.default.red.bold('ERROR');
    const typeText = type !== ErrorType.UNKNOWN ? chalk_1.default.yellow(`[${type}]`) : '';
    console.error(`\n${errorPrefix} ${typeText} ${message}`);
    // Add helpful suggestions based on error type
    switch (type) {
        case ErrorType.NETWORK:
            console.error(chalk_1.default.gray('Suggestion: Check your internet connection and API endpoint configuration.'));
            break;
        case ErrorType.FILESYSTEM:
            console.error(chalk_1.default.gray('Suggestion: Verify the file path exists and you have proper permissions.'));
            break;
        case ErrorType.VALIDATION:
            console.error(chalk_1.default.gray('Suggestion: Check your input parameters and configuration values.'));
            break;
        case ErrorType.AUTHENTICATION:
            console.error(chalk_1.default.gray('Suggestion: Verify your API key or credentials are correctly configured.'));
            break;
    }
}
//# sourceMappingURL=error-handler.js.map