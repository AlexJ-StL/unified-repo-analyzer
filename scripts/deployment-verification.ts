#!/usr/bin/env node

/**
 * Deployment Verification Tests
 *
 * This script runs comprehensive tests to verify that the deployment
 * is successful and all new features are working correctly.
 */

import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";

interface VerificationTest {
	name: string;
	description: string;
	test: () => Promise<TestResult>;
	critical: boolean;
}

interface TestResult {
	passed: boolean;
	message: string;
	details?: string[];
	duration?: number;
}

class DeploymentVerifier {
	private baseUrl: string;
	private tests: VerificationTest[];
	private projectRoot: string;

	constructor(baseUrl: string = "http://localhost:3001") {
		this.baseUrl = baseUrl;
		this.projectRoot = path.resolve(__dirname, "..");
		this.tests = [
			{
				name: "health-check",
				description: "Verify application health endpoint",
				test: this.testHealthEndpoint.bind(this),
				critical: true,
			},
			{
				name: "path-validation-api",
				description: "Test path validation API functionality",
				test: this.testPathValidationApi.bind(this),
				critical: true,
			},
			{
				name: "logging-api",
				description: "Test logging API endpoints",
				test: this.testLoggingApi.bind(this),
				critical: false,
			},
			{
				name: "windows-path-handling",
				description: "Test Windows path handling features",
				test: this.testWindowsPathHandling.bind(this),
				critical: true,
			},
			{
				name: "configuration-loading",
				description: "Verify configuration is loaded correctly",
				test: this.testConfigurationLoading.bind(this),
				critical: true,
			},
			{
				name: "log-file-creation",
				description: "Verify log files are created and rotated",
				test: this.testLogFileCreation.bind(this),
				critical: false,
			},
			{
				name: "backward-compatibility",
				description: "Test backward compatibility with existing APIs",
				test: this.testBackwardCompatibility.bind(this),
				critical: true,
			},
			{
				name: "performance-baseline",
				description: "Establish performance baseline",
				test: this.testPerformanceBaseline.bind(this),
				critical: false,
			},
		];
	}

	async run(): Promise<void> {
		console.log("🔍 Deployment Verification Tests");
		console.log("================================\n");

		let totalTests = 0;
		let passedTests = 0;
		let failedTests = 0;
		let criticalFailures = 0;

		for (const test of this.tests) {
			totalTests++;
			console.log(`🧪 Running: ${test.name}`);
			console.log(`   ${test.description}`);

			const startTime = Date.now();

			try {
				const result = await test.test();
				const duration = Date.now() - startTime;

				if (result.passed) {
					passedTests++;
					console.log(`   ✅ PASSED: ${result.message} (${duration}ms)`);
				} else {
					failedTests++;
					if (test.critical) {
						criticalFailures++;
					}

					const severity = test.critical ? "CRITICAL" : "WARNING";
					console.log(`   ❌ ${severity}: ${result.message} (${duration}ms)`);

					if (result.details) {
						result.details.forEach((detail) => {
							console.log(`      - ${detail}`);
						});
					}
				}
			} catch (error) {
				failedTests++;
				if (test.critical) {
					criticalFailures++;
				}

				const severity = test.critical ? "CRITICAL" : "WARNING";
				console.log(`   ❌ ${severity}: Test failed with error: ${error}`);
			}

			console.log();
		}

		// Summary
		console.log("📊 Verification Summary");
		console.log("=======================");
		console.log(`Total tests: ${totalTests}`);
		console.log(`Passed: ${passedTests}`);
		console.log(`Failed: ${failedTests}`);
		console.log(`Critical failures: ${criticalFailures}`);
		console.log(
			`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`,
		);

		if (criticalFailures > 0) {
			console.log("\n❌ DEPLOYMENT VERIFICATION FAILED");
			console.log(
				`${criticalFailures} critical test(s) failed. Deployment should be rolled back.`,
			);
			process.exit(1);
		} else if (failedTests > 0) {
			console.log("\n⚠️  DEPLOYMENT VERIFICATION COMPLETED WITH WARNINGS");
			console.log(
				`${failedTests} non-critical test(s) failed. Monitor closely.`,
			);
		} else {
			console.log("\n✅ DEPLOYMENT VERIFICATION SUCCESSFUL");
			console.log("All tests passed. Deployment is ready for production.");
		}
	}
	private async testHealthEndpoint(): Promise<TestResult> {
		try {
			const response = await this.makeHttpRequest(`${this.baseUrl}/api/health`);

			if (response.statusCode === 200) {
				const data = JSON.parse(response.body);

				if (data.status === "healthy") {
					return {
						passed: true,
						message: "Health endpoint responding correctly",
					};
				} else {
					return {
						passed: false,
						message: `Health endpoint returned unhealthy status: ${data.status}`,
					};
				}
			} else {
				return {
					passed: false,
					message: `Health endpoint returned status ${response.statusCode}`,
				};
			}
		} catch (error) {
			return {
				passed: false,
				message: `Health endpoint not accessible: ${error}`,
			};
		}
	}

	private async testPathValidationApi(): Promise<TestResult> {
		const testPaths = [
			"C:/Users/Test/Documents",
			"C:\\Users\\Test\\Documents",
			"/home/user/documents",
			"./relative/path",
		];

		const results: string[] = [];
		let allPassed = true;

		for (const testPath of testPaths) {
			try {
				const response = await this.makeHttpRequest(
					`${this.baseUrl}/api/validate-path`,
					"POST",
					JSON.stringify({ path: testPath }),
				);

				if (response.statusCode === 200) {
					const data = JSON.parse(response.body);
					if (
						Object.hasOwn(data, "isValid") &&
						Object.hasOwn(data, "normalizedPath")
					) {
						results.push(`✓ ${testPath}: Valid response`);
					} else {
						results.push(`✗ ${testPath}: Invalid response format`);
						allPassed = false;
					}
				} else {
					results.push(`✗ ${testPath}: HTTP ${response.statusCode}`);
					allPassed = false;
				}
			} catch (error) {
				results.push(`✗ ${testPath}: ${error}`);
				allPassed = false;
			}
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Path validation API working correctly"
				: "Path validation API has issues",
			details: results,
		};
	}

	private async testLoggingApi(): Promise<TestResult> {
		const results: string[] = [];
		let allPassed = true;

		try {
			// Test log retrieval
			const logsResponse = await this.makeHttpRequest(
				`${this.baseUrl}/api/logs?limit=10`,
			);

			if (logsResponse.statusCode === 200) {
				const data = JSON.parse(logsResponse.body);
				if (Object.hasOwn(data, "logs") && Array.isArray(data.logs)) {
					results.push("✓ Log retrieval endpoint working");
				} else {
					results.push("✗ Log retrieval endpoint invalid format");
					allPassed = false;
				}
			} else {
				results.push(
					`✗ Log retrieval endpoint: HTTP ${logsResponse.statusCode}`,
				);
				allPassed = false;
			}

			// Test log configuration
			const configResponse = await this.makeHttpRequest(
				`${this.baseUrl}/api/logs/config`,
			);

			if (configResponse.statusCode === 200) {
				const data = JSON.parse(configResponse.body);
				if (Object.hasOwn(data, "level") && Object.hasOwn(data, "format")) {
					results.push("✓ Log configuration endpoint working");
				} else {
					results.push("✗ Log configuration endpoint invalid format");
					allPassed = false;
				}
			} else {
				results.push(
					`✗ Log configuration endpoint: HTTP ${configResponse.statusCode}`,
				);
				allPassed = false;
			}
		} catch (error) {
			results.push(`✗ Logging API error: ${error}`);
			allPassed = false;
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Logging API endpoints working correctly"
				: "Logging API has issues",
			details: results,
		};
	}

	private async testWindowsPathHandling(): Promise<TestResult> {
		const windowsPaths = [
			"C:\\Program Files\\Test",
			"C:/Program Files/Test",
			"\\\\server\\share\\folder",
			"D:\\Very\\Long\\Path\\That\\Exceeds\\Normal\\Windows\\Limits\\And\\Should\\Be\\Handled\\Correctly\\By\\The\\New\\Path\\Handler\\Service\\With\\Long\\Path\\Support\\Enabled",
		];

		const results: string[] = [];
		let allPassed = true;

		for (const testPath of windowsPaths) {
			try {
				const response = await this.makeHttpRequest(
					`${this.baseUrl}/api/validate-path`,
					"POST",
					JSON.stringify({
						path: testPath,
						options: { checkPermissions: false, validateContents: false },
					}),
				);

				if (response.statusCode === 200) {
					const data = JSON.parse(response.body);

					if (data.normalizedPath) {
						// Check if path was normalized correctly
						const normalized = data.normalizedPath;
						if (normalized.includes("/") || normalized.includes("\\")) {
							results.push(`✓ ${testPath}: Normalized to ${normalized}`);
						} else {
							results.push(`✗ ${testPath}: Invalid normalization`);
							allPassed = false;
						}
					} else {
						results.push(`✗ ${testPath}: No normalized path returned`);
						allPassed = false;
					}
				} else {
					results.push(`✗ ${testPath}: HTTP ${response.statusCode}`);
					allPassed = false;
				}
			} catch (error) {
				results.push(`✗ ${testPath}: ${error}`);
				allPassed = false;
			}
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Windows path handling working correctly"
				: "Windows path handling has issues",
			details: results,
		};
	}

	private async testConfigurationLoading(): Promise<TestResult> {
		const results: string[] = [];
		let allPassed = true;

		try {
			// Test that configuration endpoint exists and returns expected values
			const response = await this.makeHttpRequest(
				`${this.baseUrl}/api/logs/config`,
			);

			if (response.statusCode === 200) {
				const config = JSON.parse(response.body);

				// Check for new configuration options
				const expectedKeys = [
					"level",
					"format",
					"includeStackTrace",
					"redactSensitiveData",
					"httpLogging",
					"pathLogging",
					"performanceLogging",
				];

				for (const key of expectedKeys) {
					if (Object.hasOwn(config, key)) {
						results.push(`✓ Configuration key present: ${key}`);
					} else {
						results.push(`✗ Missing configuration key: ${key}`);
						allPassed = false;
					}
				}

				// Check specific values
				if (config.httpLogging && typeof config.httpLogging === "object") {
					results.push("✓ HTTP logging configuration loaded");
				} else {
					results.push("✗ HTTP logging configuration missing");
					allPassed = false;
				}

				if (config.pathLogging && typeof config.pathLogging === "object") {
					results.push("✓ Path logging configuration loaded");
				} else {
					results.push("✗ Path logging configuration missing");
					allPassed = false;
				}
			} else {
				results.push(`✗ Configuration endpoint: HTTP ${response.statusCode}`);
				allPassed = false;
			}
		} catch (error) {
			results.push(`✗ Configuration loading error: ${error}`);
			allPassed = false;
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Configuration loading working correctly"
				: "Configuration loading has issues",
			details: results,
		};
	}

	private async testLogFileCreation(): Promise<TestResult> {
		const results: string[] = [];
		let allPassed = true;

		try {
			const logDir = path.join(this.projectRoot, "logs");

			if (fs.existsSync(logDir)) {
				results.push("✓ Log directory exists");

				const logFiles = fs
					.readdirSync(logDir)
					.filter((f) => f.endsWith(".log"));

				if (logFiles.length > 0) {
					results.push(`✓ Found ${logFiles.length} log file(s)`);

					// Check if log files are being written to
					for (const logFile of logFiles.slice(0, 3)) {
						// Check first 3 files
						const logPath = path.join(logDir, logFile);
						const stats = fs.statSync(logPath);

						if (stats.size > 0) {
							results.push(`✓ ${logFile}: ${stats.size} bytes`);
						} else {
							results.push(`⚠ ${logFile}: Empty file`);
						}
					}
				} else {
					results.push(
						"⚠ No log files found (may be normal for new deployment)",
					);
				}
			} else {
				results.push("✗ Log directory does not exist");
				allPassed = false;
			}
		} catch (error) {
			results.push(`✗ Log file check error: ${error}`);
			allPassed = false;
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Log file creation working correctly"
				: "Log file creation has issues",
			details: results,
		};
	}

	private async testBackwardCompatibility(): Promise<TestResult> {
		const legacyEndpoints = [
			"/api/analyze",
			"/api/repositories",
			"/api/export",
		];

		const results: string[] = [];
		let allPassed = true;

		for (const endpoint of legacyEndpoints) {
			try {
				const response = await this.makeHttpRequest(
					`${this.baseUrl}${endpoint}`,
				);

				// We expect these to return 400 (bad request) or 200, not 404 (not found)
				if (response.statusCode === 404) {
					results.push(`✗ ${endpoint}: Endpoint not found (breaking change)`);
					allPassed = false;
				} else {
					results.push(
						`✓ ${endpoint}: Endpoint exists (HTTP ${response.statusCode})`,
					);
				}
			} catch (error) {
				results.push(`✗ ${endpoint}: ${error}`);
				allPassed = false;
			}
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Backward compatibility maintained"
				: "Backward compatibility issues detected",
			details: results,
		};
	}

	private async testPerformanceBaseline(): Promise<TestResult> {
		const results: string[] = [];
		let allPassed = true;

		try {
			// Test response times for key endpoints
			const endpoints = ["/api/health", "/api/logs/config"];

			for (const endpoint of endpoints) {
				const startTime = Date.now();
				const response = await this.makeHttpRequest(
					`${this.baseUrl}${endpoint}`,
				);
				const duration = Date.now() - startTime;

				if (duration < 1000) {
					// Less than 1 second
					results.push(`✓ ${endpoint}: ${duration}ms (good)`);
				} else if (duration < 5000) {
					// Less than 5 seconds
					results.push(`⚠ ${endpoint}: ${duration}ms (acceptable)`);
				} else {
					results.push(`✗ ${endpoint}: ${duration}ms (too slow)`);
					allPassed = false;
				}
			}

			// Test path validation performance
			const pathTestStart = Date.now();
			await this.makeHttpRequest(
				`${this.baseUrl}/api/validate-path`,
				"POST",
				JSON.stringify({ path: "C:/Windows/System32" }),
			);
			const pathTestDuration = Date.now() - pathTestStart;

			if (pathTestDuration < 2000) {
				results.push(`✓ Path validation: ${pathTestDuration}ms (good)`);
			} else {
				results.push(`⚠ Path validation: ${pathTestDuration}ms (monitor)`);
			}
		} catch (error) {
			results.push(`✗ Performance test error: ${error}`);
			allPassed = false;
		}

		return {
			passed: allPassed,
			message: allPassed
				? "Performance baseline acceptable"
				: "Performance issues detected",
			details: results,
		};
	}

	private async makeHttpRequest(
		url: string,
		method: string = "GET",
		body?: string,
	): Promise<{ statusCode: number; body: string }> {
		return new Promise((resolve, reject) => {
			const urlObj = new URL(url);
			const options = {
				hostname: urlObj.hostname,
				port: urlObj.port,
				path: urlObj.pathname + urlObj.search,
				method,
				headers: {
					"Content-Type": "application/json",
					...(body && { "Content-Length": Buffer.byteLength(body) }),
				},
				timeout: 10000,
			};

			const req = (urlObj.protocol === "https:" ? https : http).request(
				options,
				(res) => {
					let responseBody = "";
					res.on("data", (chunk) => (responseBody += chunk));
					res.on("end", () => {
						resolve({
							statusCode: res.statusCode || 0,
							body: responseBody,
						});
					});
				},
			);

			req.on("error", reject);
			req.on("timeout", () => {
				req.destroy();
				reject(new Error("Request timeout"));
			});

			if (body) {
				req.write(body);
			}

			req.end();
		});
	}
}

// Run verification if this script is executed directly
if (require.main === module) {
	const baseUrl = process.argv[2] || "http://localhost:3001";
	const verifier = new DeploymentVerifier(baseUrl);

	verifier.run().catch((error) => {
		console.error("Verification failed:", error);
		process.exit(1);
	});
}

export { DeploymentVerifier };
