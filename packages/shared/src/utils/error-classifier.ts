import { randomUUID } from "node:crypto";
import { platform } from "node:os";

import {
  type ClassifiedError,
  ErrorCategory,
  ErrorCode,
  type ErrorContext,
  type ErrorCorrelation,
  type ErrorResponse,
  ErrorSeverity,
  type ErrorStatistics,
  type ErrorSuggestion
} from "../types/error-classification.js";

/**
 * Error classification service for unified-repo-analyzer
 * Implements error type definitions, categorization, and correlation tracking
 * Requirements: 3.3, 4.5, 5.5
 */

/**
 * Error classification service
 */
export class ErrorClassifier {
  private static instance: ErrorClassifier;
  private errorHistory: Map<string, ClassifiedError> = new Map();
  private correlationMap: Map<string, string[]> = new Map(); // correlationId -> errorIds
  private readonly maxHistorySize = 1000;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorClassifier {
    if (!ErrorClassifier.instance) {
      ErrorClassifier.instance = new ErrorClassifier();
    }
    return ErrorClassifier.instance;
  }

  /**
   * Classify an error and return a structured error object
   */
  public classifyError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
    parentErrorId?: string
  ): ClassifiedError {
    try {
      const errorMessage = typeof error === "string" ? error : error.message;
      const originalError = typeof error === "string" ? undefined : error;

      // Generate unique identifiers
      const errorId = randomUUID();
      const correlationId =
        context.correlationId || context.requestId || randomUUID();

      // Determine error code and category
      const { code, category } = this.determineErrorCodeAndCategory(
        errorMessage,
        context
      );

      // Determine severity
      const severity = this.determineSeverity(code, category, context);

      // Generate title and enhanced message
      const title = this.generateErrorTitle(code, category);
      const enhancedMessage = this.enhanceErrorMessage(
        errorMessage,
        code,
        context
      );

      // Generate suggestions
      const suggestions = this.generateSuggestions(code, category, context);

      // Create classified error
      const classifiedError: ClassifiedError = {
        id: errorId,
        code,
        category,
        severity,
        title,
        message: enhancedMessage,
        details: this.generateErrorDetails(code, context),
        context: this.enrichContext(context),
        timestamp: new Date(),
        originalError,
        stack: originalError?.stack,
        suggestions,
        learnMoreUrl: this.getLearnMoreUrl(code, category),
        correlationId,
        parentErrorId,
        childErrorIds: []
      };

      // Store in history
      this.addToHistory(classifiedError);

      // Update correlation mapping
      this.updateCorrelationMapping(correlationId, errorId);

      // Link to parent error if specified
      if (parentErrorId) {
        this.linkToParentError(parentErrorId, errorId);
      }

      return classifiedError;
    } catch (e) {
      // Fallback error classification if something goes wrong
      const fallbackError: ClassifiedError = {
        id:
          "fallback-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substr(2, 9),
        code: ErrorCode.INTERNAL_ERROR,
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        title: "Internal Error",
        message: typeof error === "string" ? error : error.message,
        context: this.enrichContext(context),
        timestamp: new Date(),
        originalError: typeof error === "string" ? undefined : error,
        stack:
          typeof error === "object" && error !== null
            ? (error as Error).stack
            : undefined,
        suggestions: [],
        correlationId:
          context.correlationId || context.requestId || "fallback-" + Date.now()
      };
      return fallbackError;
    }
  }

  /**
   * Create an error response for API endpoints
   */
  public createErrorResponse(
    classifiedError: ClassifiedError,
    includeContext = false
  ): ErrorResponse {
    return {
      error: {
        id: classifiedError.id,
        code: classifiedError.code,
        category: classifiedError.category,
        severity: classifiedError.severity,
        message: classifiedError.message,
        details: classifiedError.details,
        suggestions: classifiedError.suggestions,
        correlationId: classifiedError.correlationId,
        timestamp: classifiedError.timestamp.toISOString(),
        context: includeContext
          ? this.sanitizeContext(classifiedError.context)
          : undefined
      },
      requestId: classifiedError.context.requestId,
      path: classifiedError.context.path
    };
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStatistics(timeRange?: {
    start: Date;
    end: Date;
  }): ErrorStatistics {
    const errors = Array.from(this.errorHistory.values());
    const filteredErrors = timeRange
      ? errors.filter(
          (e) => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
        )
      : errors;

    const errorsByCategory = this.groupByCategory(filteredErrors);
    const errorsBySeverity = this.groupBySeverity(filteredErrors);
    const errorsByCode = this.groupByCode(filteredErrors);
    const mostCommonErrors = this.getMostCommonErrors(filteredErrors);

    return {
      totalErrors: filteredErrors.length,
      errorsByCategory,
      errorsBySeverity,
      errorsByCode,
      mostCommonErrors,
      timeRange: timeRange || {
        start: new Date(Math.min(...errors.map((e) => e.timestamp.getTime()))),
        end: new Date(Math.max(...errors.map((e) => e.timestamp.getTime())))
      }
    };
  }

  /**
   * Get correlated errors for a given correlation ID
   */
  public getCorrelatedErrors(correlationId: string): ErrorCorrelation | null {
    const errorIds = this.correlationMap.get(correlationId);
    if (!errorIds || errorIds.length === 0) {
      return null;
    }

    const relatedErrors = errorIds
      .map((id) => this.errorHistory.get(id))
      .filter((error): error is ClassifiedError => error !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (relatedErrors.length === 0) {
      return null;
    }

    // Determine root cause (first error or highest severity)
    const rootCause = this.determineRootCause(relatedErrors);

    // Create timeline
    const timeline = relatedErrors.map((error) => ({
      timestamp: error.timestamp,
      errorId: error.id,
      event: "created" as const
    }));

    return {
      correlationId,
      relatedErrors,
      rootCause,
      timeline
    };
  }

  /**
   * Mark an error as resolved
   */
  public resolveError(errorId: string, resolution: string): boolean {
    const error = this.errorHistory.get(errorId);
    if (!error) {
      return false;
    }

    error.resolved = true;
    error.resolvedAt = new Date();
    error.resolution = resolution;

    return true;
  }

  /**
   * Clear error history (for testing or maintenance)
   */
  public clearHistory(): void {
    this.errorHistory.clear();
    this.correlationMap.clear();
  }

  /**
   * Determine error code and category from error message and context
   */
  private determineErrorCodeAndCategory(
    message: string,
    context: Partial<ErrorContext>
  ): { code: ErrorCode; category: ErrorCategory } {
    const lowerMessage = message.toLowerCase();

    // Path-related errors
    if (
      lowerMessage.includes("path not found") ||
      lowerMessage.includes("no such file")
    ) {
      return {
        code: ErrorCode.PATH_NOT_FOUND,
        category: ErrorCategory.PATH_VALIDATION
      };
    }
    if (
      lowerMessage.includes("invalid path format") ||
      lowerMessage.includes("malformed path")
    ) {
      return {
        code: ErrorCode.PATH_INVALID_FORMAT,
        category: ErrorCategory.PATH_FORMAT
      };
    }
    if (
      lowerMessage.includes("path too long") ||
      lowerMessage.includes("filename too long")
    ) {
      return {
        code: ErrorCode.PATH_TOO_LONG,
        category: ErrorCategory.PATH_FORMAT
      };
    }
    if (
      lowerMessage.includes("reserved name") ||
      lowerMessage.includes("invalid name")
    ) {
      return {
        code: ErrorCode.PATH_RESERVED_NAME,
        category: ErrorCategory.PATH_FORMAT
      };
    }
    if (
      lowerMessage.includes("invalid characters") ||
      lowerMessage.includes("illegal character")
    ) {
      return {
        code: ErrorCode.PATH_INVALID_CHARACTERS,
        category: ErrorCategory.PATH_FORMAT
      };
    }
    if (
      lowerMessage.includes("permission denied") ||
      lowerMessage.includes("access denied")
    ) {
      if (lowerMessage.includes("read")) {
        return {
          code: ErrorCode.PERMISSION_READ_DENIED,
          category: ErrorCategory.PATH_PERMISSION
        };
      }
      if (lowerMessage.includes("write")) {
        return {
          code: ErrorCode.PERMISSION_WRITE_DENIED,
          category: ErrorCategory.PATH_PERMISSION
        };
      }
      return {
        code: ErrorCode.FILESYSTEM_ACCESS_DENIED,
        category: ErrorCategory.PATH_PERMISSION
      };
    }

    // Network errors
    if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("connection")
    ) {
      if (lowerMessage.includes("timeout")) {
        return {
          code: ErrorCode.NETWORK_TIMEOUT,
          category: ErrorCategory.NETWORK
        };
      }
      if (
        lowerMessage.includes("refused") ||
        lowerMessage.includes("rejected")
      ) {
        return {
          code: ErrorCode.NETWORK_CONNECTION_REFUSED,
          category: ErrorCategory.NETWORK
        };
      }
      if (lowerMessage.includes("unreachable")) {
        return {
          code: ErrorCode.NETWORK_UNREACHABLE,
          category: ErrorCategory.NETWORK
        };
      }
      return {
        code: ErrorCode.NETWORK_UNREACHABLE,
        category: ErrorCategory.NETWORK
      };
    }

    // Timeout errors
    if (
      lowerMessage.includes("timeout") ||
      lowerMessage.includes("timed out")
    ) {
      if (context.path) {
        return {
          code: ErrorCode.TIMEOUT_PATH_VALIDATION,
          category: ErrorCategory.TIMEOUT
        };
      }
      if (context.provider) {
        return {
          code: ErrorCode.TIMEOUT_LLM_REQUEST,
          category: ErrorCategory.LLM_TIMEOUT
        };
      }
      return {
        code: ErrorCode.TIMEOUT_OPERATION,
        category: ErrorCategory.TIMEOUT
      };
    }

    // HTTP errors
    if (context.statusCode) {
      const statusCode = context.statusCode;
      if (statusCode === 400) {
        return {
          code: ErrorCode.HTTP_BAD_REQUEST,
          category: ErrorCategory.HTTP_REQUEST
        };
      }
      if (statusCode === 401) {
        return {
          code: ErrorCode.HTTP_UNAUTHORIZED,
          category: ErrorCategory.HTTP_REQUEST
        };
      }
      if (statusCode === 403) {
        return {
          code: ErrorCode.HTTP_FORBIDDEN,
          category: ErrorCategory.HTTP_REQUEST
        };
      }
      if (statusCode === 404) {
        return {
          code: ErrorCode.HTTP_NOT_FOUND,
          category: ErrorCategory.HTTP_REQUEST
        };
      }
      if (statusCode === 429) {
        return {
          code: ErrorCode.HTTP_TOO_MANY_REQUESTS,
          category: ErrorCategory.HTTP_REQUEST
        };
      }
      if (statusCode >= 500) {
        return {
          code: ErrorCode.HTTP_INTERNAL_SERVER_ERROR,
          category: ErrorCategory.HTTP_RESPONSE
        };
      }
    }

    // LLM Provider errors
    if (context.provider) {
      if (lowerMessage.includes("quota") || lowerMessage.includes("limit")) {
        return {
          code: ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED,
          category: ErrorCategory.LLM_QUOTA
        };
      }
      if (
        lowerMessage.includes("authentication") ||
        lowerMessage.includes("unauthorized")
      ) {
        return {
          code: ErrorCode.LLM_PROVIDER_AUTHENTICATION_FAILED,
          category: ErrorCategory.LLM_PROVIDER
        };
      }
      if (lowerMessage.includes("rate limit")) {
        return {
          code: ErrorCode.LLM_PROVIDER_RATE_LIMITED,
          category: ErrorCategory.LLM_PROVIDER
        };
      }
      return {
        code: ErrorCode.LLM_PROVIDER_UNAVAILABLE,
        category: ErrorCategory.LLM_PROVIDER
      };
    }

    // File system errors
    if (
      lowerMessage.includes("not a directory") ||
      lowerMessage.includes("is not a directory")
    ) {
      return {
        code: ErrorCode.FILESYSTEM_NOT_DIRECTORY,
        category: ErrorCategory.FILESYSTEM
      };
    }
    if (
      lowerMessage.includes("disk full") ||
      lowerMessage.includes("no space")
    ) {
      return {
        code: ErrorCode.FILESYSTEM_DISK_FULL,
        category: ErrorCategory.FILESYSTEM
      };
    }

    // Validation errors
    if (
      lowerMessage.includes("validation") ||
      lowerMessage.includes("invalid input")
    ) {
      return {
        code: ErrorCode.VALIDATION_INPUT_INVALID,
        category: ErrorCategory.VALIDATION
      };
    }

    // Analysis errors
    if (lowerMessage.includes("analysis") || context.analysisType) {
      return {
        code: ErrorCode.ANALYSIS_FAILED,
        category: ErrorCategory.ANALYSIS
      };
    }

    // Operation cancelled
    if (
      lowerMessage.includes("cancelled") ||
      lowerMessage.includes("aborted")
    ) {
      return {
        code: ErrorCode.OPERATION_CANCELLED,
        category: ErrorCategory.SYSTEM
      };
    }

    // Default to unknown error
    return { code: ErrorCode.UNKNOWN_ERROR, category: ErrorCategory.SYSTEM };
  }

  /**
   * Determine error severity based on code and context
   */
  private determineSeverity(
    code: ErrorCode,
    _category: ErrorCategory,
    _context: Partial<ErrorContext>
  ): ErrorSeverity {
    // Critical errors
    if (
      [
        ErrorCode.SYSTEM_RESOURCE_EXHAUSTED,
        ErrorCode.SYSTEM_MEMORY_INSUFFICIENT,
        ErrorCode.FILESYSTEM_CORRUPTED,
        ErrorCode.PATH_NULL_BYTE
      ].includes(code)
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (
      [
        ErrorCode.PATH_NOT_FOUND,
        ErrorCode.PERMISSION_READ_DENIED,
        ErrorCode.PERMISSION_WRITE_DENIED,
        ErrorCode.FILESYSTEM_ACCESS_DENIED,
        ErrorCode.NETWORK_UNREACHABLE,
        ErrorCode.LLM_PROVIDER_AUTHENTICATION_FAILED,
        ErrorCode.HTTP_INTERNAL_SERVER_ERROR,
        ErrorCode.ANALYSIS_FAILED
      ].includes(code)
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (
      [
        ErrorCode.PATH_INVALID_FORMAT,
        ErrorCode.PATH_TOO_LONG,
        ErrorCode.PATH_RESERVED_NAME,
        ErrorCode.PATH_INVALID_CHARACTERS,
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.TIMEOUT_OPERATION,
        ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED,
        ErrorCode.LLM_PROVIDER_RATE_LIMITED,
        ErrorCode.HTTP_BAD_REQUEST,
        ErrorCode.HTTP_UNAUTHORIZED,
        ErrorCode.HTTP_FORBIDDEN,
        ErrorCode.HTTP_NOT_FOUND
      ].includes(code)
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors (warnings, informational)
    return ErrorSeverity.LOW;
  }

  /**
   * Generate user-friendly error title
   */
  private generateErrorTitle(
    code: ErrorCode,
    _category: ErrorCategory
  ): string {
    const titleMap: Record<ErrorCode, string> = {
      [ErrorCode.PATH_NOT_FOUND]: "Repository Path Not Found",
      [ErrorCode.PATH_INVALID_FORMAT]: "Invalid Path Format",
      [ErrorCode.PATH_TOO_LONG]: "Path Too Long",
      [ErrorCode.PATH_RESERVED_NAME]: "Reserved Name in Path",
      [ErrorCode.PATH_INVALID_CHARACTERS]: "Invalid Characters in Path",
      [ErrorCode.PATH_INVALID_DRIVE_LETTER]: "Invalid Drive Letter",
      [ErrorCode.PATH_INVALID_UNC]: "Invalid Network Path Format",
      [ErrorCode.PATH_NULL_BYTE]: "Security Risk - Null Byte in Path",
      [ErrorCode.PATH_CONTROL_CHARACTERS]: "Invalid Control Characters",
      [ErrorCode.PATH_INVALID_COMPONENT_ENDING]: "Invalid Path Component",
      [ErrorCode.PERMISSION_READ_DENIED]: "Read Permission Denied",
      [ErrorCode.PERMISSION_WRITE_DENIED]: "Write Permission Denied",
      [ErrorCode.PERMISSION_EXECUTE_DENIED]: "Execute Permission Denied",
      [ErrorCode.PERMISSION_CHECK_FAILED]: "Permission Check Failed",
      [ErrorCode.PERMISSION_SYSTEM_PATH]: "System Path Access Restricted",
      [ErrorCode.PERMISSION_READ_ONLY]: "Read-Only File or Directory",
      [ErrorCode.FILESYSTEM_NOT_DIRECTORY]: "Path is Not a Directory",
      [ErrorCode.FILESYSTEM_ACCESS_DENIED]: "File System Access Denied",
      [ErrorCode.FILESYSTEM_DISK_FULL]: "Disk Space Full",
      [ErrorCode.FILESYSTEM_CORRUPTED]: "File System Corrupted",
      [ErrorCode.NETWORK_UNREACHABLE]: "Network Unreachable",
      [ErrorCode.NETWORK_TIMEOUT]: "Network Timeout",
      [ErrorCode.NETWORK_CONNECTION_REFUSED]: "Connection Refused",
      [ErrorCode.NETWORK_DNS_RESOLUTION]: "DNS Resolution Failed",
      [ErrorCode.TIMEOUT_OPERATION]: "Operation Timed Out",
      [ErrorCode.TIMEOUT_PATH_VALIDATION]: "Path Validation Timed Out",
      [ErrorCode.TIMEOUT_ANALYSIS]: "Analysis Timed Out",
      [ErrorCode.TIMEOUT_LLM_REQUEST]: "LLM Request Timed Out",
      [ErrorCode.SYSTEM_RESOURCE_EXHAUSTED]: "System Resources Exhausted",
      [ErrorCode.SYSTEM_MEMORY_INSUFFICIENT]: "Insufficient Memory",
      [ErrorCode.SYSTEM_PLATFORM_UNSUPPORTED]: "Platform Not Supported",
      [ErrorCode.VALIDATION_INPUT_INVALID]: "Invalid Input",
      [ErrorCode.VALIDATION_SCHEMA_MISMATCH]: "Schema Validation Failed",
      [ErrorCode.VALIDATION_REQUIRED_FIELD]: "Required Field Missing",
      [ErrorCode.CONFIG_MISSING]: "Configuration Missing",
      [ErrorCode.CONFIG_INVALID]: "Invalid Configuration",
      [ErrorCode.CONFIG_PARSE_ERROR]: "Configuration Parse Error",
      [ErrorCode.ANALYSIS_FAILED]: "Analysis Failed",
      [ErrorCode.ANALYSIS_INTERRUPTED]: "Analysis Interrupted",
      [ErrorCode.ANALYSIS_INVALID_REPOSITORY]: "Invalid Repository",
      [ErrorCode.HTTP_BAD_REQUEST]: "Bad Request",
      [ErrorCode.HTTP_UNAUTHORIZED]: "Unauthorized",
      [ErrorCode.HTTP_FORBIDDEN]: "Forbidden",
      [ErrorCode.HTTP_NOT_FOUND]: "Not Found",
      [ErrorCode.HTTP_METHOD_NOT_ALLOWED]: "Method Not Allowed",
      [ErrorCode.HTTP_CONFLICT]: "Conflict",
      [ErrorCode.HTTP_UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
      [ErrorCode.HTTP_TOO_MANY_REQUESTS]: "Too Many Requests",
      [ErrorCode.HTTP_INTERNAL_SERVER_ERROR]: "Internal Server Error",
      [ErrorCode.HTTP_BAD_GATEWAY]: "Bad Gateway",
      [ErrorCode.HTTP_SERVICE_UNAVAILABLE]: "Service Unavailable",
      [ErrorCode.HTTP_GATEWAY_TIMEOUT]: "Gateway Timeout",
      [ErrorCode.LLM_PROVIDER_UNAVAILABLE]: "LLM Provider Unavailable",
      [ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED]: "LLM Quota Exceeded",
      [ErrorCode.LLM_PROVIDER_INVALID_REQUEST]: "Invalid LLM Request",
      [ErrorCode.LLM_PROVIDER_AUTHENTICATION_FAILED]:
        "LLM Authentication Failed",
      [ErrorCode.LLM_PROVIDER_RATE_LIMITED]: "LLM Rate Limited",
      [ErrorCode.OPERATION_CANCELLED]: "Operation Cancelled",
      [ErrorCode.OPERATION_ABORTED]: "Operation Aborted",
      [ErrorCode.UNKNOWN_ERROR]: "Unknown Error",
      [ErrorCode.INTERNAL_ERROR]: "Internal Error"
    };

    return titleMap[code] || "Unknown Error";
  }

  /**
   * Enhance error message with additional context
   */
  private enhanceErrorMessage(
    originalMessage: string,
    code: ErrorCode,
    context: Partial<ErrorContext>
  ): string {
    let enhancedMessage = originalMessage;

    // Add path information if available
    if (context.path) {
      enhancedMessage = enhancedMessage.replace(
        /path/gi,
        `path "${context.path}"`
      );
    }

    // Add platform-specific information
    if (context.platform) {
      const platformName = this.getPlatformDisplayName(context.platform);
      enhancedMessage += ` (Platform: ${platformName})`;
    }

    // Add duration information for timeout errors
    if (code.toString().includes("TIMEOUT") && context.duration) {
      enhancedMessage += ` (Duration: ${context.duration}ms)`;
    }

    // Add HTTP status information
    if (context.statusCode) {
      enhancedMessage += ` (HTTP ${context.statusCode})`;
    }

    return enhancedMessage;
  }

  /**
   * Generate error details based on code and context
   */
  private generateErrorDetails(
    code: ErrorCode,
    context: Partial<ErrorContext>
  ): string | undefined {
    // Add platform-specific details
    if (context.platform === "win32" && code.toString().includes("PATH")) {
      return "Windows path handling requires specific format considerations. Check path separators and reserved names.";
    }

    // Add network-specific details
    if (code.toString().includes("NETWORK")) {
      return "Network connectivity issues may be temporary. Check your connection and try again.";
    }

    // Add LLM-specific details
    if (code.toString().includes("LLM")) {
      return `LLM Provider: ${context.provider || "Unknown"}. Check your API credentials and quota limits.`;
    }

    return undefined;
  }

  /**
   * Generate actionable suggestions based on error code and context
   */
  private generateSuggestions(
    code: ErrorCode,
    category: ErrorCategory,
    context: Partial<ErrorContext>
  ): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    const currentPlatform = context.platform || platform();

    // Path-related suggestions
    if (
      category === ErrorCategory.PATH_VALIDATION ||
      category === ErrorCategory.PATH_FORMAT
    ) {
      if (currentPlatform === "win32") {
        suggestions.push({
          action: "Use Windows path format",
          description:
            "Use backslashes (\\) or forward slashes (/) for Windows paths",
          priority: "high",
          platform: "windows"
        });
      }

      suggestions.push({
        action: "Verify path exists",
        description: "Check that the path exists using your file manager",
        priority: "high",
        platform: "all"
      });
    }

    // Permission-related suggestions
    if (category === ErrorCategory.PATH_PERMISSION) {
      if (currentPlatform === "win32") {
        suggestions.push({
          action: "Run as Administrator",
          description: "Try running the application as Administrator",
          priority: "medium",
          platform: "windows"
        });
      } else {
        suggestions.push({
          action: "Check permissions",
          description:
            "Use chmod to modify file permissions if you own the file",
          command: "chmod +r /path/to/file",
          priority: "medium",
          platform: "linux"
        });
      }
    }

    // Network-related suggestions
    if (category === ErrorCategory.NETWORK) {
      suggestions.push({
        action: "Check network connection",
        description: "Verify your internet connection is working",
        priority: "high",
        platform: "all"
      });

      suggestions.push({
        action: "Retry operation",
        description:
          "Network issues may be temporary, try again in a few moments",
        priority: "medium",
        platform: "all"
      });
    }

    // Timeout-related suggestions
    if (category === ErrorCategory.TIMEOUT) {
      suggestions.push({
        action: "Try smaller operation",
        description: "Break down the operation into smaller parts",
        priority: "high",
        platform: "all"
      });
    }

    // LLM-related suggestions
    if (
      category === ErrorCategory.LLM_PROVIDER ||
      category === ErrorCategory.LLM_QUOTA
    ) {
      suggestions.push({
        action: "Check API credentials",
        description: "Verify your LLM provider API key is valid and active",
        priority: "high",
        platform: "all"
      });

      if (code === ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED) {
        suggestions.push({
          action: "Check quota limits",
          description:
            "Review your API usage and quota limits with your provider",
          priority: "high",
          platform: "all"
        });
      }
    }

    // Add generic suggestion if no specific ones were added
    if (suggestions.length === 0) {
      suggestions.push({
        action: "Contact support",
        description:
          "If the issue persists, contact technical support for assistance",
        priority: "low",
        platform: "all"
      });
    }

    return suggestions;
  }

  /**
   * Get learn more URL for specific error codes
   */
  private getLearnMoreUrl(
    code: ErrorCode,
    _category: ErrorCategory
  ): string | undefined {
    const urlMap: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.PATH_INVALID_FORMAT]:
        "https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file",
      [ErrorCode.PATH_INVALID_UNC]:
        "https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc",
      [ErrorCode.PATH_TOO_LONG]:
        "https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation",
      [ErrorCode.PATH_RESERVED_NAME]:
        "https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions"
    };

    return urlMap[code];
  }

  /**
   * Enrich context with additional system information
   */
  private enrichContext(context: Partial<ErrorContext>): ErrorContext {
    return {
      platform: platform(),
      nodeVersion: process.version,
      ...context
    };
  }

  /**
   * Sanitize context for API responses (remove sensitive data)
   */
  private sanitizeContext(context: ErrorContext): Partial<ErrorContext> {
    const { userId, sessionId, ...sanitized } = context;
    return sanitized;
  }

  /**
   * Add error to history with size management
   */
  private addToHistory(error: ClassifiedError): void {
    this.errorHistory.set(error.id, error);

    // Maintain history size limit
    if (this.errorHistory.size > this.maxHistorySize) {
      const oldestKey = this.errorHistory.keys().next().value;
      if (oldestKey) {
        this.errorHistory.delete(oldestKey);
      }
    }
  }

  /**
   * Update correlation mapping
   */
  private updateCorrelationMapping(
    correlationId: string,
    errorId: string
  ): void {
    const existingIds = this.correlationMap.get(correlationId) || [];
    existingIds.push(errorId);
    this.correlationMap.set(correlationId, existingIds);
  }

  /**
   * Link error to parent error
   */
  private linkToParentError(parentErrorId: string, childErrorId: string): void {
    const parentError = this.errorHistory.get(parentErrorId);
    if (parentError) {
      if (!parentError.childErrorIds) {
        parentError.childErrorIds = [];
      }
      parentError.childErrorIds.push(childErrorId);
    }
  }

  /**
   * Group errors by category for statistics
   */
  private groupByCategory(
    errors: ClassifiedError[]
  ): Record<ErrorCategory, number> {
    const grouped = {} as Record<ErrorCategory, number>;

    // Initialize all categories with 0
    Object.values(ErrorCategory).forEach((category) => {
      grouped[category] = 0;
    });

    // Count errors by category
    errors.forEach((error) => {
      grouped[error.category]++;
    });

    return grouped;
  }

  /**
   * Group errors by severity for statistics
   */
  private groupBySeverity(
    errors: ClassifiedError[]
  ): Record<ErrorSeverity, number> {
    const grouped = {} as Record<ErrorSeverity, number>;

    // Initialize all severities with 0
    Object.values(ErrorSeverity).forEach((severity) => {
      grouped[severity] = 0;
    });

    // Count errors by severity
    errors.forEach((error) => {
      grouped[error.severity]++;
    });

    return grouped;
  }

  /**
   * Group errors by code for statistics
   */
  private groupByCode(errors: ClassifiedError[]): Record<ErrorCode, number> {
    const grouped = {} as Record<ErrorCode, number>;

    // Initialize all codes with 0
    Object.values(ErrorCode).forEach((code) => {
      grouped[code] = 0;
    });

    // Count errors by code
    errors.forEach((error) => {
      grouped[error.code]++;
    });

    return grouped;
  }

  /**
   * Get most common errors for statistics
   */
  private getMostCommonErrors(errors: ClassifiedError[]): Array<{
    code: ErrorCode;
    count: number;
    percentage: number;
  }> {
    const codeCount = this.groupByCode(errors);
    const totalErrors = errors.length;

    return Object.entries(codeCount)
      .filter(([, count]) => count > 0)
      .map(([code, count]) => ({
        code: code as ErrorCode,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most common errors
  }

  /**
   * Determine root cause from related errors
   */
  private determineRootCause(
    errors: ClassifiedError[]
  ): ClassifiedError | undefined {
    if (errors.length === 0) return undefined;
    if (errors.length === 1) return errors[0];

    // First, try to find the earliest critical error
    const criticalErrors = errors.filter(
      (e) => e.severity === ErrorSeverity.CRITICAL
    );
    if (criticalErrors.length > 0) {
      return criticalErrors.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )[0];
    }

    // Then, try to find the earliest high severity error
    const highSeverityErrors = errors.filter(
      (e) => e.severity === ErrorSeverity.HIGH
    );
    if (highSeverityErrors.length > 0) {
      return highSeverityErrors.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )[0];
    }

    // Otherwise, return the first error chronologically
    return errors.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )[0];
  }

  /**
   * Get platform display name
   */
  private getPlatformDisplayName(platform: string): string {
    const platformMap: Record<string, string> = {
      win32: "Windows",
      darwin: "macOS",
      linux: "Linux",
      freebsd: "FreeBSD",
      openbsd: "OpenBSD"
    };

    return platformMap[platform] || platform;
  }
}

// Export singleton instance
export const errorClassifier = ErrorClassifier.getInstance();
export default errorClassifier;
