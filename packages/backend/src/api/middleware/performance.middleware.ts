/**
 * Performance monitoring middleware for Express
 */

import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';
import { metricsService } from '../../services/metrics.service';
import { logger } from '../../utils/logger.js';

interface PerformanceRequest extends Request {
  startTime?: number;
  requestId: string;
}

/**
 * Middleware to track request performance metrics
 */
export function performanceMiddleware() {
  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    // Generate unique request ID
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.startTime = performance.now();

    // Log request start
    logger.debug(`Request started: ${req.method} ${req.path}`, {
      requestId: req.requestId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function (
      this: Response<unknown, Record<string, unknown>>,
      chunk?: unknown,
      encodingParam?: BufferEncoding | (() => void) | undefined,
      cb?: (() => void) | undefined
    ): Response<unknown, Record<string, unknown>> {
      const duration = performance.now() - (req.startTime || 0);

      // Record request metrics
      metricsService.recordRequestMetric(req.method, res.statusCode, duration);

      // Log request completion
      logger.info(`Request completed: ${req.method} ${req.path}`, {
        requestId: req.requestId,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        contentLength: res.get('Content-Length') || '0',
      });

      // Type guard to check if a value is a BufferEncoding (string)
      const isBufferEncoding = (val: unknown): val is BufferEncoding =>
        typeof val === 'string' &&
        [
          'utf8',
          'ascii',
          'utf-8',
          'base64',
          'hex',
          'latin1',
          'ucs2',
          'ucs-2',
          'utf16le',
          'utf-16-le',
        ].includes(val.toLowerCase());

      // Call original end method
      if (typeof encodingParam === 'function') {
        // If encodingParam is a function, it's the old signature: (chunk, callback)
        // 'cb' (the third argument) is ignored in this case.
        const originalEndAsCallbackFn = originalEnd as (
          this: Response<unknown, Record<string, unknown>>,
          chunk?: unknown,
          encoding?: (() => void) | undefined
        ) => Response<unknown, Record<string, unknown>>;
        return originalEndAsCallbackFn.apply(this, [chunk, encodingParam]);
      }
      if (isBufferEncoding(encodingParam)) {
        // If encodingParam is a valid BufferEncoding string
        if (typeof cb === 'function') {
          // Signature: (chunk, encoding, cb)
          const originalEndAsEncodingCbFn = originalEnd as (
            this: Response<unknown, Record<string, unknown>>,
            chunk?: unknown,
            encoding?: BufferEncoding,
            callback?: (() => void) | undefined
          ) => Response<unknown, Record<string, unknown>>;
          return originalEndAsEncodingCbFn.apply(this, [chunk, encodingParam, cb]);
        }
        // Signature: (chunk, encoding)
        const originalEndAsEncodingFn = originalEnd as (
          this: Response<unknown, Record<string, unknown>>,
          chunk?: unknown,
          encoding?: BufferEncoding
        ) => Response<unknown, Record<string, unknown>>;
        return originalEndAsEncodingFn.apply(this, [chunk, encodingParam]);
      }
      // encodingParam is undefined (and not a function)
      // Use 'utf8' as a default encoding for type safety.
      const defaultEncoding: BufferEncoding = 'utf8';
      if (typeof cb === 'function') {
        // This implies a call like res.end(chunk, undefined, cb)
        // We provide a default encoding.
        const originalEndAsEncodingCbFn = originalEnd as (
          this: Response<unknown, Record<string, unknown>>,
          chunk?: unknown,
          encoding?: BufferEncoding,
          callback?: (() => void) | undefined
        ) => Response<unknown, Record<string, unknown>>;
        return originalEndAsEncodingCbFn.apply(this, [chunk, defaultEncoding, cb]);
      }
      // This implies a call like res.end(chunk, undefined)
      // We provide a default encoding.
      const originalEndAsEncodingFn = originalEnd as (
        this: Response<unknown, Record<string, unknown>>,
        chunk?: unknown,
        encoding?: BufferEncoding
      ) => Response<unknown, Record<string, unknown>>;
      return originalEndAsEncodingFn.apply(this, [chunk, defaultEncoding]);
    };

    next();
  };
}

/**
 * Middleware to add performance headers to responses
 */
export function performanceHeadersMiddleware() {
  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    // Add server timing header
    res.on('finish', () => {
      if (req.startTime) {
        const duration = performance.now() - req.startTime;
        res.set('Server-Timing', `total;dur=${duration.toFixed(2)}`);
        res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      }
    });

    next();
  };
}

/**
 * Middleware to monitor slow requests
 */
export function slowRequestMiddleware(threshold = 1000) {
  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    res.on('finish', () => {
      if (req.startTime) {
        const duration = performance.now() - req.startTime;

        if (duration > threshold) {
          logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
            requestId: req.requestId,
            duration: `${duration.toFixed(2)}ms`,
            threshold: `${threshold}ms`,
            statusCode: res.statusCode,
          });

          // Record slow request metric
          metricsService.recordMetric('request.slow', duration, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode.toString(),
          });
        }
      }
    });

    next();
  };
}

/**
 * Middleware to track memory usage per request
 */
export function memoryTrackingMiddleware() {
  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    const initialMemory = process.memoryUsage();

    res.on('finish', () => {
      const finalMemory = process.memoryUsage();
      const memoryDelta: {
        heapUsed: number;
        heapTotal: number;
        external: number;
      } = {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
      };

      // Log significant memory changes
      if (Math.abs(memoryDelta.heapUsed) > 10 * 1024 * 1024) {
        // 10MB threshold
        logger.debug(`Significant memory change: ${req.method} ${req.path}`, {
          requestId: req.requestId,
          memoryDelta: {
            heapUsed: `${(memoryDelta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(memoryDelta.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memoryDelta.external / 1024 / 1024).toFixed(2)}MB`,
          },
        });
      }

      // Record memory metrics
      metricsService.recordMetric('request.memory.heapUsed', memoryDelta.heapUsed, {
        method: req.method,
        path: req.path,
      });
    });

    next();
  };
}

/**
 * Middleware to implement request rate limiting based on performance
 */
export function adaptiveRateLimitMiddleware() {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  const performanceHistory: number[] = [];
  const maxHistorySize = 100;

  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // Calculate current system load based on recent response times
    const avgResponseTime =
      performanceHistory.length > 0
        ? performanceHistory.reduce((sum, time) => sum + time, 0) / performanceHistory.length
        : 0;

    // Adjust rate limit based on system performance
    let maxRequests = 100; // Base limit
    if (avgResponseTime > 1000) {
      maxRequests = 50; // Reduce limit if system is slow
    } else if (avgResponseTime > 500) {
      maxRequests = 75;
    }

    // Check rate limit
    const clientData = requestCounts.get(clientId);
    if (clientData && now < clientData.resetTime) {
      if (clientData.count >= maxRequests) {
        logger.warn(`Rate limit exceeded for client: ${clientId}`, {
          requestId: req.requestId,
          currentCount: clientData.count,
          maxRequests,
          avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
          maxRequests,
          currentLoad: avgResponseTime > 500 ? 'high' : 'normal',
        } as const);
      }
      clientData.count++;
    } else {
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    // Track response time for adaptive limiting
    res.on('finish', () => {
      if (req.startTime) {
        const responseTime = performance.now() - req.startTime;
        performanceHistory.push(responseTime);

        if (performanceHistory.length > maxHistorySize) {
          performanceHistory.shift();
        }
      }
    });

    next();
  };
}

/**
 * Middleware to add cache headers based on performance
 */
export function performanceCacheMiddleware() {
  return (
    req: PerformanceRequest,
    res: Response<unknown, Record<string, unknown>>,
    next: NextFunction
  ) => {
    // Set cache headers based on request type and system load
    const isAnalysisRequest = req.path.includes('/api/analyze');
    const isSearchRequest = req.path.includes('/api/search');

    if (isAnalysisRequest) {
      // Cache analysis results for longer periods
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (isSearchRequest) {
      // Cache search results for shorter periods
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes
    }

    // Add ETag for conditional requests
    res.on('finish', () => {
      if (res.statusCode === 200 && !res.get('ETag')) {
        const etag = `etag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        res.set('ETag', etag);
      }
    });

    next();
  };
}
