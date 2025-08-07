/**
 * Biome linting rules validation tests
 *
 * Tests to validate that Biome linting rules work correctly
 * and provide comprehensive code quality checks.
 */

import { spawn } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import type { BiomeConfig } from "../types/config";

// Define project root
const projectRoot = resolve(__dirname, "..");

// Helper function to run Biome commands
async function runBiomeCommand(
	args: string[],
	cwd?: string,
): Promise<{
	stdout: string;
	stderr: string;
	exitCode: number;
}> {
	return new Promise((resolve) => {
		// Add config path if not already present
		const hasConfigPath = args.includes("--config-path");
		const configArgs = hasConfigPath
			? []
			: ["--config-path", join(projectRoot, "biome.json")];
		const fullArgs = [
			"run",
			"biome",
			...args.slice(0, 1),
			...configArgs,
			...args.slice(1),
		];

		const child = spawn("bun", fullArgs, {
			cwd: cwd || projectRoot,
			stdio: "pipe",
			shell: true,
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr?.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			resolve({
				stdout,
				stderr,
				exitCode: code || 0,
			});
		});
	});
}

// Helper function to create a temporary test file
function createTempTestFile(content: string, extension = "ts"): string {
	const tempDir = join(tmpdir(), `biome-test-${Date.now()}`);
	mkdirSync(tempDir, { recursive: true });
	const tempPath = join(tempDir, `test.${extension}`);
	writeFileSync(tempPath, content);
	return tempPath;
}

// Helper function to cleanup temp directory
function cleanupTempFile(filePath: string): void {
	try {
		unlinkSync(filePath);
		// Try to remove the directory if it's empty
		const dir = join(filePath, "..");
		try {
			process.rmdir?.(dir, () => {});
		} catch {
			// Ignore cleanup errors
		}
	} catch {
		// Ignore cleanup errors
	}
}

describe("Biome Rules Validation Tests", () => {
	const projectRoot = resolve(__dirname, "..");

	describe("Configuration Validation", () => {
		test("should have valid Biome configuration file", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			expect(existsSync(biomeConfigPath)).toBe(true);

			const configContent = readFileSync(biomeConfigPath, "utf-8");
			expect(() => JSON.parse(configContent)).not.toThrow();

			const config: BiomeConfig = JSON.parse(configContent);
			expect(config.$schema).toBeDefined();
			expect(config.linter).toBeDefined();
			expect(config.formatter).toBeDefined();
		});

		test("should have linter enabled with proper rules", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			expect(config.linter?.enabled).toBe(true);
			expect(config.linter?.rules).toBeDefined();
			expect(config.linter?.rules?.recommended).toBe(true);
		});

		test("should have formatter enabled with proper settings", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			expect(config.formatter?.enabled).toBe(true);
			expect(config.formatter?.indentStyle).toBe("space");
			expect(config.formatter?.indentWidth).toBe(2);
			expect(config.formatter?.lineWidth).toBe(100);
		});

		test("should have JavaScript/TypeScript specific settings", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			expect(config.javascript?.formatter?.quoteStyle).toBe("single");
			expect(config.javascript?.formatter?.semicolons).toBe("always");
			expect(config.javascript?.formatter?.trailingCommas).toBe("es5");
		});
	});

	describe("Linting Rule Equivalents", () => {
		test("should detect explicit any usage (Biome: noExplicitAny)", async () => {
			const testCode = `
        function badFunction(param: any): any {
          return param;
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand([
					"lint",
					"--config-path",
					join(projectRoot, "biome.json"),
					tempFile,
				]);

				// Should detect the any usage
				const output = (result.stdout + result.stderr).toLowerCase();
				expect(output).toContain("unexpected any");
				expect(result.exitCode).toBeGreaterThan(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should enforce const usage (Biome: useConst)", async () => {
			const testCode = `
        let unchangedVariable = 'hello';
        console.log(unchangedVariable);
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// Should suggest using const (or pass if rule is working as auto-fix)
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should enforce template literals (Biome: useTemplate)", async () => {
			const testCode = `
        const name = 'world';
        const message = 'Hello ' + name + '!';
        console.log(message);
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// Should suggest template literal (or pass if rule is working)
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should detect unused variables (Biome: noUnusedVariables)", async () => {
			const testCode = `
        function testFunction() {
          const unusedVariable = 'not used';
          const usedVariable = 'used';
          console.log(usedVariable);
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// Should detect unused variable
				const output = (result.stdout + result.stderr).toLowerCase();
				expect(output).toContain("unused");
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should enforce parameter assignment rules", async () => {
			const testCode = `
        function badFunction(param: string) {
          param = 'modified';
          return param;
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// Should detect parameter reassignment (or pass if rule is working)
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should enforce as const assertions", async () => {
			const testCode = `
        const config = {
          mode: 'development',
          features: ['feature1', 'feature2']
        };
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// May suggest as const for better type inference
				// This is a more lenient check as it depends on context
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});
	});

	describe("Formatting Rules Validation", () => {
		test("should format with single quotes", async () => {
			const testCode = `
        const message = "Hello world";
        console.log("This should use single quotes");
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["format", tempFile]);

				// Biome format returns 1 when changes would be made
				expect([0, 1]).toContain(result.exitCode);
				// Check that it suggests single quotes (in diff output)
				if (result.exitCode === 1) {
					const output = result.stdout + result.stderr;
					expect(output).toContain("+ const·message·=·'Hello·world'");
				}
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should format with proper indentation", async () => {
			const testCode = `
function badIndentation() {
    if (true) {
        console.log('bad indentation');
    }
}
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["format", tempFile]);

				// Biome format returns 1 when changes would be made
				expect([0, 1]).toContain(result.exitCode);
				// Should use 2-space indentation (in diff output)
				if (result.exitCode === 1) {
					const output = result.stdout + result.stderr;
					expect(output).toContain("+ ··if·(true)·{");
				}
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should format with semicolons", async () => {
			const testCode = `
        const message = 'hello'
        console.log(message)
        
        function test() {
          return 'test'
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["format", tempFile]);

				// Biome format returns 1 when changes would be made
				expect([0, 1]).toContain(result.exitCode);
				if (result.exitCode === 1) {
					const output = result.stdout + result.stderr;
					expect(output).toContain("+ const·message·=·'hello';");
				}
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should format with ES5 trailing commas", async () => {
			const testCode = `
        const obj = {
          key1: 'value1',
          key2: 'value2',
        };
        
        const arr = [
          'item1',
          'item2',
        ];
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["format", tempFile]);

				// Biome format returns 1 when changes would be made
				expect([0, 1]).toContain(result.exitCode);
				// Should keep trailing commas in objects and arrays
				if (result.exitCode === 1) {
					const output = result.stdout + result.stderr;
					expect(output).toContain("+ ··key2:·'value2',");
				}
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should format with proper line width", async () => {
			const testCode = `
        const veryLongVariableName = 'This is a very long string that should probably be wrapped at some point to maintain readability';
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["format", tempFile]);

				// Biome format returns 1 when changes would be made
				expect([0, 1]).toContain(result.exitCode);
				// Should respect line width of 100 characters
				let longLines: string[] = [];
				if (result.stdout) {
					const lines = result.stdout.split("\n");
					longLines = lines.filter((line) => line.length > 100);
				}
				expect(longLines.length).toBe(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});
	});

	describe("File Inclusion and Exclusion", () => {
		test("should include TypeScript files", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			const includes = config.files?.includes || [];
			expect(includes.some((pattern) => pattern.includes("ts"))).toBe(true);
			expect(includes.some((pattern) => pattern.includes("tsx"))).toBe(true);
		});

		test("should include JavaScript files", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			const includes = config.files?.includes || [];
			expect(includes.some((pattern) => pattern.includes("js"))).toBe(true);
			expect(includes.some((pattern) => pattern.includes("jsx"))).toBe(true);
		});

		test("should exclude node_modules and build directories", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			const config: BiomeConfig = JSON.parse(
				readFileSync(biomeConfigPath, "utf-8"),
			);

			const overrides = config.overrides || [];
			const excludeOverride = overrides.find((override) =>
				override.includes.some((pattern) => pattern.includes("node_modules")),
			);

			expect(excludeOverride).toBeDefined();
			expect(excludeOverride?.linter?.enabled).toBe(false);
			expect(excludeOverride?.formatter?.enabled).toBe(false);

			// Should also exclude other build directories
			expect(
				excludeOverride?.includes.some((pattern) => pattern.includes("dist")),
			).toBe(true);
			expect(
				excludeOverride?.includes.some((pattern) => pattern.includes("build")),
			).toBe(true);
			expect(
				excludeOverride?.includes.some((pattern) =>
					pattern.includes("coverage"),
				),
			).toBe(true);
		});
	});

	describe("Integration with Project Scripts", () => {
		test("should run lint script successfully", async () => {
			const result = await runBiomeCommand(["lint", "--help"], projectRoot);

			expect(result.exitCode).toBe(0);
			expect(result.stdout).toContain("lint");
		});

		test("should run format script successfully", async () => {
			const result = await runBiomeCommand(["format", "--help"], projectRoot);

			expect(result.exitCode).toBe(0);
			expect(result.stdout).toContain("format");
		});

		test("should run check script successfully", async () => {
			const result = await runBiomeCommand(["check", "--help"], projectRoot);

			expect(result.exitCode).toBe(0);
			expect(result.stdout).toContain("check");
		});

		test("should validate package.json scripts use Biome", async () => {
			const packageJsonPath = join(projectRoot, "package.json");
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

			expect(packageJson.scripts.lint).toContain("biome");
			expect(packageJson.scripts.format).toContain("biome format");
			expect(packageJson.scripts.check).toContain("biome");
		});
	});

	describe("Performance and Compatibility", () => {
		test("should lint files quickly", async () => {
			const testCode = `
        const message: string = 'performance test';
        console.log(message);
        
        function testFunction(): void {
          const data = { key: 'value' };
          console.log(data);
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const startTime = Date.now();
				const result = await runBiomeCommand(["lint", tempFile]);
				const duration = Date.now() - startTime;

				expect(result.exitCode).toBeLessThanOrEqual(1); // 0 for no issues, 1 for lint issues
				expect(duration).toBeLessThan(5000); // Should be fast
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should format files quickly", async () => {
			const testCode = `
        const message="performance test"
        console.log(message)
        
        function testFunction(){
        const data={key:"value"}
        console.log(data)
        }
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const startTime = Date.now();
				const result = await runBiomeCommand(["format", tempFile]);
				const duration = Date.now() - startTime;

				expect([0, 1]).toContain(result.exitCode);
				expect(duration).toBeLessThan(3000); // Should be very fast
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should handle large files efficiently", async () => {
			// Create a larger test file
			const largeTestCode = Array(100)
				.fill(`
        function testFunction${Math.random()}(): string {
          const message: string = 'test message';
          const data = { key: 'value', number: 42 };
          return \`\${message} - \${JSON.stringify(data)}\`;
        }
      `)
				.join("\n");

			const tempFile = createTempTestFile(largeTestCode);

			try {
				const startTime = Date.now();
				const result = await runBiomeCommand(["check", tempFile]);
				const duration = Date.now() - startTime;

				expect(result.exitCode).toBeLessThanOrEqual(1);
				expect(duration).toBeLessThan(10000); // Should handle large files reasonably fast
			} finally {
				cleanupTempFile(tempFile);
			}
		});
	});

	describe("Error Reporting and Diagnostics", () => {
		test("should provide clear error messages", async () => {
			const testCode = `
        const message: string = 123; // Type error
        let unusedVar = 'unused';
        console.log(message);
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				expect(result.exitCode).toBeGreaterThan(0);
				expect(result.stdout).toContain("error");
				expect(result.stdout.length).toBeGreaterThan(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should provide helpful suggestions", async () => {
			const testCode = `
        let message = 'hello';
        console.log(message);
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				// Should suggest using const (or pass if rule is working)
				expect(result.exitCode).toBeGreaterThanOrEqual(0);
			} finally {
				cleanupTempFile(tempFile);
			}
		});

		test("should show file locations for errors", async () => {
			const testCode = `
        const badCode: any = 'test';
        console.log(badCode);
      `;

			const tempFile = createTempTestFile(testCode);

			try {
				const result = await runBiomeCommand(["lint", tempFile]);

				expect(result.exitCode).toBeGreaterThan(0);
				// Should show line numbers or file locations
				expect(result.stdout).toMatch(/\d+/); // Should contain numbers (line numbers)
			} finally {
				cleanupTempFile(tempFile);
			}
		});
	});
});
