import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PerformanceMonitor } from '../performance-monitor.service.js';

// Mock the logger service
vi.mock('../logger.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logger.service')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      enabled: true,
      sampleRate: 1.0,
      resourceMonitoringInterval: 100, // Fast for testing
    });
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('Operation Timing', () => {
    it('should track operation timing', async () => {
      const operationId = 'test-op-1';
      const operationName = 'test-operation';

      monitor.startOperation(operationId, operationName, { test: 'metadata' });

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 50));

      const timing = monitor.endOperation(operationId, true);

      expect(timing).toBeDefined();
      expect(timing?.operation).toBe(operationName);
      expect(timing?.duration).toBeGreaterThan(40);
      expect(timing?.success).toBe(true);
      expect(timing?.metadata).toEqual({
        operation: operationName,
        test: 'metadata',
      });
    });

    it('should handle failed operations', async () => {
      const operationId = 'test-op-2';
      const operationName = 'failing-operation';

      monitor.startOperation(operationId, operationName);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const timing = monitor.endOperation(operationId, false, 'Test error');

      expect(timing).toBeDefined();
      expect(timing?.success).toBe(false);
      expect(timing?.error).toBe('Test error');
    });

    it('should return null for unknown operations', () => {
      const timing = monitor.endOperation('unknown-op', true);
      expect(timing).toBeNull();
    });
  });

  describe('Metrics Recording', () => {
    it('should record custom metrics', () => {
      monitor.recordMetric('test.metric', 42, 'count', { tag: 'value' }, { extra: 'data' });

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test.metric');
      expect(metrics[0].value).toBe(42);
      expect(metrics[0].unit).toBe('count');
      expect(metrics[0].tags).toEqual({ tag: 'value' });
      expect(metrics[0].metadata).toEqual({ extra: 'data' });
    });

    it('should filter metrics by time window', async () => {
      monitor.recordMetric('old.metric', 1, 'count');

      await new Promise((resolve) => setTimeout(resolve, 50));

      monitor.recordMetric('new.metric', 2, 'count');

      const allMetrics = monitor.getMetrics();
      expect(allMetrics).toHaveLength(2);

      const recentMetrics = monitor.getMetrics(25); // Last 25ms
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0].name).toBe('new.metric');
    });
  });

  describe('Resource Usage', () => {
    it('should capture current resource usage', async () => {
      const usage = await monitor.getCurrentResourceUsage();

      expect(usage.timestamp).toBeGreaterThan(0);
      expect(usage.memory.used).toBeGreaterThan(0);
      expect(usage.memory.total).toBeGreaterThan(0);
      expect(usage.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(usage.memory.percentage).toBeLessThanOrEqual(100);
      expect(usage.cpu.percentage).toBeGreaterThanOrEqual(0);
      expect(usage.eventLoop.delay).toBeGreaterThanOrEqual(0);
    });

    it('should track resource usage history', async () => {
      // Wait for a few resource monitoring cycles
      await new Promise((resolve) => setTimeout(resolve, 250));

      const history = monitor.getResourceHistory();
      expect(history.length).toBeGreaterThan(0);

      // Check that entries are properly structured
      const latest = history[history.length - 1];
      expect(latest.memory.used).toBeGreaterThan(0);
      expect(latest.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Performance Statistics', () => {
    it('should calculate operation statistics', async () => {
      const operationName = 'test-stats-op';

      // Record multiple operations with different durations
      for (let i = 0; i < 10; i++) {
        const opId = `op-${i}`;
        monitor.startOperation(opId, operationName);
        await new Promise((resolve) => setTimeout(resolve, 10 + i * 2)); // 10-28ms
        monitor.endOperation(opId, true);
      }

      const stats = monitor.getOperationStats(operationName);

      expect(stats.count).toBe(10);
      expect(stats.averageDuration).toBeGreaterThan(10);
      expect(stats.averageDuration).toBeLessThan(50);
      expect(stats.minDuration).toBeGreaterThan(5);
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration);
      expect(stats.successRate).toBe(1.0);
      expect(stats.p95Duration).toBeGreaterThan(0);
      expect(stats.p99Duration).toBeGreaterThan(0);
    });

    it('should handle empty statistics', () => {
      const stats = monitor.getOperationStats('non-existent-operation');

      expect(stats.count).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.successRate).toBe(0);
    });
  });

  describe('Performance Baselines', () => {
    it('should create and update baselines', async () => {
      const operationName = 'baseline-test';

      // Record several operations
      for (let i = 0; i < 5; i++) {
        const opId = `baseline-op-${i}`;
        monitor.startOperation(opId, operationName);
        await new Promise((resolve) => setTimeout(resolve, 20));
        monitor.endOperation(opId, true);
      }

      const baselines = monitor.getBaselines();
      const baseline = baselines.find((b) => b.operation === operationName);

      expect(baseline).toBeDefined();
      expect(baseline?.sampleCount).toBe(5);
      expect(baseline?.averageDuration).toBeGreaterThan(15);
      expect(baseline?.averageDuration).toBeLessThan(30);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions', async () => {
      const operationName = 'regression-test';
      let regressionDetected = false;

      monitor.on('performanceRegression', (data) => {
        if (data.operation === operationName) {
          regressionDetected = true;
        }
      });

      // Establish baseline with fast operations
      for (let i = 0; i < 15; i++) {
        const opId = `fast-op-${i}`;
        monitor.startOperation(opId, operationName);
        await new Promise((resolve) => setTimeout(resolve, 5));
        monitor.endOperation(opId, true);
      }

      // Simulate a slow operation (regression)
      const slowOpId = 'slow-op';
      monitor.startOperation(slowOpId, operationName);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Much slower
      monitor.endOperation(slowOpId, true);

      // Give some time for regression detection
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(regressionDetected).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should respect sample rate', () => {
      const lowSampleMonitor = new PerformanceMonitor({
        enabled: true,
        sampleRate: 0.0, // Never sample
      });

      lowSampleMonitor.startOperation('test-op', 'test');
      const timing = lowSampleMonitor.endOperation('test-op', true);

      expect(timing).toBeNull();

      lowSampleMonitor.destroy();
    });

    it('should disable monitoring when configured', () => {
      const disabledMonitor = new PerformanceMonitor({
        enabled: false,
      });

      disabledMonitor.recordMetric('test', 1, 'count');
      disabledMonitor.startOperation('test-op', 'test');
      const timing = disabledMonitor.endOperation('test-op', true);

      expect(disabledMonitor.getMetrics()).toHaveLength(0);
      expect(timing).toBeNull();

      disabledMonitor.destroy();
    });

    it('should update configuration', () => {
      monitor.updateConfig({ sampleRate: 0.5 });
      const config = monitor.getConfig();

      expect(config.sampleRate).toBe(0.5);
    });
  });

  describe('Performance Report', () => {
    it('should generate comprehensive performance report', async () => {
      // Record some operations and metrics
      monitor.recordMetric('test.metric', 100, 'count');

      const opId = 'report-test';
      monitor.startOperation(opId, 'report-operation');
      await new Promise((resolve) => setTimeout(resolve, 20));
      monitor.endOperation(opId, true);

      // Wait for resource monitoring
      await new Promise((resolve) => setTimeout(resolve, 150));

      const report = monitor.generateReport(60000); // Last minute

      expect(report.summary).toBeDefined();
      expect(report.summary.totalOperations).toBeGreaterThan(0);
      expect(report.summary.averageResponseTime).toBeGreaterThan(0);
      expect(report.summary.successRate).toBeGreaterThan(0);

      expect(report.operations).toHaveLength(1);
      expect(report.operations[0].name).toBe('report-operation');

      expect(report.resourceUsage.current).toBeDefined();
      expect(report.resourceUsage.average).toBeDefined();
      expect(report.alerts).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should limit metrics history', () => {
      const limitedMonitor = new PerformanceMonitor({
        enabled: true,
        maxMetricsHistory: 5,
      });

      // Record more metrics than the limit
      for (let i = 0; i < 10; i++) {
        limitedMonitor.recordMetric(`metric-${i}`, i, 'count');
      }

      const metrics = limitedMonitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(5);

      limitedMonitor.destroy();
    });

    it('should clear all data', async () => {
      monitor.recordMetric('test', 1, 'count');
      monitor.startOperation('test-op', 'test');
      monitor.endOperation('test-op', true);

      await new Promise((resolve) => setTimeout(resolve, 150));

      monitor.clearData();

      expect(monitor.getMetrics()).toHaveLength(0);
      expect(monitor.getResourceHistory()).toHaveLength(0);
      expect(monitor.getBaselines()).toHaveLength(0);
    });
  });
});
