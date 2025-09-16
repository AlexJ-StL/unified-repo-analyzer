/**
 * Unit tests for error classification system
 * Tests error type definitions, categorization, and correlation tracking
 * Requirements: 3.3, 4.5, 5.5
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  type ClassifiedError,
  ErrorCategory,
  ErrorCode,
  type ErrorContext,
  ErrorSeverity,
} from '../src/types/error-classification.js';
import { ErrorClassifier } from '../src/utils/error-classifier.js';
import { ErrorFormatter } from '../src/utils/error-formatter.js';

describe('Error Classification System', () => {
  let errorClassifier: ErrorClassifier;
  let errorFormatter: ErrorFormatter;

  beforeEach(() => {
    errorClassifier = ErrorClassifier.getInstance();
    errorFormatter = ErrorFormatter.getInstance();
    errorClassifier.clearHistory(); // Clear history for clean tests
  });

  afterEach(() => {
    errorClassifier.clearHistory();
  });

  describe('ErrorClassifier', () => {
    describe('classifyError', () => {
      it('should classify path not found errors correctly', () => {
        const error = new Error('Path not found: /invalid/path');
        const context: Partial<ErrorContext> = {
          path: '/invalid/path',
          requestId: 'test-request-1',
        };

        const classified = errorClassifier.classifyError(error, context);

        expect(classified.code).toBe(ErrorCode.PATH_NOT_FOUND);
        expect(classified.category).toBe(ErrorCategory.PATH_VALIDATION);
        expect(classified.severity).toBe(ErrorSeverity.HIGH);
        expect(classified.title).toBe('Repository Path Not Found');
        expect(classified.context.path).toBe('/invalid/path');
        expect(classified.context.requestId).toBe('test-request-1');
        expect(classified.suggestions.length).toBeGreaterThan(0);
      });

      it('should classify permission denied errors correctly', () => {
        const error = new Error('Permission denied: read access');
        const context: Partial<ErrorContext> = {
          path: '/restricted/folder',
          platform: 'linux',
        };

        const classified = errorClassifier.classifyError(error, context);

        expect(classified.code).toBe(ErrorCode.PERMISSION_READ_DENIED);
        expect(classified.category).toBe(ErrorCategory.PATH_PERMISSION);
        expect(classified.severity).toBe(ErrorSeverity.HIGH);
        expect(classified.title).toBe('Read Permission Denied');
        expect(classified.suggestions.some((s) => s.platform === 'linux')).toBe(true);
      });

      it('should classify network timeout errors correctly', () => {
        const error = new Error('Network timeout occurred');
        const context: Partial<ErrorContext> = {
          duration: 5000,
          url: 'https://api.example.com',
        };

        const classified = errorClassifier.classifyError(error, context);

        expect(classified.code).toBe(ErrorCode.NETWORK_TIMEOUT);
        expect(classified.category).toBe(ErrorCategory.NETWORK);
        expect(classified.severity).toBe(ErrorSeverity.MEDIUM);
        expect(classified.title).toBe('Network Timeout');
        expect(classified.context.duration).toBe(5000);
      });

      it('should classify LLM provider errors correctly', () => {
        const error = new Error('Quota exceeded for API calls');
        const context: Partial<ErrorContext> = {
          provider: 'openai',
          model: 'gpt-4',
        };

        const classified = errorClassifier.classifyError(error, context);

        expect(classified.code).toBe(ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED);
        expect(classified.category).toBe(ErrorCategory.LLM_QUOTA);
        expect(classified.severity).toBe(ErrorSeverity.MEDIUM);
        expect(classified.title).toBe('LLM Quota Exceeded');
        expect(classified.context.provider).toBe('openai');
      });

      it('should classify HTTP errors based on status code', () => {
        const error = new Error('HTTP request failed');
        const context: Partial<ErrorContext> = {
          statusCode: 404,
          method: 'GET',
          url: '/api/nonexistent',
        };

        const classified = errorClassifier.classifyError(error, context);

        expect(classified.code).toBe(ErrorCode.HTTP_NOT_FOUND);
        expect(classified.category).toBe(ErrorCategory.HTTP_REQUEST);
        expect(classified.severity).toBe(ErrorSeverity.MEDIUM);
        expect(classified.title).toBe('Not Found');
      });

      it('should handle string errors', () => {
        const errorMessage = 'Invalid path format detected';
        const context: Partial<ErrorContext> = {
          path: 'C:\\invalid<>path',
          platform: 'win32',
        };

        const classified = errorClassifier.classifyError(errorMessage, context);

        expect(classified.code).toBe(ErrorCode.PATH_INVALID_FORMAT);
        expect(classified.category).toBe(ErrorCategory.PATH_FORMAT);
        expect(classified.originalError).toBeUndefined();
        expect(classified.message.toLowerCase()).toContain('invalid');
      });

      it('should generate unique IDs and correlation IDs', () => {
        const error1 = errorClassifier.classifyError('Error 1', {});
        const error2 = errorClassifier.classifyError('Error 2', {});

        expect(error1.id).not.toBe(error2.id);
        expect(error1.correlationId).not.toBe(error2.correlationId);
        expect(error1.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      });

      it('should use provided correlation ID', () => {
        const correlationId = 'custom-correlation-id';
        const context: Partial<ErrorContext> = { correlationId };

        const classified = errorClassifier.classifyError('Test error', context);

        expect(classified.correlationId).toBe(correlationId);
      });

      it('should link parent and child errors', () => {
        const parentError = errorClassifier.classifyError('Parent error', {});
        const childError = errorClassifier.classifyError('Child error', {}, parentError.id);

        expect(childError.parentErrorId).toBe(parentError.id);
        expect(parentError.childErrorIds).toContain(childError.id);
      });
    });

    describe('createErrorResponse', () => {
      it('should create API error response with minimal context', () => {
        const error = new Error('Test error');
        const classified = errorClassifier.classifyError(error, {
          path: '/test/path',
        });
        const response = errorClassifier.createErrorResponse(classified, false);

        expect(response.error.id).toBe(classified.id);
        expect(response.error.code).toBe(classified.code);
        expect(response.error.message).toBe(classified.message);
        expect(response.error.context).toBeUndefined();
        expect(response.path).toBe('/test/path');
      });

      it('should create API error response with full context', () => {
        const error = new Error('Test error');
        const context: Partial<ErrorContext> = {
          path: '/test/path',
          requestId: 'req-123',
          platform: 'linux',
          userId: 'sensitive-user-id',
        };
        const classified = errorClassifier.classifyError(error, context);
        const response = errorClassifier.createErrorResponse(classified, true);

        expect(response.error.context).toBeDefined();
        expect(response.error.context?.platform).toBe('linux');
        expect(response.error.context?.userId).toBeUndefined(); // Should be sanitized
        expect(response.requestId).toBe('req-123');
      });
    });

    describe('getErrorStatistics', () => {
      it('should return empty statistics for no errors', () => {
        const stats = errorClassifier.getErrorStatistics();

        expect(stats.totalErrors).toBe(0);
        expect(stats.mostCommonErrors).toHaveLength(0);
      });

      it('should calculate statistics correctly', () => {
        // Create multiple errors
        errorClassifier.classifyError('Path not found', { path: '/path1' });
        errorClassifier.classifyError('Path not found', { path: '/path2' });
        errorClassifier.classifyError('Permission denied', { path: '/path3' });

        const stats = errorClassifier.getErrorStatistics();

        expect(stats.totalErrors).toBe(3);
        expect(stats.errorsByCategory[ErrorCategory.PATH_VALIDATION]).toBe(2);
        expect(stats.errorsByCategory[ErrorCategory.PATH_PERMISSION]).toBe(1);
        expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(3);
        expect(stats.mostCommonErrors[0].code).toBe(ErrorCode.PATH_NOT_FOUND);
        expect(stats.mostCommonErrors[0].count).toBe(2);
      });

      it('should filter statistics by time range', () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Create errors (they will have current timestamp)
        errorClassifier.classifyError('Recent error 1', {});
        errorClassifier.classifyError('Recent error 2', {});

        // Get all errors first to verify they exist
        const allStats = errorClassifier.getErrorStatistics();
        expect(allStats.totalErrors).toBeGreaterThanOrEqual(2);

        // Now test time filtering with a very wide range to ensure we capture the errors
        const stats = errorClassifier.getErrorStatistics({
          start: oneHourAgo,
          end: new Date(now.getTime() + 60 * 60 * 1000), // One hour in the future
        });

        expect(stats.totalErrors).toBeGreaterThanOrEqual(2);
        expect(stats.timeRange.start).toEqual(oneHourAgo);
      });
    });

    describe('getCorrelatedErrors', () => {
      it('should return null for non-existent correlation ID', () => {
        const correlation = errorClassifier.getCorrelatedErrors('non-existent');
        expect(correlation).toBeNull();
      });

      it('should return correlated errors', () => {
        const correlationId = 'test-correlation';
        const context: Partial<ErrorContext> = { correlationId };

        const error1 = errorClassifier.classifyError('Error 1', context);
        const error2 = errorClassifier.classifyError('Error 2', context);

        const correlation = errorClassifier.getCorrelatedErrors(correlationId);

        expect(correlation).not.toBeNull();
        expect(correlation?.correlationId).toBe(correlationId);
        expect(correlation?.relatedErrors ?? []).toHaveLength(2);
        expect((correlation?.relatedErrors ?? []).map((e) => e.id)).toContain(error1.id);
        expect((correlation?.relatedErrors ?? []).map((e) => e.id)).toContain(error2.id);
        expect(correlation?.timeline).toHaveLength(2);
      });

      it('should determine root cause correctly', () => {
        const correlationId = 'test-correlation';
        const context: Partial<ErrorContext> = { correlationId };

        // Create a critical error first
        const criticalError = errorClassifier.classifyError('System resource exhausted', context);
        const _mediumError = errorClassifier.classifyError('Path too long', context);

        const correlation = errorClassifier.getCorrelatedErrors(correlationId);

        expect(correlation?.rootCause?.id).toBe(criticalError.id);
      });
    });

    describe('resolveError', () => {
      it('should mark error as resolved', () => {
        const classified = errorClassifier.classifyError('Test error', {});
        const resolved = errorClassifier.resolveError(classified.id, 'Fixed by user');

        expect(resolved).toBe(true);
        expect(classified.resolved).toBe(true);
        expect(classified.resolution).toBe('Fixed by user');
        expect(classified.resolvedAt).toBeInstanceOf(Date);
      });

      it('should return false for non-existent error', () => {
        const resolved = errorClassifier.resolveError('non-existent', 'Resolution');
        expect(resolved).toBe(false);
      });
    });
  });

  describe('ErrorFormatter', () => {
    let testError: ClassifiedError;

    beforeEach(() => {
      testError = errorClassifier.classifyError('Test error message', {
        path: '/test/path',
        requestId: 'test-request',
        platform: 'linux',
        duration: 1500,
      });
    });

    describe('formatForAPI', () => {
      it('should format error for API response', () => {
        const response = errorFormatter.formatForAPI(testError);

        expect(response.error.id).toBe(testError.id);
        expect(response.error.code).toBe(testError.code);
        expect(response.error.message).toBe(testError.message);
        expect(response.error.suggestions.length).toBeGreaterThan(0);
        expect(response.path).toBe('/test/path');
        expect(response.requestId).toBe('test-request');
      });

      it('should respect formatting options', () => {
        const response = errorFormatter.formatForAPI(testError, {
          includeSuggestions: false,
          includeContext: true,
          maxSuggestions: 1,
        });

        expect(response.error.suggestions).toHaveLength(0);
        expect(response.error.context).toBeDefined();
      });
    });

    describe('formatForConsole', () => {
      it('should format error for console output', () => {
        const consoleOutput = errorFormatter.formatForConsole(testError, {
          useColors: false,
          maxWidth: 60,
        });

        expect(consoleOutput).toContain(testError.title);
        expect(consoleOutput).toContain(testError.id);
        expect(consoleOutput).toContain(testError.code);
        expect(consoleOutput).toContain(testError.message);
        expect(consoleOutput).toContain('Suggested Actions');
      });

      it('should include colors when requested', () => {
        const consoleOutput = errorFormatter.formatForConsole(testError, {
          useColors: true,
        });

        expect(consoleOutput).toContain('\x1b['); // ANSI color codes
      });

      it('should limit suggestions based on options', () => {
        const consoleOutput = errorFormatter.formatForConsole(testError, {
          maxSuggestions: 1,
          useColors: false,
        });

        // Check that suggestions section exists and is limited
        expect(consoleOutput).toContain('Suggested Actions');

        // Count suggestion numbers only in the suggestions section
        const suggestionsSection = consoleOutput.split('Suggested Actions:')[1];
        if (suggestionsSection) {
          const suggestionMatches = suggestionsSection.split('Learn More:')[0].match(/^\s*\d+\./gm);
          expect(suggestionMatches?.length || 0).toBeLessThanOrEqual(1);
        }
      });
    });

    describe('formatForLogging', () => {
      it('should format error for structured logging', () => {
        const logData = errorFormatter.formatForLogging(testError);

        expect(logData.errorId).toBe(testError.id);
        expect(logData.code).toBe(testError.code);
        expect(logData.category).toBe(testError.category);
        expect(logData.severity).toBe(testError.severity);
        expect(logData.timestamp).toBe(testError.timestamp.toISOString());
        expect(logData.context).toBeDefined();
        expect(logData.suggestions).toBeInstanceOf(Array);
      });
    });

    describe('formatErrorSummary', () => {
      it('should format multiple errors as summary', () => {
        const error1 = errorClassifier.classifyError('Critical error', {}, undefined);
        const error2 = errorClassifier.classifyError('Path not found', {
          path: '/test',
        });
        const error3 = errorClassifier.classifyError('Permission denied', {
          path: '/restricted',
        });

        // Manually set severity for testing
        error1.severity = ErrorSeverity.CRITICAL;

        const summary = errorFormatter.formatErrorSummary([error1, error2, error3], {
          useColors: false,
        });

        expect(summary).toContain('Error Summary (3 errors)');
        expect(summary).toContain('CRITICAL (1)');
        expect(summary).toContain('HIGH (2)');
        expect(summary).toContain(error1.title);
        expect(summary).toContain(error2.title);
        expect(summary).toContain(error3.title);
      });

      it('should handle empty error list', () => {
        const summary = errorFormatter.formatErrorSummary([]);
        expect(summary).toBe('No errors to display.');
      });
    });

    describe('createUserFriendlyMessage', () => {
      it('should create user-friendly messages for common errors', () => {
        const pathError = errorClassifier.classifyError('Path not found', {
          path: '/missing/path',
        });

        const friendlyMessage = errorFormatter.createUserFriendlyMessage(pathError);

        expect(friendlyMessage).toContain('/missing/path');
        expect(friendlyMessage).toContain("couldn't find");
        expect(friendlyMessage.length).toBeGreaterThan(pathError.message.length);
      });

      it('should fall back to original message for unknown errors', () => {
        const unknownError = errorClassifier.classifyError('Unknown error type', {});
        const friendlyMessage = errorFormatter.createUserFriendlyMessage(unknownError);

        expect(friendlyMessage).toBe(unknownError.message);
      });
    });
  });

  describe('Error Type Definitions', () => {
    it('should have all required error categories', () => {
      const categories = Object.values(ErrorCategory);

      expect(categories).toContain(ErrorCategory.PATH_VALIDATION);
      expect(categories).toContain(ErrorCategory.PATH_PERMISSION);
      expect(categories).toContain(ErrorCategory.NETWORK);
      expect(categories).toContain(ErrorCategory.LLM_PROVIDER);
      expect(categories).toContain(ErrorCategory.HTTP_REQUEST);
      expect(categories).toContain(ErrorCategory.ANALYSIS);
    });

    it('should have all required error severities', () => {
      const severities = Object.values(ErrorSeverity);

      expect(severities).toContain(ErrorSeverity.LOW);
      expect(severities).toContain(ErrorSeverity.MEDIUM);
      expect(severities).toContain(ErrorSeverity.HIGH);
      expect(severities).toContain(ErrorSeverity.CRITICAL);
    });

    it('should have comprehensive error codes', () => {
      const codes = Object.values(ErrorCode);

      // Path-related codes
      expect(codes).toContain(ErrorCode.PATH_NOT_FOUND);
      expect(codes).toContain(ErrorCode.PATH_INVALID_FORMAT);
      expect(codes).toContain(ErrorCode.PATH_TOO_LONG);

      // Permission codes
      expect(codes).toContain(ErrorCode.PERMISSION_READ_DENIED);
      expect(codes).toContain(ErrorCode.PERMISSION_WRITE_DENIED);

      // Network codes
      expect(codes).toContain(ErrorCode.NETWORK_TIMEOUT);
      expect(codes).toContain(ErrorCode.NETWORK_UNREACHABLE);

      // LLM codes
      expect(codes).toContain(ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED);
      expect(codes).toContain(ErrorCode.LLM_PROVIDER_AUTHENTICATION_FAILED);

      // HTTP codes
      expect(codes).toContain(ErrorCode.HTTP_NOT_FOUND);
      expect(codes).toContain(ErrorCode.HTTP_INTERNAL_SERVER_ERROR);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error lifecycle', () => {
      // 1. Classify error
      const error = new Error('Path not found: /test/repo');
      const context: Partial<ErrorContext> = {
        path: '/test/repo',
        requestId: 'integration-test',
        platform: 'linux',
      };

      const classified = errorClassifier.classifyError(error, context);

      // 2. Create API response
      const apiResponse = errorClassifier.createErrorResponse(classified);
      expect(apiResponse.error.code).toBe(ErrorCode.PATH_NOT_FOUND);

      // 3. Format for console
      const consoleOutput = errorFormatter.formatForConsole(classified, {
        useColors: false,
      });
      expect(consoleOutput).toContain('Repository Path Not Found');

      // 4. Format for logging
      const logData = errorFormatter.formatForLogging(classified);
      expect(logData.errorId).toBe(classified.id);

      // 5. Get statistics
      const stats = errorClassifier.getErrorStatistics();
      expect(stats.totalErrors).toBe(1);

      // 6. Resolve error
      const resolved = errorClassifier.resolveError(classified.id, 'Path created');
      expect(resolved).toBe(true);
      expect(classified.resolved).toBe(true);
    });

    it('should handle error correlation across multiple operations', () => {
      const correlationId = 'multi-op-correlation';
      const baseContext: Partial<ErrorContext> = { correlationId };

      // Simulate multiple related errors
      const _pathError = errorClassifier.classifyError('Path not found', {
        ...baseContext,
        path: '/missing/repo',
      });

      const _permissionError = errorClassifier.classifyError('Permission denied', {
        ...baseContext,
        path: '/restricted/repo',
      });

      const _networkError = errorClassifier.classifyError('Network timeout', {
        ...baseContext,
        url: 'https://api.example.com',
      });

      // Get correlation
      const correlation = errorClassifier.getCorrelatedErrors(correlationId);
      expect(correlation).not.toBeNull();
      expect(correlation?.relatedErrors).toHaveLength(3);

      // Create summary
      const summary = errorFormatter.formatErrorSummary(correlation?.relatedErrors ?? [], {
        useColors: false,
      });
      expect(summary).toContain('Error Summary (3 errors)');
    });
  });
});
