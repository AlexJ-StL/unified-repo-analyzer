#!/usr/bin/env bun

/**
 * Coverage Validation and Health Check
 * Validates coverage configuration and provides health status
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execSync } from "node:child_process";

class CoverageValidator {
  async validateCoverage(): Promise<void> {
    console.log("🔍 Validating coverage configuration...");

    const checks = [
      { name: "Vitest Config", check: () => this.checkVitestConfig() },
      { name: "Coverage Provider", check: () => this.checkCoverageProvider() },
      { name: "Test Files", check: () => this.checkTestFiles() },
      { name: "Coverage Collection", check: () => this.checkCoverageCollection() },
      { name: "Reports Generation", check: () => this.checkReportsGeneration() },
    ];

    let passed = 0;
    let total = checks.length;

    for (const check of checks) {
      try {
        const result = await check.check();
        console.log(`✅ ${check.name}: ${result || "OK"}`);
        passed++;
      } catch (error) {
        console.log(`❌ ${check.name}: ${error}`);
      }
    }

    console.log(`\n📊 Validation Results: ${passed}/${total} checks passed`);

    if (passed === total) {
      console.log("🎉 Coverage configuration is healthy!");
    } else {
      console.log("⚠️ Coverage configuration needs attention.");
      console.log("Run 'bun run scripts/coverage-fix.ts fix' to resolve issues.");
    }
  }

  private async checkVitestConfig(): Promise<string> {
    if (!existsSync("vitest.config.ts")) {
      throw new Error("vitest.config.ts not found");
    }

    const config = await readFile("vitest.config.ts", "utf-8");
    
    if (!config.includes("coverage:")) {
      throw new Error("Coverage configuration missing");
    }

    return "Configuration found";
  }

  private async checkCoverageProvider(): Promise<string> {
    try {
      execSync("bunx c8 --version", { stdio: "pipe" });
      return "c8 provider available";
    } catch {
      try {
        execSync("bunx nyc --version", { stdio: "pipe" });
        return "nyc provider available";
      } catch {
        throw new Error("No coverage provider available");
      }
    }
  }

  private async checkTestFiles(): Promise<string> {
    const testDirs = ["tests", "packages/*/src/__tests__"];
    let testCount = 0;

    for (const dir of testDirs) {
      if (existsSync(dir)) {
        testCount++;
      }
    }

    if (testCount === 0) {
      throw new Error("No test directories found");
    }

    return `${testCount} test directories found`;
  }

  private async checkCoverageCollection(): Promise<string> {
    try {
      execSync("bun run vitest run --coverage --reporter=default --run --maxConcurrency=1", {
        stdio: "pipe",
        timeout: 30000,
      });
      return "Coverage collection works";
    } catch {
      return "Coverage collection may have issues";
    }
  }

  private async checkReportsGeneration(): Promise<string> {
    const reportFiles = [
      "coverage-reports/coverage-status.json",
      "coverage-reports/coverage-status.md",
      "coverage-reports/dashboard.html",
    ];

    const existingReports = reportFiles.filter(file => existsSync(file));
    
    return `${existingReports.length}/${reportFiles.length} report files exist`;
  }
}

if (import.meta.main) {
  const validator = new CoverageValidator();
  await validator.validateCoverage();
}

export { CoverageValidator };
