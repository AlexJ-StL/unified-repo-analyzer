#!/usr/bin/env bun

/**
 * Build Monitor - Continuous monitoring and prevention system
 * Provides automated monitoring, alerting, and prevention for build issues
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, unwatchFile, watchFile, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

/**
 * Monitor event types
 */
type MonitorEvent =
  | 'dependency_change'
  | 'config_change'
  | 'build_failure'
  | 'health_degradation'
  | 'performance_issue'
  | 'security_concern';

/**
 * Monitor alert
 */
interface MonitorAlert {
  id: string;
  timestamp: Date;
  event: MonitorEvent;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  details?: string;
  suggestions: string[];
  autoFixAvailable: boolean;
}

/**
 * Monitor configuration
 */
interface MonitorConfig {
  enabled: boolean;
  checkInterval: number; // milliseconds
  healthThreshold: number; // 0-100
  performanceThreshold: number; // milliseconds
  watchFiles: string[];
  notifications: {
    console: boolean;
    file: boolean;
    webhook?: string;
  };
  autoFix: {
    enabled: boolean;
    safeOnly: boolean;
    maxAttempts: number;
  };
}

/**
 * Monitor state
 */
interface MonitorState {
  isRunning: boolean;
  startTime: Date;
  lastHealthCheck: Date;
  lastHealthScore: number;
  alertCount: number;
  autoFixCount: number;
  watchers: Map<string, any>;
}

/**
 * Build Monitor main class
 */
class BuildMonitor {
  private projectRoot: string;
  private config: MonitorConfig;
  private state: MonitorState;
  private alerts: MonitorAlert[] = [];
  private healthHistory: Array<{ timestamp: Date; score: number }> = [];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = resolve(projectRoot);
    this.config = this.loadConfig();
    this.state = {
      isRunning: false,
      startTime: new Date(),
      lastHealthCheck: new Date(0),
      lastHealthScore: 100,
      alertCount: 0,
      autoFixCount: 0,
      watchers: new Map(),
    };
  }

  /**
   * Start monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.state.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    console.log('🔍 Starting build monitor...');
    this.state.isRunning = true;
    this.state.startTime = new Date();

    // Initial health check
    await this.performHealthCheck();

    // Set up file watchers
    this.setupFileWatchers();

    // Set up periodic health checks
    this.setupPeriodicChecks();

    // Set up graceful shutdown
    this.setupShutdownHandlers();

    console.log('✅ Build monitor started successfully');
    console.log(`   Health threshold: ${this.config.healthThreshold}%`);
    console.log(`   Check interval: ${this.config.checkInterval / 1000}s`);
    console.log(`   Auto-fix: ${this.config.autoFix.enabled ? 'enabled' : 'disabled'}`);

    // Keep the process running
    this.keepAlive();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.state.isRunning) {
      console.log('⚠️  Monitor is not running');
      return;
    }

    console.log('🛑 Stopping build monitor...');
    this.state.isRunning = false;

    // Clean up file watchers
    for (const [file, watcher] of this.state.watchers) {
      unwatchFile(file);
    }
    this.state.watchers.clear();

    console.log('✅ Build monitor stopped');
  }

  /**
   * Get monitor status
   */
  getStatus(): any {
    const uptime = Date.now() - this.state.startTime.getTime();
    const uptimeHours = Math.round((uptime / (1000 * 60 * 60)) * 100) / 100;

    return {
      isRunning: this.state.isRunning,
      uptime: `${uptimeHours} hours`,
      lastHealthCheck: this.state.lastHealthCheck,
      lastHealthScore: this.state.lastHealthScore,
      alertCount: this.state.alertCount,
      autoFixCount: this.state.autoFixCount,
      watchedFiles: Array.from(this.state.watchers.keys()),
      recentAlerts: this.alerts.slice(-5),
    };
  }

  /**
   * Load monitor configuration
   */
  private loadConfig(): MonitorConfig {
    const configPath = join(this.projectRoot, '.kiro', 'build-monitor.json');

    const defaultConfig: MonitorConfig = {
      enabled: true,
      checkInterval: 300000, // 5 minutes
      healthThreshold: 80,
      performanceThreshold: 120000, // 2 minutes
      watchFiles: [
        'package.json',
        'packages/*/package.json',
        'tsconfig.json',
        'packages/*/tsconfig.json',
        'bun.lockb',
        'package-lock.json',
      ],
      notifications: {
        console: true,
        file: true,
      },
      autoFix: {
        enabled: true,
        safeOnly: true,
        maxAttempts: 3,
      },
    };

    if (existsSync(configPath)) {
      try {
        const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
        return { ...defaultConfig, ...configData };
      } catch (error) {
        console.log('⚠️  Failed to load monitor config, using defaults');
        return defaultConfig;
      }
    }

    // Save default config
    try {
      const configDir = join(this.projectRoot, '.kiro');
      if (!existsSync(configDir)) {
        require('node:fs').mkdirSync(configDir, { recursive: true });
      }
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    } catch (error) {
      console.log('⚠️  Failed to save default monitor config');
    }

    return defaultConfig;
  }

  /**
   * Set up file watchers
   */
  private setupFileWatchers(): void {
    console.log('👀 Setting up file watchers...');

    for (const pattern of this.config.watchFiles) {
      if (pattern.includes('*')) {
        // Handle glob patterns
        if (pattern === 'packages/*/package.json') {
          const packages = ['shared', 'backend', 'frontend', 'cli'];
          for (const pkg of packages) {
            const file = join(this.projectRoot, 'packages', pkg, 'package.json');
            this.watchFile(file, 'dependency_change');
          }
        } else if (pattern === 'packages/*/tsconfig.json') {
          const packages = ['shared', 'backend', 'frontend', 'cli'];
          for (const pkg of packages) {
            const file = join(this.projectRoot, 'packages', pkg, 'tsconfig.json');
            this.watchFile(file, 'config_change');
          }
        }
      } else {
        const file = join(this.projectRoot, pattern);
        const eventType = pattern.includes('package.json') ? 'dependency_change' : 'config_change';
        this.watchFile(file, eventType);
      }
    }

    console.log(`   Watching ${this.state.watchers.size} files`);
  }

  /**
   * Watch a specific file
   */
  private watchFile(filePath: string, eventType: MonitorEvent): void {
    if (!existsSync(filePath)) {
      return;
    }

    const relativePath = filePath.replace(this.projectRoot, '.');

    watchFile(filePath, { interval: 5000 }, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        this.handleFileChange(relativePath, eventType);
      }
    });

    this.state.watchers.set(relativePath, true);
  }

  /**
   * Handle file change events
   */
  private async handleFileChange(filePath: string, eventType: MonitorEvent): Promise<void> {
    console.log(`📝 File changed: ${filePath}`);

    const alert: MonitorAlert = {
      id: `${eventType}_${Date.now()}`,
      timestamp: new Date(),
      event: eventType,
      severity: 'info',
      title: `File Changed: ${filePath}`,
      message: `Configuration file ${filePath} has been modified`,
      suggestions: ['Run health check to verify changes', 'Consider rebuilding affected packages'],
      autoFixAvailable: false,
    };

    // Specific handling based on file type
    if (filePath.includes('package.json')) {
      alert.severity = 'warning';
      alert.suggestions = [
        "Run 'bun install' to update dependencies",
        "Run 'bun run build:health' to check for issues",
        'Verify workspace configuration is still valid',
      ];
      alert.autoFixAvailable = true;
    } else if (filePath.includes('tsconfig.json')) {
      alert.severity = 'warning';
      alert.suggestions = [
        'Run TypeScript compilation to verify configuration',
        'Check for syntax errors in TypeScript config',
        'Rebuild affected packages',
      ];
    }

    this.addAlert(alert);

    // Trigger health check after file changes
    setTimeout(() => {
      this.performHealthCheck();
    }, 10000); // Wait 10 seconds for changes to settle

    // Auto-fix if enabled and available
    if (this.config.autoFix.enabled && alert.autoFixAvailable) {
      await this.attemptAutoFix(alert);
    }
  }

  /**
   * Set up periodic health checks
   */
  private setupPeriodicChecks(): void {
    const checkInterval = setInterval(async () => {
      if (!this.state.isRunning) {
        clearInterval(checkInterval);
        return;
      }

      await this.performHealthCheck();
    }, this.config.checkInterval);
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    console.log('🏥 Performing health check...');
    this.state.lastHealthCheck = new Date();

    try {
      // Run build health monitor
      const result = await this.runCommand('bun', ['run', 'scripts/build-health-monitor.ts'], {
        timeout: 120000,
      });

      let healthScore = this.state.lastHealthScore;

      if (result.success) {
        // Try to parse health score from output or report file
        const reportPath = join(this.projectRoot, 'build-health-report.json');
        if (existsSync(reportPath)) {
          try {
            const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
            healthScore = report.overallScore || 100;
          } catch {
            // Ignore parse errors
          }
        }
      } else {
        healthScore = 0; // Health check failed completely
      }

      // Update health history
      this.healthHistory.push({
        timestamp: new Date(),
        score: healthScore,
      });

      // Keep only last 24 hours of history
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.healthHistory = this.healthHistory.filter((h) => h.timestamp.getTime() > oneDayAgo);

      // Check for health degradation
      const previousScore = this.state.lastHealthScore;
      this.state.lastHealthScore = healthScore;

      if (healthScore < this.config.healthThreshold) {
        const alert: MonitorAlert = {
          id: `health_degradation_${Date.now()}`,
          timestamp: new Date(),
          event: 'health_degradation',
          severity: healthScore < 50 ? 'critical' : 'warning',
          title: 'Build Health Degraded',
          message: `Health score dropped to ${healthScore}% (threshold: ${this.config.healthThreshold}%)`,
          details: result.stderr || 'Check build-health-report.json for details',
          suggestions: [
            "Run 'bun run build:doctor' for detailed diagnostics",
            "Run 'bun run recovery:full' to attempt automatic recovery",
            'Check recent file changes for potential causes',
          ],
          autoFixAvailable: true,
        };

        this.addAlert(alert);

        // Auto-fix if enabled
        if (this.config.autoFix.enabled) {
          await this.attemptAutoFix(alert);
        }
      } else if (healthScore < previousScore - 10) {
        // Significant drop but still above threshold
        const alert: MonitorAlert = {
          id: `health_decline_${Date.now()}`,
          timestamp: new Date(),
          event: 'health_degradation',
          severity: 'info',
          title: 'Build Health Declined',
          message: `Health score dropped from ${previousScore}% to ${healthScore}%`,
          suggestions: ['Monitor for further degradation', 'Review recent changes'],
          autoFixAvailable: false,
        };

        this.addAlert(alert);
      }

      console.log(`   Health score: ${healthScore}% (previous: ${previousScore}%)`);
    } catch (error) {
      const alert: MonitorAlert = {
        id: `health_check_failed_${Date.now()}`,
        timestamp: new Date(),
        event: 'build_failure',
        severity: 'critical',
        title: 'Health Check Failed',
        message: 'Unable to perform health check',
        details: error instanceof Error ? error.message : String(error),
        suggestions: [
          'Check system resources and permissions',
          'Verify build tools are installed and accessible',
          'Run manual diagnostics',
        ],
        autoFixAvailable: false,
      };

      this.addAlert(alert);
    }
  }

  /**
   * Attempt automatic fix
   */
  private async attemptAutoFix(alert: MonitorAlert): Promise<void> {
    if (this.state.autoFixCount >= this.config.autoFix.maxAttempts) {
      console.log('⚠️  Maximum auto-fix attempts reached, skipping');
      return;
    }

    console.log(`🔧 Attempting auto-fix for: ${alert.title}`);
    this.state.autoFixCount++;

    try {
      let fixCommand: string[] = [];

      switch (alert.event) {
        case 'dependency_change':
          fixCommand = ['run', 'recovery:clean-deps'];
          break;
        case 'health_degradation':
          if (this.state.lastHealthScore < 50) {
            fixCommand = ['run', 'recovery:full'];
          } else {
            fixCommand = ['run', 'build:doctor:fix'];
          }
          break;
        case 'config_change':
          fixCommand = ['run', 'recovery:fix-scripts'];
          break;
        default:
          console.log('   No auto-fix available for this event type');
          return;
      }

      const result = await this.runCommand('bun', fixCommand, {
        timeout: 300000,
      });

      if (result.success) {
        console.log('✅ Auto-fix completed successfully');

        const fixAlert: MonitorAlert = {
          id: `auto_fix_success_${Date.now()}`,
          timestamp: new Date(),
          event: alert.event,
          severity: 'info',
          title: 'Auto-fix Successful',
          message: `Automatically resolved: ${alert.title}`,
          suggestions: ['Monitor system to ensure fix is stable'],
          autoFixAvailable: false,
        };

        this.addAlert(fixAlert);

        // Trigger health check to verify fix
        setTimeout(() => {
          this.performHealthCheck();
        }, 30000);
      } else {
        console.log('❌ Auto-fix failed');

        const fixAlert: MonitorAlert = {
          id: `auto_fix_failed_${Date.now()}`,
          timestamp: new Date(),
          event: alert.event,
          severity: 'warning',
          title: 'Auto-fix Failed',
          message: `Failed to automatically resolve: ${alert.title}`,
          details: result.error,
          suggestions: [
            'Manual intervention required',
            'Check error details and run manual recovery',
          ],
          autoFixAvailable: false,
        };

        this.addAlert(fixAlert);
      }
    } catch (error) {
      console.log('❌ Auto-fix error:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Add alert and handle notifications
   */
  private addAlert(alert: MonitorAlert): void {
    this.alerts.push(alert);
    this.state.alertCount++;

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Handle notifications
    if (this.config.notifications.console) {
      this.logAlert(alert);
    }

    if (this.config.notifications.file) {
      this.saveAlert(alert);
    }

    if (this.config.notifications.webhook) {
      this.sendWebhookAlert(alert);
    }
  }

  /**
   * Log alert to console
   */
  private logAlert(alert: MonitorAlert): void {
    const severityIcons = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };
    const icon = severityIcons[alert.severity];

    console.log(`\n${icon} ALERT: ${alert.title}`);
    console.log(`   ${alert.message}`);
    if (alert.details) {
      console.log(`   Details: ${alert.details}`);
    }
    if (alert.suggestions.length > 0) {
      console.log('   Suggestions:');
      alert.suggestions.forEach((suggestion) => {
        console.log(`   • ${suggestion}`);
      });
    }
    console.log(`   Time: ${alert.timestamp.toISOString()}`);
    console.log();
  }

  /**
   * Save alert to file
   */
  private saveAlert(alert: MonitorAlert): void {
    try {
      const alertsPath = join(this.projectRoot, 'build-monitor-alerts.json');
      let existingAlerts: MonitorAlert[] = [];

      if (existsSync(alertsPath)) {
        try {
          existingAlerts = JSON.parse(readFileSync(alertsPath, 'utf-8'));
        } catch {
          // Ignore parse errors
        }
      }

      existingAlerts.push(alert);

      // Keep only last 1000 alerts
      if (existingAlerts.length > 1000) {
        existingAlerts = existingAlerts.slice(-1000);
      }

      writeFileSync(alertsPath, JSON.stringify(existingAlerts, null, 2));
    } catch (error) {
      console.log('⚠️  Failed to save alert to file');
    }
  }

  /**
   * Send webhook alert (placeholder)
   */
  private async sendWebhookAlert(alert: MonitorAlert): Promise<void> {
    // Placeholder for webhook integration
    // Could integrate with Slack, Discord, Teams, etc.
    console.log(`📡 Webhook alert: ${alert.title} (webhook integration not implemented)`);
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = () => {
      console.log('\n🛑 Received shutdown signal');
      this.stopMonitoring();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * Keep the process alive
   */
  private keepAlive(): void {
    const keepAliveInterval = setInterval(() => {
      if (!this.state.isRunning) {
        clearInterval(keepAliveInterval);
        return;
      }
      // Just keep the process running
    }, 60000); // Check every minute
  }

  /**
   * Run command utility
   */
  private async runCommand(
    command: string,
    args: string[],
    options: { timeout?: number; cwd?: string } = {}
  ): Promise<{
    success: boolean;
    stdout?: string;
    stderr?: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: options.cwd || this.projectRoot,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout | null = null;

      if (options.timeout) {
        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          resolve({
            success: false,
            error: `Command timed out after ${options.timeout}ms`,
          });
        }, options.timeout);
      }

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);

        resolve({
          success: code === 0,
          stdout: stdout || undefined,
          stderr: stderr || undefined,
          error: code !== 0 ? stderr || `Command failed with exit code ${code}` : undefined,
        });
      });

      child.on('error', (error) => {
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
  const command = args[0];
  const projectRoot = args.find((arg) => !arg.startsWith('--')) || process.cwd();

  const monitor = new BuildMonitor(projectRoot);

  switch (command) {
    case 'start':
      await monitor.startMonitoring();
      break;
    case 'stop':
      monitor.stopMonitoring();
      break;
    case 'status': {
      const status = monitor.getStatus();
      console.log('Build Monitor Status:');
      console.log(JSON.stringify(status, null, 2));
      break;
    }
    default:
      console.log('Build Monitor - Continuous build health monitoring');
      console.log('\nUsage: bun run scripts/build-monitor.ts <command>');
      console.log('\nCommands:');
      console.log('  start   - Start continuous monitoring');
      console.log('  stop    - Stop monitoring');
      console.log('  status  - Show monitor status');
      console.log('\nExamples:');
      console.log('  bun run scripts/build-monitor.ts start');
      console.log('  bun run scripts/build-monitor.ts status');
      process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default BuildMonitor;
