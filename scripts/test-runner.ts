#!/usr/bin/env bun

/**
 * Comprehensive test runner script
 * Orchestrates different types of tests and generates reports
 */

import { spawn, type ChildProcess } from 'child_process';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { performance } from 'perf_hooks';
import type { TestResult, TestResults, TestEnvironment, TestReport } from '../types/config';

// For module detection compatibility
declare const require: any;
declare const module: any;

interface SpawnOptions {
  stdio?: 'inherit' | 'pipe';
  env?: NodeJS.ProcessEnv;
}

class TestRunner {
  private results: TestResults;
  private startTime: number;

  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      coverage: null,
    };
    this.startTime = performance.now();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting comprehensive test suite...\n');

    try {
      // Run tests in sequence for better resource management
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.runPerformanceTests();
      await this.generateCoverageReport();
      await this.generateSummaryReport();

      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('\n❌ Test suite failed:', errorMessage);
      process.exit(1);
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('📋 Running unit tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('bun', ['test', '--coverage']);
      const duration = performance.now() - startTime;
      this.results.unit = { status: 'passed', duration };
      console.log(`✅ Unit tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.unit = { status: 'failed', error: errorMessage };
      throw new Error('Unit tests failed');
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running integration tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('bun', ['run', 'test:integration']);
      const duration = performance.now() - startTime;
      this.results.integration = { status: 'passed', duration };
      console.log(`✅ Integration tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.integration = { status: 'failed', error: errorMessage };
      throw new Error('Integration tests failed');
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('🌐 Running end-to-end tests...');
    const startTime = performance.now();

    try {
      // Start servers in background
      const backendProcess = spawn('bun', ['run', 'start:backend'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      const frontendProcess = spawn('bun', ['run', 'start:frontend'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      // Wait for servers to start
      await this.waitForServer('http://localhost:3001/api/health', 30000);
      await this.waitForServer('http://localhost:3000', 30000);

      try {
        await this.runCommand('bun', ['run', 'test:e2e']);
        const duration = performance.now() - startTime;
        this.results.e2e = { status: 'passed', duration };
        console.log(`✅ E2E tests passed (${Math.round(duration)}ms)\n`);
      } finally {
        // Cleanup servers
        backendProcess.kill();
        frontendProcess.kill();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.e2e = { status: 'failed', error: errorMessage };
      throw new Error('E2E tests failed');
    }
  }

  private async runPerformanceTests(): Promise<void> {
    if (process.env.SKIP_PERFORMANCE_TESTS === 'true') {
      console.log('⏭️  Skipping performance tests\n');
      this.results.performance = { status: 'skipped' };
      return;
    }

    console.log('⚡ Running performance tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('bun', ['run', 'test:performance']);
      const duration = performance.now() - startTime;
      this.results.performance = { status: 'passed', duration };
      console.log(`✅ Performance tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.performance = { status: 'failed', error: errorMessage };
      // Performance tests are not critical for CI
      console.log(`⚠️  Performance tests failed: ${errorMessage}\n`);
    }
  }

  private async generateCoverageReport(): Promise<void> {
    console.log('📊 Generating coverage report...');

    try {
      await this.runCommand('bun', ['run', 'coverage:merge']);
      await this.runCommand('bun', ['run', 'coverage:report']);
      this.results.coverage = { status: 'generated' };
      console.log('✅ Coverage report generated\n');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.coverage = { status: 'failed', error: errorMessage };
      console.log(`⚠️  Coverage report generation failed: ${errorMessage}\n`);
    }
  }

  private async generateSummaryReport(): Promise<void> {
    const totalDuration = performance.now() - this.startTime;
    const reportDir = join(__dirname, '../test-results');

    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalDuration: Math.round(totalDuration),
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: !!process.env.CI,
      },
    };

    // Write JSON report
    writeFileSync(join(reportDir, 'test-summary.json'), JSON.stringify(report, null, 2));

    // Write human-readable report
    const humanReport = this.generateHumanReport(report);
    writeFileSync(join(reportDir, 'test-summary.txt'), humanReport);

    console.log('📋 Test summary report generated');
    console.log(humanReport);
  }

  private generateHumanReport(report: TestReport): string {
    const { results, totalDuration, environment } = report;

    let output = '='.repeat(60) + '\n';
    output += '           TEST SUITE SUMMARY REPORT\n';
    output += '='.repeat(60) + '\n\n';

    output += `Total Duration: ${totalDuration}ms\n`;
    output += `Environment: Node ${environment.nodeVersion} on ${environment.platform}\n`;
    output += `CI Mode: ${environment.ci ? 'Yes' : 'No'}\n\n`;

    output += 'Test Results:\n';
    output += '-'.repeat(40) + '\n';

    Object.entries(results).forEach(([type, result]) => {
      const status = result?.status || 'unknown';
      const icon =
        status === 'passed'
          ? '✅'
          : status === 'failed'
            ? '❌'
            : status === 'skipped'
              ? '⏭️'
              : '❓';
      const duration = result?.duration ? ` (${Math.round(result.duration)}ms)` : '';

      output += `${icon} ${type.toUpperCase()}: ${status.toUpperCase()}${duration}\n`;

      if (result?.error) {
        output += `   Error: ${result.error}\n`;
      }
    });

    output += '\n' + '='.repeat(60) + '\n';

    const passedTests = Object.values(results).filter((r) => r?.status === 'passed').length;
    const totalTests = Object.values(results).filter((r) => r?.status !== 'skipped').length;

    if (passedTests === totalTests) {
      output += '🎉 ALL TESTS PASSED!\n';
    } else {
      output += `⚠️  ${passedTests}/${totalTests} test suites passed\n`;
    }

    return output;
  }

  private async runCommand(command: string, args: string[], options: SpawnOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const child: ChildProcess = spawn(command, args, {
        stdio: 'inherit',
        ...options,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async waitForServer(url: string, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Use fetch instead of axios for better Bun compatibility
        const response = await fetch(url, { 
          signal: AbortSignal.timeout(1000)
        });
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Server at ${url} did not start within ${timeout}ms`);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default TestRunner;