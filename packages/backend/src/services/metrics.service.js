import { env } from '../config/environment';
import logger from './logger.service';
class MetricsService {
    metrics = new Map();
    requestMetrics = {
        totalRequests: 0,
        requestsByStatus: {},
        requestsByMethod: {},
        averageResponseTime: 0,
        responseTimeHistogram: [],
    };
    analysisMetrics = {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        averageAnalysisTime: 0,
        analysisTimeHistogram: [],
        repositoriesProcessed: 0,
    };
    startTime = new Date();
    activeConnections = 0;
    constructor() {
        if (env.ENABLE_METRICS) {
            this.startMetricsCollection();
        }
    }
    startMetricsCollection() {
        // Collect system metrics every 30 seconds
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000);
        // Log metrics summary every 5 minutes
        setInterval(() => {
            this.logMetricsSummary();
        }, 300000);
    }
    collectSystemMetrics() {
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
    recordMetric(name, value, labels) {
        if (!env.ENABLE_METRICS)
            return;
        const metric = {
            name,
            value,
            timestamp: new Date(),
            labels,
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const metrics = this.metrics.get(name);
        metrics.push(metric);
        // Keep only last 1000 metrics per type to prevent memory leaks
        if (metrics.length > 1000) {
            metrics.shift();
        }
    }
    recordRequestMetric(method, statusCode, responseTime) {
        if (!env.ENABLE_METRICS)
            return;
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
        this.recordMetric('http_requests_total', 1, { method, status: statusCode.toString() });
        this.recordMetric('http_request_duration', responseTime, { method });
    }
    recordAnalysisMetric(success, duration, repositoryCount = 1) {
        if (!env.ENABLE_METRICS)
            return;
        this.analysisMetrics.totalAnalyses++;
        this.analysisMetrics.repositoriesProcessed += repositoryCount;
        if (success) {
            this.analysisMetrics.successfulAnalyses++;
        }
        else {
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
    incrementActiveConnections() {
        this.activeConnections++;
        this.recordMetric('active_connections', this.activeConnections);
    }
    decrementActiveConnections() {
        this.activeConnections = Math.max(0, this.activeConnections - 1);
        this.recordMetric('active_connections', this.activeConnections);
    }
    getMetrics() {
        const systemMetrics = {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            activeConnections: this.activeConnections,
        };
        return {
            system: systemMetrics,
            requests: this.requestMetrics,
            analysis: this.analysisMetrics,
            custom: Object.fromEntries(Array.from(this.metrics.entries()).map(([name, metrics]) => [
                name,
                {
                    current: metrics[metrics.length - 1]?.value || 0,
                    count: metrics.length,
                    average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length || 0,
                },
            ])),
        };
    }
    logMetricsSummary() {
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
        return (req, res, next) => {
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
    metricsHandler = (req, res) => {
        const metrics = this.getMetrics();
        res.json(metrics);
    };
    // Prometheus-style metrics endpoint
    prometheusHandler = (req, res) => {
        const metrics = this.getMetrics();
        let output = '';
        // Convert metrics to Prometheus format
        output += `# HELP http_requests_total Total number of HTTP requests\n`;
        output += `# TYPE http_requests_total counter\n`;
        output += `http_requests_total ${metrics.requests.totalRequests}\n\n`;
        output += `# HELP http_request_duration_seconds HTTP request duration in seconds\n`;
        output += `# TYPE http_request_duration_seconds histogram\n`;
        output += `http_request_duration_seconds ${metrics.requests.averageResponseTime / 1000}\n\n`;
        output += `# HELP analysis_total Total number of repository analyses\n`;
        output += `# TYPE analysis_total counter\n`;
        output += `analysis_total ${metrics.analysis.totalAnalyses}\n\n`;
        output += `# HELP memory_usage_bytes Memory usage in bytes\n`;
        output += `# TYPE memory_usage_bytes gauge\n`;
        output += `memory_usage_bytes ${metrics.system.memoryUsage.heapUsed}\n\n`;
        res.set('Content-Type', 'text/plain');
        res.send(output);
    };
}
export const metricsService = new MetricsService();
export default metricsService;
//# sourceMappingURL=metrics.service.js.map