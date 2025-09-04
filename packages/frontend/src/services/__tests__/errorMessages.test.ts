/**
 * Tests for error message service
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { errorMessageService } from '../errorMessages';
import type { PathError, PathWarning } from '../pathValidation';

// Mock navigator.platform for testing different platforms
const mockNavigator = (platform: string) => {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    writable: true,
    configurable: true,
  });
};

describe('ErrorMessageService', () => {
  beforeEach(() => {
    // Reset to a default platform before each test
    mockNavigator('Win32');
  });

  describe('createPathErrorMessage', () => {
    it('should create error message for PATH_NOT_FOUND', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'The path does not exist',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(
        errors,
        [],
        'C:\\nonexistent\\path'
      );

      expect(result.title).toBe('Repository Path Not Found');
      expect(result.message).toBe('The path does not exist');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('path');
      expect(result.suggestions).toContain(
        'Double-check the spelling and capitalization of the path'
      );
      expect(result.learnMoreUrl).toBeDefined();
    });

    it('should create error message for PATH_INVALID_FORMAT', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_INVALID_FORMAT',
          message: 'Invalid path format',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors);

      expect(result.title).toBe('Invalid Path Format');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('path');
      expect(result.suggestions).toContain(
        'Use the correct path separators for your OS (Windows: \\ or /, Unix: /)'
      );
    });

    it('should create error message for READ_PERMISSION_DENIED', () => {
      const errors: PathError[] = [
        {
          code: 'READ_PERMISSION_DENIED',
          message: 'Permission denied',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors);

      expect(result.title).toBe('Access Denied');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('permission');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should create error message for TIMEOUT_ERROR', () => {
      const errors: PathError[] = [
        {
          code: 'TIMEOUT_ERROR',
          message: 'Operation timed out',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors);

      expect(result.title).toBe('Operation Timed Out');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('system');
      expect(result.suggestions).toContain('Try with a path on a faster drive');
    });

    it('should handle unknown error codes', () => {
      const errors: PathError[] = [
        {
          code: 'UNKNOWN_ERROR_CODE',
          message: 'Some unknown error',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors);

      expect(result.title).toBe('Path Validation Failed');
      expect(result.message).toBe('Some unknown error');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('validation');
    });

    it('should handle empty errors array', () => {
      const result = errorMessageService.createPathErrorMessage([]);

      expect(result.title).toBe('Unknown Error');
      expect(result.message).toBe('An unknown error occurred');
      expect(result.severity).toBe('error');
      expect(result.category).toBe('system');
    });

    it('should combine suggestions from multiple sources', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path not found',
          suggestions: ['Custom suggestion from error'],
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors, [], 'C:\\test\\path');

      expect(result.suggestions).toContain('Custom suggestion from error');
      expect(result.suggestions).toContain(
        'Double-check the spelling and capitalization of the path'
      );
    });

    it('should limit suggestions to avoid overwhelming user', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path not found',
          suggestions: [
            'Suggestion 1',
            'Suggestion 2',
            'Suggestion 3',
            'Suggestion 4',
            'Suggestion 5',
            'Suggestion 6',
            'Suggestion 7',
            'Suggestion 8',
            'Suggestion 9',
            'Suggestion 10',
          ],
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors);

      expect(result.suggestions.length).toBeLessThanOrEqual(8);
    });

    it('should include error details when multiple errors exist', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path not found',
        },
        {
          code: 'READ_PERMISSION_DENIED',
          message: 'Permission denied',
        },
      ];

      const warnings: PathWarning[] = [
        {
          code: 'PATH_LENGTH_WARNING',
          message: 'Path is quite long',
        },
      ];

      const result = errorMessageService.createPathErrorMessage(errors, warnings, 'C:\\test\\path');

      expect(result.details).toContain('Original path: C:\\test\\path');
      expect(result.details).toContain('2 errors found:');
      expect(result.details).toContain('1 warnings:');
    });
  });

  describe('createWarningMessage', () => {
    it('should create warning message for PATH_LENGTH_WARNING', () => {
      const warnings: PathWarning[] = [
        {
          code: 'PATH_LENGTH_WARNING',
          message: 'Path is quite long',
        },
      ];

      const result = errorMessageService.createWarningMessage(warnings);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Long Path Warning');
      expect(result?.severity).toBe('warning');
      expect(result?.category).toBe('path');
    });

    it('should return null for empty warnings array', () => {
      const result = errorMessageService.createWarningMessage([]);

      expect(result).toBeNull();
    });

    it('should handle unknown warning codes', () => {
      const warnings: PathWarning[] = [
        {
          code: 'UNKNOWN_WARNING',
          message: 'Some unknown warning',
        },
      ];

      const result = errorMessageService.createWarningMessage(warnings);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Warning');
      expect(result?.message).toBe('Some unknown warning');
      expect(result?.severity).toBe('warning');
    });
  });

  describe('createNetworkErrorMessage', () => {
    it('should create UNC path error message', () => {
      const result = errorMessageService.createNetworkErrorMessage(
        '\\\\server\\share\\folder',
        'Network error details'
      );

      expect(result.title).toBe('Network Path Not Accessible');
      expect(result.category).toBe('network');
      expect(result.details).toContain('\\\\server\\share\\folder');
      expect(result.suggestions).toContain('Test your network connection to other resources');
    });

    it('should create generic network error message', () => {
      const result = errorMessageService.createNetworkErrorMessage(
        '/network/path',
        'Connection failed'
      );

      expect(result.title).toBe('Network Connection Error');
      expect(result.category).toBe('network');
      expect(result.details).toContain('Connection failed');
    });
  });

  describe('createTimeoutErrorMessage', () => {
    it('should create timeout error message', () => {
      const result = errorMessageService.createTimeoutErrorMessage('C:\\slow\\path', 5000);

      expect(result.title).toBe('Operation Timed Out');
      expect(result.message).toContain('5000ms');
      expect(result.details).toContain('C:\\slow\\path');
      expect(result.suggestions).toContain('Try increasing timeout beyond 5000ms');
    });
  });

  describe('getPlatformSpecificSuggestions', () => {
    it('should return Windows-specific suggestions', () => {
      mockNavigator('Win32');

      const result = errorMessageService.getPlatformSpecificSuggestions();

      expect(result.platform).toBe('Windows');
      expect(result.examples).toContain('C:\\Users\\Username\\Documents\\MyProject');
      expect(result.tips).toContain('Use either forward slashes (/) or backslashes (\\)');
      expect(result.commonIssues).toContain(
        'Drive letter missing or incorrect (should be C:, D:, etc.)'
      );
    });

    it('should return macOS-specific suggestions', () => {
      mockNavigator('MacIntel');

      const result = errorMessageService.getPlatformSpecificSuggestions();

      expect(result.platform).toBe('macOS');
      expect(result.examples).toContain('/Users/username/Documents/MyProject');
      expect(result.tips).toContain('Paths are case-sensitive');
      expect(result.commonIssues).toContain('Case sensitivity issues (MyFolder vs myfolder)');
    });

    it('should return Linux-specific suggestions', () => {
      mockNavigator('Linux x86_64');

      const result = errorMessageService.getPlatformSpecificSuggestions();

      expect(result.platform).toBe('Linux/Unix');
      expect(result.examples).toContain('/home/username/projects/myrepo');
      expect(result.tips).toContain('Paths are case-sensitive');
      expect(result.commonIssues).toContain('Using backslashes instead of forward slashes');
    });
  });

  describe('getPlatformSpecificErrorGuidance', () => {
    it('should return Windows-specific guidance for PATH_NOT_FOUND', () => {
      mockNavigator('Win32');

      const result = errorMessageService.getPlatformSpecificErrorGuidance(
        'PATH_NOT_FOUND',
        'C:\\test\\path'
      );

      expect(result).toContain('Open Windows Explorer and navigate to verify the path exists');
      expect(result).toContain('Check if the drive letter is correct (C:, D:, etc.)');
    });

    it('should return macOS-specific guidance for READ_PERMISSION_DENIED', () => {
      mockNavigator('MacIntel');

      const result = errorMessageService.getPlatformSpecificErrorGuidance(
        'READ_PERMISSION_DENIED',
        '/Users/test/path'
      );

      expect(result).toContain(
        'Check folder permissions in Finder: right-click → Get Info → Sharing & Permissions'
      );
    });

    it('should return generic guidance for unknown error codes', () => {
      const result = errorMessageService.getPlatformSpecificErrorGuidance('UNKNOWN_ERROR_CODE');

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct colors for different categories', () => {
      const pathColor = errorMessageService.getCategoryColor('path');
      expect(pathColor.bg).toBe('bg-red-50');
      expect(pathColor.text).toBe('text-red-800');

      const permissionColor = errorMessageService.getCategoryColor('permission');
      expect(permissionColor.bg).toBe('bg-orange-50');
      expect(permissionColor.text).toBe('text-orange-800');

      const networkColor = errorMessageService.getCategoryColor('network');
      expect(networkColor.bg).toBe('bg-purple-50');
      expect(networkColor.text).toBe('text-purple-800');
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors for different severities', () => {
      const errorColor = errorMessageService.getSeverityColor('error');
      expect(errorColor.bg).toBe('bg-red-50');
      expect(errorColor.text).toBe('text-red-800');

      const warningColor = errorMessageService.getSeverityColor('warning');
      expect(warningColor.bg).toBe('bg-yellow-50');
      expect(warningColor.text).toBe('text-yellow-800');

      const infoColor = errorMessageService.getSeverityColor('info');
      expect(infoColor.bg).toBe('bg-blue-50');
      expect(infoColor.text).toBe('text-blue-800');
    });
  });

  describe('Error message accuracy and clarity', () => {
    it('should provide clear and actionable error messages', () => {
      const testCases = [
        {
          code: 'PATH_NOT_FOUND',
          expectedTitle: 'Repository Path Not Found',
          shouldContainSuggestion: 'Double-check the spelling',
        },
        {
          code: 'READ_PERMISSION_DENIED',
          expectedTitle: 'Access Denied',
          shouldContainSuggestion: 'Verify you have the necessary permissions',
        },
        {
          code: 'PATH_TOO_LONG',
          expectedTitle: 'Path Too Long',
          shouldContainSuggestion: 'Move the repository closer to the root',
        },
        {
          code: 'RESERVED_NAME',
          expectedTitle: 'Reserved Name in Path',
          shouldContainSuggestion: 'Rename the folder to avoid reserved names',
        },
      ];

      testCases.forEach(({ code, expectedTitle, shouldContainSuggestion }) => {
        const errors: PathError[] = [
          {
            code,
            message: `Test message for ${code}`,
          },
        ];

        const result = errorMessageService.createPathErrorMessage(errors);

        expect(result.title).toBe(expectedTitle);
        expect(result.suggestions.some((s) => s.includes(shouldContainSuggestion))).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.message).toBeTruthy();
      });
    });

    it('should provide platform-appropriate suggestions', () => {
      const errors: PathError[] = [
        {
          code: 'PATH_NOT_FOUND',
          message: 'Path not found',
        },
      ];

      // Test Windows suggestions
      mockNavigator('Win32');
      const windowsResult = errorMessageService.createPathErrorMessage(errors);
      expect(windowsResult.suggestions.some((s) => s.includes('Windows Explorer'))).toBe(true);

      // Test macOS suggestions
      mockNavigator('MacIntel');
      const macResult = errorMessageService.createPathErrorMessage(errors);
      expect(macResult.suggestions.some((s) => s.includes('Finder'))).toBe(true);

      // Test Linux suggestions
      mockNavigator('Linux x86_64');
      const linuxResult = errorMessageService.createPathErrorMessage(errors);
      expect(linuxResult.suggestions.some((s) => s.includes('ls -la'))).toBe(true);
    });

    it('should provide contextual error messages based on path type', () => {
      // Test UNC path
      const uncResult = errorMessageService.createNetworkErrorMessage(
        '\\\\server\\share\\folder',
        'Network error'
      );
      expect(uncResult.suggestions.some((s) => s.includes('server'))).toBe(true);

      // Test regular path
      const regularResult = errorMessageService.createNetworkErrorMessage(
        '/regular/path',
        'Network error'
      );
      expect(regularResult.title).toBe('Network Connection Error');
    });

    it('should provide helpful learn more URLs for relevant errors', () => {
      const testCases = ['PATH_NOT_FOUND', 'PATH_TOO_LONG', 'RESERVED_NAME', 'INVALID_UNC_PATH'];

      testCases.forEach((code) => {
        const errors: PathError[] = [
          {
            code,
            message: `Test message for ${code}`,
          },
        ];

        const result = errorMessageService.createPathErrorMessage(errors);
        expect(result.learnMoreUrl).toBeDefined();
        expect(result.learnMoreUrl).toMatch(/^https?:\/\//);
      });
    });

    it('should handle new permission-related error codes', () => {
      const permissionErrorCodes = [
        'PERMISSION_CHECK_ERROR',
        'WINDOWS_PERMISSION_CHECK_ERROR',
        'OWNERSHIP_INFO_ERROR',
      ];

      permissionErrorCodes.forEach((code) => {
        const errors: PathError[] = [
          {
            code,
            message: `Test message for ${code}`,
          },
        ];

        const result = errorMessageService.createPathErrorMessage(errors);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.category).toBe('permission');
      });
    });

    it('should handle file system and access errors', () => {
      const systemErrorCodes = ['FILESYSTEM_ERROR', 'ACCESS_DENIED'];

      systemErrorCodes.forEach((code) => {
        const errors: PathError[] = [
          {
            code,
            message: `Test message for ${code}`,
          },
        ];

        const result = errorMessageService.createPathErrorMessage(errors);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(['system', 'permission']).toContain(result.category);
      });
    });

    it('should handle VERY_LONG_PATH warning', () => {
      const warnings: PathWarning[] = [
        {
          code: 'VERY_LONG_PATH',
          message: 'Path is extremely long',
        },
      ];

      const result = errorMessageService.createWarningMessage(warnings);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Very Long Path Warning');
      expect(result?.severity).toBe('warning');
      expect(result?.category).toBe('path');
      expect(result?.suggestions.length).toBeGreaterThan(0);
    });

    it('should provide platform-specific guidance for new error codes', () => {
      const testCases = ['PERMISSION_CHECK_ERROR', 'WINDOWS_PERMISSION_CHECK_ERROR'];

      testCases.forEach((code) => {
        // Test Windows guidance
        mockNavigator('Win32');
        const windowsGuidance = errorMessageService.getPlatformSpecificErrorGuidance(code);
        expect(windowsGuidance.length).toBeGreaterThan(0);

        // Test macOS guidance (for PERMISSION_CHECK_ERROR)
        if (code === 'PERMISSION_CHECK_ERROR') {
          mockNavigator('MacIntel');
          const macGuidance = errorMessageService.getPlatformSpecificErrorGuidance(code);
          expect(macGuidance.length).toBeGreaterThan(0);

          // Test Linux guidance
          mockNavigator('Linux x86_64');
          const linuxGuidance = errorMessageService.getPlatformSpecificErrorGuidance(code);
          expect(linuxGuidance.length).toBeGreaterThan(0);
        }
      });
    });

    it('should provide actionable suggestions for all error types', () => {
      const allErrorCodes = [
        'PATH_NOT_FOUND',
        'PATH_INVALID_FORMAT',
        'PATH_TOO_LONG',
        'RESERVED_NAME',
        'INVALID_CHARACTERS',
        'INVALID_DRIVE_LETTER',
        'INVALID_UNC_PATH',
        'READ_PERMISSION_DENIED',
        'WRITE_PERMISSION_DENIED',
        'SYSTEM_PATH_ACCESS',
        'TIMEOUT_ERROR',
        'PERMISSION_CHECK_ERROR',
        'WINDOWS_PERMISSION_CHECK_ERROR',
        'FILESYSTEM_ERROR',
        'ACCESS_DENIED',
      ];

      allErrorCodes.forEach((code) => {
        const errors: PathError[] = [
          {
            code,
            message: `Test message for ${code}`,
          },
        ];

        const result = errorMessageService.createPathErrorMessage(errors);

        // Every error should have actionable suggestions
        expect(result.suggestions.length).toBeGreaterThan(0);

        // Suggestions should be specific and actionable
        const hasActionableWords = result.suggestions.some((suggestion) =>
          /\b(try|check|ensure|verify|use|remove|rename|contact|run|open|navigate|copy|move)\b/i.test(
            suggestion
          )
        );
        expect(hasActionableWords).toBe(true);

        // Should have clear title and message
        expect(result.title.length).toBeGreaterThan(5);
        expect(result.message.length).toBeGreaterThan(10);
      });
    });

    it('should provide clear error categorization', () => {
      const categoryTests = [
        {
          codes: ['PATH_NOT_FOUND', 'PATH_TOO_LONG', 'RESERVED_NAME'],
          category: 'path',
        },
        {
          codes: ['READ_PERMISSION_DENIED', 'PERMISSION_CHECK_ERROR'],
          category: 'permission',
        },
        { codes: ['NETWORK_ERROR', 'UNC_PATH_INVALID'], category: 'network' },
        { codes: ['TIMEOUT_ERROR', 'FILESYSTEM_ERROR'], category: 'system' },
        {
          codes: ['INVALID_INPUT', 'VALIDATION_ERROR'],
          category: 'validation',
        },
      ];

      categoryTests.forEach(({ codes, category }) => {
        codes.forEach((code) => {
          const errors: PathError[] = [
            {
              code,
              message: `Test message for ${code}`,
            },
          ];

          const result = errorMessageService.createPathErrorMessage(errors);
          expect(result.category).toBe(category);
        });
      });
    });
  });
});
