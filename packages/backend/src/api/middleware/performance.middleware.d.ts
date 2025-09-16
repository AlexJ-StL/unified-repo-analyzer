/**
 * Performance monitoring middleware for Express
 */
import { Request, Response, NextFunction } from 'express';
interface PerformanceRequest extends Request {
  startTime?: number;
  __perfRequestId__?: string;
}
/**
 * Middleware to track request performance metrics
 */
export declare function performanceMiddleware(): (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => void;
/**
 * Middleware to add performance headers to responses
 */
export declare function performanceHeadersMiddleware(): (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => void;
/**
 * Middleware to monitor slow requests
 */
export declare function slowRequestMiddleware(
  threshold?: number
): (req: PerformanceRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to track memory usage per request
 */
export declare function memoryTrackingMiddleware(): (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => void;
/**
 * Middleware to implement request rate limiting based on performance
 */
export declare function adaptiveRateLimitMiddleware(): (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => Response<unknown, Record<string, unknown>> | undefined;
/**
 * Middleware to add cache headers based on performance
 */
export declare function performanceCacheMiddleware(): (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => void;
