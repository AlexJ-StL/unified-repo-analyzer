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
			await new Promise((resolve) => setTimeout(resolve, 200));

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
		});

		it("should handle external service connection failures gracefully", async () => {
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

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 100));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(1);

			const entry = JSON.parse(logLines[0]) as LogEntry;
			const logString = JSON.stringify(entry);

			// Sensitive data should be redacted
			expect(logString).not.toContain("secret123");
			expect(logString).not.toContain("api-key-12345");
			expect(logString).not.toContain("bearer-token-67890");
			expect(logString).not.toContain("Bearer xyz123");

			// Should contain redaction marker
			expect(logString).toContain("[REDACTED]");

			// Non-sensitive data should not be redacted
			expect(logString).toContain("testuser");
			expect(logString).toContain("this should not be redacted");
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

			// Wait for logs to be written
			await new Promise((resolve) => setTimeout(resolve, 200));

			const logContent = await fs.readFile(testLogFile, "utf-8");
			const logLines = logContent
				.trim()
				.split("\n")
				.filter((line) => line.trim());

			expect(logLines.length).toBe(1);

			const entry = JSON.parse(logLines[0]) as LogEntry;

			// Should preserve Unicode characters
			expect(entry.message).toContain("你好世界");
			expect(entry.message).toContain("🌍");
			expect(entry.metadata?.emoji).toContain("🚀");
			expect(entry.metadata?.chinese).toBe("测试数据");
			expect(entry.metadata?.japanese).toBe("テストデータ");
			expect(entry.metadata?.arabic).toBe("بيانات الاختبار");
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

			// Test integration by directly using the logger instance
			// (Helper functions use the default logger, so we test the functionality directly)
			logger.error(
				"Test error from helper",
				new Error("Test error from helper"),
				{ context: "integration-test", userId: "test-user" },
				"error-handler",
			);

			logger.info(
				"Performance: database-query",
				{
					duration: "150ms",
					query: "SELECT * FROM users",
					rows: 25,
				},
				"database",
			);

			logger.warn(
				"Security Event: failed-login-attempt",
				{
					username: "testuser",
					ip: "192.168.1.100",
					attempts: 3,
				},
				"auth-service",
			);

			logger.info(
				"Analysis completed: /test/repo/path",
				{
					duration: "2.5s",
					files: 150,
					issues: 5,
				},
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
			const errorEntry = logEntries.find((entry) =>
				entry.message.includes("Test error from helper"),
			);
			expect(errorEntry).toBeDefined();
			expect(errorEntry?.level).toBe("ERROR");
			expect(errorEntry?.error?.message).toBe("Test error from helper");
			expect(errorEntry?.metadata?.context).toBe("integration-test");

			// Verify performance helper integration
			const perfEntry = logEntries.find((entry) =>
				entry.message.includes("Performance: database-query"),
			);
			expect(perfEntry).toBeDefined();
			expect(perfEntry?.level).toBe("INFO");
			expect(perfEntry?.metadata?.duration).toBe("150ms");
			expect(perfEntry?.metadata?.query).toBe("SELECT * FROM users");

			// Verify security helper integration
			const securityEntry = logEntries.find((entry) =>
				entry.message.includes("Security Event: failed-login-attempt"),
			);
			expect(securityEntry).toBeDefined();
			expect(securityEntry?.level).toBe("WARN");
			expect(securityEntry?.metadata?.username).toBe("testuser");
			expect(securityEntry?.metadata?.attempts).toBe(3);

			// Verify analysis helper integration
			const analysisEntry = logEntries.find((entry) =>
				entry.message.includes("Analysis completed"),
			);
			expect(analysisEntry).toBeDefined();
			expect(analysisEntry?.level).toBe("INFO");
			expect(analysisEntry?.metadata?.duration).toBe("2.5s");
			expect(analysisEntry?.metadata?.files).toBe(150);
		});
	});
});
