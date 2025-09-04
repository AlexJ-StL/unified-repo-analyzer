/**
 * Tests for ProviderRegistry model selection functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderRegistry } from '../ProviderRegistry';

describe('ProviderRegistry Model Selection', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    // Reset the singleton instance
    (ProviderRegistry as any).instance = undefined;
    registry = ProviderRegistry.getInstance();

    // Set up provider configuration
    registry.setProviderConfig('openrouter', {
      apiKey: 'test-api-key',
      model: 'openrouter/auto',
      maxTokens: 4000,
      temperature: 0.7,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchProviderModels', () => {
    it('should throw error when provider not found', async () => {
      await expect(registry.fetchProviderModels('nonexistent', 'test-key')).rejects.toThrow(
        "Provider 'nonexistent' is not registered"
      );
    });

    it('should handle OpenRouter provider', async () => {
      // This test would need actual OpenRouter integration
      // For now, just test that the method exists and returns an array
      const models = await registry.fetchProviderModels('openrouter', 'test-key');
      expect(Array.isArray(models)).toBe(true);
    });
  });

  describe('validateProviderModel', () => {
    it('should throw error for invalid provider', async () => {
      await expect(
        registry.validateProviderModel('nonexistent', 'model', 'test-key')
      ).rejects.toThrow("Provider 'nonexistent' is not registered");
    });

    it('should handle OpenRouter provider', async () => {
      // This test would need actual OpenRouter integration
      // For now, just test that the method exists and returns a promise
      const result = registry.validateProviderModel('openrouter', 'openai/gpt-4', 'test-key');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('provider configuration', () => {
    it('should set and get provider config', () => {
      const config = {
        apiKey: 'test-key',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.5,
      };

      registry.setProviderConfig('openrouter', config);
      const retrievedConfig = registry.getProviderConfig('openrouter');

      expect(retrievedConfig).toEqual(config);
    });
  });
});
