/**
 * Build utilities with comprehensive error handling and logging
 * Provides enhanced build script execution with detailed error reporting
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  type BuildErrorContext,
  type DependencyErrorContext,
  EnhancedLogger,
  ErrorAnalyzer,
  ErrorHandler,
} from './error-handling.js';
import { ErrorCategory, ErrorSeverity } from '../types/error-classification.js';

/**
 * Build command configuration
 */
export interface BuildCommandConfig {
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  retries?: number;
  stdio?: 'inherit' | 'pipe';
}

/**
 * Build result information
 */
export interface BuildResult {
  success: boolean;
  exitCode: number | null;
  duration: number;
  stdout?: string;
  stderr?: string;
  error?: string;
  suggestions?: string[];
}

/**
 * Package build information
 */
export interface PackageBuildInfo {
  name: string;
  path: string;
  hasTypeScript: boolean;
  hasBuildScript: boolean;
  dependencies: string[];
  buildOrder: number;
}

/**
 * Build context for comprehensive error reporting
 */
export interface BuildContext {
  projectRoot: string;
  packages: PackageBuildInfo[];
  currentPackage?: string;
  buildPhase: 'dependency' | 'typescript' | 'build' | 'test';
  environment: Record<string, string>;
}

/**
 * Enhanced build executor with comprehensive error handling
 */
export class BuildExecutor {
  private errorHandler: ErrorHandler;
  private buildContext: BuildContext;
  private buildLog: Array<{
    timestamp: Date;
    level: string;
    message: string;
    package?: string;
  }> = [];

  constructor(projectRoot: string) {
    this.errorHandler = ErrorHandler.getInstance();
    this.buildContext = {
      projectRoot: resolve(projectRoot),
      packages: [],
      buildPhase: 'dependency',
      environment: Object.fromEntries(
        Object.entries(process.env).filter(([, value]) => value !== undefined)
      ) as Record<string, string>,
    };

    this.initializeBuildContext();
  }

  /**
   * Initialize build context by scanning packages
   */
  private initializeBuildContext(): void {
    const packagesDir = join(this.buildContext.projectRoot, 'packages');

    if (!existsSync(packagesDir)) {
      this.log('warning', 'No packages directory found');
      return;
    }

    try {
      const fs = require('node:fs');
      const packageDirs = fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
        .map((dirent: { name: string }) => dirent.name);

      this.buildContext.packages = packageDirs.map((dir: string, index: number) => {
        const packagePath = join(packagesDir, dir);
        const packageJsonPath = join(packagePath, 'package.json');

        const packageInfo: PackageBuildInfo = {
          name: dir,
          path: packagePath,
          hasTypeScript: false,
          hasBuildScript: false,
          dependencies: [],
          buildOrder: index,
        };

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            packageInfo.name = packageJson.name || dir;
            packageInfo.hasTypeScript = existsSync(join(packagePath, 'tsconfig.json'));
            packageInfo.hasBuildScript = !!packageJson.scripts?.build;
            packageInfo.dependencies = Object.keys({
              ...packageJson.dependencies,
              ...packageJson.devDependencies,
            });
          } catch (_error) {
            this.log('error', `Failed to parse package.json for ${dir}`, dir);
          }
        }

        return packageInfo;
      });

      // Sort packages by build order (shared first, then others)
      this.buildContext.packages.sort((a, b) => {
        if (a.name.includes('shared')) return -1;
        if (b.name.includes('shared')) return 1;
        return a.name.localeCompare(b.name);
      });

      this.log('info', `Discovered ${this.buildContext.packages.length} packages`);
    } catch (error) {
      this.log(
        'error',
        `Failed to scan packages: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Execute build command with comprehensive error handling
   */
  async executeBuildCommand(config: BuildCommandConfig): Promise<BuildResult> {
    const startTime = performance.now();
    this.log(
      'info',
      `Executing: ${config.command} ${config.args.join(' ')}`,
      this.buildContext.currentPackage
    );

    let attempt = 0;
    const maxRetries = config.retries || 0;

    while (attempt <= maxRetries) {
      try {
        const result = await this.runCommand(config);

        if (result.success) {
          const duration = performance.now() - startTime;
          this.log(
            'success',
            `Command completed successfully in ${Math.round(duration)}ms`,
            this.buildContext.currentPackage
          );
          return { ...result, duration };
        }

        // Handle failure
        if (attempt < maxRetries) {
          attempt++;
          this.log(
            'warning',
            `Command failed, retrying (${attempt}/${maxRetries})`,
            this.buildContext.currentPackage
          );
          await this.delay(1000 * attempt); // Exponential backoff
          continue;
        }

        // Final failure - generate comprehensive error report
        return await this.handleBuildFailure(result, config);
      } catch (error) {
        if (attempt < maxRetries) {
          attempt++;
          this.log(
            'warning',
            `Command error, retrying (${attempt}/${maxRetries}): ${error instanceof Error ? error.message : String(error)}`,
            this.buildContext.currentPackage
          );
          await this.delay(1000 * attempt);
          continue;
        }

        // Final error
        const duration = performance.now() - startTime;
        return {
          success: false,
          exitCode: null,
          duration,
          error: error instanceof Error ? error.message : String(error),
          suggestions: ['Check system requirements and try again'],
        };
      }
    }

    // Should never reach here
    return {
      success: false,
      exitCode: -1,
      duration: performance.now() - startTime,
      error: 'Unexpected error in build execution',
    };
  }

  /**
   * Run individual command
   */
  private async runCommand(config: BuildCommandConfig): Promise<BuildResult> {
    return new Promise((resolve) => {
      const child: ChildProcess = spawn(config.command, config.args, {
        cwd: config.cwd || this.buildContext.projectRoot,
        env: { ...this.buildContext.environment, ...config.env },
        stdio: config.stdio || 'pipe',
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout | null = null;

      // Set up timeout
      if (config.timeout) {
        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          resolve({
            success: false,
            exitCode: null,
            duration: config.timeout!,
            error: `Command timed out after ${config.timeout}ms`,
          });
        }, config.timeout);
      }

      // Capture output
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve({
          success: code === 0,
          exitCode: code,
          duration: 0, // Will be set by caller
          stdout: stdout || undefined,
          stderr: stderr || undefined,
          error: code !== 0 ? stderr || `Command failed with exit code ${code}` : undefined,
        });
      });

      child.on('error', (error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve({
          success: false,
          exitCode: null,
          duration: 0,
          error: error.message,
          stderr: error.message,
        });
      });
    });
  }

  /**
   * Handle build failure with comprehensive error analysis
   */
  private async handleBuildFailure(
    result: BuildResult,
    config: BuildCommandConfig
  ): Promise<BuildResult> {
    const context: BuildErrorContext = {
      package: this.buildContext.currentPackage,
      command: `${config.command} ${config.args.join(' ')}`,
      workingDirectory: config.cwd || this.buildContext.projectRoot,
      environment: { ...this.buildContext.environment, ...config.env },
      exitCode: result.exitCode || undefined,
      stdout: result.stdout,
      stderr: result.stderr,
    };

    // Analyze error type and generate suggestions
    const suggestions: string[] = [];

    // TypeScript compilation errors
    if (result.stderr && this.isTypeScriptError(result.stderr)) {
      const tsErrors = ErrorAnalyzer.parseTypeScriptErrors(result.stderr);
      for (const tsError of tsErrors) {
        const enhancedError = this.errorHandler.handleTypeScriptError(
          new Error(`TypeScript error: ${tsError.code}`),
          tsError
        );
        suggestions.push(...enhancedError.suggestions.map((s) => s.action));
      }
    }

    // Dependency errors
    if (result.stderr && this.isDependencyError(result.stderr)) {
      const depContext = this.analyzeDependencyError(result.stderr);
      const enhancedError = this.errorHandler.handleDependencyError(
        new Error('Dependency resolution failed'),
        depContext
      );
      suggestions.push(...enhancedError.suggestions.map((s) => s.action));
    }

    // Build script errors
    const buildError = new Error(result.error || 'Build command failed');
    const enhancedError = this.errorHandler.handleBuildError(buildError, context);
    suggestions.push(...enhancedError.suggestions.map((s) => s.action));

    // Log the enhanced error
    EnhancedLogger.logError(enhancedError);

    return {
      ...result,
      suggestions: [...new Set(suggestions)], // Remove duplicates
    };
  }

  /**
   * Check if error is TypeScript-related
   */
  private isTypeScriptError(stderr: string): boolean {
    return (
      stderr.includes('TS') &&
      (stderr.includes('error TS') || stderr.includes('.ts(') || stderr.includes('TypeScript'))
    );
  }

  /**
   * Check if error is dependency-related
   */
  private isDependencyError(stderr: string): boolean {
    return (
      stderr.includes('npm ERR!') ||
      stderr.includes('ERESOLVE') ||
      stderr.includes('peer dep') ||
      stderr.includes('ENOENT') ||
      stderr.includes('MODULE_NOT_FOUND')
    );
  }

  /**
   * Analyze dependency error details
   */
  private analyzeDependencyError(stderr: string): DependencyErrorContext {
    const context: DependencyErrorContext = {};

    // Extract package name from error
    const packageMatch = stderr.match(/(?:package|module)\s+['"]([^'"]+)['"]/i);
    if (packageMatch) {
      context.package = packageMatch[1];
    }

    // Extract peer dependency issues
    const peerMatch = stderr.match(/peer dep missing:\s*([^,\n]+)/gi);
    if (peerMatch) {
      context.missingPeers = peerMatch.map((match) =>
        match.replace(/peer dep missing:\s*/i, '').trim()
      );
    }

    // Extract version conflicts
    const conflictMatch = stderr.match(/conflicting peer dependency:\s*([^,\n]+)/gi);
    if (conflictMatch) {
      context.conflictsWith = conflictMatch.map((match) =>
        match.replace(/conflicting peer dependency:\s*/i, '').trim()
      );
    }

    return context;
  }

  /**
   * Build all packages in dependency order
   */
  async buildAllPackages(): Promise<{
    success: boolean;
    results: Record<string, BuildResult>;
  }> {
    const results: Record<string, BuildResult> = {};
    let overallSuccess = true;

    EnhancedLogger.logInfo('Starting build process for all packages');

    // Phase 1: Check dependencies (skip install if already present)
    this.buildContext.buildPhase = 'dependency';
    EnhancedLogger.logInfo('Phase 1: Checking dependencies');

    const nodeModulesExists = existsSync(join(this.buildContext.projectRoot, 'node_modules'));

    if (!nodeModulesExists) {
      EnhancedLogger.logInfo('Installing dependencies...');
      const installResult = await this.executeBuildCommand({
        command: 'bun',
        args: ['install'],
        timeout: 300000, // 5 minutes
        retries: 1,
      });

      if (!installResult.success) {
        EnhancedLogger.logError({
          id: 'INSTALL_FAILED',
          category: ErrorCategory.DEPENDENCY,
          severity: ErrorSeverity.CRITICAL,
          title: 'Dependency Installation Failed',
          message: 'Failed to install project dependencies',
          suggestions: [
            {
              action: 'Clear node_modules and try again',
              description: 'Remove corrupted dependencies',
              automated: true,
            },
            {
              action: 'Check network connectivity',
              description: 'Ensure internet access for package downloads',
              automated: false,
            },
          ],
          timestamp: new Date(),
        });
        return { success: false, results: { install: installResult } };
      }
    } else {
      EnhancedLogger.logInfo('Dependencies already installed, skipping install phase');
    }

    // Phase 2: Build packages in order
    this.buildContext.buildPhase = 'build';
    EnhancedLogger.logInfo('Phase 2: Building packages');

    for (const packageInfo of this.buildContext.packages) {
      this.buildContext.currentPackage = packageInfo.name;

      if (!packageInfo.hasBuildScript) {
        EnhancedLogger.logWarning(`Skipping ${packageInfo.name} - no build script`);
        continue;
      }

      EnhancedLogger.logInfo(`Building package: ${packageInfo.name}`);

      // Increase timeout for frontend packages which can take longer to build
      const timeout = packageInfo.name.includes('frontend') ? 600000 : 300000; // 10 minutes for frontend, 5 for others

      const buildResult = await this.executeBuildCommand({
        command: 'npm',
        args: ['run', 'build'],
        cwd: packageInfo.path,
        timeout,
        retries: 1,
      });

      results[packageInfo.name] = buildResult;

      if (!buildResult.success) {
        overallSuccess = false;
        EnhancedLogger.logError({
          id: `BUILD_FAILED_${packageInfo.name.toUpperCase()}`,
          category: ErrorCategory.BUILD,
          severity: ErrorSeverity.HIGH,
          title: `Package Build Failed: ${packageInfo.name}`,
          message: `Failed to build package ${packageInfo.name}`,
          context: { package: packageInfo.name, path: packageInfo.path },
          suggestions:
            buildResult.suggestions?.map((s) => ({
              action: s,
              description: s,
              automated: false,
            })) || [],
          timestamp: new Date(),
        });

        // Stop on critical package failures (like shared)
        if (packageInfo.name.includes('shared')) {
          EnhancedLogger.logError({
            id: 'CRITICAL_PACKAGE_FAILED',
            category: ErrorCategory.BUILD,
            severity: ErrorSeverity.CRITICAL,
            title: 'Critical Package Build Failed',
            message: `Critical package ${packageInfo.name} failed to build. Stopping build process.`,
            suggestions: [
              {
                action: 'Fix TypeScript errors in shared package',
                description: 'Resolve compilation issues',
                automated: false,
              },
              {
                action: 'Check shared package dependencies',
                description: 'Ensure all dependencies are installed',
                automated: false,
              },
            ],
            timestamp: new Date(),
          });
          break;
        }
      } else {
        EnhancedLogger.logSuccess(`Successfully built ${packageInfo.name}`);
      }
    }

    // Phase 3: Generate build report
    await this.generateBuildReport(results, overallSuccess);

    return { success: overallSuccess, results };
  }

  /**
   * Generate comprehensive build report
   */
  private async generateBuildReport(
    results: Record<string, BuildResult>,
    success: boolean
  ): Promise<void> {
    const reportPath = join(this.buildContext.projectRoot, 'build-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      success,
      duration: Object.values(results).reduce((sum, result) => sum + result.duration, 0),
      packages: this.buildContext.packages.length,
      results,
      buildLog: this.buildLog,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
      },
      suggestions: success ? [] : this.generateRecoverySuggestions(results),
    };

    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      EnhancedLogger.logInfo(`Build report saved to: ${reportPath}`);
    } catch (error) {
      EnhancedLogger.logWarning(
        `Failed to save build report: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Print summary
    this.printBuildSummary(results, success);
  }

  /**
   * Generate recovery suggestions based on build results
   */
  private generateRecoverySuggestions(results: Record<string, BuildResult>): string[] {
    const suggestions: string[] = [];
    const failedPackages = Object.entries(results).filter(([, result]) => !result.success);

    if (failedPackages.length > 0) {
      suggestions.push('Review failed package build logs for specific errors');
      suggestions.push('Run `bun install --force` to refresh dependencies');
      suggestions.push('Check TypeScript configuration in failed packages');
    }

    // Check for common patterns
    const hasTypeScriptErrors = failedPackages.some(
      ([, result]) => result.stderr?.includes('TS') || result.error?.includes('TypeScript')
    );

    if (hasTypeScriptErrors) {
      suggestions.push('Fix TypeScript compilation errors before proceeding');
      suggestions.push('Update type definitions and imports');
    }

    const hasDependencyErrors = failedPackages.some(
      ([, result]) =>
        result.stderr?.includes('MODULE_NOT_FOUND') || result.stderr?.includes('ERESOLVE')
    );

    if (hasDependencyErrors) {
      suggestions.push('Clear node_modules and reinstall dependencies');
      suggestions.push('Check for version conflicts in package.json files');
    }

    return suggestions;
  }

  /**
   * Print build summary to console
   */
  private printBuildSummary(results: Record<string, BuildResult>, success: boolean): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log('                    BUILD SUMMARY');
    console.log('='.repeat(60));

    const totalPackages = Object.keys(results).length;
    const successfulPackages = Object.values(results).filter((r) => r.success).length;
    const failedPackages = totalPackages - successfulPackages;

    console.log(`Total Packages: ${totalPackages}`);
    console.log(`Successful: ${successfulPackages} ✅`);
    console.log(`Failed: ${failedPackages} ❌`);

    if (success) {
      EnhancedLogger.logSuccess('🎉 All packages built successfully!');
    } else {
      EnhancedLogger.logError({
        id: 'BUILD_SUMMARY_FAILED',
        category: ErrorCategory.BUILD,
        severity: ErrorSeverity.HIGH,
        title: 'Build Process Failed',
        message: `${failedPackages} out of ${totalPackages} packages failed to build`,
        suggestions: [
          {
            action: 'Review build report for detailed error information',
            description: 'Check build-report.json',
            automated: false,
          },
          {
            action: 'Fix failed packages individually',
            description: 'Address specific package issues',
            automated: false,
          },
        ],
        timestamp: new Date(),
      });
    }

    console.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Validate build environment
   */
  async validateBuildEnvironment(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0], 10);

    if (majorVersion < 18) {
      issues.push(`Node.js version ${nodeVersion} is below minimum required (18.0.0)`);
    }

    // Check for required commands
    const requiredCommands = ['bun', 'node'];
    for (const cmd of requiredCommands) {
      try {
        await this.runCommand({
          command: cmd,
          args: ['--version'],
          timeout: 5000,
        });
      } catch {
        issues.push(`Required command '${cmd}' is not available`);
      }
    }

    // Check workspace structure
    if (!existsSync(join(this.buildContext.projectRoot, 'package.json'))) {
      issues.push('Root package.json not found');
    }

    if (!existsSync(join(this.buildContext.projectRoot, 'packages'))) {
      issues.push('Packages directory not found');
    }

    // Check TypeScript installation
    const tsConfigExists = existsSync(join(this.buildContext.projectRoot, 'tsconfig.json'));
    if (!tsConfigExists) {
      issues.push('Root tsconfig.json not found');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Utility method for logging
   */
  private log(
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    packageName?: string
  ): void {
    this.buildLog.push({
      timestamp: new Date(),
      level,
      message,
      package: packageName,
    });

    switch (level) {
      case 'info':
        EnhancedLogger.logInfo(message);
        break;
      case 'warning':
        EnhancedLogger.logWarning(message);
        break;
      case 'error':
        EnhancedLogger.logError({
          id: 'BUILD_LOG_ERROR',
          category: ErrorCategory.BUILD,
          severity: ErrorSeverity.MEDIUM,
          title: 'Build Log Error',
          message,
          context: { package: packageName },
          suggestions: [],
          timestamp: new Date(),
        });
        break;
      case 'success':
        EnhancedLogger.logSuccess(message);
        break;
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Utility function to create and run build executor
 */
export async function runBuildProcess(projectRoot: string = process.cwd()): Promise<boolean> {
  const executor = new BuildExecutor(projectRoot);

  // Validate environment first
  const validation = await executor.validateBuildEnvironment();
  if (!validation.valid) {
    EnhancedLogger.logError({
      id: 'ENVIRONMENT_VALIDATION_FAILED',
      category: ErrorCategory.BUILD,
      severity: ErrorSeverity.CRITICAL,
      title: 'Build Environment Validation Failed',
      message: 'Build environment has issues that must be resolved',
      context: { issues: validation.issues },
      suggestions: validation.issues.map((issue) => ({
        action: `Resolve: ${issue}`,
        description: issue,
        automated: false,
      })),
      timestamp: new Date(),
    });
    return false;
  }

  // Run build process
  const result = await executor.buildAllPackages();
  return result.success;
}
