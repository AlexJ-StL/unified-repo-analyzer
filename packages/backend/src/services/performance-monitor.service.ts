import { EventEmitter } from 'node:events';
import logger from './logger.service.js';

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

/**
 * Operation timing result
 */
export interface OperationTiming {
  operation: string;
  duration: number;
  startTime: number;
  endTime: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Resource usage snapshot
 */
export interface ResourceUsage {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    percentage: number;
  };
  eventLoop: {
    delay: number;
  };
}

/**
 * Performance baseline for regression detection
 */
export interface PerformanceBaseline {
  operation: string;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  sampleCount: number;
  lastUpdated: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of operations to monitor
  baselineUpdateInterval: number; // milliseconds
  regressionThreshold: number; // percentage increase to trigger alert
  resourceMonitoringInterval: number; // milliseconds
  maxMetricsHistory: number;
}
/**
 * Performance monitoring service for tracking operation timing and resource usage
 */
export class PerformanceMonitor extends EventEmitter {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private timings: OperationTiming[] = [];
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private resourceHistory: ResourceUsage[] = [];
  private activeOperations: Map<string, { startTime: number; metadata?: any }> = new Map();
  private resourceMonitorInterval?: NodeJS.Timeout;

  constructor(config?: Partial<PerformanceConfig>) {
    super();
    this.config = {
      enabled: true,
      sampleRate: 1.0, // Monitor all operations by default
      baselineUpdateInterval: 60000, // 1 minute
      regressionThreshold: 0.5, // 50% increase triggers alert
      resourceMonitoringInterval: 5000, // 5 seconds
      maxMetricsHistory: 1000,
      ...config,
    };

    if (this.config.enabled) {
      this.startResourceMonitoring();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  public startOperation(operationId: string, operationName: string, metadata?: any): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    this.activeOperations.set(operationId, {
      startTime: Date.now(),
      metadata: { operation: operationName, ...metadata },
    });

    logger.debug('Performance monitoring started', {
      operationId,
      operationName,
      metadata,
    });
  }

  /**
   * End timing an operation
   */
  public endOperation(operationId: string, success = true, error?: string): OperationTiming | null {
    if (!this.config.enabled) {
      return null;
    }

    const activeOp = this.activeOperations.get(operationId);
    if (!activeOp) {
      logger.warn('Attempted to end unknown operation', { operationId });
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - activeOp.startTime;

    const timing: OperationTiming = {
      operation: activeOp.metadata?.operation || 'unknown',
      duration,
      startTime: activeOp.startTime,
      endTime,
      success,
      error,
      metadata: activeOp.metadata,
    };

    this.timings.push(timing);
    this.activeOperations.delete(operationId);

    // Trim history if needed
    if (this.timings.length > this.config.maxMetricsHistory) {
      this.timings = this.timings.slice(-this.config.maxMetricsHistory);
    }

    // Update baselines and check for regressions
    this.updateBaseline(timing.operation, duration);
    this.checkForRegression(timing.operation, duration);

    logger.debug('Performance monitoring completed', {
      operationId,
      operation: timing.operation,
      duration,
      success,
    });

    this.emit('operationCompleted', timing);
    return timing;
  }

  /**
   * Record a custom metric
   */
  public recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.metrics.push(metric);

    // Trim history if needed
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
    }

    logger.debug('Performance metric recorded', metric);
    this.emit('metricRecorded', metric);
  }

  /**
   * Get current resource usage
   */
  public async getCurrentResourceUsage(): Promise<ResourceUsage> {
    const memUsage = process.memoryUsage();
    const startTime = Date.now();

    // Measure event loop delay
    const eventLoopDelay = await new Promise<number>((resolve) => {
      setImmediate(() => {
        resolve(Date.now() - startTime);
      });
    });

    return {
      timestamp: Date.now(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        percentage: process.cpuUsage().user / 1000000, // Convert microseconds to seconds
      },
      eventLoop: {
        delay: eventLoopDelay,
      },
    };
  }

  /**
   * Start resource monitoring
   */
  private startResourceMonitoring(): void {
    if (this.resourceMonitorInterval) {
      return;
    }

    this.resourceMonitorInterval = setInterval(async () => {
      try {
        const usage = await this.getCurrentResourceUsage();
        this.resourceHistory.push(usage);

        // Trim history if needed
        if (this.resourceHistory.length > this.config.maxMetricsHistory) {
          this.resourceHistory = this.resourceHistory.slice(-this.config.maxMetricsHistory);
        }

        // Record as metrics
        this.recordMetric('memory.used', usage.memory.used, 'bytes', {
          type: 'heap',
        });
        this.recordMetric('memory.percentage', usage.memory.percentage, 'percent', {
          type: 'heap',
        });
        this.recordMetric('cpu.percentage', usage.cpu.percentage, 'percent');
        this.recordMetric('eventloop.delay', usage.eventLoop.delay, 'ms');

        this.emit('resourceUsageUpdated', usage);
      } catch (error) {
        logger.error('Resource monitoring error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, this.config.resourceMonitoringInterval);
  }

  /**
   * Stop resource monitoring
   */
  public stopResourceMonitoring(): void {
    if (this.resourceMonitorInterval) {
      clearInterval(this.resourceMonitorInterval);
      this.resourceMonitorInterval = undefined;
    }
  } /**

	 * Update performance baseline for an operation
	 */
  private updateBaseline(operation: string, duration: number): void {
    const existing = this.baselines.get(operation);
    const now = Date.now();

    if (!existing) {
      this.baselines.set(operation, {
        operation,
        averageDuration: duration,
        p95Duration: duration,
        p99Duration: duration,
        sampleCount: 1,
        lastUpdated: now,
      });
      return;
    }

    // Update with exponential moving average
    const alpha = 0.1; // Smoothing factor
    existing.averageDuration = existing.averageDuration * (1 - alpha) + duration * alpha;
    existing.sampleCount++;
    existing.lastUpdated = now;

    // Update percentiles (simplified calculation)
    const recentTimings = this.timings
      .filter(
        (t) => t.operation === operation && t.endTime > now - this.config.baselineUpdateInterval
      )
      .map((t) => t.duration)
      .sort((a, b) => a - b);

    if (recentTimings.length > 0) {
      const p95Index = Math.floor(recentTimings.length * 0.95);
      const p99Index = Math.floor(recentTimings.length * 0.99);
      existing.p95Duration = recentTimings[p95Index] || duration;
      existing.p99Duration = recentTimings[p99Index] || duration;
    }
  }

  /**
   * Check for performance regression
   */
  private checkForRegression(operation: string, duration: number): void {
    const baseline = this.baselines.get(operation);
    if (!baseline || baseline.sampleCount < 10) {
      return; // Need enough samples for meaningful comparison
    }

    const regressionRatio = duration / baseline.averageDuration;
    if (regressionRatio > 1 + this.config.regressionThreshold) {
      const regressionData = {
        operation,
        currentDuration: duration,
        baselineAverage: baseline.averageDuration,
        regressionPercentage: (regressionRatio - 1) * 100,
        timestamp: Date.now(),
      };

      logger.warn('Performance regression detected', regressionData);
      this.emit('performanceRegression', regressionData);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  public getOperationStats(
    operation: string,
    timeWindow?: number
  ): {
    count: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    p99Duration: number;
    successRate: number;
  } {
    const cutoff = timeWindow ? Date.now() - timeWindow : 0;
    const relevantTimings = this.timings.filter(
      (t) => t.operation === operation && t.endTime > cutoff
    );

    if (relevantTimings.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        successRate: 0,
      };
    }

    const durations = relevantTimings.map((t) => t.duration).sort((a, b) => a - b);
    const successCount = relevantTimings.filter((t) => t.success).length;

    return {
      count: relevantTimings.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
      p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
      successRate: successCount / relevantTimings.length,
    };
  } /**

	 * Get all recorded metrics
	 */
  public getMetrics(timeWindow?: number): PerformanceMetric[] {
    const cutoff = timeWindow ? Date.now() - timeWindow : 0;
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }

  /**
   * Get resource usage history
   */
  public getResourceHistory(timeWindow?: number): ResourceUsage[] {
    const cutoff = timeWindow ? Date.now() - timeWindow : 0;
    return this.resourceHistory.filter((r) => r.timestamp > cutoff);
  }

  /**
   * Get all performance baselines
   */
  public getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * Clear all performance data
   */
  public clearData(): void {
    this.metrics = [];
    this.timings = [];
    this.resourceHistory = [];
    this.baselines.clear();
    this.activeOperations.clear();

    logger.info('Performance monitoring data cleared');
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PerformanceConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...config };

    if (!wasEnabled && this.config.enabled) {
      this.startResourceMonitoring();
    } else if (wasEnabled && !this.config.enabled) {
      this.stopResourceMonitoring();
    }

    logger.info('Performance monitoring configuration updated', {
      config: this.config,
    });
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Generate performance report
   */
  public generateReport(timeWindow = 3600000): {
    summary: {
      totalOperations: number;
      averageResponseTime: number;
      successRate: number;
      regressionCount: number;
    };
    operations: Array<{
      name: string;
      stats: ReturnType<typeof this.getOperationStats>;
    }>;
    resourceUsage: {
      current: ResourceUsage | null;
      average: {
        memoryUsage: number;
        cpuUsage: number;
        eventLoopDelay: number;
      };
    };
    alerts: string[];
  } {
    const cutoff = Date.now() - timeWindow;
    const recentTimings = this.timings.filter((t) => t.endTime > cutoff);
    const recentResources = this.resourceHistory.filter((r) => r.timestamp > cutoff);

    // Get unique operations
    const operations = Array.from(new Set(recentTimings.map((t) => t.operation)));

    // Calculate averages
    const avgMemory =
      recentResources.length > 0
        ? recentResources.reduce((sum, r) => sum + r.memory.percentage, 0) / recentResources.length
        : 0;
    const avgCpu =
      recentResources.length > 0
        ? recentResources.reduce((sum, r) => sum + r.cpu.percentage, 0) / recentResources.length
        : 0;
    const avgEventLoop =
      recentResources.length > 0
        ? recentResources.reduce((sum, r) => sum + r.eventLoop.delay, 0) / recentResources.length
        : 0;

    // Generate alerts
    const alerts: string[] = [];
    if (avgMemory > 80) alerts.push(`High memory usage: ${avgMemory.toFixed(1)}%`);
    if (avgEventLoop > 100) alerts.push(`High event loop delay: ${avgEventLoop.toFixed(1)}ms`);

    return {
      summary: {
        totalOperations: recentTimings.length,
        averageResponseTime:
          recentTimings.length > 0
            ? recentTimings.reduce((sum, t) => sum + t.duration, 0) / recentTimings.length
            : 0,
        successRate:
          recentTimings.length > 0
            ? recentTimings.filter((t) => t.success).length / recentTimings.length
            : 0,
        regressionCount: 0, // Would need to track this separately
      },
      operations: operations.map((op) => ({
        name: op,
        stats: this.getOperationStats(op, timeWindow),
      })),
      resourceUsage: {
        current: recentResources.length > 0 ? recentResources[recentResources.length - 1] : null,
        average: {
          memoryUsage: avgMemory,
          cpuUsage: avgCpu,
          eventLoopDelay: avgEventLoop,
        },
      },
      alerts,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopResourceMonitoring();
    this.removeAllListeners();
    this.clearData();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;
