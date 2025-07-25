/**
 * Performance monitoring and metrics collection service
 */

import { performance } from 'perf_hooks';
import os from 'os';
import { logger } from '../utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface AnalysisMetrics {
  repositoryPath: string;
  mode: string;
  duration: number;
  fileCount: number;
  totalSize: number;
  cacheHit: boolean;
  deduplicated: boolean;
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
}

interface SystemMetrics {
  timestamp: number;
  memory: {
    used: number;
    free: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  uptime: number;
}

/**
 * Service for collecting and managing performance metrics
 */
export class MetricsService {
  private metrics: PerformanceMetric[] = [];
  private requestMetrics: RequestMetrics[] = [];
  private analysisMetrics: AnalysisMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private readonly maxMetrics: number;
  private readonly collectInterval: NodeJS.Timeout;
  private startTime: number;
  private lastCpuUsage: NodeJS.CpuUsage;

  constructor(maxMetrics: number = 10000) {
    this.maxMetrics = maxMetrics;
    this.startTime = Date.now();
    this.lastCpuUsage = process.cpuUsage();

    // Collect system metrics every 30 seconds
    this.collectInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30 * 1000);

    // Initial system metrics collection
    this.collectSystemMetrics();
  }

  /**
   * Records a performance metric
   */
  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);
    this.pruneMetrics();
  }

  /**
   * Records request metrics
   */
  public recordRequest(path: string, method: string, statusCode: number, duration: number): void {
    const requestMetric: RequestMetrics = {
      path,
      method,
      statusCode,
      duration,
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };

    this.requestMetrics.push(requestMetric);
    this.pruneRequestMetrics();
  }

  /**
   * Records analysis metrics
   */
  public recordAnalysis(
    repositoryPath: string,
    mode: string,
    duration: number,
    fileCount: number,
    totalSize: number,
    cacheHit: boolean = false,
    deduplicated: boolean = false
  ): void {
    const analysisMetric: AnalysisMetrics = {
      repositoryPath,
      mode,
      duration,
      fileCount,
      totalSize,
      cacheHit,
      deduplicated,
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
    };

    this.analysisMetrics.push(analysisMetric);
    this.pruneAnalysisMetrics();

    // Also record as general metrics
    this.recordMetric('analysis.duration', duration, { mode, cacheHit: cacheHit.toString() });
    this.recordMetric('analysis.fileCount', fileCount, { mode });
    this.recordMetric('analysis.totalSize', totalSize, { mode });
  }

  /**
   * Collects system metrics
   */
  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    this.lastCpuUsage = process.cpuUsage();

    // Calculate CPU usage percentage
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

    const systemMetric: SystemMetrics = {
      timestamp: Date.now(),
      memory: {
        used: memoryUsage.heapUsed,
        free: os.freemem(),
        total: os.totalmem(),
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
      cpu: {
        usage: cpuPercent,
        loadAverage: os.loadavg(),
      },
      uptime: process.uptime(),
    };

    this.systemMetrics.push(systemMetric);
    this.pruneSystemMetrics();

    // Record as general metrics
    this.recordMetric('system.memory.heapUsed', memoryUsage.heapUsed);
    this.recordMetric('system.memory.heapTotal', memoryUsage.heapTotal);
    this.recordMetric('system.memory.external', memoryUsage.external);
    this.recordMetric('system.cpu.usage', cpuPercent);
    this.recordMetric('system.uptime', process.uptime());
  }

  /**
   * Gets performance statistics
   */
  public getStats(): {
    requests: {
      total: number;
      averageResponseTime: number;
      errorRate: number;
      requestsPerMinute: number;
    };
    analysis: {
      total: number;
      averageDuration: number;
      cacheHitRate: number;
      deduplicationRate: number;
      averageFileCount: number;
    };
    system: {
      current: SystemMetrics | null;
      averageMemoryUsage: number;
      averageCpuUsage: number;
      uptime: number;
    };
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Request stats
    const recentRequests = this.requestMetrics.filter((r) => r.timestamp > oneMinuteAgo);
    const totalRequests = this.requestMetrics.length;
    const errorRequests = this.requestMetrics.filter((r) => r.statusCode >= 400).length;
    const averageResponseTime =
      totalRequests > 0
        ? this.requestMetrics.reduce((sum, r) => sum + r.duration, 0) / totalRequests
        : 0;

    // Analysis stats
    const totalAnalysis = this.analysisMetrics.length;
    const cacheHits = this.analysisMetrics.filter((a) => a.cacheHit).length;
    const deduplicated = this.analysisMetrics.filter((a) => a.deduplicated).length;
    const averageAnalysisDuration =
      totalAnalysis > 0
        ? this.analysisMetrics.reduce((sum, a) => sum + a.duration, 0) / totalAnalysis
        : 0;
    const averageFileCount =
      totalAnalysis > 0
        ? this.analysisMetrics.reduce((sum, a) => sum + a.fileCount, 0) / totalAnalysis
        : 0;

    // System stats
    const currentSystem = this.systemMetrics[this.systemMetrics.length - 1] || null;
    const averageMemoryUsage =
      this.systemMetrics.length > 0
        ? this.systemMetrics.reduce((sum, s) => sum + s.memory.heapUsed, 0) /
          this.systemMetrics.length
        : 0;
    const averageCpuUsage =
      this.systemMetrics.length > 0
        ? this.systemMetrics.reduce((sum, s) => sum + s.cpu.usage, 0) / this.systemMetrics.length
        : 0;

    return {
      requests: {
        total: totalRequests,
        averageResponseTime,
        errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
        requestsPerMinute: recentRequests.length,
      },
      analysis: {
        total: totalAnalysis,
        averageDuration: averageAnalysisDuration,
        cacheHitRate: totalAnalysis > 0 ? (cacheHits / totalAnalysis) * 100 : 0,
        deduplicationRate: totalAnalysis > 0 ? (deduplicated / totalAnalysis) * 100 : 0,
        averageFileCount,
      },
      system: {
        current: currentSystem,
        averageMemoryUsage,
        averageCpuUsage,
        uptime: process.uptime(),
      },
    };
  }

  /**
   * Gets metrics for a specific time range
   */
  public getMetricsInRange(
    startTime: number,
    endTime: number,
    metricName?: string
  ): PerformanceMetric[] {
    return this.metrics.filter(
      (m) =>
        m.timestamp >= startTime && m.timestamp <= endTime && (!metricName || m.name === metricName)
    );
  }

  /**
   * Gets request metrics for a specific time range
   */
  public getRequestMetricsInRange(startTime: number, endTime: number): RequestMetrics[] {
    return this.requestMetrics.filter((r) => r.timestamp >= startTime && r.timestamp <= endTime);
  }

  /**
   * Gets analysis metrics for a specific time range
   */
  public getAnalysisMetricsInRange(startTime: number, endTime: number): AnalysisMetrics[] {
    return this.analysisMetrics.filter((a) => a.timestamp >= startTime && a.timestamp <= endTime);
  }

  /**
   * Creates a performance timer
   */
  public createTimer(name: string, tags?: Record<string, string>): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, tags);
    };
  }

  /**
   * Middleware for Express to automatically track request metrics
   */
  public requestMiddleware() {
    return (req: any, res: any, next: any) => {
      const start = performance.now();

      res.on('finish', () => {
        const duration = performance.now() - start;
        this.recordRequest(req.path, req.method, res.statusCode, duration);
      });

      next();
    };
  }

  /**
   * Prunes old metrics to prevent memory leaks
   */
  private pruneMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private pruneRequestMetrics(): void {
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetrics);
    }
  }

  private pruneAnalysisMetrics(): void {
    if (this.analysisMetrics.length > this.maxMetrics) {
      this.analysisMetrics = this.analysisMetrics.slice(-this.maxMetrics);
    }
  }

  private pruneSystemMetrics(): void {
    // Keep only last 24 hours of system metrics (collected every 30 seconds)
    const maxSystemMetrics = (24 * 60 * 60) / 30; // 2880 entries
    if (this.systemMetrics.length > maxSystemMetrics) {
      this.systemMetrics = this.systemMetrics.slice(-maxSystemMetrics);
    }
  }

  /**
   * Exports all metrics for external monitoring systems
   */
  public exportMetrics(): {
    metrics: PerformanceMetric[];
    requests: RequestMetrics[];
    analysis: AnalysisMetrics[];
    system: SystemMetrics[];
    stats: ReturnType<typeof this.getStats>;
  } {
    return {
      metrics: this.metrics,
      requests: this.requestMetrics,
      analysis: this.analysisMetrics,
      system: this.systemMetrics,
      stats: this.getStats(),
    };
  }

  /**
   * Clears all metrics
   */
  public clear(): void {
    this.metrics = [];
    this.requestMetrics = [];
    this.analysisMetrics = [];
    this.systemMetrics = [];
    logger.info('All metrics cleared');
  }

  /**
   * Destroys the service and cleans up resources
   */
  public destroy(): void {
    clearInterval(this.collectInterval);
    this.clear();
  }
}

// Create singleton instance
export const metricsService = new MetricsService(parseInt(process.env.MAX_METRICS || '10000'));

export default metricsService;
