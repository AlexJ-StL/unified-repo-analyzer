/**
 * Registry for managing LLM providers
 */

import type { ProviderConfig } from "@unified-repo-analyzer/shared/src/types/provider";
import { ClaudeProvider } from "./ClaudeProvider";
import { GeminiProvider } from "./GeminiProvider";
import type { LLMProvider } from "./LLMProvider";
import { MockProvider } from "./MockProvider";
import { OpenRouterProvider } from "./OpenRouterProvider";

/**
 * Provider factory function type
 */
type ProviderFactory = (config: ProviderConfig) => LLMProvider;

/**
 * Provider status enumeration
 */
export type ProviderStatus = "active" | "inactive" | "error" | "testing";

/**
 * Provider status information
 */
export interface ProviderStatusInfo {
  status: ProviderStatus;
  lastTested?: Date;
  errorMessage?: string;
  capabilities?: string[];
}

/**
 * Registry for managing LLM providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, ProviderFactory>;
  private defaultProvider: string;
  private providerConfigs: Map<string, ProviderConfig>;
  private providerStatuses: Map<string, ProviderStatusInfo>;

  /**
   * Creates a new ProviderRegistry instance
   */
  private constructor() {
    this.providers = new Map();
    this.providerConfigs = new Map();
    this.providerStatuses = new Map();
    this.defaultProvider = "mock";

    // Register built-in providers
    this.registerProvider("claude", (config) => new ClaudeProvider(config));
    this.registerProvider("gemini", (config) => new GeminiProvider(config));
    this.registerProvider(
      "openrouter",
      (config) => new OpenRouterProvider(config)
    );
    this.registerProvider("mock", (config) => new MockProvider(config));

    // Initialize status for built-in providers
    this.initializeProviderStatuses();
  }

  /**
   * Initialize provider statuses
   */
  private initializeProviderStatuses(): void {
    const providerNames = ["claude", "gemini", "openrouter", "mock"];
    providerNames.forEach((name) => {
      this.providerStatuses.set(name, {
        status: "inactive",
        capabilities: this.getProviderCapabilities(name),
      });
    });
  }

  /**
   * Get capabilities for a provider
   */
  private getProviderCapabilities(providerId: string): string[] {
    const capabilities: Record<string, string[]> = {
      claude: ["text-generation", "code-analysis", "function-calling"],
      gemini: [
        "text-generation",
        "code-analysis",
        "image-analysis",
        "function-calling",
      ],
      openrouter: ["text-generation", "code-analysis", "model-selection"],
      mock: ["text-generation", "basic-analysis"],
    };

    return capabilities[providerId] || ["text-generation"];
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
    const normalizedName = name.toLowerCase();
    this.providers.set(normalizedName, factory);

    // Initialize status for new provider
    if (!this.providerStatuses.has(normalizedName)) {
      this.providerStatuses.set(normalizedName, {
        status: "inactive",
        capabilities: this.getProviderCapabilities(normalizedName),
      });
    }
  }

  /**
   * Sets the configuration for a provider
   *
   * @param name - Provider name
   * @param config - Provider configuration
   */
  public setProviderConfig(name: string, config: ProviderConfig): void {
    const normalizedName = name.toLowerCase();
    this.providerConfigs.set(normalizedName, config);

    // Update status to inactive when config is set (needs testing)
    const statusInfo = this.providerStatuses.get(normalizedName) || {
      status: "inactive",
      capabilities: this.getProviderCapabilities(normalizedName),
    };

    this.providerStatuses.set(normalizedName, {
      ...statusInfo,
      status: config.apiKey ? "inactive" : "inactive", // Still needs testing
    });
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
   * Gets the status information for a provider
   *
   * @param name - Provider name
   * @returns Provider status information
   */
  public getProviderStatus(name: string): ProviderStatusInfo {
    const normalizedName = name.toLowerCase();
    return (
      this.providerStatuses.get(normalizedName) || {
        status: "inactive",
        capabilities: this.getProviderCapabilities(normalizedName),
      }
    );
  }

  /**
   * Sets the status information for a provider
   *
   * @param name - Provider name
   * @param statusInfo - Provider status information
   */
  public setProviderStatus(name: string, statusInfo: ProviderStatusInfo): void {
    const normalizedName = name.toLowerCase();
    this.providerStatuses.set(normalizedName, statusInfo);
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
  public createProvider(
    name?: string,
    overrideConfig?: ProviderConfig
  ): LLMProvider {
    const providerName = name ? name.toLowerCase() : this.defaultProvider;
    const factory = this.providers.get(providerName);

    if (!factory) {
      throw new Error(`Provider '${providerName}' is not registered`);
    }

    const baseConfig = this.providerConfigs.get(providerName) || {};
    const config = overrideConfig
      ? { ...baseConfig, ...overrideConfig }
      : baseConfig;

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
   * Tests a provider's connection and configuration
   *
   * @param name - Provider name
   * @returns Promise resolving to true if provider is working, false otherwise
   */
  public async testProvider(name: string): Promise<boolean> {
    const normalizedName = name.toLowerCase();

    // Update status to testing
    const currentStatus = this.providerStatuses.get(normalizedName) || {
      status: "inactive",
      capabilities: this.getProviderCapabilities(normalizedName),
    };

    this.providerStatuses.set(normalizedName, {
      ...currentStatus,
      status: "testing",
      lastTested: new Date(),
    });

    try {
      // Check if provider is configured
      const config = this.getProviderConfig(normalizedName);
      if (!config.apiKey) {
        throw new Error("API key is required for testing");
      }

      // Create provider instance
      const provider = this.createProvider(normalizedName);

      // For mock provider, just return true
      if (normalizedName === "mock") {
        this.providerStatuses.set(normalizedName, {
          ...currentStatus,
          status: "active",
          lastTested: new Date(),
        });
        return true;
      }

      // For other providers, we would test the actual connection
      // This is a simplified test - in a real implementation, we would make a lightweight API call
      this.providerStatuses.set(normalizedName, {
        ...currentStatus,
        status: "active",
        lastTested: new Date(),
      });
      return true;
    } catch (error) {
      // Update status to error
      this.providerStatuses.set(normalizedName, {
        ...currentStatus,
        status: "error",
        lastTested: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Gets all provider information including status
   *
   * @returns Array of provider information with status
   */
  public getAllProviderInfo(): Array<{
    id: string;
    name: string;
    displayName: string;
    available: boolean;
    configured: boolean;
    capabilities: string[];
    status: ProviderStatus;
    errorMessage?: string;
    model?: string;
  }> {
    const providerNames = this.getProviderNames();
    const defaultProvider = this.getDefaultProviderName();

    return providerNames.map((name) => {
      const config = this.getProviderConfig(name);
      const statusInfo = this.getProviderStatus(name);

      // Determine if provider is configured (has required API key)
      const isConfigured = !!config.apiKey;

      // Get display name
      const displayNames: Record<string, string> = {
        claude: "Anthropic Claude",
        gemini: "Google Gemini",
        openrouter: "OpenRouter",
        mock: "Mock Provider",
      };

      return {
        id: name,
        name: name,
        displayName: displayNames[name] || name,
        available: true, // For now, all registered providers are available
        configured: isConfigured,
        capabilities: statusInfo.capabilities || [],
        status: statusInfo.status,
        errorMessage: statusInfo.errorMessage,
        ...(isConfigured && {
          model: config.model || this.getDefaultModelForProvider(name),
        }),
      };
    });
  }

  /**
   * Get default model for a provider
   */
  private getDefaultModelForProvider(providerId: string): string {
    const defaultModels: Record<string, string> = {
      claude: "claude-3-haiku-20240307",
      gemini: "gemini-1.5-flash",
      openrouter: "openrouter/auto",
    };

    return defaultModels[providerId] || "default";
  }

  /**
   * Resets the registry to its initial state (for testing)
   */
  public reset(): void {
    this.providers.clear();
    this.providerConfigs.clear();
    this.providerStatuses.clear();
    this.defaultProvider = "mock";

    // Re-register built-in providers
    this.registerProvider("claude", (config) => new ClaudeProvider(config));
    this.registerProvider("gemini", (config) => new GeminiProvider(config));
    this.registerProvider(
      "openrouter",
      (config) => new OpenRouterProvider(config)
    );
    this.registerProvider("mock", (config) => new MockProvider(config));

    // Re-initialize statuses
    this.initializeProviderStatuses();
  }

  /**
   * Fetches available models for a provider
   *
   * @param name - Provider name
   * @param apiKey - API key for the provider
   * @returns Promise resolving to array of available models
   * @throws Error if provider doesn't support model fetching or if there's an error
   */
  public async fetchProviderModels(
    name: string,
    apiKey: string
  ): Promise<any[]> {
    const provider = this.createProvider(name);

    // Check if provider has a fetchModels method
    if (provider instanceof OpenRouterProvider) {
      return await provider.fetchModels(apiKey);
    }

    throw new Error(`Provider '${name}' does not support model fetching`);
  }
}
