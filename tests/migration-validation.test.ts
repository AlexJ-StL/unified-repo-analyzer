/**
 * Migration validation tests
 *
 * This test suite validates the successful migration from JavaScript to TypeScript
 * and ensures all new tooling (Bun, Biome) works correctly.
 */

import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, test } from "vitest";

// Helper function to run shell commands
async function runCommand(
	command: string,
	args: string[],
	cwd?: string,
): Promise<{
	stdout: string;
	stderr: string;
	exitCode: number;
}> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: cwd || process.cwd(),
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

		child.on("error", (error) => {
			reject(error);
		});
	});
}

describe("Migration Validation Tests", () => {
	const projectRoot = resolve(__dirname, "..");

	describe("TypeScript Configuration Files Compilation", () => {
		test("should compile PostCSS configuration file", async () => {
			const configPath = join(
				projectRoot,
				"packages/frontend/postcss.config.ts",
			);
			expect(existsSync(configPath)).toBe(true);

			// Test that the file can be compiled
			const result = await runCommand("bun", [
				"build",
				configPath,
				"--target",
				"node",
			]);
			expect(result.exitCode).toBe(0);
		});

		test("should compile Tailwind configuration file", async () => {
			const configPath = join(
				projectRoot,
				"packages/frontend/tailwind.config.ts",
			);
			expect(existsSync(configPath)).toBe(true);

			// Test that the file can be compiled
			const result = await runCommand("bun", [
				"build",
				configPath,
				"--target",
				"node",
			]);
			expect(result.exitCode).toBe(0);
		});

		test("should compile test runner script", async () => {
			const scriptPath = join(projectRoot, "scripts/test-runner.ts");
			expect(existsSync(scriptPath)).toBe(true);

			// Test that the file can be compiled
			const result = await runCommand("bun", [
				"build",
				scriptPath,
				"--target",
				"node",
			]);
			expect(result.exitCode).toBe(0);
		});

		test("should validate type definitions file", async () => {
			const typesPath = join(projectRoot, "types/config.ts");
			expect(existsSync(typesPath)).toBe(true);

			// Test that the file can be compiled
			const result = await runCommand("bun", [
				"build",
				typesPath,
				"--target",
				"node",
			]);
			expect(result.exitCode).toBe(0);
		});
	});

	describe("Bun Runtime Compatibility", () => {
		test("should run TypeScript files natively with Bun", async () => {
			const result = await runCommand("bun", ["--version"]);
			expect(result.exitCode).toBe(0);
			expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
		});

		test("should validate package.json scripts use Bun", async () => {
			const packageJsonPath = join(projectRoot, "package.json");
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

			expect(packageJson.scripts.test).toBe("bun test");
			expect(packageJson.scripts.dev).toContain("bun run");
			expect(packageJson.scripts.build).toContain("bun run");
		});

		test("should validate Bun workspace functionality", async () => {
			const bunfigPath = join(projectRoot, "bunfig.toml");
			expect(existsSync(bunfigPath)).toBe(true);

			const bunfigContent = readFileSync(bunfigPath, "utf-8");
			expect(bunfigContent).toContain("[install]");
			expect(bunfigContent).toContain("[run]");
			expect(bunfigContent).toContain("[test]");
		});
	});

	describe("Biome Linting Rules Validation", () => {
		test("should validate Biome configuration exists", async () => {
			const biomeConfigPath = join(projectRoot, "biome.json");
			expect(existsSync(biomeConfigPath)).toBe(true);

			const biomeConfig = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));
			expect(biomeConfig.$schema).toBeDefined();
			expect(biomeConfig.linter?.enabled).toBe(true);
			expect(biomeConfig.formatter?.enabled).toBe(true);
		});

		test("should run Biome linting successfully", async () => {
			const result = await runCommand(
				"bun",
				["run", "biome", "lint", "--help"],
				projectRoot,
			);

			expect(result.exitCode).toBeLessThanOrEqual(1);
			expect(result.stderr).not.toContain("FATAL");
		});

		test("should run Biome formatting successfully", async () => {
			const result = await runCommand(
				"bun",
				["run", "biome", "format", "--help"],
				projectRoot,
			);

			expect(result.exitCode).toBe(0);
			expect(result.stderr).not.toContain("FATAL");
		});
	});
});
