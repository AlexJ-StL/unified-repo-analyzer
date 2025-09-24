/**
 * Centralized Path Validation Utility
 *
 * Provides consistent path normalization, validation, and security checks
 * across the entire application. Handles various path formats, cross-platform
 * compatibility, and provides clear error messages.
 */

import fs from 'node:fs/promises';
import { platform } from 'node:os';
import path from 'node:path';

// Path validation result types
export interface PathValidationResult {
  isValid: boolean;
  normalizedPath?: string;
  errors: PathValidationError[];
  warnings: PathValidationWarning[];
  metadata: {
    exists: boolean;
    isDirectory: boolean;
    isFile: boolean;
    permissions?: {
      readable: boolean;
      writable: boolean;
      executable: boolean;
    };
    size?: number;
  };
}

export interface PathValidationError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

export interface PathValidationWarning {
  code: string;
  message: string;
  details?: string;
}

// Validation options
export interface PathValidationOptions {
  /** Whether to check if path exists */
  checkExistence?: boolean;
  /** Whether to validate permissions */
  checkPermissions?: boolean;
  /** Whether to perform security checks */
  securityChecks?: boolean;
  /** Base path for resolving relative paths */
  basePath?: string;
  /** Timeout for operations in milliseconds */
  timeoutMs?: number;
  /** Whether to allow UNC paths (Windows only) */
  allowUncPaths?: boolean;
  /** Whether to allow symlinks */
  allowSymlinks?: boolean;
  /** Maximum path length to allow */
  maxPathLength?: number;
}

// Security validation levels
export enum SecurityLevel {
  BASIC = 'basic', // Basic format validation only
  STANDARD = 'standard', // Format + existence + basic security
  STRICT = 'strict', // Full validation + comprehensive security
  PARANOID = 'paranoid', // Maximum security checks
}

// Platform-specific constants
const PLATFORM = platform();
const IS_WINDOWS = PLATFORM === 'win32';
const IS_MACOS = PLATFORM === 'darwin';
const IS_LINUX = PLATFORM === 'linux';
const IS_UNIX = IS_MACOS || IS_LINUX;

// Path length limits
const MAX_PATH_LENGTH = IS_WINDOWS ? 260 : 4096;
const MAX_COMPONENT_LENGTH = IS_WINDOWS ? 255 : 255;

// Windows reserved names
const WINDOWS_RESERVED_NAMES = new Set([
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
]);

// Invalid characters for paths
const _INVALID_PATH_CHARS = IS_WINDOWS ? /[<>:"|?*]/ : /[\0]/;

// Invalid characters for filenames
const _INVALID_FILENAME_CHARS = IS_WINDOWS ? /[<>:"|?*]/ : /[\0]/;

/**
 * Centralized Path Validation Utility Class
 */
export class PathValidator {
  private static instance: PathValidator;
  private readonly platform: string;
  private readonly isWindows: boolean;

  constructor() {
    this.platform = PLATFORM;
    this.isWindows = IS_WINDOWS;
    this.isUnix = IS_UNIX;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PathValidator {
    if (!PathValidator.instance) {
      PathValidator.instance = new PathValidator();
    }
    return PathValidator.instance;
  }

  /**
   * Validate a path with specified options
   */
  public async validatePath(
    inputPath: string,
    options: PathValidationOptions = {}
  ): Promise<PathValidationResult> {
    const result: PathValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      metadata: {
        exists: false,
        isDirectory: false,
        isFile: false,
      },
    };

    try {
      // Basic input validation
      const basicValidation = this.validateBasicInput(inputPath);
      result.errors.push(...basicValidation.errors);
      result.warnings.push(...basicValidation.warnings);

      if (!basicValidation.isValid) {
        return result;
      }

      // Check for directory traversal in original input
      if (options.securityChecks !== false) {
        const normalizedInput = inputPath.replace(/\//g, '\\');
        if (/(?<!:)(?<!^)[\\/]\.\.(\\|\/|$)/.test(normalizedInput)) {
          result.errors.push({
            code: 'DIRECTORY_TRAVERSAL',
            message: 'Path contains directory traversal sequences',
            details:
              'Detected "../" or "..\\" sequences that could be used for path traversal attacks',
            suggestions: [
              'Avoid using "../" in paths',
              'Use absolute paths when possible',
              'Validate path input from untrusted sources carefully',
            ],
          });
          return result;
        }
      }

      // Normalize path
      const normalizedPath = this.normalizePath(inputPath, options.basePath);
      result.normalizedPath = normalizedPath;

      // Security checks
      if (options.securityChecks !== false) {
        const securityValidation = this.validateSecurity(normalizedPath, options);
        result.errors.push(...securityValidation.errors);
        result.warnings.push(...securityValidation.warnings);

        if (!securityValidation.isValid) {
          return result;
        }
      }

      // Existence check
      if (options.checkExistence !== false) {
        const existenceResult = await this.checkExistence(normalizedPath, options.timeoutMs);
        result.metadata.exists = existenceResult.exists;
        result.metadata.isDirectory = existenceResult.isDirectory;
        result.metadata.isFile = existenceResult.isFile;
        result.metadata.size = existenceResult.size;

        if (!existenceResult.exists) {
          result.errors.push({
            code: 'PATH_NOT_FOUND',
            message: 'Path does not exist',
            suggestions: [
              'Check if the path is spelled correctly',
              'Ensure the file or directory exists',
              'Use absolute paths for better reliability',
            ],
          });
          return result;
        }
      }

      // Permission check
      if (options.checkPermissions && result.metadata.exists) {
        const permissionResult = await this.checkPermissions(normalizedPath, options.timeoutMs);
        result.metadata.permissions = permissionResult.permissions;

        if (!permissionResult.permissions.readable) {
          result.errors.push({
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions to access path',
            suggestions: [
              'Check file permissions',
              'Run with appropriate user privileges',
              'Ensure the path is not locked by another process',
            ],
          });
        }
      }

      // If we get here, validation passed
      result.isValid = result.errors.length === 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Path validation failed due to an unexpected error',
        details: errorMessage,
        suggestions: [
          'Try a different path',
          'Check the path format',
          'Ensure the system is functioning properly',
        ],
      });
    }

    return result;
  }

  /**
   * Quick validation for common use cases
   */
  public async quickValidate(
    inputPath: string,
    securityLevel: SecurityLevel = SecurityLevel.STANDARD
  ): Promise<PathValidationResult> {
    const options: PathValidationOptions = {
      checkExistence: securityLevel !== SecurityLevel.BASIC,
      checkPermissions:
        securityLevel === SecurityLevel.STRICT || securityLevel === SecurityLevel.PARANOID,
      securityChecks: securityLevel !== SecurityLevel.BASIC,
      allowUncPaths: securityLevel !== SecurityLevel.PARANOID,
      allowSymlinks: securityLevel !== SecurityLevel.PARANOID,
      maxPathLength: securityLevel === SecurityLevel.PARANOID ? 200 : undefined,
    };

    return this.validatePath(inputPath, options);
  }

  /**
   * Normalize path for cross-platform compatibility
   */
  public normalizePath(inputPath: string, basePath?: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Path must be a non-empty string');
    }

    let normalizedPath: string;

    // Handle UNC paths on Windows
    if (this.isWindows && this.isUncPath(inputPath)) {
      normalizedPath = this.normalizeUncPath(inputPath);
    } else {
      // Resolve relative paths
      if (basePath && !path.isAbsolute(inputPath)) {
        normalizedPath = path.resolve(basePath, inputPath);
      } else {
        normalizedPath = path.resolve(inputPath);
      }

      // Normalize separators
      if (this.isWindows) {
        normalizedPath = normalizedPath.replace(/\//g, '\\');
      } else {
        normalizedPath = normalizedPath.replace(/\\/g, '/');
      }
    }

    // Use Node.js path.normalize for final normalization
    normalizedPath = path.normalize(normalizedPath);

    return normalizedPath;
  }

  /**
   * Validate basic input format
   */
  private validateBasicInput(inputPath: string): {
    isValid: boolean;
    errors: PathValidationError[];
    warnings: PathValidationWarning[];
  } {
    const errors: PathValidationError[] = [];
    const warnings: PathValidationWarning[] = [];

    // Check for empty or invalid input
    if (inputPath == null || typeof inputPath !== 'string') {
      errors.push({
        code: 'INVALID_INPUT',
        message: 'Path must be a non-empty string',
        suggestions: ['Provide a valid path string'],
      });
      return { isValid: false, errors, warnings };
    }

    const trimmedPath = inputPath.trim();

    if (trimmedPath === '') {
      errors.push({
        code: 'EMPTY_PATH',
        message: 'Path cannot be empty or whitespace only',
        suggestions: ['Provide a non-empty path'],
      });
      return { isValid: false, errors, warnings };
    }

    // Check for invalid characters
    const pathParts = trimmedPath.split(this.isWindows ? /[\\/]/ : '/');
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (this.isWindows && i === 0 && part.length === 2 && /^[A-Z]:$/i.test(part)) {
        continue;
      }
      if (part && _INVALID_FILENAME_CHARS.test(part)) {
        errors.push({
          code: 'INVALID_CHARACTERS',
          message: 'Path component contains invalid characters',
          details: `Component "${part}" contains disallowed characters on ${this.platform}`,
          suggestions: [
            'Remove special characters...',
            'Use only alphanumeric...',
            'Check platform-specific...',
          ],
        });
        break;
      }
    }

    // Check path length
    if (trimmedPath.length > MAX_PATH_LENGTH) {
      errors.push({
        code: 'PATH_TOO_LONG',
        message: `Path exceeds maximum length of ${MAX_PATH_LENGTH} characters`,
        details: `Current length: ${trimmedPath.length} characters`,
        suggestions: [
          'Use shorter path names',
          'Move files to a location with shorter paths',
          'Consider using symbolic links or junctions',
        ],
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Perform security validation
   */
  private validateSecurity(
    inputPath: string,
    options: PathValidationOptions
  ): { isValid: boolean; errors: PathValidationError[]; warnings: PathValidationWarning[] } {
    const errors: PathValidationError[] = [];
    const warnings: PathValidationWarning[] = [];

    // Check for directory traversal attempts
    if (this.hasDirectoryTraversal(inputPath)) {
      errors.push({
        code: 'DIRECTORY_TRAVERSAL',
        message: 'Path contains directory traversal sequences',
        details: 'Detected "../" or "..\\" sequences that could be used for path traversal attacks',
        suggestions: [
          'Avoid using "../" in paths',
          'Use absolute paths when possible',
          'Validate path input from untrusted sources carefully',
        ],
      });
    }

    // Windows-specific security checks
    if (this.isWindows) {
      // Check for reserved names
      const pathParts = inputPath.split(/[/\\]/);
      for (const part of pathParts) {
        if (part && WINDOWS_RESERVED_NAMES.has(part.toUpperCase())) {
          errors.push({
            code: 'RESERVED_NAME',
            message: `Path contains reserved Windows name: ${part}`,
            suggestions: [
              'Avoid using reserved names like CON, PRN, AUX, NUL',
              'Rename the file or directory',
              'Use a different path',
            ],
          });
        }
      }

      // Check for UNC path restrictions
      if (!options.allowUncPaths && this.isUncPath(inputPath)) {
        errors.push({
          code: 'UNC_PATH_DISALLOWED',
          message: 'UNC paths are not allowed',
          suggestions: [
            'Use local paths instead of network paths',
            'Enable UNC path support if needed',
          ],
        });
      }
    }

    // Check for hidden files/directories if paranoid
    if (options.securityChecks && this.isHiddenPath(inputPath)) {
      warnings.push({
        code: 'HIDDEN_PATH',
        message: 'Path points to a hidden file or directory',
        details: 'Hidden files may contain sensitive information',
      });
    }

    // Check for overly long path components
    const pathParts = inputPath.split(/[/\\]/);
    for (const part of pathParts) {
      if (part.length > MAX_COMPONENT_LENGTH) {
        errors.push({
          code: 'COMPONENT_TOO_LONG',
          message: `Path component exceeds maximum length of ${MAX_COMPONENT_LENGTH} characters`,
          details: `Component "${part}" is ${part.length} characters long`,
          suggestions: ['Use shorter file or directory names', 'Reorganize directory structure'],
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if path exists and get metadata
   */
  private async checkExistence(
    inputPath: string,
    timeoutMs?: number
  ): Promise<{
    exists: boolean;
    isDirectory: boolean;
    isFile: boolean;
    size?: number;
  }> {
    try {
      const stats = await this.withTimeout(
        fs.stat(inputPath),
        timeoutMs || 5000,
        'Path existence check timed out'
      );

      return {
        exists: true,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
      };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          exists: false,
          isDirectory: false,
          isFile: false,
        };
      }
      throw error;
    }
  }

  /**
   * Check path permissions
   */
  private async checkPermissions(
    inputPath: string,
    timeoutMs?: number
  ): Promise<{
    permissions: {
      readable: boolean;
      writable: boolean;
      executable: boolean;
    };
  }> {
    const permissions = {
      readable: false,
      writable: false,
      executable: false,
    };

    try {
      await this.withTimeout(
        fs.access(inputPath, fs.constants.R_OK),
        timeoutMs || 5000,
        'Permission check timed out'
      );
      permissions.readable = true;
    } catch {
      // Permission denied for read
    }

    try {
      await this.withTimeout(
        fs.access(inputPath, fs.constants.W_OK),
        timeoutMs || 5000,
        'Permission check timed out'
      );
      permissions.writable = true;
    } catch {
      // Permission denied for write
    }

    try {
      await this.withTimeout(
        fs.access(inputPath, fs.constants.X_OK),
        timeoutMs || 5000,
        'Permission check timed out'
      );
      permissions.executable = true;
    } catch {
      // Permission denied for execute
    }

    return { permissions };
  }

  /**
   * Utility methods for path analysis
   */
  private isUncPath(inputPath: string): boolean {
    return this.isWindows && inputPath.startsWith('\\\\');
  }

  private normalizeUncPath(inputPath: string): string {
    // Basic UNC path normalization
    return inputPath.replace(/\//g, '\\');
  }

  private hasDirectoryTraversal(inputPath: string): boolean {
    // Check for "../" or "..\" sequences
    return /\.\.[/\\]/.test(inputPath) || inputPath.includes('..');
  }

  private isHiddenPath(inputPath: string): boolean {
    const pathParts = inputPath.split(/[/\\]/);
    return pathParts.some((part) => part.startsWith('.') && part !== '.' && part !== '..');
  }

  /**
   * Timeout wrapper for promises
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }
}

// Export singleton instance
export const pathValidator = PathValidator.getInstance();

// Export convenience functions
export async function validatePath(
  inputPath: string,
  options?: PathValidationOptions
): Promise<PathValidationResult> {
  return pathValidator.validatePath(inputPath, options);
}

export async function quickValidate(
  inputPath: string,
  securityLevel?: SecurityLevel
): Promise<PathValidationResult> {
  return pathValidator.quickValidate(inputPath, securityLevel);
}

export function normalizePath(inputPath: string, basePath?: string): string {
  return pathValidator.normalizePath(inputPath, basePath);
}
