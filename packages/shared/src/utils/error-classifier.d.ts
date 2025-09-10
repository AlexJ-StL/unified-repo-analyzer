import {
  type ClassifiedError,
  type ErrorContext,
  type ErrorCorrelation,
  type ErrorResponse,
  type ErrorStatistics,
} from '../types/error-classification.js';
/**
 * Error classification service for unified-repo-analyzer
 * Implements error type definitions, categorization, and correlation tracking
 * Requirements: 3.3, 4.5, 5.5
 */
/**
 * Error classification service
 */
export declare class ErrorClassifier {
  private static instance;
  private errorHistory;
  private correlationMap;
  private readonly maxHistorySize;
  private constructor();
  /**
   * Get singleton instance
   */
  static getInstance(): ErrorClassifier;
  /**
   * Classify an error and return a structured error object
   */
  classifyError(
    error: Error | string,
    context?: Partial<ErrorContext>,
    parentErrorId?: string
  ): ClassifiedError;
  /**
   * Create an error response for API endpoints
   */
  createErrorResponse(classifiedError: ClassifiedError, includeContext?: boolean): ErrorResponse;
  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(timeRange?: { start: Date; end: Date }): ErrorStatistics;
  /**
   * Get correlated errors for a given correlation ID
   */
  getCorrelatedErrors(correlationId: string): ErrorCorrelation | null;
  /**
   * Mark an error as resolved
   */
  resolveError(errorId: string, resolution: string): boolean;
  /**
   * Clear error history (for testing or maintenance)
   */
  clearHistory(): void;
  /**
   * Determine error code and category from error message and context
   */
  private determineErrorCodeAndCategory;
  /**
   * Determine error severity based on code and context
   */
  private determineSeverity;
  /**
   * Generate user-friendly error title
   */
  private generateErrorTitle;
  /**
   * Enhance error message with additional context
   */
  private enhanceErrorMessage;
  /**
   * Generate error details based on code and context
   */
  private generateErrorDetails;
  /**
   * Generate actionable suggestions based on error code and context
   */
  private generateSuggestions;
  /**
   * Get learn more URL for specific error codes
   */
  private getLearnMoreUrl;
  /**
   * Enrich context with additional system information
   */
  private enrichContext;
  /**
   * Sanitize context for API responses (remove sensitive data)
   */
  private sanitizeContext;
  /**
   * Add error to history with size management
   */
  private addToHistory;
  /**
   * Update correlation mapping
   */
  private updateCorrelationMapping;
  /**
   * Link error to parent error
   */
  private linkToParentError;
  /**
   * Group errors by category for statistics
   */
  private groupByCategory;
  /**
   * Group errors by severity for statistics
   */
  private groupBySeverity;
  /**
   * Group errors by code for statistics
   */
  private groupByCode;
  /**
   * Get most common errors for statistics
   */
  private getMostCommonErrors;
  /**
   * Determine root cause from related errors
   */
  private determineRootCause;
  /**
   * Get platform display name
   */
  private getPlatformDisplayName;
}
export declare const errorClassifier: ErrorClassifier;
export default errorClassifier;
