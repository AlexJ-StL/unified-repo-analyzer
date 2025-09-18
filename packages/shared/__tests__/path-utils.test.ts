/**
 * Tests for Centralized Path Validation Utility
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pathValidator, SecurityLevel } from '../src/utils/path-utils';

describe('PathValidator', () => {
  let tempDir: string;
  let testFile: string;
  let testDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'path-validator-test-'));
    testFile = path.join(tempDir, 'test.txt');
    testDir = path.join(tempDir, 'testdir');

    // Create test file and directory
    await fs.writeFile(testFile, 'test content');
    await fs.mkdir(testDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  describe('Basic Input Validation', () => {
    it('should reject empty path', async () => {
      const result = await pathValidator.validatePath('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_PATH');
    });

    it('should reject null path', async () => {
      const result = await pathValidator.validatePath(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_INPUT');
    });

    it('should reject undefined path', async () => {
      const result = await pathValidator.validatePath(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_INPUT');
    });
  });

  describe('Path Normalization', () => {
    it('should normalize existing file path', async () => {
      const result = await pathValidator.validatePath(testFile);
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe(path.resolve(testFile));
      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isFile).toBe(true);
      expect(result.metadata.isDirectory).toBe(false);
    });

    it('should normalize existing directory path', async () => {
      const result = await pathValidator.validatePath(testDir);
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe(path.resolve(testDir));
      expect(result.metadata.exists).toBe(true);
      expect(result.metadata.isFile).toBe(false);
      expect(result.metadata.isDirectory).toBe(true);
    });

    it('should handle relative paths', async () => {
      const relativePath = path.relative(process.cwd(), testFile);
      const result = await pathValidator.validatePath(relativePath);
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe(path.resolve(relativePath));
    });
  });

  describe('Security Validation', () => {
    it('should detect directory traversal attempts', async () => {
      const maliciousPath = path.join(testDir, '..', '..', 'etc', 'passwd');
      const result = await pathValidator.validatePath(maliciousPath, {
        securityChecks: true,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('DIRECTORY_TRAVERSAL');
    });

    it('should reject paths with invalid characters', async () => {
      const invalidPath = 'test<file>.txt';
      const result = await pathValidator.validatePath(invalidPath);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_CHARACTERS');
    });

    it('should reject overly long paths', async () => {
      const longPath = 'a'.repeat(300);
      const result = await pathValidator.validatePath(longPath);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('PATH_TOO_LONG');
    });
  });

  describe('Permission Validation', () => {
    it('should validate read permissions for existing file', async () => {
      const result = await pathValidator.validatePath(testFile, {
        checkPermissions: true,
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata.permissions?.readable).toBe(true);
    });

    it('should validate directory permissions', async () => {
      const result = await pathValidator.validatePath(testDir, {
        checkPermissions: true,
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata.permissions?.readable).toBe(true);
    });
  });

  describe('Non-existent Paths', () => {
    it('should handle non-existent paths', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');
      const result = await pathValidator.validatePath(nonExistentPath);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('PATH_NOT_FOUND');
      expect(result.metadata.exists).toBe(false);
    });

    it('should allow non-existent paths when existence check is disabled', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');
      const result = await pathValidator.validatePath(nonExistentPath, {
        checkExistence: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe(path.resolve(nonExistentPath));
      expect(result.metadata.exists).toBe(false);
    });
  });

  describe('Quick Validation', () => {
    it('should work with BASIC security level', async () => {
      const result = await pathValidator.quickValidate(testFile, SecurityLevel.BASIC);
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toBe(path.resolve(testFile));
    });

    it('should work with STANDARD security level', async () => {
      const result = await pathValidator.quickValidate(testFile, SecurityLevel.STANDARD);
      expect(result.isValid).toBe(true);
      expect(result.metadata.exists).toBe(true);
    });

    it('should work with STRICT security level', async () => {
      const result = await pathValidator.quickValidate(testFile, SecurityLevel.STRICT);
      expect(result.isValid).toBe(true);
      expect(result.metadata.permissions?.readable).toBe(true);
    });
  });

  describe('Cross-platform Compatibility', () => {
    it('should handle different path separators', async () => {
      // Test with forward slashes on Windows-like systems
      const pathWithForwardSlashes = testFile.replace(/\\/g, '/');
      const result = await pathValidator.validatePath(pathWithForwardSlashes);
      expect(result.isValid).toBe(true);
    });

    it('should handle UNC paths on Windows', async () => {
      // This test would only run on Windows
      if (process.platform === 'win32') {
        const uncPath = `\\\\localhost\\${testFile.replace(/\\/g, '\\')}`;
        const result = await pathValidator.validatePath(uncPath, {
          allowUncPaths: true,
        });
        // UNC path validation depends on system configuration
        expect(result).toBeDefined();
      }
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages', async () => {
      const result = await pathValidator.validatePath('');
      expect(result.errors[0].message).toContain('Path cannot be empty');
      expect(result.errors[0].suggestions).toContain('Provide a non-empty path');
    });

    it('should provide detailed error information', async () => {
      const invalidPath = 'test<file>.txt';
      const result = await pathValidator.validatePath(invalidPath);
      expect(result.errors[0].code).toBe('INVALID_CHARACTERS');
      expect(result.errors[0].message).toContain('invalid characters');
      expect(result.errors[0].suggestions).toBeDefined();
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout gracefully', async () => {
      const result = await pathValidator.validatePath(testFile, {
        timeoutMs: 1, // Very short timeout
      });
      // Should either succeed quickly or timeout gracefully
      expect(result).toBeDefined();
    });
  });
});
