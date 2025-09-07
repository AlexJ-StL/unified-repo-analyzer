/**
 * Core Analysis Engine for repository processing
 */
import {
  AnalysisOptions,
  RepositoryAnalysis,
  BatchAnalysisResult,
  OutputFormat,
  SearchQuery,
  SearchResult,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import { RepositoryMatch } from './IndexSystem';
/**
 * Core Analysis Engine for repository processing
 */
export declare class AnalysisEngine {
  private advancedAnalyzer;
  constructor();
  /**
   * Analyzes a single repository
   *
   * @param repoPath - Path to the repository
   * @param options - Analysis options
   * @returns Promise resolving to repository analysis
   */
  analyzeRepository(repoPath: string, options: AnalysisOptions): Promise<RepositoryAnalysis>;
  /**
   * Analyzes multiple repositories
   *
   * @param repoPaths - Paths to repositories
   * @param options - Analysis options
   * @returns Promise resolving to batch analysis result
   */
  analyzeMultipleRepositories(
    repoPaths: string[],
    options: AnalysisOptions
  ): Promise<BatchAnalysisResult>;
  /**
   * Analyzes multiple repositories using a queue system for concurrency control
   *
   * @param repoPaths - Paths to repositories
   * @param options - Analysis options
   * @param concurrency - Maximum number of concurrent analyses
   * @param progressCallback - Callback for progress updates
   * @returns Promise resolving to batch analysis result
   */
  analyzeMultipleRepositoriesWithQueue(
    repoPaths: string[],
    options: AnalysisOptions,
    concurrency?: number,
    progressCallback?: (progress: unknown) => void
  ): Promise<BatchAnalysisResult>;
  /**
   * Generates combined insights for multiple repositories
   *
   * @param repositories - Repository analyses
   * @returns Combined insights
   */
  private generateCombinedInsights;
  /**
   * Generates a synopsis of the repository analysis
   *
   * @param analysis - Repository analysis
   * @param format - Output format
   * @returns Promise resolving to synopsis string
   */
  generateSynopsis(analysis: RepositoryAnalysis, format: OutputFormat): Promise<string>;
  /**
   * Updates the repository index with analysis results
   *
   * @param analysis - Repository analysis
   * @returns Promise resolving when index is updated
   */
  updateIndex(analysis: RepositoryAnalysis): Promise<void>;
  /**
   * Gets the index system instance
   *
   * @returns IndexSystem instance
   */
  private getIndexSystem;
  private _indexSystem;
  /**
   * Processes files for detailed code analysis
   *
   * @param analysis - Repository analysis
   * @param options - Analysis options
   * @returns Promise resolving when processing is complete
   */
  private processFilesForAnalysis;
  /**
   * Searches repositories based on query criteria
   *
   * @param query - Search query parameters
   * @returns Promise resolving to search results
   */
  searchRepositories(query: SearchQuery): Promise<SearchResult[]>;
  /**
   * Finds similar repositories to the specified repository
   *
   * @param repoId - Repository ID to find similar repositories for
   * @returns Promise resolving to repository matches
   */
  findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]>;
  /**
   * Suggests combinations of repositories that could work well together
   *
   * @param repoIds - Repository IDs to suggest combinations for
   * @returns Promise resolving to combination suggestions
   */
  suggestCombinations(repoIds: string[]): Promise<unknown[]>;
}
