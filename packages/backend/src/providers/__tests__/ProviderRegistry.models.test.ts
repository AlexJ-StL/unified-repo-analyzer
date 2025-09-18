/**
 * Tests for ProviderRegistry model selection functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderRegistry } from '../ProviderRegistry.js';

// Mock axios to prevent network calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: 'openai/gpt-4', name: 'GPT-4' },
          { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
          { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        ],
      },
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        id: 'test-response-id',
        choices: [
          {
            message: {
              content: 'Test response content',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        model: 'openrouter/auto',
      },
    }),
  },
}));

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
      const models = await registry.fetchProviderModels('openrouter', 'test-key');
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
    });
  });

  describe('validateProviderModel', () => {
    it('should throw error for invalid provider', async () => {
      await expect(
        registry.validateProviderModel('nonexistent', 'model', 'test-key')
      ).rejects.toThrow("Provider 'nonexistent' is not registered");
    });

    it('should handle OpenRouter provider', async () => {
      const result = await registry.validateProviderModel('openrouter', 'openai/gpt-4', 'test-key');
      expect(result).toHaveProperty('valid');
      expect(result.valid).toBe(true);
      expect(result).toHaveProperty('model');
      expect(result.model).toHaveProperty('id', 'openai/gpt-4');
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
