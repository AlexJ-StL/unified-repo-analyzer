/**
 * Enhanced error handling and logging utilities
 * Provides clear error messages, actionable suggestions, and detailed logging
 */

// Import types and enums from error-classification module
import {
  ErrorCategory,
  ErrorSeverity,
  type ErrorSuggestion,
} from '../types/error-classification.js';

/**
 * Enhanced error information
 */
export interface EnhancedError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  message: string;
  suggestions: ErrorSuggestion[];
  timestamp: Date;
  file?: string;
  line?: number;
  column?: number;
  context?: Record<string, unknown>;
}

/**
 * Build error context
 */
export interface BuildErrorContext {
  package?: string;
  command?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

/**
 * TypeScript error context
 */
export interface TypeScriptErrorContext {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

/**
 * Dependency error context
 */
export interface DependencyErrorContext {
  package?: string;
  missingPeers?: string[];
  conflictsWith?: string[];
}

/**
 * Enhanced logger with color-coded output
 */
export const EnhancedLogger = {
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  },

  logError(error: EnhancedError): void {
    console.log(`\n${this.colors.red}${this.colors.bright}${error.title}${this.colors.reset}`);
    console.log(`${this.colors.red}ID: ${error.id}${this.colors.reset}`);
    console.log(
      `${this.colors.red}Category: ${error.category} | Severity: ${error.severity}${this.colors.reset}`
    );
    console.log(`${this.colors.red}Time: ${error.timestamp.toISOString()}${this.colors.reset}`);

    if (error.file) {
      console.log(
        `${this.colors.red}File: ${error.file}:${error.line}:${error.column}${this.colors.reset}`
      );
    }

    console.log(`\n${this.colors.red}Message:${this.colors.reset}`);
    console.log(error.message);

    if (error.suggestions.length > 0) {
      console.log(
        `\n${this.colors.yellow}${this.colors.bright}💡 Suggested Actions:${this.colors.reset}`
      );
      error.suggestions.forEach((suggestion, index) => {
        console.log(`${this.colors.yellow}${index + 1}. ${suggestion.action}${this.colors.reset}`);
        console.log(`   ${suggestion.description}`);
        if (suggestion.command) {
          console.log(`   ${this.colors.cyan}Command: ${suggestion.command}${this.colors.reset}`);
        }
        if (suggestion.automated) {
          console.log(`   ${this.colors.green}✓ Can be automated${this.colors.reset}`);
        }
        console.log();
      });
    }

    console.log(`${this.colors.red}${'─'.repeat(80)}${this.colors.reset}\n`);
  },

  logSuccess(message: string): void {
    console.log(`${this.colors.green}${this.colors.bright}✅ ${message}${this.colors.reset}`);
  },

  logWarning(message: string): void {
    console.log(`${this.colors.yellow}${this.colors.bright}⚠️  ${message}${this.colors.reset}`);
  },

  logInfo(message: string): void {
    console.log(`${this.colors.blue}${this.colors.bright}ℹ️  ${message}${this.colors.reset}`);
  },

  logDebug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`${this.colors.cyan}🐛 ${message}${this.colors.reset}`);
    }
  },
};

/**
 * Error handler utility class
 */
let errorLog: EnhancedError[] = [];

const generateErrorId = (): string => {
  return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const internalLogError = (error: EnhancedError): void => {
  errorLog.push(error);

  // Keep only last 100 errors to prevent memory issues
  if (errorLog.length > 100) {
    errorLog = errorLog.slice(-100);
  }
};

const generateBuildSuggestions = (error: Error): ErrorSuggestion[] => {
  const suggestions: ErrorSuggestion[] = [];

  if (error.message.includes('tsc') && error.message.includes('not found')) {
    suggestions.push({
      action: 'Install TypeScript compiler',
      command: 'bun add -D typescript',
      description: 'TypeScript compiler is missing from dependencies',
      automated: true,
    });
  }

  if (error.message.includes('node_modules')) {
    suggestions.push({
      action: 'Clean and reinstall dependencies',
      command: 'rm -rf node_modules && bun install',
      description: 'Dependencies may be corrupted or missing',
      automated: true,
    });
  }

  suggestions.push({
    action: 'Check build logs for detailed error information',
    description: 'Review the complete error output for specific issues',
    automated: false,
  });

  return suggestions;
};

const generateTypeScriptSuggestions = (error: Error): ErrorSuggestion[] => {
  const suggestions: ErrorSuggestion[] = [];

  if (error.message.includes('Cannot find name')) {
    suggestions.push({
      action: 'Import missing type or module',
      description: 'Add the required import statement at the top of the file',
      automated: false,
    });
  }

  if (error.message.includes('Type') && error.message.includes('not assignable')) {
    suggestions.push({
      action: 'Fix type mismatch',
      description: 'Ensure the assigned value matches the expected type',
      automated: false,
    });
  }

  suggestions.push({
    action: 'Review TypeScript configuration',
    description: 'Check tsconfig.json for proper type checking settings',
    automated: false,
  });

  return suggestions;
};

const generateDependencySuggestions = (error: Error): ErrorSuggestion[] => {
  const suggestions: ErrorSuggestion[] = [];

  if (error.message.includes('ERESOLVE')) {
    suggestions.push({
      action: 'Force dependency resolution',
      command: 'bun install --force',
      description: 'Force install to resolve dependency conflicts',
      automated: true,
    });
  }

  suggestions.push({
    action: 'Clear package manager cache',
    command: 'bun pm cache rm',
    description: 'Clear cached packages that might be corrupted',
    automated: true,
  });

  return suggestions;
};

const handleBuildError = (error: Error, context?: BuildErrorContext): EnhancedError => {
  const enhancedError: EnhancedError = {
    id: generateErrorId(),
    category: ErrorCategory.ANALYSIS,
    severity: ErrorSeverity.HIGH,
    title: 'Build Process Failed',
    message: error.message,
    suggestions: generateBuildSuggestions(error),
    timestamp: new Date(),
    context: context as unknown as Record<string, unknown>,
  };

  internalLogError(enhancedError);
  return enhancedError;
};

const handleTypeScriptError = (error: Error, context: TypeScriptErrorContext): EnhancedError => {
  const enhancedError: EnhancedError = {
    id: generateErrorId(),
    category: ErrorCategory.ANALYSIS,
    severity: ErrorSeverity.HIGH,
    title: 'TypeScript Compilation Error',
    message: error.message,
    suggestions: generateTypeScriptSuggestions(error),
    timestamp: new Date(),
    file: context.file,
    line: context.line,
    column: context.column,
    context: context as unknown as Record<string, unknown>,
  };

  internalLogError(enhancedError);
  return enhancedError;
};

const handleDependencyError = (error: Error, context?: DependencyErrorContext): EnhancedError => {
  const enhancedError: EnhancedError = {
    id: generateErrorId(),
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.MEDIUM,
    title: 'Dependency Resolution Failed',
    message: error.message,
    suggestions: generateDependencySuggestions(error),
    timestamp: new Date(),
    context: context as unknown as Record<string, unknown>,
  };

  internalLogError(enhancedError);
  return enhancedError;
};

const getErrorLogFunc = (): EnhancedError[] => {
  return [...errorLog];
};

const clearErrorLogFunc = (): void => {
  errorLog = [];
};

export const ErrorHandler = {
  getInstance: () => ({
    handleBuildError,
    handleTypeScriptError,
    handleDependencyError,
    getErrorLog: getErrorLogFunc,
    clearErrorLog: clearErrorLogFunc,
  }),
};

/**
 * Error analysis utilities
 */
export const ErrorAnalyzer = {
  /**
   * Analyze dependency issues from package.json
   */
  analyzeDependencyIssues(packageJsonPath: string): Array<{
    package?: string;
    missingPeers?: string[];
    versionConflicts?: string[];
  }> {
    try {
      const fs = require('node:fs');
      const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const issues: Array<{
        package?: string;
        missingPeers?: string[];
        versionConflicts?: string[];
      }> = [];

      // Simple dependency analysis - could be expanded
      const deps = {
        ...packageData.dependencies,
        ...packageData.devDependencies,
      };

      // Check for common problematic patterns
      for (const [name, version] of Object.entries(deps)) {
        if (typeof version === 'string' && version.includes('file:')) {
          issues.push({
            package: name,
            versionConflicts: [`Local file dependency: ${version}`],
          });
        }
      }

      return issues;
    } catch (_error) {
      return [];
    }
  },

  /**
   * Parse TypeScript errors from compiler output
   */
  parseTypeScriptErrors(stderr: string): Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
  }> {
    const errors: Array<{
      file: string;
      line: number;
      column: number;
      message: string;
      code: string;
    }> = [];

    // Parse TypeScript error format: file(line,column): error TSxxxx: message
    const errorRegex = /(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)/g;
    let match: RegExpExecArray | null;

    while (true) {
      match = errorRegex.exec(stderr);
      if (match === null) break;
      errors.push({
        file: match[1],
        line: Number.parseInt(match[2], 10),
        column: Number.parseInt(match[3], 10),
        code: match[4],
        message: match[5],
      });
    }

    return errors;
  },

  /**
   * Analyze build performance issues
   */
  analyzeBuildPerformance(
    buildTime: number,
    packageCount: number
  ): {
    isSlowBuild: boolean;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let isSlowBuild = false;

    if (buildTime > 120000) {
      // > 2 minutes
      isSlowBuild = true;
      suggestions.push('Build time is slow, consider TypeScript incremental compilation');
    }

    if (packageCount > 1000) {
      suggestions.push('Large number of dependencies may impact build performance');
    }

    if (buildTime > 300000) {
      // > 5 minutes
      suggestions.push('Very slow build - consider build optimization or parallel builds');
    }

    return { isSlowBuild, suggestions };
  },
};
