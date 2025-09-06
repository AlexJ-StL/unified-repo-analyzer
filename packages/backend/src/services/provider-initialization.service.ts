/**
 * Provider initialization service
 * Responsible for initializing the ProviderRegistry with configurations from user preferences
 */

import { ProviderRegistry } from '../providers/ProviderRegistry';
import { logger } from '../utils/logger';
import { configurationService } from './config.service';

/**
 * Initialize providers with configurations from user preferences
 */
export async function initializeProvidersWithConfig(): Promise<void> {
  try {
    // Get user preferences
    const preferences = await configurationService.getUserPreferences();

    // Get the provider registry instance
    const registry = ProviderRegistry.getInstance();

    // Apply provider configurations from user preferences
    if (preferences.llmProvider?.providers) {
      for (const [providerId, providerConfig] of Object.entries(
        preferences.llmProvider.providers
      )) {
        // Set the provider configuration in the registry
        registry.setProviderConfig(providerId, {
          apiKey: providerConfig.apiKey,
          model: providerConfig.model,
          maxTokens: providerConfig.maxTokens,
          temperature: providerConfig.temperature,
        });
      }
    }

    // Set the default provider if specified
    if (preferences.llmProvider?.defaultProvider) {
      try {
        registry.setDefaultProvider(preferences.llmProvider.defaultProvider);
      } catch (error) {
        logger.warn('Failed to set default provider:', error);
      }
    }

    logger.info('Providers initialized with configurations');
  } catch (error) {
    logger.error('Failed to initialize providers with configurations:', error);
    throw error;
  }
}

/**
 * Update provider configurations when preferences change
 */
export async function updateProviderConfigurations(): Promise<void> {
  await initializeProvidersWithConfig();
}
