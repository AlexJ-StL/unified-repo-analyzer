import { request } from 'undici';
import {
  AnalysisOptions,
  RepositoryAnalysis,
  BatchAnalysisResult,
} from '@unified-repo-analyzer/shared';
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
        const body = await response.body.json();
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
        const body = await response.body.json();
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
        const body = await response.body.json();
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
  async searchRepositories(query: string): Promise<any> {
    try {
      const response = await request(
        `${this.baseUrl}/repositories/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
        }
      );

      if (response.statusCode >= 400) {
        const body = await response.body.json();
        throw new CLIError(
          body.message || `API error: ${response.statusCode}`,
          response.statusCode === 401 ? ErrorType.AUTHENTICATION : ErrorType.NETWORK
        );
      }

      return await response.body.json();
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
}
