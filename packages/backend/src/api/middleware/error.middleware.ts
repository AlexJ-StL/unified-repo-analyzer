/**
 * Enhanced error handling middleware
 */

import type { NextFunction, Request, Response } from 'express';
import {
  createEnhancedError,
  createErrorResponse,
  type EnhancedError,
  ErrorCategory,
  ErrorSeverity,
  handleError,
} from '../../utils/error-handler.js';

// Define a type for the error response body
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    severity: string;
    category: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  requestId?: string;
  timestamp: string;
}

/**
 * Legacy API error class for backward compatibility
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: unknown[];

  constructor(status: number, message: string, errors?: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = createEnhancedError(
    ErrorCategory.NOT_FOUND,
    ErrorSeverity.LOW,
    `Resource not found: ${req.originalUrl}`,
    404,
    {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
    },
    req.headers['x-request-id'] as string
  );

  next(error);
};

/**
 * Enhanced error handler with comprehensive logging and user-friendly responses
 */
export const errorHandler = (
  err: Error | ApiError | EnhancedError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorResponse, Record<string, string>> => {
  const isDevelopment = process.env.NODE_ENV === ('development' as const);

  // Handle legacy ApiError
  if (err instanceof ApiError) {
    const enhancedError = createEnhancedError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      err.message,
      err.status,
      { errors: err.errors },
      req.headers['x-request-id'] as string
    );

    const processedError = handleError(enhancedError, req);
    const response = createErrorResponse(processedError, isDevelopment);

    return res.status(processedError.statusCode).json(response);
  }

  // Handle enhanced errors or convert regular errors
  const processedError = handleError(err, req);
  const response = createErrorResponse(processedError, isDevelopment);

  // Add request correlation for debugging
  if (req.headers['x-request-id']) {
    res.setHeader('X-Request-ID', req.headers['x-request-id']);
  }

  // Set appropriate cache headers for error responses
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(processedError.statusCode).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler for express-validator
 */
export const handleValidationErrors = (req: Request, _res: Response, next: NextFunction) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = createEnhancedError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      'Request validation failed',
      400,
      {
        validationErrors: errors.array(),
        body: req.body,
        query: req.query,
        params: req.params,
      },
      req.headers['x-request-id'] as string
    );

    return next(error);
  }

  next();
};

/**
 * Rate limiting error handler
 */
export const rateLimitHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = createEnhancedError(
    ErrorCategory.RATE_LIMIT,
    ErrorSeverity.MEDIUM,
    'Rate limit exceeded',
    429,
    {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    req.headers['x-request-id'] as string
  );

  next(error);
};

/**
 * Request timeout handler
 */
export const timeoutHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = createEnhancedError(
    ErrorCategory.TIMEOUT,
    ErrorSeverity.MEDIUM,
    'Request timeout',
    408,
    {
      method: req.method,
      url: req.originalUrl,
    },
    req.headers['x-request-id'] as string
  );

  next(error);
};
