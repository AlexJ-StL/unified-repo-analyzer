/**
 * Error handling middleware
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Custom API error class
 */
export declare class ApiError extends Error {
  status: number;
  errors?: any[];
  constructor(status: number, message: string, errors?: any[]);
}
/**
 * Not found error handler
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
/**
 * General error handler
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export declare const errorHandler: (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => void;
