/**
 * Global test setup configuration
 */

import { config } from "dotenv";
import { join } from "path";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

// Load test environment variables
config({ path: join(__dirname, "../.env.test") });

// Global test configuration
beforeAll(async () => {
	// Set test environment
	process.env.NODE_ENV = "test";

	// Increase timeout for CI environments
	if (process.env.CI) {
		process.env.TEST_TIMEOUT = "60000";
	}

	// Mock console methods in test environment
	if (process.env.SILENT_TESTS === "true") {
		global.console = {
			...console,
			log: () => {},
			info: () => {},
			warn: () => {},
			error: () => {},
		};
	}
});

afterAll(async () => {
	// Cleanup after all tests
});

beforeEach(() => {
	// Reset mocks before each test
	// Vitest mocks are automatically reset
});

afterEach(() => {
	// Cleanup after each test
});

// Global test utilities
// Custom assertions can be added here if needed
