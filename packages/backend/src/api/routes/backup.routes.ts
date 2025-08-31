import { type Request, type Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { backupService } from '../../services/backup.service';
import logger from '../../services/logger.service';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/backup/status - Get backup service status
(router.get as any)('/status', async (_req: Request, res: Response) => {
  try {
    const status = await backupService.getBackupStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get backup status', error instanceof Error ? error : undefined, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// GET /api/backup/list - List all backups
(router.get as any)('/list', async (_req: Request, res: Response) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    logger.error('Failed to list backups', error instanceof Error ? error : undefined, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// POST /api/backup/create - Create a new backup
(router.post as any)('/create', async (_req: Request, res: Response) => {
  try {
    const backupPath = await backupService.createBackup();

    res.json({
      success: true,
      message: 'Backup created successfully',
      backupPath,
    });
  } catch (error) {
    logger.error('Failed to create backup', error instanceof Error ? error : undefined, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/backup/restore/:filename - Restore from backup
(router.post as any)(
  '/restore/:filename',
  [
    param('filename')
      .isString()
      .matches(/^backup-.*\.tar\.gz$/),
  ],
  handleValidationErrors as any,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const path = await import('node:path');
      const backupPath = path.join(process.env.BACKUP_DIR || './backups', filename);

      await backupService.restoreBackup(backupPath);

      res.json({
        success: true,
        message: 'Backup restored successfully',
      });
    } catch (error) {
      logger.error('Failed to restore backup', error instanceof Error ? error : undefined, {
        filename: req.params.filename,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({ error: 'Failed to restore backup' });
    }
  }
);

// DELETE /api/backup/:filename - Delete a backup
(router.delete as any)(
  '/:filename',
  [
    param('filename')
      .isString()
      .matches(/^backup-.*\.tar\.gz$/),
  ],
  handleValidationErrors as any,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      await backupService.deleteBackup(filename);

      res.json({
        success: true,
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete backup', error instanceof Error ? error : undefined, {
        filename: req.params.filename,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({ error: 'Failed to delete backup' });
    }
  }
);

// POST /api/backup/cleanup - Clean up old backups
(router.post as any)('/cleanup', async (_req: Request, res: Response) => {
  try {
    await backupService.cleanupOldBackups();

    res.json({
      success: true,
      message: 'Backup cleanup completed',
    });
  } catch (error) {
    logger.error('Failed to cleanup backups', error instanceof Error ? error : undefined, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Failed to cleanup backups' });
  }
});

export default router;
