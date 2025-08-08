/**
 * End-to-end test setup and utilities
 */
import type { ChildProcess } from 'node:child_process';
import type { AnalysisResult, PerformanceStats } from './types';
export interface TestServer {
  process: ChildProcess;
  port: number;
  baseUrl: string;
  stop: () => Promise<void>;
}
export interface TestRepository {
  path: string;
  name: string;
  files: Record<string, string>;
  cleanup: () => Promise<void>;
}
/**
 * Start the backend server for testing
 */
export declare function startTestServer(port?: number): Promise<TestServer>;
/**
 * Create a test repository with specified files
 */
export declare function createTestRepository(
  name: string,
  files: Record<string, string>
): Promise<TestRepository>;
/**
 * Wait for analysis to complete
 */
export declare function waitForAnalysis(
  baseUrl: string,
  analysisId: string,
  timeout?: number
): Promise<AnalysisResult>;
/**
 * Sample test repositories for different scenarios
 */
export declare const TEST_REPOSITORIES: {
  simpleJavaScript: {
    'package.json': string;
    'index.js': string;
    'README.md': string;
  };
  reactTypeScript: {
    'package.json': string;
    'tsconfig.json': string;
    'src/App.tsx': string;
    'src/index.tsx': string;
    'README.md': string;
  };
  pythonProject: {
    'requirements.txt': string;
    'app.py': string;
    'utils.py': string;
    'README.md': string;
  };
};
/**
 * Performance test utilities
 */
export declare class PerformanceMonitor {
  private metrics;
  startTimer(name: string): () => number;
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
  } | null;
  getAllStats(): Record<string, PerformanceStats | null>;
}
