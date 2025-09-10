/**
 * Tests for provider model selection API routes
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderRegistry } from '../../../providers/ProviderRegistry.js';
import providersRouter from '../providers.js';

// Mock the ProviderRegistry
vi.mock('../../../providers/ProviderRegistry');

describe('Provider Models API Routes', () => {
  let app: express.Application;
  let mockRegistry: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/providers', providersRouter);

    mockRegistry = {
      hasProvider: vi.fn(),
      getProviderConfig: vi.fn(),
      fetchProviderModels: vi.fn(),
      validateProviderModel: vi.fn(),
      getProviderModelRecommendations: vi.fn(),
    };

    (ProviderRegistry as any).getInstance.mockReturnValue(mockRegistry);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/providers/:name/models', () => {
    it('should fetch models for valid provider with API key', async () => {
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

      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({
        apiKey: 'test-api-key',
        model: 'openrouter/auto',
      });
      mockRegistry.fetchProviderModels.mockResolvedValue(mockModels);

      const response = await request(app).get('/api/providers/openrouter/models').expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        models: mockModels,
      });

      expect(mockRegistry.fetchProviderModels).toHaveBeenCalledWith('openrouter', 'test-api-key');
    });

    it('should return 404 for non-existent provider', async () => {
      mockRegistry.hasProvider.mockReturnValue(false);

      const response = await request(app).get('/api/providers/non-existent/models').expect(404);

      expect(response.body).toEqual({
        error: 'Provider not found',
        message: "Provider 'non-existent' is not registered",
      });
    });

    it('should return 400 when API key is missing', async () => {
      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({}); // No API key

      const response = await request(app).get('/api/providers/openrouter/models').expect(400);

      expect(response.body).toEqual({
        error: 'API key required',
        message: "Provider 'openrouter' requires an API key to fetch models",
      });
    });

    it('should handle provider errors gracefully', async () => {
      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({
        apiKey: 'test-api-key',
      });
      mockRegistry.fetchProviderModels.mockRejectedValue(new Error('API rate limit exceeded'));

      const response = await request(app).get('/api/providers/openrouter/models').expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch provider models',
        message: 'API rate limit exceeded',
      });
    });
  });

  describe('POST /api/providers/:name/models/:modelId/validate', () => {
    it('should validate model successfully', async () => {
      const mockValidation = {
        valid: true,
        model: {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
      };

      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({
        apiKey: 'test-api-key',
      });
      mockRegistry.validateProviderModel.mockResolvedValue(mockValidation);

      const response = await request(app)
        .post('/api/providers/openrouter/models/openai%2Fgpt-4/validate')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'openai/gpt-4',
        ...mockValidation,
      });

      expect(mockRegistry.validateProviderModel).toHaveBeenCalledWith(
        'openrouter',
        'openai/gpt-4',
        'test-api-key'
      );
    });

    it('should handle invalid model validation', async () => {
      const mockValidation = {
        valid: false,
        error: 'Model not found',
      };

      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({
        apiKey: 'test-api-key',
      });
      mockRegistry.validateProviderModel.mockResolvedValue(mockValidation);

      const response = await request(app)
        .post('/api/providers/openrouter/models/invalid-model/validate')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'invalid-model',
        ...mockValidation,
      });
    });

    it('should return 404 for non-existent provider', async () => {
      mockRegistry.hasProvider.mockReturnValue(false);

      const response = await request(app)
        .post('/api/providers/non-existent/models/some-model/validate')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Provider not found',
        message: "Provider 'non-existent' is not registered",
      });
    });

    it('should return 400 when API key is missing', async () => {
      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderConfig.mockReturnValue({}); // No API key

      const response = await request(app)
        .post('/api/providers/openrouter/models/some-model/validate')
        .expect(400);

      expect(response.body).toEqual({
        error: 'API key required',
        message: "Provider 'openrouter' requires an API key to validate models",
      });
    });
  });

  describe('GET /api/providers/:name/models/:modelId/recommendations', () => {
    it('should get model recommendations successfully', async () => {
      const mockRecommendations = {
        maxTokens: 4000,
        temperature: 0.7,
      };

      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderModelRecommendations.mockReturnValue(mockRecommendations);

      const response = await request(app)
        .get('/api/providers/openrouter/models/openai%2Fgpt-4/recommendations')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'openai/gpt-4',
        recommendations: mockRecommendations,
      });

      expect(mockRegistry.getProviderModelRecommendations).toHaveBeenCalledWith(
        'openrouter',
        'openai/gpt-4'
      );
    });

    it('should return 404 for non-existent provider', async () => {
      mockRegistry.hasProvider.mockReturnValue(false);

      const response = await request(app)
        .get('/api/providers/non-existent/models/some-model/recommendations')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Provider not found',
        message: "Provider 'non-existent' is not registered",
      });
    });

    it('should handle URL-encoded model IDs', async () => {
      const mockRecommendations = {
        maxTokens: 4000,
        temperature: 0.7,
      };

      mockRegistry.hasProvider.mockReturnValue(true);
      mockRegistry.getProviderModelRecommendations.mockReturnValue(mockRecommendations);

      const response = await request(app)
        .get('/api/providers/openrouter/models/anthropic%2Fclaude-3-haiku/recommendations')
        .expect(200);

      expect(response.body.modelId).toBe('anthropic/claude-3-haiku');
      expect(mockRegistry.getProviderModelRecommendations).toHaveBeenCalledWith(
        'openrouter',
        'anthropic/claude-3-haiku'
      );
    });
  });
});
