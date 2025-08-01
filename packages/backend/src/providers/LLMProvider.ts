/**
 * Abstract base class for LLM providers
 */

import {
  ProviderConfig,
  LLMResponse,
  ProjectInfo,
} from '@unified-repo-analyzer/shared/src/types/provider';

/**
 * Abstract base class for LLM providers
 */
export abstract class LLMProvider {
  protected config: ProviderConfig;

  /**
   * Creates a new LLM provider instance
   *
   * @param config - Provider configuration
   */
  constructor(config: ProviderConfig) {
    this.config = this.validateAndNormalizeConfig(config);
  }

  /**
   * Gets the name of the provider
   */
  abstract get name(): string;

  /**
   * Formats a prompt for the LLM based on project information
   *
   * @param projectInfo - Information about the project to analyze
   * @returns Formatted prompt string
   */
  abstract formatPrompt(projectInfo: ProjectInfo): string;

  /**
   * Analyzes a prompt using the LLM
   *
   * @param prompt - The prompt to analyze
   * @returns Promise resolving to LLM response
   */
  abstract analyze(prompt: string): Promise<LLMResponse>;

  /**
   * Validates and normalizes the provider configuration
   *
   * @param config - Provider configuration
   * @returns Validated and normalized configuration
   * @throws Error if configuration is invalid
   */
  protected validateAndNormalizeConfig(config: ProviderConfig): ProviderConfig {
    // Default implementation - subclasses should override with specific validation
    if (!config) {
      throw new Error('Provider configuration is required');
    }

    return {
      ...config,
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
    };
  }
}
