/**
 * PathHandler service tests
 */

import fs from 'node:fs/promises';
import { platform } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PathHandler } from '../path-handler.service.js';

// Mock dependencies
vi.mock('node:fs/promises');
vi.mock('node:os');
vi.mock('../logger.service.js', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFs = fs as any;
const _mockPlatform = platform as any;

describe('PathHandler Service', () => {
  let pathHandler: PathHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    pathHandler = new PathHandler();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PathHandler.getInstance();
      const instance2 = PathHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Path Normalization - Cross Platform', () => {
    it('should normalize forward slashes on Windows', () => {
      const handler = new PathHandler('win32');

      const result = handler.normalizePath('C:/Users/Test/Documents');
      expect(result).toBe('C:\\Users\\Test\\Documents');
    });

    it('should normalize backslashes on Unix-like systems', () => {
      const handler = new PathHandler('linux');

      const result = handler.normalizePath('home\\user\\documents');
      expect(result).toBe('home/user/documents');
    });

    it('should handle empty or invalid paths', () => {
      expect(() => pathHandler.normalizePath('')).toThrow('Path must be a non-empty string');
      expect(() => pathHandler.normalizePath(null as any)).toThrow(
        'Path must be a non-empty string'
      );
      expect(() => pathHandler.normalizePath(undefined as any)).toThrow(
        'Path must be a non-empty string'
      );
    });

    it('should normalize relative paths', () => {
      const result = pathHandler.normalizePath('./test/../documents');
      expect(result).toContain('documents');
      expect(result).not.toContain('..');
    });
  });

  describe('Windows-Specific Path Handling', () => {
    it('should handle UNC paths', () => {
      const handler = new PathHandler('win32');
      const result = handler.normalizePath('\\\\server\\share\\folder');
      expect(result).toBe('\\\\server\\share\\folder');
    });

    it('should normalize drive letters to uppercase', () => {
      const handler = new PathHandler('win32');
      const result = handler.normalizePath('c:\\users\\test');
      expect(result).toBe('C:\\users\\test');
    });

    it('should handle mixed path separators', () => {
      const handler = new PathHandler('win32');
      const result = handler.normalizePath('C:/Users\\Test/Documents');
      expect(result).toBe('C:\\Users\\Test\\Documents');
    });
  });

  describe('Path Format Validation', () => {
    it('should detect Windows reserved names', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('C:\\Users\\CON\\test');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'RESERVED_NAME')).toBe(true);
      const reservedError = result.errors.find((e) => e.code === 'RESERVED_NAME');
      expect(reservedError?.message).toContain('CON');
    });

    it('should detect all Windows reserved names', async () => {
      const handler = new PathHandler('win32');
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM9', 'LPT1', 'LPT9'];

      for (const name of reservedNames) {
        const result = await handler.validatePath(`C:\\Users\\${name}\\test`);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'RESERVED_NAME')).toBe(true);
      }
    });

    it('should detect invalid Windows characters', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('C:\\Users\\test<file>');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_CHARACTERS')).toBe(true);
    });

    it('should detect all invalid Windows characters', async () => {
      const handler = new PathHandler('win32');
      const invalidChars = ['<', '>', ':', '"', '|', '?', '*'];

      for (const char of invalidChars) {
        const result = await handler.validatePath(`C:\\Users\\test${char}file`);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_CHARACTERS')).toBe(true);
      }
    });

    it('should detect control characters', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('C:\\Users\\test\x01file');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'CONTROL_CHARACTERS')).toBe(true);
    });

    it('should detect null bytes in path', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('C:\\Users\\test\0file');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'NULL_BYTE_IN_PATH')).toBe(true);
    });

    it('should detect trailing spaces and dots', async () => {
      const handler = new PathHandler('win32');

      const spaceResult = await handler.validatePath('C:\\Users\\test \\file');
      expect(spaceResult.isValid).toBe(false);
      expect(spaceResult.errors.some((e) => e.code === 'INVALID_COMPONENT_ENDING')).toBe(true);

      const dotResult = await handler.validatePath('C:\\Users\\test.\\file');
      expect(dotResult.isValid).toBe(false);
      expect(dotResult.errors.some((e) => e.code === 'INVALID_COMPONENT_ENDING')).toBe(true);
    });

    it('should detect paths that are too long', async () => {
      const handler = new PathHandler('win32');
      const longPath = `C:\\${'a'.repeat(300)}`;
      const result = await handler.validatePath(longPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'PATH_TOO_LONG')).toBe(true);
    });

    it('should validate drive letter format', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('Z:\\test');

      // Should not have drive letter errors for valid format
      const driveErrors = result.errors.filter((e) => e.code === 'INVALID_DRIVE_LETTER');
      expect(driveErrors).toHaveLength(0);
    });

    it('should detect invalid drive letter format', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('1:\\test');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_DRIVE_LETTER')).toBe(true);
    });

    it('should validate UNC path format', async () => {
      const handler = new PathHandler('win32');

      // Valid UNC path
      const validResult = await handler.validatePath('\\\\server\\share\\folder');
      const uncErrors = validResult.errors.filter((e) => e.code === 'INVALID_UNC_PATH');
      expect(uncErrors).toHaveLength(0);

      // Invalid UNC path (missing share)
      const invalidResult = await handler.validatePath('\\\\server');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.some((e) => e.code === 'INVALID_UNC_PATH')).toBe(true);
    });

    it('should warn about very long paths on Unix systems', async () => {
      const handler = new PathHandler('linux');
      const veryLongPath = `/home/user/${'a'.repeat(5000)}`;
      const result = await handler.validatePath(veryLongPath);

      expect(result.warnings.some((w) => w.code === 'VERY_LONG_PATH')).toBe(true);
    });

    it('should warn about long path components', async () => {
      const handler = new PathHandler('win32');
      const longComponent = 'a'.repeat(300);
      const result = await handler.validatePath(`C:\\Users\\${longComponent}\\test`);

      expect(result.warnings.some((w) => w.code === 'COMPONENT_TOO_LONG')).toBe(true);
    });

    it('should handle mixed path separators in validation', async () => {
      const handler = new PathHandler('win32');
      const result = await handler.validatePath('C:/Users\\test/file');

      // Should not fail validation just because of mixed separators
      const formatErrors = result.errors.filter(
        (e) =>
          e.code !== 'INVALID_CHARACTERS' &&
          e.code !== 'RESERVED_NAME' &&
          e.code !== 'PATH_TOO_LONG'
      );
      expect(formatErrors).toHaveLength(0);
    });
  });

  describe('Path Existence and Metadata', () => {
    it('should detect existing files', async () => {
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
      });

      const result = await pathHandler.validatePath('/existing/file.txt');

      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isDirectory).toBe(false);
      expect(result.metadata.size).toBe(1024);
    });

    it('should detect existing directories', async () => {
      mockFs.stat.mockResolvedValue({
        isDirectory: () => true,
        size: 0,
      });

      const result = await pathHandler.validatePath('/existing/directory');

      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isDirectory).toBe(true);
      expect(result.metadata.size).toBeUndefined();
    });

    it('should handle non-existing paths', async () => {
      mockFs.stat.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await pathHandler.validatePath('/non/existing/path');

      expect(result.metadata.exists).toBe(false);
      expect(result.metadata.isDirectory).toBe(false);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      // Default mock: path exists
      mockFs.stat.mockResolvedValue({
        uid: 1000,
        gid: 1000,
        mode: 0o755,
      });
    });

    it('should check read permissions', async () => {
      mockFs.access.mockImplementation((_path: any, mode: any) => {
        if (mode === fs.constants.R_OK) return Promise.resolve();
        return Promise.reject(new Error('Permission denied'));
      });

      const result = await pathHandler.checkPermissions('/test/path');

      expect(result.canRead).toBe(true);
      expect(result.canWrite).toBe(false);
      expect(result.canExecute).toBe(false);
    });

    it('should check write permissions', async () => {
      mockFs.access.mockImplementation((_path: any, mode: any) => {
        if (mode === fs.constants.W_OK) return Promise.resolve();
        return Promise.reject(new Error('Permission denied'));
      });

      const result = await pathHandler.checkPermissions('/test/path');

      expect(result.canRead).toBe(false);
      expect(result.canWrite).toBe(true);
      expect(result.canExecute).toBe(false);
    });

    it('should check execute permissions', async () => {
      mockFs.access.mockImplementation((_path: any, mode: any) => {
        if (mode === fs.constants.X_OK) return Promise.resolve();
        return Promise.reject(new Error('Permission denied'));
      });

      const result = await pathHandler.checkPermissions('/test/path');

      expect(result.canRead).toBe(false);
      expect(result.canWrite).toBe(false);
      expect(result.canExecute).toBe(true);
    });

    it('should check all permissions when available', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const result = await pathHandler.checkPermissions('/test/path');

      expect(result.canRead).toBe(true);
      expect(result.canWrite).toBe(true);
      expect(result.canExecute).toBe(true);
    });

    it('should handle non-existent paths', async () => {
      mockFs.stat.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await pathHandler.checkPermissions('/non/existent/path');

      expect(result.canRead).toBe(false);
      expect(result.canWrite).toBe(false);
      expect(result.canExecute).toBe(false);
      expect(result.errors.some((e) => e.code === 'PATH_NOT_FOUND')).toBe(true);
    });

    it('should get file ownership on Unix-like systems', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        uid: 1000,
        gid: 1000,
        mode: 0o755,
      });

      const handler = new PathHandler('linux');
      const result = await handler.checkPermissions('/test/path');

      expect(result.owner).toBe('1000');
      expect(result.group).toBe('1000');
    });

    it('should handle Windows permission checks', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        mode: 0o755,
      });

      const handler = new PathHandler('win32');
      const result = await handler.checkPermissions('C:\\test\\path');

      expect(result.owner).toBe('Windows User');
      expect(result.group).toBe('Windows Group');
    });

    it('should detect Windows system paths', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        mode: 0o755,
      });

      const handler = new PathHandler('win32');
      const result = await handler.checkPermissions('C:\\Windows\\System32\\test');

      expect(result.errors.some((e) => e.code === 'SYSTEM_PATH_ACCESS')).toBe(true);
    });

    it('should detect read-only files on Windows', async () => {
      mockFs.access.mockImplementation((_path: any, mode: any) => {
        if (mode === fs.constants.W_OK) return Promise.reject(new Error('Permission denied'));
        return Promise.resolve();
      });

      mockFs.stat.mockResolvedValue({
        mode: 0o444, // Read-only mode
      });

      const handler = new PathHandler('win32');
      const result = await handler.checkPermissions('C:\\test\\readonly.txt');

      expect(result.canWrite).toBe(false);
      expect(result.errors.some((e) => e.code === 'READ_ONLY_FILE')).toBe(true);
    });

    it('should provide detailed error messages for Windows permission issues', async () => {
      mockFs.access.mockImplementation((_path: any, _mode: any) => {
        return Promise.reject(new Error('Access denied'));
      });

      mockFs.stat.mockResolvedValue({
        mode: 0o755,
      });

      const handler = new PathHandler('win32');
      const result = await handler.checkPermissions('C:\\test\\path');

      expect(result.errors.some((e) => e.code === 'READ_PERMISSION_DENIED')).toBe(true);
      expect(result.errors.some((e) => e.code === 'WRITE_PERMISSION_DENIED')).toBe(true);
    });

    it('should handle permission check errors gracefully', async () => {
      mockFs.stat.mockResolvedValue({ mode: 0o755 });
      mockFs.access.mockRejectedValue(new Error('Unexpected error'));

      const result = await pathHandler.checkPermissions('/test/path');

      expect(result.canRead).toBe(false);
      expect(result.canWrite).toBe(false);
      expect(result.canExecute).toBe(false);
    });

    it('should handle ownership information errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        // Missing uid/gid to trigger error handling
        mode: 0o755,
      });

      const handler = new PathHandler('linux');
      const result = await handler.checkPermissions('/test/path');

      expect(result.owner).toBe('unknown');
      expect(result.group).toBe('unknown');
    });

    it('should detect hidden files on Windows', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        mode: 0o755,
      });

      const handler = new PathHandler('win32');
      // This should not cause errors, just log debug info
      const result = await handler.checkPermissions('C:\\test\\.hidden');

      // Hidden files don't cause errors, just debug logging
      expect(result.canRead).toBe(true);
    });
  });

  describe('Relative Path Resolution', () => {
    it('should resolve relative paths with base path', () => {
      const result = pathHandler.resolveRelativePath('./documents', '/home/user');
      expect(result).toContain('documents');
      expect(result).toContain('user');
    });

    it('should resolve relative paths without base path', () => {
      const result = pathHandler.resolveRelativePath('./documents');
      expect(result).toContain('documents');
    });

    it('should handle path resolution errors', () => {
      expect(() => pathHandler.resolveRelativePath('')).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      // Mock a more severe error that would cause validation to fail
      mockFs.stat.mockRejectedValue(new Error('Unexpected error'));

      // Use an invalid path that would trigger format validation errors
      const result = await pathHandler.validatePath('');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error messages', async () => {
      const handler = new PathHandler('win32');

      const result = await handler.validatePath('C:\\Users\\CON\\test');

      const errorWithSuggestions = result.errors.find(
        (e) => e.suggestions && e.suggestions.length > 0
      );
      expect(errorWithSuggestions).toBeDefined();
    });
  });

  describe('Timeout and Progress Handling', () => {
    beforeEach(() => {
      mockFs.stat.mockResolvedValue({
        uid: 1000,
        gid: 1000,
        mode: 0o755,
      });
      mockFs.access.mockResolvedValue(undefined);
    });

    it('should complete validation within timeout', async () => {
      const result = await pathHandler.validatePath('/test/path', {
        timeoutMs: 1000,
      });

      expect(result.isValid).toBe(true);
    });

    it('should report progress during validation', async () => {
      const progressUpdates: Array<{
        stage: string;
        percentage: number;
        message: string;
      }> = [];

      const result = await pathHandler.validatePath('/test/path', {
        onProgress: (progress) => {
          progressUpdates.push(progress);
        },
      });

      expect(result.isValid).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].stage).toBe('format_validation');
      expect(progressUpdates[progressUpdates.length - 1].stage).toBe('completed');
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
    });

    it('should handle operation cancellation', async () => {
      const controller = pathHandler.createAbortController();

      // Mock a slow operation to ensure cancellation has time to work
      mockFs.stat.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  uid: 1000,
                  gid: 1000,
                  mode: 0o755,
                }),
              100
            )
          )
      );

      // Cancel the operation after a short delay
      setTimeout(() => controller.abort(), 20);

      try {
        const result = await pathHandler.validatePath('/test/path', {
          signal: controller.signal,
        });

        // If we get a result, it should indicate cancellation
        expect(result.errors.some((e) => e.code === 'OPERATION_CANCELLED')).toBe(true);
      } catch (error) {
        // If the operation throws an AbortError, that's expected
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('AbortError');
      }
    });

    it('should timeout long-running operations', async () => {
      // Mock fs.stat to take a long time
      mockFs.stat.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 200)));

      const startTime = Date.now();

      try {
        const result = await pathHandler.validatePath('/test/path', {
          timeoutMs: 50,
        });

        // If we get a result, it should have timeout-related errors
        expect(result.errors.some((e) => e.code === 'TIMEOUT_ERROR')).toBe(true);
      } catch (error) {
        // If it throws a TimeoutError, that's also acceptable
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('TimeoutError');
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(150); // Should timeout quickly
    });

    it('should support timeout in permission checking', async () => {
      const result = await pathHandler.checkPermissions('/test/path', {
        timeoutMs: 1000,
      });

      expect(result.canRead).toBe(true);
      expect(result.canWrite).toBe(true);
      expect(result.canExecute).toBe(true);
    });

    it('should handle permission check cancellation', async () => {
      const controller = pathHandler.createAbortController();

      // Mock a slow operation
      mockFs.stat.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  uid: 1000,
                  gid: 1000,
                  mode: 0o755,
                }),
              100
            )
          )
      );

      // Cancel after a short delay
      setTimeout(() => controller.abort(), 20);

      try {
        const result = await pathHandler.checkPermissions('/test/path', {
          signal: controller.signal,
        });

        // If we get a result, it should indicate an error due to cancellation
        expect(result.errors.length).toBeGreaterThan(0);
      } catch (error) {
        // If the operation throws an AbortError, that's expected
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('AbortError');
      }
    });

    it('should create abort controller', () => {
      const controller = pathHandler.createAbortController();

      expect(controller).toBeInstanceOf(AbortController);
      expect(controller.signal).toBeDefined();
      expect(controller.signal.aborted).toBe(false);
    });

    it('should handle pre-aborted signals', async () => {
      const controller = pathHandler.createAbortController();
      controller.abort();

      try {
        const result = await pathHandler.validatePath('/test/path', {
          signal: controller.signal,
        });

        expect(result.errors.some((e) => e.code === 'OPERATION_CANCELLED')).toBe(true);
      } catch (error) {
        // If the operation throws an AbortError immediately, that's expected
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('AbortError');
      }
    });

    it('should provide detailed progress information', async () => {
      const progressUpdates: Array<{
        stage: string;
        percentage: number;
        message: string;
      }> = [];

      // Ensure the path exists so permission check runs
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        uid: 1000,
        gid: 1000,
        mode: 0o755,
      });

      await pathHandler.validatePath('/test/path', {
        onProgress: (progress) => {
          progressUpdates.push(progress);
        },
      });

      // Check that we have all expected stages
      const stages = progressUpdates.map((p) => p.stage);
      expect(stages).toContain('format_validation');
      expect(stages).toContain('normalization');
      expect(stages).toContain('existence_check');
      expect(stages).toContain('permission_check');
      expect(stages).toContain('completed');

      // Check that percentages are increasing
      const percentages = progressUpdates.map((p) => p.percentage);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work on Linux', () => {
      const handler = new PathHandler('linux');

      const result = handler.normalizePath('/home/user/documents');
      expect(result).toBe('/home/user/documents');
    });

    it('should work on macOS', () => {
      const handler = new PathHandler('darwin');

      const result = handler.normalizePath('/Users/user/Documents');
      expect(result).toBe('/Users/user/Documents');
    });

    it('should work on Windows', () => {
      const handler = new PathHandler('win32');

      const result = handler.normalizePath('C:\\Users\\User\\Documents');
      expect(result).toBe('C:\\Users\\User\\Documents');
    });
  });
});
