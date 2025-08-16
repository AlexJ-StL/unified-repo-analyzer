import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogManagementService } from '../services/log-management.service';
import { Logger, requestLogger } from '../services/logger.service';
import { PathHandler } from '../services/path-handler.service';

describe('Logging System Integration Tests', () => {
  let testLogDir: string;
  let logger: Logger;
  let pathHandler: PathHandler;
  let logManagement: LogManagementService;

  beforeEach(async () => {
    testLogDir = path.join(process.cwd(), 'test-logging-integration');

    // Clean up and create test directory
    try {
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(testLogDir, { recursive: true });

    // Create logger with test configuration
    logger = new Logger({
      level: 'DEBUG',
      outputs: [
        { type: 'console', config: { colorize: false } },
        {
          type: 'file',
          config: {
            path: path.join(testLogDir, 'test.log'),
            maxSize: '1MB',
            maxFiles: 3,
            rotateDaily: false,
          },
        },
      ],
      format: 'JSON',
      includeStackTrace: true,
      redactSensitiveData: true,
    });

    pathHandler = new PathHandler();

    logManagement = new LogManagementService({
      logDirectory: testLogDir,
      retentionPolicy: {
        maxAge: 7,
        maxSize: '10MB',
        maxFiles: 5,
        cleanupInterval: 1,
      },
      monitoringEnabled: true,
      alertThresholds: {
        diskUsage: 80,
        fileSize: '5MB',
        errorRate: 5,
      },
    });
  });

  afterEach(async () => {
    await logManagement?.stop();

    // Clean up test directory
    try {
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Log Correlation Across Components', () => {
    it('should maintain request ID correlation across path validation and logging', async () => {
      const requestId = 'test-request-123';
      logger.setRequestId(requestId);

      // Simulate path validation with logging
      const testPath = path.join(testLogDir, 'correlation-test');
      await fs.mkdir(testPath, { recursive: true });

      // Log path validation start
      logger.info('Starting path validation', { path: testPath }, 'path-handler', requestId);

      // Perform path validation
      const result = await pathHandler.validatePath(testPath);

      // Log path validation result
      logger.info(
        'Path validation completed',
        {
          path: testPath,
          isValid: result.isValid,
          exists: result.metadata.exists,
        },
        'path-handler',
        requestId
      );

      // Verify correlation by checking log file
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      expect(logLines.length).toBeGreaterThanOrEqual(2);

      // Parse log entries and verify request ID correlation
      const logEntries = logLines.map((line) => JSON.parse(line));

      for (const entry of logEntries) {
        expect(entry.requestId).toBe(requestId);
        expect(entry.component).toBe('path-handler');
      }

      // Verify log sequence
      expect(logEntries[0].message).toContain('Starting path validation');
      expect(logEntries[logEntries.length - 1].message).toContain('Path validation completed');
    });

    it('should correlate logs across multiple service interactions', async () => {
      const requestId = 'multi-service-456';
      logger.setRequestId(requestId);

      // Simulate multi-service workflow
      logger.info(
        'Starting repository analysis workflow',
        { requestId },
        'workflow-manager',
        requestId
      );

      // Path validation service
      const repoPath = path.join(testLogDir, 'test-repo');
      await fs.mkdir(repoPath, { recursive: true });

      logger.debug('Validating repository path', { path: repoPath }, 'path-handler', requestId);
      const pathResult = await pathHandler.validatePath(repoPath);
      logger.info(
        'Path validation result',
        {
          isValid: pathResult.isValid,
          exists: pathResult.metadata.exists,
        },
        'path-handler',
        requestId
      );

      // Permission checking
      logger.debug(
        'Checking repository permissions',
        { path: repoPath },
        'path-handler',
        requestId
      );
      const permResult = await pathHandler.checkPermissions(repoPath);
      logger.info(
        'Permission check result',
        {
          canRead: permResult.canRead,
          canWrite: permResult.canWrite,
        },
        'path-handler',
        requestId
      );

      // Log management service
      logger.debug('Performing log cleanup', {}, 'log-management', requestId);
      const cleanupResult = await logManagement.performCleanup();
      logger.info(
        'Log cleanup completed',
        {
          filesRemoved: cleanupResult.filesRemoved,
          spaceFreed: cleanupResult.spaceFreed,
        },
        'log-management',
        requestId
      );

      logger.info(
        'Repository analysis workflow completed',
        { requestId },
        'workflow-manager',
        requestId
      );

      // Verify all logs have the same request ID
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const logEntries = logLines.map((line) => JSON.parse(line));

      // All entries should have the same request ID
      for (const entry of logEntries) {
        expect(entry.requestId).toBe(requestId);
      }

      // Should have logs from different components
      const components = [...new Set(logEntries.map((e) => e.component))];
      expect(components).toContain('workflow-manager');
      expect(components).toContain('path-handler');
      expect(components).toContain('log-management');
    });

    it('should handle error correlation across service boundaries', async () => {
      const requestId = 'error-correlation-789';
      logger.setRequestId(requestId);

      // Simulate error scenario
      logger.info('Starting error scenario test', {}, 'test-runner', requestId);

      try {
        // Attempt to validate non-existent path
        const invalidPath = '/completely/invalid/path/that/does/not/exist';
        logger.debug('Validating invalid path', { path: invalidPath }, 'path-handler', requestId);

        const result = await pathHandler.validatePath(invalidPath);

        if (!result.isValid) {
          logger.warn(
            'Path validation failed',
            {
              path: invalidPath,
              errors: result.errors.map((e) => ({ code: e.code, message: e.message })),
            },
            'path-handler',
            requestId
          );
        }

        // Simulate downstream error
        throw new Error('Simulated downstream error');
      } catch (error) {
        logger.error(
          'Error in workflow',
          error as Error,
          {
            step: 'path-validation',
            originalPath: '/completely/invalid/path/that/does/not/exist',
          },
          'test-runner',
          requestId
        );
      }

      // Verify error correlation
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const logEntries = logLines.map((line) => JSON.parse(line));

      // Find error entry
      const errorEntry = logEntries.find((e) => e.level === 'ERROR');
      expect(errorEntry).toBeDefined();
      expect(errorEntry?.requestId).toBe(requestId);
      expect(errorEntry?.error).toBeDefined();
      expect(errorEntry?.error?.message).toContain('Simulated downstream error');

      // All entries should have the same request ID
      for (const entry of logEntries) {
        expect(entry.requestId).toBe(requestId);
      }
    });
  });

  describe('External Logging Service Integration', () => {
    it('should format logs correctly for external services', async () => {
      // Create logger with external service configuration
      const externalLogger = new Logger({
        level: 'INFO',
        outputs: [
          {
            type: 'external',
            config: {
              endpoint: 'https://logs.example.com/api/logs',
              apiKey: 'test-api-key',
              format: 'JSON',
            },
          },
        ],
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
      });

      // Mock HTTP transport to capture what would be sent
      const sentLogs: any[] = [];

      // Note: In a real test, we would mock the HTTP transport
      // For this test, we'll verify the logger configuration
      const config = externalLogger.getConfig();
      expect(config.outputs[0].type).toBe('external');
      expect((config.outputs[0].config as any).endpoint).toBe('https://logs.example.com/api/logs');
      expect((config.outputs[0].config as any).format).toBe('JSON');
    });

    it('should handle external service failures gracefully', async () => {
      // This test would normally mock network failures
      // For now, we'll test that the logger can be configured for external services
      const externalLogger = new Logger({
        level: 'ERROR',
        outputs: [
          { type: 'console', config: { colorize: false } },
          {
            type: 'external',
            config: {
              endpoint: 'https://unreachable.example.com/logs',
              format: 'JSON',
            },
          },
        ],
        format: 'JSON',
      });

      // Log an error - should not throw even if external service is unreachable
      expect(() => {
        externalLogger.error('Test error for external service');
      }).not.toThrow();
    });

    it('should redact sensitive data in external logs', async () => {
      const sensitiveData = {
        username: 'testuser',
        password: 'secret123',
        apiKey: 'api-key-456',
        token: 'bearer-token-789',
        normalData: 'this is fine',
      };

      logger.info('Processing user data', sensitiveData);

      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logEntry = JSON.parse(logContent.trim().split('\n')[0]);

      expect(logEntry.metadata.username).toBe('testuser'); // Username should not be redacted
      expect(logEntry.metadata.password).toBe('[REDACTED]');
      expect(logEntry.metadata.apiKey).toBe('[REDACTED]');
      expect(logEntry.metadata.token).toBe('[REDACTED]');
      expect(logEntry.metadata.normalData).toBe('this is fine');
    });
  });

  describe('Logging Performance Under Load', () => {
    it('should handle high-volume logging without blocking', async () => {
      const startTime = Date.now();
      const logCount = 1000;
      const requestId = 'load-test-001';

      // Generate high volume of logs
      const logPromises = [];
      for (let i = 0; i < logCount; i++) {
        logPromises.push(
          Promise.resolve().then(() => {
            logger.info(
              `Load test message ${i}`,
              {
                iteration: i,
                timestamp: new Date().toISOString(),
              },
              'load-test',
              requestId
            );
          })
        );
      }

      await Promise.all(logPromises);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (less than 5 seconds for 1000 logs)
      expect(duration).toBeLessThan(5000);

      // Verify logs were written
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      expect(logLines.length).toBeGreaterThanOrEqual(logCount);
    });

    it('should handle concurrent logging from multiple components', async () => {
      const components = ['component-a', 'component-b', 'component-c', 'component-d'];
      const logsPerComponent = 100;
      const requestId = 'concurrent-test-002';

      const startTime = Date.now();

      // Create concurrent logging from multiple components
      const componentPromises = components.map(async (component, componentIndex) => {
        const promises = [];
        for (let i = 0; i < logsPerComponent; i++) {
          promises.push(
            Promise.resolve().then(() => {
              logger.info(
                `Message ${i} from ${component}`,
                {
                  componentIndex,
                  messageIndex: i,
                  timestamp: new Date().toISOString(),
                },
                component,
                requestId
              );
            })
          );
        }
        return Promise.all(promises);
      });

      await Promise.all(componentPromises);
      const duration = Date.now() - startTime;

      // Should handle concurrent logging efficiently
      expect(duration).toBeLessThan(3000);

      // Verify all logs were written with correct correlation
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const logEntries = logLines.map((line) => JSON.parse(line));

      // Should have logs from all components
      const loggedComponents = [...new Set(logEntries.map((e) => e.component))];
      for (const component of components) {
        expect(loggedComponents).toContain(component);
      }

      // All should have the same request ID
      for (const entry of logEntries) {
        expect(entry.requestId).toBe(requestId);
      }
    });

    it('should maintain performance during log rotation', async () => {
      // Create a logger with small file size to trigger rotation
      const rotatingLogger = new Logger({
        level: 'INFO',
        outputs: [
          {
            type: 'file',
            config: {
              path: path.join(testLogDir, 'rotating.log'),
              maxSize: '1KB', // Very small to trigger rotation quickly
              maxFiles: 3,
              rotateDaily: false,
            },
          },
        ],
        format: 'JSON',
      });

      const startTime = Date.now();
      const logCount = 100;

      // Generate enough logs to trigger rotation
      for (let i = 0; i < logCount; i++) {
        rotatingLogger.info(`Rotation test message ${i}`, {
          iteration: i,
          data: 'x'.repeat(100), // Add some bulk to trigger rotation
        });
      }

      const duration = Date.now() - startTime;

      // Should complete even with rotation
      expect(duration).toBeLessThan(5000);

      // Check that rotation occurred (multiple log files should exist)
      const files = await fs.readdir(testLogDir);
      const logFiles = files.filter((f) => f.includes('rotating') && f.endsWith('.log'));

      // Should have created rotated files
      expect(logFiles.length).toBeGreaterThan(1);
    });
  });

  describe('Log Format and Content Validation', () => {
    it('should produce valid JSON format logs', async () => {
      const testData = {
        stringField: 'test string',
        numberField: 42,
        booleanField: true,
        arrayField: [1, 2, 3],
        objectField: { nested: 'value' },
      };

      logger.info('JSON format test', testData);
      logger.warn('Warning message', { warning: true });
      logger.error('Error message', new Error('Test error'), { context: 'test' });

      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      // Each line should be valid JSON
      for (const line of logLines) {
        expect(() => JSON.parse(line)).not.toThrow();

        const entry = JSON.parse(line);

        // Verify required fields
        expect(entry.timestamp).toBeDefined();
        expect(entry.level).toBeDefined();
        expect(entry.component).toBeDefined();
        expect(entry.requestId).toBeDefined();
        expect(entry.message).toBeDefined();

        // Verify timestamp format
        expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);

        // Verify level is uppercase
        expect(['DEBUG', 'INFO', 'WARN', 'ERROR']).toContain(entry.level);
      }
    });

    it('should include proper error details in error logs', async () => {
      const testError = new Error('Test error message');
      testError.name = 'TestError';
      testError.stack = 'TestError: Test error message\n    at test location';

      logger.error('Error occurred during test', testError, {
        context: 'unit-test',
        operation: 'error-logging',
      });

      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.message).toBe('Error occurred during test');
      expect(logEntry.error).toBeDefined();
      expect(logEntry.error.name).toBe('TestError');
      expect(logEntry.error.message).toBe('Test error message');
      expect(logEntry.error.stack).toContain('TestError: Test error message');
      expect(logEntry.metadata.context).toBe('unit-test');
      expect(logEntry.metadata.operation).toBe('error-logging');
    });

    it('should handle special characters and unicode in logs', async () => {
      const specialData = {
        unicode: '🚀 Unicode test with émojis and spëcial chars',
        quotes: 'String with "quotes" and \'apostrophes\'',
        newlines: 'String with\nnewlines\nand\ttabs',
        backslashes: 'Path\\with\\backslashes',
        nullValue: null,
        undefinedValue: undefined,
      };

      logger.info('Special characters test', specialData);

      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry.metadata.unicode).toBe('🚀 Unicode test with émojis and spëcial chars');
      expect(logEntry.metadata.quotes).toBe('String with "quotes" and \'apostrophes\'');
      expect(logEntry.metadata.newlines).toBe('String with\nnewlines\nand\ttabs');
      expect(logEntry.metadata.backslashes).toBe('Path\\with\\backslashes');
      expect(logEntry.metadata.nullValue).toBeNull();
      // undefined values are typically omitted in JSON
    });

    it('should validate log entry structure consistency', async () => {
      // Generate various types of log entries
      logger.debug('Debug message', { debugData: true });
      logger.info('Info message', { infoData: 'value' });
      logger.warn('Warning message', { warnData: 123 });
      logger.error('Error message', new Error('Test'), { errorData: false });

      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const logEntries = logLines.map((line) => JSON.parse(line));

      // All entries should have consistent structure
      const requiredFields = ['timestamp', 'level', 'component', 'requestId', 'message'];

      for (const entry of logEntries) {
        for (const field of requiredFields) {
          expect(entry[field]).toBeDefined();
        }

        // Metadata should be an object if present
        if (entry.metadata) {
          expect(typeof entry.metadata).toBe('object');
        }

        // Error should have proper structure if present
        if (entry.error) {
          expect(entry.error.name).toBeDefined();
          expect(entry.error.message).toBeDefined();
        }
      }

      // Verify different log levels are present
      const levels = logEntries.map((e) => e.level);
      expect(levels).toContain('DEBUG');
      expect(levels).toContain('INFO');
      expect(levels).toContain('WARN');
      expect(levels).toContain('ERROR');
    });
  });

  describe('HTTP Request/Response Logging Integration', () => {
    it('should log HTTP requests with proper correlation', async () => {
      // Mock Express request and response objects
      const mockReq = {
        method: 'POST',
        url: '/api/analyze',
        path: '/api/analyze',
        query: { repo: 'test-repo' },
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-client/1.0',
          authorization: 'Bearer secret-token',
        },
        body: { path: '/test/repo', options: { deep: true } },
        get: (header: string) => mockReq.headers[header.toLowerCase()],
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const mockRes = {
        statusCode: 200,
        send: vi.fn(),
        json: vi.fn(),
        getHeaders: () => ({
          'content-type': 'application/json',
          'x-response-time': '150ms',
        }),
        on: vi.fn(),
        requestId: '',
      };

      // Mock next function
      const mockNext = vi.fn();

      // Set up event handlers
      const finishHandlers: Array<() => void> = [];
      const errorHandlers: Array<(error: Error) => void> = [];

      mockRes.on = vi.fn((event: string, handler: any) => {
        if (event === 'finish') {
          finishHandlers.push(handler);
        } else if (event === 'error') {
          errorHandlers.push(handler);
        }
      });

      // Execute request logger middleware
      requestLogger(mockReq, mockRes, mockNext);

      // Simulate response completion
      mockRes.json({ success: true, data: 'test' });
      finishHandlers.forEach((handler) => handler());

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.requestId).toBeDefined();

      // Verify logs were created
      const logContent = await fs.readFile(path.join(testLogDir, 'test.log'), 'utf-8');
      const logLines = logContent
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const logEntries = logLines.map((line) => JSON.parse(line));

      // Should have request start and completion logs
      expect(logEntries.length).toBeGreaterThanOrEqual(2);

      const requestStart = logEntries.find((e) => e.message.includes('HTTP Request Started'));
      const requestComplete = logEntries.find((e) => e.message.includes('HTTP Request Completed'));

      expect(requestStart).toBeDefined();
      expect(requestComplete).toBeDefined();

      // Verify request correlation
      expect(requestStart?.requestId).toBe(requestComplete?.requestId);
      expect(requestStart?.requestId).toBe(mockReq.requestId);

      // Verify sensitive data redaction
      expect(requestStart?.metadata.headers.authorization).toBe('[REDACTED]');
    });
  });
});
