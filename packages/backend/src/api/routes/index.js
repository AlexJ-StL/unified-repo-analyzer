/**
 * API routes index
 */
import { Router } from 'express';
import analyzeRoutes from './analyze';
import repositoriesRoutes from './repositories';
import exportRoutes from './export';
import metricsRoutes from './metrics';
import configRoutes from './config.routes';
import backupRoutes from './backup.routes';
const router = Router();
// Mount routes
router.use('/analyze', analyzeRoutes);
router.use('/repositories', repositoriesRoutes);
router.use('/export', exportRoutes);
router.use('/metrics', metricsRoutes);
router.use('/config', configRoutes);
router.use('/backup', backupRoutes);
export default router;
//# sourceMappingURL=index.js.map