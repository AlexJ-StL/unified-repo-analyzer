/**
 * Path validation controller
 */

import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logger from '../../services/logger.service';
import { pathHandler } from '../../services/path-handler.service';

/**
 * Validate a path using PathHandler service
 *
 * @param req - Express request
 * @param res - Express response
 */
export const validatePath = async (req: Request, res: Response): Promise<void> => {
  const requestId = (req.headers['x-request-id'] as string) || `req-${Date.now()}`;

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Path validation request validation failed', {
        requestId,
        errors: errors.array(),
        path: req.body.path,
      });
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { path, options = {} } = req.body;

    // Check if path is missing or invalid
    if (!path || typeof path !== 'string' || path.trim() === '') {
      logger.warn('Path validation failed - invalid input', {
        requestId,
        path,
      });

      res.status(400).json({
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
      });
      return;
    }

    logger.info('Starting path validation', {
      requestId,
      path,
      options,
    });

    // Validate path using PathHandler
    const validationResult = await pathHandler.validatePath(path, {
      timeoutMs: options.timeoutMs || 10000,
      onProgress: (progress) => {
        logger.debug('Path validation progress', {
          requestId,
          stage: progress.stage,
          percentage: progress.percentage,
          message: progress.message,
        });
      },
    });

    logger.info('Path validation completed', {
      requestId,
      path,
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
    });

    // Return validation result
    res.status(200).json(validationResult);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Path validation failed', {
      requestId,
      path: req.body.path,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check for specific error types
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        res.status(408).json({
          isValid: false,
          errors: [
            {
              code: 'TIMEOUT_ERROR',
              message: 'Path validation timed out',
              details: errorMessage,
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
        });
        return;
      }

      if (error.name === 'AbortError') {
        res.status(499).json({
          isValid: false,
          errors: [
            {
              code: 'OPERATION_CANCELLED',
              message: 'Path validation was cancelled',
              details: errorMessage,
            },
          ],
          warnings: [],
          metadata: {
            exists: false,
            isDirectory: false,
            permissions: { read: false, write: false, execute: false },
          },
        });
        return;
      }
    }

    res.status(500).json({
      isValid: false,
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: 'Path validation failed',
          details: errorMessage,
          suggestions: [
            'Check if the path format is correct',
            'Ensure the path is accessible',
            'Try again with a different path',
          ],
        },
      ],
      warnings: [],
      metadata: {
        exists: false,
        isDirectory: false,
        permissions: { read: false, write: false, execute: false },
      },
    });
  }
};

/**
 * Get platform-specific path format information
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getPathFormatInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isWindows = process.platform === 'win32';

    const formatInfo = {
      platform: process.platform,
      isWindows,
      pathSeparator: isWindows ? '\\' : '/',
      examples: isWindows
        ? [
            'C:\\Users\\Username\\Documents\\MyProject',
            'C:/Users/Username/Documents/MyProject',
            '\\\\server\\share\\folder',
            '.\\relative\\path',
            '..\\parent\\directory',
          ]
        : [
            '/home/username/Documents/MyProject',
            '/Users/username/Documents/MyProject',
            './relative/path',
            '../parent/directory',
            '~/Documents/MyProject',
          ],
      tips: isWindows
        ? [
            'Use either forward slashes (/) or backslashes (\\)',
            'Drive letters should be followed by a colon (C:)',
            'UNC paths start with \\\\ for network locations',
            'Avoid reserved names like CON, PRN, AUX, NUL',
            'Maximum path length is 260 characters (unless long paths are enabled)',
          ]
        : [
            'Paths are case-sensitive',
            'Use forward slashes (/) as path separators',
            'Paths starting with / are absolute',
            'Paths starting with ./ or ../ are relative',
            '~ represents the home directory',
          ],
      reservedNames: isWindows
        ? [
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
          ]
        : [],
      maxPathLength: isWindows ? 260 : 4096,
      invalidCharacters: isWindows ? ['<', '>', ':', '"', '|', '?', '*'] : ['\0'],
    };

    res.status(200).json(formatInfo);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Failed to get path format info', {
      error: errorMessage,
    });

    res.status(500).json({
      error: 'Failed to get path format information',
      message: errorMessage,
    });
  }
};
