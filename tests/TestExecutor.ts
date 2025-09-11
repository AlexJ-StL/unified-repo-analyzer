/**
 * TestExecutor with Performance Tracking
 * Provides controlled test execution with comprehensive performance monitoring
 */

import { exec } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { promisify } from 'node:util';
import {
  MemoryUsageChecker,
  TestPerformanceMonitor,
  TestTimeoutManager,
} from './performance-monitor.js';
import { type ResourceStats, resourceController } from './ResourceController.js';

const execAsync = promisify(exec);

export interface TestExecutionOptions {
  testPath?: string;
  pattern?: string;
  timeout?: number;
  maxRetries?: number;
  coverage?: boolean;
  watch?: boolean;
  reporter?: string;
  bail?: boolean;
  concurrency?: number;
}

export interface TestExecutionResult {
  success: boolean;
  duration: number;
  testCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  coverage?: CoverageResult;
  performance: TestPerformanceMetrics;
  resourceUsage: ResourceUsageMetrics;
  errors: string[];
  warnings: string[];
}

export interface TestPerformanceMetrics {
  totalDuration: number;
  setupDuration: number;
  executionDuration: number;
  teardownDuration: number;
  averageTestDuration: number;
  slowestTest?: {
    name: string;
    duration: number;
  };
  memoryPeak: number;
  memoryAverage: number;
  cpuUsage: number;
}

export interface ResourceUsageMetrics {
  initialStats: ResourceStats;
  peakStats: ResourceStats;
  finalStats: ResourceStats;
  processCount: number;
  maxProcessCount: number;
  systemLoadAverage: number;
  memoryLeaks: boolean;
}

export interface CoverageResult {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  threshold: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  passed: boolean;
}

/**
 * TestExecutor class for controlled test execution with performance monitoring
 */
export class TestExecutor {
  private static instance: TestExecutor;
  private performanceMonitor: TestPerformanceMonitor;
  private isExecuting = false;
  private currentExecution?: {
    startTime: number;
    resourceStats: ResourceStats[];
    memorySnapshots: number[];
  };

  private constructor() {
    this.performanceMonitor = TestPerformanceMonitor.getInstance();
  }

  public static getInstance(): TestExecutor {
    if (!TestExecutor.instance) {
      TestExecutor.instance = new TestExecutor();
    }
    return TestExecutor.instance;
  }

  /**
   * Execute a single test file with performance monitoring
   */
  public async runSingleTest(
    testPath: string,
    options: TestExecutionOptions = {}
  ): Promise<TestExecutionResult> {
    if (this.isExecuting) {
      throw new Error(
        'TestExecutor is already running a test. Wait for completion or use a new instance.'
      );
    }

    this.isExecuting = true;
    const executionId = `single-test-${Date.now()}`;

    try {
      // Pre-execution setup
      await this.preTestSetup(executionId);

      // Build command
      const command = this.buildTestCommand({
        ...options,
        testPath,
      });

      // Execute test with monitoring
      const result = await this.executeWithMonitoring(command, executionId, options);

      // Post-execution cleanup
      await this.postTestCleanup(executionId);

      return result;
    } catch (error) {
      await this.handleExecutionError(error, executionId);
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute test suite with performance monitoring
   */
  public async runTestSuite(
    pattern?: string,
    options: TestExecutionOptions = {}
  ): Promise<TestExecutionResult> {
    if (this.isExecuting) {
      throw new Error(
        'TestExecutor is already running tests. Wait for completion or use a new instance.'
      );
    }

    this.isExecuting = true;
    const executionId = `test-suite-${Date.now()}`;

    try {
      // Pre-execution setup
      await this.preTestSetup(executionId);

      // Build command
      const command = this.buildTestCommand({
        ...options,
        pattern,
      });

      // Execute tests with monitoring
      const result = await this.executeWithMonitoring(command, executionId, options);

      // Post-execution cleanup
      await this.postTestCleanup(executionId);

      return result;
    } catch (error) {
      await this.handleExecutionError(error, executionId);
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute tests with intelligent concurrency adjustment
   */
  public async runWithAdaptiveConcurrency(
    options: TestExecutionOptions = {}
  ): Promise<TestExecutionResult> {
    // Start with conservative concurrency
    let concurrency = 1;
    const maxConcurrency = 4;

    // Monitor system resources
    const initialStats = await resourceController.getResourceStats();

    // Adjust concurrency based on system load
    if (initialStats.systemLoad < 2 && initialStats.totalCpuPercent < 50) {
      concurrency = Math.min(2, maxConcurrency);
    }

    if (initialStats.systemLoad < 1 && initialStats.totalCpuPercent < 25) {
      concurrency = Math.min(4, maxConcurrency);
    }

    console.log(`🎯 Starting tests with adaptive concurrency: ${concurrency}`);

    return this.runTestSuite(options.pattern, {
      ...options,
      concurrency,
    });
  }

  /**
   * Pre-test setup with resource monitoring
   */
  private async preTestSetup(executionId: string): Promise<void> {
    console.log(`🚀 Starting test execution: ${executionId}`);

    // Check if we can start tests
    const canStart = await resourceController.canStartProcess();
    if (!canStart) {
      throw new Error('Cannot start tests: Resource limits exceeded');
    }

    // Start resource monitoring
    resourceController.startMonitoring(2000); // Monitor every 2 seconds

    // Initialize execution tracking
    const initialStats = await resourceController.getResourceStats();
    this.currentExecution = {
      startTime: performance.now(),
      resourceStats: [initialStats],
      memorySnapshots: [this.getCurrentMemoryUsage()],
    };

    // Force garbage collection if available
    await MemoryUsageChecker.forceGarbageCollection();

    console.log('📊 Initial resource stats:', {
      processes: initialStats.bunProcesses,
      cpu: `${initialStats.totalCpuPercent}%`,
      memory: `${initialStats.totalMemoryMB.toFixed(0)}MB`,
    });
  }

  /**
   * Post-test cleanup with resource verification
   */
  private async postTestCleanup(executionId: string): Promise<void> {
    console.log(`🧹 Cleaning up test execution: ${executionId}`);

    // Stop resource monitoring
    resourceController.stopMonitoring();

    // Force garbage collection
    await MemoryUsageChecker.forceGarbageCollection();

    // Verify no processes are left running
    const finalStats = await resourceController.getResourceStats();
    if (finalStats.bunProcesses > 1) {
      // Give processes time to clean up naturally
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const recheckStats = await resourceController.getResourceStats();
      if (recheckStats.bunProcesses > 1) {
        await resourceController.emergencyCleanup();
      }
    }

    // Clear performance metrics for next run
    this.performanceMonitor.clear();

    console.log(`✅ Test execution cleanup completed: ${executionId}`);
  }

  /**
   * Handle execution errors with cleanup
   */
  private async handleExecutionError(_error: unknown, _executionId: string): Promise<void> {
    // Emergency cleanup
    await resourceController.emergencyCleanup();

    // Stop monitoring
    resourceController.stopMonitoring();

    // Clear metrics
    this.performanceMonitor.clear();
  }

  /**
   * Execute command with comprehensive monitoring
   */
  private async executeWithMonitoring(
    command: string,
    executionId: string,
    options: TestExecutionOptions
  ): Promise<TestExecutionResult> {
    const startTime = performance.now();
    const setupDuration = this.currentExecution
      ? performance.now() - this.currentExecution.startTime
      : 0;

    console.log(`⚡ Executing: ${command}`);

    // Start performance monitoring
    this.performanceMonitor.startTest(executionId);

    // Monitor resources during execution
    const resourceMonitorInterval = setInterval(async () => {
      if (this.currentExecution) {
        const stats = await resourceController.getResourceStats();
        this.currentExecution.resourceStats.push(stats);
        this.currentExecution.memorySnapshots.push(this.getCurrentMemoryUsage());

        // Check for resource issues
        if (stats.totalCpuPercent > 90) {
        }
        if (stats.bunProcesses > 3) {
        }
      }
    }, 1000);

    try {
      // Execute the test command with timeout
      const timeout = options.timeout || 60000; // 1 minute default
      const result = await TestTimeoutManager.withTimeout(
        this.executeCommand(command),
        timeout,
        executionId
      );

      const executionDuration = performance.now() - startTime;

      // Stop resource monitoring
      clearInterval(resourceMonitorInterval);

      // End performance monitoring
      const perfMetrics = this.performanceMonitor.endTest(executionId);

      // Parse test results
      const testResult = this.parseTestOutput(result.stdout, result.stderr);

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(
        setupDuration,
        executionDuration,
        perfMetrics?.duration || executionDuration
      );

      // Calculate resource usage metrics
      const resourceMetrics = this.calculateResourceMetrics();

      return {
        success: result.exitCode === 0,
        duration: executionDuration,
        testCount: testResult.total,
        passedCount: testResult.passed,
        failedCount: testResult.failed,
        skippedCount: testResult.skipped,
        coverage: testResult.coverage,
        performance: performanceMetrics,
        resourceUsage: resourceMetrics,
        errors: testResult.errors,
        warnings: testResult.warnings,
      };
    } catch (error) {
      clearInterval(resourceMonitorInterval);
      throw error;
    }
  }

  /**
   * Build test command based on options
   */
  private buildTestCommand(options: TestExecutionOptions): string {
    const parts = ['bun', 'test'];

    // Add test path or pattern
    if (options.testPath) {
      parts.push(options.testPath);
    } else if (options.pattern) {
      parts.push(options.pattern);
    }

    // Add options
    if (options.coverage) {
      parts.push('--coverage');
    }

    if (options.reporter) {
      parts.push('--reporter', options.reporter);
    }

    if (options.bail) {
      parts.push('--bail');
    }

    // Force run (don't watch)
    parts.push('--run');

    // Add concurrency if specified
    if (options.concurrency !== undefined) {
      parts.push('--max-concurrency', options.concurrency.toString());
    }

    return parts.join(' ');
  }

  /**
   * Execute command and capture output
   */
  private async executeCommand(command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000, // 2 minute timeout
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string; code?: number };
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || '',
        exitCode: err.code || 1,
      };
    }
  }

  /**
   * Parse test output to extract results
   */
  private parseTestOutput(
    stdout: string,
    stderr: string
  ): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage?: CoverageResult;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract errors from stderr
    if (stderr) {
      const errorLines = stderr
        .split('\n')
        .filter((line) => line.includes('Error') || line.includes('FAIL') || line.includes('✗'));
      errors.push(...errorLines);
    }

    // Extract warnings
    const warningLines = stdout
      .split('\n')
      .filter((line) => line.includes('warn') || line.includes('Warning') || line.includes('⚠'));
    warnings.push(...warningLines);

    // Parse test counts (basic parsing - can be enhanced)
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Look for Vitest output patterns
    const testSummaryMatch = stdout.match(/Test Files\s+(\d+)\s+passed.*?Tests\s+(\d+)\s+passed/s);
    if (testSummaryMatch) {
      passed = Number.parseInt(testSummaryMatch[2], 10) || 0;
      total = passed;
    }

    // Look for failure patterns
    const failureMatch = stdout.match(/(\d+)\s+failed/);
    if (failureMatch) {
      failed = Number.parseInt(failureMatch[1], 10) || 0;
      total += failed;
    }

    // Look for skip patterns
    const skipMatch = stdout.match(/(\d+)\s+skipped/);
    if (skipMatch) {
      skipped = Number.parseInt(skipMatch[1], 10) || 0;
      total += skipped;
    }

    return {
      total,
      passed,
      failed,
      skipped,
      errors,
      warnings,
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    setupDuration: number,
    executionDuration: number,
    totalDuration: number
  ): TestPerformanceMetrics {
    const teardownDuration = Math.max(0, totalDuration - setupDuration - executionDuration);

    // Get memory metrics
    const memorySnapshots = this.currentExecution?.memorySnapshots || [];
    const memoryPeak = Math.max(...memorySnapshots, 0);
    const memoryAverage =
      memorySnapshots.length > 0
        ? memorySnapshots.reduce((sum, val) => sum + val, 0) / memorySnapshots.length
        : 0;

    // Get slow tests from performance monitor
    const allMetrics = this.performanceMonitor.getMetrics();
    const slowestTest =
      allMetrics.length > 0
        ? allMetrics.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
          )
        : undefined;

    const averageTestDuration =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, metric) => sum + metric.duration, 0) / allMetrics.length
        : 0;

    return {
      totalDuration,
      setupDuration,
      executionDuration,
      teardownDuration,
      averageTestDuration,
      slowestTest: slowestTest
        ? {
            name: slowestTest.testName,
            duration: slowestTest.duration,
          }
        : undefined,
      memoryPeak,
      memoryAverage,
      cpuUsage: 0, // Will be calculated from resource stats
    };
  }

  /**
   * Calculate resource usage metrics
   */
  private calculateResourceMetrics(): ResourceUsageMetrics {
    const resourceStats = this.currentExecution?.resourceStats || [];

    if (resourceStats.length === 0) {
      // Return default metrics if no stats available
      return {
        initialStats: {
          totalProcesses: 0,
          bunProcesses: 0,
          vitestProcesses: 0,
          totalCpuPercent: 0,
          totalMemoryMB: 0,
          systemLoad: 0,
        },
        peakStats: {
          totalProcesses: 0,
          bunProcesses: 0,
          vitestProcesses: 0,
          totalCpuPercent: 0,
          totalMemoryMB: 0,
          systemLoad: 0,
        },
        finalStats: {
          totalProcesses: 0,
          bunProcesses: 0,
          vitestProcesses: 0,
          totalCpuPercent: 0,
          totalMemoryMB: 0,
          systemLoad: 0,
        },
        processCount: 0,
        maxProcessCount: 0,
        systemLoadAverage: 0,
        memoryLeaks: false,
      };
    }

    const initialStats = resourceStats[0];
    const finalStats = resourceStats[resourceStats.length - 1];

    // Find peak resource usage
    const peakStats = resourceStats.reduce((peak, current) => ({
      totalProcesses: Math.max(peak.totalProcesses, current.totalProcesses),
      bunProcesses: Math.max(peak.bunProcesses, current.bunProcesses),
      vitestProcesses: Math.max(peak.vitestProcesses, current.vitestProcesses),
      totalCpuPercent: Math.max(peak.totalCpuPercent, current.totalCpuPercent),
      totalMemoryMB: Math.max(peak.totalMemoryMB, current.totalMemoryMB),
      systemLoad: Math.max(peak.systemLoad, current.systemLoad),
    }));

    const maxProcessCount = Math.max(...resourceStats.map((s) => s.bunProcesses));
    const avgSystemLoad =
      resourceStats.reduce((sum, s) => sum + s.systemLoad, 0) / resourceStats.length;

    // Detect potential memory leaks
    const memorySnapshots = this.currentExecution?.memorySnapshots || [];
    const memoryLeaks =
      memorySnapshots.length > 2 &&
      memorySnapshots[memorySnapshots.length - 1] > memorySnapshots[0] * 1.5;

    return {
      initialStats,
      peakStats,
      finalStats,
      processCount: finalStats.bunProcesses,
      maxProcessCount,
      systemLoadAverage: avgSystemLoad,
      memoryLeaks,
    };
  }

  /**
   * Get current memory usage in MB
   */
  private getCurrentMemoryUsage(): number {
    if (process?.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }
    return 0;
  }

  /**
   * Generate comprehensive execution report
   */
  public generateExecutionReport(result: TestExecutionResult): string {
    let report = '\n=== Test Execution Report ===\n';

    // Basic results
    report += `Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `Duration: ${(result.duration / 1000).toFixed(2)}s\n`;
    report += `Tests: ${result.testCount} (${result.passedCount} passed, ${result.failedCount} failed, ${result.skippedCount} skipped)\n`;

    // Performance metrics
    report += '\n--- Performance Metrics ---\n';
    report += `Setup: ${(result.performance.setupDuration / 1000).toFixed(2)}s\n`;
    report += `Execution: ${(result.performance.executionDuration / 1000).toFixed(2)}s\n`;
    report += `Teardown: ${(result.performance.teardownDuration / 1000).toFixed(2)}s\n`;
    report += `Average Test Duration: ${result.performance.averageTestDuration.toFixed(2)}ms\n`;

    if (result.performance.slowestTest) {
      report += `Slowest Test: ${result.performance.slowestTest.name} (${(result.performance.slowestTest.duration / 1000).toFixed(2)}s)\n`;
    }

    // Resource usage
    report += '\n--- Resource Usage ---\n';
    report += `Peak Processes: ${result.resourceUsage.maxProcessCount}\n`;
    report += `Peak CPU: ${result.resourceUsage.peakStats.totalCpuPercent.toFixed(1)}%\n`;
    report += `Peak Memory: ${result.resourceUsage.peakStats.totalMemoryMB.toFixed(0)}MB\n`;
    report += `System Load Average: ${result.resourceUsage.systemLoadAverage.toFixed(2)}\n`;
    report += `Memory Leaks Detected: ${result.resourceUsage.memoryLeaks ? '⚠️ YES' : '✅ NO'}\n`;

    // Errors and warnings
    if (result.errors.length > 0) {
      report += '\n--- Errors ---\n';
      result.errors.slice(0, 5).forEach((error) => {
        report += `❌ ${error}\n`;
      });
      if (result.errors.length > 5) {
        report += `... and ${result.errors.length - 5} more errors\n`;
      }
    }

    if (result.warnings.length > 0) {
      report += '\n--- Warnings ---\n';
      result.warnings.slice(0, 3).forEach((warning) => {
        report += `⚠️ ${warning}\n`;
      });
      if (result.warnings.length > 3) {
        report += `... and ${result.warnings.length - 3} more warnings\n`;
      }
    }

    return report;
  }
}

// Export singleton instance
export const testExecutor = TestExecutor.getInstance();

// Export convenience functions
export const runSingleTest = (testPath: string, options?: TestExecutionOptions) =>
  testExecutor.runSingleTest(testPath, options);

export const runTestSuite = (pattern?: string, options?: TestExecutionOptions) =>
  testExecutor.runTestSuite(pattern, options);

export const runWithAdaptiveConcurrency = (options?: TestExecutionOptions) =>
  testExecutor.runWithAdaptiveConcurrency(options);
