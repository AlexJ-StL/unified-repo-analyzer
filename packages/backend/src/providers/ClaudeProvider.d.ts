/**
 * Claude LLM provider implementation
 */
import { ProviderConfig, LLMResponse, ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import { LLMProvider } from './LLMProvider';
/**
 * Claude LLM provider implementation
 */
export declare class ClaudeProvider extends LLMProvider {
    private readonly API_URL;
    /**
     * Gets the name of the provider
     */
    get name(): string;
    /**
     * Validates and normalizes the Claude provider configuration
     *
     * @param config - Provider configuration
     * @returns Validated and normalized configuration
     * @throws Error if configuration is invalid
     */
    protected validateAndNormalizeConfig(config: ProviderConfig): ProviderConfig;
    /**
     * Formats a prompt for Claude based on project information
     *
     * @param projectInfo - Information about the project to analyze
     * @returns Formatted prompt string
     */
    formatPrompt(projectInfo: ProjectInfo): string;
    /**
     * Analyzes a prompt using the Claude API
     *
     * @param prompt - The prompt to analyze
     * @returns Promise resolving to LLM response
     */
    analyze(prompt: string): Promise<LLMResponse>;
}
