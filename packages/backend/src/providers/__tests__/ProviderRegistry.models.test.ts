/**
 * Tests for ProviderRegistry model selection functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterProvider } from '../OpenRouterProvider';
import { ProviderRegistry } from '../ProviderRegistry';

// Mock the OpenRouterProvider
vi.mock('../OpenRouterProvider');
const MockedOpenRouterProvider = OpenRouterProvider as vi.MockedClass<typeof OpenRouterProvider>;

describe('ProviderRegistry Model Selection', () => {
  let registry: ProviderRegistry;
  let mockOpenRouterInstance: vi.Mocked<OpenRouterProvider>;

  beforeEach(() => {
    // Reset the singleton instance
    (ProviderRegistry as any).instance = undefined;
    registry = ProviderRegistry.getInstance();

    // Create mock instance
    mockOpenRouterInstance = {
      fetchModels: vi.fn(),
      validateModel: vi.fn(),
      getModelRecommendations: vi.fn(),
    } as any;

    MockedOpenRouterProvider.mockImplementation(() => mockOpenRouterInstance);

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
    it('should fetch models for OpenRouter provider', async () => {
      const mockModels = [
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          pricing: { prompt: 0.00025, completion: 0.00125 },
        },
      ];

      mockOpenRouterInstance.fetchModels.mockResolvedValueOnce(mockModels);

      const result = await registry.fetchProviderModels('openrouter', 'test-api-key');

      expect(mockOpenRouterInstance.fetchModels).toHaveBeenCalledWith('test-api-key');
      expect(result).toEqual(mockModels);
    });

    it("should throw error for providers that don't support model fetching", async () => {
      await expect(registry.fetchProviderModels('claude', 'test-api-key')).rejects.toThrow(
        "Provider 'claude' does not support model fetching"
      );
    });

    it('should throw error for non-existent providers', async () => {
      await expect(registry.fetchProviderModels('non-existent', 'test-api-key')).rejects.toThrow(
        "Provider 'non-existent' is not registered"
      );
    });
  });

  describe('validateProviderModel', () => {
    it('should validate model for OpenRouter provider', async () => {
      const mockValidation = {
        valid: true,
        model: {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
      };

      mockOpenRouterInstance.validateModel.mockResolvedValueOnce(mockValidation);

      const result = await registry.validateProviderModel(
        'openrouter',
        'openai/gpt-4',
        'test-api-key'
      );

      expect(mockOpenRouterInstance.validateModel).toHaveBeenCalledWith(
        'openai/gpt-4',
        'test-api-key'
      );
      expect(result).toEqual(mockValidation);
    });

    it('should validate non-empty model IDs for other providers', async () => {
      const result = await registry.validateProviderModel(
        'claude',
        'claude-3-haiku-20240307',
        'test-api-key'
      );

      expect(result.valid).toBe(true);
    });

    it('should reject empty model IDs for other providers', async () => {
      const result = await registry.validateProviderModel('claude', '', 'test-api-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Model ID is required');
    });

    it('should reject whitespace-only model IDs', async () => {
      const result = await registry.validateProviderModel('claude', '   ', 'test-api-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Model ID is required');
    });
  });

  describe('getProviderModelRecommendations', () => {
    it('should get recommendations for OpenRouter provider', () => {
      const mockRecommendations = {
        maxTokens: 4000,
        temperature: 0.7,
      };

      mockOpenRouterInstance.getModelRecommendations.mockReturnValueOnce(mockRecommendations);

      const result = registry.getProviderModelRecommendations('openrouter', 'openai/gpt-4');

      expect(mockOpenRouterInstance.getModelRecommendations).toHaveBeenCalledWith('openai/gpt-4');
      expect(result).toEqual(mockRecommendations);
    });

    it('should return default recommendations for other providers', () => {
      const result = registry.getProviderModelRecommendations('claude', 'claude-3-haiku-20240307');

      expect(result).toEqual({
        maxTokens: 4000,
        temperature: 0.7,
      });
    });

    it('should handle non-existent providers gracefully', () => {
      expect(() => {
        registry.getProviderModelRecommendations('non-existent', 'some-model');
      }).toThrow("Provider 'non-existent' is not registered");
    });
  });

  describe('integration with provider status', () => {
    it('should update provider info to include model selection capability', () => {
      const providerInfo = registry.getAllProviderInfo();
      const openRouterInfo = providerInfo.find((p) => p.id === 'openrouter');

      expect(openRouterInfo).toBeDefined();
      expect(openRouterInfo?.capabilities).toContain('model-selection');
    });

    it('should not include model selection capability for other providers', () => {
      const providerInfo = registry.getAllProviderInfo();
      const claudeInfo = providerInfo.find((p) => p.id === 'claude');

      expect(claudeInfo).toBeDefined();
      expect(claudeInfo?.capabilities).not.toContain('model-selection');
    });
  });
});
