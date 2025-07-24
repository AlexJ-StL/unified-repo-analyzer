/**
 * Repositories controller
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AnalysisEngine } from '../../core/AnalysisEngine';
import { IndexSystem } from '../../core/IndexSystem';
import { SearchQuery } from '@unified-repo-analyzer/shared/src/types/analysis';

/**
 * Get all indexed repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getAllRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create index system
    const indexSystem = new IndexSystem();

    // Get all repositories
    const index = indexSystem.getIndex();

    // Return repositories
    res.status(200).json(index.repositories);
  } catch (error) {
    console.error('Error getting repositories:', error);
    res.status(500).json({
      error: 'Failed to get repositories',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get a specific repository by ID
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getRepositoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Create index system
    const indexSystem = new IndexSystem();

    // Get repository
    const index = indexSystem.getIndex();
    const repository = index.repositories.find((repo) => repo.id === id);

    if (!repository) {
      res.status(404).json({ error: `Repository with ID ${id} not found` });
      return;
    }

    // Return repository
    res.status(200).json(repository);
  } catch (error) {
    console.error('Error getting repository:', error);
    res.status(500).json({
      error: 'Failed to get repository',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Search repositories based on query parameters
 *
 * @param req - Express request
 * @param res - Express response
 */
export const searchRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Parse query parameters
    const { languages, frameworks, keywords, fileTypes, dateRange } = req.query;

    // Create search query
    const searchQuery: SearchQuery = {};

    if (languages) {
      searchQuery.languages = Array.isArray(languages)
        ? languages.map((lang) => String(lang))
        : [String(languages)];
    }

    if (frameworks) {
      searchQuery.frameworks = Array.isArray(frameworks)
        ? frameworks.map((fw) => String(fw))
        : [String(frameworks)];
    }

    if (keywords) {
      searchQuery.keywords = Array.isArray(keywords)
        ? keywords.map((kw) => String(kw))
        : [String(keywords)];
    }

    if (fileTypes) {
      searchQuery.fileTypes = Array.isArray(fileTypes)
        ? fileTypes.map((ft) => String(ft))
        : [String(fileTypes)];
    }

    if (dateRange) {
      const { start, end } = dateRange as { start?: string; end?: string };

      if (start && end) {
        searchQuery.dateRange = {
          start: new Date(start),
          end: new Date(end),
        };
      }
    }

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Search repositories
    const results = await analysisEngine.searchRepositories(searchQuery);

    // Return search results
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching repositories:', error);
    res.status(500).json({
      error: 'Failed to search repositories',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Find similar repositories to the specified repository
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getSimilarRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Find similar repositories
    const similarRepositories = await analysisEngine.findSimilarRepositories(id);

    // Return similar repositories
    res.status(200).json(similarRepositories);
  } catch (error) {
    console.error('Error finding similar repositories:', error);
    res.status(500).json({
      error: 'Failed to find similar repositories',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Suggest combinations of repositories
 *
 * @param req - Express request
 * @param res - Express response
 */
export const suggestCombinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoIds } = req.body;

    if (!repoIds || !Array.isArray(repoIds)) {
      res.status(400).json({ error: 'Repository IDs are required as an array' });
      return;
    }

    // Create analysis engine
    const analysisEngine = new AnalysisEngine();

    // Suggest combinations
    const combinations = await analysisEngine.suggestCombinations(repoIds);

    // Return combinations
    res.status(200).json(combinations);
  } catch (error) {
    console.error('Error suggesting combinations:', error);
    res.status(500).json({
      error: 'Failed to suggest combinations',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get relationship graph for visualization
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getRelationshipGraph = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repositoryIds } = req.query;

    // Parse repository IDs if provided
    let repoIds: string[] | undefined;
    if (repositoryIds) {
      repoIds = Array.isArray(repositoryIds)
        ? repositoryIds.map((id) => String(id))
        : [String(repositoryIds)];
    }

    // Import and create relationship service
    const { RelationshipService } = await import('../../services/relationship.service');
    const relationshipService = new RelationshipService();

    // Generate relationship graph
    const graph = await relationshipService.generateRelationshipGraph(repoIds);

    // Return graph data
    res.status(200).json(graph);
  } catch (error) {
    console.error('Error generating relationship graph:', error);
    res.status(500).json({
      error: 'Failed to generate relationship graph',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Analyze integration opportunities
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getIntegrationOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repositoryIds } = req.body;

    if (!repositoryIds || !Array.isArray(repositoryIds)) {
      res.status(400).json({ error: 'Repository IDs are required as an array' });
      return;
    }

    // Import and create relationship service
    const { RelationshipService } = await import('../../services/relationship.service');
    const relationshipService = new RelationshipService();

    // Analyze integration opportunities
    const opportunities = await relationshipService.analyzeIntegrationOpportunities(repositoryIds);

    // Return opportunities
    res.status(200).json(opportunities);
  } catch (error) {
    console.error('Error analyzing integration opportunities:', error);
    res.status(500).json({
      error: 'Failed to analyze integration opportunities',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get relationship insights and statistics
 *
 * @param req - Express request
 * @param res - Express response
 */
export const getRelationshipInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repositoryIds } = req.query;

    // Parse repository IDs if provided
    let repoIds: string[] | undefined;
    if (repositoryIds) {
      repoIds = Array.isArray(repositoryIds)
        ? repositoryIds.map((id) => String(id))
        : [String(repositoryIds)];
    }

    // Import and create relationship service
    const { RelationshipService } = await import('../../services/relationship.service');
    const relationshipService = new RelationshipService();

    // Generate relationship insights
    const insights = await relationshipService.generateRelationshipInsights(repoIds);

    // Return insights
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating relationship insights:', error);
    res.status(500).json({
      error: 'Failed to generate relationship insights',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
