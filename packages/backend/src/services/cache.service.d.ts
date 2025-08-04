import {
  AnalysisOptions,
  RepositoryAnalysis,
  BatchAnalysisResult,
} from '@unified-repo-analyzer/shared/src/types/analysis';
export interface CacheOptions {
  ttl?: number;
  max?: number;
  updateAgeOnGet?: boolean;
  updateAgeOnHas?: boolean;
}
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  key: string;
}
export declare class CacheService<T = any> {
  private cache;
  private defaultTTL;
  constructor(options?: CacheOptions);
  /**
   * Generate a cache key from various inputs
   */
  generateKey(...inputs: any[]): string;
  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number): void;
  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined;
  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean;
  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean;
  /**
   * Clear all cache entries
   */
  clear(): void;
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    max: number;
    ttl: number;
    calculatedSize: number;
    hits: any;
    misses: any;
    hitRate: number;
  };
  /**
   * Get or set pattern - if key exists return it, otherwise compute and cache
   */
  getOrSet<R = T>(key: string, factory: () => Promise<R> | R, ttl?: number): Promise<R>;
  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number;
  /**
   * Warm up cache with predefined values
   */
  warmUp(
    entries: Array<{
      key: string;
      value: T;
      ttl?: number;
    }>
  ): void;
  /**
   * Get all cache keys
   */
  keys(): string[];
  /**
   * Get cache entries that are about to expire
   */
  getExpiringEntries(withinMs?: number): Array<{
    key: string;
    expiresIn: number;
  }>;
}
/**
 * Enhanced cache service with repository-specific methods
 */
export declare class EnhancedCacheService extends CacheService<any> {
  /**
   * Cache analysis result with repository-specific key
   */
  setCachedAnalysis(
    repoPath: string,
    options: AnalysisOptions,
    analysis: RepositoryAnalysis,
    ttl?: number
  ): Promise<void>;
  /**
   * Get cached analysis result
   */
  getCachedAnalysis(repoPath: string, options: AnalysisOptions): Promise<RepositoryAnalysis | null>;
  /**
   * Cache batch analysis result
   */
  setCachedBatchAnalysis(
    repoPaths: string[],
    options: AnalysisOptions,
    batchResult: BatchAnalysisResult,
    ttl?: number
  ): Promise<void>;
  /**
   * Get cached batch analysis result
   */
  getCachedBatchAnalysis(
    repoPaths: string[],
    options: AnalysisOptions
  ): Promise<BatchAnalysisResult | null>;
  /**
   * Invalidate all cache entries for a specific repository
   */
  invalidateRepository(repoPath: string): number;
  /**
   * Invalidate all analysis caches
   */
  invalidateAll(): void;
  /**
   * Generate analysis cache key
   */
  private generateAnalysisKey;
  /**
   * Generate batch analysis cache key
   */
  private generateBatchKey;
}
export declare const analysisCache: EnhancedCacheService;
export declare const repositoryCache: CacheService<any>;
export declare const searchCache: CacheService<any>;
export declare const exportCache: CacheService<any>;
export declare const cacheService: EnhancedCacheService;
