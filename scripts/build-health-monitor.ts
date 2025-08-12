#!/usr/bin/env bun

/**
 * Build Health Monitor - Comprehensive build validation and health checks
 * Provides continuous monitoring and validation of build system health
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { performance } from "node:perf_hooks";

/**
 * Health check result
 */
interface HealthCheckResult {
	name: string;
	status: "healthy" | "warning" | "critical";
	message: string;
	score: number; // 0-100
	details?: string;
	suggestions?: string[];
	lastChecked: Date;
	duration: number;
}

/**
 * Health report
 */
interface HealthReport {
	timestamp: Date;
	overallScore: number;
	overallStatus: "healthy" | "warning" | "critical";
	checks: HealthCheckResult[];
	summary: {
		healthy: number;
		warnings: number;
		critical: number;
		total: number;
	};
	recommendations: string[];
}

/**
 * Build Health Monitor main class
 */
class BuildHealthMonitor {
	private projectRoot: string;
	private healthChecks: HealthCheckResult[] = [];

	constructor(projectRoot: string = process.cwd()) {
		this.projectRoot = resolve(projectRoot);
	}

	/**
	 * Run comprehensive health checks
	 */
	async runHealthChecks(): Promise<HealthReport> {
		console.log("🏥 Running build health checks...\n");

		this.healthChecks = [];

		// Run all health checks
		await Promise.all([
			this.checkDependencyHealth(),
			this.checkTypeScriptHealth(),
			this.checkBuildSystemHealth(),
			this.checkWorkspaceHealth(),
			this.checkEnvironmentHealth(),
			this.checkPerformanceHealth(),
			this.checkSecurityHealth(),
			this.checkMaintenanceHealth(),
		]);

		// Generate report
		return this.generateHealthReport();
	}

	/**
	 * Check dependency health
	 */
	private async checkDependencyHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			let message = "Dependencies are healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check node_modules existence and integrity
			const nodeModules = join(this.projectRoot, "node_modules");
			if (!existsSync(nodeModules)) {
				score = 0;
				status = "critical";
				message = "node_modules directory missing";
				suggestions.push("Run 'bun install' to install dependencies");
			} else {
				// Check .bin directory
				const binDir = join(nodeModules, ".bin");
				if (!existsSync(binDir)) {
					score -= 30;
					status = "warning";
					message = "Binary mappings missing";
					suggestions.push(
						"Run 'bun install --force' to restore binary mappings",
					);
				}

				// Check package count
				try {
					const fs = require("node:fs");
					const packages = fs.readdirSync(nodeModules);
					const packageCount = packages.filter(
						(p: string) => !p.startsWith("."),
					).length;
					details += `${packageCount} packages installed. `;

					if (packageCount === 0) {
						score -= 50;
						status = "critical";
						message = "No packages found in node_modules";
					} else if (packageCount > 2000) {
						score -= 10;
						status = "warning";
						suggestions.push(
							"Consider dependency audit for large package count",
						);
					}
				} catch {
					score -= 20;
					suggestions.push("Unable to read node_modules directory");
				}
			}

			// Check lock file
			const lockFiles = ["bun.lockb", "package-lock.json", "yarn.lock"];
			const lockFile = lockFiles.find((f) =>
				existsSync(join(this.projectRoot, f)),
			);
			if (lockFile) {
				details += `Lock file: ${lockFile}. `;
			} else {
				score -= 15;
				if (status !== "critical") {
					status = "warning";
				}
				suggestions.push("Generate lock file for reproducible builds");
			}

			// Test dependency access
			const testResult = await this.runCommand("bun", ["list", "typescript"], {
				timeout: 10000,
			});
			if (!testResult.success) {
				score -= 25;
				if (status !== "critical") {
					status = "warning";
				}
				suggestions.push("TypeScript dependency not accessible");
			}

			this.addHealthCheck({
				name: "Dependency Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Dependency Health",
				status: "critical",
				message: "Dependency health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Run dependency cleanup and reinstall"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check TypeScript health
	 */
	private async checkTypeScriptHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			let message = "TypeScript system is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check TypeScript installation
			const tsVersionResult = await this.runCommand(
				"bunx",
				["tsc", "--version"],
				{
					timeout: 10000,
				},
			);
			if (tsVersionResult.success) {
				details += `TypeScript version: ${tsVersionResult.stdout?.trim()}. `;
			} else {
				score -= 40;
				status = "critical";
				message = "TypeScript compiler not accessible";
				suggestions.push("Install TypeScript: bun add -D typescript");
			}

			// Check tsconfig.json files
			const tsConfigs = [
				join(this.projectRoot, "tsconfig.json"),
				join(this.projectRoot, "packages/shared/tsconfig.json"),
				join(this.projectRoot, "packages/backend/tsconfig.json"),
				join(this.projectRoot, "packages/frontend/tsconfig.json"),
				join(this.projectRoot, "packages/cli/tsconfig.json"),
			];

			let configCount = 0;
			for (const config of tsConfigs) {
				if (existsSync(config)) {
					configCount++;
					try {
						JSON.parse(readFileSync(config, "utf-8"));
					} catch {
						score -= 10;
						if (status !== "critical") {
							status = "warning";
						}
						suggestions.push(`Fix JSON syntax in ${config}`);
					}
				}
			}

			details += `${configCount}/${tsConfigs.length} TypeScript configs found. `;

			// Test compilation
			const compileResult = await this.runCommand("bunx", ["tsc", "--noEmit"], {
				timeout: 60000,
			});
			if (compileResult.success) {
				details += "Compilation successful. ";
			} else {
				const errorCount = (compileResult.stderr?.match(/error TS\d+:/g) || [])
					.length;
				if (errorCount > 0) {
					score -= Math.min(50, errorCount * 2);
					status = errorCount > 10 ? "critical" : "warning";
					message = `${errorCount} TypeScript compilation errors`;
					suggestions.push("Fix TypeScript compilation errors");
					details += `${errorCount} compilation errors. `;
				}
			}

			// Check for build cache
			const buildInfoFiles = [
				join(this.projectRoot, "tsconfig.tsbuildinfo"),
				join(this.projectRoot, "packages/shared/tsconfig.tsbuildinfo"),
			];

			const cacheCount = buildInfoFiles.filter((f) => existsSync(f)).length;
			if (cacheCount > 0) {
				details += `${cacheCount} build cache files found. `;
			}

			this.addHealthCheck({
				name: "TypeScript Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "TypeScript Health",
				status: "critical",
				message: "TypeScript health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Check TypeScript installation and configuration"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check build system health
	 */
	private async checkBuildSystemHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			let message = "Build system is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check package.json scripts
			const packageJsonPath = join(this.projectRoot, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageData = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
				const scripts = packageData.scripts || {};

				const essentialScripts = [
					"build",
					"build:shared",
					"build:backend",
					"build:frontend",
				];
				const missingScripts = essentialScripts.filter(
					(script) => !scripts[script],
				);

				if (missingScripts.length > 0) {
					score -= missingScripts.length * 15;
					status = missingScripts.length > 2 ? "critical" : "warning";
					suggestions.push(
						`Add missing build scripts: ${missingScripts.join(", ")}`,
					);
				}

				details += `${Object.keys(scripts).length} scripts configured. `;
			} else {
				score = 0;
				status = "critical";
				message = "Root package.json missing";
				suggestions.push("Create root package.json with build scripts");
			}

			// Test build process
			const buildTestResult = await this.runCommand(
				"bun",
				["run", "build:shared"],
				{
					timeout: 120000,
				},
			);
			if (buildTestResult.success) {
				details += "Shared package builds successfully. ";
			} else {
				score -= 30;
				if (status !== "critical") {
					status = "warning";
				}
				message = "Build process has issues";
				suggestions.push("Fix shared package build errors");
			}

			// Check dist directories
			const distDirs = [
				join(this.projectRoot, "packages/shared/dist"),
				join(this.projectRoot, "packages/backend/dist"),
				join(this.projectRoot, "packages/frontend/dist"),
				join(this.projectRoot, "packages/cli/dist"),
			];

			const builtPackages = distDirs.filter((dir) => existsSync(dir)).length;
			details += `${builtPackages}/${distDirs.length} packages have build output. `;

			if (builtPackages === 0) {
				score -= 20;
				if (status !== "critical") {
					status = "warning";
				}
				suggestions.push("Run full build to generate output");
			}

			this.addHealthCheck({
				name: "Build System Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Build System Health",
				status: "critical",
				message: "Build system health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Check build configuration and scripts"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check workspace health
	 */
	private async checkWorkspaceHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			let message = "Workspace is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check workspace configuration
			const packageJsonPath = join(this.projectRoot, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageData = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
				if (packageData.workspaces) {
					details += "Workspace configuration found. ";
				} else {
					score -= 25;
					status = "warning";
					suggestions.push("Add workspace configuration to package.json");
				}
			}

			// Check packages directory
			const packagesDir = join(this.projectRoot, "packages");
			if (existsSync(packagesDir)) {
				const fs = require("node:fs");
				const packages = fs
					.readdirSync(packagesDir, { withFileTypes: true })
					.filter((dirent: { isDirectory: () => boolean }) =>
						dirent.isDirectory(),
					)
					.map((dirent: { name: string }) => dirent.name);

				details += `${packages.length} workspace packages found. `;

				// Check each package
				let validPackages = 0;
				for (const pkg of packages) {
					const pkgJsonPath = join(packagesDir, pkg, "package.json");
					if (existsSync(pkgJsonPath)) {
						try {
							JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
							validPackages++;
						} catch {
							score -= 10;
							status = "warning";
							suggestions.push(`Fix package.json syntax in ${pkg}`);
						}
					} else {
						score -= 15;
						status = "warning";
						suggestions.push(`Add package.json to ${pkg} package`);
					}
				}

				details += `${validPackages}/${packages.length} packages have valid configuration. `;
			} else {
				score = 0;
				status = "critical";
				message = "Packages directory missing";
				suggestions.push("Create packages directory structure");
			}

			this.addHealthCheck({
				name: "Workspace Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Workspace Health",
				status: "critical",
				message: "Workspace health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Check workspace configuration"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check environment health
	 */
	private async checkEnvironmentHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			let message = "Environment is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check Node.js version
			const nodeVersion = process.version;
			const majorVersion = Number.parseInt(
				nodeVersion.slice(1).split(".")[0],
				10,
			);
			details += `Node.js ${nodeVersion}. `;

			if (majorVersion < 18) {
				score -= 40;
				status = "critical";
				message = "Node.js version too old";
				suggestions.push("Upgrade Node.js to version 18 or higher");
			} else if (majorVersion < 20) {
				score -= 10;
				status = "warning";
				suggestions.push(
					"Consider upgrading to Node.js 20+ for better performance",
				);
			}

			// Check Bun installation
			const bunResult = await this.runCommand("bun", ["--version"], {
				timeout: 5000,
			});
			if (bunResult.success) {
				details += `Bun ${bunResult.stdout?.trim()}. `;
			} else {
				score -= 20;
				status = status === "critical" ? status : "warning";
				suggestions.push("Install Bun package manager");
			}

			// Check memory usage
			const memoryUsage = process.memoryUsage();
			const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
			const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
			details += `Memory: ${heapUsedMB}/${heapTotalMB}MB. `;

			if (heapTotalMB < 512) {
				score -= 15;
				status = "warning";
				suggestions.push("Consider increasing Node.js memory limit");
			}

			// Check disk space (simplified)
			try {
				const _stats = statSync(this.projectRoot);
				details += "Project directory accessible. ";
			} catch {
				score -= 30;
				status = "critical";
				suggestions.push("Check file permissions and disk space");
			}

			// Check platform-specific issues
			if (process.platform === "win32") {
				details += "Windows platform. ";
				// Windows-specific checks could go here
			}

			this.addHealthCheck({
				name: "Environment Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Environment Health",
				status: "critical",
				message: "Environment health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Check system requirements and environment"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check performance health
	 */
	private async checkPerformanceHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			const message = "Performance is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Test build performance
			const buildStartTime = performance.now();
			const buildResult = await this.runCommand(
				"bun",
				["run", "build:shared"],
				{
					timeout: 120000,
				},
			);
			const buildDuration = performance.now() - buildStartTime;

			if (buildResult.success) {
				details += `Shared build time: ${Math.round(buildDuration)}ms. `;

				if (buildDuration > 60000) {
					// > 1 minute
					score -= 20;
					status = "warning";
					suggestions.push("Build time is slow, consider optimization");
				} else if (buildDuration > 120000) {
					// > 2 minutes
					score -= 40;
					status = "critical";
					suggestions.push("Build time is very slow, needs optimization");
				}
			} else {
				score -= 50;
				status = "critical";
				suggestions.push(
					"Build performance cannot be measured due to build failure",
				);
			}

			// Check node_modules size (performance indicator)
			const nodeModules = join(this.projectRoot, "node_modules");
			if (existsSync(nodeModules)) {
				try {
					const fs = require("node:fs");
					const packages = fs.readdirSync(nodeModules);
					const packageCount = packages.filter(
						(p: string) => !p.startsWith("."),
					).length;
					details += `${packageCount} dependencies. `;

					if (packageCount > 1500) {
						score -= 15;
						status = "warning";
						suggestions.push("Large dependency count may impact performance");
					}
				} catch {
					// Ignore if we can't read node_modules
				}
			}

			// Check for performance-impacting files
			const largeFiles = [
				join(this.projectRoot, "bun.lockb"),
				join(this.projectRoot, "package-lock.json"),
			];

			for (const file of largeFiles) {
				if (existsSync(file)) {
					try {
						const stats = statSync(file);
						const sizeMB = stats.size / (1024 * 1024);
						if (sizeMB > 10) {
							score -= 5;
							suggestions.push(
								`Large lock file (${Math.round(sizeMB)}MB) may impact performance`,
							);
						}
					} catch {
						// Ignore stat errors
					}
				}
			}

			this.addHealthCheck({
				name: "Performance Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Performance Health",
				status: "critical",
				message: "Performance health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Check system performance and build configuration"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check security health
	 */
	private async checkSecurityHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			const message = "Security is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check for security-sensitive files
			const sensitiveFiles = [
				".env",
				".env.local",
				".env.production",
				"config/secrets.json",
			];

			let exposedFiles = 0;
			for (const file of sensitiveFiles) {
				const filePath = join(this.projectRoot, file);
				if (existsSync(filePath)) {
					exposedFiles++;
					score -= 10;
					status = "warning";
					suggestions.push(`Secure or remove sensitive file: ${file}`);
				}
			}

			if (exposedFiles === 0) {
				details += "No exposed sensitive files. ";
			} else {
				details += `${exposedFiles} potentially sensitive files found. `;
			}

			// Check .gitignore
			const gitignorePath = join(this.projectRoot, ".gitignore");
			if (existsSync(gitignorePath)) {
				const gitignoreContent = readFileSync(gitignorePath, "utf-8");
				const hasNodeModules = gitignoreContent.includes("node_modules");
				const hasEnvFiles = gitignoreContent.includes(".env");
				const hasDistDirs = gitignoreContent.includes("dist");

				if (hasNodeModules && hasEnvFiles && hasDistDirs) {
					details += "Good .gitignore coverage. ";
				} else {
					score -= 15;
					status = "warning";
					suggestions.push("Improve .gitignore to exclude sensitive files");
				}
			} else {
				score -= 20;
				status = "warning";
				suggestions.push("Add .gitignore file to exclude sensitive files");
			}

			// Check for common security issues in package.json
			const packageJsonPath = join(this.projectRoot, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageData = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

				// Check for scripts that might be security risks
				const scripts = packageData.scripts || {};
				const riskyScripts = Object.entries(scripts).filter(
					([_name, script]) =>
						typeof script === "string" &&
						(script.includes("rm -rf /") ||
							script.includes("sudo") ||
							(script.includes("curl") && script.includes("bash"))),
				);

				if (riskyScripts.length > 0) {
					score -= 25;
					status = "warning";
					suggestions.push("Review potentially risky scripts in package.json");
					details += `${riskyScripts.length} potentially risky scripts. `;
				}
			}

			this.addHealthCheck({
				name: "Security Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Security Health",
				status: "critical",
				message: "Security health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Review security configuration"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Check maintenance health
	 */
	private async checkMaintenanceHealth(): Promise<void> {
		const startTime = performance.now();

		try {
			let score = 100;
			let status: "healthy" | "warning" | "critical" = "healthy";
			const message = "Maintenance is healthy";
			const suggestions: string[] = [];
			let details = "";

			// Check for outdated dependencies (simplified check)
			const packageJsonPath = join(this.projectRoot, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageData = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
				const devDeps = packageData.devDependencies || {};
				const deps = packageData.dependencies || {};

				const totalDeps =
					Object.keys(devDeps).length + Object.keys(deps).length;
				details += `${totalDeps} total dependencies. `;

				// Check for common outdated patterns
				if (devDeps.typescript?.startsWith("^4.")) {
					score -= 10;
					status = "warning";
					suggestions.push("Consider updating TypeScript to version 5.x");
				}
			}

			// Check for build artifacts that should be cleaned
			const artifactDirs = [
				join(this.projectRoot, "packages/shared/dist"),
				join(this.projectRoot, "packages/backend/dist"),
				join(this.projectRoot, "packages/frontend/dist"),
				join(this.projectRoot, "packages/cli/dist"),
			];

			let oldArtifacts = 0;
			const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

			for (const dir of artifactDirs) {
				if (existsSync(dir)) {
					try {
						const stats = statSync(dir);
						if (stats.mtime.getTime() < oneWeekAgo) {
							oldArtifacts++;
						}
					} catch {
						// Ignore stat errors
					}
				}
			}

			if (oldArtifacts > 0) {
				score -= 5;
				suggestions.push(
					"Consider rebuilding packages with old build artifacts",
				);
				details += `${oldArtifacts} packages with old build artifacts. `;
			}

			// Check for log files that might need cleanup
			const logFiles = [
				join(this.projectRoot, "backend.log"),
				join(this.projectRoot, "backend.err"),
				join(this.projectRoot, "build-doctor-report.json"),
			];

			let logFileCount = 0;
			for (const logFile of logFiles) {
				if (existsSync(logFile)) {
					logFileCount++;
					try {
						const stats = statSync(logFile);
						const sizeMB = stats.size / (1024 * 1024);
						if (sizeMB > 10) {
							score -= 5;
							suggestions.push(
								`Large log file (${Math.round(sizeMB)}MB): ${logFile}`,
							);
						}
					} catch {
						// Ignore stat errors
					}
				}
			}

			if (logFileCount > 0) {
				details += `${logFileCount} log files present. `;
			}

			this.addHealthCheck({
				name: "Maintenance Health",
				status,
				message,
				score,
				details,
				suggestions,
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		} catch (error) {
			this.addHealthCheck({
				name: "Maintenance Health",
				status: "critical",
				message: "Maintenance health check failed",
				score: 0,
				details: error instanceof Error ? error.message : String(error),
				suggestions: ["Review maintenance procedures"],
				lastChecked: new Date(),
				duration: performance.now() - startTime,
			});
		}
	}

	/**
	 * Generate comprehensive health report
	 */
	private generateHealthReport(): HealthReport {
		const healthy = this.healthChecks.filter(
			(c) => c.status === "healthy",
		).length;
		const warnings = this.healthChecks.filter(
			(c) => c.status === "warning",
		).length;
		const critical = this.healthChecks.filter(
			(c) => c.status === "critical",
		).length;

		const overallScore = Math.round(
			this.healthChecks.reduce((sum, check) => sum + check.score, 0) /
				this.healthChecks.length,
		);

		let overallStatus: "healthy" | "warning" | "critical";
		if (critical > 0) {
			overallStatus = "critical";
		} else if (warnings > 0) {
			overallStatus = "warning";
		} else {
			overallStatus = "healthy";
		}

		// Generate recommendations
		const recommendations: string[] = [];
		if (critical > 0) {
			recommendations.push(
				"Address critical issues immediately to restore build functionality",
			);
		}
		if (warnings > 0) {
			recommendations.push("Review warning items to prevent future issues");
		}
		if (overallScore < 80) {
			recommendations.push(
				"Run 'bun run recovery:full' to address multiple issues",
			);
		}
		if (overallScore >= 90) {
			recommendations.push(
				"Build system is in excellent health - maintain current practices",
			);
		}

		const report: HealthReport = {
			timestamp: new Date(),
			overallScore,
			overallStatus,
			checks: this.healthChecks,
			summary: {
				healthy,
				warnings,
				critical,
				total: this.healthChecks.length,
			},
			recommendations,
		};

		this.displayHealthReport(report);
		this.saveHealthReport(report);

		return report;
	}

	/**
	 * Display health report to console
	 */
	private displayHealthReport(report: HealthReport): void {
		console.log(`\n${"=".repeat(80)}`);
		console.log("                     BUILD HEALTH REPORT");
		console.log("=".repeat(80));

		// Overall status
		const statusIcon =
			report.overallStatus === "healthy"
				? "🟢"
				: report.overallStatus === "warning"
					? "🟡"
					: "🔴";

		console.log(
			`\n${statusIcon} Overall Health Score: ${report.overallScore}/100 (${report.overallStatus.toUpperCase()})`,
		);
		console.log(
			`📊 Summary: ${report.summary.healthy} healthy, ${report.summary.warnings} warnings, ${report.summary.critical} critical\n`,
		);

		// Individual checks
		const statusOrder = ["critical", "warning", "healthy"];
		const statusIcons = { healthy: "🟢", warning: "🟡", critical: "🔴" };

		for (const status of statusOrder) {
			const checks = report.checks.filter((c) => c.status === status);
			if (checks.length === 0) continue;

			console.log(`${status.toUpperCase()} (${checks.length}):`);
			console.log("-".repeat(40));

			for (const check of checks) {
				console.log(
					`${statusIcons[check.status]} ${check.name}: ${check.message} (${check.score}/100)`,
				);

				if (check.details) {
					console.log(`   Details: ${check.details}`);
				}

				if (check.suggestions && check.suggestions.length > 0) {
					console.log("   Suggestions:");
					check.suggestions.forEach((suggestion) => {
						console.log(`   • ${suggestion}`);
					});
				}

				console.log(`   Duration: ${Math.round(check.duration)}ms`);
				console.log();
			}
		}

		// Recommendations
		if (report.recommendations.length > 0) {
			console.log("RECOMMENDATIONS:");
			console.log("-".repeat(40));
			report.recommendations.forEach((rec, index) => {
				console.log(`${index + 1}. ${rec}`);
			});
			console.log();
		}

		console.log("=".repeat(80));
	}

	/**
	 * Save health report to file
	 */
	private saveHealthReport(report: HealthReport): void {
		try {
			const reportPath = join(this.projectRoot, "build-health-report.json");
			writeFileSync(reportPath, JSON.stringify(report, null, 2));
			console.log(`📄 Detailed health report saved to: ${reportPath}`);
		} catch (error) {
			console.log(
				`⚠️  Failed to save health report: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Utility methods
	 */
	private addHealthCheck(check: HealthCheckResult): void {
		this.healthChecks.push(check);
	}

	private async runCommand(
		command: string,
		args: string[],
		options: { timeout?: number; cwd?: string } = {},
	): Promise<{
		success: boolean;
		stdout?: string;
		stderr?: string;
		error?: string;
	}> {
		return new Promise((resolve) => {
			const child = spawn(command, args, {
				cwd: options.cwd || this.projectRoot,
				stdio: "pipe",
			});

			let stdout = "";
			let stderr = "";
			let timeoutId: NodeJS.Timeout | null = null;

			if (options.timeout) {
				timeoutId = setTimeout(() => {
					child.kill("SIGTERM");
					resolve({
						success: false,
						error: `Command timed out after ${options.timeout}ms`,
					});
				}, options.timeout);
			}

			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (code) => {
				if (timeoutId) clearTimeout(timeoutId);

				resolve({
					success: code === 0,
					stdout: stdout || undefined,
					stderr: stderr || undefined,
					error:
						code !== 0
							? stderr || `Command failed with exit code ${code}`
							: undefined,
				});
			});

			child.on("error", (error) => {
				if (timeoutId) clearTimeout(timeoutId);

				resolve({
					success: false,
					error: error.message,
				});
			});
		});
	}
}

/**
 * CLI interface
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const projectRoot =
		args.find((arg) => !arg.startsWith("--")) || process.cwd();

	const monitor = new BuildHealthMonitor(projectRoot);

	try {
		const report = await monitor.runHealthChecks();

		// Exit with appropriate code
		if (report.overallStatus === "critical") {
			process.exit(2);
		} else if (report.overallStatus === "warning") {
			process.exit(1);
		} else {
			process.exit(0);
		}
	} catch (_error) {
		process.exit(3);
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

export default BuildHealthMonitor;
