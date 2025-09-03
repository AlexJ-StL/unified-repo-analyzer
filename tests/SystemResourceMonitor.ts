/**
 * System Resource Monitor
 * Provides real-time system resource monitoring and automatic concurrency adjustment
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { EventEmitter } from "node:events";

const execAsync = promisify(exec);

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    available: number;
    usagePercent: number;
  };
  processes: {
    total: number;
    bun: number;
    vitest: number;
    node: number;
  };
  disk: {
    usage: number;
    available: number;
  };
  network: {
    connections: number;
  };
}

export interface ResourceThresholds {
  cpu: {
    warning: number;
    critical: number;
  };
  memory: {
    warning: number;
    critical: number;
  };
  processes: {
    maxBun: number;
    maxVitest: number;
    maxTotal: number;
  };
  disk: {
    minFreeGB: number;
  };
}

export interface ConcurrencyRecommendation {
  recommended: number;
  reason: string;
  confidence: number;
  adjustments: string[];
}

/**
 * System Resource Monitor with automatic concurrency adjustment
 */
export class SystemResourceMonitor extends EventEmitter {
  private static instance: SystemResourceMonitor;
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private metricsHistory: SystemMetrics[] = [];
  private maxHistorySize = 60; // Keep 60 samples (5 minutes at 5-second intervals)
  private thresholds: ResourceThresholds;

  private defaultThresholds: ResourceThresholds = {
    cpu: {
      warning: 70,
      critical: 90,
    },
    memory: {
      warning: 80,
      critical: 95,
    },
    processes: {
      maxBun: 4,
      maxVitest: 2,
      maxTotal: 50,
    },
    disk: {
      minFreeGB: 1,
    },
  };

  private constructor(thresholds: Partial<ResourceThresholds> = {}) {
    super();
    this.thresholds = { ...this.defaultThresholds, ...thresholds };
  }

  public static getInstance(
    thresholds?: Partial<ResourceThresholds>
  ): SystemResourceMonitor {
    if (!SystemResourceMonitor.instance) {
      SystemResourceMonitor.instance = new SystemResourceMonitor(thresholds);
    }
    return SystemResourceMonitor.instance;
  }

  /**
   * Start monitoring system resources
   */
  public startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log(
      `📊 Starting system resource monitoring (interval: ${intervalMs}ms)`
    );

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.processMetrics(metrics);
      } catch (error) {
        console.warn("Resource monitoring error:", error);
        this.emit("error", error);
      }
    }, intervalMs);

    // Initial metrics collection
    this.collectMetrics().then((metrics) => this.processMetrics(metrics));
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log("📊 Stopped system resource monitoring");
  }

  /**
   * Get current system metrics
   */
  public async getCurrentMetrics(): Promise<SystemMetrics> {
    return this.collectMetrics();
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(): SystemMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Get concurrency recommendation based on current system state
   */
  public async getConcurrencyRecommendation(): Promise<ConcurrencyRecommendation> {
    const metrics = await this.collectMetrics();
    const history = this.metricsHistory.slice(-10); // Last 10 samples

    let recommended = 1; // Start conservative
    const adjustments: string[] = [];
    let confidence = 0.8; // Base confidence
    let reason = "Conservative default";

    // Analyze CPU usage
    if (metrics.cpu.usage < 30) {
      recommended = Math.min(recommended + 2, 4);
      adjustments.push("Low CPU usage allows higher concurrency");
      confidence += 0.1;
    } else if (metrics.cpu.usage > 70) {
      recommended = 1;
      adjustments.push("High CPU usage requires single-threaded execution");
      reason = "CPU overload prevention";
      confidence += 0.2;
    }

    // Analyze memory usage
    if (metrics.memory.usagePercent < 50) {
      recommended = Math.min(recommended + 1, 4);
      adjustments.push("Sufficient memory available");
    } else if (metrics.memory.usagePercent > 80) {
      recommended = 1;
      adjustments.push("High memory usage limits concurrency");
      reason = "Memory conservation";
      confidence += 0.2;
    }

    // Analyze process count
    if (metrics.processes.bun > 2) {
      recommended = 1;
      adjustments.push("Multiple Bun processes already running");
      reason = "Process limit enforcement";
      confidence += 0.3;
    }

    // Analyze system load
    const loadAvg = metrics.cpu.loadAverage[0] || 0;
    if (loadAvg > metrics.cpu.cores * 0.8) {
      recommended = 1;
      adjustments.push("High system load detected");
      reason = "System load management";
      confidence += 0.2;
    }

    // Analyze historical trends
    if (history.length >= 5) {
      const avgCpu =
        history.reduce((sum, m) => sum + m.cpu.usage, 0) / history.length;
      const avgMemory =
        history.reduce((sum, m) => sum + m.memory.usagePercent, 0) /
        history.length;

      if (avgCpu < 40 && avgMemory < 60) {
        recommended = Math.min(recommended + 1, 4);
        adjustments.push("Historical data shows stable low resource usage");
        confidence += 0.1;
      }
    }

    // Platform-specific adjustments
    if (process.platform === "win32") {
      // Windows tends to be more resource-intensive
      recommended = Math.min(recommended, 2);
      adjustments.push("Windows platform: reduced concurrency for stability");
    }

    // Ensure minimum and maximum bounds
    recommended = Math.max(1, Math.min(recommended, 4));
    confidence = Math.min(confidence, 1.0);

    if (adjustments.length === 0) {
      adjustments.push("No specific adjustments needed");
    }

    return {
      recommended,
      reason,
      confidence,
      adjustments,
    };
  }

  /**
   * Check if system is under stress
   */
  public async isSystemUnderStress(): Promise<{
    stressed: boolean;
    reasons: string[];
    severity: "low" | "medium" | "high" | "critical";
  }> {
    const metrics = await this.collectMetrics();
    const reasons: string[] = [];
    let severity: "low" | "medium" | "high" | "critical" = "low";

    // Check CPU stress
    if (metrics.cpu.usage > this.thresholds.cpu.critical) {
      reasons.push(`Critical CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
      severity = "critical";
    } else if (metrics.cpu.usage > this.thresholds.cpu.warning) {
      reasons.push(`High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
      severity = severity === "low" ? "medium" : severity;
    }

    // Check memory stress
    if (metrics.memory.usagePercent > this.thresholds.memory.critical) {
      reasons.push(
        `Critical memory usage: ${metrics.memory.usagePercent.toFixed(1)}%`
      );
      severity = "critical";
    } else if (metrics.memory.usagePercent > this.thresholds.memory.warning) {
      reasons.push(
        `High memory usage: ${metrics.memory.usagePercent.toFixed(1)}%`
      );
      severity = severity === "low" ? "medium" : severity;
    }

    // Check process count
    if (metrics.processes.bun > this.thresholds.processes.maxBun) {
      reasons.push(`Too many Bun processes: ${metrics.processes.bun}`);
      severity = severity === "low" ? "high" : severity;
    }

    // Check system load
    const loadAvg = metrics.cpu.loadAverage[0] || 0;
    if (loadAvg > metrics.cpu.cores * 1.5) {
      reasons.push(`High system load: ${loadAvg.toFixed(2)}`);
      severity = severity === "low" ? "high" : severity;
    }

    return {
      stressed: reasons.length > 0,
      reasons,
      severity,
    };
  }

  /**
   * Collect comprehensive system metrics
   */
  private async collectMetrics(): Promise<SystemMetrics> {
    const [cpu, memory, processes, disk] = await Promise.all([
      this.getCpuMetrics(),
      this.getMemoryMetrics(),
      this.getProcessMetrics(),
      this.getDiskMetrics(),
    ]);

    return {
      cpu,
      memory,
      processes,
      disk,
      network: { connections: 0 }, // Placeholder for network metrics
    };
  }

  /**
   * Get CPU metrics
   */
  private async getCpuMetrics(): Promise<SystemMetrics["cpu"]> {
    try {
      const cores = require("os").cpus().length;
      let usage = 0;
      let loadAverage: number[] = [0, 0, 0];

      if (process.platform === "win32") {
        // Windows CPU usage
        try {
          const { stdout } = await execAsync(
            "wmic cpu get loadpercentage /value"
          );
          const match = stdout.match(/LoadPercentage=(\d+)/);
          usage = match ? parseInt(match[1]) : 0;
        } catch {
          usage = 0;
        }
      } else {
        // Unix-like systems
        try {
          const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)'");
          const match = stdout.match(/(\d+\.\d+)%us/);
          usage = match ? parseFloat(match[1]) : 0;
        } catch {
          usage = 0;
        }

        // Load average
        try {
          loadAverage = require("os").loadavg();
        } catch {
          loadAverage = [0, 0, 0];
        }
      }

      return {
        usage,
        cores,
        loadAverage,
      };
    } catch (error) {
      return {
        usage: 0,
        cores: 1,
        loadAverage: [0, 0, 0],
      };
    }
  }

  /**
   * Get memory metrics
   */
  private async getMemoryMetrics(): Promise<SystemMetrics["memory"]> {
    try {
      if (process.platform === "win32") {
        // Windows memory info
        const { stdout } = await execAsync(
          "wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value"
        );

        const totalMatch = stdout.match(/TotalVisibleMemorySize=(\d+)/);
        const freeMatch = stdout.match(/FreePhysicalMemory=(\d+)/);

        const total = totalMatch ? parseInt(totalMatch[1]) * 1024 : 0; // Convert KB to bytes
        const free = freeMatch ? parseInt(freeMatch[1]) * 1024 : 0;
        const used = total - free;
        const usagePercent = total > 0 ? (used / total) * 100 : 0;

        return {
          total: Math.round(total / 1024 / 1024), // MB
          used: Math.round(used / 1024 / 1024), // MB
          free: Math.round(free / 1024 / 1024), // MB
          available: Math.round(free / 1024 / 1024), // MB
          usagePercent,
        };
      } else {
        // Unix-like systems
        const { stdout } = await execAsync("free -m");
        const lines = stdout.split("\n");
        const memLine = lines.find((line) => line.startsWith("Mem:"));

        if (memLine) {
          const parts = memLine.split(/\s+/);
          const total = parseInt(parts[1]) || 0;
          const used = parseInt(parts[2]) || 0;
          const free = parseInt(parts[3]) || 0;
          const available = parseInt(parts[6]) || free;
          const usagePercent = total > 0 ? (used / total) * 100 : 0;

          return {
            total,
            used,
            free,
            available,
            usagePercent,
          };
        }
      }
    } catch (error) {
      // Fallback to Node.js built-in memory info
      const totalMem = require("os").totalmem();
      const freeMem = require("os").freemem();
      const used = totalMem - freeMem;

      return {
        total: Math.round(totalMem / 1024 / 1024),
        used: Math.round(used / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        available: Math.round(freeMem / 1024 / 1024),
        usagePercent: (used / totalMem) * 100,
      };
    }

    return {
      total: 0,
      used: 0,
      free: 0,
      available: 0,
      usagePercent: 0,
    };
  }

  /**
   * Get process metrics
   */
  private async getProcessMetrics(): Promise<SystemMetrics["processes"]> {
    try {
      let total = 0;
      let bun = 0;
      let vitest = 0;
      let node = 0;

      if (process.platform === "win32") {
        // Windows process count
        const { stdout } = await execAsync("tasklist /fo csv");
        const lines = stdout.split("\n").slice(1); // Skip header

        for (const line of lines) {
          if (line.trim()) {
            total++;
            const processName = line
              .split(",")[0]
              ?.replace(/"/g, "")
              .toLowerCase();
            if (processName?.includes("bun")) bun++;
            if (
              processName?.includes("vitest") ||
              processName?.includes("node")
            ) {
              if (line.toLowerCase().includes("vitest")) vitest++;
              else node++;
            }
          }
        }
      } else {
        // Unix-like systems
        const { stdout } = await execAsync("ps aux");
        const lines = stdout.split("\n").slice(1); // Skip header

        for (const line of lines) {
          if (line.trim()) {
            total++;
            const command = line.toLowerCase();
            if (command.includes("bun")) bun++;
            if (command.includes("vitest")) vitest++;
            if (command.includes("node") && !command.includes("vitest")) node++;
          }
        }
      }

      return { total, bun, vitest, node };
    } catch (error) {
      return { total: 0, bun: 0, vitest: 0, node: 0 };
    }
  }

  /**
   * Get disk metrics
   */
  private async getDiskMetrics(): Promise<SystemMetrics["disk"]> {
    try {
      if (process.platform === "win32") {
        // Windows disk space
        const { stdout } = await execAsync("dir /-c");
        const match = stdout.match(/(\d+) bytes free/);
        const available = match ? parseInt(match[1]) / 1024 / 1024 / 1024 : 0; // GB

        return {
          usage: 0, // Not easily available on Windows
          available,
        };
      } else {
        // Unix-like systems
        const { stdout } = await execAsync("df -h .");
        const lines = stdout.split("\n");
        const dataLine = lines[1];

        if (dataLine) {
          const parts = dataLine.split(/\s+/);
          const usageStr = parts[4] || "0%";
          const availableStr = parts[3] || "0G";

          const usage = parseInt(usageStr.replace("%", "")) || 0;
          const available =
            parseFloat(availableStr.replace(/[^\d.]/g, "")) || 0;

          return { usage, available };
        }
      }
    } catch (error) {
      // Ignore disk errors
    }

    return { usage: 0, available: 0 };
  }

  /**
   * Process collected metrics
   */
  private processMetrics(metrics: SystemMetrics): void {
    // Add to history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Emit events based on thresholds
    if (metrics.cpu.usage > this.thresholds.cpu.critical) {
      this.emit("critical", {
        type: "cpu",
        value: metrics.cpu.usage,
        threshold: this.thresholds.cpu.critical,
      });
    } else if (metrics.cpu.usage > this.thresholds.cpu.warning) {
      this.emit("warning", {
        type: "cpu",
        value: metrics.cpu.usage,
        threshold: this.thresholds.cpu.warning,
      });
    }

    if (metrics.memory.usagePercent > this.thresholds.memory.critical) {
      this.emit("critical", {
        type: "memory",
        value: metrics.memory.usagePercent,
        threshold: this.thresholds.memory.critical,
      });
    } else if (metrics.memory.usagePercent > this.thresholds.memory.warning) {
      this.emit("warning", {
        type: "memory",
        value: metrics.memory.usagePercent,
        threshold: this.thresholds.memory.warning,
      });
    }

    if (metrics.processes.bun > this.thresholds.processes.maxBun) {
      this.emit("warning", {
        type: "processes",
        value: metrics.processes.bun,
        threshold: this.thresholds.processes.maxBun,
      });
    }

    // Emit metrics update
    this.emit("metrics", metrics);
  }

  /**
   * Generate resource report
   */
  public generateResourceReport(): string {
    if (this.metricsHistory.length === 0) {
      return "No resource metrics available.";
    }

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const history = this.metricsHistory.slice(-10); // Last 10 samples

    let report = "\n=== System Resource Report ===\n";

    // Current metrics
    report += `CPU Usage: ${latest.cpu.usage.toFixed(1)}% (${latest.cpu.cores} cores)\n`;
    report += `Memory Usage: ${latest.memory.usagePercent.toFixed(1)}% (${latest.memory.used}MB / ${latest.memory.total}MB)\n`;
    report += `Processes: ${latest.processes.total} total (${latest.processes.bun} Bun, ${latest.processes.vitest} Vitest, ${latest.processes.node} Node)\n`;
    report += `Load Average: ${latest.cpu.loadAverage.map((l) => l.toFixed(2)).join(", ")}\n`;

    if (latest.disk.available > 0) {
      report += `Disk Available: ${latest.disk.available.toFixed(1)}GB\n`;
    }

    // Historical averages
    if (history.length > 1) {
      const avgCpu =
        history.reduce((sum, m) => sum + m.cpu.usage, 0) / history.length;
      const avgMemory =
        history.reduce((sum, m) => sum + m.memory.usagePercent, 0) /
        history.length;

      report += "\n--- Recent Averages ---\n";
      report += `Average CPU: ${avgCpu.toFixed(1)}%\n`;
      report += `Average Memory: ${avgMemory.toFixed(1)}%\n`;
    }

    return report;
  }
}

// Export singleton instance
export const systemResourceMonitor = SystemResourceMonitor.getInstance();

// Export convenience functions
export const startResourceMonitoring = (intervalMs?: number) =>
  systemResourceMonitor.startMonitoring(intervalMs);

export const stopResourceMonitoring = () =>
  systemResourceMonitor.stopMonitoring();

export const getCurrentMetrics = () =>
  systemResourceMonitor.getCurrentMetrics();

export const getConcurrencyRecommendation = () =>
  systemResourceMonitor.getConcurrencyRecommendation();

export const isSystemUnderStress = () =>
  systemResourceMonitor.isSystemUnderStress();
