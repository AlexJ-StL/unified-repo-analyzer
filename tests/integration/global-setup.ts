/**
 * Global setup for integration tests
 */

import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function setup() {
	console.log("Setting up integration test environment...");

	// Create temporary directories for tests
	const testTmpDir = path.join(
		tmpdir(),
		"unified-repo-analyzer-integration-tests",
	);

	try {
		await fs.mkdir(testTmpDir, { recursive: true });
		console.log(`Created test directory: ${testTmpDir}`);
	} catch (error) {
		console.warn("Failed to create test directory:", error);
	}

	// Set environment variables for tests
	process.env.TEST_TMP_DIR = testTmpDir;
	process.env.NODE_ENV = "test";
	process.env.LOG_LEVEL = "ERROR";

	// Increase timeout for CI environments
	if (process.env.CI) {
		process.env.TEST_TIMEOUT = "120000"; // 2 minutes in CI
	}

	console.log("Integration test environment setup complete");
}

export async function teardown() {
	console.log("Cleaning up integration test environment...");

	const testTmpDir = process.env.TEST_TMP_DIR;
	if (testTmpDir) {
		try {
			await fs.rm(testTmpDir, { recursive: true, force: true });
			console.log(`Cleaned up test directory: ${testTmpDir}`);
		} catch (error) {
			console.warn("Failed to cleanup test directory:", error);
		}
	}

	console.log("Integration test environment cleanup complete");
}
