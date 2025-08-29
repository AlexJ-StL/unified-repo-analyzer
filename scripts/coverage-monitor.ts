#!/usr/bin/env bun

/**
 * Continuous coverage monitoring and alerting
 * Monitors coverage changes and provides alerts for regressions
 * Requirements: 4.2, 4.3, 4.4
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, watch, writeFile } from 'node:fs/promises';
import { CoverageAnalyzer } from './coverage-analysis.js';

interface CoverageThresholds {
  lines: number;
  functions: number;
  statements: number;
  branches: number;
}

interface CoverageAlert {
  type: 'regression' | 'improvement' | 'threshold_breach';
  metric: string;
  current: number;
  previous?: number;
  threshold?: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class CoverageMonitor {
  private readonly configFile = 'coverage-monitor.config.json';
  private readonly alertsFile = 'coverage-reports/alerts.json';
  private readonly thresholds: CoverageThresholds = {
    lines: 70,
    functions: 70,
    statements: 70,
    branches: 70,
  };

  private analyzer = new CoverageAnalyzer();

  async startMonitoring(): Promise<void> {
    console.log('🔍 Starting coverage monitoring...');

    // Load configuration
    await this.loadConfig();

    // Run initial analysis
    await this.runAnalysisWithAlerts();

    // Set up file watching for test files
    await this.setupFileWatching();
  }

  private async loadConfig(): Promise<void> {
    if (existsSync(this.configFile)) {
      try {
        const config = JSON.parse(await readFile(this.configFile, 'utf-8'));
        Object.assign(this.thresholds, config.thresholds || {});
        console.log('📋 Loaded coverage thresholds:', this.thresholds);
      } catch (_error) {}
    } else {
      await this.saveConfig();
    }
  }

  private async saveConfig(): Promise<void> {
    const config = {
      thresholds: this.thresholds,
      monitoring: {
        enabled: true,
        alertOnRegression: true,
        alertOnThresholdBreach: true,
        minimumRegressionPercent: 1.0,
      },
    };

    await writeFile(this.configFile, JSON.stringify(config, null, 2));
    console.log('💾 Saved default configuration to', this.configFile);
  }

  private async setupFileWatching(): Promise<void> {
    const testDirectories = [
      'packages/backend/src/__tests__',
      'packages/frontend/src/__tests__',
      'packages/cli/src/__tests__',
      'packages/shared/__tests__',
      'tests',
    ];

    console.log('👀 Watching test directories for changes...');

    for (const dir of testDirectories) {
      if (existsSync(dir)) {
        try {
          const watcher = watch(dir, { recursive: true });

          for await (const event of watcher) {
            if (event.filename?.endsWith('.test.ts') || event.filename?.endsWith('.spec.ts')) {
              console.log(`📝 Test file changed: ${event.filename}`);

              // Debounce: wait a bit before running analysis
              await new Promise((resolve) => setTimeout(resolve, 2000));
              await this.runAnalysisWithAlerts();
            }
          }
        } catch (_error) {}
      }
    }
  }

  private async runAnalysisWithAlerts(): Promise<void> {
    try {
      console.log('🔄 Running coverage analysis...');

      const report = await this.analyzer.runCoverageAnalysis();
      const alerts = await this.checkForAlerts(report.summary);

      if (alerts.length > 0) {
        await this.handleAlerts(alerts);
      } else {
        console.log('✅ No coverage alerts');
      }
    } catch (_error) {}
  }

  private async checkForAlerts(currentCoverage: any): Promise<CoverageAlert[]> {
    const alerts: CoverageAlert[] = [];

    // Load previous coverage data
    const previousCoverage = await this.loadPreviousCoverage();

    // Check for threshold breaches
    const metrics = ['lines', 'functions', 'statements', 'branches'] as const;

    for (const metric of metrics) {
      const current = currentCoverage[metric].pct;
      const threshold = this.thresholds[metric];

      // Threshold breach alert
      if (current < threshold) {
        alerts.push({
          type: 'threshold_breach',
          metric,
          current,
          threshold,
          message: `${metric} coverage (${current.toFixed(1)}%) is below threshold (${threshold}%)`,
          severity: current < threshold - 10 ? 'critical' : 'high',
        });
      }

      // Regression alert
      if (previousCoverage?.[metric]) {
        const previous = previousCoverage[metric].pct;
        const regression = previous - current;

        if (regression > 1.0) {
          // More than 1% regression
          alerts.push({
            type: 'regression',
            metric,
            current,
            previous,
            message: `${metric} coverage decreased by ${regression.toFixed(1)}% (${previous.toFixed(1)}% → ${current.toFixed(1)}%)`,
            severity: regression > 5 ? 'critical' : regression > 3 ? 'high' : 'medium',
          });
        } else if (regression < -1.0) {
          // More than 1% improvement
          alerts.push({
            type: 'improvement',
            metric,
            current,
            previous,
            message: `${metric} coverage improved by ${Math.abs(regression).toFixed(1)}% (${previous.toFixed(1)}% → ${current.toFixed(1)}%)`,
            severity: 'low',
          });
        }
      }
    }

    // Save current coverage for next comparison
    await this.saveCoverageSnapshot(currentCoverage);

    return alerts;
  }

  private async loadPreviousCoverage(): Promise<any> {
    const snapshotFile = 'coverage-reports/coverage-snapshot.json';

    if (!existsSync(snapshotFile)) {
      return null;
    }

    try {
      const data = await readFile(snapshotFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveCoverageSnapshot(coverage: any): Promise<void> {
    const snapshotFile = 'coverage-reports/coverage-snapshot.json';
    await mkdir('coverage-reports', { recursive: true });
    await writeFile(snapshotFile, JSON.stringify(coverage, null, 2));
  }

  private async handleAlerts(alerts: CoverageAlert[]): Promise<void> {
    console.log(`🚨 ${alerts.length} coverage alert(s) detected:`);

    // Group alerts by severity
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
    const highAlerts = alerts.filter((a) => a.severity === 'high');
    const mediumAlerts = alerts.filter((a) => a.severity === 'medium');
    const lowAlerts = alerts.filter((a) => a.severity === 'low');

    // Display alerts
    if (criticalAlerts.length > 0) {
      console.log('\n🔴 CRITICAL ALERTS:');
      for (const alert of criticalAlerts) {
        console.log(`   ${alert.message}`);
      }
    }

    if (highAlerts.length > 0) {
      console.log('\n🟠 HIGH PRIORITY ALERTS:');
      for (const alert of highAlerts) {
        console.log(`   ${alert.message}`);
      }
    }

    if (mediumAlerts.length > 0) {
      console.log('\n🟡 MEDIUM PRIORITY ALERTS:');
      for (const alert of mediumAlerts) {
        console.log(`   ${alert.message}`);
      }
    }

    if (lowAlerts.length > 0) {
      console.log('\n🟢 IMPROVEMENTS:');
      for (const alert of lowAlerts) {
        console.log(`   ${alert.message}`);
      }
    }

    // Save alerts to file
    await this.saveAlerts(alerts);

    // Generate recommendations
    await this.generateAlertRecommendations(alerts);
  }

  private async saveAlerts(alerts: CoverageAlert[]): Promise<void> {
    const alertsData = {
      timestamp: new Date().toISOString(),
      alerts,
    };

    await mkdir('coverage-reports', { recursive: true });
    await writeFile(this.alertsFile, JSON.stringify(alertsData, null, 2));
  }

  private async generateAlertRecommendations(alerts: CoverageAlert[]): Promise<void> {
    const recommendations: string[] = [];

    const regressionAlerts = alerts.filter((a) => a.type === 'regression');
    const thresholdAlerts = alerts.filter((a) => a.type === 'threshold_breach');

    if (regressionAlerts.length > 0) {
      recommendations.push('📉 Coverage Regression Detected:');
      recommendations.push('   • Review recent code changes');
      recommendations.push('   • Add tests for new functionality');
      recommendations.push('   • Check if tests were accidentally removed');
      recommendations.push('   • Run `bun run test:coverage` to see detailed report');
    }

    if (thresholdAlerts.length > 0) {
      recommendations.push('📊 Coverage Below Threshold:');
      recommendations.push('   • Focus on files with lowest coverage');
      recommendations.push('   • Add unit tests for uncovered functions');
      recommendations.push('   • Add integration tests for complex workflows');
      recommendations.push('   • Consider increasing test coverage requirements');
    }

    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      for (const rec of recommendations) {
        console.log(rec);
      }
    }
  }

  async runOnce(): Promise<void> {
    console.log('🔍 Running one-time coverage monitoring...');
    await this.loadConfig();
    await this.runAnalysisWithAlerts();
  }
}

// CLI interface
if (import.meta.main) {
  const monitor = new CoverageMonitor();

  const command = process.argv[2];

  if (command === 'watch') {
    await monitor.startMonitoring();
  } else {
    await monitor.runOnce();
  }
}

export { CoverageMonitor };
