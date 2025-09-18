/**
 * HTTP Request/Response Logging Service - Simplified
 */

import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger.service.js';

/**
 * HTTP request logger middleware
 * Adds a unique request ID to each request and logs request/response details
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: {
      ...req.headers,
      // Mask sensitive headers
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-api-key': req.headers['x-api-key'] ? '[REDACTED]' : undefined,
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId,
  });

  // Log response when finished
  res.on('finish', () => {
    logger.info('HTTP Response', {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      contentLength: res.get('Content-Length'),
      requestId,
    });
  });

  // Log response errors
  res.on('error', (error) => {
    logger.error('HTTP Response Error', error, {
      statusCode: res.statusCode,
      requestId,
    });
  });

  next();
};

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return uuidv4();
};

/**
 * Get request ID from request object
 */
export const getRequestId = (req: Request): string | undefined => {
  return (req as any).requestId;
};
