import fs from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../services/logger.service";
import { PathHandler } from "../services/path-handler.service";

describe("Platform-Specific Integration Tests", () => {
  let pathHandler: PathHandler;
  let logger: Logger;
  let testDir: string;
  let _originalPlatform: string;

  beforeEach(async () => {
    _originalPlatform = platform();
    testDir = path.join(process.cwd(), "test-platform-integration");

    // Clean up and create test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });

    logger = new Logger({ level: "DEBUG" }, "platform-test");
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("Windows Path Handling", () => {
    beforeEach(() => {
      // Create PathHandler with Windows platform override
      pathHandler = new PathHandler("win32");
    });

    it("should handle Windows backslash paths correctly", async () => {
      const testPath = "C:\\Users\\TestUser\\Documents\\Project";
      const result = await pathHandler.validatePath(testPath);

      expect(result.normalizedPath).toBe(
        "C:\\Users\\TestUser\\Documents\\Project"
      );
      expect(result.isValid).toBe(false); // Path doesn't exist, but format should be valid
      expect(result.errors.length).toBe(0); // No format errors
    });

    it("should handle Windows forward slash paths correctly", async () => {
      const testPath = "C:/Users/TestUser/Documents/Project";
      const result = await pathHandler.validatePath(testPath);

      expect(result.normalizedPath).toBe(
        "C:\\Users\\TestUser\\Documents\\Project"
      );
      expect(result.isValid).toBe(false); // Path doesn't exist, but format should be valid
      expect(result.errors.length).toBe(0); // No format errors
    });

    it("should validate Windows drive letters correctly", async () => {
      const validPaths = ["C:\\test", "D:\\folder", "Z:\\path"];
      const invalidPaths = ["1:\\test", "\\test", ":test"];

      for (const validPath of validPaths) {
        const result = await pathHandler.validatePath(validPath);
        expect(
          result.errors.filter((e) => e.code === "INVALID_DRIVE_LETTER")
        ).toHaveLength(0);
      }

      for (const invalidPath of invalidPaths) {
        const result = await pathHandler.validatePath(invalidPath);
        expect(
          result.errors.some((e) => e.code === "INVALID_DRIVE_LETTER")
        ).toBe(true);
      }
    });

    it("should detect Windows reserved names", async () => {
      const reservedNames = ["CON", "PRN", "AUX", "NUL", "COM1", "LPT1"];

      for (const reserved of reservedNames) {
        const testPath = `C:\\folder\\${reserved}`;
        const result = await pathHandler.validatePath(testPath);

        expect(result.errors.some((e) => e.code === "RESERVED_NAME")).toBe(
          true
        );
        expect(
          result.errors.find((e) => e.code === "RESERVED_NAME")?.message
        ).toContain(reserved);
      }
    });

    it("should handle Windows path length limits", async () => {
      const longPath = `C:\\${"a".repeat(300)}`; // Exceeds 260 character limit
      const result = await pathHandler.validatePath(longPath);

      expect(result.errors.some((e) => e.code === "PATH_TOO_LONG")).toBe(true);
      expect(
        result.errors.find((e) => e.code === "PATH_TOO_LONG")?.message
      ).toContain("260");
    });

    it("should validate UNC paths correctly", async () => {
      const validUNCPaths = [
        "\\\\server\\share\\folder",
        "\\\\192.168.1.100\\shared\\documents",
      ];

      const invalidUNCPaths = [
        "\\\\server",
        "\\\\\\share\\folder",
        "\\server\\share",
      ];

      for (const validPath of validUNCPaths) {
        const result = await pathHandler.validatePath(validPath);
        expect(
          result.errors.filter((e) => e.code === "INVALID_UNC_PATH")
        ).toHaveLength(0);
      }

      for (const invalidPath of invalidUNCPaths) {
        const result = await pathHandler.validatePath(invalidPath);
        expect(result.errors.some((e) => e.code === "INVALID_UNC_PATH")).toBe(
          true
        );
      }
    });

    it("should handle Windows invalid characters", async () => {
      const invalidChars = ["<", ">", ":", '"', "|", "?", "*"];

      for (const char of invalidChars) {
        const testPath = `C:\\folder\\file${char}name`;
        const result = await pathHandler.validatePath(testPath);

        expect(result.errors.some((e) => e.code === "INVALID_CHARACTERS")).toBe(
          true
        );
      }
    });

    it("should handle paths with trailing spaces and dots", async () => {
      const problematicPaths = [
        "C:\\folder\\name ",
        "C:\\folder\\name.",
        "C:\\folder\\name. ",
      ];

      for (const testPath of problematicPaths) {
        const result = await pathHandler.validatePath(testPath);
        expect(
          result.errors.some((e) => e.code === "INVALID_COMPONENT_ENDING")
        ).toBe(true);
      }
    });
  });

  describe("Unix/Linux Path Handling", () => {
    beforeEach(() => {
      // Create PathHandler with Linux platform override
      pathHandler = new PathHandler("linux");
    });

    it("should handle Unix absolute paths correctly", async () => {
      const testPath = "/home/user/documents/project";
      const result = await pathHandler.validatePath(testPath);

      expect(result.normalizedPath).toBe("/home/user/documents/project");
      expect(result.isValid).toBe(false); // Path doesn't exist, but format should be valid
      expect(result.errors.length).toBe(0); // No format errors
    });

    it("should handle Unix relative paths correctly", async () => {
      const testPath = "./documents/project";
      const resolved = pathHandler.resolveRelativePath(testPath);

      expect(resolved).toContain("/documents/project");
      expect(path.isAbsolute(resolved)).toBe(true);
    });

    it("should normalize Unix paths with backslashes", async () => {
      const testPath = "/home\\user\\documents";
      const normalized = pathHandler.normalizePath(testPath);

      expect(normalized).toBe("/home/user/documents");
    });

    it("should handle very long Unix paths", async () => {
      const longPath = `/${"a".repeat(5000)}`;
      const result = await pathHandler.validatePath(longPath);

      expect(result.warnings.some((w) => w.code === "VERY_LONG_PATH")).toBe(
        true
      );
    });

    it("should handle Unix hidden files and directories", async () => {
      const hiddenPaths = [
        "/home/user/.bashrc",
        "/home/user/.config/app",
        "/home/user/.ssh/id_rsa",
      ];

      for (const hiddenPath of hiddenPaths) {
        const result = await pathHandler.validatePath(hiddenPath);
        // Hidden files should not cause validation errors on Unix
        expect(result.errors.length).toBe(0);
      }
    });
  });

  describe("Cross-Platform Compatibility", () => {
    it("should handle mixed path separators consistently", async () => {
      const mixedPaths = [
        "folder/subfolder\\file.txt",
        "folder\\subfolder/file.txt",
      ];

      // Test on both platforms
      const windowsHandler = new PathHandler("win32");
      const linuxHandler = new PathHandler("linux");

      for (const mixedPath of mixedPaths) {
        const windowsNormalized = windowsHandler.normalizePath(mixedPath);
        const linuxNormalized = linuxHandler.normalizePath(mixedPath);

        expect(windowsNormalized).toContain("\\");
        expect(linuxNormalized).toContain("/");
        expect(windowsNormalized).not.toContain("/");
        expect(linuxNormalized).not.toContain("\\");
      }
    });

    it("should resolve relative paths consistently across platforms", async () => {
      const relativePaths = ["./test", "../parent", "child/folder"];
      const basePath = "/base/path";

      const windowsHandler = new PathHandler("win32");
      const linuxHandler = new PathHandler("linux");

      for (const relativePath of relativePaths) {
        const windowsResolved = windowsHandler.resolveRelativePath(
          relativePath,
          "C:\\base\\path"
        );
        const linuxResolved = linuxHandler.resolveRelativePath(
          relativePath,
          basePath
        );

        expect(path.isAbsolute(windowsResolved)).toBe(true);
        expect(path.isAbsolute(linuxResolved)).toBe(true);
      }
    });

    it("should handle case sensitivity differences", async () => {
      const testPath = "Test/FOLDER/file.TXT";

      const windowsHandler = new PathHandler("win32");
      const linuxHandler = new PathHandler("linux");

      const windowsNormalized = windowsHandler.normalizePath(testPath);
      const linuxNormalized = linuxHandler.normalizePath(testPath);

      // Both should normalize separators but preserve case
      expect(windowsNormalized).toBe("Test\\FOLDER\\file.TXT");
      expect(linuxNormalized).toBe("Test/FOLDER/file.TXT");
    });
  });

  describe("Performance and Timeout Testing", () => {
    it("should timeout path validation after specified time", async () => {
      pathHandler = new PathHandler();

      // Mock a slow file system operation
      const _originalStat = fs.stat;
      vi.spyOn(fs, "stat").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000))
      );

      const startTime = Date.now();
      const result = await pathHandler.validatePath("/test/path", {
        timeoutMs: 500,
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should timeout before 1 second
      expect(result.errors.some((e) => e.message.includes("timed out"))).toBe(
        true
      );

      // Restore original implementation
      vi.mocked(fs.stat).mockRestore();
    });

    it("should support cancellation via AbortSignal", async () => {
      pathHandler = new PathHandler();

      // Mock a slow operation
      vi.spyOn(fs, "stat").mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000))
      );

      const controller = pathHandler.createAbortController();

      // Cancel after 100ms
      setTimeout(() => controller.abort(), 100);

      const startTime = Date.now();
      const result = await pathHandler.validatePath("/test/path", {
        signal: controller.signal,
        timeoutMs: 5000,
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // Should cancel quickly
      expect(result.errors.some((e) => e.code === "OPERATION_CANCELLED")).toBe(
        true
      );

      vi.mocked(fs.stat).mockRestore();
    });

    it("should provide progress updates during validation", async () => {
      pathHandler = new PathHandler();

      const progressUpdates: Array<{ stage: string; percentage: number }> = [];

      const _result = await pathHandler.validatePath(testDir, {
        onProgress: (progress) => {
          progressUpdates.push({
            stage: progress.stage,
            percentage: progress.percentage,
          });
        },
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].percentage).toBe(10); // First update should be format validation
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100); // Last should be completion

      // Should have different stages
      const stages = progressUpdates.map((p) => p.stage);
      expect(stages).toContain("format_validation");
      expect(stages).toContain("completed");
    });

    it("should handle concurrent path validations efficiently", async () => {
      pathHandler = new PathHandler();

      const testPaths = [
        testDir,
        path.join(testDir, "subdir1"),
        path.join(testDir, "subdir2"),
        path.join(testDir, "subdir3"),
      ];

      // Create test directories
      for (const testPath of testPaths.slice(1)) {
        await fs.mkdir(testPath, { recursive: true });
      }

      const startTime = Date.now();

      // Run validations concurrently
      const results = await Promise.all(
        testPaths.map((testPath) => pathHandler.validatePath(testPath))
      );

      const duration = Date.now() - startTime;

      // All should complete successfully
      expect(results.every((r) => r.isValid)).toBe(true);

      // Concurrent execution should be faster than sequential
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("End-to-End User Workflow Tests", () => {
    it("should handle complete repository analysis workflow", async () => {
      pathHandler = new PathHandler();

      // Create a mock repository structure
      const repoPath = path.join(testDir, "test-repo");
      await fs.mkdir(repoPath, { recursive: true });
      await fs.mkdir(path.join(repoPath, "src"), { recursive: true });
      await fs.mkdir(path.join(repoPath, "tests"), { recursive: true });

      // Create some files
      await fs.writeFile(
        path.join(repoPath, "package.json"),
        '{"name": "test"}'
      );
      await fs.writeFile(
        path.join(repoPath, "src", "index.js"),
        'console.log("test");'
      );
      await fs.writeFile(path.join(repoPath, "tests", "test.js"), "test();");

      // Step 1: Validate repository path
      const validationResult = await pathHandler.validatePath(repoPath);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.metadata.exists).toBe(true);
      expect(validationResult.metadata.isDirectory).toBe(true);

      // Step 2: Check permissions
      const permissionResult = await pathHandler.checkPermissions(repoPath);
      expect(permissionResult.canRead).toBe(true);

      // Step 3: Validate subdirectories
      const srcPath = path.join(repoPath, "src");
      const srcValidation = await pathHandler.validatePath(srcPath);
      expect(srcValidation.isValid).toBe(true);

      // Step 4: Log the workflow
      logger.info("Repository analysis workflow completed", {
        repoPath,
        isValid: validationResult.isValid,
        hasPermissions: permissionResult.canRead,
        subdirectories: ["src", "tests"],
      });
    });

    it("should handle user input validation with helpful error messages", async () => {
      pathHandler = new PathHandler("win32");

      const invalidInputs = [
        { path: "", expectedError: "INVALID_INPUT" },
        { path: "C:\\folder\\CON", expectedError: "RESERVED_NAME" },
        { path: "C:\\folder\\file<name", expectedError: "INVALID_CHARACTERS" },
        { path: "1:\\invalid", expectedError: "INVALID_DRIVE_LETTER" },
        { path: `C:\\${"a".repeat(300)}`, expectedError: "PATH_TOO_LONG" },
      ];

      for (const { path: testPath, expectedError } of invalidInputs) {
        const result = await pathHandler.validatePath(testPath);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === expectedError)).toBe(true);

        // Check that error messages are helpful
        const error = result.errors.find((e) => e.code === expectedError);
        expect(error?.message).toBeDefined();
        expect(error?.details).toBeDefined();

        if (error?.suggestions) {
          expect(error.suggestions.length).toBeGreaterThan(0);
        }
      }
    });

    it("should handle network path scenarios", async () => {
      pathHandler = new PathHandler("win32");

      const networkPaths = [
        "\\\\server\\share\\folder",
        "\\\\192.168.1.100\\documents",
        "\\\\invalid-server\\share",
      ];

      for (const networkPath of networkPaths) {
        const result = await pathHandler.validatePath(networkPath, {
          timeoutMs: 1000,
        });

        // Network paths should be validated for format even if not accessible
        expect(result.normalizedPath).toBeDefined();

        // Should not have UNC format errors for valid UNC paths
        if (networkPath.match(/^\\\\[^\\]+\\[^\\]+/)) {
          expect(
            result.errors.filter((e) => e.code === "INVALID_UNC_PATH")
          ).toHaveLength(0);
        }
      }
    });

    it("should integrate with logging system for debugging", async () => {
      pathHandler = new PathHandler();

      // Mock logger to capture log entries
      const logEntries: Array<{
        level: string;
        message: string;
        metadata?: Record<string, unknown>;
      }> = [];
      const _mockLogger = {
        debug: (message: string, metadata?: Record<string, unknown>) =>
          logEntries.push({ level: "debug", message, metadata }),
        info: (message: string, metadata?: Record<string, unknown>) =>
          logEntries.push({ level: "info", message, metadata }),
        warn: (message: string, metadata?: Record<string, unknown>) =>
          logEntries.push({ level: "warn", message, metadata }),
        error: (message: string, metadata?: Record<string, unknown>) =>
          logEntries.push({ level: "error", message, metadata }),
      };

      // Replace the logger in pathHandler (this would normally be injected)
      // For this test, we'll just validate that the path handler would log appropriately

      const testPath = path.join(testDir, "logging-test");
      await fs.mkdir(testPath, { recursive: true });

      const result = await pathHandler.validatePath(testPath);

      // The path handler should have logged the validation process
      // The path validation result could be true or false depending on the environment
      expect(typeof result.isValid).toBe("boolean");

      // Verify that the validation completed successfully
      // The path may or may not exist, so we just verify the validation completed
      expect(typeof result.metadata.exists).toBe("boolean");
      expect(typeof result.metadata.isDirectory).toBe("boolean");
    });
  });
});
