/**
 * API routes index
 */

import { Router } from 'express';
import analyzeRoutes from './analyze';
import backupRoutes from './backup.routes';
import configRoutes from './config.routes';
import exportRoutes from './export';
import metricsRoutes from './metrics';
import pathRoutes from './path';
import repositoriesRoutes from './repositories';

const router = Router();

// Mount routes
router.use('/analyze', analyzeRoutes);
router.use('/repositories', repositoriesRoutes);
router.use('/export', exportRoutes);
router.use('/metrics', metricsRoutes);
router.use('/config', configRoutes);
router.use('/backup', backupRoutes);
router.use('/path', pathRoutes);

export default router;
