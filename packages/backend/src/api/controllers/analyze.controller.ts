/**
 * Analysis controller
 */

import path from 'node:path';

// Global io declaration
declare const io: import('socket.io').Server;
import type { AnalysisOptions, RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AnalysisEngine } from '../../core/AnalysisEngine.js';
import { analysisRequestTracker } from '../../services/analysis-request-tracker.service.js';
import { errorMessageService } from '../../services/error-message.service.js';
import logger from '../../services/logger.service.js';
import { pathHandler } from '../../services/path-handler.service.js';

// Default analysis options
const defaultOptions: AnalysisOptions = {
  mode: 'standard',
  maxFiles: 100,
  maxLinesPerFile: 1000,
  includeLLMAnalysis: false,
  llmProvider: 'none',
  outputFormats: ['json'],
  includeTree: true,
};

/**
 * Analyze a single repository
 *
 * @param req - Express request
 * @param res - Express response
 */
export const analyzeRepository = async (req: Request, res: Response): Promise<void> => {
  const clientId = (req.headers['x-client-id'] as string) || 'anonymous';
  const { path: rawPath, options = {} } = req.body;

  // Create analysis request tracking
  const analysisRequest = analysisRequestTracker.createRequest(rawPath, options, clientId);
  const requestId = analysisRequest.id;

  let progressInterval: NodeJS.Timeout | undefined;

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Repository analysis request validation failed', {
        requestId,
        errors: errors.array(),
        path: req.body.path,
      });
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { path: rawPath, options = {} } = req.body;
    logger.info('Received path', { rawPath });

    // Check if path is missing or invalid before calling PathHandler
    if (!rawPath || typeof rawPath !== 'string' || rawPath.trim() === '') {
      logger.warn('Repository path validation failed', {
        requestId,
        path: rawPath,
        errors: [{ code: 'INVALID_INPUT', message: 'Path must be a non-empty string' }],
        warnings: [],
      });

      res.status(400).json({
        error: 'Invalid Repository Path',
        message: 'Repository path is required and must be a non-empty string.',
        details: 'The path parameter is missing, empty, or not a string.',
        path: rawPath,
        suggestions: [
          'Provide a valid repository path',
          'Ensure the path is a non-empty string',
          'Check that the request body includes a "path" field',
        ],
        technicalDetails: {
          errors: [
            {
              code: 'INVALID_INPUT',
              message: 'Path must be a non-empty string',
            },
          ],
          warnings: [],
        },
      });
      return;
    }

    // Resolve path to absolute path if it's relative
    const projectRoot = process.env.PROJECT_ROOT || process.cwd();
    const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(projectRoot, rawPath);
    logger.info('Resolved path', { resolvedPath });

    logger.info('Starting repository analysis', {
      requestId,
      path: resolvedPath,
      options,
    });

    // Step 1: Validate and normalize the path using PathHandler
    logger.debug('Validating repository path', {
      requestId,
      path: resolvedPath,
    });

    const pathValidationResult = await pathHandler.validatePath(resolvedPath, {
      timeoutMs: 10000, // 10 seconds timeout for path validation
      onProgress: (progress) => {
        logger.debug('Path validation progress', {
          requestId,
          stage: progress.stage,
          percentage: progress.percentage,
          message: progress.message,
        });
      },
    });

    // Check if path validation failed
    if (!pathValidationResult.isValid) {
      const userFriendlyError = errorMessageService.createPathErrorMessage(
        pathValidationResult.errors,
        pathValidationResult.warnings,
        resolvedPath
      );

      logger.warn('Repository path validation failed', {
        requestId,
        path: resolvedPath,
        errors: pathValidationResult.errors,
        warnings: pathValidationResult.warnings,
      });

      res.status(400).json({
        error: userFriendlyError.title,
        message: userFriendlyError.message,
        details: userFriendlyError.details,
        path: resolvedPath,
        suggestions: userFriendlyError.suggestions,
        learnMoreUrl: userFriendlyError.learnMoreUrl,
        technicalDetails: {
          errors: pathValidationResult.errors,
          warnings: pathValidationResult.warnings,
        },
      });
      return;
    }

    // Check if path exists and is accessible
    if (!pathValidationResult.metadata.exists) {
      const userFriendlyError = errorMessageService.createPathErrorMessage(
        [{ code: 'PATH_NOT_FOUND', message: 'Path does not exist' }],
        pathValidationResult.warnings,
        resolvedPath
      );

      logger.warn('Repository path does not exist', {
        requestId,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });

      res.status(404).json({
        error: userFriendlyError.title,
        message: userFriendlyError.message,
        details: userFriendlyError.details,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
        suggestions: userFriendlyError.suggestions,
        learnMoreUrl: userFriendlyError.learnMoreUrl,
      });
      return;
    }

    // Check if path is a directory (repositories should be directories)
    if (!pathValidationResult.metadata.isDirectory) {
      const userFriendlyError = errorMessageService.createPathErrorMessage(
        [{ code: 'NOT_DIRECTORY', message: 'Path is not a directory' }],
        pathValidationResult.warnings,
        resolvedPath
      );

      logger.warn('Repository path is not a directory', {
        requestId,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });

      res.status(400).json({
        error: userFriendlyError.title,
        message: userFriendlyError.message,
        details: userFriendlyError.details,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
        suggestions: userFriendlyError.suggestions,
        learnMoreUrl: userFriendlyError.learnMoreUrl,
      });
      return;
    }

    // Check read permissions
    if (!pathValidationResult.metadata.permissions.read) {
      const userFriendlyError = errorMessageService.createPathErrorMessage(
        [
          {
            code: 'READ_PERMISSION_DENIED',
            message: 'Insufficient read permissions',
          },
        ],
        pathValidationResult.warnings,
        resolvedPath
      );

      logger.warn('Insufficient read permissions for repository path', {
        requestId,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
        permissions: pathValidationResult.metadata.permissions,
      });

      res.status(403).json({
        error: userFriendlyError.title,
        message: userFriendlyError.message,
        details: userFriendlyError.details,
        path: resolvedPath,
        normalizedPath: pathValidationResult.normalizedPath,
        suggestions: userFriendlyError.suggestions,
        learnMoreUrl: userFriendlyError.learnMoreUrl,
      });
      return;
    }

    // Use the normalized path for analysis
    const normalizedPath = pathValidationResult.normalizedPath;
    if (!normalizedPath) {
      logger.error(
        `Path validation succeeded but normalized path is null. RequestId: ${requestId}, OriginalPath: ${resolvedPath}`
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Path validation succeeded but normalized path is unavailable',
        suggestions: [
          'Try again with a different path',
          'Check system permissions',
          'Contact support if the issue persists',
        ],
      });
      return;
    }

    logger.info('Path validation successful', {
      requestId,
      originalPath: resolvedPath,
      normalizedPath,
      metadata: pathValidationResult.metadata,
      warnings: pathValidationResult.warnings,
    });

    // Merge with default options
    const analysisOptions: AnalysisOptions = {
      ...defaultOptions,
      ...options,
    };

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Generate unique client ID for progress tracking
    const _clientId = (req.headers['x-client-id'] as string) || 'anonymous';

    // Set up progress tracking
    const progressTracker = {
      total: 0,
      processed: 0,
      currentFile: '',
      status: 'initializing',
    };

    // Start progress updates
    progressInterval = setInterval(() => {
      // io.to(clientId).emit('analysis-progress', progressTracker); // Commented out to break circular dependency
      // Update request tracker progress
      analysisRequestTracker.updateRequestProgress(
        requestId,
        (progressTracker.processed / Math.max(progressTracker.total, 1)) * 100,
        progressTracker.currentFile
      );
    }, 1000);

    // Update progress tracker with repository discovery
    progressTracker.status = 'analyzing';
    analysisRequestTracker.updateRequestStatus(requestId, 'processing');

    logger.info('Starting repository analysis with validated path', {
      requestId,
      normalizedPath,
      analysisOptions,
    });

    // Analyze repository using the normalized path
    const analysis = await analysisEngine.analyzeRepository(normalizedPath, analysisOptions);

    // Update progress tracker with completion
    progressTracker.processed = progressTracker.total;
    progressTracker.status = 'completed';
    // io.to(clientId).emit('analysis-progress', progressTracker); // Commented out
    analysisRequestTracker.updateRequestProgress(requestId, 100);
    analysisRequestTracker.completeRequest(requestId, analysis);

    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    logger.info('Repository analysis completed successfully', {
      requestId,
      normalizedPath,
      analysisId: analysis.id,
      fileCount: analysis.fileCount,
    });

    // Generate exports if requested in options
    if (analysisOptions.outputFormats && analysisOptions.outputFormats.length > 0) {
      logger.debug('Generating exports', {
        requestId,
        formats: analysisOptions.outputFormats,
      });

      // Import export service
      const { default: exportService } = await import('../../services/export.service.js');

      // Generate exports for each requested format
      const exports: Record<string, { content: string; size: number } | null> = {
        json: null,
        markdown: null,
        html: null,
      };
      for (const format of analysisOptions.outputFormats) {
        try {
          const content = await exportService.exportAnalysis(analysis, format);
          exports[format] = {
            content,
            size: Buffer.byteLength(content, 'utf8'),
          };
          logger.debug('Export generated successfully', {
            requestId,
            format,
            size: exports[format]?.size,
          });
        } catch (exportError) {
          logger.error(
            `Export generation failed: ${exportError instanceof Error ? exportError.message : String(exportError)}. RequestId: ${requestId}, Format: ${format}`
          );
        }
      }

      // Add exports to the response
      (
        analysis as RepositoryAnalysis & {
          exports?: Record<string, { content: string; size: number } | null>;
        }
      ).exports = exports;
    }

    // Return analysis result
    res.status(200).json(analysis);
  } catch (error) {
    // Clear progress interval on error
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Mark request as failed in tracker
    analysisRequestTracker.failRequest(requestId, error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(
      `Repository analysis failed: ${errorMessage}. RequestId: ${requestId}, Path: ${req.body.path}, Stack: ${error instanceof Error ? error.stack : undefined}`
    );

    // Check for specific error types and provide appropriate responses
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        res.status(408).json({
          error: 'Repository analysis timed out',
          message: errorMessage,
          suggestions: [
            'Try analyzing a smaller repository',
            'Increase timeout settings',
            'Check if the repository contains very large files',
          ],
        });
        return;
      }

      if (error.name === 'AbortError') {
        res.status(499).json({
          error: 'Repository analysis was cancelled',
          message: errorMessage,
        });
        return;
      }

      if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
        const userFriendlyError = errorMessageService.createPathErrorMessage(
          [{ code: 'PATH_NOT_FOUND', message: 'Path does not exist' }],
          [],
          req.body.path
        );

        res.status(404).json({
          error: userFriendlyError.title,
          message: userFriendlyError.message,
          details: userFriendlyError.details,
          path: req.body.path,
          suggestions: userFriendlyError.suggestions,
          learnMoreUrl: userFriendlyError.learnMoreUrl,
        });
        return;
      }

      if (errorMessage.includes('EACCES') || errorMessage.includes('permission denied')) {
        const userFriendlyError = errorMessageService.createPathErrorMessage(
          [{ code: 'READ_PERMISSION_DENIED', message: 'Permission denied' }],
          [],
          req.body.path
        );

        res.status(403).json({
          error: userFriendlyError.title,
          message: userFriendlyError.message,
          details: userFriendlyError.details,
          path: req.body.path,
          suggestions: userFriendlyError.suggestions,
          learnMoreUrl: userFriendlyError.learnMoreUrl,
        });
        return;
      }

      if (errorMessage.includes('network') || errorMessage.includes('UNC')) {
        const userFriendlyError = errorMessageService.createNetworkErrorMessage(
          req.body.path,
          errorMessage
        );

        res.status(503).json({
          error: userFriendlyError.title,
          message: userFriendlyError.message,
          details: userFriendlyError.details,
          path: req.body.path,
          suggestions: userFriendlyError.suggestions,
          learnMoreUrl: userFriendlyError.learnMoreUrl,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Failed to analyze repository',
      message: errorMessage,
      path: req.body.path,
      suggestions: [
        'Check if the repository path is valid',
        'Ensure the repository is accessible',
        'Try again with a different repository',
      ],
    });
  }
};

/**
 * Analyze multiple repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export const analyzeMultipleRepositories = async (req: Request, res: Response): Promise<void> => {
  const clientId = (req.headers['x-client-id'] as string) || 'anonymous';
  const { paths, options = {} } = req.body;

  // Create analysis request tracking
  const analysisRequest = analysisRequestTracker.createRequest(
    `batch-${paths.length}-repos`,
    options,
    clientId
  );
  const requestId = analysisRequest.id;

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Batch repository analysis request validation failed', {
        requestId,
        errors: errors.array(),
        pathCount: req.body.paths?.length || 0,
      });
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { paths, options = {} } = req.body;

    // Additional safety check for paths
    if (!paths || !Array.isArray(paths)) {
      logger.warn('Batch repository analysis request missing paths', {
        requestId,
        paths,
      });
      res.status(400).json({
        error: 'Repository paths are required',
        message: "The 'paths' field must be provided as a non-empty array",
        suggestions: [
          "Include a 'paths' field in the request body",
          "Ensure 'paths' is an array of repository paths",
          'Provide at least one repository path',
        ],
      });
      return;
    }

    logger.info('Starting batch repository analysis', {
      requestId,
      pathCount: paths.length,
      options,
    });

    // Step 1: Validate all paths before starting analysis
    logger.debug('Validating all repository paths', {
      requestId,
      pathCount: paths.length,
    });

    const pathValidationResults: Array<{
      originalPath: string;
      normalizedPath?: string;
      isValid: boolean;
      errors: Array<{ code: string; message: string; details?: string }>;
      warnings: Array<{ code: string; message: string }>;
    }> = [];

    const validPaths: string[] = [];
    const invalidPaths: Array<{
      path: string;
      errors: Array<{
        code: string;
        message: string;
        details?: string;
        suggestions?: string[];
      }>;
      warnings: Array<{ code: string; message: string }>;
    }> = [];

    const projectRoot = process.env.PROJECT_ROOT || process.cwd();

    // Validate each path
    for (let i = 0; i < paths.length; i++) {
      const rawPath = paths[i];
      const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(projectRoot, rawPath);

      try {
        logger.debug(`Validating path ${i + 1}/${paths.length}`, {
          requestId,
          path: resolvedPath,
        });

        const validationResult = await pathHandler.validatePath(resolvedPath, {
          timeoutMs: 5000, // 5 seconds timeout per path
          onProgress: (progress) => {
            logger.debug('Path validation progress', {
              requestId,
              pathIndex: i + 1,
              path: resolvedPath,
              stage: progress.stage,
              percentage: progress.percentage,
            });
          },
        });

        const pathResult = {
          originalPath: rawPath,
          normalizedPath: validationResult.normalizedPath,
          isValid:
            validationResult.isValid &&
            validationResult.metadata.exists &&
            validationResult.metadata.isDirectory &&
            validationResult.metadata.permissions.read,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        };

        pathValidationResults.push(pathResult);

        if (pathResult.isValid && validationResult.normalizedPath) {
          validPaths.push(validationResult.normalizedPath);
        } else {
          // Collect specific error reasons
          const pathErrors = [...validationResult.errors];

          if (!validationResult.metadata.exists) {
            pathErrors.push({
              code: 'PATH_NOT_FOUND',
              message: 'Path does not exist',
              suggestions: ['Verify the path is correct', 'Check if the directory exists'],
            });
          } else if (!validationResult.metadata.isDirectory) {
            pathErrors.push({
              code: 'NOT_DIRECTORY',
              message: 'Path is not a directory',
              suggestions: ['Select a directory instead of a file'],
            });
          } else if (!validationResult.metadata.permissions.read) {
            pathErrors.push({
              code: 'READ_PERMISSION_DENIED',
              message: 'Insufficient read permissions',
              suggestions: ['Check directory permissions', 'Run with appropriate privileges'],
            });
          }

          invalidPaths.push({
            path: rawPath,
            errors: pathErrors,
            warnings: validationResult.warnings,
          });
        }
      } catch (error) {
        logger.error(
          `Path validation failed with exception: ${error instanceof Error ? error.message : String(error)}. RequestId: ${requestId}, Path: ${resolvedPath}`
        );

        pathValidationResults.push({
          originalPath: rawPath,
          isValid: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Path validation failed',
              details: error instanceof Error ? error.message : String(error),
            },
          ],
          warnings: [],
        });

        invalidPaths.push({
          path: rawPath,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Path validation failed',
              details: error instanceof Error ? error.message : String(error),
            },
          ],
          warnings: [],
        });
      }
    }

    logger.info('Batch path validation completed', {
      requestId,
      totalPaths: paths.length,
      validPaths: validPaths.length,
      invalidPaths: invalidPaths.length,
    });

    // If no valid paths, return error
    if (validPaths.length === 0) {
      logger.warn('No valid paths found in batch analysis request', {
        requestId,
        invalidPaths: invalidPaths.length,
      });

      res.status(400).json({
        error: 'No valid repository paths found',
        totalPaths: paths.length,
        validPaths: 0,
        invalidPaths: invalidPaths.length,
        pathValidationResults,
        suggestions: [
          'Verify all paths are correct',
          'Check directory permissions',
          'Ensure paths point to directories, not files',
        ],
      });
      return;
    }

    // If some paths are invalid, log warnings but continue with valid paths
    if (invalidPaths.length > 0) {
      logger.warn('Some paths are invalid, continuing with valid paths only', {
        requestId,
        validPaths: validPaths.length,
        invalidPaths: invalidPaths.length,
        invalidPathDetails: invalidPaths,
      });
    }

    // Merge with default options
    const analysisOptions: AnalysisOptions = {
      ...defaultOptions,
      ...options,
    };

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Generate unique client ID for progress tracking
    const clientId = (req.headers['x-client-id'] as string) || 'anonymous';

    // Generate unique batch ID
    const batchId = req.body.batchId || `batch-${Date.now()}`;

    // Set up initial progress tracker
    const progressTracker = {
      batchId,
      total: validPaths.length, // Use valid paths count
      completed: 0,
      failed: 0,
      inProgress: 0,
      pending: validPaths.length,
      progress: 0,
      status: 'initializing',
      currentRepositories: [] as string[],
    };

    // Send initial progress update
    io.to(clientId).emit('batch-analysis-progress', progressTracker);

    // Update progress tracker with batch analysis starting
    progressTracker.status = 'analyzing';
    io.to(clientId).emit('batch-analysis-progress', progressTracker);
    analysisRequestTracker.updateRequestStatus(requestId, 'processing');

    logger.info('Starting batch analysis with validated paths', {
      requestId,
      batchId,
      validPathCount: validPaths.length,
      analysisOptions,
    });

    // Determine concurrency based on request or default to 2
    const concurrency = req.body.concurrency || 2;

    // Analyze repositories with queue and progress tracking using validated paths
    const batchResult = await analysisEngine.analyzeMultipleRepositoriesWithQueue(
      validPaths, // Use validated and normalized paths
      analysisOptions,
      concurrency,
      (progress) => {
        // Update progress tracker
        progressTracker.completed = progress.status.completed;
        progressTracker.failed = progress.status.failed;
        progressTracker.inProgress = progress.status.inProgress;
        progressTracker.pending = progress.status.pending;
        progressTracker.progress = progress.status.progress;
        progressTracker.currentRepositories = progress.currentRepository || [];

        // Send progress update
        io.to(clientId).emit('batch-analysis-progress', progressTracker);

        // Update request tracker progress
        analysisRequestTracker.updateRequestProgress(requestId, progress.status.progress);
      }
    );

    // Update progress tracker with completion
    progressTracker.status = 'completed';
    progressTracker.completed = batchResult.repositories.length;
    progressTracker.failed = validPaths.length - batchResult.repositories.length;
    progressTracker.inProgress = 0;
    progressTracker.pending = 0;
    progressTracker.progress = 100;
    progressTracker.currentRepositories = [];

    // Send final progress update
    io.to(clientId).emit('batch-analysis-progress', progressTracker);
    analysisRequestTracker.updateRequestProgress(requestId, 100);

    logger.info('Batch repository analysis completed', {
      requestId,
      batchId,
      totalRequested: paths.length,
      validPaths: validPaths.length,
      successfulAnalyses: batchResult.repositories.length,
      failedAnalyses: validPaths.length - batchResult.repositories.length,
      skippedInvalidPaths: invalidPaths.length,
    });

    // Generate exports if requested in options
    if (analysisOptions.outputFormats && analysisOptions.outputFormats.length > 0) {
      logger.debug('Generating batch exports', {
        requestId,
        batchId,
        formats: analysisOptions.outputFormats,
      });

      // Import export service
      const { default: exportService } = await import('../../services/export.service.js');

      // Generate exports for each requested format
      const exports: Record<string, { content: string; size: number } | null> = {
        json: null,
        markdown: null,
        html: null,
      };
      for (const format of analysisOptions.outputFormats) {
        try {
          const content = await exportService.exportBatchAnalysis(batchResult, format);
          exports[format] = {
            content,
            size: Buffer.byteLength(content, 'utf8'),
          };
          logger.debug('Batch export generated successfully', {
            requestId,
            batchId,
            format,
            size: exports[format]?.size,
          });
        } catch (exportError) {
          logger.error(
            `Batch export generation failed: ${exportError instanceof Error ? exportError.message : String(exportError)}. RequestId: ${requestId}, BatchId: ${batchId}, Format: ${format}`
          );
        }
      }

      // Add exports to the response
      (
        batchResult as {
          exports?: Record<string, { content: string; size: number } | null>;
        }
      ).exports = exports;
    }

    // Enhance the response with path validation information
    const enhancedResult = {
      ...batchResult,
      pathValidation: {
        totalRequested: paths.length,
        validPaths: validPaths.length,
        invalidPaths: invalidPaths.length,
        invalidPathDetails: invalidPaths.length > 0 ? invalidPaths : undefined,
      },
    };

    // Complete request tracking
    analysisRequestTracker.completeRequest(requestId, enhancedResult);

    // Return batch analysis result
    res.status(200).json(enhancedResult);
  } catch (error) {
    // Mark request as failed in tracker
    analysisRequestTracker.failRequest(requestId, error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(
      `Batch repository analysis failed: ${errorMessage}. RequestId: ${requestId}, PathCount: ${req.body.paths?.length || 0}, Stack: ${error instanceof Error ? error.stack : undefined}`
    );

    // Check for specific error types
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        res.status(408).json({
          error: 'Batch repository analysis timed out',
          message: errorMessage,
          suggestions: [
            'Try analyzing fewer repositories at once',
            'Increase timeout settings',
            'Check if repositories contain very large files',
          ],
        });
        return;
      }

      if (error.name === 'AbortError') {
        res.status(499).json({
          error: 'Batch repository analysis was cancelled',
          message: errorMessage,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Failed to analyze repositories',
      message: errorMessage,
      pathCount: req.body.paths?.length || 0,
      suggestions: [
        'Check if all repository paths are valid',
        'Ensure repositories are accessible',
        'Try analyzing fewer repositories at once',
      ],
    });
  }
};
