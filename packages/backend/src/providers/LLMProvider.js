/**
 * Abstract base class for LLM providers
 */
/**
 * Abstract base class for LLM providers
 */
export class LLMProvider {
    config;
    /**
     * Creates a new LLM provider instance
     *
     * @param config - Provider configuration
     */
    constructor(config) {
        this.config = this.validateAndNormalizeConfig(config);
    }
    /**
     * Validates and normalizes the provider configuration
     *
     * @param config - Provider configuration
     * @returns Validated and normalized configuration
     * @throws Error if configuration is invalid
     */
    validateAndNormalizeConfig(config) {
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
//# sourceMappingURL=LLMProvider.js.map