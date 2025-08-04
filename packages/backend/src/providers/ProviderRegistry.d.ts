/**
 * Registry for managing LLM providers
 */
import { ProviderConfig } from '@unified-repo-analyzer/shared/src/types/provider';
import { LLMProvider } from './LLMProvider';
/**
 * Provider factory function type
 */
type ProviderFactory = (config: ProviderConfig) => LLMProvider;
/**
 * Registry for managing LLM providers
 */
export declare class ProviderRegistry {
  private static instance;
  private providers;
  private defaultProvider;
  private providerConfigs;
  /**
   * Creates a new ProviderRegistry instance
   */
  private constructor();
  /**
   * Gets the singleton instance of the registry
   */
  static getInstance(): ProviderRegistry;
  /**
   * Registers a new provider factory
   *
   * @param name - Provider name
   * @param factory - Provider factory function
   */
  registerProvider(name: string, factory: ProviderFactory): void;
  /**
   * Sets the configuration for a provider
   *
   * @param name - Provider name
   * @param config - Provider configuration
   */
  setProviderConfig(name: string, config: ProviderConfig): void;
  /**
   * Gets the configuration for a provider
   *
   * @param name - Provider name
   * @returns Provider configuration or empty object if not set
   */
  getProviderConfig(name: string): ProviderConfig;
  /**
   * Sets the default provider
   *
   * @param name - Provider name
   * @throws Error if provider is not registered
   */
  setDefaultProvider(name: string): void;
  /**
   * Gets the default provider name
   *
   * @returns Default provider name
   */
  getDefaultProviderName(): string;
  /**
   * Creates a provider instance
   *
   * @param name - Provider name (optional, uses default if not specified)
   * @param overrideConfig - Optional configuration to override the registered config
   * @returns Provider instance
   * @throws Error if provider is not registered
   */
  createProvider(name?: string, overrideConfig?: ProviderConfig): LLMProvider;
  /**
   * Gets all registered provider names
   *
   * @returns Array of provider names
   */
  getProviderNames(): string[];
  /**
   * Checks if a provider is registered
   *
   * @param name - Provider name
   * @returns True if provider is registered
   */
  hasProvider(name: string): boolean;
  /**
   * Resets the registry to its initial state (for testing)
   */
  reset(): void;
}
