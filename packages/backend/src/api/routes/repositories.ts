/**
 * Repository routes
 */

import { Router } from 'express';
import { query, param, validationResult } from 'express-validator';
import { repositoriesController } from '../controllers';

const router = Router();

/**
 * GET /api/repositories
 * Get all indexed repositories
 */
router.get('/', repositoriesController.getAllRepositories);

/**
 * GET /api/repositories/:id
 * Get a specific repository by ID
 */
router.get('/:id', repositoriesController.getRepositoryById);

/**
 * GET /api/repositories/search
 * Search repositories based on query parameters
 */
router.get(
  '/search',
  [
    query('languages').optional().isArray(),
    query('frameworks').optional().isArray(),
    query('keywords').optional().isArray(),
    query('fileTypes').optional().isArray(),
    query('dateRange.start').optional().isISO8601(),
    query('dateRange.end').optional().isISO8601(),
  ],
  repositoriesController.searchRepositories
);

/**
 * GET /api/repositories/:id/similar
 * Find similar repositories to the specified repository
 */
router.get('/:id/similar', repositoriesController.getSimilarRepositories);

/**
 * POST /api/repositories/combinations
 * Suggest combinations of repositories
 */
router.post('/combinations', repositoriesController.suggestCombinations);

/**
 * GET /api/repositories/relationships/graph
 * Get relationship graph for visualization
 */
router.get('/relationships/graph', repositoriesController.getRelationshipGraph);

/**
 * POST /api/repositories/relationships/opportunities
 * Analyze integration opportunities
 */
router.post('/relationships/opportunities', repositoriesController.getIntegrationOpportunities);

/**
 * GET /api/repositories/relationships/insights
 * Get relationship insights and statistics
 */
router.get('/relationships/insights', repositoriesController.getRelationshipInsights);

export default router;
