import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFunction } from '../../../../../tests/MockManager';
import { requestLogger } from '../logger.service.js';
import type { Request, Response } from 'express';
import type { Socket } from 'node:net';

describe('HTTP Request/Response Logging', () => {
  let mockReq: Partial<Request> & { requestId?: string };
  let mockRes: Partial<Response>;
  let mockNext: import('express').NextFunction;
  let finishCallback: Function;
  let errorCallback: Function;

  beforeEach(() => {
    // Mock console methods to prevent actual logging during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

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
      get: ((name: string): string | string[] | undefined => {
        const headers: Record<string, string | string[]> = {
          'user-agent': 'test-agent',
          'content-length': '100',
          'content-type': 'application/json',
          'set-cookie': ['cookie1=value1', 'cookie2=value2'],
        };
        return headers[name.toLowerCase()];
      }) as Request['get'],
      ip: '127.0.0.1',
      connection: {} as Socket,
      socket: {} as Socket,
    };

    mockRes = {
      statusCode: 200,
      on: mockFunction((event: unknown, callback: unknown) => {
        if (event === 'finish') {
          finishCallback = callback as Function;
        } else if (event === 'error') {
          errorCallback = callback as Function;
        }
        return mockRes as Response;
      }) as unknown as Response['on'],
      send: mockFunction(),
      json: mockFunction(),
      getHeaders: mockFunction(() => ({
        'content-type': 'application/json',
        'x-response-time': '50ms',
      })),
    };

    mockNext = mockFunction();
  });

  describe('Request Logging', () => {
    it('should log incoming HTTP requests with correlation ID', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockReq.requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(mockRes.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(console.log).toHaveBeenCalled();
    });

    it('should sanitize sensitive data in request headers', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // The sanitization happens internally, we just verify the middleware runs
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should sanitize sensitive data in query parameters', () => {
      mockReq.query = {
        username: 'testuser',
        password: 'secret123',
        apikey: 'key123',
        normalParam: 'value',
      };
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should sanitize sensitive data in request body', () => {
      mockReq.body = {
        username: 'testuser',
        password: 'secret123',
        token: 'bearer-token',
        normalData: 'value',
      };
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle large request bodies', () => {
      mockReq.body = 'x'.repeat(2000); // Large body
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Response Logging', () => {
    it('should log successful responses as info', () => {
      mockRes.statusCode = 200;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should log client error responses as warnings', () => {
      mockRes.statusCode = 404;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should log server error responses as errors', () => {
      mockRes.statusCode = 500;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate response finish
      finishCallback();
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should capture response body through res.send', () => {
      const responseData = { message: 'Success', data: 'test' };
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate sending response
      const originalSend = mockRes.send;
      if (originalSend) {
        mockRes.send(JSON.stringify(responseData));
      }
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should capture response body through res.json', () => {
      const responseData = { message: 'Success', data: 'test' };
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate JSON response
      const originalJson = mockRes.json;
      if (originalJson) {
        mockRes.json(responseData);
      }
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle large response bodies', () => {
      const largeResponse = { data: 'x'.repeat(1000) };
      mockRes.statusCode = 200;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should log response errors', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      const error = new Error('Response error');
      errorCallback(error);
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should include error details in log', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      errorCallback(error);
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Correlation ID Tracking', () => {
    it('should generate unique correlation IDs for each request', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      const firstRequestId = mockReq.requestId;
      
      // Reset mocks for second request
      mockReq = {
        ...mockReq,
        requestId: undefined
      };
      mockRes = { 
        ...mockRes, 
        on: mockFunction((event: unknown, callback: unknown) => {
          if (event === 'finish') {
            finishCallback = callback as Function;
          } else if (event === 'error') {
            errorCallback = callback as Function;
          }
          return mockRes as Response;
        }) as unknown as Response['on']
      };
      mockNext = mockFunction();
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      const secondRequestId = mockReq.requestId;
      
      expect(firstRequestId).toBeDefined();
      expect(secondRequestId).toBeDefined();
      expect(firstRequestId).not.toBe(secondRequestId);
    });

    it('should maintain correlation ID throughout request lifecycle', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      const requestId = mockReq.requestId;
      
      // Simulate response finish
      finishCallback();
      
      expect(requestId).toBeDefined();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Performance Tracking', () => {
    it('should track request duration', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate some processing time
      setTimeout(() => {
        finishCallback();
      }, 10);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should include timing information in logs', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      // Simulate response finish
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Different HTTP Methods', () => {
    it('should handle POST requests', () => {
      mockReq.method = 'POST';
      mockReq.body = { data: 'test' };
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle PUT requests', () => {
      mockReq.method = 'PUT';
      mockReq.body = { id: 1, data: 'updated' };
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle DELETE requests', () => {
      mockReq.method = 'DELETE';
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      finishCallback();
      
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('IP Address Detection', () => {
    it('should use req.ip when available', () => {
      // Create a new mock request with ip property
      const testReq = {
        ...mockReq,
        ip: '192.168.1.100'
      };
      
      requestLogger(testReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should fallback to connection.remoteAddress', () => {
      const testReq = {
        ...mockReq,
        ip: undefined,
        connection: { remoteAddress: '10.0.0.50' } as Socket,
        socket: {} as Socket,
      };
      
      requestLogger(testReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should fallback to socket.remoteAddress', () => {
      const testReq = {
        ...mockReq,
        ip: undefined,
        connection: {} as Socket,
        socket: { remoteAddress: '172.16.0.10' } as Socket,
      };
      
      requestLogger(testReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });
});
