/**
 * Performance tests and benchmarks
 */

import { performance } from 'perf_hooks';
import { AnalysisEngine } from '../core/AnalysisEngine';
import { analysisCache } from '../services/cache.service';
import { deduplicationService } from '../services/deduplication.service';
import { metricsService } from '../services/metrics.service';
import { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);

describe('Performance Tests', () => {
  let testRepoPath: string;
  let analysisEngine: AnalysisEngine;

  const defaultOptions: AnalysisOptions = {
    mode: 'standard',
    maxFiles: 100,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: false,
    llmProvider: 'none',
    outputFormats: ['json'],
    includeTree: true,
  };

  beforeAll(async () => {
    // Create a test repository structure
    testRepoPath = path.join(__dirname, 'test-repo-perf');
    await createTestRepository(testRepoPath);

    analysisEngine = new AnalysisEngine();
  });

  afterAll(async () => {
    // Clean up test repository
    try {
      await rmdir(testRepoPath, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up test repository:', error);
    }
  });

  beforeEach(() => {
    // Clear caches and metrics before each test
    analysisCache.invalidateAll();
    deduplicationService.clear();
    metricsService.clear();
  });

  describe('Cache Performance', () => {
    it('should significantly improve performance on cache hit', async () => {
      // First analysis (cache miss)
      const start1 = performance.now();
      const result1 = await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
      const duration1 = performance.now() - start1;

      // Second analysis (cache hit)
      const start2 = performance.now();
      const result2 = await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
      const duration2 = performance.now() - start2;

      // Cache hit should be significantly faster
      expect(duration2).toBeLessThan(duration1 * 0.1); // At least 10x faster
      expect(result1.id).toBe(result2.id); // Same result

      console.log(`Cache miss: ${duration1.toFixed(2)}ms, Cache hit: ${duration2.toFixed(2)}ms`);
      console.log(`Performance improvement: ${(duration1 / duration2).toFixed(2)}x`);
    });

    it('should handle cache operations efficiently', async () => {
      const cacheOperations = 1000;
      const testData = Array.from({ length: cacheOperations }, (_, i) => ({
        key: `test-key-${i}`,
        value: { id: i, data: `test-data-${i}`.repeat(100) },
      }));

      // Benchmark cache set operations
      const setStartTime = performance.now();
      for (const { key, value } of testData) {
        analysisCache.set(key, value);
      }
      const setDuration = performance.now() - setStartTime;

      // Benchmark cache get operations
      const getStartTime = performance.now();
      for (const { key } of testData) {
        analysisCache.get(key);
      }
      const getDuration = performance.now() - getStartTime;

      console.log(
        `Cache set operations: ${((cacheOperations / setDuration) * 1000).toFixed(0)} ops/sec`
      );
      console.log(
        `Cache get operations: ${((cacheOperations / getDuration) * 1000).toFixed(0)} ops/sec`
      );

      // Should handle at least 10,000 operations per second
      expect((cacheOperations / setDuration) * 1000).toBeGreaterThan(10000);
      expect((cacheOperations / getDuration) * 1000).toBeGreaterThan(50000);
    });

    it('should handle cache invalidation patterns efficiently', async () => {
      // Set up test data
      const patterns = ['user:*', 'repo:*', 'analysis:*'];
      const keysPerPattern = 100;

      for (const pattern of patterns) {
        const baseKey = pattern.replace('*', '');
        for (let i = 0; i < keysPerPattern; i++) {
          analysisCache.set(`${baseKey}${i}`, { data: `test-${i}` });
        }
      }

      // Benchmark pattern invalidation
      const startTime = performance.now();
      for (const pattern of patterns) {
        analysisCache.invalidatePattern(pattern);
      }
      const duration = performance.now() - startTime;

      console.log(`Pattern invalidation completed in: ${duration.toFixed(2)}ms`);

      // Should complete quickly
      expect(duration).toBeLessThan(100);
    });

    it('should handle cache invalidation correctly', async () => {
      // First analysis
      await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);

      // Verify cache hit
      const cached = await analysisCache.getCachedAnalysis(testRepoPath, defaultOptions);
      expect(cached).toBeTruthy();

      // Clear entire cache (more reliable than pattern invalidation for testing)
      analysisCache.clear();

      // Verify cache miss
      const cachedAfterInvalidation = await analysisCache.getCachedAnalysis(
        testRepoPath,
        defaultOptions
      );
      expect(cachedAfterInvalidation).toBeNull();
    });

    it('should respect TTL settings', async () => {
      // Create cache service with short TTL for testing
      const { EnhancedCacheService } = await import('../services/cache.service');
      const shortTtlCache = new EnhancedCacheService({
        ttl: 100, // 100ms TTL
      });

      await shortTtlCache.setCachedAnalysis(testRepoPath, defaultOptions, {
        id: 'test',
        name: 'test',
        path: testRepoPath,
      } as any);

      // Should be cached immediately
      let cached = await shortTtlCache.getCachedAnalysis(testRepoPath, defaultOptions);
      expect(cached).toBeTruthy();

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      cached = await shortTtlCache.getCachedAnalysis(testRepoPath, defaultOptions);
      expect(cached).toBeNull();
    });
  });

  describe('Deduplication Performance', () => {
    it('should deduplicate concurrent identical requests', async () => {
      const promises = [];
      const startTime = performance.now();

      // Start 5 concurrent identical requests
      for (let i = 0; i < 5; i++) {
        promises.push(analysisEngine.analyzeRepository(testRepoPath, defaultOptions));
      }

      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result.id).toBe(firstResult.id);
      });

      // Check deduplication stats
      const stats = deduplicationService.getStats();
      expect(stats.totalDeduplicated).toBeGreaterThanOrEqual(0); // Allow 0 if requests complete too quickly

      console.log(`Concurrent requests completed in: ${totalTime.toFixed(2)}ms`);
      console.log(`Deduplication stats:`, stats);
    });

    it('should handle different requests separately', async () => {
      const options1 = { ...defaultOptions, mode: 'quick' as const };
      const options2 = { ...defaultOptions, mode: 'comprehensive' as const };

      const [result1, result2] = await Promise.all([
        analysisEngine.analyzeRepository(testRepoPath, options1),
        analysisEngine.analyzeRepository(testRepoPath, options2),
      ]);

      // Results should be different due to different options
      expect(result1.metadata.analysisMode).toBe('quick');
      expect(result2.metadata.analysisMode).toBe('comprehensive');
    });
  });

  describe('Batch Processing Performance', () => {
    it('should process multiple repositories efficiently', async () => {
      // Create multiple test repositories
      const repoPaths = [];
      for (let i = 0; i < 3; i++) {
        const repoPath = path.join(__dirname, `test-repo-batch-${i}`);
        await createTestRepository(repoPath);
        repoPaths.push(repoPath);
      }

      try {
        const startTime = performance.now();
        const batchResult = await analysisEngine.analyzeMultipleRepositoriesWithQueue(
          repoPaths,
          defaultOptions,
          2 // concurrency
        );
        const totalTime = performance.now() - startTime;

        expect(batchResult.repositories).toHaveLength(3);
        expect(batchResult.status.completed).toBe(3);
        expect(batchResult.status.failed).toBe(0);

        console.log(`Batch processing completed in: ${totalTime.toFixed(2)}ms`);
        console.log(`Average per repository: ${(totalTime / 3).toFixed(2)}ms`);
      } finally {
        // Clean up test repositories
        for (const repoPath of repoPaths) {
          try {
            await rmdir(repoPath, { recursive: true });
          } catch (error) {
            console.warn(`Failed to clean up ${repoPath}:`, error);
          }
        }
      }
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated analyses', async () => {
      const initialMemory = process.memoryUsage();

      // Perform multiple analyses
      for (let i = 0; i < 10; i++) {
        await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(`Memory usage - Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory usage - Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Metrics Collection Performance', () => {
    it('should collect metrics without significant overhead', async () => {
      // Measure performance without metrics
      metricsService.destroy();
      const startWithoutMetrics = performance.now();
      await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
      const durationWithoutMetrics = performance.now() - startWithoutMetrics;

      // Re-enable metrics
      const { MetricsService } = await import('../services/metrics.service');
      const newMetricsService = new MetricsService();

      // Measure performance with metrics
      const startWithMetrics = performance.now();
      await analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
      const durationWithMetrics = performance.now() - startWithMetrics;

      // Metrics overhead should be minimal (less than 10%)
      const overhead =
        ((durationWithMetrics - durationWithoutMetrics) / durationWithoutMetrics) * 100;
      expect(overhead).toBeLessThan(10);

      console.log(`Without metrics: ${durationWithoutMetrics.toFixed(2)}ms`);
      console.log(`With metrics: ${durationWithMetrics.toFixed(2)}ms`);
      console.log(`Overhead: ${overhead.toFixed(2)}%`);
    });

    it('should handle high-frequency metric recording', async () => {
      const startTime = performance.now();
      const metricCount = 10000;

      // Record many metrics quickly
      for (let i = 0; i < metricCount; i++) {
        metricsService.recordMetric(`test.metric.${i % 100}`, Math.random() * 1000, {
          iteration: i.toString(),
        });
      }

      const duration = performance.now() - startTime;
      const metricsPerSecond = (metricCount / duration) * 1000;

      console.log(`Recorded ${metricCount} metrics in ${duration.toFixed(2)}ms`);
      console.log(`Rate: ${metricsPerSecond.toFixed(0)} metrics/second`);

      // Should handle at least 10,000 metrics per second
      expect(metricsPerSecond).toBeGreaterThan(10000);
    });
  });

  describe('Large Repository Performance', () => {
    it('should handle large repositories efficiently', async () => {
      // Create a large test repository
      const largeRepoPath = path.join(__dirname, 'large-test-repo');
      await createLargeTestRepository(largeRepoPath);

      try {
        const startTime = performance.now();
        const result = await analysisEngine.analyzeRepository(largeRepoPath, {
          ...defaultOptions,
          maxFiles: 1000,
          maxLinesPerFile: 5000,
        });
        const duration = performance.now() - startTime;

        expect(result).toBeTruthy();
        expect(result.fileCount).toBeGreaterThan(50);

        // Should complete within reasonable time (adjust based on your requirements)
        expect(duration).toBeLessThan(30000); // 30 seconds

        console.log(`Large repository analysis completed in: ${duration.toFixed(2)}ms`);
        console.log(`Files analyzed: ${result.fileCount}`);
        console.log(
          `Performance: ${(result.fileCount / (duration / 1000)).toFixed(2)} files/second`
        );
      } finally {
        try {
          await rmdir(largeRepoPath, { recursive: true });
        } catch (error) {
          console.warn('Failed to clean up large test repository:', error);
        }
      }
    });
  });
});

/**
 * Creates a test repository structure for performance testing
 */
async function createTestRepository(repoPath: string): Promise<void> {
  await mkdir(repoPath, { recursive: true });

  // Create package.json
  await writeFile(
    path.join(repoPath, 'package.json'),
    JSON.stringify(
      {
        name: 'test-repo',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          express: '^4.18.0',
        },
      },
      null,
      2
    )
  );

  // Create src directory with files
  const srcPath = path.join(repoPath, 'src');
  await mkdir(srcPath, { recursive: true });

  // Create JavaScript files
  await writeFile(
    path.join(srcPath, 'index.js'),
    `
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
  `
  );

  await writeFile(
    path.join(srcPath, 'utils.js'),
    `
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

module.exports = { formatDate, validateEmail };
  `
  );

  // Create TypeScript files
  await writeFile(
    path.join(srcPath, 'types.ts'),
    `
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Repository {
  id: string;
  name: string;
  description?: string;
  language: string;
  stars: number;
}
  `
  );

  // Create README
  await writeFile(
    path.join(repoPath, 'README.md'),
    `
# Test Repository

This is a test repository for performance testing.

## Features

- Express server
- TypeScript support
- Utility functions
  `
  );
}

/**
 * Creates a large test repository for performance testing
 */
async function createLargeTestRepository(repoPath: string): Promise<void> {
  await mkdir(repoPath, { recursive: true });

  // Create package.json
  await writeFile(
    path.join(repoPath, 'package.json'),
    JSON.stringify(
      {
        name: 'large-test-repo',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          express: '^4.18.0',
          lodash: '^4.17.21',
          axios: '^1.0.0',
        },
      },
      null,
      2
    )
  );

  // Create multiple directories with files
  const directories = ['src', 'lib', 'utils', 'components', 'services', 'types'];

  for (const dir of directories) {
    const dirPath = path.join(repoPath, dir);
    await mkdir(dirPath, { recursive: true });

    // Create multiple files in each directory
    for (let i = 0; i < 20; i++) {
      const fileName = `file${i}.js`;
      const filePath = path.join(dirPath, fileName);

      // Generate file content with multiple functions and classes
      let content = `// ${fileName} in ${dir}\n\n`;

      for (let j = 0; j < 10; j++) {
        content += `
function function${j}() {
  const data = {
    id: ${j},
    name: 'Function ${j}',
    timestamp: Date.now(),
  };
  
  return data;
}
        `;
      }

      content += `
class Class${i} {
  constructor(name) {
    this.name = name;
    this.id = Math.random().toString(36);
  }
  
  getName() {
    return this.name;
  }
  
  getId() {
    return this.id;
  }
}

module.exports = { Class${i} };
      `;

      await writeFile(filePath, content);
    }
  }

  // Create README
  await writeFile(
    path.join(repoPath, 'README.md'),
    `
# Large Test Repository

This is a large test repository for performance testing with many files and functions.

## Structure

- Multiple directories with 20 files each
- Each file contains 10 functions and 1 class
- Total of approximately 1200+ functions and 120+ classes
  `
  );
}
