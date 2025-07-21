/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Error response interface
 */
interface ErrorResponse {
  status: number;
  message: string;
  stack?: string;
  errors?: any[];
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  errors?: any[];

  constructor(status: number, message: string, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * General error handler
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const error: ErrorResponse = {
    status: err instanceof ApiError ? err.status : 500,
    message: err.message || 'Internal Server Error',
  };

  // Add stack trace in development
  if (isDevelopment) {
    error.stack = err.stack;
  }

  // Add validation errors if available
  if (err instanceof ApiError && err.errors) {
    error.errors = err.errors;
  }

  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, error);

  // Send error response
  res.status(error.status).json(error);
};
