/**
 * API routes index
 */

import { Router } from 'express';
import analysisRequestsRoutes from './analysis-requests.js';
import analyzeRoutes from './analyze.js';
import backupRoutes from './backup.routes.js';
import configRoutes from './config.routes.js';
import exportRoutes from './export.js';
import filesystemRoutes from './filesystem.js';
import metricsRoutes from './metrics.js';
import pathRoutes from './path.js';
import providersRoutes from './providers.js';
import repositoriesRoutes from './repositories.js';

const router = Router();

// Mount routes
router.use('/analyze', analyzeRoutes);
router.use('/analysis-requests', analysisRequestsRoutes);
router.use('/repositories', repositoriesRoutes);
router.use('/export', exportRoutes);
router.use('/metrics', metricsRoutes);
router.use('/config', configRoutes);
router.use('/backup', backupRoutes);
router.use('/path', pathRoutes);
router.use('/filesystem', filesystemRoutes);
router.use('/providers', providersRoutes);

export default router;
