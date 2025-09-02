/**
 * API routes index
 */

import { Router } from 'express';
import analysisRequestsRoutes from './analysis-requests';
import analyzeRoutes from './analyze';
import backupRoutes from './backup.routes';
import configRoutes from './config.routes';
import exportRoutes from './export';
import filesystemRoutes from './filesystem';
import metricsRoutes from './metrics';
import pathRoutes from './path';
import providersRoutes from './providers';
import repositoriesRoutes from './repositories';

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
