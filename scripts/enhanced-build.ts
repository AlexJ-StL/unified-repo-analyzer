/**
 * Enhanced build script with comprehensive error handling and logging
 * Uses the new error handling utilities to provide detailed feedback
 */

import { ErrorCategory, ErrorSeverity } from '../packages/shared/src/types/error-classification.js';
import { runBuildProcess } from '../packages/shared/src/utils/build-utils.js';
import { EnhancedLogger } from '../packages/shared/src/utils/error-handling.js';

/**
 * Main build function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const projectRoot = args.find((arg) => !arg.startsWith('--')) || process.cwd();
  const verbose = args.includes('--verbose') || process.env.DEBUG === '1';

  // Set up enhanced logging
  if (verbose) {
    process.env.DEBUG = '1';
  }

  EnhancedLogger.logInfo('🚀 Starting enhanced build process...');
  EnhancedLogger.logInfo(`Project root: ${projectRoot}`);

  try {
    const success = await runBuildProcess(projectRoot);

    if (success) {
      EnhancedLogger.logSuccess('🎉 Build completed successfully!');
      EnhancedLogger.logInfo('All packages built without errors');
      process.exit(0);
    } else {
      EnhancedLogger.logError({
        id: 'BUILD_PROCESS_FAILED',
        category: ErrorCategory.BUILD,
        severity: ErrorSeverity.HIGH,
        title: 'Build Process Failed',
        message: 'One or more packages failed to build',
        suggestions: [
          {
            action: 'Review build logs for specific errors',
            description: 'Check the detailed error output above',
            automated: false,
          },
          {
            action: 'Run build doctor for diagnostics',
            description: 'Execute: bun run scripts/build-doctor.ts',
            automated: false,
          },
          {
            action: 'Try building packages individually',
            description: 'Build each package separately to isolate issues',
            automated: false,
          },
        ],
        timestamp: new Date(),
      });

      EnhancedLogger.logInfo('💡 For detailed diagnostics, run: bun run scripts/build-doctor.ts');
      process.exit(1);
    }
  } catch (error) {
    EnhancedLogger.logError({
      id: 'BUILD_SCRIPT_ERROR',
      category: ErrorCategory.BUILD,
      severity: ErrorSeverity.CRITICAL,
      title: 'Build Script Error',
      message: error instanceof Error ? error.message : String(error),
      suggestions: [
        {
          action: 'Check system requirements',
          description: 'Ensure Node.js 18+ and required tools are installed',
          automated: false,
        },
        {
          action: 'Verify project structure',
          description: 'Ensure all required files and directories exist',
          automated: false,
        },
        {
          action: 'Run with verbose logging',
          description: 'Add --verbose flag for detailed output',
          automated: false,
        },
      ],
      timestamp: new Date(),
    });

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  EnhancedLogger.logError({
    id: 'UNCAUGHT_EXCEPTION',
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'Uncaught Exception',
    message: error.message,
    context: { stack: error.stack },
    suggestions: [
      {
        action: 'Report this error',
        description: 'This is an unexpected error that should be reported',
        automated: false,
      },
    ],
    timestamp: new Date(),
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  EnhancedLogger.logError({
    id: 'UNHANDLED_REJECTION',
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'Unhandled Promise Rejection',
    message: reason instanceof Error ? reason.message : String(reason),
    suggestions: [
      {
        action: 'Check async/await usage',
        description: 'Ensure all promises are properly handled',
        automated: false,
      },
    ],
    timestamp: new Date(),
  });
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

export default main;
