/**
 * API routes index
 */

import { Router } from 'express';
import analyzeRoutes from './analyze';
import repositoriesRoutes from './repositories';
import exportRoutes from './export';

const router = Router();

// Mount routes
router.use('/analyze', analyzeRoutes);
router.use('/repositories', repositoriesRoutes);
router.use('/export', exportRoutes);

export default router;
