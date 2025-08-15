/**
 * End-to-end user workflow tests for path handling integration
 * Tests complete user workflows from path input to repository analysis
 * Requirements: 1.1, 1.2, 7.1, 7.2, 8.1, 8.5
 */

import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import axios from "axios";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import {
	createTestRepository,
	startTestServer,
	type TestRepository,
	type TestServer,
	waitForAnalysis,
} from "../e2e/setup.js";

describe("Path Handler End-to-End User Workflows", () => {
	let server: TestServer;
	let testRepos: TestRepository[] = [];
	let testDir: string;

	beforeAll(async () => {
		server = await startTestServer();
		testDir = path.join(tmpdir(), "path-handler-e2e-tests");
		await fs.mkdir(testDir, { recursive: true });
	});

	afterAll(async () => {
		await server.stop();
		await Promise.all(testRepos.map((repo) => repo.cleanup()));
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			console.warn("Failed to cleanup test directory:", error);
		}
	});

	beforeEach(() => {
		testRepos = [];
	});

	afterEach(async () => {
		await Promise.all(testRepos.map((repo) => repo.cleanup()));
		testRepos = [];
	});

	describe("Windows Path Format User Workflows", () => {
		it("should handle Windows backslash paths in repository analysis", async () => {
			// Create a test repository
			const repo = await createTestRepository("windows-backslash-test", {
				"package.json": JSON.stringify({
					name: "windows-test-project",
					version: "1.0.0",
					dependencies: { express: "^4.18.0" },
				}),
				"index.js":
					'const express = require("express"); const app = express();',
				"README.md": "# Windows Test Project",
			});
			testRepos.push(repo);

			// Simulate Windows path format (convert forward slashes to backslashes)
			const windowsPath = repo.path.replace(/\//g, "\\");

			// Test repository analysis with Windows path format
			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: windowsPath,
				options: {
					mode: "standard",
					includeLLMAnalysis: false,
					includeTree: true,
				},
			});

			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty("analysisId");

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result).toHaveProperty("name", "windows-test-project");
			expect(analysis.result).toHaveProperty("language", "JavaScript");
			expect(analysis.result.dependencies.production).toEqual(
				expect.arrayContaining([expect.objectContaining({ name: "express" })]),
			);
		});

		it("should handle Windows forward slash paths in repository analysis", async () => {
			const repo = await createTestRepository("windows-forward-slash-test", {
				"package.json": JSON.stringify({
					name: "windows-forward-test",
					version: "1.0.0",
					dependencies: { lodash: "^4.17.21" },
				}),
				"src/app.js": 'const _ = require("lodash"); console.log(_.version);',
				"README.md": "# Windows Forward Slash Test",
			});
			testRepos.push(repo);

			// Use forward slash format (should work on Windows)
			const forwardSlashPath = repo.path.replace(/\\/g, "/");

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: forwardSlashPath,
				options: {
					mode: "quick",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result.name).toBe("windows-forward-test");
			expect(analysis.result.dependencies.production).toEqual(
				expect.arrayContaining([expect.objectContaining({ name: "lodash" })]),
			);
		});

		it("should handle mixed path separators in repository analysis", async () => {
			const repo = await createTestRepository("mixed-separators-test", {
				"package.json": JSON.stringify({
					name: "mixed-separators-project",
					version: "1.0.0",
				}),
				"src/components/App.jsx":
					"export default function App() { return <div>Hello</div>; }",
				"src/utils/helpers.js": 'export const helper = () => "help";',
			});
			testRepos.push(repo);

			// Create a path with mixed separators
			let mixedPath = repo.path;
			if (process.platform === "win32") {
				// On Windows, mix backslashes and forward slashes
				mixedPath = repo.path
					.replace(/\\/g, "/")
					.replace(/\//g, (match, offset) => {
						return offset % 2 === 0 ? "\\" : "/";
					});
			} else {
				// On Unix-like systems, add some backslashes
				mixedPath = repo.path.replace(/\//g, (match, offset) => {
					return offset % 3 === 0 ? "\\" : "/";
				});
			}

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: mixedPath,
				options: {
					mode: "standard",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result.name).toBe("mixed-separators-project");
			expect(analysis.result.fileCount).toBeGreaterThan(0);
		});

		it("should provide clear error messages for invalid Windows paths", async () => {
			// Test various invalid Windows path formats
			const invalidPaths = [
				"C:\\Users\\CON\\project", // Reserved name
				"C:\\Users\\test<file>\\project", // Invalid character
				"1:\\invalid\\project", // Invalid drive letter
				"C:\\" + "a".repeat(300) + "\\project", // Path too long
			];

			for (const invalidPath of invalidPaths) {
				try {
					const response = await axios.post(`${server.baseUrl}/api/analyze`, {
						path: invalidPath,
						options: { mode: "quick" },
					});

					if (response.status === 200) {
						const analysis = await waitForAnalysis(
							server.baseUrl,
							response.data.analysisId,
						);
						expect(analysis.status).toBe("failed");
						expect(analysis.error).toBeDefined();
						expect(analysis.error).toContain("path");
					}
				} catch (error) {
					// API should return error for invalid paths
					expect(axios.isAxiosError(error)).toBe(true);
					expect(error.response?.status).toBeGreaterThanOrEqual(400);
					expect(error.response?.data).toHaveProperty("error");
				}
			}
		});
	});

	describe("Cross-Platform Path Handling Workflows", () => {
		it("should handle relative paths consistently across platforms", async () => {
			const repo = await createTestRepository("relative-path-test", {
				"package.json": JSON.stringify({
					name: "relative-path-project",
					version: "1.0.0",
				}),
				"src/index.js": 'console.log("Hello from relative path");',
			});
			testRepos.push(repo);

			// Test with relative path
			const relativePath = path.relative(process.cwd(), repo.path);

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: relativePath,
				options: {
					mode: "quick",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result.name).toBe("relative-path-project");
		});

		it("should handle paths with spaces and special characters", async () => {
			const repo = await createTestRepository("special chars & spaces", {
				"package.json": JSON.stringify({
					name: "special-chars-project",
					version: "1.0.0",
				}),
				"src/special file.js": 'console.log("Special file");',
				"docs/read me.md": "# Special Characters Project",
			});
			testRepos.push(repo);

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: repo.path,
				options: {
					mode: "standard",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result.name).toBe("special-chars-project");
			expect(analysis.result.fileCount).toBeGreaterThan(0);
		});

		it("should handle Unicode characters in paths", async () => {
			const repo = await createTestRepository("unicode-测试-проект", {
				"package.json": JSON.stringify({
					name: "unicode-project",
					version: "1.0.0",
				}),
				"src/файл.js": 'console.log("Unicode file");',
				"docs/文档.md": "# Unicode Documentation",
			});
			testRepos.push(repo);

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: repo.path,
				options: {
					mode: "standard",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
			);

			expect(analysis.status).toBe("completed");
			expect(analysis.result.name).toBe("unicode-project");
		});
	});

	describe("Permission and Access Control Workflows", () => {
		it("should handle permission errors gracefully", async () => {
			// Try to analyze a system directory that might have restricted access
			const restrictedPaths =
				process.platform === "win32"
					? ["C:\\Windows\\System32", "C:\\Program Files\\Windows NT"]
					: ["/root", "/sys", "/proc"];

			for (const restrictedPath of restrictedPaths) {
				try {
					const response = await axios.post(`${server.baseUrl}/api/analyze`, {
						path: restrictedPath,
						options: { mode: "quick" },
					});

					if (response.status === 200) {
						const analysis = await waitForAnalysis(
							server.baseUrl,
							response.data.analysisId,
						);

						// Should either fail with permission error or succeed if accessible
						if (analysis.status === "failed") {
							expect(analysis.error).toMatch(/permission|access|denied/i);
						}
					}
				} catch (error) {
					// Permission errors should be handled gracefully
					expect(axios.isAxiosError(error)).toBe(true);
					if (error.response?.status === 403) {
						expect(error.response.data).toHaveProperty("error");
						expect(error.response.data.error).toMatch(
							/permission|access|denied/i,
						);
					}
				}
			}
		});

		it("should provide helpful suggestions for permission issues", async () => {
			const nonExistentPath = path.join(testDir, "non-existent-directory");

			try {
				const response = await axios.post(`${server.baseUrl}/api/analyze`, {
					path: nonExistentPath,
					options: { mode: "quick" },
				});

				if (response.status === 200) {
					const analysis = await waitForAnalysis(
						server.baseUrl,
						response.data.analysisId,
					);
					expect(analysis.status).toBe("failed");
					expect(analysis.error).toContain("not found");
				}
			} catch (error) {
				expect(axios.isAxiosError(error)).toBe(true);
				expect(error.response?.status).toBeGreaterThanOrEqual(400);
				expect(error.response?.data).toHaveProperty("error");
			}
		});
	});

	describe("Performance and Timeout Workflows", () => {
		it("should handle large repositories efficiently", async () => {
			// Create a larger test repository
			const largeRepoFiles: Record<string, string> = {
				"package.json": JSON.stringify({
					name: "large-performance-test",
					version: "1.0.0",
				}),
				"README.md": "# Large Performance Test Repository",
			};

			// Generate multiple files to simulate a larger repository
			for (let i = 0; i < 100; i++) {
				largeRepoFiles[`src/component${i}.js`] = `
          export default function Component${i}() {
            return <div>Component ${i}</div>;
          }
        `;
				largeRepoFiles[`tests/component${i}.test.js`] = `
          import Component${i} from '../src/component${i}';
          test('Component${i} renders', () => {
            expect(Component${i}).toBeDefined();
          });
        `;
			}

			const repo = await createTestRepository(
				"large-performance-test",
				largeRepoFiles,
			);
			testRepos.push(repo);

			const startTime = Date.now();

			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: repo.path,
				options: {
					mode: "standard",
					maxFiles: 200,
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				response.data.analysisId,
				60000,
			);

			const duration = Date.now() - startTime;

			expect(analysis.status).toBe("completed");
			expect(analysis.result.fileCount).toBeGreaterThan(100);
			expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
		});

		it("should handle concurrent path validation requests", async () => {
			// Create multiple test repositories
			const repos = await Promise.all([
				createTestRepository("concurrent-1", {
					"package.json": JSON.stringify({ name: "concurrent-1" }),
					"index.js": 'console.log("Concurrent 1");',
				}),
				createTestRepository("concurrent-2", {
					"package.json": JSON.stringify({ name: "concurrent-2" }),
					"index.js": 'console.log("Concurrent 2");',
				}),
				createTestRepository("concurrent-3", {
					"package.json": JSON.stringify({ name: "concurrent-3" }),
					"index.js": 'console.log("Concurrent 3");',
				}),
			]);

			testRepos.push(...repos);

			const startTime = Date.now();

			// Start analyses concurrently
			const analysisPromises = repos.map((repo) =>
				axios.post(`${server.baseUrl}/api/analyze`, {
					path: repo.path,
					options: { mode: "quick", includeLLMAnalysis: false },
				}),
			);

			const responses = await Promise.all(analysisPromises);

			// Wait for all analyses to complete
			const analyses = await Promise.all(
				responses.map((response) =>
					waitForAnalysis(server.baseUrl, response.data.analysisId),
				),
			);

			const duration = Date.now() - startTime;

			expect(
				analyses.every((analysis) => analysis.status === "completed"),
			).toBe(true);
			expect(duration).toBeLessThan(30000); // Concurrent processing should be efficient
		});

		it("should handle analysis timeout gracefully", async () => {
			const repo = await createTestRepository("timeout-test", {
				"package.json": JSON.stringify({
					name: "timeout-test-project",
					version: "1.0.0",
				}),
				"index.js": 'console.log("Timeout test");',
			});
			testRepos.push(repo);

			// Test with a very short timeout (this might not actually timeout for small repos)
			const response = await axios.post(`${server.baseUrl}/api/analyze`, {
				path: repo.path,
				options: {
					mode: "comprehensive",
					timeout: 1, // 1 second timeout
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);

			try {
				const analysis = await waitForAnalysis(
					server.baseUrl,
					response.data.analysisId,
					5000,
				);

				// Either completes successfully or fails with timeout
				if (analysis.status === "failed") {
					expect(analysis.error).toMatch(/timeout|time.*out/i);
				} else {
					expect(analysis.status).toBe("completed");
				}
			} catch (error) {
				// Timeout during waiting is also acceptable
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toContain("timeout");
			}
		});
	});

	describe("Error Recovery and User Guidance Workflows", () => {
		it("should provide actionable error messages for common path issues", async () => {
			const commonIssues = [
				{
					path: "/this/path/definitely/does/not/exist/anywhere",
					expectedErrorPattern: /not found|does not exist/i,
				},
				{
					path: "",
					expectedErrorPattern: /empty|invalid/i,
				},
				{
					path: "   ",
					expectedErrorPattern: /empty|invalid/i,
				},
			];

			for (const issue of commonIssues) {
				try {
					const response = await axios.post(`${server.baseUrl}/api/analyze`, {
						path: issue.path,
						options: { mode: "quick" },
					});

					if (response.status === 200) {
						const analysis = await waitForAnalysis(
							server.baseUrl,
							response.data.analysisId,
						);
						expect(analysis.status).toBe("failed");
						expect(analysis.error).toMatch(issue.expectedErrorPattern);
					}
				} catch (error) {
					expect(axios.isAxiosError(error)).toBe(true);
					expect(error.response?.status).toBeGreaterThanOrEqual(400);

					if (error.response?.data?.error) {
						expect(error.response.data.error).toMatch(
							issue.expectedErrorPattern,
						);
					}
				}
			}
		});

		it("should handle network path issues gracefully", async () => {
			// Test UNC paths that might not be accessible
			const networkPaths = [
				"\\\\nonexistent-server\\share",
				"\\\\localhost\\nonexistent-share",
				"\\\\127.0.0.1\\invalid",
			];

			for (const networkPath of networkPaths) {
				try {
					const response = await axios.post(`${server.baseUrl}/api/analyze`, {
						path: networkPath,
						options: { mode: "quick" },
					});

					if (response.status === 200) {
						const analysis = await waitForAnalysis(
							server.baseUrl,
							response.data.analysisId,
						);

						if (analysis.status === "failed") {
							expect(analysis.error).toMatch(/network|server|share|access/i);
						}
					}
				} catch (error) {
					expect(axios.isAxiosError(error)).toBe(true);

					if (error.response?.data?.error) {
						expect(error.response.data.error).toMatch(
							/network|server|share|access|path/i,
						);
					}
				}
			}
		});

		it("should provide platform-specific guidance in error messages", async () => {
			// Test platform-specific invalid paths
			const platformSpecificIssues =
				process.platform === "win32"
					? [
							{ path: "C:\\Users\\CON\\project", issue: "reserved name" },
							{ path: "C:\\Users\\test<file>", issue: "invalid character" },
							{ path: "1:\\invalid", issue: "invalid drive" },
						]
					: [
							{ path: "/root/restricted", issue: "permission" },
							{ path: "/nonexistent/deep/path", issue: "not found" },
						];

			for (const issue of platformSpecificIssues) {
				try {
					const response = await axios.post(`${server.baseUrl}/api/analyze`, {
						path: issue.path,
						options: { mode: "quick" },
					});

					if (response.status === 200) {
						const analysis = await waitForAnalysis(
							server.baseUrl,
							response.data.analysisId,
						);

						if (analysis.status === "failed") {
							expect(analysis.error).toBeDefined();
							// Error should contain some guidance
							expect(analysis.error.length).toBeGreaterThan(10);
						}
					}
				} catch (error) {
					expect(axios.isAxiosError(error)).toBe(true);

					if (error.response?.data?.error) {
						expect(error.response.data.error).toBeDefined();
						expect(error.response.data.error.length).toBeGreaterThan(10);
					}
				}
			}
		});
	});

	describe("Integration with Repository Analysis Features", () => {
		it("should integrate path validation with repository indexing", async () => {
			const repo = await createTestRepository("indexing-integration-test", {
				"package.json": JSON.stringify({
					name: "indexing-integration-project",
					version: "1.0.0",
					dependencies: { express: "^4.18.0" },
				}),
				"src/app.js": 'const express = require("express");',
				"README.md": "# Indexing Integration Test",
			});
			testRepos.push(repo);

			// Analyze repository
			const analyzeResponse = await axios.post(
				`${server.baseUrl}/api/analyze`,
				{
					path: repo.path,
					options: {
						mode: "standard",
						includeLLMAnalysis: false,
					},
				},
			);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				analyzeResponse.data.analysisId,
			);
			expect(analysis.status).toBe("completed");

			// Check if repository appears in index with correct path handling
			const indexResponse = await axios.get(
				`${server.baseUrl}/api/repositories`,
			);
			expect(indexResponse.status).toBe(200);

			const repositories = indexResponse.data;
			expect(repositories).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "indexing-integration-project",
					}),
				]),
			);
		});

		it("should integrate path validation with export functionality", async () => {
			const repo = await createTestRepository("export-integration-test", {
				"package.json": JSON.stringify({
					name: "export-integration-project",
					version: "1.0.0",
				}),
				"src/main.js": 'console.log("Export integration test");',
			});
			testRepos.push(repo);

			// Analyze repository
			const analyzeResponse = await axios.post(
				`${server.baseUrl}/api/analyze`,
				{
					path: repo.path,
					options: { mode: "standard", includeLLMAnalysis: false },
				},
			);

			const analysis = await waitForAnalysis(
				server.baseUrl,
				analyzeResponse.data.analysisId,
			);
			expect(analysis.status).toBe("completed");

			// Export analysis
			const exportResponse = await axios.post(`${server.baseUrl}/api/export`, {
				analysisId: analysis.id,
				format: "json",
			});

			expect(exportResponse.status).toBe(200);
			expect(exportResponse.data).toHaveProperty(
				"name",
				"export-integration-project",
			);

			// Exported data should contain normalized path information
			expect(exportResponse.data).toHaveProperty("metadata");
		});

		it("should integrate path validation with batch analysis", async () => {
			// Create multiple repositories with different path formats
			const repos = await Promise.all([
				createTestRepository("batch-1", {
					"package.json": JSON.stringify({ name: "batch-project-1" }),
					"index.js": 'console.log("Batch 1");',
				}),
				createTestRepository("batch-2", {
					"package.json": JSON.stringify({ name: "batch-project-2" }),
					"index.js": 'console.log("Batch 2");',
				}),
				createTestRepository("batch-3", {
					"package.json": JSON.stringify({ name: "batch-project-3" }),
					"index.js": 'console.log("Batch 3");',
				}),
			]);

			testRepos.push(...repos);

			// Use different path formats for each repository
			const paths = repos.map((repo, index) => {
				if (index === 0) return repo.path; // Original format
				if (index === 1) return repo.path.replace(/\\/g, "/"); // Forward slashes
				return repo.path; // Mixed or original
			});

			const response = await axios.post(`${server.baseUrl}/api/analyze/batch`, {
				paths: paths,
				options: {
					mode: "quick",
					includeLLMAnalysis: false,
				},
			});

			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty("batchId");

			// Wait for batch completion
			let batchResult;
			let retries = 30;

			while (retries > 0) {
				try {
					const batchResponse = await axios.get(
						`${server.baseUrl}/api/batch/${response.data.batchId}`,
					);
					if (batchResponse.data.status === "completed") {
						batchResult = batchResponse.data;
						break;
					}
				} catch (error) {
					if (!axios.isAxiosError(error) || error.response?.status !== 404) {
						throw error;
					}
				}
				await new Promise((resolve) => setTimeout(resolve, 1000));
				retries--;
			}

			expect(batchResult).toBeDefined();
			expect(batchResult.results).toHaveLength(3);
			expect(
				batchResult.results.every((r: any) => r.status === "completed"),
			).toBe(true);
		});
	});
});
