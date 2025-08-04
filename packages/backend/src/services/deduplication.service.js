/**
 * Request deduplication service for concurrent identical requests
 */
import crypto from 'crypto';
import { logger } from '../utils/logger';
/**
 * Service for deduplicating concurrent identical requests
 */
export class DeduplicationService {
    pendingAnalysis = new Map();
    pendingBatch = new Map();
    cleanupInterval;
    maxAge;
    constructor(maxAge = 5 * 60 * 1000) {
        // 5 minutes default
        this.maxAge = maxAge;
        // Clean up expired requests every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 1000);
    }
    /**
     * Generates a unique key for analysis request
     */
    generateAnalysisKey(repoPath, options) {
        const optionsHash = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
        const pathHash = crypto.createHash('md5').update(repoPath).digest('hex');
        return `analysis:${pathHash}:${optionsHash}`;
    }
    /**
     * Generates a unique key for batch analysis request
     */
    generateBatchKey(repoPaths, options) {
        const pathsHash = crypto
            .createHash('md5')
            .update(JSON.stringify(repoPaths.sort()))
            .digest('hex');
        const optionsHash = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
        return `batch:${pathsHash}:${optionsHash}`;
    }
    /**
     * Deduplicates analysis requests
     */
    async deduplicateAnalysis(repoPath, options, executor) {
        const key = this.generateAnalysisKey(repoPath, options);
        // Check if there's already a pending request
        const existing = this.pendingAnalysis.get(key);
        if (existing) {
            logger.info(`Deduplicating analysis request for: ${repoPath} (${existing.requestCount + 1} total requests)`);
            existing.requestCount++;
            return existing.promise;
        }
        // Create new request
        const promise = executor().finally(() => {
            // Clean up after completion
            this.pendingAnalysis.delete(key);
        });
        // Store pending request
        this.pendingAnalysis.set(key, {
            promise,
            timestamp: Date.now(),
            requestCount: 1,
        });
        logger.info(`New analysis request for: ${repoPath}`);
        return promise;
    }
    /**
     * Deduplicates batch analysis requests
     */
    async deduplicateBatch(repoPaths, options, executor) {
        const key = this.generateBatchKey(repoPaths, options);
        // Check if there's already a pending request
        const existing = this.pendingBatch.get(key);
        if (existing) {
            logger.info(`Deduplicating batch analysis request for ${repoPaths.length} repositories (${existing.requestCount + 1} total requests)`);
            existing.requestCount++;
            return existing.promise;
        }
        // Create new request
        const promise = executor().finally(() => {
            // Clean up after completion
            this.pendingBatch.delete(key);
        });
        // Store pending request
        this.pendingBatch.set(key, {
            promise,
            timestamp: Date.now(),
            requestCount: 1,
        });
        logger.info(`New batch analysis request for ${repoPaths.length} repositories`);
        return promise;
    }
    /**
     * Gets statistics about pending requests
     */
    getStats() {
        const totalDeduplicated = Array.from(this.pendingAnalysis.values())
            .concat(Array.from(this.pendingBatch.values()))
            .reduce((total, request) => total + (request.requestCount - 1), 0);
        return {
            pendingAnalysis: this.pendingAnalysis.size,
            pendingBatch: this.pendingBatch.size,
            totalDeduplicated,
        };
    }
    /**
     * Cleans up expired pending requests
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        // Clean up analysis requests
        for (const [key, request] of this.pendingAnalysis.entries()) {
            if (now - request.timestamp > this.maxAge) {
                this.pendingAnalysis.delete(key);
                cleanedCount++;
            }
        }
        // Clean up batch requests
        for (const [key, request] of this.pendingBatch.entries()) {
            if (now - request.timestamp > this.maxAge) {
                this.pendingBatch.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger.debug(`Cleaned up ${cleanedCount} expired deduplication entries`);
        }
    }
    /**
     * Manually clears all pending requests
     */
    clear() {
        this.pendingAnalysis.clear();
        this.pendingBatch.clear();
        logger.info('All pending requests cleared');
    }
    /**
     * Destroys the service and cleans up resources
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.clear();
    }
}
// Create singleton instance
export const deduplicationService = new DeduplicationService(parseInt(process.env.DEDUP_MAX_AGE_MS || (5 * 60 * 1000).toString()));
export default deduplicationService;
//# sourceMappingURL=deduplication.service.js.map