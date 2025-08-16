import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { env } from '../config/environment';
import { logger } from './logger.service';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

export interface LogRetentionPolicy {
  maxAge: number; // in days
  maxSize: string; // e.g., '100MB', '1GB'
  maxFiles: number;
  cleanupInterval: number; // in hours
}

export interface LogFileInfo {
  path: string;
  size: number;
  created: Date;
  modified: Date;
  age: number; // in days
}

export interface LogManagementConfig {
  logDirectory: string;
  retentionPolicy: LogRetentionPolicy;
  monitoringEnabled: boolean;
  alertThresholds: {
    diskUsage: number; // percentage
    fileSize: string; // e.g., '50MB'
    errorRate: number; // errors per minute
  };
}

export interface LogAlert {
  type: 'DISK_USAGE' | 'FILE_SIZE' | 'ERROR_RATE' | 'CLEANUP_FAILED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

export class LogManagementService extends EventEmitter {
  private config: LogManagementConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private monitoringTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config?: Partial<LogManagementConfig>) {
    super();

    this.config = {
      logDirectory: env.LOG_DIR || path.join(process.cwd(), 'logs'),
      retentionPolicy: {
        maxAge: 30, // 30 days
        maxSize: '1GB',
        maxFiles: 100,
        cleanupInterval: 24, // 24 hours
      },
      monitoringEnabled: true,
      alertThresholds: {
        diskUsage: 85, // 85%
        fileSize: '50MB',
        errorRate: 10, // 10 errors per minute
      },
      ...config,
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('alert', (alert: LogAlert) => {
      logger.warn(
        `Log Management Alert: ${alert.type}`,
        {
          severity: alert.severity,
          message: alert.message,
          details: alert.details,
          timestamp: alert.timestamp,
        },
        'log-management'
      );
    });

    this.on('cleanup-completed', (stats: any) => {
      logger.info('Log cleanup completed', stats, 'log-management');
    });

    this.on('cleanup-failed', (error: Error) => {
      logger.error('Log cleanup failed', error, {}, 'log-management');
      this.emitAlert('CLEANUP_FAILED', 'HIGH', 'Log cleanup operation failed', {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  /**
   * Start the log management service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Log management service is already running', {}, 'log-management');
      return;
    }

    try {
      // Ensure log directory exists
      await this.ensureLogDirectory();

      // Start cleanup timer
      this.startCleanupTimer();

      // Start monitoring if enabled
      if (this.config.monitoringEnabled) {
        this.startMonitoring();
      }

      this.isRunning = true;
      logger.info(
        'Log management service started',
        {
          logDirectory: this.config.logDirectory,
          retentionPolicy: this.config.retentionPolicy,
          monitoringEnabled: this.config.monitoringEnabled,
        },
        'log-management'
      );
    } catch (error) {
      logger.error('Failed to start log management service', error as Error, {}, 'log-management');
      throw error;
    }
  }

  /**
   * Stop the log management service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    this.isRunning = false;
    logger.info('Log management service stopped', {}, 'log-management');
  }

  /**
   * Perform log cleanup based on retention policy
   */
  async performCleanup(): Promise<{
    filesRemoved: number;
    spaceFreed: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const stats = {
      filesRemoved: 0,
      spaceFreed: 0,
      errors: [] as string[],
    };

    try {
      logger.info(
        'Starting log cleanup',
        {
          retentionPolicy: this.config.retentionPolicy,
        },
        'log-management'
      );

      const logFiles = await this.getLogFiles();
      const filesToRemove = await this.identifyFilesForRemoval(logFiles);

      for (const file of filesToRemove) {
        try {
          await unlink(file.path);
          stats.filesRemoved++;
          stats.spaceFreed += file.size;

          logger.debug(
            'Removed log file',
            {
              path: file.path,
              size: file.size,
              age: file.age,
            },
            'log-management'
          );
        } catch (error) {
          const errorMsg = `Failed to remove ${file.path}: ${(error as Error).message}`;
          stats.errors.push(errorMsg);
          logger.error(
            'Failed to remove log file',
            error as Error,
            {
              path: file.path,
            },
            'log-management'
          );
        }
      }

      const duration = Date.now() - startTime;
      const cleanupStats = {
        ...stats,
        duration: `${duration}ms`,
        totalFiles: logFiles.length,
        filesChecked: logFiles.length,
      };

      this.emit('cleanup-completed', cleanupStats);
      return stats;
    } catch (error) {
      this.emit('cleanup-failed', error);
      throw error;
    }
  }

  /**
   * Get information about all log files
   */
  async getLogFiles(): Promise<LogFileInfo[]> {
    try {
      const files = await readdir(this.config.logDirectory);
      const logFiles: LogFileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(this.config.logDirectory, file);

        try {
          const stats = await stat(filePath);

          // Only include actual log files (not directories or other files)
          if (stats.isFile() && this.isLogFile(file)) {
            const now = new Date();
            const age = Math.floor((now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));

            logFiles.push({
              path: filePath,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              age,
            });
          }
        } catch (error) {
          logger.warn(
            'Failed to get stats for log file',
            {
              file: filePath,
              error: (error as Error).message,
            },
            'log-management'
          );
        }
      }

      return logFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch (error) {
      logger.error(
        'Failed to read log directory',
        error as Error,
        {
          directory: this.config.logDirectory,
        },
        'log-management'
      );
      throw error;
    }
  }

  /**
   * Get current log directory usage statistics
   */
  async getLogDirectoryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
    averageFileSize: number;
  }> {
    const logFiles = await this.getLogFiles();

    if (logFiles.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestFile: null,
        newestFile: null,
        averageFileSize: 0,
      };
    }

    const totalSize = logFiles.reduce((sum, file) => sum + file.size, 0);
    const oldestFile = logFiles.reduce(
      (oldest, file) => (!oldest || file.created < oldest ? file.created : oldest),
      null as Date | null
    );
    const newestFile = logFiles.reduce(
      (newest, file) => (!newest || file.created > newest ? file.created : newest),
      null as Date | null
    );

    return {
      totalFiles: logFiles.length,
      totalSize,
      oldestFile,
      newestFile,
      averageFileSize: Math.round(totalSize / logFiles.length),
    };
  }

  /**
   * Monitor log directory and emit alerts when thresholds are exceeded
   */
  async performMonitoring(): Promise<void> {
    try {
      const stats = await this.getLogDirectoryStats();
      const logFiles = await this.getLogFiles();

      // Check disk usage
      await this.checkDiskUsage(stats);

      // Check individual file sizes
      await this.checkFileSizes(logFiles);

      // Check for large files that might indicate issues
      const largeFiles = logFiles.filter(
        (file) => file.size > this.parseSizeToBytes(this.config.alertThresholds.fileSize)
      );

      if (largeFiles.length > 0) {
        this.emitAlert('FILE_SIZE', 'MEDIUM', 'Large log files detected', {
          count: largeFiles.length,
          files: largeFiles.map((f) => ({
            path: f.path,
            size: this.formatBytes(f.size),
            age: f.age,
          })),
        });
      }
    } catch (error) {
      logger.error('Log monitoring failed', error as Error, {}, 'log-management');
    }
  }

  /**
   * Update retention policy
   */
  updateRetentionPolicy(policy: Partial<LogRetentionPolicy>): void {
    this.config.retentionPolicy = {
      ...this.config.retentionPolicy,
      ...policy,
    };

    logger.info(
      'Log retention policy updated',
      {
        newPolicy: this.config.retentionPolicy,
      },
      'log-management'
    );

    // Restart cleanup timer with new interval if it changed
    if (policy.cleanupInterval && this.cleanupTimer) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LogManagementConfig {
    return { ...this.config };
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await access(this.config.logDirectory);
    } catch {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
      logger.info(
        'Created log directory',
        {
          directory: this.config.logDirectory,
        },
        'log-management'
      );
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    const intervalMs = this.config.retentionPolicy.cleanupInterval * 60 * 60 * 1000;
    this.cleanupTimer = setInterval(() => {
      this.performCleanup().catch((error) => {
        logger.error('Scheduled cleanup failed', error, {}, 'log-management');
      });
    }, intervalMs);

    logger.debug(
      'Cleanup timer started',
      {
        intervalHours: this.config.retentionPolicy.cleanupInterval,
      },
      'log-management'
    );
  }

  private startMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    // Monitor every 5 minutes
    const monitoringInterval = 5 * 60 * 1000;
    this.monitoringTimer = setInterval(() => {
      this.performMonitoring().catch((error) => {
        logger.error('Log monitoring failed', error, {}, 'log-management');
      });
    }, monitoringInterval);

    logger.debug(
      'Log monitoring started',
      {
        intervalMinutes: 5,
      },
      'log-management'
    );
  }

  private async identifyFilesForRemoval(logFiles: LogFileInfo[]): Promise<LogFileInfo[]> {
    const filesToRemove: LogFileInfo[] = [];
    const policy = this.config.retentionPolicy;

    // Sort files by modification time (oldest first)
    const sortedFiles = [...logFiles].sort((a, b) => a.modified.getTime() - b.modified.getTime());

    // Remove files older than maxAge
    const maxAgeFiles = sortedFiles.filter((file) => file.age > policy.maxAge);
    filesToRemove.push(...maxAgeFiles);

    // Remove excess files beyond maxFiles limit
    const remainingFiles = sortedFiles.filter((file) => !filesToRemove.includes(file));
    if (remainingFiles.length > policy.maxFiles) {
      const excessFiles = remainingFiles.slice(0, remainingFiles.length - policy.maxFiles);
      filesToRemove.push(...excessFiles);
    }

    // Remove files if total size exceeds maxSize
    const maxSizeBytes = this.parseSizeToBytes(policy.maxSize);
    const finalRemainingFiles = sortedFiles.filter((file) => !filesToRemove.includes(file));
    let totalSize = finalRemainingFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > maxSizeBytes) {
      for (const file of finalRemainingFiles) {
        if (totalSize <= maxSizeBytes) break;
        if (!filesToRemove.includes(file)) {
          filesToRemove.push(file);
          totalSize -= file.size;
        }
      }
    }

    return filesToRemove;
  }

  private isLogFile(filename: string): boolean {
    const logExtensions = ['.log', '.txt'];
    const logPatterns = [
      /\.log$/,
      /\.log\.\d+$/,
      /\.log\.\d{4}-\d{2}-\d{2}$/,
      /-\d{4}-\d{2}-\d{2}\.log$/,
      /combined\.log/,
      /error\.log/,
      /exceptions\.log/,
      /rejections\.log/,
    ];

    return (
      logExtensions.some((ext) => filename.endsWith(ext)) ||
      logPatterns.some((pattern) => pattern.test(filename))
    );
  }

  private parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB|TB)?$/i);
    if (!match) return 0;

    const size = Number.parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();

    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };

    return Math.floor(size * (multipliers[unit] || 1));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  private async checkDiskUsage(stats: any): Promise<void> {
    try {
      // This is a simplified check - in a real implementation, you might want to check actual disk usage
      const threshold = this.config.alertThresholds.diskUsage;
      const maxSizeBytes = this.parseSizeToBytes(this.config.retentionPolicy.maxSize);
      const usagePercentage = (stats.totalSize / maxSizeBytes) * 100;

      if (usagePercentage > threshold) {
        this.emitAlert('DISK_USAGE', 'HIGH', 'Log directory usage exceeds threshold', {
          currentUsage: `${usagePercentage.toFixed(2)}%`,
          threshold: `${threshold}%`,
          totalSize: this.formatBytes(stats.totalSize),
          maxSize: this.config.retentionPolicy.maxSize,
          totalFiles: stats.totalFiles,
        });
      }
    } catch (error) {
      logger.error('Failed to check disk usage', error as Error, {}, 'log-management');
    }
  }

  private async checkFileSizes(logFiles: LogFileInfo[]): Promise<void> {
    const maxFileSize = this.parseSizeToBytes(this.config.alertThresholds.fileSize);
    const largeFiles = logFiles.filter((file) => file.size > maxFileSize);

    if (largeFiles.length > 0) {
      this.emitAlert('FILE_SIZE', 'MEDIUM', 'Large log files detected', {
        threshold: this.config.alertThresholds.fileSize,
        largeFiles: largeFiles.map((file) => ({
          path: file.path,
          size: this.formatBytes(file.size),
          age: `${file.age} days`,
        })),
      });
    }
  }

  private emitAlert(
    type: LogAlert['type'],
    severity: LogAlert['severity'],
    message: string,
    details: Record<string, any>
  ): void {
    const alert: LogAlert = {
      type,
      severity,
      message,
      details,
      timestamp: new Date(),
    };

    this.emit('alert', alert);
  }
}

// Create default instance
export const logManagementService = new LogManagementService();

// Auto-start in production
if (env.NODE_ENV === 'production') {
  logManagementService.start().catch((error) => {
    logger.error('Failed to start log management service', error, {}, 'log-management');
  });
}
