/**
 * Registry for managing LLM providers
 */

import type { ProviderConfig } from '@unified-repo-analyzer/shared/src/types/provider';
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import type { LLMProvider } from './LLMProvider';
import { MockProvider } from './MockProvider';
import { OpenRouterProvider } from './OpenRouterProvider';

/**
 * Provider factory function type
 */
type ProviderFactory = (config: ProviderConfig) => LLMProvider;

/**
 * Registry for managing LLM providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, ProviderFactory>;
  private defaultProvider: string;
  private providerConfigs: Map<string, ProviderConfig>;

  /**
   * Creates a new ProviderRegistry instance
   */
  private constructor() {
    this.providers = new Map();
    this.providerConfigs = new Map();
    this.defaultProvider = 'mock';

    // Register built-in providers
    this.registerProvider('claude', (config) => new ClaudeProvider(config));
    this.registerProvider('gemini', (config) => new GeminiProvider(config));
    this.registerProvider('openrouter', (config) => new OpenRouterProvider(config));
    this.registerProvider('mock', (config) => new MockProvider(config));
  }

  /**
   * Gets the singleton instance of the registry
   */
  public static getInstance(): ProviderRegistry {
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
  public registerProvider(name: string, factory: ProviderFactory): void {
    this.providers.set(name.toLowerCase(), factory);
  }

  /**
   * Sets the configuration for a provider
   *
   * @param name - Provider name
   * @param config - Provider configuration
   */
  public setProviderConfig(name: string, config: ProviderConfig): void {
    this.providerConfigs.set(name.toLowerCase(), config);
  }

  /**
   * Gets the configuration for a provider
   *
   * @param name - Provider name
   * @returns Provider configuration or empty object if not set
   */
  public getProviderConfig(name: string): ProviderConfig {
    return this.providerConfigs.get(name.toLowerCase()) || {};
  }

  /**
   * Sets the default provider
   *
   * @param name - Provider name
   * @throws Error if provider is not registered
   */
  public setDefaultProvider(name: string): void {
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
  public getDefaultProviderName(): string {
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
  public createProvider(name?: string, overrideConfig?: ProviderConfig): LLMProvider {
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
  public getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Checks if a provider is registered
   *
   * @param name - Provider name
   * @returns True if provider is registered
   */
  public hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  /**
   * Resets the registry to its initial state (for testing)
   */
  public reset(): void {
    this.providers.clear();
    this.providerConfigs.clear();
    this.defaultProvider = 'mock';

    // Re-register built-in providers
    this.registerProvider('claude', (config) => new ClaudeProvider(config));
    this.registerProvider('gemini', (config) => new GeminiProvider(config));
    this.registerProvider('openrouter', (config) => new OpenRouterProvider(config));
    this.registerProvider('mock', (config) => new MockProvider(config));
  }
}
