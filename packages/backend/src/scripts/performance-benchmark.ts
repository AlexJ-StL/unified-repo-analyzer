#!/usr/bin/env ts-node

/**
 * Performance benchmark script for the Unified Repository Analyzer
 */

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { promisify } from 'node:util';
import type {
  AnalysisOptions,
  BatchAnalysisResult,
  RepositoryAnalysis,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import { AnalysisEngine } from '../core/AnalysisEngine';
import { analysisCache } from '../services/cache.service';
import { deduplicationService } from '../services/deduplication.service';
import { metricsService } from '../services/metrics.service';
import { logger } from '../utils/logger';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);

interface BenchmarkResult {
  name: string;
  duration: number;
  operations: number;
  opsPerSecond: number;
  memoryUsage: {
    before: NodeJS.MemoryUsage;
    after: NodeJS.MemoryUsage;
    delta: number;
  };
  metadata?: Record<string, unknown>;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private analysisEngine: AnalysisEngine;

  constructor() {
    this.analysisEngine = new AnalysisEngine();
  }

  /**
   * Run a benchmark test
   */
  async runBenchmark(
    name: string,
    operation: () => Promise<void> | void,
    iterations = 1
  ): Promise<BenchmarkResult> {
    logger.info(`Starting benchmark: ${name}`);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const memoryBefore = process.memoryUsage();
    const startTime = performance.now();

    // Run the operation
    for (let i = 0; i < iterations; i++) {
      await operation();
    }

    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();

    const duration = endTime - startTime;
    const opsPerSecond = (iterations / duration) * 1000;
    const memoryDelta = memoryAfter.heapUsed - memoryBefore.heapUsed;

    const result: BenchmarkResult = {
      name,
      duration,
      operations: iterations,
      opsPerSecond,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryDelta,
      },
    };

    this.results.push(result);
    logger.info(`Benchmark completed: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      opsPerSecond: `${opsPerSecond.toFixed(0)} ops/sec`,
      memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
    });

    return result;
  }

  /**
   * Benchmark cache operations
   */
  async benchmarkCache(): Promise<void> {
    logger.info('Running cache benchmarks...');

    // Cache set operations
    await this.runBenchmark(
      'Cache Set Operations',
      () => {
        const key = `test-key-${Math.random()}`;
        const value = { data: 'test-data'.repeat(100) } as unknown as
          | RepositoryAnalysis
          | BatchAnalysisResult;
        analysisCache.set(key, value);
      },
      10000
    );

    // Set up data for get operations
    const testKeys: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const key = `get-test-key-${i}`;
      testKeys.push(key);
      analysisCache.set(key, { data: `test-data-${i}` } as unknown as
        | RepositoryAnalysis
        | BatchAnalysisResult);
    }

    // Cache get operations
    let keyIndex = 0;
    await this.runBenchmark(
      'Cache Get Operations',
      () => {
        const key = testKeys[keyIndex % testKeys.length];
        analysisCache.get(key);
        keyIndex++;
      },
      50000
    );

    // Cache invalidation patterns
    await this.runBenchmark(
      'Cache Pattern Invalidation',
      () => {
        analysisCache.invalidatePattern('test-pattern-*');
      },
      100
    );
  }

  /**
   * Benchmark metrics collection
   */
  async benchmarkMetrics(): Promise<void> {
    logger.info('Running metrics benchmarks...');

    // Metric recording
    await this.runBenchmark(
      'Metrics Recording',
      () => {
        metricsService.recordMetric(
          `test.metric.${Math.floor(Math.random() * 100)}`,
          Math.random() * 1000,
          { tag: 'benchmark' }
        );
      },
      50000
    );

    // Request metrics recording
    await this.runBenchmark(
      'Request Metrics Recording',
      () => {
        metricsService.recordRequestMetric('GET', 200, Math.random() * 100);
      },
      10000
    );

    // Analysis metrics recording
    await this.runBenchmark(
      'Analysis Metrics Recording',
      () => {
        metricsService.recordAnalysis(
          `/test/repo/${Math.floor(Math.random() * 10)}`,
          'standard',
          Math.random() * 1000,
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 1000000),
          Math.random() > 0.5,
          Math.random() > 0.8
        );
      },
      5000
    );
  }

  /**
   * Benchmark deduplication service
   */
  async benchmarkDeduplication(): Promise<void> {
    logger.info('Running deduplication benchmarks...');

    const testOptions: AnalysisOptions = {
      mode: 'standard',
      maxFiles: 100,
      maxLinesPerFile: 1000,
      includeLLMAnalysis: false,
      llmProvider: 'none',
      outputFormats: ['json'],
      includeTree: true,
    };

    // Concurrent request simulation
    const concurrentRequests = 100;
    const promises: Promise<string>[] = [];

    await this.runBenchmark(
      'Concurrent Request Deduplication',
      async () => {
        // Simulate concurrent identical requests
        for (let i = 0; i < concurrentRequests; i++) {
          const promise = deduplicationService.deduplicateAnalysis(
            '/test/repo/same',
            testOptions,
            async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              return `result-${Date.now()}`;
            }
          );
          promises.push(promise);
        }

        const results = await Promise.all(promises);

        // All results should be identical due to deduplication
        const uniqueResults = new Set(results);
        if (uniqueResults.size !== 1) {
          throw new Error(`Expected 1 unique result, got ${uniqueResults.size}`);
        }
      },
      1
    );
  }

  /**
   * Benchmark repository analysis
   */
  async benchmarkAnalysis(): Promise<void> {
    logger.info('Running analysis benchmarks...');

    // Create test repository
    const testRepoPath = path.join(__dirname, 'benchmark-test-repo');
    await this.createTestRepository(testRepoPath);

    try {
      const defaultOptions: AnalysisOptions = {
        mode: 'standard',
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: true,
      };

      // Single repository analysis (cold)
      analysisCache.clear();
      await this.runBenchmark(
        'Repository Analysis (Cold Cache)',
        async () => {
          await this.analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
        },
        1
      );

      // Single repository analysis (warm cache)
      await this.runBenchmark(
        'Repository Analysis (Warm Cache)',
        async () => {
          await this.analysisEngine.analyzeRepository(testRepoPath, defaultOptions);
        },
        10
      );

      // Batch analysis
      const batchPaths = [testRepoPath, testRepoPath, testRepoPath];
      await this.runBenchmark(
        'Batch Repository Analysis',
        async () => {
          await this.analysisEngine.analyzeMultipleRepositoriesWithQueue(
            batchPaths,
            defaultOptions,
            2
          );
        },
        1
      );
    } finally {
      // Clean up test repository
      try {
        await rmdir(testRepoPath, { recursive: true });
      } catch (error) {
        logger.warn('Failed to clean up test repository:', error);
      }
    }
  }

  /**
   * Create a test repository for benchmarking
   */
  private async createTestRepository(repoPath: string): Promise<void> {
    await mkdir(repoPath, { recursive: true });

    // Create package.json
    await writeFile(
      path.join(repoPath, 'package.json'),
      JSON.stringify(
        {
          name: 'benchmark-test-repo',
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

    // Create source files
    const srcPath = path.join(repoPath, 'src');
    await mkdir(srcPath, { recursive: true });

    // Create multiple files for realistic benchmarking
    for (let i = 0; i < 20; i++) {
      const fileName = `file${i}.js`;
      const filePath = path.join(srcPath, fileName);

      let content = `// File ${i}\n\n`;

      // Add functions
      for (let j = 0; j < 5; j++) {
        content += `
function function${i}_${j}() {
  const data = {
    id: ${j},
    name: 'Function ${i}_${j}',
    timestamp: Date.now(),
  };
  
  return data;
}
        `;
      }

      // Add a class
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

    // Create README
    await writeFile(
      path.join(repoPath, 'README.md'),
      `# Benchmark Test Repository

This is a test repository created for performance benchmarking.
      `
    );
  }

  /**
   * Generate benchmark report
   */
  generateReport(): string {
    const report = ['# Performance Benchmark Report', ''];
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`Node.js Version: ${process.version}`);
    report.push(`Platform: ${process.platform} ${process.arch}`);
    report.push('');

    // Summary table
    report.push('## Summary');
    report.push('');
    report.push('| Benchmark | Duration (ms) | Ops/sec | Memory Delta (MB) |');
    report.push('|-----------|---------------|---------|-------------------|');

    for (const result of this.results) {
      const memoryDeltaMB = (result.memoryUsage.delta / 1024 / 1024).toFixed(2);
      report.push(
        `| ${result.name} | ${result.duration.toFixed(2)} | ${result.opsPerSecond.toFixed(0)} | ${memoryDeltaMB} |`
      );
    }

    report.push('');

    // Detailed results
    report.push('## Detailed Results');
    report.push('');

    for (const result of this.results) {
      report.push(`### ${result.name}`);
      report.push('');
      report.push(`- **Duration**: ${result.duration.toFixed(2)}ms`);
      report.push(`- **Operations**: ${result.operations.toLocaleString()}`);
      report.push(`- **Operations per second**: ${result.opsPerSecond.toFixed(0)}`);
      report.push(
        `- **Memory usage before**: ${(result.memoryUsage.before.heapUsed / 1024 / 1024).toFixed(2)}MB`
      );
      report.push(
        `- **Memory usage after**: ${(result.memoryUsage.after.heapUsed / 1024 / 1024).toFixed(2)}MB`
      );
      report.push(`- **Memory delta**: ${(result.memoryUsage.delta / 1024 / 1024).toFixed(2)}MB`);
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Run all benchmarks
   */
  async runAllBenchmarks(): Promise<void> {
    logger.info('Starting comprehensive performance benchmarks...');

    try {
      await this.benchmarkCache();
      await this.benchmarkMetrics();
      await this.benchmarkDeduplication();
      await this.benchmarkAnalysis();

      // Generate and save report
      const report = this.generateReport();
      const reportPath = path.join(__dirname, '../../..', 'performance-report.md');
      await writeFile(reportPath, report);

      logger.info('Benchmarks completed successfully');
      logger.info(`Report saved to: ${reportPath}`);

      // Print summary to console
      console.log(`\n${report}`);
    } catch (error) {
      logger.error('Benchmark failed:', error);
      throw error;
    }
  }
}

// Run benchmarks if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark
    .runAllBenchmarks()
    .then(() => {
      logger.info('All benchmarks completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Benchmark suite failed:', error);
      process.exit(1);
    });
}

export { PerformanceBenchmark };
