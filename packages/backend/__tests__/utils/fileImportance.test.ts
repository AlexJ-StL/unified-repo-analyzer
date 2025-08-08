/**
 * Tests for file importance scoring utilities
 */

import path from "node:path";
import { describe, expect, test } from "vitest";
import {
	calculateFileImportance,
	calculateImportanceFactors,
	IMPORTANT_EXTENSIONS,
	IMPORTANT_FILE_PATTERNS,
	sortFilesByImportance,
} from "../../src/utils/fileImportance";

describe("File Importance Utilities", () => {
	const mockRepoPath = "/mock/repo";

	describe("IMPORTANT_FILE_PATTERNS constant", () => {
		test("should contain definitions for important file categories", () => {
			expect(IMPORTANT_FILE_PATTERNS).toBeDefined();
			expect(IMPORTANT_FILE_PATTERNS.config).toBeDefined();
			expect(IMPORTANT_FILE_PATTERNS.documentation).toBeDefined();
			expect(IMPORTANT_FILE_PATTERNS.entryPoint).toBeDefined();
			expect(IMPORTANT_FILE_PATTERNS.test).toBeDefined();
			expect(IMPORTANT_FILE_PATTERNS.core).toBeDefined();
		});

		test("should have patterns defined for each category", () => {
			expect(IMPORTANT_FILE_PATTERNS.config.length).toBeGreaterThan(0);
			expect(IMPORTANT_FILE_PATTERNS.documentation.length).toBeGreaterThan(0);
			expect(IMPORTANT_FILE_PATTERNS.entryPoint.length).toBeGreaterThan(0);
			expect(IMPORTANT_FILE_PATTERNS.test.length).toBeGreaterThan(0);
			expect(IMPORTANT_FILE_PATTERNS.core.length).toBeGreaterThan(0);
		});
	});

	describe("IMPORTANT_EXTENSIONS constant", () => {
		test("should contain definitions for important file extensions by language", () => {
			expect(IMPORTANT_EXTENSIONS).toBeDefined();
			expect(IMPORTANT_EXTENSIONS.js).toBeDefined();
			expect(IMPORTANT_EXTENSIONS.python).toBeDefined();
			expect(IMPORTANT_EXTENSIONS.jvm).toBeDefined();
			expect(IMPORTANT_EXTENSIONS.web).toBeDefined();
		});

		test("should have extensions defined for each language category", () => {
			Object.values(IMPORTANT_EXTENSIONS).forEach((extensions) => {
				expect(extensions.length).toBeGreaterThan(0);
			});
		});
	});

	describe("calculateImportanceFactors", () => {
		test("should calculate importance factors for a file", () => {
			const filePath = path.join(mockRepoPath, "package.json");
			const fileSize = 1024; // 1KB

			const factors = calculateImportanceFactors(
				filePath,
				fileSize,
				mockRepoPath,
			);

			expect(factors).toBeDefined();
			expect(factors.baseScore).toBeDefined();
			expect(factors.locationScore).toBeDefined();
			expect(factors.typeScore).toBeDefined();
			expect(factors.nameScore).toBeDefined();
			expect(factors.sizeScore).toBeDefined();
		});

		test("should give higher name score to important configuration files", () => {
			const configFilePath = path.join(mockRepoPath, "package.json");
			const regularFilePath = path.join(mockRepoPath, "some-file.js");
			const fileSize = 1024;

			const configFactors = calculateImportanceFactors(
				configFilePath,
				fileSize,
				mockRepoPath,
			);
			const regularFactors = calculateImportanceFactors(
				regularFilePath,
				fileSize,
				mockRepoPath,
			);

			expect(configFactors.nameScore).toBeGreaterThan(regularFactors.nameScore);
		});

		test("should give higher name score to entry point files", () => {
			const entryFilePath = path.join(mockRepoPath, "index.js");
			const regularFilePath = path.join(mockRepoPath, "utils.js");
			const fileSize = 1024;

			const entryFactors = calculateImportanceFactors(
				entryFilePath,
				fileSize,
				mockRepoPath,
			);
			const regularFactors = calculateImportanceFactors(
				regularFilePath,
				fileSize,
				mockRepoPath,
			);

			expect(entryFactors.nameScore).toBeGreaterThan(regularFactors.nameScore);
		});

		test("should give higher location score to files at the root", () => {
			const rootFilePath = path.join(mockRepoPath, "config.js");
			const deepFilePath = path.join(
				mockRepoPath,
				"src",
				"utils",
				"helpers",
				"config.js",
			);
			const fileSize = 1024;

			const rootFactors = calculateImportanceFactors(
				rootFilePath,
				fileSize,
				mockRepoPath,
			);
			const deepFactors = calculateImportanceFactors(
				deepFilePath,
				fileSize,
				mockRepoPath,
			);

			expect(rootFactors.locationScore).toBeGreaterThan(
				deepFactors.locationScore,
			);
		});

		test("should give higher location score to files in core directories", () => {
			const coreFilePath = path.join(mockRepoPath, "src", "index.js");
			const nonCoreFilePath = path.join(mockRepoPath, "temp", "index.js");
			const fileSize = 1024;

			const coreFactors = calculateImportanceFactors(
				coreFilePath,
				fileSize,
				mockRepoPath,
			);
			const nonCoreFactors = calculateImportanceFactors(
				nonCoreFilePath,
				fileSize,
				mockRepoPath,
			);

			expect(coreFactors.locationScore).toBeGreaterThanOrEqual(
				nonCoreFactors.locationScore,
			);
		});

		test("should give optimal size score to medium-sized files", () => {
			const tinyFilePath = path.join(mockRepoPath, "tiny.js");
			const mediumFilePath = path.join(mockRepoPath, "medium.js");
			const hugeFilePath = path.join(mockRepoPath, "huge.js");

			const tinySize = 50; // 50 bytes
			const mediumSize = 5 * 1024; // 5KB
			const hugeSize = 2 * 1024 * 1024; // 2MB

			const tinyFactors = calculateImportanceFactors(
				tinyFilePath,
				tinySize,
				mockRepoPath,
			);
			const mediumFactors = calculateImportanceFactors(
				mediumFilePath,
				mediumSize,
				mockRepoPath,
			);
			const hugeFactors = calculateImportanceFactors(
				hugeFilePath,
				hugeSize,
				mockRepoPath,
			);

			expect(mediumFactors.sizeScore).toBeGreaterThan(tinyFactors.sizeScore);
			expect(mediumFactors.sizeScore).toBeGreaterThan(hugeFactors.sizeScore);
		});
	});

	describe("calculateFileImportance", () => {
		test("should calculate importance score between 0 and 1", () => {
			const filePaths = [
				path.join(mockRepoPath, "package.json"),
				path.join(mockRepoPath, "README.md"),
				path.join(mockRepoPath, "src", "index.js"),
				path.join(mockRepoPath, "test", "utils.test.js"),
				path.join(mockRepoPath, "dist", "bundle.js"),
			];

			filePaths.forEach((filePath) => {
				const fileSize = 1024;
				const score = calculateFileImportance(filePath, fileSize, mockRepoPath);

				expect(score).toBeGreaterThanOrEqual(0);
				expect(score).toBeLessThanOrEqual(1);
			});
		});

		test("should give higher scores to important files", () => {
			const importantFilePath = path.join(mockRepoPath, "package.json");
			const lessImportantFilePath = path.join(
				mockRepoPath,
				"dist",
				"bundle.js",
			);
			const fileSize = 1024;

			const importantScore = calculateFileImportance(
				importantFilePath,
				fileSize,
				mockRepoPath,
			);
			const lessImportantScore = calculateFileImportance(
				lessImportantFilePath,
				fileSize,
				mockRepoPath,
			);

			expect(importantScore).toBeGreaterThan(lessImportantScore);
		});
	});

	describe("sortFilesByImportance", () => {
		test("should sort files by importance score in descending order", () => {
			const files = [
				path.join(mockRepoPath, "package.json"),
				path.join(mockRepoPath, "README.md"),
				path.join(mockRepoPath, "src", "index.js"),
				path.join(mockRepoPath, "test", "utils.test.js"),
				path.join(mockRepoPath, "dist", "bundle.js"),
			];

			const fileSizes = new Map<string, number>();
			files.forEach((file) => fileSizes.set(file, 1024));

			const sortedFiles = sortFilesByImportance(files, mockRepoPath, fileSizes);

			expect(sortedFiles.length).toBe(files.length);

			// Check that files are sorted in descending order of importance
			for (let i = 0; i < sortedFiles.length - 1; i++) {
				expect(sortedFiles[i].importance).toBeGreaterThanOrEqual(
					sortedFiles[i + 1].importance,
				);
			}
		});

		test("should handle empty file list", () => {
			const files: string[] = [];
			const fileSizes = new Map<string, number>();

			const sortedFiles = sortFilesByImportance(files, mockRepoPath, fileSizes);

			expect(sortedFiles).toEqual([]);
		});

		test("should handle missing file sizes", () => {
			const files = [
				path.join(mockRepoPath, "package.json"),
				path.join(mockRepoPath, "README.md"),
			];

			const fileSizes = new Map<string, number>();
			fileSizes.set(files[0], 1024);
			// Intentionally not setting size for files[1]

			const sortedFiles = sortFilesByImportance(files, mockRepoPath, fileSizes);

			expect(sortedFiles.length).toBe(files.length);
			expect(sortedFiles.find((f) => f.path === files[1])).toBeDefined();
		});
	});
});
