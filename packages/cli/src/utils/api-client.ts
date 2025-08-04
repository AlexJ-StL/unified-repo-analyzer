import type {
  AnalysisOptions,
  BatchAnalysisResult,
  RepositoryAnalysis,
  SearchResult,
} from '@unified-repo-analyzer/shared';
import { request } from 'undici';
import config from './config';
import { CLIError, ErrorType } from './error-handler';

/**
 * API client for communicating with the backend
 */
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.get('apiUrl');
  }

  /**
   * Analyze a single repository
   */
  async analyzeRepository(
    path: string,
    options: Partial<AnalysisOptions> = {}
  ): Promise<RepositoryAnalysis> {
    try {
      const response = await request(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          options: {
            ...config.get('defaultOptions'),
            ...options,
          },
        }),
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return (await response.body.json()) as RepositoryAnalysis;
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Failed to analyze repository: ${(error as Error).message}`,
        ErrorType.NETWORK
      );
    }
  }

  /**
   * Analyze multiple repositories
   */
  async analyzeBatch(
    paths: string[],
    options: Partial<AnalysisOptions> = {}
  ): Promise<BatchAnalysisResult> {
    try {
      const response = await request(`${this.baseUrl}/analyze/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths,
          options: {
            ...config.get('defaultOptions'),
            ...options,
          },
        }),
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return (await response.body.json()) as BatchAnalysisResult;
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Failed to analyze repositories: ${(error as Error).message}`,
        ErrorType.NETWORK
      );
    }
  }

  /**
   * Export analysis results
   */
  async exportAnalysis(
    analysisId: string,
    format: 'json' | 'markdown' | 'html' = 'json'
  ): Promise<Buffer> {
    try {
      const response = await request(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          format,
        }),
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return Buffer.from(await response.body.arrayBuffer());
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Failed to export analysis: ${(error as Error).message}`,
        ErrorType.NETWORK
      );
    }
  }

  /**
   * Search repositories
   */
  async searchRepositories(queryString: string): Promise<SearchResult[]> {
    try {
      const response = await request(`${this.baseUrl}/repositories/search?${queryString}`, {
        method: 'GET',
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return (await response.body.json()) as SearchResult[];
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Failed to search repositories: ${(error as Error).message}`,
        ErrorType.NETWORK
      );
    }
  }

  /**
   * Rebuild the repository index
   */
  async rebuildIndex(): Promise<void> {
    try {
      const response = await request(`${this.baseUrl}/index/rebuild`, {
        method: 'POST',
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(`Failed to rebuild index: ${(error as Error).message}`, ErrorType.NETWORK);
    }
  }

  /**
   * Update the repository index
   */
  async updateIndex(path?: string): Promise<void> {
    try {
      const response = await request(`${this.baseUrl}/index/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
        }),
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(`Failed to update index: ${(error as Error).message}`, ErrorType.NETWORK);
    }
  }

  /**
   * Get index status
   */
  async getIndexStatus(): Promise<{
    totalRepositories: number;
    lastUpdated: string;
    languages: string[];
    frameworks: string[];
    tags: string[];
  }> {
    try {
      const response = await request(`${this.baseUrl}/index/status`, {
        method: 'GET',
      });

      if (response.statusCode >= 400) {
        const body = (await response.body.json()) as any;
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return (await response.body.json()) as {
        totalRepositories: number;
        lastUpdated: string;
        languages: string[];
        frameworks: string[];
        tags: string[];
      };
    } catch (error) {
      if (error instanceof CLIError) {
        throw error;
      }

      throw new CLIError(
        `Failed to get index status: ${(error as Error).message}`,
        ErrorType.NETWORK
      );
    }
  }
}
