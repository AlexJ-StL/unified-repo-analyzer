import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFunction } from '../../../../../tests/MockManager.js';
import { logger, requestLogger } from '../logger.service.js';

describe('HTTP Request/Response Logging', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  let finishCallback: (() => void) | undefined;
  let errorCallback: ((error: Error) => void) | undefined;

  beforeEach(() => {
    // Mock the logger methods to track calls
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    mockReq = {
      method: 'GET',
      url: '/api/test',
      path: '/api/test',
      query: { param1: 'value1', password: 'secret123' },
      headers: {
        'user-agent': 'test-agent',
        authorization: 'Bearer token123',
        'content-type': 'application/json',
        'x-api-key': 'api-key-123',
      },
      body: {
        username: 'testuser',
        password: 'secret456',
        data: 'normal-data',
      },
      get: mockFunction((header: unknown) => {
        const headers: Record<string, string> = {
          'User-Agent': 'test-agent',
          'Content-Length': '100',
          'Content-Type': 'application/json',
        };
        return headers[header as string];
      }) as unknown as (header: string) => string | undefined,
      ip: '127.0.0.1',
      connection: { remoteAddress: '192.168.1.1' },
      socket: { remoteAddress: '10.0.0.1' },
    };

    mockRes = {
      statusCode: 200,
      on: mockFunction((event: unknown, callback: unknown) => {
        if (event === 'finish') {
          finishCallback = callback as () => void;
        } else if (event === 'error') {
          errorCallback = callback as (error: Error) => void;
        }
      }) as unknown as (event: string, callback: (...args: unknown[]) => void) => void,
      send: mockFunction((body: unknown) => {
        // Simulate the actual send method behavior
        return body;
      }),
      json: mockFunction((obj: unknown) => {
        // Simulate the actual json method behavior
        return JSON.stringify(obj);
      }),
      getHeaders: mockFunction(() => ({
        'content-type': 'application/json',
        'x-response-time': '50ms',
      })),
    };

    mockNext = mockFunction();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Logging', () => {
    it('should log incoming HTTP requests with correlation ID', () => {
      requestLogger(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(mockRes.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith(
        'HTTP Request Started',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
        }),
        'http-middleware',
        expect.any(String)
      );
    });

    it('should sanitize sensitive data in request headers', () => {
      requestLogger(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();

      // Verify that sensitive headers are redacted
      const callArgs = (logger.info as unknown as ReturnType<typeof vi.spyOn>).mock.calls.find(
        (call: unknown) => (call as unknown[])[0] === 'HTTP Request Started'
      );
      if (callArgs) {
        const requestData = callArgs[1] as Record<string, unknown>;
        expect((requestData.headers as Record<string, unknown>).authorization).toBe('[REDACTED]');
        expect((requestData.headers as Record<string, unknown>)['x-api-key']).toBe('[REDACTED]');
      }
    });

    it('should sanitize sensitive data in query parameters', () => {
      mockReq.query = {
        username: 'testuser',
        password: 'secret123',
        apikey: 'key123',
        normalParam: 'value',
      };

      requestLogger(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();

      // Verify that sensitive query params are redacted
      const callArgs = (logger.info as unknown as ReturnType<typeof vi.spyOn>).mock.calls.find(
        (call: unknown) => (call as unknown[])[0] === 'HTTP Request Started'
      );
      if (callArgs) {
        const requestData = callArgs[1] as Record<string, unknown>;
        expect((requestData.query as Record<string, unknown>).password).toBe('[REDACTED]');
        expect((requestData.query as Record<string, unknown>).apikey).toBe('[REDACTED]');
      }
    });

    it('should sanitize sensitive data in request body', () => {
      mockReq.body = {
        username: 'testuser',
        password: 'secret123',
        token: 'bearer-token',
        normalData: 'value',
      };

      requestLogger(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();

      // Verify that sensitive body fields are redacted
      const callArgs = (logger.info as unknown as ReturnType<typeof vi.spyOn>).mock.calls.find(
        (call: unknown) => (call as unknown[])[0] === 'HTTP Request Started'
      );
      if (callArgs) {
        const requestData = callArgs[1] as Record<string, unknown>;
        expect((requestData.body as Record<string, unknown>).password).toBe('[REDACTED]');
        expect((requestData.body as Record<string, unknown>).token).toBe('[REDACTED]');
      }
    });
  });

  describe('Response Logging', () => {
    it('should log successful responses as info', () => {
      mockRes.statusCode = 200;
      requestLogger(mockReq, mockRes, mockNext);

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      expect(logger.info).toHaveBeenCalledWith(
        'HTTP Request Completed',
        expect.objectContaining({
          method: 'GET',
          status: 200,
        }),
        'http-middleware',
        expect.any(String)
      );
    });

    it('should log client error responses as warnings', () => {
      mockRes.statusCode = 404;
      requestLogger(mockReq, mockRes, mockNext);

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      expect(logger.warn).toHaveBeenCalledWith(
        'HTTP Request Completed',
        expect.objectContaining({
          method: 'GET',
          status: 404,
        }),
        'http-middleware',
        expect.any(String)
      );
    });

    it('should log server error responses as errors', () => {
      mockRes.statusCode = 500;
      requestLogger(mockReq, mockRes, mockNext);

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      expect(logger.error).toHaveBeenCalledWith(
        'HTTP Request Completed',
        undefined,
        expect.objectContaining({
          method: 'GET',
          status: 500,
        }),
        'http-middleware',
        expect.any(String)
      );
    });
  });

  describe('Error Handling', () => {
    it('should log response errors', () => {
      requestLogger(mockReq, mockRes, mockNext);

      const error = new Error('Response error');
      if (errorCallback) {
        errorCallback(error);
      }

      expect(logger.error).toHaveBeenCalledWith(
        'HTTP Request Error',
        error,
        expect.objectContaining({
          method: 'GET',
          error: 'Response error',
        }),
        'http-middleware',
        expect.any(String)
      );
    });
  });

  describe('Different HTTP Methods', () => {
    it('should handle POST requests', () => {
      mockReq.method = 'POST';
      mockReq.body = { data: 'test' };

      requestLogger(mockReq, mockRes, mockNext);

      if (finishCallback) {
        finishCallback();
      }

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle PUT requests', () => {
      mockReq.method = 'PUT';
      mockReq.body = { id: 1, data: 'updated' };

      requestLogger(mockReq, mockRes, mockNext);

      if (finishCallback) {
        finishCallback();
      }

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle DELETE requests', () => {
      mockReq.method = 'DELETE';

      requestLogger(mockReq, mockRes, mockNext);

      if (finishCallback) {
        finishCallback();
      }

      expect(logger.info).toHaveBeenCalled();
    });
  });
});
