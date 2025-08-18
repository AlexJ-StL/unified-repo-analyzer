/**
 * Platform-specific integration tests for PathHandler service
 * Tests Windows path handling, cross-platform compatibility, performance, and timeout scenarios
 * Requirements: 1.1, 1.2, 7.1, 7.2, 8.1, 8.5
 */

import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PathHandler } from '../../packages/backend/src/services/path-handler.service.js';

describe('PathHandler Platform-Specific Integration Tests', () => {
  let pathHandler: PathHandler;
  let testDir: string;
  let testFiles: string[] = [];

  beforeAll(async () => {
    // Create a temporary directory for testing
    testDir = path.join(tmpdir(), 'path-handler-integration-tests');
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (_error) {}
  });

  beforeEach(() => {
    pathHandler = new PathHandler();
    testFiles = [];
  });

  afterEach(async () => {
    // Cleanup test files
    await Promise.all(
      testFiles.map(async (file) => {
        try {
          await fs.rm(file, { recursive: true, force: true });
        } catch (_error) {
          // Ignore cleanup errors
        }
      })
    );
  });

  describe('Windows Path Format Handling', () => {
    it('should handle Windows backslash paths correctly', async () => {
      const windowsHandler = new PathHandler('win32');

      // Test various Windows path formats
      const testPaths = [
        'C:\\Users\\Test\\Documents',
        'D:\\Projects\\MyApp\\src',
        'E:\\Data\\Files\\test.txt',
        'C:\\Program Files\\Application\\bin',
      ];

      for (const testPath of testPaths) {
        const result = await windowsHandler.validatePath(testPath);

        // Should normalize path correctly
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('\\');
        expect(result.normalizedPath).not.toContain('/');

        // Should not have format validation errors for valid Windows paths
        const formatErrors = result.errors.filter(
          (e) => e.code === 'INVALID_CHARACTERS' || e.code === 'INVALID_DRIVE_LETTER'
        );
        expect(formatErrors).toHaveLength(0);
      }
    });

    it('should handle Windows forward slash paths correctly', async () => {
      const windowsHandler = new PathHandler('win32');

      const testPaths = [
        'C:/Users/Test/Documents',
        'D:/Projects/MyApp/src',
        'E:/Data/Files/test.txt',
      ];

      for (const testPath of testPaths) {
        const result = await windowsHandler.validatePath(testPath);

        // Should normalize to backslashes on Windows
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('\\');
        expect(result.normalizedPath).not.toContain('/');

        // Should not have format validation errors
        const formatErrors = result.errors.filter(
          (e) => e.code === 'INVALID_CHARACTERS' || e.code === 'INVALID_DRIVE_LETTER'
        );
        expect(formatErrors).toHaveLength(0);
      }
    });

    it('should handle UNC paths correctly', async () => {
      const windowsHandler = new PathHandler('win32');

      const testPaths = [
        '\\\\server\\share\\folder',
        '\\\\fileserver\\documents\\project',
        '\\\\192.168.1.100\\shared\\data',
      ];

      for (const testPath of testPaths) {
        const result = await windowsHandler.validatePath(testPath);

        // Should normalize UNC paths correctly
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toMatch(/^\\\\[^\\]+\\[^\\]+/);

        // Should not have UNC format errors for valid UNC paths
        const uncErrors = result.errors.filter((e) => e.code === 'INVALID_UNC_PATH');
        expect(uncErrors).toHaveLength(0);
      }
    });

    it('should detect Windows reserved names', async () => {
      const windowsHandler = new PathHandler('win32');

      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM9', 'LPT1', 'LPT9'];

      for (const reservedName of reservedNames) {
        const testPath = `C:\\Users\\${reservedName}\\test`;
        const result = await windowsHandler.validatePath(testPath);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'RESERVED_NAME')).toBe(true);

        const reservedError = result.errors.find((e) => e.code === 'RESERVED_NAME');
        expect(reservedError?.message).toContain(reservedName);
        expect(reservedError?.suggestions).toBeDefined();
        expect(reservedError?.suggestions?.length).toBeGreaterThan(0);
      }
    });

    it('should detect Windows invalid characters', async () => {
      const windowsHandler = new PathHandler('win32');

      const invalidChars = ['<', '>', '"', '|', '?', '*'];

      for (const char of invalidChars) {
        const testPath = `C:\\Users\\test${char}file\\document`;
        const result = await windowsHandler.validatePath(testPath);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_CHARACTERS')).toBe(true);

        const charError = result.errors.find((e) => e.code === 'INVALID_CHARACTERS');
        expect(charError?.details).toContain(char);
        expect(charError?.suggestions).toBeDefined();
      }
    });

    it('should handle Windows path length limits', async () => {
      const windowsHandler = new PathHandler('win32');

      // Create a path that exceeds Windows 260 character limit
      const longPath = `C:\\${'VeryLongDirectoryName'.repeat(15)}\\file.txt`;
      expect(longPath.length).toBeGreaterThan(260);

      const result = await windowsHandler.validatePath(longPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'PATH_TOO_LONG')).toBe(true);

      const lengthError = result.errors.find((e) => e.code === 'PATH_TOO_LONG');
      expect(lengthError?.details).toContain(longPath.length.toString());
      expect(lengthError?.suggestions).toBeDefined();
      expect(lengthError?.suggestions?.length).toBeGreaterThan(0);
    });

    it('should detect invalid drive letters', async () => {
      const windowsHandler = new PathHandler('win32');

      const invalidDrives = ['1:\\test', '9:\\folder', '@:\\file'];

      for (const invalidDrive of invalidDrives) {
        const result = await windowsHandler.validatePath(invalidDrive);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_DRIVE_LETTER')).toBe(true);

        const driveError = result.errors.find((e) => e.code === 'INVALID_DRIVE_LETTER');
        expect(driveError?.suggestions).toBeDefined();
        expect(driveError?.suggestions?.some((s) => s.includes('C:\\'))).toBe(true);
      }
    });

    it('should handle mixed path separators', async () => {
      const windowsHandler = new PathHandler('win32');

      const mixedPaths = [
        'C:/Users\\Test/Documents\\file.txt',
        'D:\\Projects/MyApp\\src/index.js',
        'E:/Data\\Files/subfolder\\test.txt',
      ];

      for (const mixedPath of mixedPaths) {
        const result = await windowsHandler.validatePath(mixedPath);

        // Should normalize to consistent backslashes
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('\\');
        expect(result.normalizedPath).not.toContain('/');

        // Mixed separators should not cause validation errors
        const separatorErrors = result.errors.filter(
          (e) => e.code === 'INVALID_CHARACTERS' && e.details?.includes('/')
        );
        expect(separatorErrors).toHaveLength(0);
      }
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should handle Unix-like paths correctly', async () => {
      const unixHandler = new PathHandler('linux');

      const testPaths = [
        '/home/user/documents',
        '/var/log/application.log',
        '/usr/local/bin/app',
        '/tmp/test-file.txt',
      ];

      for (const testPath of testPaths) {
        const result = await unixHandler.validatePath(testPath);

        // Should normalize path correctly for Unix
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('/');
        expect(result.normalizedPath).not.toContain('\\');

        // Should not have Windows-specific errors
        const windowsErrors = result.errors.filter(
          (e) =>
            e.code === 'RESERVED_NAME' ||
            e.code === 'INVALID_DRIVE_LETTER' ||
            e.code === 'PATH_TOO_LONG'
        );
        expect(windowsErrors).toHaveLength(0);
      }
    });

    it('should handle macOS paths correctly', async () => {
      const macHandler = new PathHandler('darwin');

      const testPaths = [
        '/Users/user/Documents',
        '/Applications/MyApp.app/Contents',
        '/System/Library/Frameworks',
        '/private/tmp/test',
      ];

      for (const testPath of testPaths) {
        const result = await macHandler.validatePath(testPath);

        // Should normalize path correctly for macOS
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('/');
        expect(result.normalizedPath).not.toContain('\\');

        // Should not have Windows-specific errors
        const windowsErrors = result.errors.filter(
          (e) => e.code === 'RESERVED_NAME' || e.code === 'INVALID_DRIVE_LETTER'
        );
        expect(windowsErrors).toHaveLength(0);
      }
    });

    it('should convert backslashes to forward slashes on Unix-like systems', async () => {
      const unixHandler = new PathHandler('linux');

      const testPaths = ['home\\user\\documents', 'var\\log\\app.log', 'usr\\local\\bin\\app'];

      for (const testPath of testPaths) {
        const result = await unixHandler.validatePath(testPath);

        // Should convert backslashes to forward slashes
        expect(result.normalizedPath).toBeDefined();
        expect(result.normalizedPath).toContain('/');
        expect(result.normalizedPath).not.toContain('\\');
      }
    });

    it('should handle relative paths consistently across platforms', async () => {
      const platforms = ['win32', 'linux', 'darwin'];

      const relativePaths = [
        './documents/file.txt',
        '../parent/folder',
        '../../root/config',
        './src/../dist/app.js',
      ];

      for (const platform of platforms) {
        const handler = new PathHandler(platform as any);

        for (const relativePath of relativePaths) {
          const result = await handler.validatePath(relativePath);

          // Should normalize relative paths
          expect(result.normalizedPath).toBeDefined();
          expect(result.normalizedPath).not.toContain('..');

          // Should use platform-appropriate separators
          if (platform === 'win32') {
            expect(result.normalizedPath).toContain('\\');
          } else {
            expect(result.normalizedPath).toContain('/');
          }
        }
      }
    });

    it('should warn about very long paths on Unix systems', async () => {
      const unixHandler = new PathHandler('linux');

      // Create a very long path (over 4096 characters)
      const longPath = `/home/user/${'very-long-directory-name'.repeat(200)}`;
      expect(longPath.length).toBeGreaterThan(4096);

      const result = await unixHandler.validatePath(longPath);

      // Should have warning about very long path
      expect(result.warnings.some((w) => w.code === 'VERY_LONG_PATH')).toBe(true);

      const lengthWarning = result.warnings.find((w) => w.code === 'VERY_LONG_PATH');
      expect(lengthWarning?.details).toContain(longPath.length.toString());
    });
  });

  describe('Real File System Integration', () => {
    it('should validate existing files correctly', async () => {
      // Create a test file
      const testFile = path.join(testDir, 'test-file.txt');
      await fs.writeFile(testFile, 'test content');
      testFiles.push(testFile);

      const result = await pathHandler.validatePath(testFile);

      expect(result.isValid).toBe(true);
      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isDirectory).toBe(false);
      expect(result.metadata.size).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate existing directories correctly', async () => {
      // Create a test directory
      const testSubDir = path.join(testDir, 'test-subdirectory');
      await fs.mkdir(testSubDir, { recursive: true });
      testFiles.push(testSubDir);

      const result = await pathHandler.validatePath(testSubDir);

      expect(result.isValid).toBe(true);
      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isDirectory).toBe(true);
      expect(result.metadata.size).toBeUndefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should handle non-existent paths correctly', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent-file.txt');

      const result = await pathHandler.validatePath(nonExistentPath);

      // Path format should be valid, but file doesn't exist
      expect(result.metadata.exists).toBe(false);
      expect(result.metadata.isDirectory).toBe(false);

      // Should still be considered valid if format is correct
      const formatErrors = result.errors.filter(
        (e) => e.code !== 'PATH_NOT_FOUND' && e.code !== 'PERMISSION_DENIED'
      );
      expect(formatErrors).toHaveLength(0);
    });

    it('should check file permissions correctly', async () => {
      // Create a test file
      const testFile = path.join(testDir, 'permission-test.txt');
      await fs.writeFile(testFile, 'test content');
      testFiles.push(testFile);

      const permissionResult = await pathHandler.checkPermissions(testFile);

      expect(permissionResult.canRead).toBe(true);
      expect(permissionResult.owner).toBeDefined();
      expect(permissionResult.group).toBeDefined();
      expect(permissionResult.errors).toHaveLength(0);
    });

    it('should handle permission errors gracefully', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent-permission-test.txt');

      const permissionResult = await pathHandler.checkPermissions(nonExistentPath);

      expect(permissionResult.canRead).toBe(false);
      expect(permissionResult.canWrite).toBe(false);
      expect(permissionResult.canExecute).toBe(false);
      expect(permissionResult.errors.some((e) => e.code === 'PATH_NOT_FOUND')).toBe(true);
    });

    it('should resolve relative paths correctly', async () => {
      const basePath = testDir;
      const relativePath = './test-relative.txt';

      const resolvedPath = pathHandler.resolveRelativePath(relativePath, basePath);

      expect(resolvedPath).toContain(testDir);
      expect(resolvedPath).toContain('test-relative.txt');
      expect(path.isAbsolute(resolvedPath)).toBe(true);
    });
  });

  describe('Performance and Timeout Testing', () => {
    it('should complete validation within reasonable time', async () => {
      const startTime = Date.now();

      const result = await pathHandler.validatePath(testDir);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.isValid).toBe(true);
    });

    it('should respect timeout settings', async () => {
      const shortTimeout = 100; // 100ms timeout

      const startTime = Date.now();

      try {
        const result = await pathHandler.validatePath(testDir, {
          timeoutMs: shortTimeout,
        });

        const duration = Date.now() - startTime;

        // Either completes quickly or times out
        if (result.errors.some((e) => e.code === 'VALIDATION_ERROR')) {
          // Timed out - should be close to timeout duration
          expect(duration).toBeLessThan(shortTimeout + 100);
        } else {
          // Completed successfully - should be within timeout
          expect(duration).toBeLessThan(shortTimeout);
        }
      } catch (error) {
        // TimeoutError is acceptable
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(shortTimeout + 100);
        expect((error as Error).name).toBe('TimeoutError');
      }
    });

    it('should provide progress updates during validation', async () => {
      const progressUpdates: Array<{
        stage: string;
        percentage: number;
        message: string;
      }> = [];

      const result = await pathHandler.validatePath(testDir, {
        onProgress: (progress) => {
          progressUpdates.push(progress);
        },
      });

      expect(result.isValid).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Check that progress updates are in order
      const percentages = progressUpdates.map((p) => p.percentage);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }

      // Should have final completion update
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.stage).toBe('completed');
      expect(lastUpdate.percentage).toBe(100);
    });

    it('should handle operation cancellation', async () => {
      const controller = pathHandler.createAbortController();

      // Cancel after a short delay
      setTimeout(() => controller.abort(), 50);

      try {
        const result = await pathHandler.validatePath(testDir, {
          signal: controller.signal,
        });

        // If we get a result, it should indicate cancellation
        expect(result.errors.some((e) => e.code === 'OPERATION_CANCELLED')).toBe(true);
      } catch (error) {
        // AbortError is also acceptable
        expect((error as Error).name).toBe('AbortError');
      }
    });

    it('should handle multiple concurrent validations', async () => {
      const testPaths = [
        testDir,
        path.join(testDir, '..'),
        path.join(testDir, 'non-existent'),
        __filename,
        __dirname,
      ];

      const startTime = Date.now();

      const results = await Promise.all(
        testPaths.map((testPath) => pathHandler.validatePath(testPath))
      );

      const duration = Date.now() - startTime;

      expect(results).toHaveLength(testPaths.length);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

      // All results should have some form of validation result
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      });
    });

    it('should handle permission checking timeouts', async () => {
      const shortTimeout = 100;

      const startTime = Date.now();

      try {
        const result = await pathHandler.checkPermissions(testDir, {
          timeoutMs: shortTimeout,
        });

        const duration = Date.now() - startTime;

        // Either completes quickly or has timeout-related errors
        if (result.errors.some((e) => e.code === 'PERMISSION_CHECK_ERROR')) {
          expect(duration).toBeLessThan(shortTimeout + 100);
        } else {
          expect(duration).toBeLessThan(shortTimeout);
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(shortTimeout + 100);
        expect((error as Error).name).toBe('TimeoutError');
      }
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should provide helpful error messages for common issues', async () => {
      const windowsHandler = new PathHandler('win32');

      // Test various error scenarios
      const errorScenarios = [
        { path: 'C:\\Users\\CON\\test', expectedError: 'RESERVED_NAME' },
        { path: 'C:\\Users\\test<file>', expectedError: 'INVALID_CHARACTERS' },
        { path: '1:\\invalid', expectedError: 'INVALID_DRIVE_LETTER' },
        { path: `C:\\${'a'.repeat(300)}`, expectedError: 'PATH_TOO_LONG' },
      ];

      for (const scenario of errorScenarios) {
        const result = await windowsHandler.validatePath(scenario.path);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === scenario.expectedError)).toBe(true);

        const error = result.errors.find((e) => e.code === scenario.expectedError);
        expect(error?.message).toBeDefined();
        expect(error?.details).toBeDefined();
        expect(error?.suggestions).toBeDefined();
        expect(error?.suggestions?.length).toBeGreaterThan(0);
      }
    });

    it('should handle null byte security issues', async () => {
      const maliciousPath = 'C:\\Users\\test\0file';

      const result = await pathHandler.validatePath(maliciousPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'NULL_BYTE_IN_PATH')).toBe(true);

      const securityError = result.errors.find((e) => e.code === 'NULL_BYTE_IN_PATH');
      expect(securityError?.details).toContain('security');
      expect(securityError?.suggestions).toBeDefined();
    });

    it('should handle control characters in paths', async () => {
      const windowsHandler = new PathHandler('win32');
      const pathWithControlChars = 'C:\\Users\\test\x01\x02file';

      const result = await windowsHandler.validatePath(pathWithControlChars);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'CONTROL_CHARACTERS')).toBe(true);

      const controlError = result.errors.find((e) => e.code === 'CONTROL_CHARACTERS');
      expect(controlError?.details).toContain('ASCII 0-31');
      expect(controlError?.suggestions).toBeDefined();
    });

    it('should handle invalid UNC paths', async () => {
      const windowsHandler = new PathHandler('win32');

      const invalidUNCPaths = [
        '\\\\server', // Missing share
        '\\\\', // Empty UNC
        '\\server\\share', // Single backslash
      ];

      for (const uncPath of invalidUNCPaths) {
        const result = await windowsHandler.validatePath(uncPath);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_UNC_PATH')).toBe(true);

        const uncError = result.errors.find((e) => e.code === 'INVALID_UNC_PATH');
        expect(uncError?.details).toContain('\\\\server\\share\\path');
        expect(uncError?.suggestions).toBeDefined();
      }
    });

    it('should handle trailing spaces and dots on Windows', async () => {
      const windowsHandler = new PathHandler('win32');

      const invalidPaths = [
        'C:\\Users\\test \\file',
        'C:\\Users\\test.\\file',
        'C:\\Users\\folder \\subfolder',
        'C:\\Users\\folder.\\subfolder',
      ];

      for (const invalidPath of invalidPaths) {
        const result = await windowsHandler.validatePath(invalidPath);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_COMPONENT_ENDING')).toBe(true);

        const endingError = result.errors.find((e) => e.code === 'INVALID_COMPONENT_ENDING');
        expect(endingError?.details).toContain('spaces or dots');
        expect(endingError?.suggestions).toBeDefined();
      }
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty and whitespace-only paths', async () => {
      const invalidPaths = ['', '   ', '\t', '\n'];

      for (const invalidPath of invalidPaths) {
        expect(() => pathHandler.normalizePath(invalidPath)).toThrow(
          'Path must be a non-empty string'
        );
      }
    });

    it('should handle very deep directory structures', async () => {
      // Create a very deep path
      const deepPath = path.join(testDir, ...Array(50).fill('deep'));

      const result = await pathHandler.validatePath(deepPath);

      // Should handle deep paths without crashing
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle paths with Unicode characters', async () => {
      const unicodePaths = [
        path.join(testDir, '测试文件夹'),
        path.join(testDir, 'файл.txt'),
        path.join(testDir, 'émoji-🚀-folder'),
        path.join(testDir, 'Ñoño.txt'),
      ];

      for (const unicodePath of unicodePaths) {
        const result = await pathHandler.validatePath(unicodePath);

        // Should handle Unicode characters gracefully
        expect(result).toBeDefined();
        expect(result.normalizedPath).toBeDefined();

        // Unicode characters should not cause format validation errors
        const formatErrors = result.errors.filter(
          (e) => e.code === 'INVALID_CHARACTERS' || e.code === 'CONTROL_CHARACTERS'
        );
        expect(formatErrors).toHaveLength(0);
      }
    });

    it('should handle case sensitivity differences across platforms', async () => {
      const testPath = 'C:\\Users\\Test\\DOCUMENTS';

      const windowsHandler = new PathHandler('win32');
      const unixHandler = new PathHandler('linux');

      const windowsResult = await windowsHandler.validatePath(testPath);
      const unixResult = await unixHandler.validatePath(testPath);

      // Both should handle the path, but normalization might differ
      expect(windowsResult).toBeDefined();
      expect(unixResult).toBeDefined();

      // Windows should handle drive letters
      expect(windowsResult.normalizedPath).toContain('C:');

      // Unix should convert to forward slashes
      expect(unixResult.normalizedPath).toContain('/');
    });
  });
});
