/**
 * Claude LLM provider implementation
 * Enhanced with comprehensive logging for debugging and monitoring
 * Requirements: 4.2, 4.3, 4.4
 */

import type {
  FileAnalysis,
  LLMResponse,
  ProjectInfo,
  ProviderConfig,
} from '@unified-repo-analyzer/shared';
import { type ErrorContext, errorClassifier } from '@unified-repo-analyzer/shared';
import axios from 'axios';
import { logger, logPerformance } from '../services/logger.service.js';
import { LLMProvider } from './LLMProvider.js';

/**
 * Claude API response interface
 */
interface ClaudeAPIResponse {
  id: string;
  type: string;
  completion: string;
  stop_reason: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Claude LLM provider implementation
 */
export class ClaudeProvider extends LLMProvider {
  private readonly API_URL = 'https://api.anthropic.com/v1/complete';

  /**
   * Gets the name of the provider
   */
  get name(): string {
    return 'claude';
  }

  /**
   * Validates and normalizes the Claude provider configuration
   *
   * @param config - Provider configuration
   * @returns Validated and normalized configuration
   * @throws Error if configuration is invalid
   */
  protected validateAndNormalizeConfig(config: ProviderConfig): ProviderConfig {
    if (!config.apiKey) {
      throw new Error('Claude API key is required');
    }

    return {
      ...config,
      model: config.model || 'claude-2.1',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
    };
  }

  /**
   * Formats a prompt for Claude based on project information
   *
   * @param projectInfo - Information about the project to analyze
   * @returns Formatted prompt string
   */
  formatPrompt(projectInfo: ProjectInfo): string {
    return `
Human: I need you to analyze this codebase and provide both an executive summary and a technical breakdown.

# Repository Information
- Name: ${projectInfo.name}
- Primary Language: ${projectInfo.language || 'Unknown'}
- File Count: ${projectInfo.fileCount}
- Directory Count: ${projectInfo.directoryCount}

${projectInfo.description ? `# Description\n${projectInfo.description}\n` : ''}

${projectInfo.readme ? `# README\n${projectInfo.readme}\n` : ''}

# Key Directories
${projectInfo.directories.map((dir: string) => `- ${dir}`).join('\n')}

# Key Files
${projectInfo.fileAnalysis
  .map((file: FileAnalysis) => {
    return `## ${file.path}
- Lines: ${file.lineCount}
- Functions: ${file.functionCount}
- Classes: ${file.classCount}
- Imports: ${file.importCount}
${file.sample ? `\`\`\`\n${file.sample}\n\`\`\`` : ''}
`;
  })
  .join('\n')}

${
  projectInfo.dependencies
    ? `# Dependencies\n${Object.entries(projectInfo.dependencies)
        .map(([name, version]) => `- ${name}: ${version}`)
        .join('\n')}\n`
    : ''
}

${
  projectInfo.devDependencies
    ? `# Dev Dependencies\n${Object.entries(projectInfo.devDependencies)
        .map(([name, version]) => `- ${name}: ${version}`)
        .join('\n')}\n`
    : ''
}

Please provide:
1. An executive summary (2-3 paragraphs) explaining the purpose and key features of this codebase in non-technical terms.
2. A technical breakdown including:
   - Architecture overview
   - Key components and their relationships
   - Technologies used and why they might have been chosen
   - Code quality assessment
   - Potential areas for improvement
`;
  }

  /**
   * Analyzes a prompt using the Claude API
   *
   * @param prompt - The prompt to analyze
   * @returns Promise resolving to LLM response
   */
  async analyze(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    const requestId = logger.getRequestId();

    logger.info(
      'Starting Claude LLM analysis',
      {
        provider: this.name,
        model: this.config.model,
        promptLength: prompt.length,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      },
      'claude-provider',
      requestId
    );

    logger.debug(
      'Claude API request details',
      {
        apiUrl: this.API_URL,
        model: this.config.model,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        promptPreview: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      },
      'claude-provider',
      requestId
    );

    try {
      const response = await axios.post<ClaudeAPIResponse>(
        this.API_URL,
        {
          prompt: prompt,
          model: this.config.model,
          max_tokens_to_sample: this.config.maxTokens,
          temperature: this.config.temperature,
          stop_sequences: ['Human:', 'Assistant:'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
            'Anthropic-Version': '2023-06-01',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      const duration = Date.now() - startTime;
      const result: LLMResponse = {
        content: response.data.completion.trim(),
        tokenUsage: {
          prompt: response.data.usage.prompt_tokens,
          completion: response.data.usage.completion_tokens,
          total: response.data.usage.total_tokens,
        },
      };

      logger.info(
        'Claude LLM analysis completed successfully',
        {
          provider: this.name,
          model: this.config.model,
          duration: `${duration}ms`,
          tokenUsage: result.tokenUsage,
          responseLength: result.content.length,
          stopReason: response.data.stop_reason,
        },
        'claude-provider',
        requestId
      );

      // Log performance metrics
      logPerformance(
        'llm_analysis_claude',
        duration,
        {
          provider: this.name,
          model: this.config.model,
          promptTokens: result.tokenUsage.prompt,
          completionTokens: result.tokenUsage.completion,
          totalTokens: result.tokenUsage.total,
          responseLength: result.content.length,
        },
        'claude-provider'
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const context: Partial<ErrorContext> = {
        provider: this.name,
        model: this.config.model,
        requestId,
        duration,
        metadata: {
          operation: 'llm_analysis',
          promptLength: prompt.length,
          maxTokens: this.config.maxTokens,
        },
      };

      let errorMessage = 'Unknown Claude API error';
      let statusCode: number | undefined;

      if (axios.isAxiosError(error)) {
        statusCode = error.response?.status;
        context.statusCode = statusCode;
        context.url = this.API_URL;
        context.method = 'POST';

        if (error.response) {
          errorMessage = `Claude API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;

          // Log specific error details based on status code
          if (error.response.status === 401) {
            logger.error(
              'Claude API authentication failed',
              error,
              {
                provider: this.name,
                statusCode: error.response.status,
                duration: `${duration}ms`,
              },
              'claude-provider',
              requestId
            );
          } else if (error.response.status === 429) {
            logger.warn(
              'Claude API rate limit exceeded',
              {
                provider: this.name,
                statusCode: error.response.status,
                duration: `${duration}ms`,
                retryAfter: error.response.headers['retry-after'],
              },
              'claude-provider',
              requestId
            );
          } else if (error.response.status >= 500) {
            logger.error(
              'Claude API server error',
              error,
              {
                provider: this.name,
                statusCode: error.response.status,
                duration: `${duration}ms`,
                responseData: error.response.data,
              },
              'claude-provider',
              requestId
            );
          }
        } else if (error.request) {
          errorMessage = 'Claude API network error - no response received';
          logger.error(
            'Claude API network error',
            error,
            {
              provider: this.name,
              duration: `${duration}ms`,
              timeout: error.code === 'ECONNABORTED',
            },
            'claude-provider',
            requestId
          );
        }
      } else {
        errorMessage = `Claude API error: ${error instanceof Error ? error.message : String(error)}`;
      }

      const classifiedError = errorClassifier.classifyError(new Error(errorMessage), context);

      logger.error(
        'Claude LLM analysis failed',
        classifiedError.originalError,
        {
          provider: this.name,
          model: this.config.model,
          duration: `${duration}ms`,
          errorId: classifiedError.id,
          errorCode: classifiedError.code,
          statusCode,
        },
        'claude-provider',
        requestId
      );

      throw new Error(errorMessage);
    }
  }
}
