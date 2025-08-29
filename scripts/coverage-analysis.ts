#!/usr/bin/env bun

/**
 * Comprehensive test coverage analysis tool
 * Provides detailed coverage reporting, analysis, and recommendations
 * Requirements: 4.2, 4.3, 4.4
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

interface CoverageData {
  total: CoverageSummary;
  files: Record<string, FileCoverage>;
}

interface CoverageSummary {
  lines: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
  branches: CoverageMetric;
}

interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface FileCoverage {
  path: string;
  statementMap: Record<string, any>;
  fnMap: Record<string, any>;
  branchMap: Record<string, any>;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number[]>;
}

interface CoverageReport {
  summary: CoverageSummary;
  packageBreakdown: Record<string, CoverageSummary>;
  lowCoverageFiles: Array<{
    file: string;
    coverage: number;
    type: 'lines' | 'functions' | 'branches' | 'statements';
  }>;
  recommendations: string[];
  trends: CoverageTrend[];
}

interface CoverageTrend {
  date: string;
  coverage: CoverageSummary;
}

class CoverageAnalyzer {
  private readonly coverageDir = 'coverage';
  private readonly reportsDir = 'coverage-reports';
  private readonly trendsFile = join(this.reportsDir, 'trends.json');

  async runCoverageAnalysis(): Promise<CoverageReport> {
    console.log('🔍 Running comprehensive coverage analysis...');

    // Run tests with coverage
    await this.runTestsWithCoverage();

    // Load coverage data
    const coverageData = await this.loadCoverageData();

    // Generate analysis report
    const report = await this.generateReport(coverageData);

    // Save report
    await this.saveReport(report);

    // Update trends
    await this.updateTrends(report.summary);

    return report;
  }

  private async runTestsWithCoverage(): Promise<void> {
    console.log('📊 Running tests with coverage collection...');

    try {
      // Run vitest with coverage
      execSync('bun run vitest run --coverage --reporter=verbose', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (_error) {}
  }

  private async loadCoverageData(): Promise<CoverageData> {
    const coverageFile = join(this.coverageDir, 'coverage-final.json');

    if (!existsSync(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}`);
    }

    const data = await readFile(coverageFile, 'utf-8');
    return JSON.parse(data);
  }

  private async generateReport(coverageData: CoverageData): Promise<CoverageReport> {
    console.log('📈 Generating coverage analysis report...');

    const summary = this.calculateSummary(coverageData);
    const packageBreakdown = this.analyzePackageBreakdown(coverageData);
    const lowCoverageFiles = this.identifyLowCoverageFiles(coverageData);
    const recommendations = this.generateRecommendations(summary, lowCoverageFiles);

    return {
      summary,
      packageBreakdown,
      lowCoverageFiles,
      recommendations,
      trends: await this.loadTrends(),
    };
  }

  private calculateSummary(coverageData: CoverageData): CoverageSummary {
    const files = Object.values(coverageData.files);

    const totals = {
      lines: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
    };

    for (const file of files) {
      // Count lines
      const lineNumbers = Object.keys(file.s).map(Number);
      totals.lines.total += lineNumbers.length;
      totals.lines.covered += lineNumbers.filter((line) => file.s[line] > 0).length;

      // Count functions
      const functionNumbers = Object.keys(file.f).map(Number);
      totals.functions.total += functionNumbers.length;
      totals.functions.covered += functionNumbers.filter((fn) => file.f[fn] > 0).length;

      // Count statements
      const statementNumbers = Object.keys(file.s).map(Number);
      totals.statements.total += statementNumbers.length;
      totals.statements.covered += statementNumbers.filter((stmt) => file.s[stmt] > 0).length;

      // Count branches
      const branchNumbers = Object.keys(file.b).map(Number);
      for (const branchNum of branchNumbers) {
        const branches = file.b[branchNum];
        totals.branches.total += branches.length;
        totals.branches.covered += branches.filter((branch) => branch > 0).length;
      }
    }

    return {
      lines: {
        total: totals.lines.total,
        covered: totals.lines.covered,
        skipped: 0,
        pct: totals.lines.total > 0 ? (totals.lines.covered / totals.lines.total) * 100 : 0,
      },
      functions: {
        total: totals.functions.total,
        covered: totals.functions.covered,
        skipped: 0,
        pct:
          totals.functions.total > 0
            ? (totals.functions.covered / totals.functions.total) * 100
            : 0,
      },
      statements: {
        total: totals.statements.total,
        covered: totals.statements.covered,
        skipped: 0,
        pct:
          totals.statements.total > 0
            ? (totals.statements.covered / totals.statements.total) * 100
            : 0,
      },
      branches: {
        total: totals.branches.total,
        covered: totals.branches.covered,
        skipped: 0,
        pct:
          totals.branches.total > 0 ? (totals.branches.covered / totals.branches.total) * 100 : 0,
      },
    };
  }

  private analyzePackageBreakdown(coverageData: CoverageData): Record<string, CoverageSummary> {
    const packages: Record<string, FileCoverage[]> = {};

    // Group files by package
    for (const [path, file] of Object.entries(coverageData.files)) {
      const packageMatch = path.match(/packages\/([^/]+)/);
      const packageName = packageMatch ? packageMatch[1] : 'root';

      if (!packages[packageName]) {
        packages[packageName] = [];
      }
      packages[packageName].push({ ...file, path });
    }

    // Calculate coverage for each package
    const breakdown: Record<string, CoverageSummary> = {};
    for (const [packageName, files] of Object.entries(packages)) {
      breakdown[packageName] = this.calculateSummary({
        total: {} as CoverageSummary,
        files: Object.fromEntries(files.map((f) => [f.path, f])),
      });
    }

    return breakdown;
  }

  private identifyLowCoverageFiles(coverageData: CoverageData): Array<{
    file: string;
    coverage: number;
    type: 'lines' | 'functions' | 'branches' | 'statements';
  }> {
    const lowCoverageFiles: Array<{
      file: string;
      coverage: number;
      type: 'lines' | 'functions' | 'branches' | 'statements';
    }> = [];

    const threshold = 70; // Below 70% is considered low coverage

    for (const [path, file] of Object.entries(coverageData.files)) {
      // Calculate file-specific coverage
      const lineNumbers = Object.keys(file.s).map(Number);
      const lineCoverage =
        lineNumbers.length > 0
          ? (lineNumbers.filter((line) => file.s[line] > 0).length / lineNumbers.length) * 100
          : 100;

      const functionNumbers = Object.keys(file.f).map(Number);
      const functionCoverage =
        functionNumbers.length > 0
          ? (functionNumbers.filter((fn) => file.f[fn] > 0).length / functionNumbers.length) * 100
          : 100;

      let branchCoverage = 100;
      const branchNumbers = Object.keys(file.b).map(Number);
      if (branchNumbers.length > 0) {
        let totalBranches = 0;
        let coveredBranches = 0;
        for (const branchNum of branchNumbers) {
          const branches = file.b[branchNum];
          totalBranches += branches.length;
          coveredBranches += branches.filter((branch) => branch > 0).length;
        }
        branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100;
      }

      // Add to low coverage list if below threshold
      if (lineCoverage < threshold) {
        lowCoverageFiles.push({
          file: path,
          coverage: lineCoverage,
          type: 'lines',
        });
      }
      if (functionCoverage < threshold) {
        lowCoverageFiles.push({
          file: path,
          coverage: functionCoverage,
          type: 'functions',
        });
      }
      if (branchCoverage < threshold) {
        lowCoverageFiles.push({
          file: path,
          coverage: branchCoverage,
          type: 'branches',
        });
      }
    }

    return lowCoverageFiles.sort((a, b) => a.coverage - b.coverage);
  }

  private generateRecommendations(
    summary: CoverageSummary,
    lowCoverageFiles: Array<{ file: string; coverage: number; type: string }>
  ): string[] {
    const recommendations: string[] = [];

    // Overall coverage recommendations
    if (summary.lines.pct < 70) {
      recommendations.push(
        `📊 Line coverage is ${summary.lines.pct.toFixed(1)}%. Target: 70%+. Add tests for uncovered code paths.`
      );
    }
    if (summary.functions.pct < 70) {
      recommendations.push(
        `🔧 Function coverage is ${summary.functions.pct.toFixed(1)}%. Target: 70%+. Test all exported functions.`
      );
    }
    if (summary.branches.pct < 70) {
      recommendations.push(
        `🌿 Branch coverage is ${summary.branches.pct.toFixed(1)}%. Target: 70%+. Test all conditional logic paths.`
      );
    }

    // File-specific recommendations
    if (lowCoverageFiles.length > 0) {
      recommendations.push(`📁 ${lowCoverageFiles.length} files have low coverage. Focus on:`);

      const topFiles = lowCoverageFiles.slice(0, 5);
      for (const file of topFiles) {
        recommendations.push(
          `   • ${file.file}: ${file.coverage.toFixed(1)}% ${file.type} coverage`
        );
      }
    }

    // Best practices
    recommendations.push('✅ Best practices:');
    recommendations.push('   • Write tests before implementing features (TDD)');
    recommendations.push('   • Test edge cases and error conditions');
    recommendations.push('   • Use integration tests for complex workflows');
    recommendations.push('   • Mock external dependencies appropriately');

    return recommendations;
  }

  private async saveReport(report: CoverageReport): Promise<void> {
    await mkdir(this.reportsDir, { recursive: true });

    // Save detailed JSON report
    const jsonReport = join(this.reportsDir, 'coverage-analysis.json');
    await writeFile(jsonReport, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    const mdReport = join(this.reportsDir, 'coverage-analysis.md');
    await writeFile(mdReport, markdownReport);

    console.log('📄 Reports saved:');
    console.log(`   • JSON: ${jsonReport}`);
    console.log(`   • Markdown: ${mdReport}`);
  }

  private generateMarkdownReport(report: CoverageReport): string {
    const { summary, packageBreakdown, lowCoverageFiles, recommendations } = report;

    let markdown = '# Test Coverage Analysis Report\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;

    // Overall summary
    markdown += '## Overall Coverage Summary\n\n';
    markdown += '| Metric | Coverage | Total | Covered |\n';
    markdown += '|--------|----------|-------|----------|\n';
    markdown += `| Lines | ${summary.lines.pct.toFixed(1)}% | ${summary.lines.total} | ${summary.lines.covered} |\n`;
    markdown += `| Functions | ${summary.functions.pct.toFixed(1)}% | ${summary.functions.total} | ${summary.functions.covered} |\n`;
    markdown += `| Statements | ${summary.statements.pct.toFixed(1)}% | ${summary.statements.total} | ${summary.statements.covered} |\n`;
    markdown += `| Branches | ${summary.branches.pct.toFixed(1)}% | ${summary.branches.total} | ${summary.branches.covered} |\n\n`;

    // Package breakdown
    markdown += '## Package Breakdown\n\n';
    markdown += '| Package | Lines | Functions | Statements | Branches |\n';
    markdown += '|---------|-------|-----------|------------|----------|\n';
    for (const [pkg, coverage] of Object.entries(packageBreakdown)) {
      markdown += `| ${pkg} | ${coverage.lines.pct.toFixed(1)}% | ${coverage.functions.pct.toFixed(1)}% | ${coverage.statements.pct.toFixed(1)}% | ${coverage.branches.pct.toFixed(1)}% |\n`;
    }
    markdown += '\n';

    // Low coverage files
    if (lowCoverageFiles.length > 0) {
      markdown += '## Files Needing Attention\n\n';
      markdown += '| File | Coverage | Type |\n';
      markdown += '|------|----------|------|\n';
      for (const file of lowCoverageFiles.slice(0, 10)) {
        markdown += `| ${file.file} | ${file.coverage.toFixed(1)}% | ${file.type} |\n`;
      }
      markdown += '\n';
    }

    // Recommendations
    markdown += '## Recommendations\n\n';
    for (const rec of recommendations) {
      markdown += `${rec}\n\n`;
    }

    return markdown;
  }

  private async loadTrends(): Promise<CoverageTrend[]> {
    if (!existsSync(this.trendsFile)) {
      return [];
    }

    try {
      const data = await readFile(this.trendsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async updateTrends(summary: CoverageSummary): Promise<void> {
    const trends = await this.loadTrends();

    trends.push({
      date: new Date().toISOString().split('T')[0],
      coverage: summary,
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filteredTrends = trends.filter((trend) => new Date(trend.date) >= thirtyDaysAgo);

    await mkdir(dirname(this.trendsFile), { recursive: true });
    await writeFile(this.trendsFile, JSON.stringify(filteredTrends, null, 2));
  }

  async generateCoverageReport(): Promise<void> {
    try {
      const report = await this.runCoverageAnalysis();

      console.log('\n🎯 Coverage Analysis Complete!');
      console.log('=====================================');
      console.log(`📊 Overall Coverage: ${report.summary.lines.pct.toFixed(1)}%`);
      console.log(`🔧 Functions: ${report.summary.functions.pct.toFixed(1)}%`);
      console.log(`🌿 Branches: ${report.summary.branches.pct.toFixed(1)}%`);
      console.log(`📝 Statements: ${report.summary.statements.pct.toFixed(1)}%`);

      if (report.lowCoverageFiles.length > 0) {
        console.log(`\n⚠️  ${report.lowCoverageFiles.length} files need attention`);
      }

      console.log('\n📄 Detailed reports available in coverage-reports/');
    } catch (_error) {
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.main) {
  const analyzer = new CoverageAnalyzer();
  await analyzer.generateCoverageReport();
}

export { CoverageAnalyzer };
