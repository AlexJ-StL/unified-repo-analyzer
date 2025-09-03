#!/usr/bin/env bun

/**
 * Coverage Summary and Status Report
 * Provides a comprehensive summary of coverage collection status
 * Requirements: 5.1, 5.2, 5.3
 */

import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

interface CoverageStatus {
  configured: boolean;
  working: boolean;
  hasData: boolean;
  issues: string[];
  recommendations: string[];
}

class CoverageSummary {
  private readonly projectRoot = process.cwd();
  private readonly coverageDir = "coverage";
  private readonly reportsDir = "coverage-reports";

  async generateCoverageSummary(): Promise<CoverageStatus> {
    console.log("📊 Generating coverage collection summary...");

    const status: CoverageStatus = {
      configured: false,
      working: false,
      hasData: false,
      issues: [],
      recommendations: [],
    };

    try {
      // Check configuration
      status.configured = await this.checkConfiguration();

      // Check if coverage data exists
      status.hasData = await this.checkCoverageData();

      // Check if coverage collection is working
      status.working = status.configured && this.checkCoverageInfrastructure();

      // Identify issues and recommendations
      await this.identifyIssuesAndRecommendations(status);

      // Generate comprehensive report
      await this.generateReport(status);

      // Print summary
      this.printSummary(status);

      return status;
    } catch (error) {
      console.error("❌ Failed to generate coverage summary:", error);
      status.issues.push(`Summary generation failed: ${error}`);
      return status;
    }
  }

  private async checkConfiguration(): Promise<boolean> {
    try {
      const configPath = join(this.projectRoot, "vitest.config.ts");

      if (!existsSync(configPath)) {
        return false;
      }

      const config = await readFile(configPath, "utf-8");

      // Check for essential coverage configuration
      const checks = [
        config.includes("coverage:"),
        config.includes('provider: "v8"'),
        config.includes("reporter:"),
        config.includes("thresholds:"),
        config.includes("exclude:"),
      ];

      return checks.every(Boolean);
    } catch {
      return false;
    }
  }

  private async checkCoverageData(): Promise<boolean> {
    const coverageFiles = [
      join(this.coverageDir, "coverage-final.json"),
      join(this.coverageDir, "index.html"),
      join(this.coverageDir, "lcov.info"),
    ];

    return coverageFiles.some((file) => existsSync(file));
  }

  private checkCoverageInfrastructure(): boolean {
    // Check if coverage directories exist
    const requiredDirs = [this.coverageDir, this.reportsDir];
    const dirsExist = requiredDirs.every((dir) => existsSync(dir));

    // Check if package.json has coverage scripts
    const packageJsonPath = join(this.projectRoot, "package.json");
    if (!existsSync(packageJsonPath)) {
      return false;
    }

    try {
      const packageJson = require(packageJsonPath);
      const hasScripts =
        packageJson.scripts &&
        packageJson.scripts["test:coverage"] &&
        packageJson.scripts["test:coverage:analysis"];

      return dirsExist && hasScripts;
    } catch {
      return false;
    }
  }

  private async identifyIssuesAndRecommendations(
    status: CoverageStatus
  ): Promise<void> {
    // Check for common issues
    if (!status.configured) {
      status.issues.push("Coverage configuration is incomplete or missing");
      status.recommendations.push(
        "Run `npm run test:coverage:fix` to fix configuration"
      );
    }

    if (!existsSync(this.coverageDir)) {
      status.issues.push("Coverage directory does not exist");
      status.recommendations.push("Create coverage directory: mkdir coverage");
    }

    if (!existsSync(this.reportsDir)) {
      status.issues.push("Coverage reports directory does not exist");
      status.recommendations.push(
        "Create reports directory: mkdir coverage-reports"
      );
    }

    if (!status.hasData) {
      status.issues.push("No coverage data found");
      status.recommendations.push(
        "Run tests with coverage: npm run test:coverage"
      );
    }

    // Check for Vitest installation
    const packageJsonPath = join(this.projectRoot, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          await readFile(packageJsonPath, "utf-8")
        );
        const hasVitest =
          packageJson.devDependencies?.vitest ||
          packageJson.dependencies?.vitest;

        if (!hasVitest) {
          status.issues.push("Vitest is not installed");
          status.recommendations.push("Install Vitest: bun add -d vitest");
        }

        const hasCoverageProvider =
          packageJson.devDependencies?.["@vitest/coverage-v8"] ||
          packageJson.dependencies?.["@vitest/coverage-v8"];

        if (!hasCoverageProvider) {
          status.issues.push(
            "Coverage provider (@vitest/coverage-v8) is not installed"
          );
          status.recommendations.push(
            "Install coverage provider: bun add -d @vitest/coverage-v8"
          );
        }
      } catch {
        status.issues.push("Could not read package.json");
      }
    }

    // Add general recommendations
    if (status.working && status.hasData) {
      status.recommendations.push("✅ Coverage collection is working properly");
      status.recommendations.push(
        "Use `npm run test:coverage:analysis` for detailed analysis"
      );
      status.recommendations.push(
        "Use `npm run test:coverage:badges` to generate badges"
      );
    }

    if (status.configured && !status.hasData) {
      status.recommendations.push(
        "Configuration looks good, try running tests with coverage"
      );
      status.recommendations.push("Check if tests are passing: npm run test");
    }
  }

  private async generateReport(status: CoverageStatus): Promise<void> {
    await mkdir(this.reportsDir, { recursive: true });

    const report = {
      timestamp: new Date().toISOString(),
      status: {
        configured: status.configured,
        working: status.working,
        hasData: status.hasData,
        overall:
          status.configured && status.working ? "good" : "needs-attention",
      },
      issues: status.issues,
      recommendations: status.recommendations,
      configuration: {
        vitestConfig: existsSync(join(this.projectRoot, "vitest.config.ts")),
        coverageDir: existsSync(this.coverageDir),
        reportsDir: existsSync(this.reportsDir),
        nycConfig: existsSync(join(this.projectRoot, ".nycrc.json")),
        coverageIgnore: existsSync(join(this.projectRoot, ".coverageignore")),
      },
      availableScripts: await this.getAvailableScripts(),
      nextSteps: this.getNextSteps(status),
    };

    // Save JSON report
    await writeFile(
      join(this.reportsDir, "coverage-status.json"),
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    await this.generateMarkdownReport(report);
  }

  private async getAvailableScripts(): Promise<string[]> {
    try {
      const packageJsonPath = join(this.projectRoot, "package.json");
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

      const coverageScripts = Object.keys(packageJson.scripts || {})
        .filter((script) => script.includes("coverage"))
        .sort();

      return coverageScripts;
    } catch {
      return [];
    }
  }

  private getNextSteps(status: CoverageStatus): string[] {
    const steps: string[] = [];

    if (!status.configured) {
      steps.push("1. Fix coverage configuration: npm run test:coverage:fix");
      steps.push(
        "2. Verify configuration: bun scripts/coverage-validation.ts full"
      );
    } else if (!status.hasData) {
      steps.push("1. Run tests with coverage: npm run test:coverage");
      steps.push("2. Generate analysis: npm run test:coverage:analysis");
    } else if (status.working && status.hasData) {
      steps.push("1. View coverage report: open coverage/index.html");
      steps.push(
        "2. Generate detailed analysis: npm run test:coverage:analysis"
      );
      steps.push("3. Create coverage badges: npm run test:coverage:badges");
    } else {
      steps.push(
        "1. Check validation report: coverage-reports/validation-report.md"
      );
      steps.push("2. Fix identified issues");
      steps.push(
        "3. Re-run validation: bun scripts/coverage-validation.ts full"
      );
    }

    return steps;
  }

  private async generateMarkdownReport(report: any): Promise<void> {
    let markdown = "# Coverage Collection Status Report\n\n";
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Status overview
    markdown += "## Status Overview\n\n";
    markdown += `- **Configuration**: ${report.status.configured ? "✅ Complete" : "❌ Incomplete"}\n`;
    markdown += `- **Infrastructure**: ${report.status.working ? "✅ Working" : "❌ Issues Found"}\n`;
    markdown += `- **Coverage Data**: ${report.status.hasData ? "✅ Available" : "❌ Missing"}\n`;
    markdown += `- **Overall Status**: ${report.status.overall === "good" ? "✅ Good" : "⚠️ Needs Attention"}\n\n`;

    // Configuration details
    markdown += "## Configuration Status\n\n";
    markdown += "| Component | Status |\n";
    markdown += "|-----------|--------|\n";
    markdown += `| Vitest Config | ${report.configuration.vitestConfig ? "✅" : "❌"} |\n`;
    markdown += `| Coverage Directory | ${report.configuration.coverageDir ? "✅" : "❌"} |\n`;
    markdown += `| Reports Directory | ${report.configuration.reportsDir ? "✅" : "❌"} |\n`;
    markdown += `| NYC Config | ${report.configuration.nycConfig ? "✅" : "❌"} |\n`;
    markdown += `| Coverage Ignore | ${report.configuration.coverageIgnore ? "✅" : "❌"} |\n\n`;

    // Available scripts
    if (report.availableScripts.length > 0) {
      markdown += "## Available Coverage Scripts\n\n";
      for (const script of report.availableScripts) {
        markdown += `- \`npm run ${script}\`\n`;
      }
      markdown += "\n";
    }

    // Issues
    if (report.issues.length > 0) {
      markdown += "## Issues Found\n\n";
      for (const issue of report.issues) {
        markdown += `- ❌ ${issue}\n`;
      }
      markdown += "\n";
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += "## Recommendations\n\n";
      for (const rec of report.recommendations) {
        markdown += `- ${rec}\n`;
      }
      markdown += "\n";
    }

    // Next steps
    if (report.nextSteps.length > 0) {
      markdown += "## Next Steps\n\n";
      for (const step of report.nextSteps) {
        markdown += `${step}\n`;
      }
      markdown += "\n";
    }

    // Usage examples
    markdown += "## Usage Examples\n\n";
    markdown += "```bash\n";
    markdown += "# Run tests with coverage\n";
    markdown += "npm run test:coverage\n\n";
    markdown += "# Generate detailed analysis\n";
    markdown += "npm run test:coverage:analysis\n\n";
    markdown += "# Create coverage badges\n";
    markdown += "npm run test:coverage:badges\n\n";
    markdown += "# Validate coverage setup\n";
    markdown += "bun scripts/coverage-validation.ts full\n";
    markdown += "```\n\n";

    await writeFile(join(this.reportsDir, "coverage-status.md"), markdown);
  }

  private printSummary(status: CoverageStatus): void {
    console.log("\n📊 Coverage Collection Summary:");
    console.log("================================");

    const configStatus = status.configured
      ? "✅ Configured"
      : "❌ Not Configured";
    const workingStatus = status.working ? "✅ Working" : "❌ Issues Found";
    const dataStatus = status.hasData ? "✅ Has Data" : "❌ No Data";

    console.log(`Configuration: ${configStatus}`);
    console.log(`Infrastructure: ${workingStatus}`);
    console.log(`Coverage Data: ${dataStatus}`);

    if (status.issues.length > 0) {
      console.log("\n⚠️ Issues Found:");
      for (const issue of status.issues.slice(0, 3)) {
        console.log(`   • ${issue}`);
      }
      if (status.issues.length > 3) {
        console.log(`   • ... and ${status.issues.length - 3} more`);
      }
    }

    if (status.recommendations.length > 0) {
      console.log("\n💡 Key Recommendations:");
      for (const rec of status.recommendations.slice(0, 3)) {
        console.log(`   • ${rec}`);
      }
    }

    console.log("\n📋 Detailed report: coverage-reports/coverage-status.md");
  }
}

// CLI interface
if (import.meta.main) {
  const summary = new CoverageSummary();
  await summary.generateCoverageSummary();
}

export { CoverageSummary };
