import chalk from 'chalk';

/**
 * Error types for CLI operations
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  FILESYSTEM = 'FILESYSTEM',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for CLI operations
 */
export class CLIError extends Error {
  type: ErrorType;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN) {
    super(message);
    this.name = 'CLIError';
    this.type = type;
  }
}

/**
 * Handle errors in a user-friendly way
 */
export function handleError(error: unknown): void {
  if (error instanceof CLIError) {
    printFormattedError(error.message, error.type);
  } else if (error instanceof Error) {
    printFormattedError(error.message);
  } else {
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
function printFormattedError(message: string, type: ErrorType = ErrorType.UNKNOWN): void {
  const errorPrefix = chalk.red.bold('ERROR');
  const typeText = type !== ErrorType.UNKNOWN ? chalk.yellow(`[${type}]`) : '';

  console.error(`\n${errorPrefix} ${typeText} ${message}`);

  // Add helpful suggestions based on error type
  switch (type) {
    case ErrorType.NETWORK:
      console.error(
        chalk.gray('Suggestion: Check your internet connection and API endpoint configuration.')
      );
      break;
    case ErrorType.FILESYSTEM:
      console.error(
        chalk.gray('Suggestion: Verify the file path exists and you have proper permissions.')
      );
      break;
    case ErrorType.VALIDATION:
      console.error(
        chalk.gray('Suggestion: Check your input parameters and configuration values.')
      );
      break;
    case ErrorType.AUTHENTICATION:
      console.error(
        chalk.gray('Suggestion: Verify your API key or credentials are correctly configured.')
      );
      break;
  }
}
