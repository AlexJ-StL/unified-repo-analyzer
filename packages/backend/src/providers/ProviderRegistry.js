/**
 * Registry for managing LLM providers
 */
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { MockProvider } from './MockProvider';
/**
 * Registry for managing LLM providers
 */
export class ProviderRegistry {
    static instance;
    providers;
    defaultProvider;
    providerConfigs;
    /**
     * Creates a new ProviderRegistry instance
     */
    constructor() {
        this.providers = new Map();
        this.providerConfigs = new Map();
        this.defaultProvider = 'mock';
        // Register built-in providers
        this.registerProvider('claude', (config) => new ClaudeProvider(config));
        this.registerProvider('gemini', (config) => new GeminiProvider(config));
        this.registerProvider('mock', (config) => new MockProvider(config));
    }
    /**
     * Gets the singleton instance of the registry
     */
    static getInstance() {
        if (!ProviderRegistry.instance) {
            ProviderRegistry.instance = new ProviderRegistry();
        }
        return ProviderRegistry.instance;
    }
    /**
     * Registers a new provider factory
     *
     * @param name - Provider name
     * @param factory - Provider factory function
     */
    registerProvider(name, factory) {
        this.providers.set(name.toLowerCase(), factory);
    }
    /**
     * Sets the configuration for a provider
     *
     * @param name - Provider name
     * @param config - Provider configuration
     */
    setProviderConfig(name, config) {
        this.providerConfigs.set(name.toLowerCase(), config);
    }
    /**
     * Gets the configuration for a provider
     *
     * @param name - Provider name
     * @returns Provider configuration or empty object if not set
     */
    getProviderConfig(name) {
        return this.providerConfigs.get(name.toLowerCase()) || {};
    }
    /**
     * Sets the default provider
     *
     * @param name - Provider name
     * @throws Error if provider is not registered
     */
    setDefaultProvider(name) {
        const normalizedName = name.toLowerCase();
        if (!this.providers.has(normalizedName)) {
            throw new Error(`Provider '${name}' is not registered`);
        }
        this.defaultProvider = normalizedName;
    }
    /**
     * Gets the default provider name
     *
     * @returns Default provider name
     */
    getDefaultProviderName() {
        return this.defaultProvider;
    }
    /**
     * Creates a provider instance
     *
     * @param name - Provider name (optional, uses default if not specified)
     * @param overrideConfig - Optional configuration to override the registered config
     * @returns Provider instance
     * @throws Error if provider is not registered
     */
    createProvider(name, overrideConfig) {
        const providerName = name ? name.toLowerCase() : this.defaultProvider;
        const factory = this.providers.get(providerName);
        if (!factory) {
            throw new Error(`Provider '${providerName}' is not registered`);
        }
        const baseConfig = this.providerConfigs.get(providerName) || {};
        const config = overrideConfig ? { ...baseConfig, ...overrideConfig } : baseConfig;
        return factory(config);
    }
    /**
     * Gets all registered provider names
     *
     * @returns Array of provider names
     */
    getProviderNames() {
        return Array.from(this.providers.keys());
    }
    /**
     * Checks if a provider is registered
     *
     * @param name - Provider name
     * @returns True if provider is registered
     */
    hasProvider(name) {
        return this.providers.has(name.toLowerCase());
    }
    /**
     * Resets the registry to its initial state (for testing)
     */
    reset() {
        this.providers.clear();
        this.providerConfigs.clear();
        this.defaultProvider = 'mock';
        // Re-register built-in providers
        this.registerProvider('claude', (config) => new ClaudeProvider(config));
        this.registerProvider('gemini', (config) => new GeminiProvider(config));
        this.registerProvider('mock', (config) => new MockProvider(config));
    }
}
//# sourceMappingURL=ProviderRegistry.js.map