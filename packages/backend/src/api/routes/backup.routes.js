import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { backupService } from '../../services/backup.service';
import logger from '../../services/logger.service';
const router = Router();
// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
// GET /api/backup/status - Get backup service status
router.get('/status', async (req, res) => {
    try {
        const status = await backupService.getBackupStatus();
        res.json(status);
    }
    catch (error) {
        logger.error('Failed to get backup status', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to get backup status' });
    }
});
// GET /api/backup/list - List all backups
router.get('/list', async (req, res) => {
    try {
        const backups = await backupService.listBackups();
        res.json(backups);
    }
    catch (error) {
        logger.error('Failed to list backups', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to list backups' });
    }
});
// POST /api/backup/create - Create a new backup
router.post('/create', [body('description').optional().isString().isLength({ max: 255 })], handleValidationErrors, async (req, res) => {
    try {
        const { description } = req.body;
        const backupPath = await backupService.createBackup(description);
        res.json({
            success: true,
            message: 'Backup created successfully',
            backupPath,
        });
    }
    catch (error) {
        logger.error('Failed to create backup', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to create backup' });
    }
});
// POST /api/backup/restore/:filename - Restore from backup
router.post('/restore/:filename', [
    param('filename')
        .isString()
        .matches(/^backup-.*\.tar\.gz$/),
], handleValidationErrors, async (req, res) => {
    try {
        const { filename } = req.params;
        const path = await import('path');
        const backupPath = path.join(process.env.BACKUP_DIR || './backups', filename);
        await backupService.restoreBackup(backupPath);
        res.json({
            success: true,
            message: 'Backup restored successfully',
        });
    }
    catch (error) {
        logger.error('Failed to restore backup', {
            filename: req.params.filename,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to restore backup' });
    }
});
// DELETE /api/backup/:filename - Delete a backup
router.delete('/:filename', [
    param('filename')
        .isString()
        .matches(/^backup-.*\.tar\.gz$/),
], handleValidationErrors, async (req, res) => {
    try {
        const { filename } = req.params;
        await backupService.deleteBackup(filename);
        res.json({
            success: true,
            message: 'Backup deleted successfully',
        });
    }
    catch (error) {
        logger.error('Failed to delete backup', {
            filename: req.params.filename,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to delete backup' });
    }
});
// POST /api/backup/cleanup - Clean up old backups
router.post('/cleanup', async (req, res) => {
    try {
        await backupService.cleanupOldBackups();
        res.json({
            success: true,
            message: 'Backup cleanup completed',
        });
    }
    catch (error) {
        logger.error('Failed to cleanup backups', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ error: 'Failed to cleanup backups' });
    }
});
export default router;
//# sourceMappingURL=backup.routes.js.map