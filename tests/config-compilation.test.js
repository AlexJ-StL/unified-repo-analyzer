/**
 * Configuration compilation tests
 *
 * Tests to ensure all TypeScript configuration files compile correctly
 * and maintain their expected functionality after migration.
 */
import { spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, test } from "vitest";
// Helper function to compile TypeScript file and check for errors
async function compileTypeScriptFile(filePath) {
    return new Promise((resolve) => {
        const child = spawn("bun", ["build", filePath, "--target", "node"], {
            stdio: "pipe",
        });
        let stderr = "";
        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        child.on("close", (code) => {
            const errors = stderr
                .split("\n")
                .filter((line) => line.includes("error"))
                .map((line) => line.trim())
                .filter(Boolean);
            const warnings = stderr
                .split("\n")
                .filter((line) => line.includes("warning"))
                .map((line) => line.trim())
                .filter(Boolean);
            resolve({
                success: code === 0,
                errors,
                warnings,
            });
        });
    });
}
describe("Configuration Compilation Tests", () => {
    const projectRoot = resolve(__dirname, "..");
    describe("Frontend Configuration Files", () => {
        test("PostCSS config should compile without errors", async () => {
            const configPath = join(projectRoot, "packages/frontend/postcss.config.ts");
            expect(existsSync(configPath)).toBe(true);
            const result = await compileTypeScriptFile(configPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test("PostCSS config should have correct type structure", async () => {
            const configPath = join(projectRoot, "packages/frontend/postcss.config.ts");
            const configContent = readFileSync(configPath, "utf-8");
            // Should import the correct type
            expect(configContent).toContain("import type { PostCSSConfig }");
            expect(configContent).toContain("from '../../types/config'");
            // Should have proper type annotation
            expect(configContent).toContain("const config: PostCSSConfig");
            // Should export default
            expect(configContent).toContain("export default config");
        });
        test("Tailwind config should compile without errors", async () => {
            const configPath = join(projectRoot, "packages/frontend/tailwind.config.ts");
            expect(existsSync(configPath)).toBe(true);
            const result = await compileTypeScriptFile(configPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test("Tailwind config should have correct type structure", async () => {
            const configPath = join(projectRoot, "packages/frontend/tailwind.config.ts");
            const configContent = readFileSync(configPath, "utf-8");
            // Should import the correct type
            expect(configContent).toContain("import type { TailwindConfig }");
            expect(configContent).toContain("from '../../types/config'");
            // Should have proper type annotation
            expect(configContent).toContain("const config: TailwindConfig");
            // Should export default
            expect(configContent).toContain("export default config");
        });
        test("Vite config should compile without errors", async () => {
            const configPath = join(projectRoot, "packages/frontend/vite.config.ts");
            expect(existsSync(configPath)).toBe(true);
            const result = await compileTypeScriptFile(configPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
    describe("Root Configuration Files", () => {
        test("Vitest config should compile without errors", async () => {
            const configPath = join(projectRoot, "vitest.config.ts");
            expect(existsSync(configPath)).toBe(true);
            const result = await compileTypeScriptFile(configPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test("Vitest config should have proper structure", async () => {
            const configPath = join(projectRoot, "vitest.config.ts");
            const configContent = readFileSync(configPath, "utf-8");
            // Should import defineConfig from vitest
            expect(configContent).toContain("import { defineConfig } from 'vitest/config'");
            // Should export default with defineConfig
            expect(configContent).toContain("export default defineConfig");
            // Should have test configuration
            expect(configContent).toContain("test:");
            expect(configContent).toContain("globals: true");
            expect(configContent).toContain("environment: 'node'");
        });
    });
    describe("Script Files", () => {
        test("Test runner script should compile without errors", async () => {
            const scriptPath = join(projectRoot, "scripts/test-runner.ts");
            expect(existsSync(scriptPath)).toBe(true);
            const result = await compileTypeScriptFile(scriptPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test("Test runner script should have proper TypeScript structure", async () => {
            const scriptPath = join(projectRoot, "scripts/test-runner.ts");
            const scriptContent = readFileSync(scriptPath, "utf-8");
            // Should have proper imports
            expect(scriptContent).toContain("import");
            expect(scriptContent).toContain("from");
            // Should have type imports
            expect(scriptContent).toContain("import type");
            // Should have class definition with proper typing
            expect(scriptContent).toContain("class TestRunner");
            // Should have proper method signatures
            expect(scriptContent).toContain("async run()");
            expect(scriptContent).toContain("Promise<void>");
        });
    });
    describe("Type Definition Files", () => {
        test("Config types should compile without errors", async () => {
            const typesPath = join(projectRoot, "types/config.ts");
            expect(existsSync(typesPath)).toBe(true);
            const result = await compileTypeScriptFile(typesPath);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test("Config types should export all required interfaces", async () => {
            const typesPath = join(projectRoot, "types/config.ts");
            const typesContent = readFileSync(typesPath, "utf-8");
            // Should export key interfaces
            expect(typesContent).toContain("export interface PostCSSConfig");
            expect(typesContent).toContain("export interface TailwindConfig");
            expect(typesContent).toContain("export interface BiomeConfig");
            expect(typesContent).toContain("export interface TestResult");
            expect(typesContent).toContain("export interface TestResults");
            expect(typesContent).toContain("export interface TestEnvironment");
            expect(typesContent).toContain("export interface TestReport");
        });
        test("Config types should have proper interface structure", async () => {
            const typesPath = join(projectRoot, "types/config.ts");
            const typesContent = readFileSync(typesPath, "utf-8");
            // PostCSS config should have plugins property
            expect(typesContent).toMatch(/PostCSSConfig\s*{[\s\S]*plugins:\s*Record<string,\s*any>/);
            // Tailwind config should have required properties
            expect(typesContent).toMatch(/TailwindConfig\s*{[\s\S]*content:\s*string\[\]/);
            expect(typesContent).toMatch(/TailwindConfig\s*{[\s\S]*theme:\s*{/);
            expect(typesContent).toMatch(/TailwindConfig\s*{[\s\S]*plugins:\s*any\[\]/);
            // Test result should have status property
            expect(typesContent).toMatch(/TestResult\s*{[\s\S]*status:\s*'passed'\s*\|\s*'failed'/);
        });
    });
    describe("Configuration File Imports", () => {
        test("All configuration files should be importable", async () => {
            const configFiles = [
                join(projectRoot, "packages/frontend/postcss.config.ts"),
                join(projectRoot, "packages/frontend/tailwind.config.ts"),
                join(projectRoot, "vitest.config.ts"),
            ];
            for (const configPath of configFiles) {
                try {
                    const config = await import(configPath);
                    expect(config.default).toBeDefined();
                }
                catch (error) {
                    throw new Error(`Failed to import ${configPath}: ${error}`);
                }
            }
        });
        test("Type definitions should be importable", async () => {
            try {
                const types = await import(join(projectRoot, "types/config.ts"));
                expect(types).toBeDefined();
                // We can't directly test interface exports, but we can verify the module loads
                expect(typeof types).toBe("object");
            }
            catch (error) {
                throw new Error(`Failed to import type definitions: ${error}`);
            }
        });
        test("Test runner should be importable", async () => {
            try {
                const testRunner = await import(join(projectRoot, "scripts/test-runner.ts"));
                expect(testRunner.default).toBeDefined();
                expect(typeof testRunner.default).toBe("function");
            }
            catch (error) {
                throw new Error(`Failed to import test runner: ${error}`);
            }
        });
    });
    describe("Configuration Validation", () => {
        test("PostCSS config should have valid plugin configuration", async () => {
            const configPath = join(projectRoot, "packages/frontend/postcss.config.ts");
            const config = await import(configPath);
            expect(config.default.plugins).toBeDefined();
            expect(config.default.plugins.tailwindcss).toBeDefined();
            expect(config.default.plugins.autoprefixer).toBeDefined();
        });
        test("Tailwind config should have valid content paths", async () => {
            const configPath = join(projectRoot, "packages/frontend/tailwind.config.ts");
            const config = await import(configPath);
            expect(Array.isArray(config.default.content)).toBe(true);
            expect(config.default.content.length).toBeGreaterThan(0);
            expect(config.default.content).toContain("./index.html");
            expect(config.default.content.some((path) => path.includes("src/**/*"))).toBe(true);
        });
        test("Vitest config should have valid test settings", async () => {
            const configPath = join(projectRoot, "vitest.config.ts");
            const config = await import(configPath);
            expect(config.default.test).toBeDefined();
            expect(config.default.test.globals).toBe(true);
            expect(config.default.test.environment).toBe("node");
            expect(config.default.test.setupFiles).toBeDefined();
            expect(config.default.test.coverage).toBeDefined();
        });
    });
});
//# sourceMappingURL=config-compilation.test.js.map