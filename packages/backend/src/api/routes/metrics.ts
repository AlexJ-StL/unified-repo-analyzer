/**
 * Metrics and performance monitoring routes
 */

import { Router } from 'express';
import { cacheService } from '../../services/cache.service';
import { deduplicationService } from '../../services/deduplication.service';
import { metricsService } from '../../services/metrics.service';

const router = Router();

/**
 * GET /api/metrics
 * Get performance metrics and statistics
 */
router.get('/', (_req, res) => {
  try {
    const stats = metricsService.getStats();
    const cacheStats = cacheService.getStats();
    const deduplicationStats = deduplicationService.getStats();

    res.json({
      performance: stats,
      cache: cacheStats,
      deduplication: deduplicationStats,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/metrics/export
 * Export all metrics for external monitoring
 */
router.get('/export', (_req, res) => {
  try {
    const metrics = metricsService.exportMetrics();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="metrics-export.json"');
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export metrics',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/metrics/range
 * Get metrics for a specific time range
 */
router.get('/range', (req, res) => {
  try {
    const { start, end, metric } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Start and end timestamps are required',
      });
    }

    const startTime = Number.parseInt(start as string, 10);
    const endTime = Number.parseInt(end as string, 10);
    const metricName = metric as string;

    const metrics = metricsService.getMetricsInRange(startTime, endTime, metricName);
    const requestMetrics = metricsService.getRequestMetricsInRange(startTime, endTime);
    const analysisMetrics = metricsService.getAnalysisMetricsInRange(startTime, endTime);

    res.json({
      metrics,
      requests: requestMetrics,
      analysis: analysisMetrics,
      range: { start: startTime, end: endTime },
      count: {
        metrics: metrics.length,
        requests: requestMetrics.totalRequests,
        analysis: analysisMetrics.totalAnalyses,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics range',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/metrics/clear
 * Clear all metrics
 */
router.post('/clear', (_req, res) => {
  try {
    metricsService.clear();

    res.json({
      message: 'All metrics cleared successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear metrics',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/metrics/cache
 * Get cache statistics and management
 */
router.get('/cache', (_req, res) => {
  try {
    const stats = cacheService.getStats();

    res.json({
      stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/metrics/cache/invalidate
 * Invalidate cache entries
 */
router.post('/cache/invalidate', (req, res) => {
  try {
    const { repositoryPath, all } = req.body;

    if (all) {
      cacheService.invalidateAll();
      res.json({
        message: 'All cache entries invalidated',
        timestamp: Date.now(),
      });
    } else if (repositoryPath) {
      cacheService.invalidateRepository(repositoryPath);
      res.json({
        message: `Cache invalidated for repository: ${repositoryPath}`,
        timestamp: Date.now(),
      });
    } else {
      res.status(400).json({
        error: 'Either repositoryPath or all=true must be provided',
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to invalidate cache',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/metrics/cache/prune
 * Manually prune expired cache entries
 */
router.post('/cache/prune', (_req, res) => {
  try {
    cacheService.prune();

    res.json({
      message: 'Cache pruned successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to prune cache',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/metrics/deduplication
 * Get request deduplication statistics
 */
router.get('/deduplication', (_req, res) => {
  try {
    const stats = deduplicationService.getStats();

    res.json({
      stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get deduplication statistics',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/metrics/deduplication/clear
 * Clear pending deduplication requests
 */
router.post('/deduplication/clear', (_req, res) => {
  try {
    deduplicationService.clear();

    res.json({
      message: 'Deduplication requests cleared',
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear deduplication requests',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
