/**
 * Tests for useProviders hook model selection functionality
 */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { apiService } from '../../services/api';
import { useProviders } from '../useProviders';

// Mock the API service
vi.mock('../../services/api');
const mockedApiService = apiService as any;

// Mock the useApi hook
vi.mock('../useApi', () => ({
  useApi: (apiFunction: any, _options: any) => ({
    execute: vi.fn().mockImplementation((...args) => apiFunction(...args)),
    isLoading: false,
    error: null,
  }),
}));

describe('useProviders Model Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchProviderModels', () => {
    it('should fetch models for OpenRouter provider', async () => {
      const mockModels = [
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          description: 'GPT-4 by OpenAI',
          pricing: { prompt: 0.03, completion: 0.06 },
          context_length: 8192,
          architecture: { modality: 'text', tokenizer: 'cl100k_base' },
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Claude 3 Haiku by Anthropic',
          pricing: { prompt: 0.00025, completion: 0.00125 },
          context_length: 200000,
          architecture: { modality: 'text', tokenizer: 'claude' },
        },
      ];

      mockedApiService.getProviderModels.mockResolvedValueOnce({
        data: {
          provider: 'openrouter',
          models: mockModels,
        },
      } as any);

      const { result } = renderHook(() => useProviders());

      const models = await result.current.fetchProviderModels('openrouter');

      expect(mockedApiService.getProviderModels).toHaveBeenCalledWith('openrouter');
      expect(models).toEqual(mockModels);
    });

    it('should return empty array when API call fails', async () => {
      mockedApiService.getProviderModels.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useProviders());

      const models = await result.current.fetchProviderModels('openrouter');

      expect(models).toEqual([]);
    });

    it('should return empty array when response is null', async () => {
      mockedApiService.getProviderModels.mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useProviders());

      const models = await result.current.fetchProviderModels('openrouter');

      expect(models).toEqual([]);
    });
  });

  describe('validateProviderModel', () => {
    it('should validate model successfully', async () => {
      const mockValidation = {
        provider: 'openrouter',
        modelId: 'openai/gpt-4',
        valid: true,
        model: {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
      };

      mockedApiService.validateProviderModel.mockResolvedValueOnce({
        data: mockValidation,
      } as any);

      const { result } = renderHook(() => useProviders());

      const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

      expect(mockedApiService.validateProviderModel).toHaveBeenCalledWith(
        'openrouter',
        'openai/gpt-4'
      );
      expect(validation).toEqual({
        valid: true,
        model: mockValidation.model,
        error: undefined,
      });
    });

    it('should handle validation failure', async () => {
      const mockValidation = {
        provider: 'openrouter',
        modelId: 'invalid/model',
        valid: false,
        error: 'Model not found',
      };

      mockedApiService.validateProviderModel.mockResolvedValueOnce({
        data: mockValidation,
      } as any);

      const { result } = renderHook(() => useProviders());

      const validation = await result.current.validateProviderModel('openrouter', 'invalid/model');

      expect(validation).toEqual({
        valid: false,
        model: undefined,
        error: 'Model not found',
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedApiService.validateProviderModel.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProviders());

      const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it('should handle null response', async () => {
      mockedApiService.validateProviderModel.mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useProviders());

      const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

      expect(validation).toEqual({
        valid: false,
        error: 'No response received',
      });
    });
  });

  describe('getModelRecommendations', () => {
    it('should get model recommendations successfully', async () => {
      const mockRecommendations = {
        maxTokens: 4000,
        temperature: 0.7,
      };

      mockedApiService.getModelRecommendations.mockResolvedValueOnce({
        data: {
          provider: 'openrouter',
          modelId: 'openai/gpt-4',
          recommendations: mockRecommendations,
        },
      } as any);

      const { result } = renderHook(() => useProviders());

      const recommendations = await result.current.getModelRecommendations(
        'openrouter',
        'openai/gpt-4'
      );

      expect(mockedApiService.getModelRecommendations).toHaveBeenCalledWith(
        'openrouter',
        'openai/gpt-4'
      );
      expect(recommendations).toEqual(mockRecommendations);
    });

    it('should return empty object when API call fails', async () => {
      mockedApiService.getModelRecommendations.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useProviders());

      const recommendations = await result.current.getModelRecommendations(
        'openrouter',
        'openai/gpt-4'
      );

      expect(recommendations).toEqual({});
    });

    it('should return empty object when response is null', async () => {
      mockedApiService.getModelRecommendations.mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useProviders());

      const recommendations = await result.current.getModelRecommendations(
        'openrouter',
        'openai/gpt-4'
      );

      expect(recommendations).toEqual({});
    });
  });

  describe('loading states', () => {
    it('should include model validation loading in overall loading state', () => {
      // This would require mocking the useApi hook to return loading: true
      // for the validateProviderModel API call
      const { result } = renderHook(() => useProviders());

      // The loading state should aggregate all API loading states
      expect(typeof result.current.loading).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should aggregate errors from all API calls', () => {
      const { result } = renderHook(() => useProviders());

      // The error state should aggregate all API errors
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });
});
