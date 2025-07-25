#!/usr/bin/env node

/**
 * Comprehensive test runner script
 * Orchestrates different types of tests and generates reports
 */

const { spawn } = require('child_process');
const { join } = require('path');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { performance } = require('perf_hooks');

class TestRunner {
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

  async run() {
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
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('📋 Running unit tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('npm', ['run', 'test:unit', '--', '--coverage']);
      const duration = performance.now() - startTime;
      this.results.unit = { status: 'passed', duration };
      console.log(`✅ Unit tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      this.results.unit = { status: 'failed', error: error.message };
      throw new Error('Unit tests failed');
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('npm', ['run', 'test:integration']);
      const duration = performance.now() - startTime;
      this.results.integration = { status: 'passed', duration };
      console.log(`✅ Integration tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      this.results.integration = { status: 'failed', error: error.message };
      throw new Error('Integration tests failed');
    }
  }

  async runE2ETests() {
    console.log('🌐 Running end-to-end tests...');
    const startTime = performance.now();

    try {
      // Start servers in background
      const backendProcess = spawn('npm', ['run', 'start:backend'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      const frontendProcess = spawn('npm', ['run', 'start:frontend'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      // Wait for servers to start
      await this.waitForServer('http://localhost:3001/api/health', 30000);
      await this.waitForServer('http://localhost:3000', 30000);

      try {
        await this.runCommand('npm', ['run', 'test:e2e']);
        const duration = performance.now() - startTime;
        this.results.e2e = { status: 'passed', duration };
        console.log(`✅ E2E tests passed (${Math.round(duration)}ms)\n`);
      } finally {
        // Cleanup servers
        backendProcess.kill();
        frontendProcess.kill();
      }
    } catch (error) {
      this.results.e2e = { status: 'failed', error: error.message };
      throw new Error('E2E tests failed');
    }
  }

  async runPerformanceTests() {
    if (process.env.SKIP_PERFORMANCE_TESTS === 'true') {
      console.log('⏭️  Skipping performance tests\n');
      this.results.performance = { status: 'skipped' };
      return;
    }

    console.log('⚡ Running performance tests...');
    const startTime = performance.now();

    try {
      await this.runCommand('npm', ['run', 'test:performance']);
      const duration = performance.now() - startTime;
      this.results.performance = { status: 'passed', duration };
      console.log(`✅ Performance tests passed (${Math.round(duration)}ms)\n`);
    } catch (error) {
      this.results.performance = { status: 'failed', error: error.message };
      // Performance tests are not critical for CI
      console.log(`⚠️  Performance tests failed: ${error.message}\n`);
    }
  }

  async generateCoverageReport() {
    console.log('📊 Generating coverage report...');

    try {
      await this.runCommand('npm', ['run', 'coverage:merge']);
      await this.runCommand('npm', ['run', 'coverage:report']);
      this.results.coverage = { status: 'generated' };
      console.log('✅ Coverage report generated\n');
    } catch (error) {
      this.results.coverage = { status: 'failed', error: error.message };
      console.log(`⚠️  Coverage report generation failed: ${error.message}\n`);
    }
  }

  async generateSummaryReport() {
    const totalDuration = performance.now() - this.startTime;
    const reportDir = join(__dirname, '../test-results');

    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    const report = {
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

  generateHumanReport(report) {
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

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
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

      child.on('error', reject);
    });
  }

  async waitForServer(url, timeout = 30000) {
    const axios = require('axios');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await axios.get(url, { timeout: 1000 });
        return;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Server at ${url} did not start within ${timeout}ms`);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(console.error);
}

module.exports = TestRunner;
