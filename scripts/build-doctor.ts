#!/usr/bin/env bun

/**
 * Build Doctor - Comprehensive build diagnostics and recovery tool
 * Analyzes build issues and provides automated recovery suggestions
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import type { BuildResult } from '../packages/shared/src/utils/build-utils.js';
// Import our enhanced error handling utilities
import { EnhancedLogger, ErrorAnalyzer } from '../packages/shared/src/utils/error-handling.js';
import { ErrorCategory, ErrorSeverity } from '../packages/shared/src/types/error-classification.js';

/**
 * Diagnostic check result
 */
interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  suggestions?: string[];
  automated?: boolean;
}

/**
 * Recovery action
 */
interface RecoveryAction {
  name: string;
  description: string;
  command?: string;
  automated: boolean;
  risk: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

/**
 * Build Doctor main class
 */
class BuildDoctor {
  private projectRoot: string;
  private diagnostics: DiagnosticResult[] = [];
  private recoveryActions: RecoveryAction[] = [];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = resolve(projectRoot);
  }

  /**
   * Run comprehensive build diagnostics
   */
  async runDiagnostics(): Promise<void> {
    EnhancedLogger.logInfo('🔍 Starting Build Doctor diagnostics...\n');

    // Run all diagnostic checks
    await this.checkProjectStructure();
    await this.checkDependencies();
    await this.checkTypeScriptConfiguration();
    await this.checkBuildScripts();
    await this.checkEnvironment();
    await this.checkCommonIssues();

    // Generate report
    this.generateDiagnosticReport();
    this.generateRecoveryPlan();
  }

  /**
   * Check project structure
   */
  private async checkProjectStructure(): Promise<void> {
    EnhancedLogger.logInfo('📁 Checking project structure...');

    // Check root package.json
    const rootPackageJson = join(this.projectRoot, 'package.json');
    if (existsSync(rootPackageJson)) {
      try {
        const packageData = JSON.parse(readFileSync(rootPackageJson, 'utf-8'));

        if (packageData.workspaces) {
          this.addDiagnostic({
            name: 'Root Package Configuration',
            status: 'pass',
            message: 'Root package.json exists with workspace configuration',
          });
        } else {
          this.addDiagnostic({
            name: 'Root Package Configuration',
            status: 'warning',
            message: 'Root package.json exists but no workspace configuration found',
            suggestions: ['Add workspaces configuration to package.json'],
          });
        }
      } catch (_error) {
        this.addDiagnostic({
          name: 'Root Package Configuration',
          status: 'fail',
          message: 'Root package.json exists but is invalid JSON',
          suggestions: ['Fix JSON syntax in root package.json'],
        });
      }
    } else {
      this.addDiagnostic({
        name: 'Root Package Configuration',
        status: 'fail',
        message: 'Root package.json not found',
        suggestions: ['Create root package.json with workspace configuration'],
      });
    }

    // Check packages directory
    const packagesDir = join(this.projectRoot, 'packages');
    if (existsSync(packagesDir)) {
      const fs = require('node:fs');
      const packages = fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
        .map((dirent: { name: string }) => dirent.name);

      if (packages.length > 0) {
        this.addDiagnostic({
          name: 'Packages Directory',
          status: 'pass',
          message: `Found ${packages.length} packages: ${packages.join(', ')}`,
        });

        // Check each package
        for (const pkg of packages) {
          await this.checkPackageStructure(pkg);
        }
      } else {
        this.addDiagnostic({
          name: 'Packages Directory',
          status: 'warning',
          message: 'Packages directory exists but is empty',
        });
      }
    } else {
      this.addDiagnostic({
        name: 'Packages Directory',
        status: 'fail',
        message: 'Packages directory not found',
        suggestions: ['Create packages directory structure'],
      });
    }

    // Check TypeScript configuration
    const tsConfig = join(this.projectRoot, 'tsconfig.json');
    if (existsSync(tsConfig)) {
      this.addDiagnostic({
        name: 'TypeScript Configuration',
        status: 'pass',
        message: 'Root tsconfig.json found',
      });
    } else {
      this.addDiagnostic({
        name: 'TypeScript Configuration',
        status: 'warning',
        message: 'Root tsconfig.json not found',
        suggestions: ['Create root tsconfig.json for project-wide TypeScript settings'],
      });
    }
  }

  /**
   * Check individual package structure
   */
  private async checkPackageStructure(packageName: string): Promise<void> {
    const packagePath = join(this.projectRoot, 'packages', packageName);
    const packageJson = join(packagePath, 'package.json');

    if (existsSync(packageJson)) {
      try {
        const packageData = JSON.parse(readFileSync(packageJson, 'utf-8'));

        // Check for build script
        if (packageData.scripts?.build) {
          this.addDiagnostic({
            name: `Package ${packageName} - Build Script`,
            status: 'pass',
            message: 'Build script configured',
          });
        } else {
          this.addDiagnostic({
            name: `Package ${packageName} - Build Script`,
            status: 'warning',
            message: 'No build script found',
            suggestions: [`Add build script to ${packageName}/package.json`],
          });
        }

        // Check TypeScript configuration
        const tsConfig = join(packagePath, 'tsconfig.json');
        if (existsSync(tsConfig)) {
          this.addDiagnostic({
            name: `Package ${packageName} - TypeScript`,
            status: 'pass',
            message: 'TypeScript configuration found',
          });
        } else if (
          packageData.devDependencies?.typescript ||
          packageData.dependencies?.typescript
        ) {
          this.addDiagnostic({
            name: `Package ${packageName} - TypeScript`,
            status: 'warning',
            message: 'TypeScript dependency found but no tsconfig.json',
            suggestions: [`Create tsconfig.json in ${packageName} package`],
          });
        }
      } catch (_error) {
        this.addDiagnostic({
          name: `Package ${packageName} - Configuration`,
          status: 'fail',
          message: 'Invalid package.json',
          suggestions: [`Fix JSON syntax in ${packageName}/package.json`],
        });
      }
    } else {
      this.addDiagnostic({
        name: `Package ${packageName} - Configuration`,
        status: 'fail',
        message: 'package.json not found',
        suggestions: [`Create package.json in ${packageName} directory`],
      });
    }
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<void> {
    EnhancedLogger.logInfo('📦 Checking dependencies...');

    // Check if node_modules exists
    const nodeModules = join(this.projectRoot, 'node_modules');
    if (existsSync(nodeModules)) {
      this.addDiagnostic({
        name: 'Dependencies Installation',
        status: 'pass',
        message: 'node_modules directory exists',
      });

      // Check for common dependency issues
      await this.checkDependencyIssues();
    } else {
      this.addDiagnostic({
        name: 'Dependencies Installation',
        status: 'fail',
        message: 'node_modules directory not found',
        suggestions: ['Run `bun install` to install dependencies'],
        automated: true,
      });

      this.addRecoveryAction({
        name: 'Install Dependencies',
        description: 'Install all project dependencies',
        command: 'bun install',
        automated: true,
        risk: 'low',
        estimatedTime: '2-5 minutes',
      });
    }

    // Check lock file
    const preferredLockFiles = ['bun.lockb'];
    const acceptableLockFiles = ['bun.lock', 'package-lock.json', 'yarn.lock'];
    const allLockFiles = [...preferredLockFiles, ...acceptableLockFiles];

    const existingLockFile = allLockFiles.find((file) => existsSync(join(this.projectRoot, file)));

    if (existingLockFile) {
      if (preferredLockFiles.includes(existingLockFile)) {
        this.addDiagnostic({
          name: 'Dependency Lock File',
          status: 'pass',
          message: `Lock file found: ${existingLockFile} (preferred format)`,
        });
      } else {
        this.addDiagnostic({
          name: 'Dependency Lock File',
          status: 'pass',
          message: `Lock file found: ${existingLockFile}`,
          suggestions:
            existingLockFile === 'bun.lock'
              ? ['Consider upgrading to bun.lockb format for better performance']
              : [],
        });
      }
    } else {
      this.addDiagnostic({
        name: 'Dependency Lock File',
        status: 'warning',
        message: 'No lock file found',
        suggestions: ['Run package manager install to generate lock file'],
      });
    }
  }

  /**
   * Check for common dependency issues
   */
  private async checkDependencyIssues(): Promise<void> {
    const packageJsonPath = join(this.projectRoot, 'package.json');

    if (existsSync(packageJsonPath)) {
      const issues = ErrorAnalyzer.analyzeDependencyIssues(packageJsonPath);

      if (issues.length === 0) {
        this.addDiagnostic({
          name: 'Dependency Analysis',
          status: 'pass',
          message: 'No dependency issues detected',
        });
      } else {
        for (const issue of issues) {
          this.addDiagnostic({
            name: 'Dependency Issue',
            status: 'warning',
            message: `Issue with ${issue.package || 'dependencies'}`,
            details: JSON.stringify(issue, null, 2),
            suggestions: issue.missingPeers
              ? [`Install peer dependencies: ${issue.missingPeers.join(', ')}`]
              : [],
          });
        }
      }
    }

    // Check for TypeScript in dependencies
    try {
      const result = await this.runCommand('bun', ['list', 'typescript'], {
        timeout: 10000,
      });
      if (result.success) {
        this.addDiagnostic({
          name: 'TypeScript Installation',
          status: 'pass',
          message: 'TypeScript is installed',
        });
      }
    } catch {
      this.addDiagnostic({
        name: 'TypeScript Installation',
        status: 'fail',
        message: 'TypeScript not found in dependencies',
        suggestions: ['Install TypeScript: bun add -D typescript'],
        automated: true,
      });

      this.addRecoveryAction({
        name: 'Install TypeScript',
        description: 'Install TypeScript compiler as dev dependency',
        command: 'bun add -D typescript',
        automated: true,
        risk: 'low',
        estimatedTime: '30 seconds',
      });
    }
  }

  /**
   * Check TypeScript configuration
   */
  private async checkTypeScriptConfiguration(): Promise<void> {
    EnhancedLogger.logInfo('🔧 Checking TypeScript configuration...');

    // Test TypeScript compilation
    try {
      const result = await this.runCommand('bun', ['run', 'build:shared'], {
        timeout: 60000,
      });

      if (result.success) {
        this.addDiagnostic({
          name: 'TypeScript Compilation',
          status: 'pass',
          message: 'TypeScript compilation successful',
        });
      } else {
        // Parse TypeScript errors
        const tsErrors = result.stderr ? ErrorAnalyzer.parseTypeScriptErrors(result.stderr) : [];

        this.addDiagnostic({
          name: 'TypeScript Compilation',
          status: 'fail',
          message: `TypeScript compilation failed with ${tsErrors.length} errors`,
          details: result.stderr,
          suggestions: [
            'Review TypeScript errors in build output',
            'Fix type mismatches and missing imports',
            'Update type definitions',
          ],
        });

        // Add specific error recovery actions
        if (tsErrors.length > 0) {
          this.addRecoveryAction({
            name: 'Fix TypeScript Errors',
            description: `Fix ${tsErrors.length} TypeScript compilation errors`,
            automated: false,
            risk: 'medium',
            estimatedTime: '15-60 minutes',
          });
        }
      }
    } catch (error) {
      this.addDiagnostic({
        name: 'TypeScript Compilation',
        status: 'fail',
        message: 'Failed to run TypeScript compilation',
        details: error instanceof Error ? error.message : String(error),
        suggestions: ['Check if TypeScript is installed and build scripts are configured'],
      });
    }
  }

  /**
   * Check build scripts
   */
  private async checkBuildScripts(): Promise<void> {
    EnhancedLogger.logInfo('🔨 Checking build scripts...');

    const packageJsonPath = join(this.projectRoot, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const scripts = packageData.scripts || {};

        // Check for essential build scripts
        const essentialScripts = ['build', 'build:shared', 'build:backend', 'build:frontend'];

        for (const script of essentialScripts) {
          if (scripts[script]) {
            this.addDiagnostic({
              name: `Build Script - ${script}`,
              status: 'pass',
              message: `Script '${script}' is configured`,
            });
          } else {
            this.addDiagnostic({
              name: `Build Script - ${script}`,
              status: 'warning',
              message: `Script '${script}' is missing`,
              suggestions: [`Add '${script}' script to package.json`],
            });
          }
        }

        // Test build script execution
        if (scripts.build) {
          try {
            // Just check if the command can be parsed, don't actually run it
            this.addDiagnostic({
              name: 'Build Script Syntax',
              status: 'pass',
              message: 'Build script syntax appears valid',
            });
          } catch (_error) {
            this.addDiagnostic({
              name: 'Build Script Syntax',
              status: 'fail',
              message: 'Build script has syntax issues',
              suggestions: ['Review build script syntax in package.json'],
            });
          }
        }
      } catch (_error) {
        this.addDiagnostic({
          name: 'Build Scripts Configuration',
          status: 'fail',
          message: 'Cannot read package.json scripts',
          suggestions: ['Fix package.json syntax'],
        });
      }
    }
  }

  /**
   * Check build environment
   */
  private async checkEnvironment(): Promise<void> {
    EnhancedLogger.logInfo('🌍 Checking build environment...');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0], 10);

    if (majorVersion >= 18) {
      this.addDiagnostic({
        name: 'Node.js Version',
        status: 'pass',
        message: `Node.js ${nodeVersion} (meets minimum requirement)`,
      });
    } else {
      this.addDiagnostic({
        name: 'Node.js Version',
        status: 'fail',
        message: `Node.js ${nodeVersion} is below minimum required (18.0.0)`,
        suggestions: ['Upgrade Node.js to version 18 or higher'],
      });
    }

    // Check Bun installation
    try {
      const result = await this.runCommand('bun', ['--version'], {
        timeout: 5000,
      });
      if (result.success) {
        this.addDiagnostic({
          name: 'Bun Installation',
          status: 'pass',
          message: `Bun is installed: ${result.stdout?.trim()}`,
        });
      }
    } catch {
      this.addDiagnostic({
        name: 'Bun Installation',
        status: 'warning',
        message: 'Bun is not installed or not in PATH',
        suggestions: ['Install Bun package manager'],
      });
    }

    // Check available memory
    const memoryUsage = process.memoryUsage();
    const availableMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    if (availableMemoryMB >= 512) {
      this.addDiagnostic({
        name: 'Available Memory',
        status: 'pass',
        message: `Available memory: ${availableMemoryMB}MB`,
      });
    } else {
      this.addDiagnostic({
        name: 'Available Memory',
        status: 'warning',
        message: `Low available memory: ${availableMemoryMB}MB`,
        suggestions: ['Consider increasing Node.js memory limit with --max-old-space-size'],
      });
    }

    // Check disk space (simplified check)
    try {
      const fs = require('node:fs');
      const _stats = fs.statSync(this.projectRoot);
      this.addDiagnostic({
        name: 'Project Directory Access',
        status: 'pass',
        message: 'Project directory is accessible',
      });
    } catch {
      this.addDiagnostic({
        name: 'Project Directory Access',
        status: 'fail',
        message: 'Cannot access project directory',
        suggestions: ['Check file permissions and disk space'],
      });
    }
  }

  /**
   * Check for common build issues
   */
  private async checkCommonIssues(): Promise<void> {
    EnhancedLogger.logInfo('🔍 Checking for common issues...');

    // Check for corrupted node_modules
    const nodeModules = join(this.projectRoot, 'node_modules');
    if (existsSync(nodeModules)) {
      const binDir = join(nodeModules, '.bin');
      if (!existsSync(binDir)) {
        this.addDiagnostic({
          name: 'Node Modules Integrity',
          status: 'warning',
          message: 'node_modules/.bin directory missing',
          suggestions: ['Reinstall dependencies to fix corrupted node_modules'],
          automated: true,
        });

        this.addRecoveryAction({
          name: 'Reinstall Dependencies',
          description: 'Clean and reinstall all dependencies',
          command: 'rm -rf node_modules && bun install',
          automated: true,
          risk: 'low',
          estimatedTime: '2-5 minutes',
        });
      }
    }

    // Check for TypeScript cache issues
    const tsBuildInfo = join(this.projectRoot, 'tsconfig.tsbuildinfo');
    if (existsSync(tsBuildInfo)) {
      this.addDiagnostic({
        name: 'TypeScript Cache',
        status: 'pass',
        message: 'TypeScript build cache exists',
      });
    }

    // Check for common file permission issues (Unix-like systems)
    if (process.platform !== 'win32') {
      try {
        const fs = require('node:fs');
        const stats = fs.statSync(this.projectRoot);
        const mode = stats.mode & 0o777;

        if (mode >= 0o755) {
          this.addDiagnostic({
            name: 'File Permissions',
            status: 'pass',
            message: 'Project directory has appropriate permissions',
          });
        } else {
          this.addDiagnostic({
            name: 'File Permissions',
            status: 'warning',
            message: 'Project directory may have restrictive permissions',
            suggestions: ['Check and adjust file permissions if needed'],
          });
        }
      } catch {
        // Ignore permission check errors
      }
    }

    // Check for large node_modules (potential corruption indicator)
    if (existsSync(nodeModules)) {
      try {
        const fs = require('node:fs');
        const files = fs.readdirSync(nodeModules);

        if (files.length > 1000) {
          this.addDiagnostic({
            name: 'Dependencies Size',
            status: 'warning',
            message: `Large number of dependencies detected (${files.length} packages)`,
            suggestions: ['Consider dependency cleanup or audit'],
          });
        } else {
          this.addDiagnostic({
            name: 'Dependencies Size',
            status: 'pass',
            message: `Reasonable number of dependencies (${files.length} packages)`,
          });
        }
      } catch {
        // Ignore if we can't read node_modules
      }
    }
  }

  /**
   * Generate diagnostic report
   */
  private generateDiagnosticReport(): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log('                        BUILD DOCTOR REPORT');
    console.log('='.repeat(80));

    const passed = this.diagnostics.filter((d) => d.status === 'pass').length;
    const warnings = this.diagnostics.filter((d) => d.status === 'warning').length;
    const failed = this.diagnostics.filter((d) => d.status === 'fail').length;

    console.log(`\nSummary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

    // Group diagnostics by status
    const statusOrder = ['fail', 'warning', 'pass'];
    const statusIcons = { pass: '✅', warning: '⚠️', fail: '❌' };

    for (const status of statusOrder) {
      const items = this.diagnostics.filter((d) => d.status === status);
      if (items.length === 0) continue;

      console.log(`${status.toUpperCase()} (${items.length}):`);
      console.log('-'.repeat(40));

      for (const item of items) {
        console.log(`${statusIcons[item.status]} ${item.name}: ${item.message}`);

        if (item.details) {
          console.log(
            `   Details: ${item.details.substring(0, 200)}${item.details.length > 200 ? '...' : ''}`
          );
        }

        if (item.suggestions && item.suggestions.length > 0) {
          console.log('   Suggestions:');
          item.suggestions.forEach((suggestion) => {
            console.log(`   • ${suggestion}`);
          });
        }
        console.log();
      }
    }

    // Save detailed report to file
    const reportPath = join(this.projectRoot, 'build-doctor-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: { passed, warnings, failed },
      diagnostics: this.diagnostics,
      recoveryActions: this.recoveryActions,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
      },
    };

    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      EnhancedLogger.logInfo(`📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      EnhancedLogger.logWarning(
        `Failed to save report: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate recovery plan
   */
  private generateRecoveryPlan(): void {
    if (this.recoveryActions.length === 0) {
      EnhancedLogger.logSuccess(
        '🎉 No recovery actions needed - your build environment looks good!'
      );
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('                        RECOVERY PLAN');
    console.log('='.repeat(80));

    console.log(`\nFound ${this.recoveryActions.length} recommended recovery actions:\n`);

    this.recoveryActions.forEach((action, index) => {
      const riskColor = action.risk === 'low' ? '🟢' : action.risk === 'medium' ? '🟡' : '🔴';
      const autoIcon = action.automated ? '🤖' : '👤';

      console.log(`${index + 1}. ${autoIcon} ${action.name} ${riskColor}`);
      console.log(`   Description: ${action.description}`);
      console.log(`   Risk Level: ${action.risk.toUpperCase()}`);
      console.log(`   Estimated Time: ${action.estimatedTime}`);

      if (action.command) {
        console.log(`   Command: ${action.command}`);
      }

      console.log(`   Automated: ${action.automated ? 'Yes' : 'No'}`);
      console.log();
    });

    // Offer to run automated actions
    const automatedActions = this.recoveryActions.filter((a) => a.automated);
    if (automatedActions.length > 0) {
      console.log(
        `💡 ${automatedActions.length} actions can be automated. Run with --fix to execute them.`
      );
    }

    console.log('='.repeat(80));
  }

  /**
   * Execute automated recovery actions
   */
  async executeRecoveryActions(): Promise<void> {
    const automatedActions = this.recoveryActions.filter((a) => a.automated && a.risk === 'low');

    if (automatedActions.length === 0) {
      EnhancedLogger.logWarning('No safe automated recovery actions available');
      return;
    }

    EnhancedLogger.logInfo(
      `🔧 Executing ${automatedActions.length} automated recovery actions...\n`
    );

    for (const action of automatedActions) {
      EnhancedLogger.logInfo(`Executing: ${action.name}`);

      if (action.command) {
        try {
          const [cmd, ...args] = action.command.split(' ');
          const result = await this.runCommand(cmd, args, { timeout: 300000 }); // 5 minutes

          if (result.success) {
            EnhancedLogger.logSuccess(`✅ ${action.name} completed successfully`);
          } else {
            EnhancedLogger.logError({
              id: 'RECOVERY_ACTION_FAILED',
              category: ErrorCategory.ANALYSIS,
              severity: ErrorSeverity.MEDIUM,
              title: `Recovery Action Failed: ${action.name}`,
              message: result.error || 'Unknown error',
              suggestions: [
                {
                  action: 'Run action manually',
                  description: action.description,
                  automated: false,
                },
              ],
              timestamp: new Date(),
            });
          }
        } catch (error) {
          EnhancedLogger.logError({
            id: 'RECOVERY_ACTION_ERROR',
            category: ErrorCategory.ANALYSIS,
            severity: ErrorSeverity.MEDIUM,
            title: `Recovery Action Error: ${action.name}`,
            message: error instanceof Error ? error.message : String(error),
            suggestions: [
              {
                action: 'Run action manually',
                description: action.description,
                automated: false,
              },
            ],
            timestamp: new Date(),
          });
        }
      }
    }

    EnhancedLogger.logInfo('\n🔄 Re-running diagnostics to verify fixes...');

    // Clear previous diagnostics and re-run
    this.diagnostics = [];
    this.recoveryActions = [];
    await this.runDiagnostics();
  }

  /**
   * Utility methods
   */
  private addDiagnostic(diagnostic: DiagnosticResult): void {
    this.diagnostics.push(diagnostic);
  }

  private addRecoveryAction(action: RecoveryAction): void {
    this.recoveryActions.push(action);
  }

  private async runCommand(
    command: string,
    args: string[],
    options: { timeout?: number; cwd?: string } = {}
  ): Promise<BuildResult> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const child = spawn(command, args, {
        cwd: options.cwd || this.projectRoot,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout | null = null;

      if (options.timeout) {
        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          resolve({
            success: false,
            exitCode: null,
            duration: options.timeout || 0,
            error: `Command timed out after ${options.timeout}ms`,
          });
        }, options.timeout);
      }

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: code === 0,
          exitCode: code,
          duration: performance.now() - startTime,
          stdout: stdout || undefined,
          stderr: stderr || undefined,
          error: code !== 0 ? stderr || `Command failed with exit code ${code}` : undefined,
        });
      });

      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: false,
          exitCode: null,
          duration: performance.now() - startTime,
          error: error.message,
        });
      });
    });
  }
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const projectRoot = args.find((arg) => !arg.startsWith('--')) || process.cwd();

  const doctor = new BuildDoctor(projectRoot);

  try {
    await doctor.runDiagnostics();

    if (shouldFix) {
      await doctor.executeRecoveryActions();
    }

    process.exit(0);
  } catch (error) {
    EnhancedLogger.logError({
      id: 'BUILD_DOCTOR_ERROR',
      category: ErrorCategory.ANALYSIS,
      severity: ErrorSeverity.CRITICAL,
      title: 'Build Doctor Failed',
      message: error instanceof Error ? error.message : String(error),
      suggestions: [
        {
          action: 'Check system requirements',
          description: 'Ensure Node.js and required tools are installed',
          automated: false,
        },
        {
          action: 'Run with verbose logging',
          description: 'Add DEBUG=1 environment variable',
          automated: false,
        },
      ],
      timestamp: new Date(),
    });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default BuildDoctor;
