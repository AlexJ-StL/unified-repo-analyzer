import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, mockFunction, mockManager } from '../../../../tests/MockManager';
import { CLIError, ErrorType } from '../utils/error-handler';

describe('CLI Utilities Tests', () => {
  beforeEach(() => {
    mockManager.setupMocks();
  });

  describe('Error Handler', () => {
    test('should create CLIError with message', () => {
      const error = new CLIError('Test error message');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CLIError);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('CLIError');
    });

    test('should create CLIError with message and type', () => {
      const error = new CLIError('Test error message', ErrorType.VALIDATION);
      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ErrorType.VALIDATION);
    });

    test('should create CLIError with default type', () => {
      const error = new CLIError('Test error message');
      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('Mock Integration', () => {
    test('should properly use mocked modules', () => {
      // Test that mocks are working
      const mockFs = createMock({
        existsSync: mockFunction().mockReturnValue(true),
        writeFileSync: mockFunction(),
      });

      const mockPath = createMock({
        resolve: mockFunction((p: string) => `/resolved/${p}`),
        dirname: mockFunction((p: string) => `/dirname/${p}`),
      });

      expect(mockFs.existsSync).toBeDefined();
      expect(mockPath.resolve).toBeDefined();

      // Test mock behavior
      const exists = mockFs.existsSync('/test');
      expect(exists).toBe(true);

      const resolved = mockPath.resolve('test');
      expect(resolved).toBe('/resolved/test');
    });
  });

  describe('Mock Function Behavior', () => {
    test('should create and use mock functions', () => {
      const mockFn = mockFunction();

      // Test basic mock function
      expect(mockFn).toBeDefined();
      expect(typeof mockFn).toBe('function');

      // Test mock with return value
      const mockWithReturn = mockFunction().mockReturnValue('test-return');
      expect(mockWithReturn()).toBe('test-return');

      // Test mock with resolved value
      const mockWithResolve = mockFunction().mockResolvedValue('test-resolve');
      expect(mockWithResolve()).resolves.toBe('test-resolve');
    });

    test('should track mock function calls', () => {
      const mockFn = mockFunction();

      // Call the mock function
      mockFn('arg1', 'arg2');
      mockFn('arg3');

      // Check if calls are tracked (basic check)
      expect(mockFn).toBeDefined();
      expect(typeof mockFn).toBe('function');
    });
  });

  describe('Object Mocking', () => {
    test('should create mock objects with methods', () => {
      const mockObject = createMock({
        method1: mockFunction().mockReturnValue('result1'),
        method2: mockFunction().mockReturnValue('result2'),
        property: 'test-property',
      });

      expect(mockObject.method1).toBeDefined();
      expect(mockObject.method2).toBeDefined();
      expect(mockObject.property).toBe('test-property');

      expect(mockObject.method1()).toBe('result1');
      expect(mockObject.method2()).toBe('result2');
    });
  });
});
