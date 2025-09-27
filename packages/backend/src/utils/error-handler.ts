/**
 * Comprehensive error handling utilities
 */

import type { Request } from 'express';
import logger from '../services/logger.service.js';

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  FILE_SYSTEM = 'FILE_SYSTEM',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  INTERNAL = 'INTERNAL',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Enhanced error interface
 */
export interface EnhancedError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  statusCode: number;
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
  context?: Record<string, unknown>;
  requestId?: string;
  timestamp: Date;
  recoverable: boolean;
}

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<ErrorCategory, { message: string; suggestions: string[] }> = {
  [ErrorCategory.VALIDATION]: {
    message: 'The provided data is invalid or incomplete.',
    suggestions: [
      'Check that all required fields are provided',
      'Verify data formats match the expected types',
      'Review the API documentation for correct parameter formats',
    ],
  },
  [ErrorCategory.AUTHENTICATION]: {
    message: 'Authentication is required to access this resource.',
    suggestions: [
      'Ensure you have provided valid API credentials',
      'Check if your API key is correctly configured',
      'Verify that your authentication token has not expired',
    ],
  },
  [ErrorCategory.AUTHORIZATION]: {
    message: 'You do not have permission to perform this action.',
    suggestions: [
      'Contact your administrator to request the necessary permissions',
      'Verify you are accessing the correct resource',
      'Check if your account has the required role or privileges',
    ],
  },
  [ErrorCategory.NOT_FOUND]: {
    message: 'The requested resource could not be found.',
    suggestions: [
      'Verify the resource ID or path is correct',
      'Check if the resource has been moved or deleted',
      'Ensure you have permission to access this resource',
    ],
  },
  [ErrorCategory.CONFLICT]: {
    message: 'The request conflicts with the current state of the resource.',
    suggestions: [
      'Refresh the resource and try again',
      'Check if another process is modifying the same resource',
      'Verify the resource state before making changes',
    ],
  },
  [ErrorCategory.RATE_LIMIT]: {
    message: 'Too many requests have been made. Please slow down.',
    suggestions: [
      'Wait a moment before making another request',
      'Implement exponential backoff in your client',
      'Consider upgrading your rate limit if available',
    ],
  },
  [ErrorCategory.EXTERNAL_SERVICE]: {
    message: 'An external service is currently unavailable.',
    suggestions: [
      'Try again in a few moments',
      'Check the status of external services',
      'Contact support if the issue persists',
    ],
  },
  [ErrorCategory.DATABASE]: {
    message: 'A database error occurred while processing your request.',
    suggestions: [
      'Try the operation again',
      'Check if the database is accessible',
      'Contact support if the problem continues',
    ],
  },
  [ErrorCategory.FILE_SYSTEM]: {
    message: 'A file system error occurred.',
    suggestions: [
      'Check if the file or directory exists',
      'Verify you have the necessary permissions',
      'Ensure there is sufficient disk space',
    ],
  },
  [ErrorCategory.NETWORK]: {
    message: 'A network error occurred while processing your request.',
    suggestions: [
      'Check your internet connection',
      'Try the request again',
      'Verify network connectivity to external services',
    ],
  },
  [ErrorCategory.TIMEOUT]: {
    message: 'The operation took too long to complete.',
    suggestions: [
      'Try the operation again',
      'Consider breaking large operations into smaller chunks',
      'Check if the system is under heavy load',
    ],
  },
  [ErrorCategory.INTERNAL]: {
    message: 'An unexpected error occurred. Our team has been notified.',
    suggestions: [
      'Try the operation again',
      'Contact support if the issue persists',
      'Check the system status page for known issues',
    ],
  },
};

/**
 * Create an enhanced error with user-friendly messaging
 */
export function createEnhancedError(
  category: ErrorCategory,
  severity: ErrorSeverity,
  technicalMessage: string,
  statusCode = 500,
  context?: Record<string, unknown>,
  requestId?: string
): EnhancedError {
  const errorInfo = ERROR_MESSAGES[category];
  const timestamp = new Date();

  const error = new Error(technicalMessage) as EnhancedError;
  error.category = category;
  error.severity = severity;
  error.statusCode = statusCode;
  error.userMessage = errorInfo.message;
  error.technicalMessage = technicalMessage;
  error.suggestions = errorInfo.suggestions;
  error.context = context;
  error.requestId = requestId;
  error.timestamp = timestamp;
  error.recoverable = severity !== ErrorSeverity.CRITICAL;

  return error;
}

/**
 * Handle and log errors with appropriate detail level
 */
export function handleError(
  error: Error | EnhancedError,
  req?: Request,
  additionalContext?: Record<string, unknown>
): EnhancedError {
  const requestId = (req?.headers['x-request-id'] as string) || 'unknown';

  // If it's already an enhanced error, just log and return
  if (isEnhancedError(error)) {
    logError(error, req, additionalContext);
    return error;
  }

  // Convert regular error to enhanced error
  const enhancedError = categorizeError(error, requestId, additionalContext);
  logError(enhancedError, req, additionalContext);

  return enhancedError;
}

/**
 * Check if error is already enhanced
 */
function isEnhancedError(error: Error): error is EnhancedError {
  return 'category' in error && 'severity' in error;
}

/**
 * Categorize regular errors into enhanced errors
 */
function categorizeError(
  error: Error,
  requestId: string,
  context?: Record<string, unknown>
): EnhancedError {
  // File system errors
  if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
    return createEnhancedError(
      ErrorCategory.FILE_SYSTEM,
      ErrorSeverity.MEDIUM,
      error.message,
      404,
      context,
      requestId
    );
  }

  if (error.message.includes('EACCES') || error.message.includes('permission denied')) {
    return createEnhancedError(
      ErrorCategory.FILE_SYSTEM,
      ErrorSeverity.MEDIUM,
      error.message,
      403,
      context,
      requestId
    );
  }

  // Network errors
  if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
    return createEnhancedError(
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      error.message,
      503,
      context,
      requestId
    );
  }

  // Timeout errors
  if (error.message.includes('timeout') || error.name === 'TimeoutError') {
    return createEnhancedError(
      ErrorCategory.TIMEOUT,
      ErrorSeverity.MEDIUM,
      error.message,
      408,
      context,
      requestId
    );
  }

  // Validation errors
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return createEnhancedError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      error.message,
      400,
      context,
      requestId
    );
  }

  // Default to internal error
  return createEnhancedError(
    ErrorCategory.INTERNAL,
    ErrorSeverity.HIGH,
    error.message,
    500,
    context,
    requestId
  );
}

/**
 * Log error with appropriate detail level
 */
function logError(
  error: EnhancedError,
  req?: Request,
  additionalContext?: Record<string, unknown>
): void {
  const logContext = {
    category: error.category,
    severity: error.severity,
    statusCode: error.statusCode,
    requestId: error.requestId,
    timestamp: error.timestamp,
    recoverable: error.recoverable,
    userAgent: req?.get('User-Agent'),
    ip: req?.ip,
    method: req?.method,
    url: req?.originalUrl,
    ...error.context,
    ...additionalContext,
  };

  // Log based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error(`CRITICAL ERROR: ${error.technicalMessage}`, undefined, logContext);
      break;
    case ErrorSeverity.HIGH:
      logger.error(`HIGH SEVERITY: ${error.technicalMessage}`, undefined, logContext);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn(`MEDIUM SEVERITY: ${error.technicalMessage}`, logContext);
      break;
    case ErrorSeverity.LOW:
      logger.info(`LOW SEVERITY: ${error.technicalMessage}`, logContext);
      break;
  }
}

/**
 * Create error response for API
 */
export function createErrorResponse(error: EnhancedError, includeStack = false) {
  const response: {
    error: {
      category: ErrorCategory;
      message: string;
      suggestions: string[];
      requestId?: string;
      timestamp: Date;
      recoverable: boolean;
      technicalMessage?: string;
      context?: Record<string, unknown>;
      stack?: string;
    };
  } = {
    error: {
      category: error.category,
      message: error.userMessage,
      suggestions: error.suggestions,
      requestId: error.requestId,
      timestamp: error.timestamp,
      recoverable: error.recoverable,
    },
  };

  // Include technical details in development
  if (process.env.NODE_ENV === 'development') {
    response.error.technicalMessage = error.technicalMessage;
    response.error.context = error.context;

    if (includeStack && error.stack) {
      response.error.stack = error.stack;
    }
  }

  return response;
}

/**
 * Graceful degradation wrapper
 */
export async function withGracefulDegradation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = 'Operation failed, using fallback'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const enhancedError = handleError(error as Error);

    // Only use fallback for recoverable errors
    if (enhancedError.recoverable) {
      logger.warn(`${errorMessage}: ${enhancedError.technicalMessage}`, {
        fallbackUsed: true,
        originalError: enhancedError.technicalMessage,
      });
      return fallback;
    }

    // Re-throw non-recoverable errors
    throw enhancedError;
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const enhancedError = handleError(lastError);

      // Don't retry non-recoverable errors
      if (!enhancedError.recoverable || attempt === maxRetries) {
        throw enhancedError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);

      logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, {
        error: enhancedError.technicalMessage,
        attempt,
        maxRetries,
        delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (lastError) throw lastError;
  throw new Error('No error to rethrow');
}

/**
 * Circuit breaker pattern for external services
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw createEnhancedError(
          ErrorCategory.EXTERNAL_SERVICE,
          ErrorSeverity.HIGH,
          'Circuit breaker is OPEN - service unavailable',
          503
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}
