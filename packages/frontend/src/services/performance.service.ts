/**
 * Frontend performance monitoring service
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface NavigationTiming {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

/**
 * Service for monitoring frontend performance metrics
 */
export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private navigationTiming: NavigationTiming | null = null;
  private resourceTimings: ResourceTiming[] = [];
  private observer: PerformanceObserver | null = null;
  private readonly maxMetrics: number;

  constructor(maxMetrics: number = 1000) {
    this.maxMetrics = maxMetrics;
    this.initializePerformanceObserver();
    this.collectNavigationTiming();
  }

  /**
   * Initialize performance observer for Web Vitals
   */
  private initializePerformanceObserver(): void {
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
        } catch {
          // Some entry types might not be supported
          console.debug(`Performance entry type ${entryType} not supported`);
        }
      }
    } catch (error) {
      console.error('Error initializing performance observer:', error);
    }
  }

  /**
   * Handle performance entries from the observer
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.handleResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry);
        break;
      case 'largest-contentful-paint':
        this.recordMetric('lcp', entry.startTime, { type: 'web-vital' });
        break;
      case 'first-input':
        this.recordMetric('fid', (entry as any).processingStart - entry.startTime, {
          type: 'web-vital',
        });
        break;
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.recordMetric('cls', (entry as any).value, { type: 'web-vital' });
        }
        break;
    }
  }

  /**
   * Handle navigation timing entries
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
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
  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    const resourceTiming: ResourceTiming = {
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
  private handlePaintEntry(entry: PerformanceEntry): void {
    if (entry.name === 'first-paint') {
      this.recordMetric('fp', entry.startTime, { type: 'web-vital' });
      if (this.navigationTiming) {
        this.navigationTiming.firstPaint = entry.startTime;
      }
    } else if (entry.name === 'first-contentful-paint') {
      this.recordMetric('fcp', entry.startTime, { type: 'web-vital' });
      if (this.navigationTiming) {
        this.navigationTiming.firstContentfulPaint = entry.startTime;
      }
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Collect navigation timing manually for older browsers
   */
  private collectNavigationTiming(): void {
    if (!performance.timing) return;

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
   * Record user interaction timing
   */
  public recordUserInteraction(
    action: string,
    duration: number,
    context?: Record<string, string>
  ): void {
    this.recordMetric(`interaction.${action}`, duration, {
      type: 'user-interaction',
      ...context,
    });
  }

  /**
   * Record API call timing
   */
  public recordApiCall(endpoint: string, method: string, duration: number, status: number): void {
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
  public recordComponentRender(
    componentName: string,
    duration: number,
    props?: Record<string, any>
  ): void {
    this.recordMetric('component.render', duration, {
      component: componentName,
      type: 'component-render',
      propsCount: props ? Object.keys(props).length.toString() : '0',
    });
  }

  /**
   * Create a performance timer
   */
  public createTimer(name: string, tags?: Record<string, string>): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, tags);
    };
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    navigation: NavigationTiming | null;
    webVitals: {
      fcp?: number;
      lcp?: number;
      fid?: number;
      cls?: number;
    };
    resources: {
      total: number;
      totalSize: number;
      averageDuration: number;
      byType: Record<string, { count: number; totalSize: number; averageDuration: number }>;
    };
    interactions: {
      total: number;
      averageDuration: number;
    };
    apiCalls: {
      total: number;
      averageDuration: number;
      errorRate: number;
    };
  } {
    // Web Vitals
    const webVitals = {
      fcp: this.getLatestMetricValue('fcp'),
      lcp: this.getLatestMetricValue('lcp'),
      fid: this.getLatestMetricValue('fid'),
      cls: this.getLatestMetricValue('cls'),
    };

    // Resource statistics
    const resourceStats = this.resourceTimings.reduce(
      (acc, resource) => {
        if (!acc.byType[resource.type]) {
          acc.byType[resource.type] = { count: 0, totalSize: 0, averageDuration: 0 };
        }

        acc.byType[resource.type].count++;
        acc.byType[resource.type].totalSize += resource.size || 0;
        acc.byType[resource.type].averageDuration += resource.duration;

        return acc;
      },
      {
        byType: {} as Record<string, { count: number; totalSize: number; averageDuration: number }>,
      }
    );

    // Calculate averages
    Object.values(resourceStats.byType).forEach((stats) => {
      stats.averageDuration = stats.averageDuration / stats.count;
    });

    const totalResources = this.resourceTimings.length;
    const totalResourceSize = this.resourceTimings.reduce((sum, r) => sum + (r.size || 0), 0);
    const averageResourceDuration =
      totalResources > 0
        ? this.resourceTimings.reduce((sum, r) => sum + r.duration, 0) / totalResources
        : 0;

    // Interaction statistics
    const interactionMetrics = this.metrics.filter((m) => m.tags?.type === 'user-interaction');
    const totalInteractions = interactionMetrics.length;
    const averageInteractionDuration =
      totalInteractions > 0
        ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / totalInteractions
        : 0;

    // API call statistics
    const apiMetrics = this.metrics.filter((m) => m.tags?.type === 'api-call');
    const totalApiCalls = apiMetrics.length;
    const averageApiDuration =
      totalApiCalls > 0 ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / totalApiCalls : 0;
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
  private getLatestMetricValue(metricName: string): number | undefined {
    const metric = this.metrics
      .filter((m) => m.name === metricName)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return metric?.value;
  }

  /**
   * Get metrics for a specific time range
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
   * Export all performance data
   */
  public exportData(): {
    metrics: PerformanceMetric[];
    navigation: NavigationTiming | null;
    resources: ResourceTiming[];
    stats: ReturnType<typeof this.getStats>;
  } {
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
  public clear(): void {
    this.metrics = [];
    this.resourceTimings = [];
    this.navigationTiming = null;
  }

  /**
   * Prune old metrics to prevent memory leaks
   */
  private pruneMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Prune old resource timings
   */
  private pruneResourceTimings(): void {
    if (this.resourceTimings.length > this.maxMetrics) {
      this.resourceTimings = this.resourceTimings.slice(-this.maxMetrics);
    }
  }

  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
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
  const recordMetric = (name: string, value: number, tags?: Record<string, string>) => {
    performanceService.recordMetric(name, value, tags);
  };

  const recordUserInteraction = (
    action: string,
    duration: number,
    context?: Record<string, string>
  ) => {
    performanceService.recordUserInteraction(action, duration, context);
  };

  const recordComponentRender = (
    componentName: string,
    duration: number,
    props?: Record<string, any>
  ) => {
    performanceService.recordComponentRender(componentName, duration, props);
  };

  const createTimer = (name: string, tags?: Record<string, string>) => {
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
