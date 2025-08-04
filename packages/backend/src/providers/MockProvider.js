/**
 * Mock LLM provider implementation for testing
 */
import { LLMProvider } from './LLMProvider';
/**
 * Mock LLM provider implementation for testing
 */
export class MockProvider extends LLMProvider {
    mockResponse;
    mockTokenUsage;
    delay;
    shouldFail;
    errorMessage;
    /**
     * Creates a new MockProvider instance
     *
     * @param config - Provider configuration
     * @param options - Mock provider options
     */
    constructor(config = {}, options = {}) {
        super(config);
        this.mockResponse = options.mockResponse || 'Mock LLM response';
        this.mockTokenUsage = options.mockTokenUsage || { prompt: 100, completion: 50, total: 150 };
        this.delay = options.delay || 0;
        this.shouldFail = options.shouldFail || false;
        this.errorMessage = options.errorMessage || 'Mock provider error';
    }
    /**
     * Gets the name of the provider
     */
    get name() {
        return 'mock';
    }
    /**
     * Formats a prompt for testing based on project information
     *
     * @param projectInfo - Information about the project to analyze
     * @returns Formatted prompt string
     */
    formatPrompt(projectInfo) {
        return `Mock prompt for project: ${projectInfo.name}`;
    }
    /**
     * Simulates analyzing a prompt with configurable delay and failure options
     *
     * @param prompt - The prompt to analyze
     * @returns Promise resolving to mock LLM response
     */
    async analyze(prompt) {
        if (this.delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.delay));
        }
        if (this.shouldFail) {
            throw new Error(this.errorMessage);
        }
        return {
            content: this.mockResponse,
            tokenUsage: this.mockTokenUsage,
        };
    }
    /**
     * Sets the mock response for testing different scenarios
     *
     * @param response - The mock response text
     */
    setMockResponse(response) {
        this.mockResponse = response;
    }
    /**
     * Sets the mock token usage for testing
     *
     * @param tokenUsage - The mock token usage
     */
    setMockTokenUsage(tokenUsage) {
        this.mockTokenUsage = tokenUsage;
    }
    /**
     * Configures the provider to fail on the next analyze call
     *
     * @param shouldFail - Whether the provider should fail
     * @param errorMessage - Optional custom error message
     */
    setShouldFail(shouldFail, errorMessage) {
        this.shouldFail = shouldFail;
        if (errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
    /**
     * Sets the delay for the analyze method
     *
     * @param delayMs - Delay in milliseconds
     */
    setDelay(delayMs) {
        this.delay = delayMs;
    }
}
//# sourceMappingURL=MockProvider.js.map