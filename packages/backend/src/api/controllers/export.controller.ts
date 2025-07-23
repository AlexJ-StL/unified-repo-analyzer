/**
 * Export controller for handling export requests
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { OutputFormat } from '@unified-repo-analyzer/shared/src/types/analysis';
import exportService from '../../services/export.service';
import { AnalysisEngine } from '../../core/AnalysisEngine';

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

// Temporary directory for exports
const EXPORT_DIR = path.join(process.cwd(), 'exports');

// Ensure export directory exists
(async () => {
  try {
    await stat(EXPORT_DIR);
  } catch (error) {
    await mkdir(EXPORT_DIR, { recursive: true });
  }
})();

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

    const { analysisId, format } = req.body;

    // Get analysis engine
    const analysisEngine = new AnalysisEngine();

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

    // Return export information
    res.status(200).json({
      exportId,
      format,
      filename,
      downloadUrl: `/api/export/download/${exportId}`,
      size: Buffer.byteLength(content, 'utf8'),
    });
  } catch (error) {
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

    // Return export information
    res.status(200).json({
      exportId,
      format,
      filename,
      downloadUrl: `/api/export/download/${exportId}`,
      size: Buffer.byteLength(content, 'utf8'),
    });
  } catch (error) {
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
    } catch (error) {
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
 * Get format from export ID (placeholder implementation)
 * In a real implementation, this would look up the format from a database
 *
 * @param exportId - Export ID
 * @returns Output format or undefined if not found
 */
function getFormatFromExportId(exportId: string): OutputFormat | undefined {
  // This is a placeholder implementation
  // In a real implementation, this would look up the format from a database
  // For now, we'll just return JSON as the default
  return 'json';
}
