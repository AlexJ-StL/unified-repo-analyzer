/**
 * Integration test for OpenRouter model selection functionality
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderRegistry } from '../../../providers/ProviderRegistry.js';
import providersRouter from '../providers.js';

describe('OpenRouter Model Selection Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/providers', providersRouter);

    // Reset provider registry
    const registry = ProviderRegistry.getInstance();
    registry.reset();

    // Set up OpenRouter with a test API key
    registry.setProviderConfig('openrouter', {
      apiKey: 'test-api-key',
      model: 'openrouter/auto',
      maxTokens: 4000,
      temperature: 0.7,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Model Fetching', () => {
    it('should return available models for OpenRouter', async () => {
      // Mock the fetchModels method to return test data
      const registry = ProviderRegistry.getInstance();
      const originalFetchModels = registry.fetchProviderModels;

      registry.fetchProviderModels = vi.fn().mockResolvedValue([
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
          context_length: 8192,
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          pricing: { prompt: 0.00025, completion: 0.00125 },
          context_length: 200000,
        },
      ]);

      const response = await request(app).get('/api/providers/openrouter/models').expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        models: [
          {
            id: 'openai/gpt-4',
            name: 'GPT-4',
            pricing: { prompt: 0.03, completion: 0.06 },
            context_length: 8192,
          },
          {
            id: 'anthropic/claude-3-haiku',
            name: 'Claude 3 Haiku',
            pricing: { prompt: 0.00025, completion: 0.00125 },
            context_length: 200000,
          },
        ],
      });

      // Restore original method
      registry.fetchProviderModels = originalFetchModels;
    });

    it('should return 400 when API key is missing', async () => {
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig('openrouter', {
        model: 'openrouter/auto',
        maxTokens: 4000,
        temperature: 0.7,
      });

      const response = await request(app).get('/api/providers/openrouter/models').expect(400);

      expect(response.body).toEqual({
        error: 'API key required',
        message: "Provider 'openrouter' requires an API key to fetch models",
      });
    });

    it('should return 404 for non-existent provider', async () => {
      const response = await request(app).get('/api/providers/non-existent/models').expect(404);

      expect(response.body).toEqual({
        error: 'Provider not found',
        message: "Provider 'non-existent' is not registered",
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate existing model successfully', async () => {
      const registry = ProviderRegistry.getInstance();
      registry.validateProviderModel = vi.fn().mockResolvedValue({
        valid: true,
        model: {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
      });

      const response = await request(app)
        .post('/api/providers/openrouter/models/openai%2Fgpt-4/validate')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'openai/gpt-4',
        valid: true,
        model: {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          pricing: { prompt: 0.03, completion: 0.06 },
        },
      });
    });

    it('should return validation failure for invalid model', async () => {
      const registry = ProviderRegistry.getInstance();
      registry.validateProviderModel = vi.fn().mockResolvedValue({
        valid: false,
        error: 'Model not found',
      });

      const response = await request(app)
        .post('/api/providers/openrouter/models/invalid-model/validate')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'invalid-model',
        valid: false,
        error: 'Model not found',
      });
    });
  });

  describe('Model Recommendations', () => {
    it('should return model recommendations', async () => {
      const registry = ProviderRegistry.getInstance();
      registry.getProviderModelRecommendations = vi.fn().mockReturnValue({
        maxTokens: 4000,
        temperature: 0.7,
      });

      const response = await request(app)
        .get('/api/providers/openrouter/models/openai%2Fgpt-4/recommendations')
        .expect(200);

      expect(response.body).toEqual({
        provider: 'openrouter',
        modelId: 'openai/gpt-4',
        recommendations: {
          maxTokens: 4000,
          temperature: 0.7,
        },
      });
    });
  });

  describe('Provider Discovery', () => {
    it('should include OpenRouter in provider list with model-selection capability', async () => {
      const response = await request(app).get('/api/providers').expect(200);

      const openRouterProvider = response.body.providers.find((p: any) => p.id === 'openrouter');

      expect(openRouterProvider).toBeDefined();
      expect(openRouterProvider.displayName).toBe('OpenRouter');
      expect(openRouterProvider.capabilities).toContain('model-selection');
      expect(openRouterProvider.configured).toBe(true);
    });
  });
});
