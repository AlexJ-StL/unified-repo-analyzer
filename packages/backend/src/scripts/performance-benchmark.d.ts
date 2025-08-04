#!/usr/bin/env ts-node
/**
 * Performance benchmark script for the Unified Repository Analyzer
 */
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
  metadata?: Record<string, any>;
}
declare class PerformanceBenchmark {
  private results;
  private analysisEngine;
  constructor();
  /**
   * Run a benchmark test
   */
  runBenchmark(
    name: string,
    operation: () => Promise<void> | void,
    iterations?: number
  ): Promise<BenchmarkResult>;
  /**
   * Benchmark cache operations
   */
  benchmarkCache(): Promise<void>;
  /**
   * Benchmark metrics collection
   */
  benchmarkMetrics(): Promise<void>;
  /**
   * Benchmark deduplication service
   */
  benchmarkDeduplication(): Promise<void>;
  /**
   * Benchmark repository analysis
   */
  benchmarkAnalysis(): Promise<void>;
  /**
   * Create a test repository for benchmarking
   */
  private createTestRepository;
  /**
   * Generate benchmark report
   */
  generateReport(): string;
  /**
   * Run all benchmarks
   */
  runAllBenchmarks(): Promise<void>;
}
export { PerformanceBenchmark };
