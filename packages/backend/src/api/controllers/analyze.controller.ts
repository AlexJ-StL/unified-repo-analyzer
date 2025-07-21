/**
 * Analysis controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AnalysisEngine } from '../../core/AnalysisEngine';
import { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';
import { io } from '../../index';

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
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { path, options = {} } = req.body;

    // Merge with default options
    const analysisOptions: AnalysisOptions = {
      ...defaultOptions,
      ...options,
    };

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Generate unique client ID for progress tracking
    const clientId = (req.headers['x-client-id'] as string) || 'anonymous';

    // Set up progress tracking
    const progressTracker = {
      total: 0,
      processed: 0,
      currentFile: '',
      status: 'initializing',
    };

    // Start progress updates
    const progressInterval = setInterval(() => {
      io.to(clientId).emit('analysis-progress', progressTracker);
    }, 1000);

    // Update progress tracker with repository discovery
    progressTracker.status = 'analyzing';

    // Analyze repository
    const analysis = await analysisEngine.analyzeRepository(path, analysisOptions);

    // Update progress tracker with completion
    progressTracker.processed = progressTracker.total;
    progressTracker.status = 'completed';
    io.to(clientId).emit('analysis-progress', progressTracker);

    // Clear progress interval
    clearInterval(progressInterval);

    // Return analysis result
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing repository:', error);
    res.status(500).json({
      error: 'Failed to analyze repository',
      message: error instanceof Error ? error.message : String(error),
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
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { paths, options = {} } = req.body;

    // Merge with default options
    const analysisOptions: AnalysisOptions = {
      ...defaultOptions,
      ...options,
    };

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Generate unique client ID for progress tracking
    const clientId = (req.headers['x-client-id'] as string) || 'anonymous';

    // Set up progress tracking
    const progressTracker = {
      total: paths.length,
      processed: 0,
      currentRepository: '',
      status: 'initializing',
    };

    // Start progress updates
    const progressInterval = setInterval(() => {
      io.to(clientId).emit('batch-analysis-progress', progressTracker);
    }, 1000);

    // Update progress tracker with batch analysis
    progressTracker.status = 'analyzing';

    // Analyze repositories
    const batchResult = await analysisEngine.analyzeMultipleRepositories(paths, analysisOptions);

    // Update progress tracker with completion
    progressTracker.processed = progressTracker.total;
    progressTracker.status = 'completed';
    io.to(clientId).emit('batch-analysis-progress', progressTracker);

    // Clear progress interval
    clearInterval(progressInterval);

    // Return batch analysis result
    res.status(200).json(batchResult);
  } catch (error) {
    console.error('Error analyzing repositories:', error);
    res.status(500).json({
      error: 'Failed to analyze repositories',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
