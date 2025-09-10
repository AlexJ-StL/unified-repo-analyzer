/**
 * Tests for OpenRouter provider model selection functionality
 */

import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterProvider } from '../OpenRouterProvider.js';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('OpenRouterProvider Model Selection', () => {
  let provider: OpenRouterProvider;

  beforeEach(() => {
    provider = new OpenRouterProvider({
      apiKey: 'test-api-key',
      model: 'openrouter/auto',
      maxTokens: 4000,
      temperature: 0.7,
    });
    vi.clearAllMocks();
  });

  describe('fetchModels', () => {
    it('should fetch and sort models from OpenRouter API', async () => {
      const mockModels = [
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
          context_length: 8192,
          architecture: { modality: 'text', tokenizer: 'cl100k_base' },
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          pricing: { prompt: 0.00025, completion: 0.00125 },
          context_length: 200000,
          architecture: { modality: 'text', tokenizer: 'claude' },
        },
        {
          id: 'meta-llama/llama-2-70b-chat',
          name: 'Llama 2 70B Chat',
          pricing: { prompt: 0.0007, completion: 0.0009 },
          context_length: 4096,
          architecture: { modality: 'text', tokenizer: 'llama' },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockModels },
      });

      const result = await provider.fetchModels('test-api-key');

      expect(mockedAxios.get).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-api-key',
        },
        timeout: 10000,
      });

      expect(result).toHaveLength(3);
      // Should prioritize popular models (Claude should come first)
      expect(result[0].id).toBe('anthropic/claude-3-haiku');
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      });

      await expect(provider.fetchModels('invalid-key')).rejects.toThrow(
        'OpenRouter Models API error: 401'
      );
    });

    it('should filter out models without id or name', async () => {
      const mockModels = [
        {
          id: 'valid/model',
          name: 'Valid Model',
          pricing: { prompt: 0.01, completion: 0.02 },
          context_length: 4096,
          architecture: { modality: 'text', tokenizer: 'gpt' },
        },
        {
          // Missing id
          name: 'Invalid Model 1',
          pricing: { prompt: 0.01, completion: 0.02 },
        },
        {
          id: 'another/valid',
          // Missing name
          pricing: { prompt: 0.01, completion: 0.02 },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockModels },
      });

      const result = await provider.fetchModels('test-api-key');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid/model');
    });
  });

  describe('validateModel', () => {
    it('should validate existing model successfully', async () => {
      const mockModels = [
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
          context_length: 8192,
          architecture: { modality: 'text', tokenizer: 'cl100k_base' },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockModels },
      });

      const result = await provider.validateModel('openai/gpt-4', 'test-api-key');

      expect(result.valid).toBe(true);
      expect(result.model).toEqual(mockModels[0]);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for non-existent model', async () => {
      const mockModels = [
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
          context_length: 8192,
          architecture: { modality: 'text', tokenizer: 'cl100k_base' },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockModels },
      });

      const result = await provider.validateModel('non-existent/model', 'test-api-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Model 'non-existent/model' not found in available models");
      expect(result.model).toBeUndefined();
    });

    it('should handle API errors during validation', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await provider.validateModel('openai/gpt-4', 'test-api-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getModelRecommendations', () => {
    it('should return specific recommendations for Claude models', () => {
      const recommendations = provider.getModelRecommendations('anthropic/claude-3-haiku');

      expect(recommendations).toEqual({
        maxTokens: 4000,
        temperature: 0.7,
      });
    });

    it('should return specific recommendations for GPT models', () => {
      const recommendations = provider.getModelRecommendations('openai/gpt-4');

      expect(recommendations).toEqual({
        maxTokens: 4000,
        temperature: 0.7,
      });
    });

    it('should return default recommendations for unknown models', () => {
      const recommendations = provider.getModelRecommendations('unknown/model');

      expect(recommendations).toEqual({
        maxTokens: 4000,
        temperature: 0.7,
      });
    });

    it('should return partial match recommendations for model families', () => {
      const recommendations = provider.getModelRecommendations('custom/claude-variant');

      expect(recommendations).toEqual({
        maxTokens: 4000,
        temperature: 0.7,
      });
    });
  });

  describe('analyze with model-specific configuration', () => {
    it('should use configured model in API request', async () => {
      const providerWithModel = new OpenRouterProvider({
        apiKey: 'test-api-key',
        model: 'anthropic/claude-3-haiku',
        maxTokens: 4000,
        temperature: 0.7,
      });

      const mockResponse = {
        data: {
          id: 'test-id',
          choices: [
            {
              message: { content: 'Test analysis response' },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300,
          },
          model: 'anthropic/claude-3-haiku',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await providerWithModel.analyze('Test prompt');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          model: 'anthropic/claude-3-haiku',
          messages: [{ role: 'user', content: 'Test prompt' }],
          max_tokens: 4000,
          temperature: 0.7,
        }),
        expect.any(Object)
      );

      expect(result.content).toBe('Test analysis response');
      expect(result.tokenUsage.total).toBe(300);
    });
  });
});
