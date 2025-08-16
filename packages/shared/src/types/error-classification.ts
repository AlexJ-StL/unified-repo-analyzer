/**
 * Error classification system for unified-repo-analyzer
 * Provides comprehensive error categorization, correlation, and tracking
 * Requirements: 3.3, 4.5, 5.5
 */

/**
 * Error categories for comprehensive classification
 */
export enum ErrorCategory {
  // Path-related errors
  PATH_VALIDATION = 'PATH_VALIDATION',
  PATH_ACCESS = 'PATH_ACCESS',
  PATH_FORMAT = 'PATH_FORMAT',
  PATH_PERMISSION = 'PATH_PERMISSION',

  // File system errors
  FILESYSTEM = 'FILESYSTEM',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',

  // System errors
  SYSTEM = 'SYSTEM',
  PLATFORM = 'PLATFORM',
  RESOURCE = 'RESOURCE',

  // Application errors
  VALIDATION = 'VALIDATION',
  CONFIGURATION = 'CONFIGURATION',
  ANALYSIS = 'ANALYSIS',

  // HTTP/API errors
  HTTP_REQUEST = 'HTTP_REQUEST',
  HTTP_RESPONSE = 'HTTP_RESPONSE',
  API_ERROR = 'API_ERROR',

  // LLM Provider errors
  LLM_PROVIDER = 'LLM_PROVIDER',
  LLM_TIMEOUT = 'LLM_TIMEOUT',
  LLM_QUOTA = 'LLM_QUOTA',

  // Legacy categories (for backward compatibility)
  BUILD = 'BUILD',
  DEPENDENCY = 'DEPENDENCY',
  TYPESCRIPT = 'TYPESCRIPT',
  RUNTIME = 'RUNTIME',
}

/**
 * Error severity levels with detailed descriptions
 */
export enum ErrorSeverity {
  LOW = 'LOW', // Minor issues that don't prevent operation
  MEDIUM = 'MEDIUM', // Issues that may affect functionality
  HIGH = 'HIGH', // Serious issues that prevent normal operation
  CRITICAL = 'CRITICAL', // Critical failures that require immediate attention
}

/**
 * Error codes for specific error types
 */
export enum ErrorCode {
  // Path validation errors
  PATH_NOT_FOUND = 'PATH_NOT_FOUND',
  PATH_INVALID_FORMAT = 'PATH_INVALID_FORMAT',
  PATH_TOO_LONG = 'PATH_TOO_LONG',
  PATH_RESERVED_NAME = 'PATH_RESERVED_NAME',
  PATH_INVALID_CHARACTERS = 'PATH_INVALID_CHARACTERS',
  PATH_INVALID_DRIVE_LETTER = 'PATH_INVALID_DRIVE_LETTER',
  PATH_INVALID_UNC = 'PATH_INVALID_UNC',
  PATH_NULL_BYTE = 'PATH_NULL_BYTE',
  PATH_CONTROL_CHARACTERS = 'PATH_CONTROL_CHARACTERS',
  PATH_INVALID_COMPONENT_ENDING = 'PATH_INVALID_COMPONENT_ENDING',

  // Permission errors
  PERMISSION_READ_DENIED = 'PERMISSION_READ_DENIED',
  PERMISSION_WRITE_DENIED = 'PERMISSION_WRITE_DENIED',
  PERMISSION_EXECUTE_DENIED = 'PERMISSION_EXECUTE_DENIED',
  PERMISSION_CHECK_FAILED = 'PERMISSION_CHECK_FAILED',
  PERMISSION_SYSTEM_PATH = 'PERMISSION_SYSTEM_PATH',
  PERMISSION_READ_ONLY = 'PERMISSION_READ_ONLY',

  // File system errors
  FILESYSTEM_NOT_DIRECTORY = 'FILESYSTEM_NOT_DIRECTORY',
  FILESYSTEM_ACCESS_DENIED = 'FILESYSTEM_ACCESS_DENIED',
  FILESYSTEM_DISK_FULL = 'FILESYSTEM_DISK_FULL',
  FILESYSTEM_CORRUPTED = 'FILESYSTEM_CORRUPTED',

  // Network errors
  NETWORK_UNREACHABLE = 'NETWORK_UNREACHABLE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_REFUSED = 'NETWORK_CONNECTION_REFUSED',
  NETWORK_DNS_RESOLUTION = 'NETWORK_DNS_RESOLUTION',

  // Timeout errors
  TIMEOUT_OPERATION = 'TIMEOUT_OPERATION',
  TIMEOUT_PATH_VALIDATION = 'TIMEOUT_PATH_VALIDATION',
  TIMEOUT_ANALYSIS = 'TIMEOUT_ANALYSIS',
  TIMEOUT_LLM_REQUEST = 'TIMEOUT_LLM_REQUEST',

  // System errors
  SYSTEM_RESOURCE_EXHAUSTED = 'SYSTEM_RESOURCE_EXHAUSTED',
  SYSTEM_MEMORY_INSUFFICIENT = 'SYSTEM_MEMORY_INSUFFICIENT',
  SYSTEM_PLATFORM_UNSUPPORTED = 'SYSTEM_PLATFORM_UNSUPPORTED',

  // Validation errors
  VALIDATION_INPUT_INVALID = 'VALIDATION_INPUT_INVALID',
  VALIDATION_SCHEMA_MISMATCH = 'VALIDATION_SCHEMA_MISMATCH',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',

  // Configuration errors
  CONFIG_MISSING = 'CONFIG_MISSING',
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_PARSE_ERROR = 'CONFIG_PARSE_ERROR',

  // Analysis errors
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  ANALYSIS_INTERRUPTED = 'ANALYSIS_INTERRUPTED',
  ANALYSIS_INVALID_REPOSITORY = 'ANALYSIS_INVALID_REPOSITORY',

  // HTTP errors
  HTTP_BAD_REQUEST = 'HTTP_BAD_REQUEST',
  HTTP_UNAUTHORIZED = 'HTTP_UNAUTHORIZED',
  HTTP_FORBIDDEN = 'HTTP_FORBIDDEN',
  HTTP_NOT_FOUND = 'HTTP_NOT_FOUND',
  HTTP_METHOD_NOT_ALLOWED = 'HTTP_METHOD_NOT_ALLOWED',
  HTTP_CONFLICT = 'HTTP_CONFLICT',
  HTTP_UNPROCESSABLE_ENTITY = 'HTTP_UNPROCESSABLE_ENTITY',
  HTTP_TOO_MANY_REQUESTS = 'HTTP_TOO_MANY_REQUESTS',
  HTTP_INTERNAL_SERVER_ERROR = 'HTTP_INTERNAL_SERVER_ERROR',
  HTTP_BAD_GATEWAY = 'HTTP_BAD_GATEWAY',
  HTTP_SERVICE_UNAVAILABLE = 'HTTP_SERVICE_UNAVAILABLE',
  HTTP_GATEWAY_TIMEOUT = 'HTTP_GATEWAY_TIMEOUT',

  // LLM Provider errors
  LLM_PROVIDER_UNAVAILABLE = 'LLM_PROVIDER_UNAVAILABLE',
  LLM_PROVIDER_QUOTA_EXCEEDED = 'LLM_PROVIDER_QUOTA_EXCEEDED',
  LLM_PROVIDER_INVALID_REQUEST = 'LLM_PROVIDER_INVALID_REQUEST',
  LLM_PROVIDER_AUTHENTICATION_FAILED = 'LLM_PROVIDER_AUTHENTICATION_FAILED',
  LLM_PROVIDER_RATE_LIMITED = 'LLM_PROVIDER_RATE_LIMITED',

  // Operation errors
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  OPERATION_ABORTED = 'OPERATION_ABORTED',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Error context interface for additional error information
 */
export interface ErrorContext {
  // Request/operation context
  requestId?: string;
  correlationId?: string;
  operationId?: string;
  userId?: string;
  sessionId?: string;

  // Path context
  path?: string;
  normalizedPath?: string;
  basePath?: string;

  // System context
  platform?: string;
  nodeVersion?: string;
  appVersion?: string;

  // HTTP context
  method?: string;
  url?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;

  // Analysis context
  repositoryPath?: string;
  analysisType?: string;
  provider?: string;
  model?: string;

  // Performance context
  duration?: number;
  startTime?: string;
  endTime?: string;

  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Actionable suggestion interface
 */
export interface ErrorSuggestion {
  action: string;
  description: string;
  command?: string;
  automated?: boolean;
  priority?: 'high' | 'medium' | 'low';
  platform?: 'windows' | 'macos' | 'linux' | 'all';
}

/**
 * Classified error interface
 */
export interface ClassifiedError {
  // Error identification
  id: string;
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;

  // Error details
  title: string;
  message: string;
  details?: string;

  // Context and tracking
  context: ErrorContext;
  timestamp: Date;

  // Original error information
  originalError?: Error;
  stack?: string;

  // User guidance
  suggestions: ErrorSuggestion[];
  learnMoreUrl?: string;

  // Correlation and tracking
  correlationId: string;
  parentErrorId?: string;
  childErrorIds?: string[];

  // Resolution tracking
  resolved?: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

/**
 * Error response format for API responses
 */
export interface ErrorResponse {
  error: {
    id: string;
    code: string;
    category: string;
    severity: string;
    message: string;
    details?: string;
    suggestions: ErrorSuggestion[];
    correlationId: string;
    timestamp: string;
    context?: Partial<ErrorContext>;
  };
  requestId?: string;
  path?: string;
}

/**
 * Error statistics interface for monitoring
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCode: Record<ErrorCode, number>;
  mostCommonErrors: Array<{
    code: ErrorCode;
    count: number;
    percentage: number;
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Error correlation result interface
 */
export interface ErrorCorrelation {
  correlationId: string;
  relatedErrors: ClassifiedError[];
  rootCause?: ClassifiedError;
  timeline: Array<{
    timestamp: Date;
    errorId: string;
    event: 'created' | 'resolved' | 'escalated';
  }>;
}
