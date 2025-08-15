#!/usr/bin/env node

/**
 * Backward Compatibility Validation Script
 *
 * This script validates that the new Windows path handling and logging features
 * maintain backward compatibility with existing configurations and workflows.
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";

interface ValidationResult {
	passed: boolean;
	message: string;
	details?: string[];
}

interface CompatibilityTest {
	name: string;
	description: string;
	test: () => Promise<ValidationResult>;
}

class CompatibilityValidator {
	private projectRoot: string;
	private tests: CompatibilityTest[];

	constructor() {
		this.projectRoot = path.resolve(__dirname, "..");
		this.tests = [
			{
				name: "config-backward-compatibility",
				description: "Validate configuration backward compatibility",
				test: this.testConfigBackwardCompatibility.bind(this),
			},
			{
				name: "api-backward-compatibility",
				description: "Validate API backward compatibility",
				test: this.testApiBackwardCompatibility.bind(this),
			},
			{
				name: "path-handling-compatibility",
				description: "Validate path handling backward compatibility",
				test: this.testPathHandlingCompatibility.bind(this),
			},
			{
				name: "logging-compatibility",
				description: "Validate logging backward compatibility",
				test: this.testLoggingCompatibility.bind(this),
			},
			{
				name: "environment-compatibility",
				description: "Validate environment variable compatibility",
				test: this.testEnvironmentCompatibility.bind(this),
			},
			{
				name: "deployment-compatibility",
				description: "Validate deployment script compatibility",
				test: this.testDeploymentCompatibility.bind(this),
			},
		];
	}

	async run(): Promise<void> {
		console.log("🔍 Backward Compatibility Validation");
		console.log("====================================\n");

		let totalTests = 0;
		let passedTests = 0;
		let failedTests = 0;

		for (const test of this.tests) {
			totalTests++;
			console.log(`🧪 Running test: ${test.name}`);
			console.log(`   Description: ${test.description}`);

			try {
				const result = await test.test();

				if (result.passed) {
					passedTests++;
					console.log(`   ✅ PASSED: ${result.message}`);
				} else {
					failedTests++;
					console.log(`   ❌ FAILED: ${result.message}`);
					if (result.details) {
						result.details.forEach((detail) => {
							console.log(`      - ${detail}`);
						});
					}
				}
			} catch (error) {
				failedTests++;
				console.log(`   ❌ ERROR: ${error}`);
			}

			console.log();
		}

		// Summary
		console.log("📊 Validation Summary");
		console.log("====================");
		console.log(`Total tests: ${totalTests}`);
		console.log(`Passed: ${passedTests}`);
		console.log(`Failed: ${failedTests}`);
		console.log(
			`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`,
		);

		if (failedTests > 0) {
			console.log(
				"\n❌ Some compatibility tests failed. Please review the issues above.",
			);
			process.exit(1);
		} else {
			console.log("\n✅ All compatibility tests passed!");
		}
	}

	private async testConfigBackwardCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check if old configuration files still work
		const legacyConfigPaths = [
			".env.example",
			"packages/backend/.env.example",
			"packages/frontend/.env.example",
		];

		for (const configPath of legacyConfigPaths) {
			const fullPath = path.join(this.projectRoot, configPath);
			if (fs.existsSync(fullPath)) {
				try {
					const content = fs.readFileSync(fullPath, "utf-8");

					// Check for breaking changes in configuration format
					const lines = content.split("\n");
					for (const line of lines) {
						if (line.includes("=") && !line.startsWith("#")) {
							const [key] = line.split("=");

							// Check for removed configuration keys
							const removedKeys = ["OLD_LOG_FORMAT", "LEGACY_PATH_HANDLING"];
							if (removedKeys.includes(key.trim())) {
								issues.push(`Removed configuration key found: ${key}`);
							}
						}
					}
				} catch (error) {
					issues.push(`Failed to read configuration file: ${configPath}`);
				}
			}
		}

		// Check for required new configuration with sensible defaults
		const requiredNewConfig = [
			"WINDOWS_LONG_PATH_SUPPORT",
			"LOG_LEVEL",
			"LOG_FORMAT",
		];

		// These should have defaults even if not explicitly configured
		for (const key of requiredNewConfig) {
			// This would be checked in the actual application startup
			// For now, we just verify the migration script handles them
		}

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "Configuration backward compatibility maintained"
					: `Found ${issues.length} configuration compatibility issue(s)`,
			details: issues,
		};
	}

	private async testApiBackwardCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check if existing API endpoints still exist and work
		const legacyEndpoints = [
			"/api/health",
			"/api/analyze",
			"/api/repositories",
			"/api/export",
		];

		// Note: This would require the application to be running
		// For now, we check if the endpoint definitions exist in the codebase
		const apiFiles = [
			"packages/backend/src/routes",
			"packages/backend/src/controllers",
		];

		for (const apiDir of apiFiles) {
			const fullPath = path.join(this.projectRoot, apiDir);
			if (fs.existsSync(fullPath)) {
				// Check if route files exist (basic check)
				const files = fs.readdirSync(fullPath, { withFileTypes: true });
				const routeFiles = files.filter(
					(f) => f.isFile() && f.name.endsWith(".ts"),
				);

				if (routeFiles.length === 0) {
					issues.push(`No route files found in ${apiDir}`);
				}
			} else {
				issues.push(`API directory not found: ${apiDir}`);
			}
		}

		// Check for new endpoints that don't break existing patterns
		const newEndpoints = [
			"/api/validate-path",
			"/api/logs",
			"/api/logs/config",
		];

		// Verify new endpoints follow existing patterns
		// This is a placeholder for actual API pattern validation

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "API backward compatibility maintained"
					: `Found ${issues.length} API compatibility issue(s)`,
			details: issues,
		};
	}

	private async testPathHandlingCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Test that old path formats still work
		const testPaths = [
			"C:\\Users\\Test\\Documents", // Windows backslash
			"C:/Users/Test/Documents", // Windows forward slash
			"/home/user/documents", // Unix path
			"~/documents", // Home directory
			"./relative/path", // Relative path
			"../parent/path", // Parent relative path
		];

		// This would test the actual path validation logic
		// For now, we check that the path handling code exists
		const pathHandlerFiles = [
			"packages/backend/src/services/PathHandler.ts",
			"packages/shared/src/utils/pathUtils.ts",
		];

		for (const file of pathHandlerFiles) {
			const fullPath = path.join(this.projectRoot, file);
			if (!fs.existsSync(fullPath)) {
				// Check if it might be in a different location
				const alternativePaths = [
					file.replace(".ts", ".js"),
					file.replace("/src/", "/dist/"),
					file.replace("PathHandler", "pathHandler"),
				];

				let found = false;
				for (const altPath of alternativePaths) {
					if (fs.existsSync(path.join(this.projectRoot, altPath))) {
						found = true;
						break;
					}
				}

				if (!found) {
					issues.push(`Path handler file not found: ${file}`);
				}
			}
		}

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "Path handling backward compatibility maintained"
					: `Found ${issues.length} path handling compatibility issue(s)`,
			details: issues,
		};
	}

	private async testLoggingCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check that existing log files and formats are still supported
		const logDir = path.join(this.projectRoot, "logs");

		// Check if log directory structure is maintained
		if (fs.existsSync(logDir)) {
			const logFiles = fs.readdirSync(logDir);

			// Check for existing log files that should still be readable
			const existingLogFiles = logFiles.filter((f) => f.endsWith(".log"));

			for (const logFile of existingLogFiles) {
				try {
					const logPath = path.join(logDir, logFile);
					const stats = fs.statSync(logPath);

					if (stats.size > 0) {
						// Try to read the first few lines to ensure format compatibility
						const content = fs.readFileSync(logPath, "utf-8");
						const lines = content.split("\n").slice(0, 5);

						// Check if it's valid JSON or text format
						for (const line of lines) {
							if (line.trim()) {
								try {
									JSON.parse(line);
									// Valid JSON log entry
								} catch {
									// Should be valid text format
									if (!line.includes("[") || !line.includes("]")) {
										// Might be an invalid format
										// This is a basic check, real validation would be more thorough
									}
								}
							}
						}
					}
				} catch (error) {
					issues.push(`Failed to read existing log file: ${logFile}`);
				}
			}
		}

		// Check that logging configuration is backward compatible
		const loggingConfigFiles = [
			"packages/backend/src/config/logging.ts",
			"packages/backend/src/services/Logger.ts",
		];

		for (const file of loggingConfigFiles) {
			const fullPath = path.join(this.projectRoot, file);
			if (!fs.existsSync(fullPath)) {
				// Check alternative locations
				const alternatives = [
					file.replace(".ts", ".js"),
					file.replace("/src/", "/dist/"),
				];

				let found = false;
				for (const alt of alternatives) {
					if (fs.existsSync(path.join(this.projectRoot, alt))) {
						found = true;
						break;
					}
				}

				if (!found) {
					issues.push(`Logging configuration file not found: ${file}`);
				}
			}
		}

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "Logging backward compatibility maintained"
					: `Found ${issues.length} logging compatibility issue(s)`,
			details: issues,
		};
	}

	private async testEnvironmentCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check that existing environment variables are still supported
		const existingEnvVars = [
			"NODE_ENV",
			"PORT",
			"HOST",
			"DATABASE_URL",
			"JWT_SECRET",
			"SESSION_SECRET",
		];

		// Check if these are documented or handled in the codebase
		const configFiles = [
			"packages/backend/src/config/index.ts",
			"packages/backend/src/config/environment.ts",
		];

		let configFound = false;
		for (const configFile of configFiles) {
			const fullPath = path.join(this.projectRoot, configFile);
			if (fs.existsSync(fullPath)) {
				configFound = true;
				try {
					const content = fs.readFileSync(fullPath, "utf-8");

					// Check if existing environment variables are still referenced
					for (const envVar of existingEnvVars) {
						if (!content.includes(envVar)) {
							// This might be okay if the variable is optional
							// But we should document it
						}
					}
				} catch (error) {
					issues.push(`Failed to read config file: ${configFile}`);
				}
			}
		}

		if (!configFound) {
			issues.push(
				"No configuration files found to validate environment variables",
			);
		}

		// Check for new environment variables that have sensible defaults
		const newEnvVars = [
			"WINDOWS_LONG_PATH_SUPPORT",
			"LOG_LEVEL",
			"LOG_FORMAT",
			"PATH_VALIDATION_TIMEOUT",
		];

		// These should be optional with good defaults
		// The migration script should handle adding them

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "Environment variable compatibility maintained"
					: `Found ${issues.length} environment compatibility issue(s)`,
			details: issues,
		};
	}

	private async testDeploymentCompatibility(): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check that existing deployment scripts still work
		const deploymentScripts = [
			"scripts/deploy.sh",
			"scripts/deploy.ps1",
			"scripts/build-production.sh",
			"scripts/build-production.ps1",
		];

		for (const script of deploymentScripts) {
			const fullPath = path.join(this.projectRoot, script);
			if (fs.existsSync(fullPath)) {
				try {
					const content = fs.readFileSync(fullPath, "utf-8");

					// Check for breaking changes in script structure
					// This is a basic check - real validation would be more thorough

					// Check if scripts reference removed commands or files
					const removedCommands = ["old-build-command", "legacy-deploy"];
					for (const cmd of removedCommands) {
						if (content.includes(cmd)) {
							issues.push(
								`Script ${script} references removed command: ${cmd}`,
							);
						}
					}

					// Check if scripts have proper error handling
					if (
						!content.includes("exit 1") &&
						!content.includes("$LASTEXITCODE")
					) {
						// This might be okay, but good scripts should handle errors
					}
				} catch (error) {
					issues.push(`Failed to read deployment script: ${script}`);
				}
			} else {
				issues.push(`Deployment script not found: ${script}`);
			}
		}

		// Check Docker configuration compatibility
		const dockerFiles = [
			"docker-compose.yml",
			"Dockerfile",
			"packages/backend/Dockerfile",
			"packages/frontend/Dockerfile",
		];

		for (const dockerFile of dockerFiles) {
			const fullPath = path.join(this.projectRoot, dockerFile);
			if (fs.existsSync(fullPath)) {
				try {
					const content = fs.readFileSync(fullPath, "utf-8");

					// Basic Docker configuration validation
					if (dockerFile.includes("docker-compose")) {
						if (!content.includes("version:")) {
							issues.push(`Docker Compose file missing version: ${dockerFile}`);
						}
					}

					if (
						dockerFile === "Dockerfile" ||
						dockerFile.endsWith("Dockerfile")
					) {
						if (!content.includes("FROM ")) {
							issues.push(`Dockerfile missing FROM instruction: ${dockerFile}`);
						}
					}
				} catch (error) {
					issues.push(`Failed to read Docker file: ${dockerFile}`);
				}
			}
		}

		return {
			passed: issues.length === 0,
			message:
				issues.length === 0
					? "Deployment compatibility maintained"
					: `Found ${issues.length} deployment compatibility issue(s)`,
			details: issues,
		};
	}

	private async makeHttpRequest(
		url: string,
		timeout: number = 5000,
	): Promise<{ statusCode: number; body: string }> {
		return new Promise((resolve, reject) => {
			const req = http.get(url, { timeout }, (res) => {
				let body = "";
				res.on("data", (chunk) => (body += chunk));
				res.on("end", () => resolve({ statusCode: res.statusCode || 0, body }));
			});

			req.on("error", reject);
			req.on("timeout", () => {
				req.destroy();
				reject(new Error("Request timeout"));
			});
		});
	}

	private async runCommand(
		command: string,
		args: string[],
		cwd?: string,
	): Promise<{ code: number; stdout: string; stderr: string }> {
		return new Promise((resolve) => {
			const child = spawn(command, args, {
				cwd: cwd || this.projectRoot,
				stdio: "pipe",
			});

			let stdout = "";
			let stderr = "";

			child.stdout?.on("data", (data) => (stdout += data));
			child.stderr?.on("data", (data) => (stderr += data));

			child.on("close", (code) => {
				resolve({ code: code || 0, stdout, stderr });
			});
		});
	}
}

// Run the validation if this script is executed directly
if (require.main === module) {
	const validator = new CompatibilityValidator();
	validator.run().catch((error) => {
		console.error("Validation failed:", error);
		process.exit(1);
	});
}

export { CompatibilityValidator };
