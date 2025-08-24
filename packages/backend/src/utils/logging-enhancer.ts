/**
 * Enhanced logging utilities for better debugging and monitoring
 */

import type { Request, Response } from 'express';
import logger from '../services/logger.service.js';

/**
 * Log levels with numeric values for filtering
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

/**
 * Operation context for tracking related logs
 */
export interface OperationContext {
  operationId: string;
  operationType: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  startTime: number;
  metadata?: Record<string, any>;
}

/**
 * Performance metrics for operations
 */
export interface PerformanceMetrics {
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  operationId: string;
}

/**
 * Enhanced logger class with operation tracking
 */
export class EnhancedLogger {
  private operations = new Map<string, OperationContext>();
  private performanceBaseline: NodeJS.CpuUsage;

  constructor() {
    this.performanceBaseline = process.cpuUsage();
  }

  /**
   * Start tracking an operation
   */
  startOperation(
    operationType: string,
    metadata?: Record<string, any>,
    requestId?: string
  ): string {
    const operationId = `${operationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const context: OperationContext = {
      operationId,
      operationType,
      requestId,
      startTime: Date.now(),
      metadata,
    };

    this.operations.set(operationId, context);

    logger.info(`Operation started: ${operationType}`, {
      operationId,
      operationType,
      requestId,
      metadata,
    });

    return operationId;
  }

  /**
   * End tracking an operation and log performance metrics
   */
  endOperation(
    operationId: string,
    success = true,
    result?: any,
    error?: Error
  ): PerformanceMetrics | null {
    const context = this.operations.get(operationId);
    if (!context) {
      logger.warn('Attempted to end unknown operation', { operationId });
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - context.startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.performanceBaseline);

    const metrics: PerformanceMetrics = {
      duration,
      memoryUsage,
      cpuUsage,
      operationId,
    };

    const logData = {
      operationId,
      operationType: context.operationType,
      requestId: context.requestId,
      duration,
      success,
      memoryUsage: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      },
      cpuUsage: {
        user: `${Math.round(cpuUsage.user / 1000)}ms`,
        system: `${Math.round(cpuUsage.system / 1000)}ms`,
      },
      metadata: context.metadata,
    };

    if (success) {
      logger.info(`Operation completed: ${context.operationType}`, {
        ...logData,
        result: this.sanitizeResult(result),
      });
    } else {
      logger.error(
        `Operation failed: ${context.operationType}`,
        error || new Error('Unknown error occurred'),
        logData
      );
    }

    // Clean up
    this.operations.delete(operationId);

    return metrics;
  }

  /**
   * Log operation progress
   */
  logProgress(
    operationId: string,
    progress: number,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const context = this.operations.get(operationId);
    if (!context) {
      logger.warn('Attempted to log progress for unknown operation', {
        operationId,
      });
      return;
    }

    logger.info(`Operation progress: ${context.operationType}`, {
      operationId,
      operationType: context.operationType,
      requestId: context.requestId,
      progress: `${Math.round(progress)}%`,
      message,
      elapsed: Date.now() - context.startTime,
      metadata,
    });
  }

  /**
   * Log API request/response with sanitization
   */
  logApiCall(req: Request, res: Response, duration: number, error?: Error): void {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      requestId: req.headers['x-request-id'],
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length'),
      query: this.sanitizeQuery(req.query),
      params: req.params,
      headers: this.sanitizeHeaders(req.headers),
    };

    if (error) {
      logger.error('API request failed', error, logData);
    } else if (res.statusCode >= 400) {
      logger.warn('API request completed with error status', logData);
    } else {
      logger.info('API request completed', logData);
    }
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    rowsAffected?: number,
    error?: Error
  ): void {
    const logData = {
      operation,
      table,
      duration,
      rowsAffected,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logger.error('Database operation failed', error, logData);
    } else {
      logger.info('Database operation completed', logData);
    }
  }

  /**
   * Log external service calls
   */
  logExternalServiceCall(
    service: string,
    endpoint: string,
    method: string,
    duration: number,
    statusCode?: number,
    error?: Error
  ): void {
    const logData = {
      service,
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logger.error('External service call failed', error, logData);
    } else if (statusCode && statusCode >= 400) {
      logger.warn('External service call completed with error status', logData);
    } else {
      logger.info('External service call completed', logData);
    }
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    eventType: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    description: string,
    req?: Request,
    metadata?: Record<string, any>
  ): void {
    const logData = {
      eventType,
      severity,
      description,
      timestamp: new Date().toISOString(),
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
      url: req?.originalUrl,
      method: req?.method,
      requestId: req?.headers['x-request-id'],
      metadata,
    };

    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        logger.error(`Security event: ${eventType}`, undefined, logData);
        break;
      case 'MEDIUM':
        logger.warn(`Security event: ${eventType}`, logData);
        break;
      case 'LOW':
        logger.info(`Security event: ${eventType}`, logData);
        break;
    }
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeResult(result: any): any {
    if (!result) return result;

    if (typeof result === 'string') {
      return this.sanitizeString(result);
    }

    if (typeof result === 'object') {
      return this.sanitizeObject(result);
    }

    return result;
  }

  private sanitizeQuery(query: any): any {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    const sanitized = { ...query };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    // Remove potential passwords, tokens, etc.
    return str.replace(/(password|token|key|secret)=[\w\-.]+/gi, '$1=[REDACTED]');
  }

  private sanitizeObject(obj: any): any {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
    const sanitized = { ...obj };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Get current operation contexts (for debugging)
   */
  getActiveOperations(): OperationContext[] {
    return Array.from(this.operations.values());
  }

  /**
   * Clean up stale operations (older than 1 hour)
   */
  cleanupStaleOperations(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [operationId, context] of this.operations.entries()) {
      if (context.startTime < oneHourAgo) {
        logger.warn('Cleaning up stale operation', {
          operationId,
          operationType: context.operationType,
          age: Date.now() - context.startTime,
        });
        this.operations.delete(operationId);
      }
    }
  }
}

// Export singleton instance
export const enhancedLogger = new EnhancedLogger();

// Cleanup stale operations every 30 minutes
setInterval(
  () => {
    enhancedLogger.cleanupStaleOperations();
  },
  30 * 60 * 1000
);

/**
 * Decorator for automatic operation logging
 */
export function logOperation(operationType: string) {
  return (_target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationId = enhancedLogger.startOperation(operationType, {
        method: propertyName,
        args: args.length,
      });

      try {
        const result = await method.apply(this, args);
        enhancedLogger.endOperation(operationId, true, result);
        return result;
      } catch (error) {
        enhancedLogger.endOperation(operationId, false, undefined, error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}
