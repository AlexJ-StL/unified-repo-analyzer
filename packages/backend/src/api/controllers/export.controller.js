/**
 * Export controller for handling export requests
 */
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import exportService from '../../services/export.service';
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
// Temporary directory for exports
const EXPORT_DIR = path.join(process.cwd(), 'exports');
const exportMetadata = new Map();
// Ensure export directory exists
(async () => {
    try {
        await stat(EXPORT_DIR);
    }
    catch {
        await mkdir(EXPORT_DIR, { recursive: true });
    }
})();
// Clean up old exports (older than 24 hours)
const cleanupOldExports = async () => {
    try {
        const files = await readdir(EXPORT_DIR);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        for (const file of files) {
            const filePath = path.join(EXPORT_DIR, file);
            const stats = await stat(filePath);
            if (now - stats.mtime.getTime() > maxAge) {
                await unlink(filePath);
                // Remove from metadata store
                const exportId = path.parse(file).name;
                exportMetadata.delete(exportId);
            }
        }
    }
    catch (error) {
        console.error('Error cleaning up old exports:', error);
    }
};
// Run cleanup every hour
setInterval(cleanupOldExports, 60 * 60 * 1000);
/**
 * Export a repository analysis
 *
 * @param req - Express request
 * @param res - Express response
 */
export const exportAnalysis = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { format } = req.body;
        // Get analysis from storage (this would be replaced with actual storage retrieval)
        // For now, we'll just return an error since we don't have storage implemented yet
        if (!req.body.analysis) {
            res.status(404).json({ error: 'Analysis not found' });
            return;
        }
        const analysis = req.body.analysis;
        // Generate export content
        const content = await exportService.exportAnalysis(analysis, format);
        // For direct download, set headers and send content
        if (req.query.download === 'true') {
            const filename = `${analysis.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.${getFileExtension(format)}`;
            res.setHeader('Content-Type', getContentType(format));
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
            return;
        }
        // For API response, save to file and return path
        const exportId = uuidv4();
        const filename = `${exportId}.${getFileExtension(format)}`;
        const exportPath = path.join(EXPORT_DIR, filename);
        await exportService.saveToFile(content, exportPath);
        const size = Buffer.byteLength(content, 'utf8');
        // Store export metadata
        exportMetadata.set(exportId, {
            id: exportId,
            format: format,
            filename,
            createdAt: new Date(),
            size,
            analysisName: analysis.name,
            type: 'single',
        });
        // Return export information
        res.status(200).json({
            exportId,
            format,
            filename,
            downloadUrl: `/api/export/download/${exportId}`,
            size,
        });
    }
    catch (error) {
        console.error('Error exporting analysis:', error);
        res.status(500).json({
            error: 'Failed to export analysis',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
/**
 * Export a batch analysis result
 *
 * @param req - Express request
 * @param res - Express response
 */
export const exportBatchAnalysis = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { batchId, format } = req.body;
        // Get batch analysis from storage (this would be replaced with actual storage retrieval)
        // For now, we'll just return an error if the analysis isn't provided in the request
        if (!req.body.batchAnalysis) {
            res.status(404).json({ error: 'Batch analysis not found' });
            return;
        }
        const batchAnalysis = req.body.batchAnalysis;
        // Generate export content
        const content = await exportService.exportBatchAnalysis(batchAnalysis, format);
        // For direct download, set headers and send content
        if (req.query.download === 'true') {
            const filename = `batch_analysis_${batchId}.${getFileExtension(format)}`;
            res.setHeader('Content-Type', getContentType(format));
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(content);
            return;
        }
        // For API response, save to file and return path
        const exportId = uuidv4();
        const filename = `${exportId}.${getFileExtension(format)}`;
        const exportPath = path.join(EXPORT_DIR, filename);
        await exportService.saveToFile(content, exportPath);
        const size = Buffer.byteLength(content, 'utf8');
        // Store export metadata
        exportMetadata.set(exportId, {
            id: exportId,
            format: format,
            filename,
            createdAt: new Date(),
            size,
            analysisName: `Batch Analysis (${batchAnalysis.repositories.length} repos)`,
            type: 'batch',
        });
        // Return export information
        res.status(200).json({
            exportId,
            format,
            filename,
            downloadUrl: `/api/export/download/${exportId}`,
            size,
        });
    }
    catch (error) {
        console.error('Error exporting batch analysis:', error);
        res.status(500).json({
            error: 'Failed to export batch analysis',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
/**
 * Download an export file
 *
 * @param req - Express request
 * @param res - Express response
 */
export const downloadExport = async (req, res) => {
    try {
        const { exportId } = req.params;
        // Find the export file
        const format = getFormatFromExportId(exportId);
        if (!format) {
            res.status(404).json({ error: 'Export not found' });
            return;
        }
        const filename = `${exportId}.${getFileExtension(format)}`;
        const exportPath = path.join(EXPORT_DIR, filename);
        // Check if file exists
        try {
            await stat(exportPath);
        }
        catch {
            res.status(404).json({ error: 'Export file not found' });
            return;
        }
        // Set headers and send file
        res.setHeader('Content-Type', getContentType(format));
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        // Stream the file to handle large exports
        const fileStream = fs.createReadStream(exportPath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('Error downloading export:', error);
        res.status(500).json({
            error: 'Failed to download export',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
/**
 * Get file extension for output format
 *
 * @param format - Output format
 * @returns File extension
 */
function getFileExtension(format) {
    switch (format) {
        case 'json':
            return 'json';
        case 'markdown':
            return 'md';
        case 'html':
            return 'html';
        default:
            return 'txt';
    }
}
/**
 * Get content type for output format
 *
 * @param format - Output format
 * @returns Content type
 */
function getContentType(format) {
    switch (format) {
        case 'json':
            return 'application/json';
        case 'markdown':
            return 'text/markdown';
        case 'html':
            return 'text/html';
        default:
            return 'text/plain';
    }
}
/**
 * Get format from export ID using metadata store
 *
 * @param exportId - Export ID
 * @returns Output format or undefined if not found
 */
function getFormatFromExportId(exportId) {
    const metadata = exportMetadata.get(exportId);
    return metadata?.format;
}
/**
 * Get export history
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getExportHistory = async (req, res) => {
    try {
        const history = Array.from(exportMetadata.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 50); // Return last 50 exports
        res.status(200).json(history);
    }
    catch (error) {
        console.error('Error getting export history:', error);
        res.status(500).json({
            error: 'Failed to get export history',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
/**
 * Delete an export file
 *
 * @param req - Express request
 * @param res - Express response
 */
export const deleteExport = async (req, res) => {
    try {
        const { exportId } = req.params;
        // Check if export exists
        const metadata = exportMetadata.get(exportId);
        if (!metadata) {
            res.status(404).json({ error: 'Export not found' });
            return;
        }
        // Delete the file
        const filename = `${exportId}.${getFileExtension(metadata.format)}`;
        const exportPath = path.join(EXPORT_DIR, filename);
        try {
            await unlink(exportPath);
        }
        catch {
            // File might not exist, but we'll still remove from metadata
            console.warn(`Export file not found: ${exportPath}`);
        }
        // Remove from metadata store
        exportMetadata.delete(exportId);
        res.status(200).json({ message: 'Export deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting export:', error);
        res.status(500).json({
            error: 'Failed to delete export',
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
//# sourceMappingURL=export.controller.js.map