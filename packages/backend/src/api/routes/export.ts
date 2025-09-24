/**
 * Export routes
 */

import { type RequestHandler, Router } from 'express';
import { body, param } from 'express-validator';
import { exportController } from '../controllers';

const router = Router();

/**
 * POST /api/export
 * Export a repository analysis
 */
router.post(
  '/',
  [
    body('analysisId').optional().isString(),
    body('format')
      .isIn(['json', 'markdown', 'html'])
      .withMessage('Format must be json, markdown, or html'),
    body('analysis').optional().isObject(),
  ],
  exportController.exportAnalysis as RequestHandler
);

/**
 * POST /api/export/batch
 * Export a batch analysis result
 */
router.post(
  '/batch',
  [
    body('batchId').optional().isString(),
    body('format')
      .isIn(['json', 'markdown', 'html'])
      .withMessage('Format must be json, markdown, or html'),
    body('batchAnalysis').optional().isObject(),
  ],
  exportController.exportBatchAnalysis as RequestHandler
);

/**
 * GET /api/export/download/:exportId
 * Download an export file
 */
router.get(
  '/download/:exportId',
  [param('exportId').isString().notEmpty().withMessage('Export ID is required')],
  exportController.downloadExport as RequestHandler
);

/**
 * GET /api/export/history
 * Get export history
 */
router.get('/history', exportController.getExportHistory as RequestHandler);

/**
 * DELETE /api/export/:exportId
 * Delete an export file
 */
router.delete(
  '/:exportId',
  [param('exportId').isString().notEmpty().withMessage('Export ID is required')],
  exportController.deleteExport as RequestHandler
);

export default router;
