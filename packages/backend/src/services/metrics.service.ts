import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/environment.js';
import logger from './logger.service.js';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

interface RequestMetrics {
  totalRequests: number;
  requestsByStatus: Record<number, number>;
  requestsByMethod: Record<string, number>;
  averageResponseTime: number;
  responseTimeHistogram: number[];
}

interface SystemMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  activeConnections: number;
}

interface AnalysisMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageAnalysisTime: number;
  analysisTimeHistogram: number[];
  repositoriesProcessed: number;
}

class MetricsService {
  private metrics: Map<string, Metric[]> = new Map();
  private requestMetrics: RequestMetrics = {
    totalRequests: 0,
    requestsByStatus: {},
    requestsByMethod: {},
    averageResponseTime: 0,
    responseTimeHistogram: [],
  };
  private analysisMetrics: AnalysisMetrics = {
    totalAnalyses: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    averageAnalysisTime: 0,
    analysisTimeHistogram: [],
    repositoriesProcessed: 0,
  };
  private activeConnections = 0;

  constructor() {
    if (env.ENABLE_METRICS) {
      this.startMetricsCollection();
    }
  }

  private startMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Log metrics summary every 30 minutes (reduced for testing)
    setInterval(() => {
      this.logMetricsSummary();
    }, 1800000);
  }

  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    this.recordMetric('memory_heap_used', memoryUsage.heapUsed);
    this.recordMetric('memory_heap_total', memoryUsage.heapTotal);
    this.recordMetric('memory_rss', memoryUsage.rss);
    this.recordMetric('memory_external', memoryUsage.external);
    this.recordMetric('cpu_user', cpuUsage.user);
    this.recordMetric('cpu_system', cpuUsage.system);
    this.recordMetric('uptime', uptime);
    this.recordMetric('active_connections', this.activeConnections);
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!env.ENABLE_METRICS) return;

    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      labels,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per type to prevent memory leaks
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  createTimer(name: string, labels?: Record<string, string>) {
    const startTime = Date.now();
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.recordMetric(name, duration, labels);
        return duration;
      },
    };
  }

  recordAnalysis(
    _repoPath: string,
    mode: string,
    processingTime: number,
    fileCount: number,
    totalSize: number,
    cacheHit: boolean,
    deduplicated: boolean
  ): void {
    this.recordAnalysisMetric(!cacheHit, processingTime, 1);
    this.recordMetric('analysis_files_processed', fileCount, {
      mode,
      cacheHit: cacheHit.toString(),
    });
    this.recordMetric('analysis_total_size', totalSize, {
      mode,
      cacheHit: cacheHit.toString(),
    });
    if (deduplicated) {
      this.recordMetric('analysis_deduplicated', 1, { mode });
    }
  }

  recordRequestMetric(method: string, statusCode: number, responseTime: number): void {
    if (!env.ENABLE_METRICS) return;

    this.requestMetrics.totalRequests++;
    this.requestMetrics.requestsByStatus[statusCode] =
      (this.requestMetrics.requestsByStatus[statusCode] || 0) + 1;
    this.requestMetrics.requestsByMethod[method] =
      (this.requestMetrics.requestsByMethod[method] || 0) + 1;

    // Update average response time
    this.requestMetrics.responseTimeHistogram.push(responseTime);
    if (this.requestMetrics.responseTimeHistogram.length > 1000) {
      this.requestMetrics.responseTimeHistogram.shift();
    }

    this.requestMetrics.averageResponseTime =
      this.requestMetrics.responseTimeHistogram.reduce((a, b) => a + b, 0) /
      this.requestMetrics.responseTimeHistogram.length;

    this.recordMetric('http_requests_total', 1, {
      method,
      status: statusCode.toString(),
    });
    this.recordMetric('http_request_duration', responseTime, { method });
  }

  recordAnalysisMetric(success: boolean, duration: number, repositoryCount = 1): void {
    if (!env.ENABLE_METRICS) return;

    this.analysisMetrics.totalAnalyses++;
    this.analysisMetrics.repositoriesProcessed += repositoryCount;

    if (success) {
      this.analysisMetrics.successfulAnalyses++;
    } else {
      this.analysisMetrics.failedAnalyses++;
    }

    this.analysisMetrics.analysisTimeHistogram.push(duration);
    if (this.analysisMetrics.analysisTimeHistogram.length > 1000) {
      this.analysisMetrics.analysisTimeHistogram.shift();
    }

    this.analysisMetrics.averageAnalysisTime =
      this.analysisMetrics.analysisTimeHistogram.reduce((a, b) => a + b, 0) /
      this.analysisMetrics.analysisTimeHistogram.length;

    this.recordMetric('analysis_total', 1, { success: success.toString() });
    this.recordMetric('analysis_duration', duration);
    this.recordMetric('repositories_processed', repositoryCount);
  }

  incrementActiveConnections(): void {
    this.activeConnections++;
    this.recordMetric('active_connections', this.activeConnections);
  }

  decrementActiveConnections(): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
    this.recordMetric('active_connections', this.activeConnections);
  }

  getStats(): Record<string, any> {
    return this.getMetrics();
  }

  exportMetrics(): Record<string, any> {
    return this.getMetrics();
  }

  getMetricsInRange(startTime: number, endTime: number, metricName?: string): Metric[] {
    const result: Metric[] = [];

    for (const [name, metrics] of this.metrics.entries()) {
      if (metricName && name !== metricName) continue;

      for (const metric of metrics) {
        const metricTimestamp = metric.timestamp.getTime();
        if (metricTimestamp >= startTime && metricTimestamp <= endTime) {
          result.push(metric);
        }
      }
    }

    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getRequestMetricsInRange(startTime: number, endTime: number): RequestMetrics {
    const filteredMetrics = this.getMetricsInRange(startTime, endTime);
    const requestMetrics: RequestMetrics = {
      totalRequests: 0,
      requestsByStatus: {},
      requestsByMethod: {},
      averageResponseTime: 0,
      responseTimeHistogram: [],
    };

    for (const metric of filteredMetrics) {
      if (metric.name === 'http_requests_total') {
        requestMetrics.totalRequests += metric.value;
        if (metric.labels) {
          const status = Number.parseInt(metric.labels.status, 10) || 200;
          const method = metric.labels.method || 'GET';
          requestMetrics.requestsByStatus[status] =
            (requestMetrics.requestsByStatus[status] || 0) + 1;
          requestMetrics.requestsByMethod[method] =
            (requestMetrics.requestsByMethod[method] || 0) + 1;
        }
      } else if (metric.name === 'http_request_duration') {
        requestMetrics.responseTimeHistogram.push(metric.value);
      }
    }

    if (requestMetrics.responseTimeHistogram.length > 0) {
      requestMetrics.averageResponseTime =
        requestMetrics.responseTimeHistogram.reduce((a, b) => a + b, 0) /
        requestMetrics.responseTimeHistogram.length;
    }

    return requestMetrics;
  }

  getAnalysisMetricsInRange(startTime: number, endTime: number): AnalysisMetrics {
    const filteredMetrics = this.getMetricsInRange(startTime, endTime);
    const analysisMetrics: AnalysisMetrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageAnalysisTime: 0,
      analysisTimeHistogram: [],
      repositoriesProcessed: 0,
    };

    for (const metric of filteredMetrics) {
      if (metric.name === 'analysis_total') {
        analysisMetrics.totalAnalyses += metric.value;
        if (metric.labels?.success === 'true') {
          analysisMetrics.successfulAnalyses += metric.value;
        } else {
          analysisMetrics.failedAnalyses += metric.value;
        }
      } else if (metric.name === 'analysis_duration') {
        analysisMetrics.analysisTimeHistogram.push(metric.value);
      } else if (metric.name === 'repositories_processed') {
        analysisMetrics.repositoriesProcessed += metric.value;
      }
    }

    if (analysisMetrics.analysisTimeHistogram.length > 0) {
      analysisMetrics.averageAnalysisTime =
        analysisMetrics.analysisTimeHistogram.reduce((a, b) => a + b, 0) /
        analysisMetrics.analysisTimeHistogram.length;
    }

    return analysisMetrics;
  }

  getMetrics(): Record<string, any> {
    const systemMetrics: SystemMetrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      activeConnections: this.activeConnections,
    };

    return {
      system: systemMetrics,
      requests: this.requestMetrics,
      analysis: this.analysisMetrics,
      custom: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([name, metrics]) => [
          name,
          {
            current: metrics[metrics.length - 1]?.value || 0,
            count: metrics.length,
            average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length || 0,
          },
        ])
      ),
    };
  }

  private logMetricsSummary(): void {
    const metrics = this.getMetrics();
    logger.info('Metrics Summary', {
      uptime: `${Math.floor(metrics.system.uptime / 60)} minutes`,
      totalRequests: metrics.requests.totalRequests,
      averageResponseTime: `${metrics.requests.averageResponseTime.toFixed(2)}ms`,
      totalAnalyses: metrics.analysis.totalAnalyses,
      successRate: `${((metrics.analysis.successfulAnalyses / metrics.analysis.totalAnalyses) * 100).toFixed(1)}%`,
      memoryUsage: `${Math.round(metrics.system.memoryUsage.heapUsed / 1024 / 1024)}MB`,
      activeConnections: metrics.system.activeConnections,
    });
  }

  // Express middleware for request metrics
  requestMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!env.ENABLE_METRICS) {
        return next();
      }

      const startTime = Date.now();
      this.incrementActiveConnections();

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordRequestMetric(req.method, res.statusCode, responseTime);
        this.decrementActiveConnections();
      });

      res.on('close', () => {
        this.decrementActiveConnections();
      });

      next();
    };
  }

  // Express handler for metrics endpoint
  metricsHandler = (_req: Request, res: Response): void => {
    const metrics = this.getMetrics();
    res.json(metrics);
  };

  // Prometheus-style metrics endpoint
  prometheusHandler = (_req: Request, res: Response): void => {
    const metrics = this.getMetrics();
    let output = '';

    // Convert metrics to Prometheus format
    output += '# HELP http_requests_total Total number of HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    output += `http_requests_total ${metrics.requests.totalRequests}\n\n`;

    output += '# HELP http_request_duration_seconds HTTP request duration in seconds\n';
    output += '# TYPE http_request_duration_seconds histogram\n';
    output += `http_request_duration_seconds ${metrics.requests.averageResponseTime / 1000}\n\n`;

    output += '# HELP analysis_total Total number of repository analyses\n';
    output += '# TYPE analysis_total counter\n';
    output += `analysis_total ${metrics.analysis.totalAnalyses}\n\n`;

    output += '# HELP memory_usage_bytes Memory usage in bytes\n';
    output += '# TYPE memory_usage_bytes gauge\n';
    output += `memory_usage_bytes ${metrics.system.memoryUsage.heapUsed}\n\n`;

    res.set('Content-Type', 'text/plain');
    res.send(output);
  };

  // Clear all metrics (useful for testing)
  clear(): void {
    this.metrics.clear();
    this.requestMetrics = {
      totalRequests: 0,
      requestsByStatus: {},
      requestsByMethod: {},
      averageResponseTime: 0,
      responseTimeHistogram: [],
    };
    this.analysisMetrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageAnalysisTime: 0,
      analysisTimeHistogram: [],
      repositoriesProcessed: 0,
    };
    this.activeConnections = 0;
  }

  // Destroy the metrics service (useful for testing)
  destroy(): void {
    this.clear();
  }
}

export const metricsService = new MetricsService();
export default metricsService;
