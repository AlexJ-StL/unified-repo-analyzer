/**
 * Export controller for handling export requests
 */
import { Request, Response } from 'express';
/**
 * Export a repository analysis
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const exportAnalysis: (req: Request, res: Response) => Promise<void>;
/**
 * Export a batch analysis result
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const exportBatchAnalysis: (req: Request, res: Response) => Promise<void>;
/**
 * Download an export file
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const downloadExport: (req: Request, res: Response) => Promise<void>;
/**
 * Get export history
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getExportHistory: (req: Request, res: Response) => Promise<void>;
/**
 * Delete an export file
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const deleteExport: (req: Request, res: Response) => Promise<void>;
