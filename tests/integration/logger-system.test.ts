/**
 * Logging system integration tests
 * Tests log correlation across components, external logging service integration,
 * load testing for logging performance, and log format validation
 * Requirements: 3.1, 3.2, 4.1, 6.1
 */

import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import {
	type LogEntry,
	Logger,
	type LoggerConfig,
	logAnalysis,
	logError,
	logPerformance,
	logSecurityEvent,
	requestLogger,
} from "../../packages/backend/src/services/logger.service.js";

describe("Logging System Integration Tests", () => {
	let testDir: string;
	let logDir: string;
	let testLoggers: Logger[] = [];

	beforeAll(async () => {
		testDir = path.join(tmpdir(), "logger-integration-tests");
		logDir = path.join(testDir, "logs");
		await fs.mkdir(testDir, { recursive: true });
		await fs.mkdir(logDir, { recursive: true });
	});

	afterAll(async () => {
		// Cleanup test loggers
		testLoggers.forEach((logger) => {
			// Force cleanup of any open file handles
			try {
				(logger as any).winston?.close?.();
			} catch (error) {
				// Ignore cleanup errors
			}
		});

		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			console.warn("Failed to cleanup test directory:", error);
		}
	});

	beforeEach(() => {
		testLoggers = [];
	});

	afterEach(async () => {
		// Cleanup test loggers
		testLoggers.forEach((logger) => {
			try {
				(logger as any).winston?.close?.();
			} catch (error) {
				// Ignore cleanup errors
			}
		});
		testLoggers = [];
	});

	describe("Log Correlation Across Components", () => {
		it("should maintain request ID correlation across multiple components", async () => {
			const testLogFile = path.join(logDir, "correlation-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"correlation-test",
			);

			testLoggers.push(logger);

			const requestId = "test-request-123";
			logger.setRequestId(requestId);

			// Log from different components with same request ID
			logger.info(
				"Request started",
				{ operation: "test" },
				"api-gateway",
				requestId,
			);
			logger.debug(
				"Path validation started",
				{ path: "/test/path" },
				"path-handler",
				requestId,
			);
			logger.info(
				"Permission check completed",
				{ canRead: true },
				"permission-service",
				requestId,
			);
			logger.info(
				"Request completed",
				{ duration: "100ms" },
				"api-gateway",
				requestId,
			);

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Read and verify log correlation
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(4);

			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);

			// All entries should have the same request ID
			logEntries.forEach((entry) => {
				expect(entry.requestId).toBe(requestId);
			});

			// Should have entries from different components
			const components = logEntries.map((entry) => entry.component);
			expect(components).toContain("api-gateway");
			expect(components).toContain("path-handler");
			expect(components).toContain("permission-service");

			// Entries should be in chronological order
			const timestamps = logEntries.map((entry) =>
				new Date(entry.timestamp).getTime(),
			);
			for (let i = 1; i < timestamps.length; i++) {
				expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
			}
		});

		it("should correlate logs across simulated HTTP request lifecycle", async () => {
			const testLogFile = path.join(logDir, "http-correlation-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"http-correlation-test",
			);

			testLoggers.push(logger);

			const requestId = "http-test-123";
			logger.setRequestId(requestId);

			// Simulate HTTP request lifecycle logging
			logger.info(
				"HTTP request received",
				{
					method: "POST",
					url: "/api/analyze",
					path: "/test/repo",
				},
				"api-gateway",
				requestId,
			);

			logger.debug(
				"Path validation started",
				{
					path: "/test/repo",
				},
				"path-handler",
				requestId,
			);

			logger.info(
				"Analysis completed",
				{
					duration: "2.5s",
					status: "success",
				},
				"analyzer",
				requestId,
			);

			logger.info(
				"HTTP response sent",
				{
					status: 200,
					duration: "2.6s",
				},
				"api-gateway",
				requestId,
			);

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify correlation across HTTP lifecycle
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(4);

			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);

			// All entries should have the same request ID
			logEntries.forEach((entry) => {
				expect(entry.requestId).toBe(requestId);
			});

			// Should have entries from different components
			const components = logEntries.map((entry) => entry.component);
			expect(components).toContain("api-gateway");
			expect(components).toContain("path-handler");
			expect(components).toContain("analyzer");
		});

		it("should handle concurrent requests with separate correlation IDs", async () => {
			const testLogFile = path.join(logDir, "concurrent-correlation-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"concurrent-test",
			);

			testLoggers.push(logger);

			// Simulate concurrent operations with different request IDs
			const operations = Array.from({ length: 5 }, (_, i) => ({
				requestId: `concurrent-request-${i}`,
				operation: `operation-${i}`,
			}));

			await Promise.all(
				operations.map(async ({ requestId, operation }) => {
					logger.setRequestId(requestId);
					logger.info(
						"Operation started",
						{ operation },
						"test-component",
						requestId,
					);

					// Simulate some async work
					await new Promise((resolve) =>
						setTimeout(resolve, Math.random() * 50),
					);

					logger.info(
						"Operation completed",
						{ operation, result: "success" },
						"test-component",
						requestId,
					);
				}),
			);

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());
			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);

			// Should have logs for all operations
			expect(logEntries.length).toBeGreaterThanOrEqual(operations.length * 2);

			// Each request ID should appear in multiple log entries
			operations.forEach(({ requestId }) => {
				const requestLogs = logEntries.filter(
					(entry) => entry.requestId === requestId,
				);
				expect(requestLogs.length).toBeGreaterThanOrEqual(2);
			});

			// No request ID should be mixed with another operation's logs
			const requestGroups = logEntries.reduce(
				(groups, entry) => {
					if (!groups[entry.requestId]) {
						groups[entry.requestId] = [];
					}
					groups[entry.requestId].push(entry);
					return groups;
				},
				{} as Record<string, LogEntry[]>,
			);

			Object.entries(requestGroups).forEach(([requestId, entries]) => {
				// All entries for a request ID should have consistent metadata
				const operations = entries
					.map((entry) => entry.metadata?.operation)
					.filter(Boolean);
				const uniqueOperations = [...new Set(operations)];
				expect(uniqueOperations.length).toBeLessThanOrEqual(1);
			});
		});
	});

	describe("External Logging Service Integration", () => {
		it("should format logs correctly for external services", async () => {
			const testLogFile = path.join(logDir, "external-format-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"external-test",
			);

			testLoggers.push(logger);

			// Test various log types that would be sent to external services
			logger.info("User authentication", {
				userId: "user123",
				action: "login",
				ip: "192.168.1.100",
				userAgent: "Mozilla/5.0...",
			});

			logger.error(
				"Database connection failed",
				new Error("Connection timeout"),
				{
					database: "primary",
					host: "db.example.com",
					port: 5432,
				},
			);

			logger.warn("Rate limit exceeded", {
				userId: "user456",
				endpoint: "/api/analyze",
				requestCount: 100,
				timeWindow: "1h",
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify logs were written in correct format for external services
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(3);

			// Verify each log entry is valid JSON and has required fields for external services
			logLines.forEach((line) => {
				const entry = JSON.parse(line) as LogEntry;

				// Required fields for external logging services
				expect(entry).toHaveProperty("timestamp");
				expect(entry).toHaveProperty("level");
				expect(entry).toHaveProperty("component");
				expect(entry).toHaveProperty("requestId");
				expect(entry).toHaveProperty("message");
				expect(entry.component).toBe("external-test");

				// Timestamp should be ISO format for external services
				expect(() => new Date(entry.timestamp)).not.toThrow();
				expect(new Date(entry.timestamp).getTime()).toBeGreaterThan(0);
			});

			// Verify logger configuration
			const config = logger.getConfig();
			expect(config.format).toBe("JSON");
			expect(config.redactSensitiveData).toBe(true);
			expect(config.includeStackTrace).toBe(true);
		});

		it("should handle external service connection failures gracefully", async () => {
			// Mock external service that fails
			const mockExternalTransport = vi.fn().mockImplementation(() => {
				throw new Error("External service unavailable");
			});

			// Create logger with mock external endpoint
			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "console",
							config: { colorize: false },
						},
					],
					format: "JSON",
				},
				"external-failure-test",
			);

			testLoggers.push(logger);

			// Should not throw errors even if external service is unavailable
			expect(() => {
				logger.info("Test message for external service");
				logger.error(
					"Test error for external service",
					new Error("Test error"),
				);
			}).not.toThrow();
		});

		it("should batch logs efficiently for external services", async () => {
			const testLogFile = path.join(logDir, "batch-external-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"batch-test",
			);

			testLoggers.push(logger);

			const startTime = Date.now();
			const logCount = 100;

			// Generate many log entries quickly
			for (let i = 0; i < logCount; i++) {
				logger.info(`Batch log entry ${i}`, {
					index: i,
					timestamp: Date.now(),
					data: `test-data-${i}`,
				});
			}

			const duration = Date.now() - startTime;

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Verify all logs were written
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(logCount);
			expect(duration).toBeLessThan(1000); // Should be fast

			// Verify log format consistency
			logLines.forEach((line, index) => {
				const entry = JSON.parse(line) as LogEntry;
				expect(entry.message).toBe(`Batch log entry ${index}`);
				expect(entry.metadata?.index).toBe(index);
			});
		});

		it("should validate external service log format compliance", async () => {
			const testLogFile = path.join(logDir, "external-compliance-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"compliance-test",
			);

			testLoggers.push(logger);

			// Log entries that external services commonly expect
			logger.info("Application started", {
				version: "1.0.0",
				environment: "test",
				nodeVersion: process.version,
			});

			logger.warn("High memory usage detected", {
				memoryUsage: process.memoryUsage(),
				threshold: "80%",
				action: "alert-sent",
			});

			logger.error("Service unavailable", new Error("Connection refused"), {
				service: "database",
				retryAttempt: 3,
				maxRetries: 5,
			});

			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(3);

			// Validate compliance with common external logging service requirements
			logLines.forEach((line) => {
				const entry = JSON.parse(line) as LogEntry;

				// Common external service requirements
				expect(entry.timestamp).toMatch(
					/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/,
				);
				expect(["INFO", "WARN", "ERROR"]).toContain(entry.level);
				expect(entry.requestId).toBeDefined();
				expect(typeof entry.requestId).toBe("string");
				expect(entry.requestId.length).toBeGreaterThan(0);

				// Metadata should be properly structured
				if (entry.metadata) {
					expect(typeof entry.metadata).toBe("object");
					expect(entry.metadata).not.toBeNull();
				}

				// Error entries should have error details
				if (entry.level === "ERROR") {
					expect(entry.error).toBeDefined();
					expect(entry.error?.name).toBeDefined();
					expect(entry.error?.message).toBeDefined();
				}
			});
		});

		it("should handle external service rate limiting", async () => {
			const testLogFile = path.join(logDir, "rate-limit-test.log");
			let logCount = 0;

			// Mock rate-limited external service
			const rateLimitedLogger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"rate-limit-test",
			);

			testLoggers.push(rateLimitedLogger);

			// Simulate rapid logging that might trigger rate limits
			const rapidLogs = 50;
			const startTime = Date.now();

			for (let i = 0; i < rapidLogs; i++) {
				rateLimitedLogger.info(`Rapid log ${i}`, {
					sequence: i,
					timestamp: Date.now(),
				});
				logCount++;
			}

			const duration = Date.now() - startTime;

			// Wait for logs to be processed
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Verify logs were handled gracefully
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			// Should handle all logs even under rapid conditions
			expect(logLines.length).toBe(rapidLogs);
			expect(duration).toBeLessThan(2000); // Should complete reasonably fast

			// Verify log integrity
			logLines.forEach((line, index) => {
				const entry = JSON.parse(line) as LogEntry;
				expect(entry.message).toBe(`Rapid log ${index}`);
				expect(entry.metadata?.sequence).toBe(index);
			});
		});
	});

	describe("Load Testing for Logging Performance", () => {
		it("should handle high-volume logging without performance degradation", async () => {
			const testLogFile = path.join(logDir, "load-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "50MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: false, // Disable for performance
				},
				"load-test",
			);

			testLoggers.push(logger);

			const iterations = 1000;
			const startTime = Date.now();
			const startMemory = process.memoryUsage();

			// Generate high volume of logs
			for (let i = 0; i < iterations; i++) {
				logger.info(`Load test message ${i}`, {
					iteration: i,
					timestamp: Date.now(),
					randomData: Math.random().toString(36),
					largeData: "x".repeat(100), // Some bulk data
				});

				// Occasionally log errors and warnings
				if (i % 100 === 0) {
					logger.warn(`Warning at iteration ${i}`, { iteration: i });
				}
				if (i % 200 === 0) {
					logger.error(
						`Error at iteration ${i}`,
						new Error(`Test error ${i}`),
						{ iteration: i },
					);
				}
			}

			const duration = Date.now() - startTime;
			const endMemory = process.memoryUsage();

			// Wait for all logs to be written
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Performance assertions
			expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
			expect(duration / iterations).toBeLessThan(5); // Less than 5ms per log entry

			// Memory usage should not grow excessively
			const memoryGrowth = endMemory.heapUsed - startMemory.heapUsed;
			const memoryGrowthMB = memoryGrowth / (1024 * 1024);
			expect(memoryGrowthMB).toBeLessThan(100); // Less than 100MB growth

			// Verify log file was created and has expected content
			const stats = await fs.stat(testLogFile);
			expect(stats.size).toBeGreaterThan(0);

			// Sample check - read first and last few lines
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(iterations);

			// Verify first and last entries
			const firstEntry = JSON.parse(logLines[0]) as LogEntry;
			const lastEntry = JSON.parse(logLines[logLines.length - 1]) as LogEntry;

			expect(firstEntry.message).toContain("Load test message 0");
			expect(lastEntry.message).toContain("Load test message");
		});

		it("should handle concurrent logging from multiple components", async () => {
			const testLogFile = path.join(logDir, "concurrent-load-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "50MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"concurrent-load-test",
			);

			testLoggers.push(logger);

			const componentCount = 5;
			const logsPerComponent = 200;
			const startTime = Date.now();

			// Simulate multiple components logging concurrently
			const componentPromises = Array.from(
				{ length: componentCount },
				(_, componentIndex) =>
					Promise.resolve().then(async () => {
						const componentName = `component-${componentIndex}`;
						const requestId = `request-${componentIndex}`;

						for (let i = 0; i < logsPerComponent; i++) {
							logger.info(
								`Message ${i} from ${componentName}`,
								{
									component: componentName,
									iteration: i,
									timestamp: Date.now(),
								},
								componentName,
								requestId,
							);

							// Add small random delay to simulate real-world timing
							if (i % 50 === 0) {
								await new Promise((resolve) =>
									setTimeout(resolve, Math.random() * 10),
								);
							}
						}
					}),
			);

			await Promise.all(componentPromises);

			const duration = Date.now() - startTime;

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Performance assertions
			const totalLogs = componentCount * logsPerComponent;
			expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
			expect(duration / totalLogs).toBeLessThan(10); // Less than 10ms per log entry

			// Verify log file content
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(totalLogs);

			// Verify logs from all components are present
			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);
			const componentNames = [
				...new Set(logEntries.map((entry) => entry.component)),
			];

			expect(componentNames).toHaveLength(componentCount);
			componentNames.forEach((name) => {
				expect(name).toMatch(/^component-\d+$/);
			});

			// Verify request ID correlation
			const requestIds = [
				...new Set(logEntries.map((entry) => entry.requestId)),
			];
			expect(requestIds).toHaveLength(componentCount);
		});

		it("should maintain performance during log rotation", async () => {
			const testLogFile = path.join(logDir, "rotation-performance-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "1MB", // Small size to trigger rotation
								maxFiles: 3,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"rotation-test",
			);

			testLoggers.push(logger);

			const iterations = 2000; // Enough to trigger rotation
			const startTime = Date.now();

			for (let i = 0; i < iterations; i++) {
				logger.info(`Rotation test message ${i}`, {
					iteration: i,
					largeData: "x".repeat(500), // Make logs larger to trigger rotation faster
					timestamp: Date.now(),
				});
			}

			const duration = Date.now() - startTime;

			// Wait for logs to be written and rotation to complete
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Should still perform well even with rotation
			expect(duration).toBeLessThan(10000);
			expect(duration / iterations).toBeLessThan(5);

			// Check if rotation occurred by looking for rotated files
			const logDir = path.dirname(testLogFile);
			const files = await fs.readdir(logDir);
			const rotatedFiles = files.filter((file) =>
				file.includes("rotation-performance-test"),
			);

			// Should have multiple log files if rotation occurred
			expect(rotatedFiles.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Log Format and Content Validation", () => {
		it("should produce valid JSON format logs", async () => {
			const testLogFile = path.join(logDir, "json-format-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"json-format-test",
			);

			testLoggers.push(logger);

			// Log various types of messages
			logger.debug("Debug message", { debugData: "test" });
			logger.info("Info message", { infoData: 123, nested: { key: "value" } });
			logger.warn("Warning message", { warnData: true });
			logger.error("Error message", new Error("Test error"), {
				errorContext: "test",
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(4);

			logLines.forEach((line) => {
				// Should be valid JSON
				expect(() => JSON.parse(line)).not.toThrow();

				const entry = JSON.parse(line) as LogEntry;

				// Should have required fields
				expect(entry).toHaveProperty("timestamp");
				expect(entry).toHaveProperty("level");
				expect(entry).toHaveProperty("component");
				expect(entry).toHaveProperty("requestId");
				expect(entry).toHaveProperty("message");

				// Timestamp should be valid ISO string
				expect(() => new Date(entry.timestamp)).not.toThrow();
				expect(new Date(entry.timestamp).getTime()).toBeGreaterThan(0);

				// Level should be uppercase
				expect(["DEBUG", "INFO", "WARN", "ERROR"]).toContain(entry.level);

				// Component should be set
				expect(entry.component).toBe("json-format-test");

				// Request ID should be present
				expect(entry.requestId).toBeDefined();
				expect(typeof entry.requestId).toBe("string");
				expect(entry.requestId.length).toBeGreaterThan(0);
			});

			// Check error entry has error details
			const errorEntry = JSON.parse(logLines[3]) as LogEntry;
			expect(errorEntry.error).toBeDefined();
			expect(errorEntry.error?.name).toBe("Error");
			expect(errorEntry.error?.message).toBe("Test error");
			expect(errorEntry.error?.stack).toBeDefined();
		});

		it("should properly redact sensitive data", async () => {
			const testLogFile = path.join(logDir, "redaction-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					redactSensitiveData: true,
				},
				"redaction-test",
			);

			testLoggers.push(logger);

			// Log messages with sensitive data
			logger.info("User login attempt", {
				username: "testuser",
				password: "secret123",
				apiKey: "api-key-12345",
				token: "bearer-token-67890",
				authorization: "Bearer xyz123",
				normalData: "this should not be redacted",
			});

			logger.info("Database connection", {
				host: "db.example.com",
				port: 5432,
				database: "myapp",
				secret: "db-secret-key",
				connectionString: "postgres://user:password@host/db",
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(2);

			logLines.forEach((line) => {
				const entry = JSON.parse(line) as LogEntry;
				const logString = JSON.stringify(entry);

				// Sensitive data should be redacted
				expect(logString).not.toContain("secret123");
				expect(logString).not.toContain("api-key-12345");
				expect(logString).not.toContain("bearer-token-67890");
				expect(logString).not.toContain("Bearer xyz123");
				expect(logString).not.toContain("db-secret-key");

				// Should contain redaction marker
				expect(logString).toContain("[REDACTED]");

				// Non-sensitive data should not be redacted
				expect(logString).toContain("testuser");
				expect(logString).toContain("this should not be redacted");
				expect(logString).toContain("db.example.com");
				expect(logString).toContain("5432");
			});
		});

		it("should handle special characters and Unicode in logs", async () => {
			const testLogFile = path.join(logDir, "unicode-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"unicode-test",
			);

			testLoggers.push(logger);

			// Log messages with various special characters and Unicode
			logger.info("Unicode test: 你好世界 🌍", {
				emoji: "🚀💻🔥",
				chinese: "测试数据",
				japanese: "テストデータ",
				arabic: "بيانات الاختبار",
				special: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
				quotes: 'Single "double" quotes',
				newlines: "Line 1\nLine 2\nLine 3",
				tabs: "Column1\tColumn2\tColumn3",
			});

			logger.info("Path with backslashes", {
				windowsPath: "C:\\Users\\Test\\Documents\\file.txt",
				unixPath: "/home/user/documents/file.txt",
				mixedPath: "C:/Users/Test\\Documents/file.txt",
			});

			logger.error("Error with special chars", new Error("Failed: 特殊字符错误"), {
				errorCode: "ERR_UNICODE_001",
				details: "Error occurred while processing: 文件处理失败",
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(3);

			logLines.forEach((line) => {
				// Should be valid JSON despite special characters
				expect(() => JSON.parse(line)).not.toThrow();

				const entry = JSON.parse(line) as LogEntry;

				// Should preserve Unicode characters
				if (entry.message.includes("Unicode test")) {
					expect(entry.message).toContain("你好世界");
					expect(entry.message).toContain("🌍");
					expect(entry.metadata?.emoji).toContain("🚀");
					expect(entry.metadata?.chinese).toBe("测试数据");
					expect(entry.metadata?.japanese).toBe("テストデータ");
					expect(entry.metadata?.arabic).toBe("بيانات الاختبار");
				}

				// Should handle special characters properly
				if (entry.message.includes("Path with backslashes")) {
					expect(entry.metadata?.windowsPath).toContain("C:\\Users");
					expect(entry.metadata?.unixPath).toContain("/home/user");
				}

				// Should handle errors with Unicode
				if (entry.level === "ERROR") {
					expect(entry.error?.message).toContain("特殊字符错误");
					expect(entry.metadata?.details).toContain("文件处理失败");
				}
			});
		});

		it("should validate log entry completeness and structure", async () => {
			const testLogFile = path.join(logDir, "structure-validation-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"structure-test",
			);

			testLoggers.push(logger);

			// Test all log levels
			logger.debug("Debug message", { debugLevel: true });
			logger.info("Info message", { infoLevel: true });
			logger.warn("Warning message", { warnLevel: true });
			logger.error("Error message", new Error("Test error"), { errorLevel: true });

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(4);

			const requiredFields = ['timestamp', 'level', 'component', 'requestId', 'message'];
			const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

			logLines.forEach((line, index) => {
				const entry = JSON.parse(line) as LogEntry;

				// Validate required fields
				requiredFields.forEach(field => {
					expect(entry).toHaveProperty(field);
					expect(entry[field as keyof LogEntry]).toBeDefined();
					expect(entry[field as keyof LogEntry]).not.toBe('');
				});

				// Validate log level
				expect(entry.level).toBe(logLevels[index]);

				// Validate timestamp format
				expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
				expect(new Date(entry.timestamp).getTime()).toBeGreaterThan(0);

				// Validate component
				expect(entry.component).toBe('structure-test');

				// Validate request ID format (UUID)
				expect(entry.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

				// Validate metadata structure
				if (entry.metadata) {
					expect(typeof entry.metadata).toBe('object');
					expect(entry.metadata).not.toBeNull();
				}

				// Validate error structure for error entries
				if (entry.level === 'ERROR') {
					expect(entry.error).toBeDefined();
					expect(entry.error?.name).toBeDefined();
					expect(entry.error?.message).toBeDefined();
					expect(entry.error?.stack).toBeDefined();
				}
			});
		});

		it("should handle large log entries without corruption", async () => {
			const testLogFile = path.join(logDir, "large-entry-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"large-entry-test",
			);

			testLoggers.push(logger);

			// Create large metadata objects
			const largeArray = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
				name: `item-${i}`,
				data: `data-${i}`.repeat(10),
			}));

			const largeString = "x".repeat(10000);
			const nestedObject = {
				level1: {
					level2: {
						level3: {
							level4: {
								data: largeArray.slice(0, 100),
								text: largeString.slice(0, 1000),
							},
						},
					},
				},
			};

			logger.info("Large entry test", {
				largeArray: largeArray.slice(0, 50), // Smaller subset
				largeString: largeString.slice(0, 500),
				nestedObject,
				timestamp: Date.now(),
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 300));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(1);

			// Should be valid JSON despite large size
			const entry = JSON.parse(logLines[0]) as LogEntry;
			expect(entry.message).toBe("Large entry test");
			expect(entry.metadata?.largeArray).toHaveLength(50);
			expect(entry.metadata?.largeString).toHaveLength(500);
			expect(entry.metadata?.nestedObject.level1.level2.level3.level4).toBeDefined();
		});

		it("should maintain log format consistency across different scenarios", async () => {
			const testLogFile = path.join(logDir, "format-consistency-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
					redactSensitiveData: true,
				},
				"consistency-test",
			);

			testLoggers.push(logger);

			// Test various logging scenarios
			logger.info("Simple message");
			logger.info("Message with metadata", { key: "value" });
			logger.info("Message with null metadata", { nullValue: null, undefinedValue: undefined });
			logger.info("Message with array", { items: [1, 2, 3, "four", { nested: true }] });
			logger.error("Error without metadata", new Error("Simple error"));
			logger.error("Error with metadata", new Error("Complex error"), { context: "test" });
			logger.warn("Warning with boolean", { isWarning: true, count: 0 });

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(7);

			// Validate consistent structure across all entries
			const baseStructure = ['timestamp', 'level', 'component', 'requestId', 'message'];
			
			logLines.forEach((line) => {
				const entry = JSON.parse(line) as LogEntry;

				// All entries should have base structure
				baseStructure.forEach(field => {
					expect(entry).toHaveProperty(field);
				});

				// Validate consistent timestamp format
				expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);

				// Validate consistent component
				expect(entry.component).toBe('consistency-test');

				// Validate consistent request ID format
				expect(entry.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

				// Error entries should have consistent error structure
				if (entry.level === 'ERROR') {
					expect(entry.error).toBeDefined();
					expect(entry.error?.name).toBe('Error');
					expect(entry.error?.message).toBeDefined();
					expect(entry.error?.stack).toBeDefined();
				}
			});
		});
	});

	describe("Integration with Helper Functions", () => {
		it("should integrate properly with logError helper", async () => {
			const testLogFile = path.join(logDir, "helper-integration-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"helper-integration-test",
			);

			testLoggers.push(logger);

			const requestId = "helper-test-123";
			logger.setRequestId(requestId);

			// Test integration with helper functions
			logError(
				new Error("Test error from helper"),
				{ context: "integration-test", userId: "test-user" },
				"error-handler",
			);

			logPerformance(
				"database-query",
				150,
				{ query: "SELECT * FROM users", rows: 25 },
				"database",
			);

			logSecurityEvent(
				"failed-login-attempt",
				{ username: "testuser", ip: "192.168.1.100", attempts: 3 },
				"auth-service",
			);

			logAnalysis(
				"/test/repo/path",
				"completed",
				{ duration: "2.5s", files: 150, issues: 5 },
				"analyzer",
			);

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(4);

			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);

			// Verify error helper integration
			const errorEntry = logEntries.find(entry => entry.message.includes("Test error from helper"));
			expect(errorEntry).toBeDefined();
			expect(errorEntry?.level).toBe("ERROR");
			expect(errorEntry?.error?.message).toBe("Test error from helper");
			expect(errorEntry?.metadata?.context).toBe("integration-test");

			// Verify performance helper integration
			const perfEntry = logEntries.find(entry => entry.message.includes("Performance: database-query"));
			expect(perfEntry).toBeDefined();
			expect(perfEntry?.level).toBe("INFO");
			expect(perfEntry?.metadata?.duration).toBe("150ms");
			expect(perfEntry?.metadata?.query).toBe("SELECT * FROM users");

			// Verify security helper integration
			const securityEntry = logEntries.find(entry => entry.message.includes("Security Event: failed-login-attempt"));
			expect(securityEntry).toBeDefined();
			expect(securityEntry?.level).toBe("WARN");
			expect(securityEntry?.metadata?.username).toBe("testuser");
			expect(securityEntry?.metadata?.attempts).toBe(3);

			// Verify analysis helper integration
			const analysisEntry = logEntries.find(entry => entry.message.includes("Analysis completed"));
			expect(analysisEntry).toBeDefined();
			expect(analysisEntry?.level).toBe("INFO");
			expect(analysisEntry?.metadata?.duration).toBe("2.5s");
			expect(analysisEntry?.metadata?.files).toBe(150);
		});

		it("should correlate logs across integrated components", async () => {
			const testLogFile = path.join(logDir, "component-correlation-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"correlation-test",
			);

			testLoggers.push(logger);

			const requestId = "integration-test-123";
			logger.setRequestId(requestId);

			// Simulate logging from multiple integrated components
			logger.info(
				"Request received",
				{ endpoint: "/api/analyze" },
				"api-gateway",
				requestId,
			);

			logError(
				new Error("Validation failed"),
				{ field: "path", value: "invalid" },
				"validator",
			);

			logPerformance(
				"path-validation",
				45,
				{ result: "failed" },
				"path-handler",
			);

			logSecurityEvent(
				"invalid-path-attempt",
				{ path: "invalid", ip: "127.0.0.1" },
				"security",
			);

			logger.warn(
				"Request rejected",
				{ reason: "invalid-path" },
				"api-gateway",
				requestId,
			);

			// Wait for all logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify correlation across components
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(5);

			// Check that logs from different components can be correlated
			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);
			const components = [
				...new Set(logEntries.map((entry) => entry.component)),
			];

			expect(components.length).toBeGreaterThan(1); // Multiple components
			expect(components).toContain("correlation-test");

			// Verify timestamps are in order
			const timestamps = logEntries.map((entry) =>
				new Date(entry.timestamp).getTime(),
			);
			for (let i = 1; i < timestamps.length; i++) {
				expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
			}
		});
	});
});Unicode test: 测试消息", {
				chinese: "中文测试",
				russian: "Тестовое сообщение",
				emoji: "🚀 🎉 ✅",
				special: "Special chars: @#$%^&*()[]{}|\\:\";'<>?,./",
				quotes: "Single 'quotes' and \"double quotes\"",
				newlines: "Line 1\nLine 2\nLine 3",
				tabs: "Column1\tColumn2\tColumn3",
			});

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(1);

			const entry = JSON.parse(logLines[0]) as LogEntry;

			// Unicode characters should be preserved
			expect(entry.message).toContain("测试消息");
			expect(entry.metadata?.chinese).toBe("中文测试");
			expect(entry.metadata?.russian).toBe("Тестовое сообщение");
			expect(entry.metadata?.emoji).toBe("🚀 🎉 ✅");

			// Special characters should be properly escaped
			expect(entry.metadata?.special).toContain("@#$%^&*()[]{}|\\:");
			expect(entry.metadata?.quotes).toContain(
				"Single 'quotes' and \"double quotes\"",
			);
			expect(entry.metadata?.newlines).toContain("\n");
			expect(entry.metadata?.tabs).toContain("\t");
		});

		it("should validate log entry structure consistency", async () => {
			const testLogFile = path.join(logDir, "structure-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
				},
				"structure-test",
			);

			testLoggers.push(logger);

			// Generate logs with different scenarios
			const scenarios = [
				{
					level: "debug",
					message: "Debug with metadata",
					metadata: { key: "value" },
				},
				{
					level: "info",
					message: "Info without metadata",
					metadata: undefined,
				},
				{
					level: "warn",
					message: "Warning with complex metadata",
					metadata: {
						nested: { deep: { value: 123 } },
						array: [1, 2, 3],
						boolean: true,
						null: null,
					},
				},
				{
					level: "error",
					message: "Error with exception",
					error: new Error("Test error"),
					metadata: { context: "test" },
				},
			];

			for (const scenario of scenarios) {
				if (scenario.level === "debug") {
					logger.debug(scenario.message, scenario.metadata);
				} else if (scenario.level === "info") {
					logger.info(scenario.message, scenario.metadata);
				} else if (scenario.level === "warn") {
					logger.warn(scenario.message, scenario.metadata);
				} else if (scenario.level === "error") {
					logger.error(scenario.message, scenario.error, scenario.metadata);
				}
			}

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(scenarios.length);

			logLines.forEach((line, index) => {
				const entry = JSON.parse(line) as LogEntry;
				const scenario = scenarios[index];

				// Basic structure validation
				expect(entry).toHaveProperty("timestamp");
				expect(entry).toHaveProperty("level");
				expect(entry).toHaveProperty("component");
				expect(entry).toHaveProperty("requestId");
				expect(entry).toHaveProperty("message");

				// Level should match (uppercase)
				expect(entry.level).toBe(scenario.level.toUpperCase());
				expect(entry.message).toBe(scenario.message);
				expect(entry.component).toBe("structure-test");

				// Metadata handling
				if (scenario.metadata) {
					expect(entry.metadata).toBeDefined();
					expect(typeof entry.metadata).toBe("object");
				}

				// Error handling
				if (scenario.error) {
					expect(entry.error).toBeDefined();
					expect(entry.error?.name).toBe("Error");
					expect(entry.error?.message).toBe("Test error");
					expect(entry.error?.stack).toBeDefined();
				}

				// Timestamp should be valid and recent
				const timestamp = new Date(entry.timestamp);
				const now = new Date();
				const timeDiff = now.getTime() - timestamp.getTime();
				expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
			});
		});
	});

	describe("Integration with Application Components", () => {
		it("should integrate with HTTP request logging middleware", async () => {
			const testLogFile = path.join(logDir, "http-integration-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					redactSensitiveData: true,
				},
				"http-test",
			);

			testLoggers.push(logger);

			// Mock HTTP request and response objects
			const mockReq = {
				method: "POST",
				url: "/api/analyze",
				path: "/api/analyze",
				query: { mode: "quick" },
				headers: {
					"content-type": "application/json",
					"user-agent": "test-agent/1.0",
					authorization: "Bearer secret-token",
				},
				body: { path: "/test/repo", options: { includeLLM: false } },
				ip: "127.0.0.1",
				get: (header: string) => mockReq.headers[header.toLowerCase()],
			};

			const mockRes = {
				statusCode: 200,
				getHeaders: () => ({
					"content-type": "application/json",
					"x-request-id": "test-123",
				}),
				send: vi.fn(),
				json: vi.fn(),
				on: vi.fn((event: string, callback: Function) => {
					if (event === "finish") {
						// Simulate response finish
						setTimeout(() => callback(), 10);
					}
				}),
			};

			const mockNext = vi.fn();

			// Test the request logger middleware
			requestLogger(mockReq, mockRes, mockNext);

			// Wait for async logging to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(mockNext).toHaveBeenCalled();
			expect(mockReq).toHaveProperty("requestId");
			expect(typeof mockReq.requestId).toBe("string");
		});

		it("should integrate with error handling and reporting", async () => {
			const testLogFile = path.join(logDir, "error-integration-test.log");

			const logger = new Logger(
				{
					level: "ERROR",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					includeStackTrace: true,
				},
				"error-test",
			);

			testLoggers.push(logger);

			// Test error logging integration
			const testError = new Error("Integration test error");
			testError.stack = "Error: Integration test error\n    at test location";

			// Use the helper function
			expect(() => {
				logError(testError, { context: "integration-test" }, "error-handler");
			}).not.toThrow();

			// Wait for log to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify error was logged
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(1);

			const errorEntry = JSON.parse(logLines[0]) as LogEntry;
			expect(errorEntry.level).toBe("ERROR");
			expect(errorEntry.message).toBe("Integration test error");
			expect(errorEntry.error?.name).toBe("Error");
			expect(errorEntry.error?.stack).toContain("Integration test error");
		});

		it("should integrate with performance monitoring", async () => {
			const testLogFile = path.join(logDir, "performance-integration-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"performance-test",
			);

			testLoggers.push(logger);

			// Test performance logging integration
			expect(() => {
				logPerformance(
					"repository-analysis",
					1250,
					{
						fileCount: 150,
						language: "JavaScript",
						cacheHit: true,
					},
					"performance-monitor",
				);
			}).not.toThrow();

			// Wait for log to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify performance log was written
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(1);

			const perfEntry = JSON.parse(logLines[0]) as LogEntry;
			expect(perfEntry.level).toBe("INFO");
			expect(perfEntry.message).toBe("Performance: repository-analysis");
			expect(perfEntry.metadata?.duration).toBe("1250ms");
			expect(perfEntry.metadata?.fileCount).toBe(150);
		});

		it("should integrate with security event logging", async () => {
			const testLogFile = path.join(logDir, "security-integration-test.log");

			const logger = new Logger(
				{
					level: "WARN",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
					redactSensitiveData: true,
				},
				"security-test",
			);

			testLoggers.push(logger);

			// Test security event logging
			expect(() => {
				logSecurityEvent(
					"suspicious-activity",
					{
						userId: "test-user",
						action: "multiple-failed-logins",
						ip: "192.168.1.100",
						attempts: 5,
						password: "secret123", // Should be redacted
					},
					"security-monitor",
				);
			}).not.toThrow();

			// Wait for log to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify security event was logged with proper redaction
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(1);

			const securityEntry = JSON.parse(logLines[0]) as LogEntry;
			expect(securityEntry.level).toBe("WARN");
			expect(securityEntry.message).toBe("Security Event: suspicious-activity");
			expect(securityEntry.metadata?.userId).toBe("test-user");
			expect(securityEntry.metadata?.attempts).toBe(5);

			// Verify sensitive data was redacted
			const logString = JSON.stringify(securityEntry);
			expect(logString).not.toContain("secret123");
			expect(logString).toContain("[REDACTED]");
		});

		it("should integrate with analysis workflow logging", async () => {
			const testLogFile = path.join(logDir, "analysis-integration-test.log");

			const logger = new Logger(
				{
					level: "INFO",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"analysis-test",
			);

			testLoggers.push(logger);

			const testPath = "/test/repository/path";

			// Test analysis logging integration
			expect(() => {
				logAnalysis(
					testPath,
					"started",
					{
						mode: "comprehensive",
						options: { includeLLMAnalysis: false },
					},
					"analysis-engine",
				);

				logAnalysis(
					testPath,
					"completed",
					{
						duration: "5.2s",
						fileCount: 150,
						language: "JavaScript",
					},
					"analysis-engine",
				);
			}).not.toThrow();

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify analysis logs were written
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(2);

			const startEntry = JSON.parse(logLines[0]) as LogEntry;
			expect(startEntry.level).toBe("INFO");
			expect(startEntry.message).toBe(`Analysis started: ${testPath}`);
			expect(startEntry.metadata?.mode).toBe("comprehensive");

			const completeEntry = JSON.parse(logLines[1]) as LogEntry;
			expect(completeEntry.level).toBe("INFO");
			expect(completeEntry.message).toBe(`Analysis completed: ${testPath}`);
			expect(completeEntry.metadata?.duration).toBe("5.2s");
			expect(completeEntry.metadata?.fileCount).toBe(150);
		});

		it("should maintain correlation across component integrations", async () => {
			const testLogFile = path.join(logDir, "component-correlation-test.log");

			const logger = new Logger(
				{
					level: "DEBUG",
					outputs: [
						{
							type: "file",
							config: {
								path: testLogFile,
								maxSize: "10MB",
								maxFiles: 1,
								rotateDaily: false,
							},
						},
					],
					format: "JSON",
				},
				"correlation-test",
			);

			testLoggers.push(logger);

			const requestId = "integration-test-123";
			logger.setRequestId(requestId);

			// Simulate logging from multiple integrated components
			logger.info(
				"Request received",
				{ endpoint: "/api/analyze" },
				"api-gateway",
				requestId,
			);

			logError(
				new Error("Validation failed"),
				{ field: "path", value: "invalid" },
				"validator",
			);

			logPerformance(
				"path-validation",
				45,
				{ result: "failed" },
				"path-handler",
			);

			logSecurityEvent(
				"invalid-path-attempt",
				{ path: "invalid", ip: "127.0.0.1" },
				"security",
			);

			logger.warn(
				"Request rejected",
				{ reason: "invalid-path" },
				"api-gateway",
				requestId,
			);

			// Wait for all logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify correlation across components
			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBeGreaterThanOrEqual(5);

			// Check that logs from different components can be correlated
			const logEntries = logLines.map((line) => JSON.parse(line) as LogEntry);
			const components = [
				...new Set(logEntries.map((entry) => entry.component)),
			];

			expect(components.length).toBeGreaterThan(1); // Multiple components
			expect(components).toContain("correlation-test");

			// Verify timestamps are in order
			const timestamps = logEntries.map((entry) =>
				new Date(entry.timestamp).getTime(),
			);
			for (let i = 1; i < timestamps.length; i++) {
				expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
			}
		});
	});
});
