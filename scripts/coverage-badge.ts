#!/usr/bin/env bun

/**
 * Coverage badge generator
 * Generates SVG badges for coverage metrics
 * Requirements: 4.2, 4.3
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface BadgeConfig {
  metric: 'lines' | 'functions' | 'statements' | 'branches';
  label: string;
  color: string;
  value: string;
}

interface CoverageSummary {
  [key: string]: { pct: number; total: number; covered: number };
}

interface CoverageData {
  summary: CoverageSummary;
}

class CoverageBadgeGenerator {
  private readonly badgesDir = 'coverage-reports/badges';

  async generateBadges(): Promise<void> {
    console.log('🏷️  Generating coverage badges...');

    // Load coverage data
    const coverageData = await this.loadCoverageData();
    if (!coverageData) {
      return;
    }

    // Type guard to ensure we have the right structure
    if (typeof coverageData !== 'object' || coverageData === null || !('summary' in coverageData)) {
      console.error('Invalid coverage data format');
      return;
    }

    const data = coverageData as CoverageData;

    await mkdir(this.badgesDir, { recursive: true });

    // Generate badges for each metric
    const metrics = ['lines', 'functions', 'statements', 'branches'] as const;

    for (const metric of metrics) {
      const coverage = data.summary[metric].pct;
      const badge = this.createBadge({
        metric,
        label: this.getMetricLabel(metric),
        color: this.getCoverageColor(coverage),
        value: `${coverage.toFixed(1)}%`,
      });

      const badgeFile = join(this.badgesDir, `${metric}-coverage.svg`);
      await writeFile(badgeFile, badge);
      console.log(`✅ Generated ${metric} coverage badge: ${badgeFile}`);
    }

    // Generate overall coverage badge
    const overallCoverage = this.calculateOverallCoverage(data.summary);
    const overallBadge = this.createBadge({
      metric: 'lines', // Not used for overall
      label: 'coverage',
      color: this.getCoverageColor(overallCoverage),
      value: `${overallCoverage.toFixed(1)}%`,
    });

    const overallBadgeFile = join(this.badgesDir, 'coverage.svg');
    await writeFile(overallBadgeFile, overallBadge);
    console.log(`✅ Generated overall coverage badge: ${overallBadgeFile}`);

    // Generate README snippet
    await this.generateReadmeSnippet();
  }

  private async loadCoverageData(): Promise<unknown> {
    const reportFile = 'coverage-reports/coverage-analysis.json';

    if (!existsSync(reportFile)) {
      return null;
    }

    try {
      const data = await readFile(reportFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private getMetricLabel(metric: string): string {
    const labels = {
      lines: 'lines',
      functions: 'functions',
      statements: 'statements',
      branches: 'branches',
    };
    return labels[metric as keyof typeof labels] || metric;
  }

  private getCoverageColor(coverage: number): string {
    if (coverage >= 90) return '#4c1'; // Bright green
    if (coverage >= 80) return '#97ca00'; // Green
    if (coverage >= 70) return '#a4a61d'; // Yellow-green
    if (coverage >= 60) return '#dfb317'; // Yellow
    if (coverage >= 50) return '#fe7d37'; // Orange
    return '#e05d44'; // Red
  }

  private calculateOverallCoverage(summary: { [key: string]: { pct: number } }): number {
    // Weighted average of all metrics
    const weights = {
      lines: 0.3,
      functions: 0.25,
      statements: 0.25,
      branches: 0.2,
    };

    return (
      summary.lines.pct * weights.lines +
      summary.functions.pct * weights.functions +
      summary.statements.pct * weights.statements +
      summary.branches.pct * weights.branches
    );
  }

  private createBadge(config: BadgeConfig): string {
    const { label, value, color } = config;

    // Calculate text widths (approximate)
    const labelWidth = label.length * 6 + 10;
    const valueWidth = value.length * 6 + 10;
    const totalWidth = labelWidth + valueWidth;

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${(labelWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text x="${(labelWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text aria-hidden="true" x="${(labelWidth + valueWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}">${value}</text>
    <text x="${(labelWidth + valueWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(valueWidth - 10) * 10}">${value}</text>
  </g>
</svg>`;
  }

  private async generateReadmeSnippet(): Promise<void> {
    const snippetFile = join(this.badgesDir, 'README-snippet.md');

    const snippet = `## Test Coverage

![Coverage](./coverage-reports/badges/coverage.svg)
![Lines](./coverage-reports/badges/lines-coverage.svg)
![Functions](./coverage-reports/badges/functions-coverage.svg)
![Statements](./coverage-reports/badges/statements-coverage.svg)
![Branches](./coverage-reports/badges/branches-coverage.svg)

### Coverage Reports

- [Detailed Coverage Report](./coverage-reports/coverage-analysis.md)
- [HTML Coverage Report](./coverage/index.html)

### Usage

\`\`\`bash
# Run tests with coverage
bun run test:coverage

# Generate coverage analysis
bun run scripts/coverage-analysis.ts

# Monitor coverage changes
bun run scripts/coverage-monitor.ts

# Generate coverage badges
bun run scripts/coverage-badge.ts
\`\`\`
`;

    await writeFile(snippetFile, snippet);
    console.log(`📝 Generated README snippet: ${snippetFile}`);
  }
}

// CLI interface
if (import.meta.main) {
  const generator = new CoverageBadgeGenerator();
  await generator.generateBadges();
}

export { CoverageBadgeGenerator };
