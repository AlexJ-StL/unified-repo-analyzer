/**
 * Tests for providers API routes
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ProviderRegistry } from '../../../providers/ProviderRegistry.js';

// Import the route handler directly
import providersRouter from '../providers.js';

// Helper function to create mock response object
function createMockResponse() {
  const res: any = {
    json: vi.fn(),
    status: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

// Extract the GET / handler from the router
function getProvidersHandler() {
  // Access the router's stack to find the GET / handler
  const stack = (providersRouter as any).stack;
  const layer = stack.find((l: any) => l.route && l.route.path === '/' && l.route.methods.get);
  return layer ? layer.route.stack[0].handle : null;
}

describe('providers routes', () => {
  let handler: any;

  beforeEach(() => {
    // Reset the registry before each test
    ProviderRegistry.getInstance().reset();
    // Get the handler for each test
    handler = getProvidersHandler();
  });

  test('simple test to verify structure', () => {
    expect(true).toBe(true);
  });

  describe('GET /api/providers', () => {
    test('should return all registered providers with their status', async () => {
      // Set up some provider configurations
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig('claude', { apiKey: 'test-claude-key' });
      registry.setProviderConfig('openrouter', {
        apiKey: 'test-openrouter-key',
        model: 'openrouter/test-model',
      });

      // Create a mock request and response
      const req: any = {};
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res);

      // Verify the response
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];

      expect(response).toHaveProperty('providers');
      expect(response).toHaveProperty('defaultProvider');
      expect(response.providers).toHaveLength(4); // claude, gemini, openrouter, mock

      // Check that configured providers are marked as configured
      const claudeProvider = response.providers.find((p: any) => p.id === 'claude');
      const openrouterProvider = response.providers.find((p: any) => p.id === 'openrouter');
      const mockProvider = response.providers.find((p: any) => p.id === 'mock');

      expect(claudeProvider).toBeDefined();
      expect(claudeProvider.configured).toBe(true);
      expect(claudeProvider.model).toBe('claude-3-haiku-20240307');

      expect(openrouterProvider).toBeDefined();
      expect(openrouterProvider.configured).toBe(true);
      expect(openrouterProvider.model).toBe('openrouter/test-model');

      expect(mockProvider).toBeDefined();
      expect(mockProvider.configured).toBe(false);
    });

    test('should handle errors gracefully', async () => {
      // Create a mock request and response
      const req: any = {};
      const res = createMockResponse();

      // Mock an error in the registry
      vi.spyOn(ProviderRegistry.getInstance(), 'getAllProviderInfo').mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the route handler directly
      await handler(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
      const errorResponse = res.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('Requirements Validation', () => {
    test('should meet requirement 1.1 - OpenRouter listed as available provider', async () => {
      // Create a mock request and response
      const req: any = {};
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res);

      // Verify OpenRouter is listed
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      const openrouterProvider = response.providers.find((p: any) => p.id === 'openrouter');

      expect(openrouterProvider).toBeDefined();
      expect(openrouterProvider.displayName).toBe('OpenRouter');
      expect(openrouterProvider.available).toBe(true);
    });

    test('should meet requirement 7.1 - show status of all configured providers', async () => {
      // Set up some provider configurations
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig('claude', { apiKey: 'test-claude-key' });
      registry.setProviderConfig('openrouter', {
        apiKey: 'test-openrouter-key',
      });

      // Create a mock request and response
      const req: any = {};
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res);

      // Verify all providers have status information
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];

      response.providers.forEach((provider: any) => {
        expect(provider).toHaveProperty('status');
        expect(provider).toHaveProperty('configured');
        expect(provider).toHaveProperty('capabilities');
        expect(Array.isArray(provider.capabilities)).toBe(true);
      });
    });

    test('should meet requirement 7.3 - clearly indicate provider capabilities', async () => {
      // Create a mock request and response
      const req: any = {};
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res);

      // Verify capabilities are clearly indicated
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];

      const openrouterProvider = response.providers.find((p: any) => p.id === 'openrouter');
      const claudeProvider = response.providers.find((p: any) => p.id === 'claude');
      const geminiProvider = response.providers.find((p: any) => p.id === 'gemini');

      // Verify OpenRouter capabilities
      expect(openrouterProvider.capabilities).toContain('text-generation');
      expect(openrouterProvider.capabilities).toContain('code-analysis');
      expect(openrouterProvider.capabilities).toContain('model-selection');

      // Verify Claude capabilities
      expect(claudeProvider.capabilities).toContain('text-generation');
      expect(claudeProvider.capabilities).toContain('code-analysis');
      expect(claudeProvider.capabilities).toContain('function-calling');

      // Verify Gemini capabilities (includes image analysis)
      expect(geminiProvider.capabilities).toContain('text-generation');
      expect(geminiProvider.capabilities).toContain('code-analysis');
      expect(geminiProvider.capabilities).toContain('image-analysis');
      expect(geminiProvider.capabilities).toContain('function-calling');
    });
  });
});
