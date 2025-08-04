#!/usr/bin/env bun
/**
 * Comprehensive test runner script with advanced TypeScript features
 * Orchestrates different types of tests and generates reports with strict type safety
 */
/**
 * Test configuration with strict typing
 */
interface TestConfiguration {
    timeout: number;
    retryAttempts: number;
    skipPerformanceTests: boolean;
    coverageEnabled: boolean;
    parallelExecution: boolean;
}
/**
 * Server health check configuration
 */
interface ServerHealthCheck {
    url: string;
    timeout: number;
    interval: number;
    expectedStatus?: number;
    headers?: Record<string, string>;
}
/**
 * Command execution result with detailed output
 */
interface CommandExecutionResult {
    success: boolean;
    exitCode: number | null;
    stdout?: string;
    stderr?: string;
    duration: number;
    error?: string;
}
declare class TestRunner {
    private results;
    private startTime;
    private config;
    private metadata;
    constructor(config?: Partial<TestConfiguration>);
    /**
     * Initialize test suite metadata
     */
    private initializeMetadata;
    /**
     * Get test suite metadata by type
     */
    private getTestMetadata;
    /**
     * Validate test dependencies
     */
    private validateDependencies;
    /**
     * Execute test with retry logic
     */
    private executeWithRetry;
    /**
     * Get test execution statistics
     */
    getExecutionStats(): {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        skippedTests: number;
        criticalTests: number;
        nonCriticalTests: number;
    };
    /**
     * Check if test suite can proceed based on critical test results
     */
    canProceed(): boolean;
    /**
     * Validate configuration
     */
    private validateConfiguration;
    run(): Promise<void>;
    /**
     * Enhanced run method with dependency validation and error handling
     */
    runWithValidation(): Promise<void>;
    private runUnitTests;
    private runIntegrationTests;
    private runE2ETests;
    private runPerformanceTests;
    private generateCoverageReport;
    private generateSummaryReport;
    private generateHumanReport;
    private runCommand;
    private waitForServer;
    /**
     * Enhanced server health check with detailed reporting
     */
    checkServerHealth(url: string, healthCheck?: ServerHealthCheck): Promise<CommandExecutionResult>;
}
export default TestRunner;
