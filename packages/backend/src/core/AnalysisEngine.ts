/**
 * Core Analysis Engine for repository processing
 * Enhanced with comprehensive logging for debugging and monitoring
 * Requirements: 4.2, 4.3, 4.4
 */

import path from 'node:path';
import type {
  AnalysisOptions,
  BatchAnalysisResult,
  FileInfo,
  OutputFormat,
  RepositoryAnalysis,
  SearchQuery,
  SearchResult,
} from '@unified-repo-analyzer/shared';
import { type ErrorContext, errorClassifier } from '@unified-repo-analyzer/shared';
import { v4 as uuidv4 } from 'uuid';
import { cacheService } from '../services/cache.service.js';
import { deduplicationService } from '../services/deduplication.service.js';
import { logAnalysis, logger, logPerformance } from '../services/logger.service.js';
import { metricsService } from '../services/metrics.service.js';
import { readFileWithErrorHandling } from '../utils/fileSystem.js';
import {
  analysisOptionsToDiscoveryOptions,
  discoverRepository,
} from '../utils/repositoryDiscovery.js';
import { AdvancedAnalyzer } from './advancedAnalyzer.js';
import { analyzeCodeStructure } from './codeStructureAnalyzer.js';
import type { IndexSystem, RepositoryMatch } from './IndexSystem.js';
import { countTokens } from './tokenAnalyzer.js';

/**
 * Core Analysis Engine for repository processing
 */
export class AnalysisEngine {
  private advancedAnalyzer: AdvancedAnalyzer;

  constructor() {
    this.advancedAnalyzer = new AdvancedAnalyzer();
  }
  /**
   * Analyzes a single repository
   *
   * @param repoPath - Path to the repository
   * @param options - Analysis options
   * @returns Promise resolving to repository analysis
   */
  public async analyzeRepository(
    repoPath: string,
    options: AnalysisOptions
  ): Promise<RepositoryAnalysis> {
    const startTime = Date.now();
    const requestId = logger.getRequestId();

    // Log analysis start
    logAnalysis(
      repoPath,
      'started',
      {
        mode: options.mode,
        requestId,
      },
      'analysis-engine'
    );

    logger.info(
      'Starting repository analysis',
      {
        repositoryPath: repoPath,
        analysisMode: options.mode,
        options: {
          maxFiles: options.maxFiles,
          maxLinesPerFile: options.maxLinesPerFile,
          includeTree: options.includeTree,
        },
      },
      'analysis-engine',
      requestId
    );

    const timer = metricsService.createTimer('analysis.duration', {
      mode: options.mode,
    });

    try {
      return await deduplicationService.deduplicateAnalysis(repoPath, options, async () => {
        // Check cache first
        logger.debug(
          'Checking cache for existing analysis',
          {
            repositoryPath: repoPath,
            analysisMode: options.mode,
          },
          'analysis-engine',
          requestId
        );

        const cached = await cacheService.getCachedAnalysis(repoPath, options);
        if (cached) {
          const duration = Date.now() - startTime;
          timer.end();

          logger.info(
            'Analysis completed from cache',
            {
              repositoryPath: repoPath,
              fileCount: cached.fileCount,
              totalSize: cached.totalSize,
              duration: `${duration}ms`,
              cacheHit: true,
            },
            'analysis-engine',
            requestId
          );

          logAnalysis(
            repoPath,
            'completed',
            {
              fileCount: cached.fileCount,
              totalSize: cached.totalSize,
              duration,
              cacheHit: true,
              requestId,
            },
            'analysis-engine'
          );

          metricsService.recordAnalysis(
            repoPath,
            options.mode,
            0, // No processing time for cached results
            cached.fileCount,
            cached.totalSize,
            true, // Cache hit
            false // Not deduplicated (this is the original request)
          );
          return cached;
        }

        logger.debug(
          'No cached analysis found, proceeding with fresh analysis',
          {
            repositoryPath: repoPath,
          },
          'analysis-engine',
          requestId
        );

        // Convert analysis options to discovery options
        logger.debug(
          'Converting analysis options to discovery options',
          {
            analysisMode: options.mode,
            includeTree: options.includeTree,
          },
          'analysis-engine',
          requestId
        );

        const discoveryOptions = analysisOptionsToDiscoveryOptions(options);

        // Discover repository structure
        logger.info(
          'Starting repository discovery',
          {
            repositoryPath: repoPath,
            discoveryOptions: {
              maxFiles: discoveryOptions.maxFiles,
              maxLinesPerFile: discoveryOptions.maxLinesPerFile,
              includeTree: discoveryOptions.includeTree,
            },
          },
          'analysis-engine',
          requestId
        );

        const discoveryStartTime = Date.now();
        const analysis = await discoverRepository(repoPath, discoveryOptions);
        const discoveryDuration = Date.now() - discoveryStartTime;

        logger.info(
          'Repository discovery completed',
          {
            repositoryPath: repoPath,
            fileCount: analysis.fileCount,
            totalSize: analysis.totalSize,
            languageCount: Object.keys(analysis.languages).length,
            duration: `${discoveryDuration}ms`,
          },
          'analysis-engine',
          requestId
        );

        // Update analysis mode
        analysis.metadata.analysisMode = options.mode;
        analysis.metadata.llmProvider = options.includeLLMAnalysis ? options.llmProvider : 'none';

        // Process files for code structure analysis
        logger.debug(
          'Processing files for code structure analysis',
          {
            fileCount: analysis.fileCount,
          },
          'analysis-engine',
          requestId
        );

        const structureStartTime = Date.now();
        await this.processFilesForAnalysis(analysis, options);
        const structureDuration = Date.now() - structureStartTime;

        logger.debug(
          'Code structure analysis completed',
          {
            duration: `${structureDuration}ms`,
            complexity: analysis.codeAnalysis.complexity,
          },
          'analysis-engine',
          requestId
        );

        // Perform advanced analysis if in comprehensive mode or if LLM analysis is requested
        if (options.mode === 'comprehensive' || options.includeLLMAnalysis) {
          logger.info(
            'Starting comprehensive advanced analysis',
            {
              repositoryPath: repoPath,
            },
            'analysis-engine',
            requestId
          );

          const advancedStartTime = Date.now();
          const advancedResults = await this.advancedAnalyzer.analyzeRepository(analysis);
          const advancedDuration = Date.now() - advancedStartTime;

          logger.info(
            'Advanced analysis completed',
            {
              duration: `${advancedDuration}ms`,
              securityVulnerabilities: advancedResults.security.vulnerabilities.length,
              architectureRecommendations: advancedResults.architecture.recommendations.length,
              codeQualityScore: advancedResults.codeQuality.overallScore,
            },
            'analysis-engine',
            requestId
          );

          // Update analysis with advanced results
          analysis.codeAnalysis.complexity =
            advancedResults.codeQuality.overallScore > 0
              ? analysis.codeAnalysis.complexity
              : analysis.codeAnalysis.complexity;

          // Store advanced results in insights
          analysis.insights.recommendations.push(...advancedResults.security.recommendations);
          analysis.insights.recommendations.push(...advancedResults.architecture.recommendations);

          // Add security and quality information to potential issues
          const securityIssues = advancedResults.security.vulnerabilities
            .filter((v) => v.severity === 'high' || v.severity === 'critical')
            .map((v) => `Security: ${v.description}`);
          analysis.insights.potentialIssues.push(...securityIssues);

          const qualityIssues = advancedResults.codeQuality.technicalDebt
            .filter((d) => d.severity === 'high')
            .map((d) => `Quality: ${d.description}`);
          analysis.insights.potentialIssues.push(...qualityIssues);

          logger.debug(
            'Advanced analysis results integrated',
            {
              totalRecommendations: analysis.insights.recommendations.length,
              potentialIssues: analysis.insights.potentialIssues.length,
            },
            'analysis-engine',
            requestId
          );
        }

        const processingTime = Date.now() - startTime;
        analysis.metadata.analysisTime = processingTime;

        // Cache the result
        logger.debug(
          'Caching analysis result',
          {
            repositoryPath: repoPath,
            analysisMode: options.mode,
          },
          'analysis-engine',
          requestId
        );

        await cacheService.setCachedAnalysis(repoPath, options, analysis);

        timer.end();

        logger.info(
          'Repository analysis completed successfully',
          {
            repositoryPath: repoPath,
            fileCount: analysis.fileCount,
            totalSize: analysis.totalSize,
            processingTime: `${processingTime}ms`,
            analysisMode: options.mode,
            cacheHit: false,
          },
          'analysis-engine',
          requestId
        );

        logAnalysis(
          repoPath,
          'completed',
          {
            fileCount: analysis.fileCount,
            totalSize: analysis.totalSize,
            duration: processingTime,
            cacheHit: false,
            requestId,
          },
          'analysis-engine'
        );

        // Log performance metrics
        logPerformance(
          'repository_analysis',
          processingTime,
          {
            repositoryPath: repoPath,
            fileCount: analysis.fileCount,
            totalSizeBytes: analysis.totalSize,
            analysisMode: options.mode,
            languageCount: Object.keys(analysis.languages).length,
          },
          'analysis-engine'
        );

        metricsService.recordAnalysis(
          repoPath,
          options.mode,
          processingTime,
          analysis.fileCount,
          analysis.totalSize,
          false, // Not a cache hit
          false // Not deduplicated (this is the original request)
        );

        return analysis;
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const context: Partial<ErrorContext> = {
        path: repoPath,
        requestId,
        duration,
        metadata: {
          operation: 'repository_analysis',
          analysisMode: options.mode,
        },
      };

      const classifiedError = errorClassifier.classifyError(error as Error, context);

      logger.error(
        'Repository analysis failed',
        classifiedError.originalError,
        {
          repositoryPath: repoPath,
          analysisMode: options.mode,
          duration: `${duration}ms`,
          errorId: classifiedError.id,
          errorCode: classifiedError.code,
        },
        'analysis-engine',
        requestId
      );

      logAnalysis(
        repoPath,
        'failed',
        {
          duration,
          error: classifiedError.message,
          errorCode: classifiedError.code,
          requestId,
        },
        'analysis-engine'
      );

      // Re-throw the original error to maintain existing error handling
      throw error;
    }
  }

  /**
   * Analyzes multiple repositories
   *
   * @param repoPaths - Paths to repositories
   * @param options - Analysis options
   * @returns Promise resolving to batch analysis result
   */
  public async analyzeMultipleRepositories(
    repoPaths: string[],
    options: AnalysisOptions
  ): Promise<BatchAnalysisResult> {
    const startTime = Date.now();
    const batchId = uuidv4();

    // Create batch analysis result
    const batchResult: BatchAnalysisResult = {
      id: batchId,
      repositories: [],
      createdAt: new Date(),
      processingTime: 0,
      status: {
        total: repoPaths.length,
        completed: 0,
        failed: 0,
        inProgress: 0,
        pending: repoPaths.length,
        progress: 0,
      },
    };

    // Process repositories sequentially to avoid overwhelming the system
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let i = 0; i < repoPaths.length; i++) {
      const repoPath = repoPaths[i];

      // Narrow status reference for safe mutations (non-null: initialized above)
      const status = batchResult.status as NonNullable<BatchAnalysisResult['status']>;

      // Update status
      status.pending--;
      status.inProgress++;
      status.progress = Math.round(((status.completed + status.failed) / status.total) * 100);

      try {
        // Analyze repository
        const analysis = await this.analyzeRepository(repoPath, options);

        // Add to results
        batchResult.repositories.push(analysis);

        // Update status
        status.completed++;
        status.inProgress--;
      } catch (_error) {
        // Update status
        status.failed++;
        status.inProgress--;
      }

      // Update progress
      status.progress = Math.round(((status.completed + status.failed) / status.total) * 100);
    }

    // Generate combined insights if multiple repositories were analyzed successfully
    if (batchResult.repositories.length > 1) {
      batchResult.combinedInsights = await this.generateCombinedInsights(batchResult.repositories);
    }

    // Calculate processing time
    batchResult.processingTime = Date.now() - startTime;

    return batchResult;
  }

  /**
   * Analyzes multiple repositories using a queue system for concurrency control
   *
   * @param repoPaths - Paths to repositories
   * @param options - Analysis options
   * @param concurrency - Maximum number of concurrent analyses
   * @param progressCallback - Callback for progress updates
   * @returns Promise resolving to batch analysis result
   */
  public async analyzeMultipleRepositoriesWithQueue(
    repoPaths: string[],
    options: AnalysisOptions,
    progressCallback?: (progress: {
      batchId: string;
      status: {
        total: number;
        completed: number;
        failed: number;
        inProgress: number;
        pending: number;
        progress: number;
      };
      currentRepository: string[];
    }) => void,
    concurrency = 2
  ): Promise<BatchAnalysisResult> {
    const timer = metricsService.createTimer('batch.analysis.duration', {
      mode: options.mode,
      repositoryCount: repoPaths.length.toString(),
    });

    return deduplicationService.deduplicateBatch(repoPaths, options, async () => {
      // Check cache first
      const cached = await cacheService.getCachedBatchAnalysis(repoPaths, options);
      if (cached) {
        timer.end();
        return cached;
      }

      const startTime = Date.now();
      const batchId = uuidv4();

      // Import TaskQueue
      const { TaskQueue, QueueEvent } = await import('../utils/queue.js');

      // Create queue for processing repositories
      const queue = new TaskQueue(
        async (repoPath: string) => this.analyzeRepository(repoPath, options),
        { concurrency }
      );

      // Create batch analysis result
      const batchResult: BatchAnalysisResult = {
        id: batchId,
        repositories: [],
        createdAt: new Date(),
        processingTime: 0,
        status: {
          total: repoPaths.length,
          completed: 0,
          failed: 0,
          inProgress: 0,
          pending: repoPaths.length,
          progress: 0,
        },
      };

      // Set up progress tracking
      queue.on(QueueEvent.QUEUE_PROGRESS, (progress) => {
        // Update batch status
        batchResult.status = {
          total: progress.total,
          completed: progress.completed,
          failed: progress.failed,
          inProgress: progress.running,
          pending: progress.pending,
          progress: progress.progress,
        };

        // Call progress callback if provided
        if (progressCallback) {
          progressCallback({
            batchId,
            status: batchResult.status,
            currentRepository: Array.from(queue.getAllTasks())
              .filter((task) => task.status === 'running')
              .map((task) => task.data),
          });
        }
      });

      // Set up completion handlers
      queue.on(QueueEvent.TASK_COMPLETED, (task) => {
        if (task.result) {
          batchResult.repositories.push(task.result);
        }
      });

      // Add all repositories to the queue
      for (const repoPath of repoPaths) {
        queue.addTask(uuidv4(), repoPath);
      }

      // Wait for all tasks to complete
      await new Promise<void>((resolve) => {
        queue.on(QueueEvent.QUEUE_DRAINED, resolve);
      });

      // Generate combined insights if multiple repositories were analyzed successfully
      if (batchResult.repositories.length > 1) {
        batchResult.combinedInsights = await this.generateCombinedInsights(
          batchResult.repositories
        );
      }

      // Calculate processing time
      batchResult.processingTime = Date.now() - startTime;

      // Cache the result
      await cacheService.setCachedBatchAnalysis(repoPaths, options, batchResult);

      timer.end();
      return batchResult;
    });
  }

  /**
   * Generates combined insights for multiple repositories
   *
   * @param repositories - Repository analyses
   * @returns Combined insights
   */
  private async generateCombinedInsights(repositories: RepositoryAnalysis[]): Promise<{
    commonalities: string[];
    differences: string[];
    integrationOpportunities: string[];
  }> {
    // Find common languages
    const languageSets = repositories.map((repo) => new Set(repo.languages));
    let commonLanguages: string[] = [];
    if (languageSets.length > 0) {
      const firstSet = languageSets[0];
      const common = new Set<string>(firstSet as Set<string>);
      for (let i = 1; i < languageSets.length; i++) {
        const currentSet = languageSets[i];
        for (const item of common) {
          if (!currentSet.has(item)) {
            common.delete(item);
          }
        }
      }
      commonLanguages = Array.from(common);
    }

    // Find common frameworks
    const frameworkSets = repositories.map((repo) => new Set(repo.frameworks));
    let commonFrameworks: string[] = [];
    if (frameworkSets.length > 0) {
      const firstSet = frameworkSets[0];
      const common = new Set<string>(firstSet as Set<string>);
      for (let i = 1; i < frameworkSets.length; i++) {
        const currentSet = frameworkSets[i];
        for (const item of common) {
          if (!currentSet.has(item)) {
            common.delete(item);
          }
        }
      }
      commonFrameworks = Array.from(common);
    }

    // Find unique languages per repository
    const uniqueLanguages = repositories.map((repo) => {
      return {
        name: repo.name,
        languages: repo.languages.filter((lang: string) => !commonLanguages.includes(lang)),
      };
    });

    // Find unique frameworks per repository
    const uniqueFrameworks = repositories.map((repo) => {
      return {
        name: repo.name,
        frameworks: repo.frameworks.filter(
          (framework: string) => !commonFrameworks.includes(framework)
        ),
      };
    });

    // Generate commonalities
    const commonalities: string[] = [
      commonLanguages.length > 0
        ? `All repositories use the following languages: ${commonLanguages.join(', ')}`
        : 'No common languages found across all repositories',
      commonFrameworks.length > 0
        ? `All repositories use the following frameworks: ${commonFrameworks.join(', ')}`
        : 'No common frameworks found across all repositories',
    ];

    // Generate differences
    const differences: string[] = [];
    uniqueLanguages.forEach((repo) => {
      if (repo.languages.length > 0) {
        differences.push(`${repo.name} uniquely uses: ${repo.languages.join(', ')}`);
      }
    });
    uniqueFrameworks.forEach((repo) => {
      if (repo.frameworks.length > 0) {
        differences.push(`${repo.name} uniquely uses frameworks: ${repo.frameworks.join(', ')}`);
      }
    });

    // Generate integration opportunities
    const integrationOpportunities: string[] = [];

    // Check for complementary technologies
    if (commonLanguages.length > 0 || commonFrameworks.length > 0) {
      integrationOpportunities.push(
        'Repositories share common technologies which could facilitate integration'
      );
    }

    // Check for frontend/backend pairs
    const hasFrontend = repositories.some((repo) =>
      repo.frameworks.some((f: string) =>
        ['react', 'vue', 'angular', 'svelte'].includes(f.toLowerCase())
      )
    );
    const hasBackend = repositories.some((repo) =>
      repo.frameworks.some((f: string) =>
        ['express', 'nest', 'django', 'flask', 'spring'].includes(f.toLowerCase())
      )
    );

    if (hasFrontend && hasBackend) {
      integrationOpportunities.push('Potential for frontend-backend integration detected');
    }

    return {
      commonalities,
      differences,
      integrationOpportunities,
    };
  }

  /**
   * Generates a synopsis of the repository analysis
   *
   * @param analysis - Repository analysis
   * @param format - Output format
   * @returns Promise resolving to synopsis string
   */
  public async generateSynopsis(
    analysis: RepositoryAnalysis,
    format: OutputFormat
  ): Promise<string> {
    // Import export service
    const { default: exportService } = await import('../services/export.service.js');

    // Use export service to generate content
    return exportService.exportAnalysis(analysis, format);
  }

  /**
   * Updates the repository index with analysis results
   *
   * @param analysis - Repository analysis
   * @returns Promise resolving when index is updated
   */
  public async updateIndex(analysis: RepositoryAnalysis): Promise<void> {
    // Get the index system instance
    const indexSystem = await this.getIndexSystem();

    // Add repository to index
    await indexSystem.addRepository(analysis);

    console.log(`Index updated for repository: ${analysis.name}`);
  }

  /**
   * Gets the index system instance
   *
   * @returns IndexSystem instance
   */
  private async getIndexSystem(): Promise<IndexSystem> {
    // This is a placeholder that will be replaced with proper dependency injection
    // For now, we'll just import the IndexSystem directly
    const { IndexSystem } = await import('./IndexSystem.js');

    // Create a new instance if needed
    if (!this._indexSystem) {
      this._indexSystem = new IndexSystem();
    }

    return this._indexSystem;
  }

  // Private instance of IndexSystem
  private _indexSystem: IndexSystem | null = null;

  /**
   * Processes files for detailed code analysis
   *
   * @param analysis - Repository analysis
   * @param options - Analysis options
   * @returns Promise resolving when processing is complete
   */
  private async processFilesForAnalysis(
    analysis: RepositoryAnalysis,
    _options: AnalysisOptions
  ): Promise<void> {
    // Initialize counters
    let totalFunctionCount = 0;
    let totalClassCount = 0;
    let totalImportCount = 0;
    let totalTokenCount = 0;

    // Process each key file
    const filePromises = analysis.structure.keyFiles.map(async (fileInfo: FileInfo) => {
      try {
        // Get absolute file path
        const filePath = path.join(analysis.path, fileInfo.path);

        // Read file content
        const content = await readFileWithErrorHandling(filePath);

        // Count tokens
        const tokenCount = countTokens(content);
        fileInfo.tokenCount = tokenCount;
        totalTokenCount += tokenCount;

        // Analyze code structure
        const structureAnalysis = analyzeCodeStructure(content, fileInfo.language);

        // Update file info with structure analysis
        fileInfo.functions = structureAnalysis.functions;
        fileInfo.classes = structureAnalysis.classes;

        // Update counters
        totalFunctionCount += structureAnalysis.functions.length;
        totalClassCount += structureAnalysis.classes.length;
        totalImportCount += structureAnalysis.importCount;
      } catch (_error) {}
    });

    // Wait for all file processing to complete
    await Promise.all(filePromises);

    // Update analysis with code structure information
    analysis.codeAnalysis.functionCount = totalFunctionCount;
    analysis.codeAnalysis.classCount = totalClassCount;
    analysis.codeAnalysis.importCount = totalImportCount;

    // Add token usage information
    analysis.metadata.tokenUsage = {
      prompt: totalTokenCount,
      completion: 0, // Will be updated when LLM is used
      total: totalTokenCount,
    };
  }

  // Export functionality has been moved to the export service

  /**
   * Searches repositories based on query criteria
   *
   * @param query - Search query parameters
   * @returns Promise resolving to search results
   */
  public async searchRepositories(query: SearchQuery): Promise<SearchResult[]> {
    const indexSystem = await this.getIndexSystem();
    return indexSystem.searchRepositories(query);
  }

  /**
   * Finds similar repositories to the specified repository
   *
   * @param repoId - Repository ID to find similar repositories for
   * @returns Promise resolving to repository matches
   */
  public async findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]> {
    const indexSystem = await this.getIndexSystem();
    return indexSystem.findSimilarRepositories(repoId);
  }

  /**
   * Suggests combinations of repositories that could work well together
   *
   * @param repoIds - Repository IDs to suggest combinations for
   * @returns Promise resolving to combination suggestions
   */
  public async suggestCombinations(repoIds: string[]): Promise<Array<unknown>> {
    const indexSystem = await this.getIndexSystem();
    return indexSystem.suggestCombinations(repoIds);
  }
}
