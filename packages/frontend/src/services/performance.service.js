/**
 * Frontend performance monitoring service
 */
/**
 * Service for monitoring frontend performance metrics
 */
export class PerformanceService {
    metrics = [];
    navigationTiming = null;
    resourceTimings = [];
    observer = null;
    maxMetrics;
    constructor(maxMetrics = 1000) {
        this.maxMetrics = maxMetrics;
        this.initializePerformanceObserver();
        this.collectNavigationTiming();
    }
    /**
     * Initialize performance observer for Web Vitals
     */
    initializePerformanceObserver() {
        if (!('PerformanceObserver' in window)) {
            console.warn('PerformanceObserver not supported');
            return;
        }
        try {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.handlePerformanceEntry(entry);
                }
            });
            // Observe different types of performance entries
            const entryTypes = [
                'navigation',
                'resource',
                'paint',
                'largest-contentful-paint',
                'first-input',
                'layout-shift',
            ];
            for (const entryType of entryTypes) {
                try {
                    this.observer.observe({ entryTypes: [entryType] });
                }
                catch {
                    // Some entry types might not be supported
                    console.debug(`Performance entry type ${entryType} not supported`);
                }
            }
        }
        catch (error) {
            console.error('Error initializing performance observer:', error);
        }
    }
    /**
     * Handle performance entries from the observer
     */
    handlePerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.handleNavigationEntry(entry);
                break;
            case 'resource':
                this.handleResourceEntry(entry);
                break;
            case 'paint':
                this.handlePaintEntry(entry);
                break;
            case 'largest-contentful-paint':
                this.recordMetric('lcp', entry.startTime, { type: 'web-vital' });
                break;
            case 'first-input':
                this.recordMetric('fid', entry.processingStart - entry.startTime, {
                    type: 'web-vital',
                });
                break;
            case 'layout-shift':
                if (!entry.hadRecentInput) {
                    this.recordMetric('cls', entry.value, { type: 'web-vital' });
                }
                break;
        }
    }
    /**
     * Handle navigation timing entries
     */
    handleNavigationEntry(entry) {
        this.navigationTiming = {
            navigationStart: entry.navigationStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
            loadComplete: entry.loadEventEnd - entry.navigationStart,
        };
        this.recordMetric('navigation.domContentLoaded', this.navigationTiming.domContentLoaded);
        this.recordMetric('navigation.loadComplete', this.navigationTiming.loadComplete);
        this.recordMetric('navigation.domInteractive', entry.domInteractive - entry.navigationStart);
        this.recordMetric('navigation.domComplete', entry.domComplete - entry.navigationStart);
    }
    /**
     * Handle resource timing entries
     */
    handleResourceEntry(entry) {
        const resourceTiming = {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: this.getResourceType(entry.name),
        };
        this.resourceTimings.push(resourceTiming);
        this.pruneResourceTimings();
        this.recordMetric('resource.duration', entry.duration, {
            type: resourceTiming.type,
            cached: entry.transferSize === 0 ? 'true' : 'false',
        });
        if (entry.transferSize) {
            this.recordMetric('resource.size', entry.transferSize, { type: resourceTiming.type });
        }
    }
    /**
     * Handle paint timing entries
     */
    handlePaintEntry(entry) {
        if (entry.name === 'first-paint') {
            this.recordMetric('fp', entry.startTime, { type: 'web-vital' });
            if (this.navigationTiming) {
                this.navigationTiming.firstPaint = entry.startTime;
            }
        }
        else if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime, { type: 'web-vital' });
            if (this.navigationTiming) {
                this.navigationTiming.firstContentfulPaint = entry.startTime;
            }
        }
    }
    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.includes('.js'))
            return 'script';
        if (url.includes('.css'))
            return 'stylesheet';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/))
            return 'image';
        if (url.includes('/api/'))
            return 'api';
        return 'other';
    }
    /**
     * Collect navigation timing manually for older browsers
     */
    collectNavigationTiming() {
        if (!performance.timing)
            return;
        const timing = performance.timing;
        const navigationStart = timing.navigationStart;
        setTimeout(() => {
            if (!this.navigationTiming) {
                this.navigationTiming = {
                    navigationStart,
                    domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
                    loadComplete: timing.loadEventEnd - navigationStart,
                };
                this.recordMetric('navigation.domContentLoaded', this.navigationTiming.domContentLoaded);
                this.recordMetric('navigation.loadComplete', this.navigationTiming.loadComplete);
            }
        }, 0);
    }
    /**
     * Record a performance metric
     */
    recordMetric(name, value, tags) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            tags,
        };
        this.metrics.push(metric);
        this.pruneMetrics();
    }
    /**
     * Record user interaction timing
     */
    recordUserInteraction(action, duration, context) {
        this.recordMetric(`interaction.${action}`, duration, {
            type: 'user-interaction',
            ...context,
        });
    }
    /**
     * Record API call timing
     */
    recordApiCall(endpoint, method, duration, status) {
        this.recordMetric('api.duration', duration, {
            endpoint,
            method,
            status: status.toString(),
            type: 'api-call',
        });
    }
    /**
     * Record component render timing
     */
    recordComponentRender(componentName, duration, props) {
        this.recordMetric('component.render', duration, {
            component: componentName,
            type: 'component-render',
            propsCount: props ? Object.keys(props).length.toString() : '0',
        });
    }
    /**
     * Create a performance timer
     */
    createTimer(name, tags) {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            this.recordMetric(name, duration, tags);
        };
    }
    /**
     * Get performance statistics
     */
    getStats() {
        // Web Vitals
        const webVitals = {
            fcp: this.getLatestMetricValue('fcp'),
            lcp: this.getLatestMetricValue('lcp'),
            fid: this.getLatestMetricValue('fid'),
            cls: this.getLatestMetricValue('cls'),
        };
        // Resource statistics
        const resourceStats = this.resourceTimings.reduce((acc, resource) => {
            if (!acc.byType[resource.type]) {
                acc.byType[resource.type] = { count: 0, totalSize: 0, averageDuration: 0 };
            }
            acc.byType[resource.type].count++;
            acc.byType[resource.type].totalSize += resource.size || 0;
            acc.byType[resource.type].averageDuration += resource.duration;
            return acc;
        }, {
            byType: {},
        });
        // Calculate averages
        Object.values(resourceStats.byType).forEach((stats) => {
            stats.averageDuration = stats.averageDuration / stats.count;
        });
        const totalResources = this.resourceTimings.length;
        const totalResourceSize = this.resourceTimings.reduce((sum, r) => sum + (r.size || 0), 0);
        const averageResourceDuration = totalResources > 0
            ? this.resourceTimings.reduce((sum, r) => sum + r.duration, 0) / totalResources
            : 0;
        // Interaction statistics
        const interactionMetrics = this.metrics.filter((m) => m.tags?.type === 'user-interaction');
        const totalInteractions = interactionMetrics.length;
        const averageInteractionDuration = totalInteractions > 0
            ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / totalInteractions
            : 0;
        // API call statistics
        const apiMetrics = this.metrics.filter((m) => m.tags?.type === 'api-call');
        const totalApiCalls = apiMetrics.length;
        const averageApiDuration = totalApiCalls > 0 ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / totalApiCalls : 0;
        const apiErrors = apiMetrics.filter((m) => {
            const status = parseInt(m.tags?.status || '200');
            return status >= 400;
        }).length;
        const apiErrorRate = totalApiCalls > 0 ? (apiErrors / totalApiCalls) * 100 : 0;
        return {
            navigation: this.navigationTiming,
            webVitals,
            resources: {
                total: totalResources,
                totalSize: totalResourceSize,
                averageDuration: averageResourceDuration,
                byType: resourceStats.byType,
            },
            interactions: {
                total: totalInteractions,
                averageDuration: averageInteractionDuration,
            },
            apiCalls: {
                total: totalApiCalls,
                averageDuration: averageApiDuration,
                errorRate: apiErrorRate,
            },
        };
    }
    /**
     * Get latest value for a specific metric
     */
    getLatestMetricValue(metricName) {
        const metric = this.metrics
            .filter((m) => m.name === metricName)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
        return metric?.value;
    }
    /**
     * Get metrics for a specific time range
     */
    getMetricsInRange(startTime, endTime, metricName) {
        return this.metrics.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime && (!metricName || m.name === metricName));
    }
    /**
     * Export all performance data
     */
    exportData() {
        return {
            metrics: this.metrics,
            navigation: this.navigationTiming,
            resources: this.resourceTimings,
            stats: this.getStats(),
        };
    }
    /**
     * Clear all performance data
     */
    clear() {
        this.metrics = [];
        this.resourceTimings = [];
        this.navigationTiming = null;
    }
    /**
     * Prune old metrics to prevent memory leaks
     */
    pruneMetrics() {
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }
    /**
     * Prune old resource timings
     */
    pruneResourceTimings() {
        if (this.resourceTimings.length > this.maxMetrics) {
            this.resourceTimings = this.resourceTimings.slice(-this.maxMetrics);
        }
    }
    /**
     * Destroy the service and clean up resources
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.clear();
    }
}
// Create singleton instance
export const performanceService = new PerformanceService();
// React hook for using performance service
export function usePerformanceMonitoring() {
    const recordMetric = (name, value, tags) => {
        performanceService.recordMetric(name, value, tags);
    };
    const recordUserInteraction = (action, duration, context) => {
        performanceService.recordUserInteraction(action, duration, context);
    };
    const recordComponentRender = (componentName, duration, props) => {
        performanceService.recordComponentRender(componentName, duration, props);
    };
    const createTimer = (name, tags) => {
        return performanceService.createTimer(name, tags);
    };
    const getStats = () => {
        return performanceService.getStats();
    };
    return {
        recordMetric,
        recordUserInteraction,
        recordComponentRender,
        createTimer,
        getStats,
    };
}
export default performanceService;
//# sourceMappingURL=performance.service.js.map