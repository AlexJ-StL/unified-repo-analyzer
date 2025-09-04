/**
 * Error Message Service Tests - Fixed Version
 * Demonstrates the standardized service test pattern using MockManager
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockManager } from '../../../../../tests/MockManager';

// Import the service to test
import { ErrorMessageService } from '../error-message.service';
import type { PathError, PathWarning } from '../path-handler.service';

describe('ErrorMessageService - Fixed', () => {
  let errorService: ErrorMessageService;

  beforeEach(() => {
    // Setup mocks before each test
    mockManager.setupMocks();

    // Create service instance
    errorService = new ErrorMessageService();
  });

  afterEach(() => {
    // Cleanup mocks after each test
    mockManager.cleanupMocks();
  });

  describe('Basic Functionality', () => {
    it('should create error service instance', () => {
      expect(errorService).toBeInstanceOf(ErrorMessageService);
    });

    it('should create path error messages without throwing', () => {
      const errors: PathError[] = [
        {
          code: 'INVALID_CHARACTERS',
          message: 'Invalid characters in path',
          path: '/test/path<>',
          severity: 'error',
          suggestions: ['Remove invalid characters'],
        },
      ];
      const warnings: PathWarning[] = [];

      // Test that the service methods don't throw
      expect(() => {
        const result = errorService.createPathErrorMessage(errors, warnings);
        expect(result).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.message).toBeDefined();
      }).not.toThrow();
    });

    it('should create network error messages', () => {
      const path = '/test/network/path';
      const errorDetails = 'Connection timeout';

      expect(() => {
        const result = errorService.createNetworkErrorMessage(path, errorDetails);
        expect(result).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.message).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Timeout and Cancellation Messages', () => {
    it('should create timeout error messages', () => {
      const path = '/test/timeout/path';

      expect(() => {
        const result = errorService.createTimeoutErrorMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Operation Timed Out');
        expect(result.message).toContain(path);
      }).not.toThrow();
    });

    it('should create operation cancelled messages', () => {
      const path = '/test/cancelled/path';

      expect(() => {
        const result = errorService.createOperationCancelledMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Operation Cancelled');
        expect(result.message).toContain(path);
      }).not.toThrow();
    });
  });

  describe('Security Error Messages', () => {
    it('should create null byte error messages', () => {
      const path = '/test/null\0byte/path';

      expect(() => {
        const result = errorService.createNullByteErrorMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Invalid Path - Security Risk');
        expect(result.message).toContain('null byte');
      }).not.toThrow();
    });

    it('should create control characters error messages', () => {
      const path = '/test/control\x01char/path';
      const errors: PathError[] = [
        {
          code: 'CONTROL_CHARACTERS',
          message: 'Control characters found',
          path,
          severity: 'error',
          suggestions: ['Remove control characters'],
        },
      ];

      expect(() => {
        const result = errorService.createControlCharactersErrorMessage(path, errors);
        expect(result).toBeDefined();
        expect(result.title).toBe('Invalid Control Characters in Path');
        expect(result.message).toContain('control characters');
      }).not.toThrow();
    });
  });

  describe('Permission Error Messages', () => {
    it('should create permission check error messages', () => {
      const path = '/test/permission/path';
      const error: PathError = {
        code: 'READ_PERMISSION_DENIED',
        message: 'Read permission denied',
        path,
        severity: 'error',
        suggestions: ['Check file permissions'],
      };

      expect(() => {
        const result = errorService.createPermissionCheckErrorMessage(path, error);
        expect(result).toBeDefined();
        expect(result.title).toBe('Permission Check Failed');
        expect(result.message).toContain('permission');
      }).not.toThrow();
    });

    it('should create read-only file error messages', () => {
      const path = '/test/readonly/file.txt';

      expect(() => {
        const result = errorService.createReadOnlyFileErrorMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Read-Only File or Directory');
        expect(result.message).toContain('read-only');
      }).not.toThrow();
    });
  });

  describe('Input Validation Messages', () => {
    it('should create invalid input error messages', () => {
      const path = '';

      expect(() => {
        const result = errorService.createInvalidInputErrorMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Invalid Path Input');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it('should create not directory error messages', () => {
      const path = '/test/file.txt';

      expect(() => {
        const result = errorService.createNotDirectoryErrorMessage(path);
        expect(result).toBeDefined();
        expect(result.title).toBe('Path is Not a Directory');
        expect(result.message).toContain(path);
      }).not.toThrow();
    });
  });
});
