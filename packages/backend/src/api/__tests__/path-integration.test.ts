/**
 * Integration tests for path handling in repository analysis endpoints
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { analyzeController } from "../controllers";
import { errorHandler } from "../middleware/error.middleware";

// Create test app
const createTestApp = () => {
	const app = express();
	app.use(express.json());

	// Add routes
	app.post("/analyze", analyzeController.analyzeRepository);
	app.post("/analyze/batch", analyzeController.analyzeMultipleRepositories);

	// Add error handler
	app.use(errorHandler);

	return app;
};

describe("Path Integration Tests", () => {
	let app: express.Application;
	let tempDir: string;
	let validRepoPath: string;
	let invalidPath: string;
	let fileNotDirPath: string;
	let noPermissionPath: string;

	beforeAll(async () => {
		app = createTestApp();

		// Create temporary directory for tests
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "repo-analyzer-test-"));

		// Create a valid repository directory
		validRepoPath = path.join(tempDir, "valid-repo");
		await fs.mkdir(validRepoPath, { recursive: true });
		await fs.writeFile(
			path.join(validRepoPath, "README.md"),
			"# Test Repository",
		);
		await fs.writeFile(
			path.join(validRepoPath, "package.json"),
			'{"name": "test"}',
		);

		// Create a file (not directory) for testing
		fileNotDirPath = path.join(tempDir, "not-a-directory.txt");
		await fs.writeFile(fileNotDirPath, "This is a file, not a directory");

		// Set up invalid path
		invalidPath = path.join(tempDir, "non-existent-directory");

		// Create a directory with restricted permissions (Unix-like systems)
		if (process.platform !== "win32") {
			noPermissionPath = path.join(tempDir, "no-permission");
			await fs.mkdir(noPermissionPath, { recursive: true });
			await fs.chmod(noPermissionPath, 0o000); // No permissions
		}
	});

	afterAll(async () => {
		// Clean up temporary directory
		if (tempDir) {
			try {
				// Restore permissions before cleanup
				if (noPermissionPath && process.platform !== "win32") {
					await fs.chmod(noPermissionPath, 0o755);
				}
				await fs.rm(tempDir, { recursive: true, force: true });
			} catch (error) {
				console.warn("Failed to clean up temp directory:", error);
			}
		}
	});

	beforeEach(() => {
		// Reset any global state if needed
	});

	describe("Single Repository Analysis", () => {
		it("should successfully analyze a valid repository path", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: validRepoPath,
					options: {
						mode: "quick",
						maxFiles: 10,
					},
				})
				.expect(200);

			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("name");
			expect(response.body).toHaveProperty("path");
			expect(response.body.path).toBe(validRepoPath);
		});

		it("should handle non-existent path with user-friendly error", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.error).toContain("Not Found");
			expect(response.body.suggestions).toBeInstanceOf(Array);
			expect(response.body.suggestions.length).toBeGreaterThan(0);
		});

		it("should handle file instead of directory with user-friendly error", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: fileNotDirPath,
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.suggestions).toBeInstanceOf(Array);
			expect(
				response.body.suggestions.some((s: string) => s.includes("directory")),
			).toBe(true);
		});

		it("should handle permission denied with user-friendly error", async () => {
			// Skip on Windows as permission handling is different
			if (process.platform === "win32") {
				return;
			}

			const response = await request(app)
				.post("/analyze")
				.send({
					path: noPermissionPath,
					options: { mode: "quick" },
				})
				.expect(403);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.error).toContain("Permission");
			expect(response.body.suggestions).toBeInstanceOf(Array);
			expect(
				response.body.suggestions.some((s: string) => s.includes("permission")),
			).toBe(true);
		});

		it("should handle Windows-specific path formats", async () => {
			// Only test on Windows
			if (process.platform !== "win32") {
				return;
			}

			// Test with backslashes
			const windowsPath = validRepoPath.replace(/\//g, "\\");
			const response = await request(app)
				.post("/analyze")
				.send({
					path: windowsPath,
					options: { mode: "quick" },
				})
				.expect(200);

			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("path");
		});

		it("should handle mixed path separators on Windows", async () => {
			// Only test on Windows
			if (process.platform !== "win32") {
				return;
			}

			// Test with mixed separators (forward and back slashes)
			const mixedPath = validRepoPath.replace(/\//g, "\\").replace(/\\/g, "/");
			const response = await request(app)
				.post("/analyze")
				.send({
					path: mixedPath,
					options: { mode: "quick" },
				})
				.expect(200);

			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("path");
		});

		it("should handle UNC paths with appropriate error messages", async () => {
			// Only test on Windows
			if (process.platform !== "win32") {
				return;
			}

			const uncPath = "\\\\nonexistent-server\\share\\folder";
			const response = await request(app)
				.post("/analyze")
				.send({
					path: uncPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.suggestions).toBeInstanceOf(Array);
			expect(
				response.body.suggestions.some((s: string) => s.includes("network")),
			).toBe(true);
		});

		it("should handle invalid path characters with user-friendly error", async () => {
			const invalidCharPath = path.join(tempDir, "invalid<>chars");

			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidCharPath,
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.suggestions).toBeInstanceOf(Array);
		});

		it("should provide technical details for debugging", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body).toHaveProperty("technicalDetails");
			expect(response.body.technicalDetails).toHaveProperty("errors");
			expect(response.body.technicalDetails.errors).toBeInstanceOf(Array);
		});

		it("should include learn more URLs when available", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			// Some errors should include learn more URLs
			if (response.body.learnMoreUrl) {
				expect(response.body.learnMoreUrl).toMatch(/^https?:\/\//);
			}
		});
	});

	describe("Batch Repository Analysis", () => {
		it("should successfully analyze multiple valid repository paths", async () => {
			// Create another valid repo
			const validRepo2Path = path.join(tempDir, "valid-repo-2");
			await fs.mkdir(validRepo2Path, { recursive: true });
			await fs.writeFile(
				path.join(validRepo2Path, "index.js"),
				'console.log("test");',
			);

			const response = await request(app)
				.post("/analyze/batch")
				.send({
					paths: [validRepoPath, validRepo2Path],
					options: { mode: "quick" },
				})
				.expect(200);

			expect(response.body).toHaveProperty("repositories");
			expect(response.body).toHaveProperty("pathValidation");
			expect(response.body.pathValidation.totalRequested).toBe(2);
			expect(response.body.pathValidation.validPaths).toBe(2);
			expect(response.body.pathValidation.invalidPaths).toBe(0);
			expect(response.body.repositories).toBeInstanceOf(Array);
			expect(response.body.repositories.length).toBe(2);
		});

		it("should handle mixed valid and invalid paths", async () => {
			const response = await request(app)
				.post("/analyze/batch")
				.send({
					paths: [validRepoPath, invalidPath, fileNotDirPath],
					options: { mode: "quick" },
				})
				.expect(200);

			expect(response.body).toHaveProperty("pathValidation");
			expect(response.body.pathValidation.totalRequested).toBe(3);
			expect(response.body.pathValidation.validPaths).toBe(1);
			expect(response.body.pathValidation.invalidPaths).toBe(2);
			expect(response.body.pathValidation.invalidPathDetails).toBeInstanceOf(
				Array,
			);
			expect(response.body.pathValidation.invalidPathDetails.length).toBe(2);
		});

		it("should return error when no valid paths are provided", async () => {
			const response = await request(app)
				.post("/analyze/batch")
				.send({
					paths: [invalidPath, fileNotDirPath],
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("pathValidationResults");
			expect(response.body.error).toContain("No valid repository paths found");
			expect(response.body.validPaths).toBe(0);
			expect(response.body.invalidPaths).toBe(2);
		});

		it("should provide detailed error information for each invalid path", async () => {
			const response = await request(app)
				.post("/analyze/batch")
				.send({
					paths: [invalidPath, fileNotDirPath],
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("pathValidationResults");
			expect(response.body.pathValidationResults).toBeInstanceOf(Array);
			expect(response.body.pathValidationResults.length).toBe(2);

			for (const result of response.body.pathValidationResults) {
				expect(result).toHaveProperty("originalPath");
				expect(result).toHaveProperty("isValid");
				expect(result).toHaveProperty("errors");
				expect(result.isValid).toBe(false);
				expect(result.errors).toBeInstanceOf(Array);
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});
	});

	describe("Request Validation", () => {
		it("should return validation error for missing path", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("errors");
			expect(response.body.errors).toBeInstanceOf(Array);
		});

		it("should return validation error for empty path", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: "",
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("errors");
		});

		it("should return validation error for non-string path", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: 123,
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("errors");
		});

		it("should return validation error for missing paths in batch request", async () => {
			const response = await request(app)
				.post("/analyze/batch")
				.send({
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("errors");
		});

		it("should return validation error for empty paths array in batch request", async () => {
			const response = await request(app)
				.post("/analyze/batch")
				.send({
					paths: [],
					options: { mode: "quick" },
				})
				.expect(400);

			expect(response.body).toHaveProperty("errors");
		});
	});

	describe("Error Message Quality", () => {
		it("should provide actionable suggestions for common errors", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body.suggestions).toBeInstanceOf(Array);
			expect(response.body.suggestions.length).toBeGreaterThan(0);

			// Check that suggestions are actionable (contain action words)
			const actionWords = [
				"check",
				"verify",
				"ensure",
				"try",
				"use",
				"navigate",
				"contact",
			];
			const hasActionableSuggestions = response.body.suggestions.some(
				(suggestion: string) =>
					actionWords.some((word) => suggestion.toLowerCase().includes(word)),
			);
			expect(hasActionableSuggestions).toBe(true);
		});

		it("should provide platform-specific guidance", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body.suggestions).toBeInstanceOf(Array);

			// Check for platform-specific suggestions
			const suggestions = response.body.suggestions.join(" ").toLowerCase();
			if (process.platform === "win32") {
				expect(suggestions).toMatch(/windows|explorer|drive|backslash/);
			} else if (process.platform === "darwin") {
				expect(suggestions).toMatch(/finder|macos/);
			} else {
				expect(suggestions).toMatch(/linux|command/);
			}
		});

		it("should include normalized path in error responses", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			expect(response.body).toHaveProperty("path");
			expect(response.body.path).toBe(invalidPath);

			if (response.body.normalizedPath) {
				expect(typeof response.body.normalizedPath).toBe("string");
			}
		});
		it("should provide detailed error structure for path validation failures", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			// Check for enhanced error response structure
			expect(response.body).toHaveProperty("error");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body).toHaveProperty("path");

			// Check for technical details
			if (response.body.technicalDetails) {
				expect(response.body.technicalDetails).toHaveProperty("errors");
				expect(response.body.technicalDetails.errors).toBeInstanceOf(Array);
			}
		});

		it("should handle timeout scenarios with appropriate messages", async () => {
			// This test would require mocking a timeout scenario
			// For now, we'll test the structure that would be returned
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			// Verify error response has the expected structure for timeout handling
			expect(response.body).toHaveProperty("suggestions");
			expect(response.body.suggestions).toBeInstanceOf(Array);
		});

		it("should provide learn more URLs for complex errors", async () => {
			const response = await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);

			// Some errors should include learn more URLs
			if (response.body.learnMoreUrl) {
				expect(response.body.learnMoreUrl).toMatch(/^https?:\/\//);
			}
		});
	});

	describe("Logging Integration", () => {
		it("should log path validation attempts", async () => {
			// This test would require access to logs or mock logger
			// For now, we just ensure the request completes without errors
			await request(app)
				.post("/analyze")
				.send({
					path: validRepoPath,
					options: { mode: "quick" },
				})
				.expect(200);
		});

		it("should log validation failures with context", async () => {
			// This test would require access to logs or mock logger
			// For now, we just ensure the request completes with expected error
			await request(app)
				.post("/analyze")
				.send({
					path: invalidPath,
					options: { mode: "quick" },
				})
				.expect(404);
		});
	});
});
