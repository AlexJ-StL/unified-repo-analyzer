/**
 * Request deduplication service for concurrent identical requests
 */
import { AnalysisOptions } from '@unified-repo-analyzer/shared/src/types/analysis';
/**
 * Service for deduplicating concurrent identical requests
 */
export declare class DeduplicationService {
  private pendingAnalysis;
  private pendingBatch;
  private readonly cleanupInterval;
  private readonly maxAge;
  constructor(maxAge?: number);
  /**
   * Generates a unique key for analysis request
   */
  private generateAnalysisKey;
  /**
   * Generates a unique key for batch analysis request
   */
  private generateBatchKey;
  /**
   * Deduplicates analysis requests
   */
  deduplicateAnalysis<T>(
    repoPath: string,
    options: AnalysisOptions,
    executor: () => Promise<T>
  ): Promise<T>;
  /**
   * Deduplicates batch analysis requests
   */
  deduplicateBatch<T>(
    repoPaths: string[],
    options: AnalysisOptions,
    executor: () => Promise<T>
  ): Promise<T>;
  /**
   * Gets statistics about pending requests
   */
  getStats(): {
    pendingAnalysis: number;
    pendingBatch: number;
    totalDeduplicated: number;
  };
  /**
   * Cleans up expired pending requests
   */
  private cleanup;
  /**
   * Manually clears all pending requests
   */
  clear(): void;
  /**
   * Destroys the service and cleans up resources
   */
  destroy(): void;
}
export declare const deduplicationService: DeduplicationService;
export default deduplicationService;
