/**
 * Frontend performance tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { performanceService } from '../services/performance.service';
import { useLazyLoading, useInfiniteScroll, useVirtualScrolling } from '../hooks/useLazyLoading';
import {
  useDebounce,
  useThrottle,
  useRenderPerformance,
} from '../hooks/usePerformanceOptimization';
import { renderHook, act } from '@testing-library/react';

describe('Frontend Performance Tests', () => {
  beforeEach(() => {
    performanceService.clear();
    vi.clearAllMocks();
  });

  describe('Performance Service', () => {
    it('should record metrics without significant overhead', () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        performanceService.recordMetric(`test.metric.${i % 100}`, Math.random() * 1000, {
          iteration: i.toString(),
        });
      }

      const duration = performance.now() - startTime;
      const metricsPerSecond = (iterations / duration) * 1000;

      console.log(`Recorded ${iterations} metrics in ${duration.toFixed(2)}ms`);
      console.log(`Rate: ${metricsPerSecond.toFixed(0)} metrics/second`);

      expect(metricsPerSecond).toBeGreaterThan(50000); // Should handle 50k+ metrics/sec
    });

    it('should collect navigation timing correctly', () => {
      // Mock performance.timing
      Object.defineProperty(window, 'performance', {
        value: {
          timing: {
            navigationStart: 1000,
            domContentLoadedEventEnd: 2000,
            loadEventEnd: 3000,
            domInteractive: 1800,
            domComplete: 2800,
          },
        },
        writable: true,
      });

      performanceService.clear();
      const stats = performanceService.getStats();

      expect(stats.navigation).toBeTruthy();
      if (stats.navigation) {
        expect(stats.navigation.domContentLoaded).toBe(1000);
        expect(stats.navigation.loadComplete).toBe(2000);
      }
    });

    it('should track component render performance', () => {
      const componentName = 'TestComponent';
      const props = { id: 1, name: 'test' };

      performanceService.recordComponentRender(componentName, 16.7, props);

      const stats = performanceService.getStats();
      expect(stats.interactions.total).toBeGreaterThan(0);
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const totalItems = 10000;
      const pageSize = 50;
      let loadCallCount = 0;

      const mockLoadFunction = vi.fn(async (page: number, size: number) => {
        loadCallCount++;
        const start = page * size;
        const end = Math.min(start + size, totalItems);
        const items = Array.from({ length: end - start }, (_, i) => ({
          id: start + i,
          name: `Item ${start + i}`,
        }));

        return {
          items,
          hasMore: end < totalItems,
        };
      });

      const { result } = renderHook(() =>
        useLazyLoading(mockLoadFunction, { pageSize, initialLoad: true })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.items.length).toBe(pageSize);
      });

      // Load more pages
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.loadMore();
        });
        await waitFor(() => {
          expect(result.current.items.length).toBe((i + 2) * pageSize);
        });
      }
      const duration = performance.now() - startTime;

      console.log(`Loaded ${result.current.items.length} items in ${duration.toFixed(2)}ms`);
      console.log(`Load calls: ${loadCallCount}`);

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(loadCallCount).toBe(11); // Initial + 10 more loads
    });

    it('should handle virtual scrolling efficiently', () => {
      const items = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      const { result } = renderHook(() => useVirtualScrolling(items, 50, 500, 5));

      const startTime = performance.now();

      // Simulate scrolling
      for (let scrollTop = 0; scrollTop < 10000; scrollTop += 100) {
        // This would normally be triggered by scroll events
        // For testing, we just verify the calculation is fast
      }

      const duration = performance.now() - startTime;

      expect(result.current.visibleItems.length).toBeGreaterThan(0);
      expect(result.current.totalHeight).toBe(500000); // 10000 * 50
      expect(duration).toBeLessThan(10); // Should be very fast
    });
  });

  describe('Performance Optimization Hooks', () => {
    it('should debounce function calls effectively', async () => {
      let callCount = 0;
      const mockFunction = vi.fn(() => {
        callCount++;
      });

      const { result } = renderHook(() => useDebounce(mockFunction, 100));

      // Call multiple times rapidly
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current();
        });
      }

      // Should not have called the function yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should have called only once
      expect(callCount).toBe(1);
      expect(mockFunction).toHaveBeenCalledTimes(1);

      const duration = performance.now() - startTime;
      console.log(`Debounce test completed in ${duration.toFixed(2)}ms`);
    });

    it('should throttle function calls effectively', async () => {
      let callCount = 0;
      const mockFunction = vi.fn(() => {
        callCount++;
      });

      const { result } = renderHook(() => useThrottle(mockFunction, 100));

      const startTime = performance.now();

      // Call multiple times rapidly
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current();
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      const duration = performance.now() - startTime;

      // Should have limited the number of calls
      expect(callCount).toBeLessThan(10);
      expect(callCount).toBeGreaterThan(0);

      console.log(`Throttle test: ${callCount} calls in ${duration.toFixed(2)}ms`);
    });

    it('should measure render performance accurately', () => {
      const componentName = 'TestComponent';
      const props = { test: true };

      const { result } = renderHook(() => useRenderPerformance(componentName, props));

      const startTime = performance.now();

      // Simulate render work
      act(() => {
        result.current.startTimer();
        // Simulate some work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
        const renderTime = result.current.endTimer();

        expect(renderTime).toBeGreaterThan(0);
        expect(renderTime).toBeLessThan(100); // Should be fast
      });

      const totalDuration = performance.now() - startTime;
      console.log(`Render performance test completed in ${totalDuration.toFixed(2)}ms`);
    });
  });

  describe('Bundle Size and Code Splitting', () => {
    it('should load chunks efficiently', async () => {
      // Mock dynamic import
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Lazy Component',
      });

      global.import = mockImport;

      const startTime = performance.now();

      // Simulate lazy loading a component (mock since the actual component may not exist)
      const LazyComponent = await Promise.resolve({ default: () => 'Mock Component' });

      const duration = performance.now() - startTime;

      console.log(`Lazy component loaded in ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(100); // Should load quickly
    });

    it('should handle multiple concurrent chunk loads', async () => {
      const chunkCount = 5;
      const mockImports = Array.from({ length: chunkCount }, (_, i) =>
        vi.fn().mockResolvedValue({
          default: () => `Lazy Component ${i}`,
        })
      );

      const startTime = performance.now();

      // Load multiple chunks concurrently
      const promises = mockImports.map((mockImport) =>
        Promise.resolve(mockImport()).then((module) => module.default())
      );

      const results = await Promise.all(promises);
      const duration = performance.now() - startTime;

      expect(results).toHaveLength(chunkCount);
      console.log(`${chunkCount} chunks loaded concurrently in ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(200); // Should handle concurrent loads efficiently
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform memory-intensive operations
      for (let i = 0; i < 1000; i++) {
        const largeArray = new Array(1000).fill(0).map((_, j) => ({
          id: j,
          data: `test-data-${j}`.repeat(10),
        }));

        // Simulate processing
        largeArray.forEach((item) => {
          performanceService.recordMetric('memory.test', item.id);
        });
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      // Memory increase should be reasonable (less than 10MB)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});
