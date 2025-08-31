/**
 * Analysis routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { analyzeController } from '../controllers';

const router = Router();

/**
 * POST /api/analyze
 * Analyze a single repository
 */
router.post(
  '/',
  [
    body('path').isString().notEmpty().withMessage('Repository path is required'),
    body('options').optional().isObject(),
    body('options.mode').optional().isIn(['quick', 'standard', 'comprehensive']),
    body('options.maxFiles').optional().isInt({ min: 1 }),
    body('options.maxLinesPerFile').optional().isInt({ min: 1 }),
    body('options.includeLLMAnalysis').optional().isBoolean(),
    body('options.llmProvider').optional().isString(),
    body('options.outputFormats').optional().isArray(),
    body('options.includeTree').optional().isBoolean(),
  ],
  analyzeController.analyzeRepository as any
);

/**
 * POST /api/analyze/batch
 * Analyze multiple repositories
 */
router.post(
  '/batch',
  [
    body('paths').isArray().notEmpty().withMessage('Repository paths are required'),
    body('paths.*').isString().notEmpty().withMessage('Each path must be a non-empty string'),
    body('options').optional().isObject(),
    body('options.mode').optional().isIn(['quick', 'standard', 'comprehensive']),
    body('options.maxFiles').optional().isInt({ min: 1 }),
    body('options.maxLinesPerFile').optional().isInt({ min: 1 }),
    body('options.includeLLMAnalysis').optional().isBoolean(),
    body('options.llmProvider').optional().isString(),
    body('options.outputFormats').optional().isArray(),
    body('options.includeTree').optional().isBoolean(),
  ],
  analyzeController.analyzeMultipleRepositories as any
);

export default router;
