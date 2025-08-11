/**
 * Enhanced error handling and logging utilities
 * Provides clear error messages, actionable suggestions, and detailed logging
 */

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  BUILD = 'BUILD',
  DEPENDENCY = 'DEPENDENCY',
  TYPESCRIPT = 'TYPESCRIPT',
  RUNTIME = 'RUNTIME',
  VALIDATION = 'VALIDATION',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Actionable suggestion interface
 */
export interface ErrorSuggestion {
  action: string;
  command?: string;
  description: string;
  automated?: boolean;
}

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
export class EnhancedLogger {
  private static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };

  static logError(error: EnhancedError): void {
    console.log(
      `\n${EnhancedLogger.colors.red}${EnhancedLogger.colors.bright}${error.title}${EnhancedLogger.colors.reset}`
    );
    console.log(`${EnhancedLogger.colors.red}ID: ${error.id}${EnhancedLogger.colors.reset}`);
    console.log(
      `${EnhancedLogger.colors.red}Category: ${error.category} | Severity: ${error.severity}${EnhancedLogger.colors.reset}`
    );
    console.log(
      `${EnhancedLogger.colors.red}Time: ${error.timestamp.toISOString()}${EnhancedLogger.colors.reset}`
    );

    if (error.file) {
      console.log(
        `${EnhancedLogger.colors.red}File: ${error.file}:${error.line}:${error.column}${EnhancedLogger.colors.reset}`
      );
    }

    console.log(`\n${EnhancedLogger.colors.red}Message:${EnhancedLogger.colors.reset}`);
    console.log(error.message);

    if (error.suggestions.length > 0) {
      console.log(
        `\n${EnhancedLogger.colors.yellow}${EnhancedLogger.colors.bright}💡 Suggested Actions:${EnhancedLogger.colors.reset}`
      );
      error.suggestions.forEach((suggestion, index) => {
        console.log(
          `${EnhancedLogger.colors.yellow}${index + 1}. ${suggestion.action}${EnhancedLogger.colors.reset}`
        );
        console.log(`   ${suggestion.description}`);
        if (suggestion.command) {
          console.log(
            `   ${EnhancedLogger.colors.cyan}Command: ${suggestion.command}${EnhancedLogger.colors.reset}`
          );
        }
        if (suggestion.automated) {
          console.log(
            `   ${EnhancedLogger.colors.green}✓ Can be automated${EnhancedLogger.colors.reset}`
          );
        }
        console.log();
      });
    }

    console.log(`${EnhancedLogger.colors.red}${'─'.repeat(80)}${EnhancedLogger.colors.reset}\n`);
  }

  static logSuccess(message: string): void {
    console.log(
      `${EnhancedLogger.colors.green}${EnhancedLogger.colors.bright}✅ ${message}${EnhancedLogger.colors.reset}`
    );
  }

  static logWarning(message: string): void {
    console.log(
      `${EnhancedLogger.colors.yellow}${EnhancedLogger.colors.bright}⚠️  ${message}${EnhancedLogger.colors.reset}`
    );
  }

  static logInfo(message: string): void {
    console.log(
      `${EnhancedLogger.colors.blue}${EnhancedLogger.colors.bright}ℹ️  ${message}${EnhancedLogger.colors.reset}`
    );
  }

  static logDebug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`${EnhancedLogger.colors.cyan}🐛 ${message}${EnhancedLogger.colors.reset}`);
    }
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: EnhancedError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle build errors with context and suggestions
   */
  handleBuildError(error: Error, context?: BuildErrorContext): EnhancedError {
    const enhancedError: EnhancedError = {
      id: this.generateErrorId(),
      category: ErrorCategory.BUILD,
      severity: ErrorSeverity.HIGH,
      title: 'Build Process Failed',
      message: error.message,
      suggestions: this.generateBuildSuggestions(error),
      timestamp: new Date(),
      context: context as unknown as Record<string, unknown>,
    };

    this.logError(enhancedError);
    return enhancedError;
  }

  /**
   * Handle TypeScript compilation errors
   */
  handleTypeScriptError(error: Error, context: TypeScriptErrorContext): EnhancedError {
    const enhancedError: EnhancedError = {
      id: this.generateErrorId(),
      category: ErrorCategory.TYPESCRIPT,
      severity: ErrorSeverity.HIGH,
      title: 'TypeScript Compilation Error',
      message: error.message,
      suggestions: this.generateTypeScriptSuggestions(error),
      timestamp: new Date(),
      file: context.file,
      line: context.line,
      column: context.column,
      context: context as unknown as Record<string, unknown>,
    };

    this.logError(enhancedError);
    return enhancedError;
  }

  /**
   * Handle dependency-related errors
   */
  handleDependencyError(error: Error, context?: DependencyErrorContext): EnhancedError {
    const enhancedError: EnhancedError = {
      id: this.generateErrorId(),
      category: ErrorCategory.DEPENDENCY,
      severity: ErrorSeverity.MEDIUM,
      title: 'Dependency Resolution Failed',
      message: error.message,
      suggestions: this.generateDependencySuggestions(error),
      timestamp: new Date(),
      context: context as unknown as Record<string, unknown>,
    };

    this.logError(enhancedError);
    return enhancedError;
  }

  /**
   * Generate build-specific suggestions
   */
  private generateBuildSuggestions(error: Error): ErrorSuggestion[] {
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
  }

  /**
   * Generate TypeScript-specific suggestions
   */
  private generateTypeScriptSuggestions(error: Error): ErrorSuggestion[] {
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
  }

  /**
   * Generate dependency-specific suggestions
   */
  private generateDependencySuggestions(error: Error): ErrorSuggestion[] {
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
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error to internal storage
   */
  private logError(error: EnhancedError): void {
    this.errorLog.push(error);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  /**
   * Get all logged errors
   */
  getErrorLog(): EnhancedError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}
/**
 
* Error analysis utilities
 */
export class ErrorAnalyzer {
  /**
   * Analyze dependency issues from package.json
   */
  static analyzeDependencyIssues(packageJsonPath: string): Array<{
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
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse TypeScript errors from compiler output
   */
  static parseTypeScriptErrors(stderr: string): Array<{
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
    let match;

    while ((match = errorRegex.exec(stderr)) !== null) {
      errors.push({
        file: match[1],
        line: Number.parseInt(match[2], 10),
        column: Number.parseInt(match[3], 10),
        code: match[4],
        message: match[5],
      });
    }

    return errors;
  }

  /**
   * Analyze build performance issues
   */
  static analyzeBuildPerformance(
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
  }
}
