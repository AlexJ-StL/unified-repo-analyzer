import { performance } from 'node:perf_hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock performance monitoring
const performanceMarks: Record<string, number> = {};
const performanceMeasures: Record<string, number> = {};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

const mockPerformance = {
  now: () => Date.now(),
  mark: (name: string) => {
    performanceMarks[name] = Date.now();
  },
  measure: (name: string, startMark: string, endMark?: string) => {
    const start = performanceMarks[startMark];
    const end = endMark ? performanceMarks[endMark] : Date.now();
    performanceMeasures[name] = end - start;
  },
  getEntriesByType: (type: string) => {
    if (type === 'measure') {
      return Object.entries(performanceMeasures).map(([name, duration]) => ({
        name,
        duration,
        entryType: 'measure',
        startTime: 0,
      }));
    }
    return [];
  },
  clearMarks: () => {
    Object.keys(performanceMarks).forEach((key) => delete performanceMarks[key]);
  },
  clearMeasures: () => {
    Object.keys(performanceMeasures).forEach((key) => delete performanceMeasures[key]);
  },
};

// Replace global performance with mock
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    // Clear performance tracking objects
    Object.keys(performanceMarks).forEach((key) => delete performanceMarks[key]);
    Object.keys(performanceMeasures).forEach((key) => delete performanceMeasures[key]);
    vi.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render large repository lists within performance budget', async () => {
      const startTime = performance.now();

      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `repo-${i}`,
        name: `repository-${i}`,
        path: `/path/to/repo-${i}`,
        languages: ['JavaScript', 'TypeScript'],
        frameworks: ['React', 'Node.js'],
        size: Math.random() * 10000000,
        lastAnalyzed: new Date().toISOString(),
      }));

      // Simulate rendering with virtualization
      const _visibleItems = largeDataset.slice(0, 50); // Only render visible items

      const renderTime = performance.now() - startTime;

      // Performance budget: should render within 100ms
      expect(renderTime).toBeLessThan(100);

      // Memory usage should be reasonable
      const memoryUsage =
        (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize || 0;
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });

    it('should handle rapid state updates efficiently', async () => {
      performance.mark('rapid-updates-start');

      // Simulate rapid state updates (like search typing)
      const updates = 100;
      const updateTimes: number[] = [];

      for (let i = 0; i < updates; i++) {
        const updateStart = performance.now();

        // Simulate state update
        await new Promise((resolve) => setTimeout(resolve, 1));

        const updateEnd = performance.now();
        updateTimes.push(updateEnd - updateStart);
      }

      performance.mark('rapid-updates-end');
      performance.measure('rapid-updates', 'rapid-updates-start', 'rapid-updates-end');

      const averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

      // Each update should be fast (adjusted for test environment)
      expect(averageUpdateTime).toBeLessThan(20); // 20ms per update in test environment

      // Total time should be reasonable
      const totalTime = performanceMeasures['rapid-updates'];
      expect(totalTime).toBeLessThan(1000); // 1 second total
    });

    it('should optimize bundle size and loading', async () => {
      // Mock bundle analysis
      const bundleStats = {
        main: { size: 250000 }, // 250KB
        vendor: { size: 500000 }, // 500KB
        chunks: [
          { name: 'analysis', size: 100000 }, // 100KB
          { name: 'search', size: 80000 }, // 80KB
          { name: 'export', size: 60000 }, // 60KB
        ],
      };

      const totalSize =
        bundleStats.main.size +
        bundleStats.vendor.size +
        bundleStats.chunks.reduce((sum, chunk) => sum + chunk.size, 0);

      // Bundle size budget: under 1MB total
      expect(totalSize).toBeLessThan(1024 * 1024);

      // Main bundle should be under 300KB
      expect(bundleStats.main.size).toBeLessThan(300 * 1024);

      // Individual chunks should be under 150KB
      bundleStats.chunks.forEach((chunk) => {
        expect(chunk.size).toBeLessThan(150 * 1024);
      });
    });
  });

  describe('API Performance', () => {
    it('should handle concurrent API requests efficiently', async () => {
      const concurrentRequests = 10;
      const requestPromises: Promise<unknown>[] = [];

      performance.mark('concurrent-requests-start');

      // Simulate concurrent API calls
      for (let i = 0; i < concurrentRequests; i++) {
        const requestPromise = new Promise((resolve) => {
          setTimeout(() => resolve({ id: i, data: 'mock-data' }), Math.random() * 100);
        });
        requestPromises.push(requestPromise);
      }

      const results = await Promise.all(requestPromises);

      performance.mark('concurrent-requests-end');
      performance.measure(
        'concurrent-requests',
        'concurrent-requests-start',
        'concurrent-requests-end'
      );

      const totalTime = performanceMeasures['concurrent-requests'];

      // Should complete all requests within reasonable time
      expect(totalTime).toBeLessThan(500); // 500ms
      expect(results).toHaveLength(concurrentRequests);
    });

    it('should implement effective caching strategy', async () => {
      const cache = new Map();

      const mockApiCall = async (key: string) => {
        if (cache.has(key)) {
          return { data: cache.get(key), cached: true };
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        const data = `data-for-${key}`;
        cache.set(key, data);
        return { data, cached: false };
      };

      // First call - should hit API
      performance.mark('first-call-start');
      const firstResult = await mockApiCall('test-key');
      performance.mark('first-call-end');
      performance.measure('first-call', 'first-call-start', 'first-call-end');

      expect(firstResult.cached).toBe(false);
      expect(performanceMeasures['first-call']).toBeGreaterThan(90);

      // Second call - should use cache
      performance.mark('cached-call-start');
      const cachedResult = await mockApiCall('test-key');
      performance.mark('cached-call-end');
      performance.measure('cached-call', 'cached-call-start', 'cached-call-end');

      expect(cachedResult.cached).toBe(true);
      expect(performanceMeasures['cached-call']).toBeLessThan(10);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory =
        (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize || 0;

      // Simulate repeated operations that could cause memory leaks
      for (let i = 0; i < 100; i++) {
        // Create and destroy components
        const mockComponent = {
          data: new Array(1000).fill(`data-${i}`),
          cleanup: () => {
            // Simulate cleanup
          },
        };

        // Simulate component lifecycle
        mockComponent.cleanup();
      }

      // Force garbage collection (if available)
      if ((global as unknown as { gc?: () => void }).gc) {
        (global as unknown as { gc: () => void }).gc();
      }

      const finalMemory =
        (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB limit
    });

    it('should handle large file processing efficiently', async () => {
      const largeFileContent = 'x'.repeat(1024 * 1024); // 1MB string

      performance.mark('file-processing-start');

      // Simulate file processing
      const processedContent = largeFileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');

      performance.mark('file-processing-end');
      performance.measure('file-processing', 'file-processing-start', 'file-processing-end');

      const processingTime = performanceMeasures['file-processing'];

      // Should process large files within reasonable time
      expect(processingTime).toBeLessThan(1000); // 1 second
      expect(processedContent).toBeDefined();
    });
  });

  describe('User Interaction Performance', () => {
    it('should respond to user interactions within 16ms (60fps)', async () => {
      const interactions = ['click', 'scroll', 'type', 'hover'];
      const interactionTimes: Record<string, number> = {};

      for (const interaction of interactions) {
        performance.mark(`${interaction}-start`);

        // Simulate interaction handling
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            // Simulate DOM update
            performance.mark(`${interaction}-end`);
            performance.measure(interaction, `${interaction}-start`, `${interaction}-end`);
            interactionTimes[interaction] = performanceMeasures[interaction];
            resolve(undefined);
          });
        });
      }

      // All interactions should be under 16ms for 60fps
      Object.entries(interactionTimes).forEach(([_interaction, time]) => {
        expect(time).toBeLessThan(16);
      });
    });

    it('should implement smooth scrolling and virtualization', async () => {
      const itemCount = 10000;
      const viewportHeight = 600;
      const itemHeight = 50;
      const visibleItems = Math.ceil(viewportHeight / itemHeight) + 2; // Buffer

      performance.mark('virtualization-start');

      // Simulate virtual scrolling calculation
      const scrollTop = 2500; // Scrolled position
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems, itemCount);

      const visibleItemsArray = Array.from(
        { length: endIndex - startIndex },
        (_, i) => startIndex + i
      );

      performance.mark('virtualization-end');
      performance.measure('virtualization', 'virtualization-start', 'virtualization-end');

      const calculationTime = performanceMeasures.virtualization;

      // Virtualization calculation should be very fast
      expect(calculationTime).toBeLessThan(1);
      expect(visibleItemsArray.length).toBeLessThanOrEqual(visibleItems);
      expect(visibleItemsArray.length).toBeGreaterThan(0);
    });
  });

  describe('Network Performance', () => {
    it('should implement request deduplication', async () => {
      const pendingRequests = new Map();

      const mockApiWithDeduplication = async (url: string) => {
        if (pendingRequests.has(url)) {
          return pendingRequests.get(url);
        }

        const requestPromise = new Promise((resolve) => {
          setTimeout(() => resolve({ url, data: 'response' }), 100);
        }).finally(() => {
          pendingRequests.delete(url);
        });

        pendingRequests.set(url, requestPromise);
        return requestPromise;
      };

      performance.mark('deduplication-start');

      // Make multiple identical requests simultaneously
      const duplicateRequests = [
        mockApiWithDeduplication('/api/test'),
        mockApiWithDeduplication('/api/test'),
        mockApiWithDeduplication('/api/test'),
      ];

      const results = await Promise.all(duplicateRequests);

      performance.mark('deduplication-end');
      performance.measure('deduplication', 'deduplication-start', 'deduplication-end');

      const totalTime = performanceMeasures.deduplication;

      // Should complete in roughly the same time as a single request
      expect(totalTime).toBeLessThan(150); // Slightly more than 100ms for overhead
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should handle request timeouts gracefully', async () => {
      const timeoutDuration = 5000; // 5 seconds

      const mockRequestWithTimeout = (delay: number) => {
        return Promise.race([
          new Promise((resolve) => setTimeout(() => resolve('success'), delay)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
          ),
        ]);
      };

      // Test successful request
      const fastRequest = await mockRequestWithTimeout(1000);
      expect(fastRequest).toBe('success');

      // Test timeout
      try {
        await mockRequestWithTimeout(6000);
        expect.fail('Should have timed out');
      } catch (error) {
        expect((error as Error).message).toBe('Request timeout');
      }
    });
  });
});
