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
export declare class PerformanceService {
  private metrics;
  private navigationTiming;
  private resourceTimings;
  private observer;
  private readonly maxMetrics;
  constructor(maxMetrics?: number);
  /**
   * Initialize performance observer for Web Vitals
   */
  private initializePerformanceObserver;
  /**
   * Handle performance entries from the observer
   */
  private handlePerformanceEntry;
  /**
   * Handle navigation timing entries
   */
  private handleNavigationEntry;
  /**
   * Handle resource timing entries
   */
  private handleResourceEntry;
  /**
   * Handle paint timing entries
   */
  private handlePaintEntry;
  /**
   * Get resource type from URL
   */
  private getResourceType;
  /**
   * Collect navigation timing manually for older browsers
   */
  private collectNavigationTiming;
  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  /**
   * Record user interaction timing
   */
  recordUserInteraction(action: string, duration: number, context?: Record<string, string>): void;
  /**
   * Record API call timing
   */
  recordApiCall(endpoint: string, method: string, duration: number, status: number): void;
  /**
   * Record component render timing
   */
  recordComponentRender(componentName: string, duration: number, props?: Record<string, any>): void;
  /**
   * Create a performance timer
   */
  createTimer(name: string, tags?: Record<string, string>): () => void;
  /**
   * Get performance statistics
   */
  getStats(): {
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
      byType: Record<
        string,
        {
          count: number;
          totalSize: number;
          averageDuration: number;
        }
      >;
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
  };
  /**
   * Get latest value for a specific metric
   */
  private getLatestMetricValue;
  /**
   * Get metrics for a specific time range
   */
  getMetricsInRange(startTime: number, endTime: number, metricName?: string): PerformanceMetric[];
  /**
   * Export all performance data
   */
  exportData(): {
    metrics: PerformanceMetric[];
    navigation: NavigationTiming | null;
    resources: ResourceTiming[];
    stats: ReturnType<typeof this.getStats>;
  };
  /**
   * Clear all performance data
   */
  clear(): void;
  /**
   * Prune old metrics to prevent memory leaks
   */
  private pruneMetrics;
  /**
   * Prune old resource timings
   */
  private pruneResourceTimings;
  /**
   * Destroy the service and clean up resources
   */
  destroy(): void;
}
export declare const performanceService: PerformanceService;
export declare function usePerformanceMonitoring(): {
  recordMetric: (name: string, value: number, tags?: Record<string, string>) => void;
  recordUserInteraction: (
    action: string,
    duration: number,
    context?: Record<string, string>
  ) => void;
  recordComponentRender: (
    componentName: string,
    duration: number,
    props?: Record<string, any>
  ) => void;
  createTimer: (name: string, tags?: Record<string, string>) => () => void;
  getStats: () => {
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
      byType: Record<
        string,
        {
          count: number;
          totalSize: number;
          averageDuration: number;
        }
      >;
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
  };
};
export default performanceService;
