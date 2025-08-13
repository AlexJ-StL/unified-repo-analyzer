/**
 * Tests for error message service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorMessageService } from '../error-message.service';
import type { PathError, PathWarning } from '../path-handler.service';

describe('ErrorMessageService', () => {
  let errorMessageService: ErrorMessageService;

  beforeEach(() => {
    errorMessageService = new ErrorMessageService();
  });

  describe('createPathErrorMessage', () => {
    it('should create user-friendly message for path not found error', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path does not exist'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/non/existent/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Repository Path Not Found');
      expect(result.message).toContain(path);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.learnMoreUrl).toBeDefined();
    });

    it('should create user-friendly message for invalid format error', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_INVALID_FORMAT',
          message: 'Invalid path format',
          details: 'Path contains invalid characters'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\invalid<>path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Invalid Path Format');
      expect(result.message).toContain(path);
      expect(result.details).toBe('Path contains invalid characters');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should create user-friendly message for path too long error', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_TOO_LONG',
          message: 'Path exceeds maximum length',
          details: 'Current length: 300, maximum: 260'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\very\\long\\path\\that\\exceeds\\maximum\\length';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Path Too Long');
      expect(result.message).toContain(path);
      expect(result.details).toBe('Current length: 300, maximum: 260');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('shorter'))).toBe(true);
      expect(result.learnMoreUrl).toBeDefined();
    });

    it('should create user-friendly message for reserved name error', () => {
      const errors: PathError[] = [
        {
          code: 'RESERVED_NAME',
          message: 'Path contains reserved name',
          details: 'Reserved names: CON, PRN, AUX, NUL'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\projects\\CON\\file.txt';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Reserved Name in Path');
      expect(result.message).toContain(path);
      expect(result.details).toBe('Reserved names: CON, PRN, AUX, NUL');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('rename') || s.includes('avoid'))).toBe(true);
      expect(result.learnMoreUrl).toBeDefined();
    });

    it('should create user-friendly message for invalid characters error', () => {
      const errors: PathError[] = [
        {
          code: 'INVALID_CHARACTERS',
          message: 'Path contains invalid characters',
          details: 'Invalid characters found: < > : " | ? *'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\projects\\file<>name';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Invalid Characters in Path');
      expect(result.message).toContain(path);
      expect(result.details).toBe('Invalid characters found: < > : " | ? *');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('remove') || s.includes('replace'))).toBe(true);
    });

    it('should create user-friendly message for permission denied error', () => {
      const errors: PathError[] = [
        {
          code: 'READ_PERMISSION_DENIED',
          message: 'Insufficient read permissions'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/restricted/directory';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Permission Denied');
      expect(result.message).toContain(path);
      expect(result.message).toContain('access');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('permission'))).toBe(true);
    });

    it('should create user-friendly message for system path access error', () => {
      const errors: PathError[] = [
        {
          code: 'SYSTEM_PATH_ACCESS',
          message: 'Attempting to access system path'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\Windows\\System32';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('System Directory Access');
      expect(result.message).toContain(path);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('avoid') || s.includes('system'))).toBe(true);
    });

    it('should create user-friendly message for timeout error', () => {
      const errors: PathError[] = [
        {
          code: 'TIMEOUT_ERROR',
          message: 'Operation timed out'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '\\\\slow-server\\share\\large-directory';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Operation Timed Out');
      expect(result.message).toContain(path);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('network') || s.includes('slow'))).toBe(true);
    });

    it('should create user-friendly message for cancelled operation', () => {
      const errors: PathError[] = [
        {
          code: 'OPERATION_CANCELLED',
          message: 'Operation was cancelled'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Operation Cancelled');
      expect(result.message).toContain(path);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('try again'))).toBe(true);
    });

    it('should handle multiple errors by prioritizing the most important', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_TOO_LONG',
          message: 'Path is too long'
        },
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path does not exist'
        },
        {
          code: 'INVALID_CHARACTERS',
          message: 'Invalid characters in path'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      // PATH_NOT_FOUND should have higher priority than PATH_TOO_LONG
      expect(result.title).toBe('Repository Path Not Found');
    });

    it('should create generic error message for unknown error codes', () => {
      const errors: PathError[] = [
        {
          code: 'UNKNOWN_ERROR_CODE',
          message: 'Some unknown error occurred'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Repository Path Error');
      expect(result.message).toContain(path);
      expect(result.details).toContain('Some unknown error occurred');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle empty errors array', () => {
      const errors: PathError[] = [];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title).toBe('Repository Path Error');
      expect(result.message).toContain(path);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('createNetworkErrorMessage', () => {
    it('should create user-friendly message for UNC path network error', () => {
      const path = '\\\\server\\share\\folder';
      const errorDetails = 'Network path not found';

      const result = errorMessageService.createNetworkErrorMessage(path, errorDetails);

      expect(result.title).toBe('Network Path Not Accessible');
      expect(result.message).toContain(path);
      expect(result.details).toBe(errorDetails);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('network'))).toBe(true);
      expect(result.learnMoreUrl).toBeDefined();
    });

    it('should create user-friendly message for general network error', () => {
      const path = '/some/local/path';
      const errorDetails = 'Connection timeout';

      const result = errorMessageService.createNetworkErrorMessage(path, errorDetails);

      expect(result.title).toBe('Network Connection Error');
      expect(result.message).toContain(path);
      expect(result.details).toBe(errorDetails);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.some(s => s.includes('network'))).toBe(true);
    });

    it('should handle network error without details', () => {
      const path = '\\\\server\\share';

      const result = errorMessageService.createNetworkErrorMessage(path);

      expect(result.title).toBe('Network Path Not Accessible');
      expect(result.message).toContain(path);
      expect(result.details).toBeUndefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Platform-specific suggestions', () => {
    it('should include platform-appropriate suggestions', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path does not exist'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);

      // Should include both platform-specific and generic suggestions
      const allSuggestions = result.suggestions.join(' ').toLowerCase();
      expect(allSuggestions).toContain('double-check'); // Generic suggestion
    });
  });

  describe('Error message quality', () => {
    it('should provide actionable suggestions', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path does not exist'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/some/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      // Check that suggestions contain action words
      const actionWords = ['check', 'verify', 'ensure', 'try', 'use', 'navigate', 'contact'];
      const hasActionableSuggestions = result.suggestions.some(suggestion =>
        actionWords.some(word => suggestion.toLowerCase().includes(word))
      );
      expect(hasActionableSuggestions).toBe(true);
    });

    it('should provide clear and concise messages', () => {
      const errors: PathError[] = [
        {
          code: 'READ_PERMISSION_DENIED',
          message: 'Insufficient read permissions'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = '/restricted/path';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.title.length).toBeLessThan(50); // Title should be concise
      expect(result.message.length).toBeGreaterThan(20); // Message should be descriptive
      expect(result.message.length).toBeLessThan(200); // But not too verbose
    });

    it('should include helpful learn more URLs when appropriate', () => {
      const errors: PathError[] = [
        {
          code: 'RESERVED_NAME',
          message: 'Path contains reserved name'
        }
      ];
      const warnings: PathWarning[] = [];
      const path = 'C:\\CON\\file.txt';

      const result = errorMessageService.createPathErrorMessage(errors, warnings, path);

      expect(result.learnMoreUrl).toBeDefined();
      expect(result.learnMoreUrl).toMatch(/^https?:\/\//);
    });
  });
});