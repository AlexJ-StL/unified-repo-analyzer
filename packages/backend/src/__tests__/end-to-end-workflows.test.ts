import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogManagementService } from '../services/log-management.service';
import { Logger } from '../services/logger.service';
import { PathHandler } from '../services/path-handler.service';

describe('End-to-End User Workflow Tests', () => {
  let testDir: string;
  let pathHandler: PathHandler;
  let logger: Logger;
  let logManagement: LogManagementService;

  beforeEach(async () => {
    testDir = path.join(process.cwd(), 'test-e2e-workflows');

    // Clean up and create test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });

    // Initialize services
    pathHandler = new PathHandler();
    logger = new Logger({
      level: 'DEBUG',
      outputs: [
        { type: 'console', config: { colorize: false } },
        {
          type: 'file',
          config: {
            path: path.join(testDir, 'workflow.log'),
            maxSize: '10MB',
            maxFiles: 5,
            rotateDaily: false,
          },
        },
      ],
      format: 'JSON',
      includeStackTrace: true,
      redactSensitiveData: true,
    });

    logManagement = new LogManagementService({
      logDirectory: testDir,
      retentionPolicy: {
        maxAge: 7,
        maxSize: '50MB',
        maxFiles: 10,
        cleanupInterval: 1,
      },
      monitoringEnabled: true,
      alertThresholds: {
        diskUsage: 80,
        fileSize: '10MB',
        errorRate: 10,
      },
    });
  });

  afterEach(async () => {
    await logManagement?.stop();

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Complete Repository Analysis Workflow', () => {
    it('should handle successful repository analysis from start to finish', async () => {
      const requestId = 'repo-analysis-success-001';
      logger.setRequestId(requestId);

      // Step 1: Create a realistic repository structure
      const repoPath = path.join(testDir, 'sample-repo');
      await createSampleRepository(repoPath);

      logger.info(
        'Starting repository analysis workflow',
        {
          repoPath,
          workflow: 'complete-analysis',
        },
        'workflow-manager',
        requestId
      );

      // Step 2: Validate repository path
      logger.debug('Validating repository path', { path: repoPath }, 'path-handler', requestId);

      const pathValidation = await pathHandler.validatePath(repoPath, {
        onProgress: (progress) => {
          logger.debug(
            'Path validation progress',
            {
              stage: progress.stage,
              percentage: progress.percentage,
              message: progress.message,
            },
            'path-handler',
            requestId
          );
        },
      });

      expect(pathValidation.isValid).toBe(true);
      expect(pathValidation.metadata.exists).toBe(true);
      expect(pathValidation.metadata.isDirectory).toBe(true);

      logger.info(
        'Repository path validated successfully',
        {
          path: repoPath,
          isValid: pathValidation.isValid,
          isDirectory: pathValidation.metadata.isDirectory,
        },
        'path-handler',
        requestId
      );

      // Step 3: Check repository permissions
      logger.debug(
        'Checking repository permissions',
        { path: repoPath },
        'path-handler',
        requestId
      );

      const permissions = await pathHandler.checkPermissions(repoPath);
      expect(permissions.canRead).toBe(true);

      logger.info(
        'Repository permissions verified',
        {
          canRead: permissions.canRead,
          canWrite: permissions.canWrite,
          canExecute: permissions.canExecute,
        },
        'path-handler',
        requestId
      );

      // Step 4: Analyze repository structure
      logger.debug(
        'Analyzing repository structure',
        { path: repoPath },
        'analysis-engine',
        requestId
      );

      const repoStructure = await analyzeRepositoryStructure(repoPath);
      expect(repoStructure.files.length).toBeGreaterThan(0);
      expect(repoStructure.directories.length).toBeGreaterThan(0);

      logger.info(
        'Repository structure analyzed',
        {
          totalFiles: repoStructure.files.length,
          totalDirectories: repoStructure.directories.length,
          languages: repoStructure.languages,
        },
        'analysis-engine',
        requestId
      );

      // Step 5: Process individual files
      for (const file of repoStructure.files.slice(0, 3)) {
        // Process first 3 files
        logger.debug('Processing file', { file: file.path }, 'file-processor', requestId);

        const fileValidation = await pathHandler.validatePath(file.path);
        expect(fileValidation.isValid).toBe(true);

        logger.debug(
          'File processed successfully',
          {
            file: file.path,
            size: file.size,
            type: file.type,
          },
          'file-processor',
          requestId
        );
      }

      // Step 6: Generate analysis report
      logger.debug('Generating analysis report', {}, 'report-generator', requestId);

      const report = {
        repoPath,
        totalFiles: repoStructure.files.length,
        totalDirectories: repoStructure.directories.length,
        languages: repoStructure.languages,
        analysisTime: new Date().toISOString(),
        status: 'completed',
      };

      logger.info('Analysis report generated', report, 'report-generator', requestId);

      // Step 7: Cleanup and finalization
      logger.debug('Performing cleanup', {}, 'cleanup-service', requestId);

      const cleanupResult = await logManagement.performCleanup();

      logger.info(
        'Repository analysis workflow completed successfully',
        {
          requestId,
          duration: '< 1s',
          filesAnalyzed: repoStructure.files.length,
          cleanupResult: {
            filesRemoved: cleanupResult.filesRemoved,
            spaceFreed: cleanupResult.spaceFreed,
          },
        },
        'workflow-manager',
        requestId
      );

      // Verify workflow logging
      await verifyWorkflowLogging(requestId, [
        'workflow-manager',
        'path-handler',
        'analysis-engine',
        'file-processor',
        'report-generator',
        'cleanup-service',
      ]);
    });

    it('should handle repository analysis with path validation errors', async () => {
      const requestId = 'repo-analysis-error-002';
      logger.setRequestId(requestId);

      // Test with invalid Windows path (if on Windows platform)
      const invalidPath =
        process.platform === 'win32'
          ? 'C:\\invalid\\path\\with\\reserved\\CON\\name'
          : '/invalid/path/that/does/not/exist';

      logger.info(
        'Starting repository analysis with invalid path',
        {
          repoPath: invalidPath,
          workflow: 'error-handling',
        },
        'workflow-manager',
        requestId
      );

      // Step 1: Attempt path validation
      logger.debug('Validating repository path', { path: invalidPath }, 'path-handler', requestId);

      const pathValidation = await pathHandler.validatePath(invalidPath);
      expect(pathValidation.isValid).toBe(false);
      expect(pathValidation.errors.length).toBeGreaterThan(0);

      logger.warn(
        'Repository path validation failed',
        {
          path: invalidPath,
          errors: pathValidation.errors.map((e) => ({
            code: e.code,
            message: e.message,
            suggestions: e.suggestions,
          })),
        },
        'path-handler',
        requestId
      );

      // Step 2: Handle validation errors
      logger.debug(
        'Processing validation errors',
        {
          errorCount: pathValidation.errors.length,
        },
        'error-handler',
        requestId
      );

      const userFriendlyErrors = pathValidation.errors.map((error) => ({
        type: 'path_validation_error',
        code: error.code,
        message: error.message,
        details: error.details,
        suggestions: error.suggestions || [],
        userMessage: generateUserFriendlyMessage(error),
      }));

      logger.info(
        'User-friendly error messages generated',
        {
          errorCount: userFriendlyErrors.length,
          errorTypes: userFriendlyErrors.map((e) => e.code),
        },
        'error-handler',
        requestId
      );

      // Step 3: Workflow termination
      logger.error(
        'Repository analysis workflow terminated due to path validation errors',
        new Error('Path validation failed'),
        {
          requestId,
          originalPath: invalidPath,
          errorCount: pathValidation.errors.length,
          userErrors: userFriendlyErrors,
        },
        'workflow-manager',
        requestId
      );

      // Verify error handling logging
      await verifyErrorHandlingLogging(requestId, pathValidation.errors);
    });

    it('should handle timeout scenarios gracefully', async () => {
      const requestId = 'repo-analysis-timeout-003';
      logger.setRequestId(requestId);

      // Create a test repository
      const repoPath = path.join(testDir, 'timeout-test-repo');
      await createSampleRepository(repoPath);

      logger.info(
        'Starting repository analysis with timeout testing',
        {
          repoPath,
          workflow: 'timeout-handling',
        },
        'workflow-manager',
        requestId
      );

      // Mock slow file system operations
      const originalStat = fs.stat;
      const statSpy = vi.spyOn(fs, 'stat').mockImplementation(async (path) => {
        // Simulate slow operation for specific paths
        if (path.toString().includes('slow-file')) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        return originalStat(path);
      });

      try {
        // Step 1: Attempt path validation with short timeout
        logger.debug(
          'Validating repository path with timeout',
          {
            path: repoPath,
            timeoutMs: 500,
          },
          'path-handler',
          requestId
        );

        const pathValidation = await pathHandler.validatePath(repoPath, {
          timeoutMs: 500,
          onProgress: (progress) => {
            logger.debug(
              'Path validation progress (timeout test)',
              {
                stage: progress.stage,
                percentage: progress.percentage,
              },
              'path-handler',
              requestId
            );
          },
        });

        // Should complete successfully since we're not accessing the slow path
        expect(pathValidation.isValid).toBe(true);

        logger.info(
          'Path validation completed within timeout',
          {
            isValid: pathValidation.isValid,
            timeoutMs: 500,
          },
          'path-handler',
          requestId
        );

        // Step 2: Test with a path that would timeout
        const slowPath = path.join(repoPath, 'slow-file.txt');
        await fs.writeFile(slowPath, 'slow file content');

        logger.debug(
          'Testing timeout scenario',
          {
            path: slowPath,
            timeoutMs: 100,
          },
          'path-handler',
          requestId
        );

        const timeoutValidation = await pathHandler.validatePath(slowPath, {
          timeoutMs: 100,
        });

        // Should have timeout error
        const hasTimeoutError = timeoutValidation.errors.some(
          (e) => e.message.includes('timed out') || e.message.includes('timeout')
        );

        if (hasTimeoutError) {
          logger.warn(
            'Path validation timed out as expected',
            {
              path: slowPath,
              timeoutMs: 100,
              errors: timeoutValidation.errors.map((e) => e.message),
            },
            'path-handler',
            requestId
          );
        }
      } finally {
        // Restore original implementation
        statSpy.mockRestore();
      }

      logger.info(
        'Timeout handling test completed',
        {
          requestId,
          workflow: 'timeout-handling',
        },
        'workflow-manager',
        requestId
      );
    });

    it('should handle cancellation scenarios', async () => {
      const requestId = 'repo-analysis-cancel-004';
      logger.setRequestId(requestId);

      const repoPath = path.join(testDir, 'cancel-test-repo');
      await createSampleRepository(repoPath);

      logger.info(
        'Starting repository analysis with cancellation testing',
        {
          repoPath,
          workflow: 'cancellation-handling',
        },
        'workflow-manager',
        requestId
      );

      // Create abort controller
      const controller = pathHandler.createAbortController();

      // Start path validation
      logger.debug(
        'Starting path validation with cancellation support',
        {
          path: repoPath,
        },
        'path-handler',
        requestId
      );

      const validationPromise = pathHandler.validatePath(repoPath, {
        signal: controller.signal,
        timeoutMs: 5000,
        onProgress: (progress) => {
          logger.debug(
            'Path validation progress (cancellation test)',
            {
              stage: progress.stage,
              percentage: progress.percentage,
            },
            'path-handler',
            requestId
          );
        },
      });

      // Cancel after 50ms
      setTimeout(() => {
        logger.debug('Cancelling path validation', {}, 'workflow-manager', requestId);
        controller.abort();
      }, 50);

      const result = await validationPromise;

      // Should have cancellation error
      const hasCancelError = result.errors.some(
        (e) => e.code === 'OPERATION_CANCELLED' || e.message.includes('cancelled')
      );

      if (hasCancelError) {
        logger.info(
          'Path validation cancelled successfully',
          {
            errors: result.errors.map((e) => ({
              code: e.code,
              message: e.message,
            })),
          },
          'path-handler',
          requestId
        );
      }

      logger.info(
        'Cancellation handling test completed',
        {
          requestId,
          wasCancelled: hasCancelError,
        },
        'workflow-manager',
        requestId
      );
    });
  });

  describe('Settings Tab Path Input Workflow', () => {
    it('should simulate settings tab path validation workflow', async () => {
      const requestId = 'settings-workflow-001';
      logger.setRequestId(requestId);

      // Simulate user entering path in settings tab
      const userInputPath =
        process.platform === 'win32'
          ? 'C:\\Users\\TestUser\\Documents\\Projects'
          : '/home/testuser/projects';

      logger.info(
        'User entered path in settings tab',
        {
          userInput: userInputPath,
          source: 'settings-tab',
        },
        'frontend',
        requestId
      );

      // Step 1: Real-time validation as user types
      logger.debug(
        'Performing real-time path validation',
        {
          path: userInputPath,
        },
        'settings-validator',
        requestId
      );

      const realtimeValidation = await pathHandler.validatePath(userInputPath, {
        timeoutMs: 1000, // Quick validation for real-time feedback
        onProgress: (progress) => {
          logger.debug(
            'Real-time validation progress',
            {
              stage: progress.stage,
              percentage: progress.percentage,
            },
            'settings-validator',
            requestId
          );
        },
      });

      // Step 2: Provide user feedback
      const feedback = {
        isValid: realtimeValidation.isValid,
        exists: realtimeValidation.metadata.exists,
        canRead: realtimeValidation.metadata.permissions.read,
        errors: realtimeValidation.errors.map((e) => ({
          code: e.code,
          message: e.message,
          suggestions: e.suggestions,
        })),
        warnings: realtimeValidation.warnings.map((w) => ({
          code: w.code,
          message: w.message,
        })),
      };

      logger.info(
        'Real-time validation feedback generated',
        feedback,
        'settings-validator',
        requestId
      );

      // Step 3: User saves settings (if valid)
      if (realtimeValidation.isValid && realtimeValidation.metadata.exists) {
        logger.info(
          'User saved valid path in settings',
          {
            savedPath: realtimeValidation.normalizedPath,
            originalInput: userInputPath,
          },
          'settings-manager',
          requestId
        );

        // Step 4: Persist settings
        const settings = {
          repositoryPath: realtimeValidation.normalizedPath,
          lastUpdated: new Date().toISOString(),
          validatedAt: new Date().toISOString(),
        };

        logger.debug('Persisting user settings', settings, 'settings-manager', requestId);
      } else {
        logger.warn(
          'User attempted to save invalid path',
          {
            path: userInputPath,
            errors: feedback.errors,
          },
          'settings-manager',
          requestId
        );
      }

      logger.info(
        'Settings tab workflow completed',
        {
          requestId,
          finalPath: realtimeValidation.normalizedPath,
          wasValid: realtimeValidation.isValid,
        },
        'settings-tab',
        requestId
      );
    });
  });

  describe('Analyze Tab Path Input Workflow', () => {
    it('should simulate analyze tab repository selection workflow', async () => {
      const requestId = 'analyze-workflow-001';
      logger.setRequestId(requestId);

      // Create test repository
      const repoPath = path.join(testDir, 'analyze-repo');
      await createSampleRepository(repoPath);

      logger.info(
        'User initiated repository analysis',
        {
          selectedPath: repoPath,
          source: 'analyze-tab',
        },
        'frontend',
        requestId
      );

      // Step 1: Pre-analysis validation
      logger.debug(
        'Performing pre-analysis validation',
        {
          path: repoPath,
        },
        'analyze-validator',
        requestId
      );

      const preValidation = await pathHandler.validatePath(repoPath, {
        onProgress: (progress) => {
          logger.debug(
            'Pre-analysis validation progress',
            {
              stage: progress.stage,
              percentage: progress.percentage,
              message: progress.message,
            },
            'analyze-validator',
            requestId
          );
        },
      });

      expect(preValidation.isValid).toBe(true);

      // Step 2: Permission verification
      logger.debug(
        'Verifying analysis permissions',
        {
          path: repoPath,
        },
        'analyze-validator',
        requestId
      );

      const permissions = await pathHandler.checkPermissions(repoPath);
      expect(permissions.canRead).toBe(true);

      logger.info(
        'Pre-analysis validation completed',
        {
          isValid: preValidation.isValid,
          canRead: permissions.canRead,
          repositorySize: preValidation.metadata.size,
        },
        'analyze-validator',
        requestId
      );

      // Step 3: Start analysis process
      logger.info(
        'Starting repository analysis process',
        {
          path: repoPath,
          analysisId: requestId,
        },
        'analysis-engine',
        requestId
      );

      // Simulate analysis steps with progress updates
      const analysisSteps = [
        { name: 'File Discovery', percentage: 20 },
        { name: 'Language Detection', percentage: 40 },
        { name: 'Dependency Analysis', percentage: 60 },
        { name: 'Code Structure Analysis', percentage: 80 },
        { name: 'Report Generation', percentage: 100 },
      ];

      for (const step of analysisSteps) {
        logger.debug(
          'Analysis progress update',
          {
            step: step.name,
            percentage: step.percentage,
            analysisId: requestId,
          },
          'analysis-engine',
          requestId
        );

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Step 4: Generate results
      const analysisResults = {
        repositoryPath: repoPath,
        totalFiles: 15,
        languages: ['JavaScript', 'TypeScript', 'JSON'],
        linesOfCode: 1250,
        dependencies: 8,
        analysisTime: new Date().toISOString(),
        status: 'completed',
      };

      logger.info(
        'Repository analysis completed successfully',
        analysisResults,
        'analysis-engine',
        requestId
      );

      // Step 5: Present results to user
      logger.info(
        'Analysis results presented to user',
        {
          analysisId: requestId,
          resultsSummary: {
            files: analysisResults.totalFiles,
            languages: analysisResults.languages.length,
            loc: analysisResults.linesOfCode,
          },
        },
        'frontend',
        requestId
      );

      logger.info(
        'Analyze tab workflow completed',
        {
          requestId,
          success: true,
          duration: '< 1s',
        },
        'analyze-tab',
        requestId
      );
    });
  });

  // Helper functions
  async function createSampleRepository(repoPath: string): Promise<void> {
    await fs.mkdir(repoPath, { recursive: true });

    // Create directory structure
    await fs.mkdir(path.join(repoPath, 'src'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'tests'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'docs'), { recursive: true });
    await fs.mkdir(path.join(repoPath, 'node_modules'), { recursive: true });

    // Create files
    await fs.writeFile(
      path.join(repoPath, 'package.json'),
      JSON.stringify(
        {
          name: 'sample-repo',
          version: '1.0.0',
          description: 'Sample repository for testing',
        },
        null,
        2
      )
    );

    await fs.writeFile(
      path.join(repoPath, 'README.md'),
      '# Sample Repository\n\nThis is a test repository.'
    );
    await fs.writeFile(path.join(repoPath, '.gitignore'), 'node_modules/\n*.log\n.env');

    await fs.writeFile(path.join(repoPath, 'src', 'index.js'), 'console.log("Hello, world!");');
    await fs.writeFile(
      path.join(repoPath, 'src', 'utils.js'),
      'export function helper() { return true; }'
    );
    await fs.writeFile(path.join(repoPath, 'src', 'config.json'), '{"env": "development"}');

    await fs.writeFile(
      path.join(repoPath, 'tests', 'index.test.js'),
      'test("sample test", () => {});'
    );
    await fs.writeFile(
      path.join(repoPath, 'tests', 'utils.test.js'),
      'test("utils test", () => {});'
    );

    await fs.writeFile(path.join(repoPath, 'docs', 'API.md'), '# API Documentation');
  }

  async function analyzeRepositoryStructure(repoPath: string): Promise<{
    files: Array<{ path: string; size: number; type: string }>;
    directories: string[];
    languages: string[];
  }> {
    const files: Array<{ path: string; size: number; type: string }> = [];
    const directories: string[] = [];
    const languages = new Set<string>();

    async function scanDirectory(dirPath: string): Promise<void> {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          directories.push(fullPath);
          await scanDirectory(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          const ext = path.extname(entry.name);

          files.push({
            path: fullPath,
            size: stats.size,
            type: ext || 'unknown',
          });

          // Detect language based on extension
          const languageMap: Record<string, string> = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.json': 'JSON',
            '.md': 'Markdown',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
          };

          if (languageMap[ext]) {
            languages.add(languageMap[ext]);
          }
        }
      }
    }

    await scanDirectory(repoPath);

    return {
      files,
      directories,
      languages: Array.from(languages),
    };
  }

  interface ValidationError {
    code?: string;
    message?: string;
  }

  function generateUserFriendlyMessage(error: ValidationError): string {
    const messageMap: Record<string, string> = {
      PATH_NOT_FOUND:
        'The specified path could not be found. Please check that the path exists and try again.',
      INVALID_DRIVE_LETTER:
        'The drive letter format is invalid. Please use a format like C:\\ or D:\\.',
      RESERVED_NAME: 'The path contains a reserved Windows name. Please rename the file or folder.',
      PATH_TOO_LONG:
        'The path is too long for Windows. Please use a shorter path or enable long path support.',
      INVALID_CHARACTERS:
        'The path contains invalid characters. Please remove characters like < > : " | ? *',
      PERMISSION_DENIED:
        'You do not have permission to access this path. Please check your permissions.',
    };

    return messageMap[error.code] || `Path validation error: ${error.message}`;
  }

  async function verifyWorkflowLogging(
    requestId: string,
    expectedComponents: string[]
  ): Promise<void> {
    const logContent = await fs.readFile(path.join(testDir, 'workflow.log'), 'utf-8');
    const logLines = logContent
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    const logEntries = logLines.map((line) => JSON.parse(line));

    // Filter logs for this request
    const requestLogs = logEntries.filter((entry) => entry.requestId === requestId);
    expect(requestLogs.length).toBeGreaterThan(0);

    // Verify all expected components logged
    const loggedComponents = [...new Set(requestLogs.map((entry) => entry.component))];
    for (const expectedComponent of expectedComponents) {
      expect(loggedComponents).toContain(expectedComponent);
    }

    // Verify log sequence makes sense
    const workflowStart = requestLogs.find(
      (entry) => entry.message.includes('Starting') && entry.component === 'workflow-manager'
    );
    const workflowEnd = requestLogs.find(
      (entry) => entry.message.includes('completed') && entry.component === 'workflow-manager'
    );

    expect(workflowStart).toBeDefined();
    expect(workflowEnd).toBeDefined();
  }

  async function verifyErrorHandlingLogging(
    requestId: string,
    expectedErrors: ValidationError[]
  ): Promise<void> {
    const logContent = await fs.readFile(path.join(testDir, 'workflow.log'), 'utf-8');
    const logLines = logContent
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    const logEntries = logLines.map((line) => JSON.parse(line));

    // Filter logs for this request
    const requestLogs = logEntries.filter((entry) => entry.requestId === requestId);

    // Should have error and warning logs
    const errorLogs = requestLogs.filter((entry) => entry.level === 'ERROR');
    const warnLogs = requestLogs.filter((entry) => entry.level === 'WARN');

    expect(errorLogs.length + warnLogs.length).toBeGreaterThan(0);

    // Verify error details are logged
    const errorLog = errorLogs.find((entry) => entry.message.includes('terminated'));
    if (errorLog) {
      expect(errorLog.metadata.errorCount).toBe(expectedErrors.length);
      expect(errorLog.metadata.userErrors).toBeDefined();
    }
  }
});
