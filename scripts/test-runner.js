#!/usr/bin/env bun
/**
 * Comprehensive test runner script with advanced TypeScript features
 * Orchestrates different types of tests and generates reports with strict type safety
 */
import { spawn } from 'child_process';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { performance } from 'perf_hooks';
/**
 * Command execution result class for enhanced error handling
 */
class CommandExecutionResultClass extends Error {
    result;
    constructor(result) {
        super(result.error || 'Command execution failed');
        this.name = 'CommandExecutionError';
        this.result = result;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CommandExecutionResultClass);
        }
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            result: this.result,
            stack: this.stack
        };
    }
}
/**
 * Type guard for test results
 */
function isTestResult(result) {
    return (result !== null &&
        typeof result === 'object' &&
        'status' in result &&
        ['passed', 'failed', 'skipped', 'generated', 'unknown'].includes(result.status));
}
/**
 * Type guard for successful test results
 */
function isSuccessfulTestResult(result) {
    return result.status === 'passed' || result.status === 'generated';
}
/**
 * Type guard for failed test results
 */
function isFailedTestResult(result) {
    return result.status === 'failed' && typeof result.error === 'string';
}
/**
 * Type guard for server health check configuration
 */
function isServerHealthCheck(config) {
    return (config !== null &&
        typeof config === 'object' &&
        'url' in config &&
        typeof config.url === 'string' &&
        'timeout' in config &&
        typeof config.timeout === 'number');
}
/**
 * Generic error class with enhanced typing
 */
class TestRunnerError extends Error {
    code;
    details;
    timestamp;
    constructor(code, message, details) {
        super(message);
        this.name = 'TestRunnerError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TestRunnerError);
        }
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}
/**
 * Configuration constants with strict typing
 */
const DEFAULT_CONFIG = {
    timeout: 30000,
    retryAttempts: 3,
    skipPerformanceTests: false,
    coverageEnabled: true,
    parallelExecution: false
};
const DEFAULT_HEALTH_CHECK = {
    url: 'http://localhost:3000',
    timeout: 30000,
    interval: 1000,
    expectedStatus: 200,
    headers: {}
};
class TestRunner {
    results;
    startTime;
    config;
    metadata;
    constructor(config) {
        this.results = {
            unit: null,
            integration: null,
            e2e: null,
            performance: null,
            coverage: null,
        };
        this.startTime = performance.now();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.metadata = new Map();
        this.initializeMetadata();
    }
    /**
     * Initialize test suite metadata
     */
    initializeMetadata() {
        this.metadata.set('unit', {
            name: 'Unit Tests',
            description: 'Component and unit level tests',
            category: 'unit',
            dependencies: [],
            estimatedDuration: 30000,
            critical: true
        });
        this.metadata.set('integration', {
            name: 'Integration Tests',
            description: 'Cross-component integration tests',
            category: 'integration',
            dependencies: ['unit'],
            estimatedDuration: 60000,
            critical: true
        });
        this.metadata.set('e2e', {
            name: 'End-to-End Tests',
            description: 'Full application workflow tests',
            category: 'e2e',
            dependencies: ['integration'],
            estimatedDuration: 120000,
            critical: true
        });
        this.metadata.set('performance', {
            name: 'Performance Tests',
            description: 'Application performance and load testing',
            category: 'performance',
            dependencies: ['e2e'],
            estimatedDuration: 90000,
            critical: false
        });
        this.metadata.set('coverage', {
            name: 'Coverage Report',
            description: 'Test coverage analysis and reporting',
            category: 'coverage',
            dependencies: ['unit', 'integration', 'e2e'],
            estimatedDuration: 15000,
            critical: false
        });
    }
    /**
     * Get test suite metadata by type
     */
    getTestMetadata(type) {
        const metadata = this.metadata.get(type);
        if (!metadata) {
            throw new TestRunnerError('METADATA_NOT_FOUND', `No metadata found for test type: ${type}`);
        }
        return metadata;
    }
    /**
     * Validate test dependencies
     */
    async validateDependencies(type) {
        const metadata = this.getTestMetadata(type);
        for (const dependency of metadata.dependencies) {
            const dependencyType = dependency;
            const result = this.results[dependencyType];
            if (!result || !isSuccessfulTestResult(result)) {
                throw new TestRunnerError('DEPENDENCY_FAILED', `Cannot run ${type} tests because dependency ${dependencyType} failed or was not completed`);
            }
        }
    }
    /**
     * Execute test with retry logic
     */
    async executeWithRetry(operation, maxRetries = this.config.retryAttempts) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxRetries) {
                    throw lastError;
                }
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    /**
     * Get test execution statistics
     */
    getExecutionStats() {
        const results = Object.values(this.results);
        const totalTests = results.filter(r => r !== null).length;
        const passedTests = results.filter(r => r && isSuccessfulTestResult(r)).length;
        const failedTests = results.filter(r => r && isFailedTestResult(r)).length;
        const skippedTests = results.filter(r => r?.status === 'skipped').length;
        const criticalTests = Array.from(this.metadata.values())
            .filter(m => m.critical)
            .filter(m => this.results[m.category] !== null)
            .length;
        const nonCriticalTests = totalTests - criticalTests;
        return {
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            criticalTests,
            nonCriticalTests
        };
    }
    /**
     * Check if test suite can proceed based on critical test results
     */
    canProceed() {
        const stats = this.getExecutionStats();
        // If any critical test failed, we cannot proceed
        const criticalFailed = Array.from(this.metadata.values())
            .filter(m => m.critical)
            .some(m => {
            const result = this.results[m.category];
            return result && isFailedTestResult(result);
        });
        return !criticalFailed;
    }
    /**
     * Validate configuration
     */
    validateConfiguration() {
        if (this.config.timeout <= 0) {
            throw new TestRunnerError('INVALID_CONFIG', 'Timeout must be greater than 0');
        }
        if (this.config.retryAttempts < 0) {
            throw new TestRunnerError('INVALID_CONFIG', 'Retry attempts must be non-negative');
        }
        if (this.config.parallelExecution && this.config.retryAttempts > 0) {
            console.warn('⚠️  Parallel execution with retries may cause race conditions');
        }
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('\n❌ Test suite failed:', errorMessage);
            process.exit(1);
        }
    }
    /**
     * Enhanced run method with dependency validation and error handling
     */
    async runWithValidation() {
        console.log('🚀 Starting comprehensive test suite with validation...\n');
        try {
            // Validate configuration first
            this.validateConfiguration();
            // Run tests with dependency validation
            await this.runUnitTests();
            await this.runIntegrationTests();
            await this.runE2ETests();
            await this.runPerformanceTests();
            await this.generateCoverageReport();
            await this.generateSummaryReport();
            console.log('\n✅ All tests completed successfully!');
            process.exit(0);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('\n❌ Test suite failed:', errorMessage);
            if (error instanceof TestRunnerError) {
                console.error(`Error Code: ${error.code}`);
                if (error.details) {
                    console.error('Details:', JSON.stringify(error.details, null, 2));
                }
            }
            process.exit(1);
        }
    }
    async runUnitTests() {
        console.log('📋 Running unit tests...');
        const startTime = performance.now();
        try {
            await this.validateDependencies('unit');
            await this.executeWithRetry(async () => {
                await this.runCommand('bun', ['test', '--coverage']);
            });
            const duration = performance.now() - startTime;
            const metadata = this.getTestMetadata('unit');
            this.results.unit = {
                status: 'passed',
                duration,
                metadata,
                retryCount: 0
            };
            console.log(`✅ Unit tests passed (${Math.round(duration)}ms)\n`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const metadata = this.getTestMetadata('unit');
            this.results.unit = {
                status: 'failed',
                error: errorMessage,
                metadata,
                retryCount: this.config.retryAttempts
            };
            throw new TestRunnerError('UNIT_TESTS_FAILED', 'Unit tests failed', { error: errorMessage });
        }
    }
    async runIntegrationTests() {
        console.log('🔗 Running integration tests...');
        const startTime = performance.now();
        try {
            await this.validateDependencies('integration');
            await this.executeWithRetry(async () => {
                await this.runCommand('bun', ['run', 'test:integration']);
            });
            const duration = performance.now() - startTime;
            const metadata = this.getTestMetadata('integration');
            this.results.integration = {
                status: 'passed',
                duration,
                metadata,
                retryCount: 0
            };
            console.log(`✅ Integration tests passed (${Math.round(duration)}ms)\n`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const metadata = this.getTestMetadata('integration');
            this.results.integration = {
                status: 'failed',
                error: errorMessage,
                metadata,
                retryCount: this.config.retryAttempts
            };
            throw new TestRunnerError('INTEGRATION_TESTS_FAILED', 'Integration tests failed', { error: errorMessage });
        }
    }
    async runE2ETests() {
        console.log('🌐 Running end-to-end tests...');
        const startTime = performance.now();
        try {
            await this.validateDependencies('e2e');
            await this.executeWithRetry(async () => {
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
                }
                finally {
                    // Cleanup servers
                    backendProcess.kill();
                    frontendProcess.kill();
                }
            });
            const duration = performance.now() - startTime;
            const metadata = this.getTestMetadata('e2e');
            this.results.e2e = {
                status: 'passed',
                duration,
                metadata,
                retryCount: 0
            };
            console.log(`✅ E2E tests passed (${Math.round(duration)}ms)\n`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const metadata = this.getTestMetadata('e2e');
            this.results.e2e = {
                status: 'failed',
                error: errorMessage,
                metadata,
                retryCount: this.config.retryAttempts
            };
            throw new TestRunnerError('E2E_TESTS_FAILED', 'E2E tests failed', { error: errorMessage });
        }
    }
    async runPerformanceTests() {
        if (process.env.SKIP_PERFORMANCE_TESTS === 'true' || this.config.skipPerformanceTests) {
            console.log('⏭️  Skipping performance tests\n');
            const metadata = this.getTestMetadata('performance');
            this.results.performance = {
                status: 'skipped',
                metadata
            };
            return;
        }
        console.log('⚡ Running performance tests...');
        const startTime = performance.now();
        try {
            await this.validateDependencies('performance');
            await this.executeWithRetry(async () => {
                await this.runCommand('bun', ['run', 'test:performance']);
            });
            const duration = performance.now() - startTime;
            const metadata = this.getTestMetadata('performance');
            this.results.performance = {
                status: 'passed',
                duration,
                metadata,
                retryCount: 0
            };
            console.log(`✅ Performance tests passed (${Math.round(duration)}ms)\n`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const metadata = this.getTestMetadata('performance');
            this.results.performance = {
                status: 'failed',
                error: errorMessage,
                metadata,
                retryCount: this.config.retryAttempts
            };
            // Performance tests are not critical for CI
            console.log(`⚠️  Performance tests failed: ${errorMessage}\n`);
        }
    }
    async generateCoverageReport() {
        if (!this.config.coverageEnabled) {
            console.log('⏭️  Coverage generation disabled\n');
            const metadata = this.getTestMetadata('coverage');
            this.results.coverage = {
                status: 'skipped',
                metadata
            };
            return;
        }
        console.log('📊 Generating coverage report...');
        try {
            await this.validateDependencies('coverage');
            await this.executeWithRetry(async () => {
                await this.runCommand('bun', ['run', 'coverage:merge']);
                await this.runCommand('bun', ['run', 'coverage:report']);
            });
            const metadata = this.getTestMetadata('coverage');
            this.results.coverage = {
                status: 'generated',
                metadata
            };
            console.log('✅ Coverage report generated\n');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const metadata = this.getTestMetadata('coverage');
            this.results.coverage = {
                status: 'failed',
                error: errorMessage,
                metadata,
                retryCount: this.config.retryAttempts
            };
            console.log(`⚠️  Coverage report generation failed: ${errorMessage}\n`);
        }
    }
    async generateSummaryReport() {
        const totalDuration = performance.now() - this.startTime;
        const reportDir = join(__dirname, '../test-results');
        if (!existsSync(reportDir)) {
            mkdirSync(reportDir, { recursive: true });
        }
        const stats = this.getExecutionStats();
        const enhancedReport = {
            timestamp: new Date().toISOString(),
            totalDuration: Math.round(totalDuration),
            results: this.results,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                ci: !!process.env.CI,
                bunVersion: process.version.includes('bun') ? process.version : 'unknown',
                memoryUsage: process.memoryUsage(),
            },
            statistics: stats,
            metadata: Object.fromEntries(this.metadata),
        };
        // Write JSON report
        writeFileSync(join(reportDir, 'test-summary.json'), JSON.stringify(enhancedReport, null, 2));
        // Write human-readable report
        const humanReport = this.generateHumanReport(enhancedReport);
        writeFileSync(join(reportDir, 'test-summary.txt'), humanReport);
        console.log('📋 Test summary report generated');
        console.log(humanReport);
    }
    generateHumanReport(report) {
        const { results, totalDuration, environment, statistics } = report;
        let output = '='.repeat(60) + '\n';
        output += '           TEST SUITE SUMMARY REPORT\n';
        output += '='.repeat(60) + '\n\n';
        output += `Total Duration: ${totalDuration}ms\n`;
        output += `Environment: ${environment.bunVersion ? 'Bun' : 'Node'} ${environment.nodeVersion} on ${environment.platform}\n`;
        output += `Architecture: ${environment.arch}\n`;
        output += `CI Mode: ${environment.ci ? 'Yes' : 'No'}\n`;
        if (environment.memoryUsage) {
            const memUsed = Math.round(environment.memoryUsage.heapUsed / 1024 / 1024);
            const memTotal = Math.round(environment.memoryUsage.heapTotal / 1024 / 1024);
            output += `Memory Usage: ${memUsed}MB / ${memTotal}MB\n`;
        }
        output += '\nTest Statistics:\n';
        output += '-'.repeat(40) + '\n';
        output += `Total Tests: ${statistics.totalTests}\n`;
        output += `Passed: ${statistics.passedTests} ✅\n`;
        output += `Failed: ${statistics.failedTests} ❌\n`;
        output += `Skipped: ${statistics.skippedTests} ⏭️\n`;
        output += `Critical Tests: ${statistics.criticalTests}\n`;
        output += `Non-Critical Tests: ${statistics.nonCriticalTests}\n\n`;
        output += 'Test Results:\n';
        output += '-'.repeat(40) + '\n';
        Object.entries(results).forEach(([type, result]) => {
            if (!result) {
                output += `❓ ${type.toUpperCase()}: NOT RUN\n`;
                return;
            }
            const status = result.status;
            const icon = status === 'passed'
                ? '✅'
                : status === 'failed'
                    ? '❌'
                    : status === 'skipped'
                        ? '⏭️'
                        : status === 'generated'
                            ? '📊'
                            : '❓';
            const duration = result.duration ? ` (${Math.round(result.duration)}ms)` : '';
            const retryInfo = result.retryCount && result.retryCount > 0 ? ` (retries: ${result.retryCount})` : '';
            output += `${icon} ${type.toUpperCase()}: ${status.toUpperCase()}${duration}${retryInfo}\n`;
            if (result.error) {
                output += `   Error: ${result.error}\n`;
            }
            if (result.metadata) {
                output += `   Description: ${result.metadata.description}\n`;
                output += `   Critical: ${result.metadata.critical ? 'Yes' : 'No'}\n`;
            }
        });
        output += '\n' + '='.repeat(60) + '\n';
        if (statistics.passedTests === statistics.totalTests) {
            output += '🎉 ALL TESTS PASSED!\n';
        }
        else {
            output += `⚠️  ${statistics.passedTests}/${statistics.totalTests} test suites passed\n`;
        }
        if (!this.canProceed()) {
            output += '🚨 CRITICAL TESTS FAILED - CANNOT PROCEED!\n';
        }
        return output;
    }
    async runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const child = spawn(command, args, {
                stdio: 'inherit',
                ...options,
            });
            let stdout = '';
            let stderr = '';
            if (options.stdio === 'pipe') {
                child.stdout?.on('data', (data) => {
                    stdout += data.toString();
                });
                child.stderr?.on('data', (data) => {
                    stderr += data.toString();
                });
            }
            child.on('close', (code) => {
                const duration = performance.now() - startTime;
                if (code === 0) {
                    resolve({
                        success: true,
                        exitCode: code,
                        duration,
                        stdout: stdout || undefined,
                        stderr: stderr || undefined
                    });
                }
                else {
                    reject(new CommandExecutionResultClass({
                        success: false,
                        exitCode: code,
                        duration,
                        error: stderr || `Command failed with exit code ${code}`,
                        stdout: stdout || undefined,
                        stderr: stderr || undefined
                    }));
                }
            });
            child.on('error', (error) => {
                const duration = performance.now() - startTime;
                reject(new CommandExecutionResultClass({
                    success: false,
                    exitCode: null,
                    duration,
                    error: error.message,
                    stderr: error.message
                }));
            });
        });
    }
    async waitForServer(url, timeout = 30000, healthCheck) {
        const config = healthCheck || DEFAULT_HEALTH_CHECK;
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                // Use fetch instead of axios for better Bun compatibility
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(config.interval),
                    headers: config.headers
                });
                if (response.status === (config.expectedStatus || 200)) {
                    return;
                }
            }
            catch (error) {
                // Server not ready yet, wait and retry
                await new Promise((resolve) => setTimeout(resolve, config.interval));
            }
        }
        throw new TestRunnerError('SERVER_TIMEOUT', `Server at ${url} did not start within ${timeout}ms`);
    }
    /**
     * Enhanced server health check with detailed reporting
     */
    async checkServerHealth(url, healthCheck) {
        const config = healthCheck || DEFAULT_HEALTH_CHECK;
        const startTime = performance.now();
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(config.timeout),
                headers: config.headers
            });
            const duration = performance.now() - startTime;
            if (response.status === (config.expectedStatus || 200)) {
                return {
                    success: true,
                    exitCode: 0,
                    duration,
                    stdout: `Server is healthy (Status: ${response.status})`
                };
            }
            else {
                return {
                    success: false,
                    exitCode: response.status,
                    duration,
                    error: `Server returned unexpected status: ${response.status}`,
                    stderr: `Expected ${config.expectedStatus || 200}, got ${response.status}`
                };
            }
        }
        catch (error) {
            const duration = performance.now() - startTime;
            return {
                success: false,
                exitCode: null,
                duration,
                error: error instanceof Error ? error.message : String(error),
                stderr: `Failed to connect to server at ${url}`
            };
        }
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
//# sourceMappingURL=test-runner.js.map