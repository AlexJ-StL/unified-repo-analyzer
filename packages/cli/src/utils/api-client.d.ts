import type {
  AnalysisOptions,
  BatchAnalysisResult,
  RepositoryAnalysis,
  SearchResult,
} from '@unified-repo-analyzer/shared';
/**
 * API client for communicating with the backend
 */
export declare class ApiClient {
  private baseUrl;
  constructor();
  /**
   * Analyze a single repository
   */
  analyzeRepository(path: string, options?: Partial<AnalysisOptions>): Promise<RepositoryAnalysis>;
  /**
   * Analyze multiple repositories
   */
  analyzeBatch(paths: string[], options?: Partial<AnalysisOptions>): Promise<BatchAnalysisResult>;
  /**
   * Export analysis results
   */
  exportAnalysis(analysisId: string, format?: 'json' | 'markdown' | 'html'): Promise<Buffer>;
  /**
   * Search repositories
   */
  searchRepositories(queryString: string): Promise<SearchResult[]>;
  /**
   * Rebuild the repository index
   */
  rebuildIndex(): Promise<void>;
  /**
   * Update the repository index
   */
  updateIndex(path?: string): Promise<void>;
  /**
   * Get index status
   */
  getIndexStatus(): Promise<{
    totalRepositories: number;
    lastUpdated: string;
    languages: string[];
    frameworks: string[];
    tags: string[];
  }>;
}
