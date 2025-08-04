/**
 * Mock LLM provider implementation for testing
 */
import { ProviderConfig, LLMResponse, ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import { LLMProvider } from './LLMProvider';
/**
 * Mock LLM provider implementation for testing
 */
export declare class MockProvider extends LLMProvider {
    private mockResponse;
    private mockTokenUsage;
    private delay;
    private shouldFail;
    private errorMessage;
    /**
     * Creates a new MockProvider instance
     *
     * @param config - Provider configuration
     * @param options - Mock provider options
     */
    constructor(config?: ProviderConfig, options?: {
        mockResponse?: string;
        mockTokenUsage?: {
            prompt: number;
            completion: number;
            total: number;
        };
        delay?: number;
        shouldFail?: boolean;
        errorMessage?: string;
    });
    /**
     * Gets the name of the provider
     */
    get name(): string;
    /**
     * Formats a prompt for testing based on project information
     *
     * @param projectInfo - Information about the project to analyze
     * @returns Formatted prompt string
     */
    formatPrompt(projectInfo: ProjectInfo): string;
    /**
     * Simulates analyzing a prompt with configurable delay and failure options
     *
     * @param prompt - The prompt to analyze
     * @returns Promise resolving to mock LLM response
     */
    analyze(prompt: string): Promise<LLMResponse>;
    /**
     * Sets the mock response for testing different scenarios
     *
     * @param response - The mock response text
     */
    setMockResponse(response: string): void;
    /**
     * Sets the mock token usage for testing
     *
     * @param tokenUsage - The mock token usage
     */
    setMockTokenUsage(tokenUsage: {
        prompt: number;
        completion: number;
        total: number;
    }): void;
    /**
     * Configures the provider to fail on the next analyze call
     *
     * @param shouldFail - Whether the provider should fail
     * @param errorMessage - Optional custom error message
     */
    setShouldFail(shouldFail: boolean, errorMessage?: string): void;
    /**
     * Sets the delay for the analyze method
     *
     * @param delayMs - Delay in milliseconds
     */
    setDelay(delayMs: number): void;
}
