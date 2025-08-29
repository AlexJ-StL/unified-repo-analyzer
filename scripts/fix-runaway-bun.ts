#!/usr/bin/env bun
/**
 * Runaway Bun Process Prevention and Cleanup System
 * Addresses the recurring issue of multiple Bun processes consuming CPU
 * Requirements: System stability, resource management
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

interface ProcessInfo {
  pid: number;
  command: string;
  cpuUsage: number;
  memoryUsage: number;
  startTime: string;
}

interface BunProcessConfig {
  maxConcurrentProcesses: number;
  maxCpuUsagePercent: number;
  maxMemoryUsageMB: number;
  processTimeoutMs: number;
  monitoringIntervalMs: number;
}

class BunProcessManager {
  private readonly configFile = '.kiro/bun-process-config.json';
  private readonly logFile = '.kiro/logs/bun-process-monitor.log';

  private config: BunProcessConfig = {
    maxConcurrentProcesses: 3,
    maxCpuUsagePercent: 80,
    maxMemoryUsageMB: 1024,
    processTimeoutMs: 300000, // 5 minutes
    monitoringIntervalMs: 10000, // 10 seconds
  };

  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Bun Process Manager...');

    // Create necessary directories
    await mkdir('.kiro/logs', { recursive: true });

    // Load or create configuration
    await this.loadConfig();

    // Clean up any existing runaway processes
    await this.cleanupRunawayProcesses();

    console.log('✅ Bun Process Manager initialized');
  }

  private async loadConfig(): Promise<void> {
    if (existsSync(this.configFile)) {
      try {
        const configData = await readFile(this.configFile, 'utf-8');
        this.config = { ...this.config, ...JSON.parse(configData) };
        console.log('📋 Loaded Bun process configuration');
      } catch (_error) {}
    } else {
      await this.saveConfig();
    }
  }

  private async saveConfig(): Promise<void> {
    await mkdir('.kiro', { recursive: true });
    await writeFile(this.configFile, JSON.stringify(this.config, null, 2));
    console.log('💾 Saved Bun process configuration');
  }

  async getBunProcesses(): Promise<ProcessInfo[]> {
    try {
      // Get all Bun processes on Windows
      const output = execSync('tasklist /FI "IMAGENAME eq bun.exe" /FO CSV', {
        encoding: 'utf-8',
        timeout: 10000,
      });

      const lines = output.split('\n').slice(1); // Skip header
      const processes: ProcessInfo[] = [];

      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(',').map((p) => p.replace(/"/g, ''));
          if (parts.length >= 5) {
            processes.push({
              pid: Number.parseInt(parts[1], 10),
              command: parts[0],
              cpuUsage: 0, // Windows tasklist doesn't provide CPU usage directly
              memoryUsage: Number.parseInt(parts[4].replace(/[^\d]/g, ''), 10) || 0,
              startTime: new Date().toISOString(), // Approximate
            });
          }
        }
      }

      return processes;
    } catch (_error) {
      return [];
    }
  }

  async cleanupRunawayProcesses(): Promise<void> {
    console.log('🧹 Cleaning up runaway Bun processes...');

    const processes = await this.getBunProcesses();

    if (processes.length === 0) {
      console.log('✅ No Bun processes found');
      return;
    }

    console.log(`📊 Found ${processes.length} Bun processes`);

    // Kill processes if there are too many
    if (processes.length > this.config.maxConcurrentProcesses) {
      const excessProcesses = processes.slice(this.config.maxConcurrentProcesses);

      for (const process of excessProcesses) {
        await this.killProcess(process.pid, 'excess process');
      }
    }

    // Kill high memory usage processes
    for (const process of processes) {
      if (process.memoryUsage > this.config.maxMemoryUsageMB * 1024) {
        await this.killProcess(process.pid, `high memory usage: ${process.memoryUsage}KB`);
      }
    }

    await this.logCleanupAction(processes.length);
  }

  private async killProcess(pid: number, reason: string): Promise<void> {
    try {
      execSync(`taskkill /F /PID ${pid}`, { timeout: 5000 });
      console.log(`🔪 Killed Bun process ${pid} (${reason})`);
      await this.logAction(`Killed process ${pid}: ${reason}`);
    } catch (_error) {}
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('📊 Monitoring is already running');
      return;
    }

    console.log('🔍 Starting Bun process monitoring...');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.monitorProcesses();
      } catch (_error) {}
    }, this.config.monitoringIntervalMs);

    // Also monitor on process exit
    process.on('exit', () => this.stopMonitoring());
    process.on('SIGINT', () => this.stopMonitoring());
    process.on('SIGTERM', () => this.stopMonitoring());

    console.log('✅ Monitoring started');
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🛑 Stopping Bun process monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('✅ Monitoring stopped');
  }

  private async monitorProcesses(): Promise<void> {
    const processes = await this.getBunProcesses();

    if (processes.length > this.config.maxConcurrentProcesses) {
      console.log(
        `⚠️  Too many Bun processes: ${processes.length}/${this.config.maxConcurrentProcesses}`
      );
      await this.cleanupRunawayProcesses();
    }

    // Log current status
    await this.logAction(`Monitoring: ${processes.length} Bun processes running`);
  }

  private async logAction(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    try {
      await mkdir('.kiro/logs', { recursive: true });

      // Append to log file
      if (existsSync(this.logFile)) {
        const existingLog = await readFile(this.logFile, 'utf-8');
        await writeFile(this.logFile, existingLog + logEntry);
      } else {
        await writeFile(this.logFile, logEntry);
      }
    } catch (_error) {}
  }

  private async logCleanupAction(processCount: number): Promise<void> {
    await this.logAction(`Cleanup completed: ${processCount} processes found`);
  }

  async createPreventionHooks(): Promise<void> {
    console.log('🔗 Creating prevention hooks...');

    // Create a wrapper script for Bun commands
    const wrapperScript = `#!/usr/bin/env bun
/**
 * Bun Process Wrapper - Prevents runaway processes
 * Automatically generated by fix-runaway-bun.ts
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const MAX_PROCESSES = ${this.config.maxConcurrentProcesses};
const TIMEOUT_MS = ${this.config.processTimeoutMs};

async function checkExistingProcesses(): Promise<number> {
  try {
    const { execSync } = await import('node:child_process');
    const output = execSync('tasklist /FI "IMAGENAME eq bun.exe" /FO CSV', {
      encoding: 'utf-8',
      timeout: 5000,
    });
    
    const lines = output.split('\\n').slice(1);
    return lines.filter(line => line.trim()).length;
  } catch {
    return 0;
  }
}

async function main() {
  const existingProcesses = await checkExistingProcesses();
  
  if (existingProcesses >= MAX_PROCESSES) {
    console.error(\`❌ Too many Bun processes running (\${existingProcesses}/\${MAX_PROCESSES}). Please wait or run 'bun run scripts/fix-runaway-bun.ts cleanup'\`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const child = spawn('bun', args, {
    stdio: 'inherit',
    timeout: TIMEOUT_MS,
  });

  child.on('error', (error) => {
    console.error('❌ Bun process error:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Kill process if it runs too long
  setTimeout(() => {
    console.warn('⚠️  Process timeout reached, killing...');
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 5000);
  }, TIMEOUT_MS);
}

if (import.meta.main) {
  main().catch(console.error);
}`;

    await writeFile('scripts/bun-wrapper.ts', wrapperScript);
    console.log('✅ Created Bun wrapper script');

    // Create package.json script modifications
    const packageJsonPath = 'package.json';
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

        // Add cleanup and monitoring scripts
        packageJson.scripts = {
          ...packageJson.scripts,
          'bun:cleanup': 'bun run scripts/fix-runaway-bun.ts cleanup',
          'bun:monitor': 'bun run scripts/fix-runaway-bun.ts monitor',
          'bun:status': 'bun run scripts/fix-runaway-bun.ts status',
        };

        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Added Bun management scripts to package.json');
      } catch (_error) {}
    }
  }

  async getStatus(): Promise<void> {
    console.log('📊 Bun Process Status');
    console.log('====================');

    const processes = await this.getBunProcesses();

    console.log(`Active Bun processes: ${processes.length}/${this.config.maxConcurrentProcesses}`);
    console.log(`Max memory limit: ${this.config.maxMemoryUsageMB}MB`);
    console.log(`Process timeout: ${this.config.processTimeoutMs / 1000}s`);
    console.log(`Monitoring: ${this.isMonitoring ? 'Active' : 'Inactive'}`);

    if (processes.length > 0) {
      console.log('\nActive processes:');
      for (const process of processes) {
        console.log(`  PID ${process.pid}: ${process.memoryUsage}KB memory`);
      }
    }

    // Show recent log entries
    if (existsSync(this.logFile)) {
      try {
        const logContent = await readFile(this.logFile, 'utf-8');
        const recentEntries = logContent
          .split('\n')
          .slice(-5)
          .filter((line) => line.trim());

        if (recentEntries.length > 0) {
          console.log('\nRecent activity:');
          for (const entry of recentEntries) {
            console.log(`  ${entry}`);
          }
        }
      } catch (_error) {}
    }
  }
}

// CLI interface
async function main() {
  const manager = new BunProcessManager();
  await manager.initialize();

  const command = process.argv[2];

  switch (command) {
    case 'cleanup':
      await manager.cleanupRunawayProcesses();
      break;

    case 'monitor':
      await manager.startMonitoring();
      console.log('Press Ctrl+C to stop monitoring');
      // Keep the process alive
      await new Promise(() => {});
      break;

    case 'status':
      await manager.getStatus();
      break;

    case 'setup':
      await manager.createPreventionHooks();
      break;

    default:
      console.log('🔧 Bun Process Manager');
      console.log('======================');
      console.log('Available commands:');
      console.log('  cleanup  - Kill runaway Bun processes');
      console.log('  monitor  - Start continuous monitoring');
      console.log('  status   - Show current process status');
      console.log('  setup    - Create prevention hooks');
      console.log('');
      console.log('Usage: bun run scripts/fix-runaway-bun.ts [command]');

      // Default action: cleanup
      await manager.cleanupRunawayProcesses();
      break;
  }
}

if (import.meta.main) {
  main().catch(console.error);
}

export { BunProcessManager };
