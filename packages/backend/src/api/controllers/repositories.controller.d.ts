/**
 * Repositories controller
 */
import { Request, Response } from 'express';
/**
 * Get all indexed repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getAllRepositories: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific repository by ID
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getRepositoryById: (req: Request, res: Response) => Promise<void>;
/**
 * Search repositories based on query parameters
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const searchRepositories: (req: Request, res: Response) => Promise<void>;
/**
 * Find similar repositories to the specified repository
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getSimilarRepositories: (req: Request, res: Response) => Promise<void>;
/**
 * Suggest combinations of repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const suggestCombinations: (req: Request, res: Response) => Promise<void>;
/**
 * Get relationship graph for visualization
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getRelationshipGraph: (req: Request, res: Response) => Promise<void>;
/**
 * Analyze integration opportunities
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getIntegrationOpportunities: (req: Request, res: Response) => Promise<void>;
/**
 * Get relationship insights and statistics
 *
 * @param req - Express request
 * @param res - Express response
 */
export declare const getRelationshipInsights: (req: Request, res: Response) => Promise<void>;
