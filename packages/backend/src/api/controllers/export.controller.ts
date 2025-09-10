/**
 * Export controller for handling export requests
 */

import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { OutputFormat } from '@unified-repo-analyzer/shared/src/types/analysis.js';
import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import exportService from '../../services/export.service.js';

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

// Temporary directory for exports
const EXPORT_DIR = path.join(process.cwd(), 'exports');

// In-memory export metadata store (in production, use a database)
interface ExportMetadata {
  id: string;
  format: OutputFormat;
  filename: string;
  createdAt: Date;
  size: number;
  analysisName?: string;
  type: 'single' | 'batch';
}

const exportMetadata = new Map<string, ExportMetadata>();

// Ensure export directory exists
(async () => {
  try {
    await stat(EXPORT_DIR);
  } catch {
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
  } catch (_error) {}
};

// Run cleanup every hour
setInterval(cleanupOldExports, 60 * 60 * 1000);

/**
 * Export a repository analysis
 *
 * @param req - Express request
 * @param res - Express response
 */
export const exportAnalysis = async (req: Request, res: Response): Promise<void> => {
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
    const content = await exportService.exportAnalysis(analysis, format as OutputFormat);

    // For direct download, set headers and send content
    if (req.query.download === 'true') {
      const filename = `${analysis.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.${getFileExtension(format as OutputFormat)}`;

      res.setHeader('Content-Type', getContentType(format as OutputFormat));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
      return;
    }

    // For API response, save to file and return path
    const exportId = uuidv4();
    const filename = `${exportId}.${getFileExtension(format as OutputFormat)}`;
    const exportPath = path.join(EXPORT_DIR, filename);

    await exportService.saveToFile(content, exportPath);

    const size = Buffer.byteLength(content, 'utf8');

    // Store export metadata
    exportMetadata.set(exportId, {
      id: exportId,
      format: format as OutputFormat,
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
  } catch (error) {
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
export const exportBatchAnalysis = async (req: Request, res: Response): Promise<void> => {
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
    const content = await exportService.exportBatchAnalysis(batchAnalysis, format as OutputFormat);

    // For direct download, set headers and send content
    if (req.query.download === 'true') {
      const filename = `batch_analysis_${batchId}.${getFileExtension(format as OutputFormat)}`;

      res.setHeader('Content-Type', getContentType(format as OutputFormat));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
      return;
    }

    // For API response, save to file and return path
    const exportId = uuidv4();
    const filename = `${exportId}.${getFileExtension(format as OutputFormat)}`;
    const exportPath = path.join(EXPORT_DIR, filename);

    await exportService.saveToFile(content, exportPath);

    const size = Buffer.byteLength(content, 'utf8');

    // Store export metadata
    exportMetadata.set(exportId, {
      id: exportId,
      format: format as OutputFormat,
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
  } catch (error) {
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
export const downloadExport = async (req: Request, res: Response): Promise<void> => {
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
    } catch {
      res.status(404).json({ error: 'Export file not found' });
      return;
    }

    // Set headers and send file
    res.setHeader('Content-Type', getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file to handle large exports
    const fileStream = fs.createReadStream(exportPath);
    fileStream.pipe(res);
  } catch (error) {
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
function getFileExtension(format: OutputFormat): string {
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
function getContentType(format: OutputFormat): string {
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
function getFormatFromExportId(exportId: string): OutputFormat | undefined {
  const metadata = exportMetadata.get(exportId);
  return metadata?.format;
}

/**
 * Get export history
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getExportHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const history = Array.from(exportMetadata.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50); // Return last 50 exports

    res.status(200).json(history);
  } catch (error) {
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
export const deleteExport = async (req: Request, res: Response): Promise<void> => {
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
    } catch (_error) {}

    // Remove from metadata store
    exportMetadata.delete(exportId);

    res.status(200).json({ message: 'Export deleted successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete export',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
