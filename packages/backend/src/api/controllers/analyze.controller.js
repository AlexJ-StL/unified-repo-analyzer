/**
 * Analysis controller
 */
import { validationResult } from 'express-validator';
import { AnalysisEngine } from '../../core/AnalysisEngine';
import { io } from '../../index';
// Default analysis options
const defaultOptions = {
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
export const analyzeRepository = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { path, options = {} } = req.body;
        // Merge with default options
        const analysisOptions = {
            ...defaultOptions,
            ...options,
        };
        // Create analysis engine
        const analysisEngine = new AnalysisEngine();
        // Generate unique client ID for progress tracking
        const clientId = req.headers['x-client-id'] || 'anonymous';
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
        // Generate exports if requested in options
        if (analysisOptions.outputFormats && analysisOptions.outputFormats.length > 0) {
            // Import export service
            const { default: exportService } = await import('../../services/export.service');
            // Generate exports for each requested format
            const exports = {};
            for (const format of analysisOptions.outputFormats) {
                try {
                    const content = await exportService.exportAnalysis(analysis, format);
                    exports[format] = {
                        format,
                        size: Buffer.byteLength(content, 'utf8'),
                    };
                }
                catch (exportError) {
                    console.error(`Error generating ${format} export:`, exportError);
                }
            }
            // Add exports to the response
            analysis.exports = exports;
        }
        // Return analysis result
        res.status(200).json(analysis);
    }
    catch (error) {
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
export const analyzeMultipleRepositories = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { paths, options = {} } = req.body;
        // Merge with default options
        const analysisOptions = {
            ...defaultOptions,
            ...options,
        };
        // Create analysis engine
        const analysisEngine = new AnalysisEngine();
        // Generate unique client ID for progress tracking
        const clientId = req.headers['x-client-id'] || 'anonymous';
        // Generate unique batch ID
        const batchId = req.body.batchId || `batch-${Date.now()}`;
        // Set up initial progress tracker
        const progressTracker = {
            batchId,
            total: paths.length,
            completed: 0,
            failed: 0,
            inProgress: 0,
            pending: paths.length,
            progress: 0,
            status: 'initializing',
            currentRepositories: [],
        };
        // Send initial progress update
        io.to(clientId).emit('batch-analysis-progress', progressTracker);
        // Update progress tracker with batch analysis starting
        progressTracker.status = 'analyzing';
        io.to(clientId).emit('batch-analysis-progress', progressTracker);
        // Determine concurrency based on request or default to 2
        const concurrency = req.body.concurrency || 2;
        // Analyze repositories with queue and progress tracking
        const batchResult = await analysisEngine.analyzeMultipleRepositoriesWithQueue(paths, analysisOptions, concurrency, (progress) => {
            // Update progress tracker
            progressTracker.completed = progress.status.completed;
            progressTracker.failed = progress.status.failed;
            progressTracker.inProgress = progress.status.inProgress;
            progressTracker.pending = progress.status.pending;
            progressTracker.progress = progress.status.progress;
            progressTracker.currentRepositories = progress.currentRepository || [];
            // Send progress update
            io.to(clientId).emit('batch-analysis-progress', progressTracker);
        });
        // Update progress tracker with completion
        progressTracker.status = 'completed';
        progressTracker.completed = batchResult.repositories.length;
        progressTracker.failed = paths.length - batchResult.repositories.length;
        progressTracker.inProgress = 0;
        progressTracker.pending = 0;
        progressTracker.progress = 100;
        progressTracker.currentRepositories = [];
        // Send final progress update
        io.to(clientId).emit('batch-analysis-progress', progressTracker);
        // Generate exports if requested in options
        if (analysisOptions.outputFormats && analysisOptions.outputFormats.length > 0) {
            // Import export service
            const { default: exportService } = await import('../../services/export.service');
            // Generate exports for each requested format
            const exports = {};
            for (const format of analysisOptions.outputFormats) {
                try {
                    const content = await exportService.exportBatchAnalysis(batchResult, format);
                    exports[format] = {
                        format,
                        size: Buffer.byteLength(content, 'utf8'),
                    };
                }
                catch (exportError) {
                    console.error(`Error generating ${format} export:`, exportError);
                }
            }
            // Add exports to the response
            batchResult.exports = exports;
        }
        // Return batch analysis result
        res.status(200).json(batchResult);
    }
    catch (error) {
        console.error('Error analyzing repositories:', error);
        res.status(500).json({
            error: 'Failed to analyze repositories',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
//# sourceMappingURL=analyze.controller.js.map