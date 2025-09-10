/**
 * OpenRouter LLM provider implementation
 */

import type { LLMResponse, ProjectInfo, ProviderConfig } from '@unified-repo-analyzer/shared';
import axios from 'axios';
import { LLMProvider } from './LLMProvider.js';

/**
 * OpenRouter API response interface
 */
interface OpenRouterAPIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * OpenRouter LLM provider implementation
 */
export class OpenRouterProvider extends LLMProvider {
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly MODELS_URL = 'https://openrouter.ai/api/v1/models';

  /**
   * Gets the name of the provider
   */
  get name(): string {
    return 'openrouter';
  }

  /**
   * Validates and normalizes the OpenRouter provider configuration
   *
   * @param config - Provider configuration
   * @returns Validated and normalized configuration
   * @throws Error if configuration is invalid
   */
  protected validateAndNormalizeConfig(config: ProviderConfig): ProviderConfig {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    return {
      ...config,
      model: config.model || 'openrouter/auto',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
    };
  }

  /**
   * Formats a prompt for OpenRouter based on project information
   *
   * @param projectInfo - Information about the project to analyze
   * @returns Formatted prompt string
   */
  formatPrompt(projectInfo: ProjectInfo): string {
    return `
Analyze this codebase and provide both an executive summary and a technical breakdown.

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
  .map((file: any) => {
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
   * Analyzes a prompt using the OpenRouter API
   *
   * @param prompt - The prompt to analyze
   * @returns Promise resolving to LLM response
   */
  async analyze(prompt: string): Promise<LLMResponse> {
    try {
      const response = await axios.post<OpenRouterAPIResponse>(
        this.API_URL,
        {
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://unified-repo-analyzer.com', // Optional, for OpenRouter analytics
            'X-Title': 'Unified Repo Analyzer', // Optional, for OpenRouter analytics
          },
          timeout: 60000, // 60 second timeout
        }
      );

      // Check if we have a valid response
      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('OpenRouter returned no choices');
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error('OpenRouter returned no content');
      }

      return {
        content: choice.message.content.trim(),
        tokenUsage: {
          prompt: response.data.usage.prompt_tokens,
          completion: response.data.usage.completion_tokens,
          total: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      }
      throw new Error(
        `OpenRouter API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Fetches available models from OpenRouter
   *
   * @param apiKey - OpenRouter API key
   * @returns Promise resolving to array of available models
   */
  async fetchModels(apiKey: string): Promise<unknown[]> {
    try {
      const response = await axios.get(this.MODELS_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000, // 10 second timeout
      });

      // Return the models array from the response
      const models = response.data?.data || [];

      // Filter and sort models for better usability
      return models
        .filter((model: unknown) => {
          if (typeof model !== 'object' || model === null) return false;
          const m = model as { id?: unknown; name?: unknown };
          return m.id && m.name;
        })
        .sort((a: unknown, b: unknown) => {
          if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return 0;
          const modelA = a as { id?: string; name?: string };
          const modelB = b as { id?: string; name?: string };

          // Sort by name, but prioritize popular models
          const popularModels = [
            'anthropic/claude-3-haiku',
            'anthropic/claude-3-sonnet',
            'anthropic/claude-3-opus',
            'openai/gpt-4',
            'openai/gpt-3.5-turbo',
            'meta-llama/llama-2-70b-chat',
            'google/gemini-pro',
          ];

          const aIndex = modelA.id
            ? popularModels.findIndex((popular) => modelA.id?.includes(popular))
            : -1;
          const bIndex = modelB.id
            ? popularModels.findIndex((popular) => modelB.id?.includes(popular))
            : -1;

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          return (modelA.name || '').localeCompare(modelB.name || '');
        });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `OpenRouter Models API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      }
      throw new Error(
        `OpenRouter Models API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validates a specific model configuration
   *
   * @param modelId - Model ID to validate
   * @param apiKey - OpenRouter API key
   * @returns Promise resolving to validation result
   */
  async validateModel(
    modelId: string,
    apiKey: string
  ): Promise<{
    valid: boolean;
    model?: unknown;
    error?: string;
  }> {
    try {
      const models = await this.fetchModels(apiKey);
      const model = models.find((m: unknown) => {
        if (typeof m !== 'object' || m === null) return false;
        const modelObj = m as { id?: string };
        return modelObj.id === modelId;
      });

      if (!model) {
        return {
          valid: false,
          error: `Model '${modelId}' not found in available models`,
        };
      }

      return {
        valid: true,
        model,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Gets model-specific configuration recommendations
   *
   * @param modelId - Model ID
   * @returns Recommended configuration for the model
   */
  getModelRecommendations(modelId: string): Partial<ProviderConfig> {
    const recommendations: Record<string, Partial<ProviderConfig>> = {
      // Claude models
      'anthropic/claude-3-haiku': { maxTokens: 4000, temperature: 0.7 },
      'anthropic/claude-3-sonnet': { maxTokens: 4000, temperature: 0.7 },
      'anthropic/claude-3-opus': { maxTokens: 4000, temperature: 0.7 },

      // GPT models
      'openai/gpt-4': { maxTokens: 4000, temperature: 0.7 },
      'openai/gpt-3.5-turbo': { maxTokens: 4000, temperature: 0.7 },

      // Llama models
      'meta-llama/llama-2-70b-chat': { maxTokens: 4000, temperature: 0.8 },

      // Gemini models
      'google/gemini-pro': { maxTokens: 4000, temperature: 0.7 },
    };

    // Find exact match or partial match
    const exactMatch = recommendations[modelId];
    if (exactMatch) return exactMatch;

    // Try partial matching for model families
    for (const [key, config] of Object.entries(recommendations)) {
      if (modelId.includes(key.split('/')[1]?.split('-')[0] || '')) {
        return config;
      }
    }

    // Default recommendations
    return { maxTokens: 4000, temperature: 0.7 };
  }
}
