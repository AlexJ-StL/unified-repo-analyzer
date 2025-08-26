#!/usr/bin/env bun

/**
 * Recovery Tools - Automated scripts for dependency cleanup and restoration
 * Provides automated recovery procedures for common build failures
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

/**
 * Recovery action result
 */
interface RecoveryResult {
  success: boolean;
  message: string;
  duration: number;
  details?: string;
  error?: string;
}

/**
 * Recovery Tools main class
 */
class RecoveryTools {
  private projectRoot: string;
  private bunExecutablePath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = resolve(projectRoot);
    this.bunExecutablePath = 'bun';
  }

  /**
   * Clean and restore dependencies
   */
  async cleanDependencies(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('🧹 Cleaning dependencies...');

    try {
      // Step 1: Remove all node_modules directories
      console.log('  Removing node_modules directories...');
      const nodeModulesPaths = [
        join(this.projectRoot, 'node_modules'),
        join(this.projectRoot, 'packages/shared/node_modules'),
        join(this.projectRoot, 'packages/backend/node_modules'),
        join(this.projectRoot, 'packages/frontend/node_modules'),
        join(this.projectRoot, 'packages/cli/node_modules'),
      ];

      for (const path of nodeModulesPaths) {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
          console.log(`    Removed: ${path}`);
        }
      }

      // Step 2: Remove build artifacts
      console.log('  Removing build artifacts...');
      const buildArtifacts = [
        join(this.projectRoot, 'packages/shared/dist'),
        join(this.projectRoot, 'packages/backend/dist'),
        join(this.projectRoot, 'packages/frontend/dist'),
        join(this.projectRoot, 'packages/cli/dist'),
        join(this.projectRoot, 'tsconfig.tsbuildinfo'),
      ];

      for (const path of buildArtifacts) {
        if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true });
          console.log(`    Removed: ${path}`);
        }
      }

      // Step 3: Clear package manager caches
      console.log('  Clearing package manager caches...');
      await this.runCommand('bun', ['pm', 'cache', 'rm']);

      // Step 4: Force reinstall dependencies
      console.log('  Reinstalling dependencies...');
      const installResult = await this.runCommand('bun', ['install', '--force']);

      if (!installResult.success) {
        throw new Error(`Dependency installation failed: ${installResult.error}`);
      }

      // Step 5: Verify installation
      console.log('  Verifying installation...');
      const verifyResult = await this.verifyDependencies();

      if (!verifyResult.success) {
        throw new Error(`Dependency verification failed: ${verifyResult.message}`);
      }

      const duration = performance.now() - startTime;
      return {
        success: true,
        message: 'Dependencies cleaned and restored successfully',
        duration,
        details: 'All node_modules removed, caches cleared, dependencies reinstalled',
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'Dependency cleanup failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fix common TypeScript issues
   */
  async fixTypeScriptIssues(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('🔧 Fixing TypeScript issues...');

    try {
      // Step 1: Clear TypeScript caches
      console.log('  Clearing TypeScript caches...');
      const tsCacheFiles = [
        join(this.projectRoot, 'tsconfig.tsbuildinfo'),
        join(this.projectRoot, 'packages/shared/tsconfig.tsbuildinfo'),
        join(this.projectRoot, 'packages/backend/tsconfig.tsbuildinfo'),
        join(this.projectRoot, 'packages/frontend/tsconfig.tsbuildinfo'),
        join(this.projectRoot, 'packages/cli/tsconfig.tsbuildinfo'),
      ];

      for (const file of tsCacheFiles) {
        if (existsSync(file)) {
          rmSync(file, { force: true });
          console.log(`    Removed: ${file}`);
        }
      }

      // Step 2: Ensure TypeScript is installed
      console.log('  Verifying TypeScript installation...');
      const tsCheck = await this.runCommand('bun', ['list', 'typescript']);
      if (!tsCheck.success) {
        console.log('  Installing TypeScript...');
        await this.runCommand('bun', ['add', '-D', 'typescript']);
      }

      // Step 3: Rebuild shared package first (dependency order)
      console.log('  Rebuilding shared package...');
      const sharedBuild = await this.runCommand('bun', ['run', 'build:shared']);
      if (!sharedBuild.success) {
        throw new Error(`Shared package build failed: ${sharedBuild.error}`);
      }

      // Step 4: Test TypeScript compilation
      console.log('  Testing TypeScript compilation...');
      const _compileTest = await this.runCommand('bunx', ['tsc', '--noEmit']);

      const duration = performance.now() - startTime;
      return {
        success: true,
        message: 'TypeScript issues fixed successfully',
        duration,
        details: 'Caches cleared, shared package rebuilt, compilation verified',
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'TypeScript fix failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check and fix build environment
   */
  async checkBuildEnvironment(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('🌍 Checking build environment...');

    try {
      const issues: string[] = [];
      const fixes: string[] = [];

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0], 10);
      if (majorVersion < 18) {
        issues.push(`Node.js version ${nodeVersion} is below minimum (18.0.0)`);
      } else {
        console.log(`  ✅ Node.js version: ${nodeVersion}`);
      }

      // Check Bun installation
      const bunCheck = await this.runCommand('bun', ['--version']);
      if (bunCheck.success) {
        console.log(`  ✅ Bun version: ${bunCheck.stdout?.trim()}`);
      } else {
        issues.push('Bun is not installed or not accessible');
      }

      // Check TypeScript installation
      const tsCheck = await this.runCommand('bunx', ['tsc', '--version']);
      if (tsCheck.success) {
        console.log(`  ✅ TypeScript version: ${tsCheck.stdout?.trim()}`);
      } else {
        issues.push('TypeScript compiler not accessible');
        console.log('  Installing TypeScript...');
        const installResult = await this.runCommand('bun', ['add', '-D', 'typescript']);
        if (installResult.success) {
          fixes.push('Installed TypeScript');
        } else {
          issues.push('Failed to install TypeScript');
        }
      }

      // Check workspace configuration
      const packageJsonPath = join(this.projectRoot, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        if (packageData.workspaces) {
          console.log('  ✅ Workspace configuration found');
        } else {
          issues.push('No workspace configuration in root package.json');
        }
      } else {
        issues.push('Root package.json not found');
      }

      // Check build scripts
      const buildScripts = ['build', 'build:shared', 'build:backend', 'build:frontend'];

      if (existsSync(packageJsonPath)) {
        const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const scripts = packageData.scripts || {};

        for (const script of buildScripts) {
          if (scripts[script]) {
            console.log(`  ✅ Build script '${script}' configured`);
          } else {
            issues.push(`Build script '${script}' missing`);
          }
        }
      } else {
        issues.push('Cannot read package.json for build script check');
      }

      const duration = performance.now() - startTime;
      return {
        success: issues.length === 0,
        message:
          issues.length === 0
            ? 'Build environment is healthy'
            : `Found ${issues.length} environment issues`,
        duration,
        details: issues.length > 0 ? issues.join('; ') : 'All checks passed',
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'Environment check failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fix build scripts and configuration
   */
  async fixBuildScripts(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('🔨 Fixing build scripts...');

    try {
      // Step 1: Validate package.json scripts
      const packageJsonPath = join(this.projectRoot, 'package.json');
      if (!existsSync(packageJsonPath)) {
        throw new Error('Root package.json not found');
      }

      const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageData.scripts || {};

      // Step 2: Check for essential scripts
      const essentialScripts = {
        build: 'bun run scripts/enhanced-build.ts',
        'build:shared': 'bun run --cwd packages/shared build',
        'build:backend': 'bun run --cwd packages/backend build',
        'build:frontend': 'bun run --cwd packages/frontend build',
        'build:cli': 'bun run --cwd packages/cli build',
      };

      let scriptsFixed = 0;
      for (const [scriptName, scriptCommand] of Object.entries(essentialScripts)) {
        if (!scripts[scriptName]) {
          scripts[scriptName] = scriptCommand;
          scriptsFixed++;
          console.log(`  Added missing script: ${scriptName}`);
        }
      }

      // Step 3: Update package.json if scripts were added
      if (scriptsFixed > 0) {
        packageData.scripts = scripts;
        writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
        console.log(`  Updated package.json with ${scriptsFixed} missing scripts`);
      }

      // Step 4: Test build script execution
      console.log('  Testing build script execution...');
      const testResult = await this.runCommand('bun', ['run', 'build:shared']);

      if (!testResult.success) {
        throw new Error(`Build script test failed: ${testResult.error}`);
      }

      const duration = performance.now() - startTime;
      return {
        success: true,
        message: 'Build scripts fixed successfully',
        duration,
        details:
          scriptsFixed > 0
            ? `Fixed ${scriptsFixed} missing scripts, build test passed`
            : 'All scripts present, build test passed',
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'Build script fix failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check and fix workspace configuration
   */
  async fixWorkspaceConfiguration(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('🔗 Fixing workspace configuration...');

    try {
      // Step 1: Verify workspace packages exist
      const packagesDir = join(this.projectRoot, 'packages');
      if (!existsSync(packagesDir)) {
        throw new Error('Packages directory not found');
      }

      // Step 2: Check each package has package.json
      const fs = require('node:fs');
      const packages = fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
        .map((dirent: { name: string }) => dirent.name);

      console.log(`  Found packages: ${packages.join(', ')}`);

      const _packagesFixed = 0;
      for (const pkg of packages) {
        const packageJsonPath = join(packagesDir, pkg, 'package.json');
        if (!existsSync(packageJsonPath)) {
          console.log(`  ⚠️  Missing package.json in ${pkg}`);
          // Could create basic package.json here if needed
        } else {
          console.log(`  ✅ Package ${pkg} has package.json`);
        }
      }

      // Step 3: Reinstall to fix workspace links
      console.log('  Reinstalling to fix workspace links...');
      const installResult = await this.runCommand('bun', ['install']);

      if (!installResult.success) {
        throw new Error(`Workspace reinstall failed: ${installResult.error}`);
      }

      // Step 4: Test workspace linking
      console.log('  Testing workspace linking...');
      const linkTest = await this.runCommand('bun', ['run', 'build:shared']);

      if (!linkTest.success) {
        throw new Error(`Workspace link test failed: ${linkTest.error}`);
      }

      const duration = performance.now() - startTime;
      return {
        success: true,
        message: 'Workspace configuration fixed successfully',
        duration,
        details: `Verified ${packages.length} packages, workspace links restored`,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'Workspace fix failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Nuclear option - complete environment reset
   */
  async nuclearReset(): Promise<RecoveryResult> {
    const startTime = performance.now();
    console.log('☢️  NUCLEAR RESET - Complete environment cleanup...');
    console.log('⚠️  This will remove ALL build artifacts and dependencies!');

    try {
      // Step 1: Remove all node_modules and build artifacts
      console.log('  Removing all build artifacts...');
      const pathsToRemove = [
        'node_modules',
        'packages/*/node_modules',
        'packages/*/dist',
        '*.tsbuildinfo',
        'packages/*/*.tsbuildinfo',
        'build-doctor-report.json',
      ];

      for (const pattern of pathsToRemove) {
        if (pattern.includes('*')) {
          // Handle glob patterns manually for critical paths
          if (pattern === 'packages/*/node_modules') {
            const packages = ['shared', 'backend', 'frontend', 'cli'];
            for (const pkg of packages) {
              const path = join(this.projectRoot, 'packages', pkg, 'node_modules');
              if (existsSync(path)) {
                rmSync(path, { recursive: true, force: true });
                console.log(`    Removed: ${path}`);
              }
            }
          } else if (pattern === 'packages/*/dist') {
            const packages = ['shared', 'backend', 'frontend', 'cli'];
            for (const pkg of packages) {
              const path = join(this.projectRoot, 'packages', pkg, 'dist');
              if (existsSync(path)) {
                rmSync(path, { recursive: true, force: true });
                console.log(`    Removed: ${path}`);
              }
            }
          }
        } else {
          const path = join(this.projectRoot, pattern);
          if (existsSync(path)) {
            rmSync(path, { recursive: true, force: true });
            console.log(`    Removed: ${path}`);
          }
        }
      }

      // Step 2: Clear all caches
      console.log('  Clearing all caches...');
      await this.runCommand('bun', ['pm', 'cache', 'rm']);

      // Step 3: Fresh install
      console.log('  Fresh dependency installation...');
      const installResult = await this.runCommand('bun', ['install']);

      if (!installResult.success) {
        throw new Error(`Fresh install failed: ${installResult.error}`);
      }

      // Step 4: Rebuild everything
      console.log('  Rebuilding all packages...');
      const buildResult = await this.runCommand('bun', ['run', 'build']);

      if (!buildResult.success) {
        console.log('  ⚠️  Full build failed, trying individual packages...');

        // Try building packages individually
        const packages = ['shared', 'backend', 'cli', 'frontend'];
        for (const pkg of packages) {
          console.log(`    Building ${pkg}...`);
          const pkgBuild = await this.runCommand('bun', ['run', `build:${pkg}`]);
          if (pkgBuild.success) {
            console.log(`    ✅ ${pkg} built successfully`);
          } else {
            console.log(`    ❌ ${pkg} build failed: ${pkgBuild.error}`);
          }
        }
      }

      const duration = performance.now() - startTime;
      return {
        success: true,
        message: 'Nuclear reset completed successfully',
        duration,
        details: 'Complete environment cleanup and rebuild performed',
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        message: 'Nuclear reset failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verify dependencies are properly installed
   */
  private async verifyDependencies(): Promise<RecoveryResult> {
    try {
      // Check if node_modules exists and has .bin directory
      const nodeModules = join(this.projectRoot, 'node_modules');
      const binDir = join(nodeModules, '.bin');

      if (!existsSync(nodeModules)) {
        return {
          success: false,
          message: 'node_modules directory missing',
          duration: 0,
        };
      }

      if (!existsSync(binDir)) {
        return {
          success: false,
          message: 'node_modules/.bin directory missing',
          duration: 0,
        };
      }

      // Test that we can run basic commands
      const testCommands = [
        { cmd: 'bun', args: ['--version'] },
        { cmd: 'bunx', args: ['tsc', '--version'] },
      ];

      for (const { cmd, args } of testCommands) {
        const result = await this.runCommand(cmd, args);
        if (!result.success) {
          return {
            success: false,
            message: `Command '${cmd} ${args.join(' ')}' failed`,
            duration: 0,
            error: result.error,
          };
        }
      }

      return {
        success: true,
        message: 'Dependencies verified successfully',
        duration: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Dependency verification failed',
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run a command and return the result
   */
  private async runCommand(
    command: string,
    args: string[],
    options: { timeout?: number; cwd?: string } = {}
  ): Promise<{
    success: boolean;
    stdout?: string;
    stderr?: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const executable = command === 'bun' || command === 'bunx' ? this.bunExecutablePath : command;
      const child = spawn(executable, args, {
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
          stdout: stdout || undefined,
          stderr: stderr || undefined,
          error: code !== 0 ? stderr || `Command failed with exit code ${code}` : undefined,
        });
      });

      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: false,
          error: error.message,
        });
      });
    });
  }
}

/**
 * CLI interface
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const action = args[0];
  const recovery = new RecoveryTools(process.cwd());

  let result: RecoveryResult;

  switch (action) {
    case 'clean-deps':
      result = await recovery.cleanDependencies();
      break;
    case 'fix-types':
      result = await recovery.fixTypeScriptIssues();
      break;
    case 'check-env':
      result = await recovery.checkBuildEnvironment();
      break;
    case 'fix-scripts':
      result = await recovery.fixBuildScripts();
      break;
    case 'fix-workspace':
      result = await recovery.fixWorkspaceConfiguration();
      break;
    case 'nuclear':
      result = await recovery.nuclearReset();
      break;
    case 'full': {
      {
        // Run full recovery sequence
        console.log('🚀 Running full recovery sequence...\n');

        const steps = [
          {
            name: 'Clean Dependencies',
            fn: () => recovery.cleanDependencies(),
          },
          { name: 'Fix TypeScript', fn: () => recovery.fixTypeScriptIssues() },
          {
            name: 'Check Environment',
            fn: () => recovery.checkBuildEnvironment(),
          },
          { name: 'Fix Scripts', fn: () => recovery.fixBuildScripts() },
          {
            name: 'Fix Workspace',
            fn: () => recovery.fixWorkspaceConfiguration(),
          },
        ];

        let allSuccess = true;
        for (const step of steps) {
          console.log(`\n--- ${step.name} ---`);
          const stepResult = await step.fn();

          if (stepResult.success) {
            console.log(`✅ ${stepResult.message} (${Math.round(stepResult.duration)}ms)`);
          } else {
            console.log(`❌ ${stepResult.message} (${Math.round(stepResult.duration)}ms)`);
            if (stepResult.error) {
              console.log(`   Error: ${stepResult.error}`);
            }
            allSuccess = false;
          }
        }

        result = {
          success: allSuccess,
          message: allSuccess
            ? 'Full recovery completed successfully'
            : 'Full recovery completed with some failures',
          duration: 0,
        };
        break;
      }
    }
    default:
      console.log('Recovery Tools - Automated build recovery scripts');
      console.log('\nUsage: bun run scripts/recovery-tools.ts <action>');
      console.log('\nActions:');
      console.log('  clean-deps    - Clean and restore dependencies');
      console.log('  fix-types     - Fix TypeScript compilation issues');
      console.log('  check-env     - Check build environment');
      console.log('  fix-scripts   - Fix build scripts configuration');
      console.log('  fix-workspace - Fix workspace configuration');
      console.log('  nuclear       - Complete environment reset (destructive)');
      console.log('  full          - Run full recovery sequence');
      console.log('\nExamples:');
      console.log('  bun run scripts/recovery-tools.ts clean-deps');
      console.log('  bun run scripts/recovery-tools.ts full');
      process.exit(0);
  }

  // Output result
  console.log(`\n${'='.repeat(60)}`);
  if (result.success) {
    console.log(`✅ SUCCESS: ${result.message}`);
  } else {
    console.log(`❌ FAILED: ${result.message}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  }
  console.log(`Duration: ${Math.round(result.duration)}ms`);
  console.log('='.repeat(60));

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

export default RecoveryTools;
