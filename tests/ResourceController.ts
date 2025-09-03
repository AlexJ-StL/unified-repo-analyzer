/**
 * Resource Control System
 * Limits concurrent Bun processes and provides process monitoring
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  command: string;
}

export interface ResourceLimits {
  maxConcurrentProcesses: number;
  maxCpuPercent: number;
  maxMemoryMB: number;
  processTimeout: number;
}

export interface ResourceStats {
  totalProcesses: number;
  bunProcesses: number;
  vitestProcesses: number;
  totalCpuPercent: number;
  totalMemoryMB: number;
  systemLoad: number;
}

/**
 * Resource Controller to manage test process resources
 */
export class ResourceController {
  private static instance: ResourceController;
  private activeProcesses = new Set<number>();
  private processMonitorInterval?: NodeJS.Timeout;
  private emergencyCleanupActive = false;

  private limits: ResourceLimits = {
    maxConcurrentProcesses: 1, // Ultra-conservative
    maxCpuPercent: 80,
    maxMemoryMB: 2048,
    processTimeout: 30000, // 30 seconds
  };

  private constructor() {}

  public static getInstance(): ResourceController {
    if (!ResourceController.instance) {
      ResourceController.instance = new ResourceController();
    }
    return ResourceController.instance;
  }

  /**
   * Update resource limits
   */
  public updateLimits(newLimits: Partial<ResourceLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
  }

  /**
   * Get current resource limits
   */
  public getLimits(): ResourceLimits {
    return { ...this.limits };
  }

  /**
   * Start process monitoring
   */
  public startMonitoring(intervalMs = 5000): void {
    if (this.processMonitorInterval) {
      clearInterval(this.processMonitorInterval);
    }

    this.processMonitorInterval = setInterval(async () => {
      try {
        await this.checkResourceUsage();
      } catch (error) {
        console.warn("Resource monitoring error:", error);
      }
    }, intervalMs);
  }

  /**
   * Stop process monitoring
   */
  public stopMonitoring(): void {
    if (this.processMonitorInterval) {
      clearInterval(this.processMonitorInterval);
      this.processMonitorInterval = undefined;
    }
  }

  /**
   * Get current resource statistics
   */
  public async getResourceStats(): Promise<ResourceStats> {
    try {
      const processes = await this.getProcessList();
      const bunProcesses = processes.filter(
        (p) =>
          p.name.toLowerCase().includes("bun") ||
          p.command.toLowerCase().includes("bun")
      );
      const vitestProcesses = processes.filter(
        (p) =>
          p.name.toLowerCase().includes("vitest") ||
          p.command.toLowerCase().includes("vitest")
      );

      const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0);
      const totalMemory = processes.reduce((sum, p) => sum + p.memory, 0);

      return {
        totalProcesses: processes.length,
        bunProcesses: bunProcesses.length,
        vitestProcesses: vitestProcesses.length,
        totalCpuPercent: totalCpu,
        totalMemoryMB: totalMemory,
        systemLoad: await this.getSystemLoad(),
      };
    } catch (error) {
      console.warn("Failed to get resource stats:", error);
      return {
        totalProcesses: 0,
        bunProcesses: 0,
        vitestProcesses: 0,
        totalCpuPercent: 0,
        totalMemoryMB: 0,
        systemLoad: 0,
      };
    }
  }

  /**
   * Check if we can start a new process
   */
  public async canStartProcess(): Promise<boolean> {
    const stats = await this.getResourceStats();

    // Check concurrent process limit
    if (stats.bunProcesses >= this.limits.maxConcurrentProcesses) {
      return false;
    }

    // Check CPU usage
    if (stats.totalCpuPercent > this.limits.maxCpuPercent) {
      return false;
    }

    // Check memory usage
    if (stats.totalMemoryMB > this.limits.maxMemoryMB) {
      return false;
    }

    return true;
  }

  /**
   * Register a new process for tracking
   */
  public registerProcess(pid: number): void {
    this.activeProcesses.add(pid);

    // Set up automatic cleanup after timeout
    setTimeout(() => {
      if (this.activeProcesses.has(pid)) {
        console.warn(`Process ${pid} exceeded timeout, cleaning up`);
        this.killProcess(pid);
      }
    }, this.limits.processTimeout);
  }

  /**
   * Unregister a process
   */
  public unregisterProcess(pid: number): void {
    this.activeProcesses.delete(pid);
  }

  /**
   * Kill a specific process
   */
  public async killProcess(pid: number): Promise<boolean> {
    try {
      if (process.platform === "win32") {
        await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        process.kill(pid, "SIGKILL");
      }
      this.unregisterProcess(pid);
      return true;
    } catch (error) {
      console.warn(`Failed to kill process ${pid}:`, error);
      return false;
    }
  }

  /**
   * Emergency cleanup - kill all test-related processes
   */
  public async emergencyCleanup(): Promise<void> {
    if (this.emergencyCleanupActive) {
      return; // Prevent recursive cleanup
    }

    this.emergencyCleanupActive = true;
    console.log("🚨 Emergency cleanup initiated");

    try {
      // Set a timeout for the entire cleanup operation
      const cleanupPromise = this.performCleanup();
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("⏰ Cleanup timeout reached");
          resolve();
        }, 5000); // 5 second timeout
      });

      await Promise.race([cleanupPromise, timeoutPromise]);
      console.log("✅ Emergency cleanup completed");
    } catch (error) {
      console.error("❌ Emergency cleanup failed:", error);
    } finally {
      this.emergencyCleanupActive = false;
    }
  }

  /**
   * Perform the actual cleanup operations
   */
  private async performCleanup(): Promise<void> {
    // Kill all registered processes (with timeout)
    const killPromises = Array.from(this.activeProcesses).map((pid) =>
      Promise.race([
        this.killProcess(pid),
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 1000)
        ),
      ])
    );
    await Promise.all(killPromises);

    // Kill all Bun processes (with timeout)
    await Promise.race([
      this.killAllBunProcesses(),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);

    // Kill all Vitest processes (with timeout)
    await Promise.race([
      this.killAllVitestProcesses(),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);

    // Clear active processes
    this.activeProcesses.clear();
  }

  /**
   * Kill all Bun processes
   */
  private async killAllBunProcesses(): Promise<void> {
    try {
      if (process.platform === "win32") {
        await execAsync("taskkill /F /IM bun.exe");
      } else {
        await execAsync("pkill -f bun");
      }
    } catch (error) {
      // Ignore errors - processes might not exist
    }
  }

  /**
   * Kill all Vitest processes
   */
  private async killAllVitestProcesses(): Promise<void> {
    try {
      if (process.platform === "win32") {
        await execAsync(
          'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vitest*"'
        );
      } else {
        await execAsync("pkill -f vitest");
      }
    } catch (error) {
      // Ignore errors - processes might not exist
    }
  }

  /**
   * Check resource usage and trigger cleanup if needed
   */
  private async checkResourceUsage(): Promise<void> {
    const stats = await this.getResourceStats();

    // Check if we need emergency cleanup
    if (stats.totalCpuPercent > 95 || stats.bunProcesses > 5) {
      console.warn("🚨 High resource usage detected, triggering cleanup");
      await this.emergencyCleanup();
    }

    // Log resource stats if high usage
    if (stats.totalCpuPercent > 50) {
      console.log(
        `📊 Resource usage: CPU ${stats.totalCpuPercent}%, Bun processes: ${stats.bunProcesses}`
      );
    }
  }

  /**
   * Get list of running processes
   */
  private async getProcessList(): Promise<ProcessInfo[]> {
    try {
      if (process.platform === "win32") {
        const { stdout } = await execAsync(
          "wmic process get ProcessId,Name,PageFileUsage,WorkingSetSize,CommandLine /format:csv"
        );
        return this.parseWindowsProcessList(stdout);
      } else {
        const { stdout } = await execAsync("ps aux");
        return this.parseUnixProcessList(stdout);
      }
    } catch (error) {
      console.warn("Failed to get process list:", error);
      return [];
    }
  }

  /**
   * Parse Windows process list
   */
  private parseWindowsProcessList(output: string): ProcessInfo[] {
    const lines = output.split("\n").filter((line) => line.trim()); // Remove empty lines
    const processes: ProcessInfo[] = [];

    for (const line of lines) {
      if (line.includes("Node,") || !line.includes(",")) continue; // Skip header

      const parts = line.split(",");
      if (parts.length >= 5 && parts[4] && parts[4].trim()) {
        const pid = parseInt(parts[4].trim()) || 0;
        const workingSet = parseInt(parts[3]) || 0;
        const memory = workingSet > 0 ? workingSet / 1024 / 1024 : 0; // Convert bytes to MB

        if (pid > 0 && memory < 10000) {
          // Sanity check - ignore processes with > 10GB memory
          processes.push({
            pid,
            name: (parts[1] || "").trim(),
            cpu: 0, // Windows wmic doesn't provide CPU easily
            memory,
            command: (parts[0] || "").trim(),
          });
        }
      }
    }

    return processes;
  }

  /**
   * Parse Unix process list
   */
  private parseUnixProcessList(output: string): ProcessInfo[] {
    const lines = output.split("\n").slice(1); // Skip header
    const processes: ProcessInfo[] = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 11) {
        processes.push({
          pid: parseInt(parts[1]) || 0,
          name: parts[10] || "",
          cpu: parseFloat(parts[2]) || 0,
          memory: parseFloat(parts[3]) || 0,
          command: parts.slice(10).join(" "),
        });
      }
    }

    return processes;
  }

  /**
   * Get system load average
   */
  private async getSystemLoad(): Promise<number> {
    try {
      if (process.platform === "win32") {
        // Windows doesn't have load average, use CPU percentage
        const { stdout } = await execAsync(
          "wmic cpu get loadpercentage /value"
        );
        const match = stdout.match(/LoadPercentage=(\d+)/);
        return match ? parseInt(match[1]) : 0;
      } else {
        const { stdout } = await execAsync("uptime");
        const match = stdout.match(/load average: ([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
      }
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instance
export const resourceController = ResourceController.getInstance();

// Export convenience functions
export const startResourceMonitoring = (intervalMs?: number) =>
  resourceController.startMonitoring(intervalMs);

export const stopResourceMonitoring = () => resourceController.stopMonitoring();

export const emergencyCleanup = () => resourceController.emergencyCleanup();

export const getResourceStats = () => resourceController.getResourceStats();

export const canStartProcess = () => resourceController.canStartProcess();
