import { createHash } from 'crypto';
import { LRUCache } from 'lru-cache';
import { logger } from '../utils/logger';
export class CacheService {
    cache;
    defaultTTL;
    constructor(options = {}) {
        this.defaultTTL = options.ttl || 30 * 60 * 1000; // 30 minutes default
        this.cache = new LRUCache({
            max: options.max || 1000,
            ttl: this.defaultTTL,
            updateAgeOnGet: options.updateAgeOnGet ?? true,
            updateAgeOnHas: options.updateAgeOnHas ?? false,
            dispose: (value, key) => {
                logger.debug(`Cache entry disposed: ${key}`);
            },
        });
    }
    /**
     * Generate a cache key from various inputs
     */
    generateKey(...inputs) {
        const serialized = inputs
            .map((input) => {
            if (typeof input === 'object') {
                return JSON.stringify(input, Object.keys(input).sort());
            }
            return String(input);
        })
            .join('|');
        return createHash('sha256').update(serialized).digest('hex').substring(0, 16);
    }
    /**
     * Set a value in the cache
     */
    set(key, value, ttl) {
        const entry = {
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
            key,
        };
        this.cache.set(key, entry, { ttl: entry.ttl });
        logger.debug(`Cache set: ${key} (TTL: ${entry.ttl}ms)`);
    }
    /**
     * Get a value from the cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            logger.debug(`Cache miss: ${key}`);
            return undefined;
        }
        // Check if entry has expired (additional check beyond LRU's TTL)
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            logger.debug(`Cache expired: ${key}`);
            return undefined;
        }
        logger.debug(`Cache hit: ${key}`);
        return entry.value;
    }
    /**
     * Check if a key exists in the cache
     */
    has(key) {
        const exists = this.cache.has(key);
        logger.debug(`Cache has ${key}: ${exists}`);
        return exists;
    }
    /**
     * Delete a key from the cache
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        logger.debug(`Cache delete ${key}: ${deleted}`);
        return deleted;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        logger.info('Cache cleared');
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            max: this.cache.max,
            ttl: this.defaultTTL,
            calculatedSize: this.cache.calculatedSize,
            hits: this.cache.hits || 0,
            misses: this.cache.misses || 0,
            hitRate: this.cache.hits ? this.cache.hits / (this.cache.hits + this.cache.misses) : 0,
        };
    }
    /**
     * Get or set pattern - if key exists return it, otherwise compute and cache
     */
    async getOrSet(key, factory, ttl) {
        const existing = this.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    /**
     * Invalidate cache entries by pattern
     */
    invalidatePattern(pattern) {
        let count = 0;
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }
        logger.info(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
        return count;
    }
    /**
     * Warm up cache with predefined values
     */
    warmUp(entries) {
        entries.forEach(({ key, value, ttl }) => {
            this.set(key, value, ttl);
        });
        logger.info(`Cache warmed up with ${entries.length} entries`);
    }
    /**
     * Get all cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }
    /**
     * Get cache entries that are about to expire
     */
    getExpiringEntries(withinMs = 60000) {
        const now = Date.now();
        const expiring = [];
        for (const [key, entry] of this.cache.entries()) {
            const expiresAt = entry.timestamp + entry.ttl;
            const expiresIn = expiresAt - now;
            if (expiresIn > 0 && expiresIn <= withinMs) {
                expiring.push({ key, expiresIn });
            }
        }
        return expiring.sort((a, b) => a.expiresIn - b.expiresIn);
    }
}
/**
 * Enhanced cache service with repository-specific methods
 */
export class EnhancedCacheService extends CacheService {
    /**
     * Cache analysis result with repository-specific key
     */
    async setCachedAnalysis(repoPath, options, analysis, ttl) {
        const key = this.generateAnalysisKey(repoPath, options);
        this.set(key, analysis, ttl);
        // Also cache by repository ID for quick lookups
        if (analysis.id) {
            this.set(`analysis:${analysis.id}`, analysis, ttl);
        }
    }
    /**
     * Get cached analysis result
     */
    async getCachedAnalysis(repoPath, options) {
        const key = this.generateAnalysisKey(repoPath, options);
        return this.get(key) || null;
    }
    /**
     * Cache batch analysis result
     */
    async setCachedBatchAnalysis(repoPaths, options, batchResult, ttl) {
        const key = this.generateBatchKey(repoPaths, options);
        this.set(key, batchResult, ttl);
    }
    /**
     * Get cached batch analysis result
     */
    async getCachedBatchAnalysis(repoPaths, options) {
        const key = this.generateBatchKey(repoPaths, options);
        return this.get(key) || null;
    }
    /**
     * Invalidate all cache entries for a specific repository
     */
    invalidateRepository(repoPath) {
        const pathHash = createHash('md5').update(repoPath).digest('hex');
        return this.invalidatePattern(`.*${pathHash}.*`);
    }
    /**
     * Invalidate all analysis caches
     */
    invalidateAll() {
        this.clear();
    }
    /**
     * Generate analysis cache key
     */
    generateAnalysisKey(repoPath, options) {
        return this.generateKey('analysis', repoPath, options);
    }
    /**
     * Generate batch analysis cache key
     */
    generateBatchKey(repoPaths, options) {
        return this.generateKey('batch', repoPaths.sort(), options);
    }
}
// Singleton instances for different cache types
export const analysisCache = new EnhancedCacheService({
    ttl: 60 * 60 * 1000, // 1 hour for analysis results
    max: 500,
});
export const repositoryCache = new CacheService({
    ttl: 30 * 60 * 1000, // 30 minutes for repository metadata
    max: 1000,
});
export const searchCache = new CacheService({
    ttl: 10 * 60 * 1000, // 10 minutes for search results
    max: 200,
});
export const exportCache = new CacheService({
    ttl: 5 * 60 * 1000, // 5 minutes for export results
    max: 100,
});
// Export the enhanced cache service as the main cache service
export const cacheService = analysisCache;
//# sourceMappingURL=cache.service.js.map