/**
 * Path validation routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import * as pathController from '../controllers/path.controller.js';

const router = Router();

/**
 * POST /api/path/validate
 * Validate a path using PathHandler service
 */
router.post(
  '/validate',
  [
    body('path').isString().notEmpty().withMessage('Path must be a non-empty string'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('options.timeoutMs')
      .optional()
      .isInt({ min: 1000, max: 60000 })
      .withMessage('Timeout must be between 1000ms and 60000ms'),
    body('options.validateExistence')
      .optional()
      .isBoolean()
      .withMessage('validateExistence must be a boolean'),
    body('options.validatePermissions')
      .optional()
      .isBoolean()
      .withMessage('validatePermissions must be a boolean'),
  ],
  pathController.validatePath as any
);

/**
 * GET /api/path/format-info
 * Get platform-specific path format information
 */
router.get('/format-info', pathController.getPathFormatInfo as any);

export default router;
