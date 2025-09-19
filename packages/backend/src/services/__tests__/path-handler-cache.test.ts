import fs from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PathHandler } from '../path-handler.service.js';

vi.mock('../logger.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logger.service.js')>();
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

// Mock fs promises
vi.mock('node:fs/promises', () => ({
  default: {
    stat: vi.fn(),
    access: vi.fn(),
  },
  constants: {
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  },
}));

describe('PathHandler Caching', () => {
  let pathHandler: PathHandler;
  const mockStat = vi.mocked(fs.stat);
  const mockAccess = vi.mocked(fs.access);

  beforeEach(() => {
    // Create a new instance for each test to ensure clean state
    pathHandler = new PathHandler('win32', { enabled: true, ttl: 60000 });
    vi.clearAllMocks();
  });

  afterEach(() => {
    pathHandler.clearCache();
  });

  describe('Cache Configuration', () => {
    it('should initialize with default cache configuration', () => {
      const stats = pathHandler.getCacheStats();
      expect(stats.maxSize).toBe(1000);
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('should allow custom cache configuration', () => {
      const customHandler = new PathHandler('win32', {
        enabled: true,
        ttl: 30000,
        maxEntries: 500,
      });

      const stats = customHandler.getCacheStats();
      expect(stats.maxSize).toBe(500);
    });

    it('should disable caching when configured', () => {
      pathHandler.configureCaching({ enabled: false });

      // Cache should be cleared when disabled
      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Cache Operations', () => {
    beforeEach(() => {
      // Mock successful file system operations
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);
    });

    it('should cache path validations for existing paths', async () => {
      const testPath = 'C:\\Users\\Test\\Documents';

      // First validation should miss cache
      const result1 = await pathHandler.validatePath(testPath);

      // Path should exist but may have permission issues - that's still cacheable
      expect(result1.metadata.exists).toBe(true);
      expect(result1.normalizedPath).toBeDefined();

      let stats = pathHandler.getCacheStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
      expect(stats.size).toBe(1);

      // Second validation should hit cache
      const result2 = await pathHandler.validatePath(testPath);
      expect(result2.metadata.exists).toBe(true);
      expect(result2.normalizedPath).toBeDefined();

      stats = pathHandler.getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should not cache failed validations', async () => {
      const testPath = 'C:\\Invalid<>Path';

      // This should fail validation due to invalid characters
      const result = await pathHandler.validatePath(testPath);
      expect(result.isValid).toBe(false);

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0); // Should not cache failed validations
    });

    it('should generate different cache keys for different paths', async () => {
      const path1 = 'C:\\Users\\Test1';
      const path2 = 'C:\\Users\\Test2';

      await pathHandler.validatePath(path1);
      await pathHandler.validatePath(path2);

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(2); // Two different cache entries
    });

    it('should generate same cache key for same path with same options', async () => {
      const testPath = 'C:\\Users\\Test';
      const options = { timeoutMs: 5000 };

      await pathHandler.validatePath(testPath, options);
      await pathHandler.validatePath(testPath, options);

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(1); // Same cache entry used
      expect(stats.hits).toBe(1);
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);
    });

    it('should clear all cache entries', async () => {
      await pathHandler.validatePath('C:\\Users\\Test1');
      await pathHandler.validatePath('C:\\Users\\Test2');

      let stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(2);

      pathHandler.clearCache();

      stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('should invalidate specific path', async () => {
      const testPath = 'C:\\Users\\Test';
      await pathHandler.validatePath(testPath);

      let stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(1);

      const invalidated = pathHandler.invalidatePath(testPath);
      expect(invalidated).toBe(true);

      stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should invalidate paths by pattern', async () => {
      await pathHandler.validatePath('C:\\Users\\Test1');
      await pathHandler.validatePath('C:\\Users\\Test2');
      await pathHandler.validatePath('D:\\Data\\File');

      let stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(3);

      // Since cache keys are hashed, let's test invalidating all entries with a broad pattern
      const invalidated = pathHandler.invalidateCachePattern('.*');
      expect(invalidated).toBe(3);

      stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Cache Performance Monitoring', () => {
    beforeEach(() => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);
    });

    it('should track hit rate correctly', async () => {
      const testPath = 'C:\\Users\\Test';

      // First call - cache miss
      await pathHandler.validatePath(testPath);
      let stats = pathHandler.getCacheStats();
      expect(stats.hitRate).toBe(0);

      // Second call - cache hit
      await pathHandler.validatePath(testPath);
      stats = pathHandler.getCacheStats();
      expect(stats.hitRate).toBe(0.5);

      // Third call - cache hit
      await pathHandler.validatePath(testPath);
      stats = pathHandler.getCacheStats();
      expect(stats.hitRate).toBeCloseTo(0.67, 2);
    });

    it('should track average validation time', async () => {
      const testPath = 'C:\\Users\\Test';

      // Add some delay to simulate validation time
      mockStat.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isDirectory: () => true,
                  size: 1024,
                } as any),
              10
            )
          )
      );

      await pathHandler.validatePath(testPath);

      const stats = pathHandler.getCacheStats();
      expect(stats.averageValidationTime).toBeGreaterThan(0);
    });

    it('should perform cache maintenance', () => {
      // This should not throw and should log performance metrics
      expect(() => pathHandler.performCacheMaintenance()).not.toThrow();
    });
  });

  describe('Cache Warm-up', () => {
    beforeEach(() => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);
    });

    it('should warm up cache with provided paths', async () => {
      const paths = ['C:\\Users\\Test1', 'C:\\Users\\Test2', 'C:\\Users\\Test3'];

      await pathHandler.warmUpCache(paths);

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(3);
    });

    it('should handle warm-up failures gracefully', async () => {
      const paths = [
        'C:\\Users\\Valid',
        'C:\\Invalid<>Path', // This will fail validation
      ];

      // Should not throw even if some paths fail
      await expect(pathHandler.warmUpCache(paths)).resolves.not.toThrow();

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(1); // Only valid path should be cached
    });

    it('should skip warm-up when caching is disabled', async () => {
      pathHandler.configureCaching({ enabled: false });

      const paths = ['C:\\Users\\Test'];
      await pathHandler.warmUpCache(paths);

      const stats = pathHandler.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Cache Memory Management', () => {
    it('should estimate memory usage', async () => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);

      await pathHandler.validatePath('C:\\Users\\Test');

      const stats = pathHandler.getCacheStats();
      expect(stats.cacheMemoryUsage).toBeGreaterThan(0);
    });

    it('should respect maximum cache size', async () => {
      // Create handler with small cache size
      const smallCacheHandler = new PathHandler('win32', {
        enabled: true,
        maxEntries: 2,
      });

      mockStat.mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
      } as any);

      mockAccess.mockResolvedValue(undefined);

      // Add more entries than max size
      await smallCacheHandler.validatePath('C:\\Users\\Test1');
      await smallCacheHandler.validatePath('C:\\Users\\Test2');
      await smallCacheHandler.validatePath('C:\\Users\\Test3');

      const stats = smallCacheHandler.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2);
    });
  });
});
