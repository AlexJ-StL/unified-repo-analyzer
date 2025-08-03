/**
 * Analysis controller
 */
import { Request, Response } from 'express';
/**
 * Analyze a single repository
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const analyzeRepository: (req: Request, res: Response) => Promise<void>;
/**
 * Analyze multiple repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const analyzeMultipleRepositories: (req: Request, res: Response) => Promise<void>;
