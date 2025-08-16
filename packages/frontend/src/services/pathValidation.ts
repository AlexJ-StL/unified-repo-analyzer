/**
 * Frontend path validation service that integrates with backend PathHandler
 */

import axios from 'axios';

// Path validation result interface (matches backend)
export interface PathValidationResult {
  isValid: boolean;
  normalizedPath?: string;
  errors: PathError[];
  warnings: PathWarning[];
  metadata: {
    exists: boolean;
    isDirectory: boolean;
    permissions: PermissionFlags;
    size?: number;
  };
}

export interface PathError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

export interface PathWarning {
  code: string;
  message: string;
  details?: string;
}

export interface PermissionFlags {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface PathValidationOptions {
  timeoutMs?: number;
  validateExistence?: boolean;
  validatePermissions?: boolean;
}

export interface PathValidationProgress {
  stage: string;
  percentage: number;
  message: string;
}

/**
 * Path validation service for frontend
 */
class PathValidationService {
  private readonly baseURL = 'http://localhost:3000/api';
  private readonly defaultTimeout = 10000; // 10 seconds

  /**
   * Validate path using backend PathHandler service
   */
  async validatePath(
    path: string,
    options: PathValidationOptions = {},
    onProgress?: (progress: PathValidationProgress) => void
  ): Promise<PathValidationResult> {
    if (!path || typeof path !== 'string' || path.trim() === '') {
      return {
        isValid: false,
        errors: [
          {
            code: 'INVALID_INPUT',
            message: 'Path must be a non-empty string',
            suggestions: ['Provide a valid path'],
          },
        ],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      };
    }

    try {
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutMs = options.timeoutMs || this.defaultTimeout;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      // Start progress reporting
      const progressInterval = setInterval(() => {
        if (onProgress) {
          onProgress({
            stage: 'validating',
            percentage: 50,
            message: 'Validating path...',
          });
        }
      }, 500);

      try {
        const response = await axios.post(
          `${this.baseURL}/path/validate`,
          {
            path: path.trim(),
            options: {
              timeoutMs,
              validateExistence: options.validateExistence !== false,
              validatePermissions: options.validatePermissions !== false,
            },
          },
          {
            signal: controller.signal,
            timeout: timeoutMs + 1000, // Add buffer to axios timeout
          }
        );

        clearTimeout(timeoutId);
        clearInterval(progressInterval);

        if (onProgress) {
          onProgress({
            stage: 'completed',
            percentage: 100,
            message: 'Path validation completed',
          });
        }

        return response.data;
      } catch (error) {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);

        if (axios.isCancel(error) || (error as any).name === 'AbortError') {
          return {
            isValid: false,
            errors: [
              {
                code: 'TIMEOUT_ERROR',
                message: `Path validation timed out after ${timeoutMs}ms`,
                suggestions: [
                  'Try with a shorter path',
                  'Check if the path is on a slow network drive',
                  'Increase timeout settings',
                ],
              },
            ],
            warnings: [],
            metadata: {
              exists: false,
              isDirectory: false,
              permissions: { read: false, write: false, execute: false },
            },
          };
        }

        throw error;
      }
    } catch (error) {
      // Handle network or other errors
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          // Backend returned validation result with errors
          return error.response.data;
        }

        return {
          isValid: false,
          errors: [
            {
              code: 'NETWORK_ERROR',
              message: 'Failed to validate path due to network error',
              details: error.message,
              suggestions: [
                'Check your network connection',
                'Ensure the backend service is running',
                'Try again in a moment',
              ],
            },
          ],
          warnings: [],
          metadata: {
            exists: false,
            isDirectory: false,
            permissions: { read: false, write: false, execute: false },
          },
        };
      }

      return {
        isValid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: 'Path validation failed',
            details: error instanceof Error ? error.message : String(error),
            suggestions: ['Try a different path', 'Check the path format'],
          },
        ],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      };
    }
  }

  /**
   * Get platform-specific path format hints
   */
  getPathFormatHints(): {
    platform: string;
    examples: string[];
    tips: string[];
  } {
    const isWindows = navigator.platform.toLowerCase().includes('win');

    if (isWindows) {
      return {
        platform: 'Windows',
        examples: [
          'C:\\Users\\Username\\Documents\\MyProject',
          'C:/Users/Username/Documents/MyProject',
          '\\\\server\\share\\folder',
          '.\\relative\\path',
          '..\\parent\\directory',
        ],
        tips: [
          'Use either forward slashes (/) or backslashes (\\)',
          'Drive letters should be followed by a colon (C:)',
          'UNC paths start with \\\\ for network locations',
          'Avoid reserved names like CON, PRN, AUX, NUL',
          'Maximum path length is 260 characters (unless long paths are enabled)',
        ],
      };
    }
    return {
      platform: 'Unix/Linux/macOS',
      examples: [
        '/home/username/Documents/MyProject',
        '/Users/username/Documents/MyProject',
        './relative/path',
        '../parent/directory',
        '~/Documents/MyProject',
      ],
      tips: [
        'Paths are case-sensitive',
        'Use forward slashes (/) as path separators',
        'Paths starting with / are absolute',
        'Paths starting with ./ or ../ are relative',
        '~ represents the home directory',
      ],
    };
  }

  /**
   * Normalize path for display purposes (client-side only)
   */
  normalizePathForDisplay(path: string): string {
    if (!path) return '';

    // Basic normalization for display
    const isWindows = navigator.platform.toLowerCase().includes('win');

    if (isWindows) {
      // Convert forward slashes to backslashes for Windows display
      return path.replace(/\//g, '\\');
    }
    // Convert backslashes to forward slashes for Unix display
    return path.replace(/\\/g, '/');
  }

  /**
   * Check if path looks like it might be valid (basic client-side check)
   */
  isPathFormatValid(path: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!path || path.trim() === '') {
      errors.push('Path cannot be empty');
      return { isValid: false, errors };
    }

    const trimmedPath = path.trim();
    const isWindows = navigator.platform.toLowerCase().includes('win');

    if (isWindows) {
      // Windows-specific checks
      if (/[<>:"|?*]/.test(trimmedPath)) {
        errors.push('Path contains invalid characters: < > : " | ? *');
      }

      if (trimmedPath.length > 260) {
        errors.push('Path may be too long for Windows (over 260 characters)');
      }

      // Check for reserved names
      const reservedNames = [
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
      ];
      const pathParts = trimmedPath.split(/[/\\]/);
      for (const part of pathParts) {
        if (part && reservedNames.includes(part.toUpperCase())) {
          errors.push(`Path contains reserved name: ${part}`);
        }
      }
    } else {
      // Unix-like systems
      if (trimmedPath.includes('\0')) {
        errors.push('Path cannot contain null characters');
      }

      if (trimmedPath.length > 4096) {
        errors.push('Path may be too long (over 4096 characters)');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const pathValidationService = new PathValidationService();
export default pathValidationService;
