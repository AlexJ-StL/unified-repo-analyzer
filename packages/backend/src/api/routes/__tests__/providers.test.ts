/**
 * Tests for providers API routes
 */

import type { Request, Response } from 'express';
import { beforeEach, describe, expect, type MockedFunction, test, vi } from 'vitest';
import { ProviderRegistry } from '../../../providers/ProviderRegistry.js';

// Import the route handler directly
import providersRouter from '../providers.js';

interface ProviderInfo {
  id: string;
  configured: boolean;
  model?: string;
  displayName: string;
  available: boolean;
  status: string;
  capabilities: string[];
}

interface ProvidersResponse {
  providers: ProviderInfo[];
  defaultProvider: string;
}

interface MockResponse {
  json: MockedFunction<(data: Record<string, unknown>) => MockResponse>;
  status: MockedFunction<(code: number) => MockResponse>;
  send: MockedFunction<(data: any) => MockResponse>;
  sendStatus: MockedFunction<(code: number) => MockResponse>;
  links: MockedFunction<(links: Record<string, string>) => MockResponse>;
  jsonp: MockedFunction<(data: any) => MockResponse>;
}

interface RouterLayer {
  route?: {
    path: string;
    methods: { get?: boolean };
    stack: Array<{ handle: (req: Request, res: Response) => Promise<void> }>;
  };
}

// Helper function to create mock response object
function createMockResponse(): MockResponse {
  const res = {
    json: vi.fn() as MockedFunction<(data: Record<string, unknown>) => MockResponse>,
    status: vi.fn() as MockedFunction<(code: number) => MockResponse>,
    send: vi.fn() as MockedFunction<(data: any) => MockResponse>,
    sendStatus: vi.fn() as MockedFunction<(code: number) => MockResponse>,
    links: vi.fn() as MockedFunction<(links: Record<string, string>) => MockResponse>,
    jsonp: vi.fn() as MockedFunction<(data: any) => MockResponse>,
  };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  res.sendStatus.mockReturnValue(res);
  res.links.mockReturnValue(res);
  res.jsonp.mockReturnValue(res);
  return res;
}

// Extract the GET / handler from the router
function getProvidersHandler() {
  // Access the router's stack to find the GET / handler
  const stack = (providersRouter as { stack: RouterLayer[] }).stack;
  const layer = stack.find(
    (l: RouterLayer) => l.route && l.route.path === '/' && l.route.methods.get
  );
  return layer ? layer.route?.stack[0].handle : null;
}

describe('providers routes', () => {
  let handler: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    // Reset the registry before each test
    ProviderRegistry.getInstance().reset();
    // Get the handler for each test
    const h = getProvidersHandler();
    if (!h) throw new Error('Handler not found');
    handler = h;
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
      const req: Request = {} as Request;
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res as any);

      // Verify the response
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0] as unknown as ProvidersResponse;

      expect(response).toHaveProperty('providers');
      expect(response).toHaveProperty('defaultProvider');
      expect(response.providers).toHaveLength(4); // claude, gemini, openrouter, mock

      // Check that configured providers are marked as configured
      const claudeProvider = response.providers.find((p: ProviderInfo) => p.id === 'claude');
      const openrouterProvider = response.providers.find(
        (p: ProviderInfo) => p.id === 'openrouter'
      );
      const mockProvider = response.providers.find((p: ProviderInfo) => p.id === 'mock');

      expect(claudeProvider).toBeDefined();
      expect(claudeProvider!.configured).toBe(true);
      expect(claudeProvider!.model).toBe('claude-3-haiku-20240307');

      expect(openrouterProvider).toBeDefined();
      expect(openrouterProvider!.configured).toBe(true);
      expect(openrouterProvider!.model).toBe('openrouter/test-model');

      expect(mockProvider).toBeDefined();
      expect(mockProvider!.configured).toBe(false);
    });

    test('should handle errors gracefully', async () => {
      // Create a mock request and response
      const req: Request = {} as Request;
      const res = createMockResponse();

      // Mock an error in the registry
      vi.spyOn(ProviderRegistry.getInstance(), 'getAllProviderInfo').mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the route handler directly
      await handler(req, res as any);

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
      const req: Request = {} as Request;
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res as any);

      // Verify OpenRouter is listed
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0] as unknown as ProvidersResponse;
      const openrouterProvider = response.providers.find(
        (p: ProviderInfo) => p.id === 'openrouter'
      );

      expect(openrouterProvider).toBeDefined();
      expect(openrouterProvider!.displayName).toBe('OpenRouter');
      expect(openrouterProvider!.available).toBe(true);
    });

    test('should meet requirement 7.1 - show status of all configured providers', async () => {
      // Set up some provider configurations
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig('claude', { apiKey: 'test-claude-key' });
      registry.setProviderConfig('openrouter', {
        apiKey: 'test-openrouter-key',
      });

      // Create a mock request and response
      const req: Request = {} as Request;
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res as any);

      // Verify all providers have status information
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0] as unknown as ProvidersResponse;

      response.providers.forEach((provider: ProviderInfo) => {
        expect(provider).toHaveProperty('status');
        expect(provider).toHaveProperty('configured');
        expect(provider).toHaveProperty('capabilities');
        expect(Array.isArray(provider.capabilities)).toBe(true);
      });
    });

    test('should meet requirement 7.3 - clearly indicate provider capabilities', async () => {
      // Create a mock request and response
      const req: Request = {} as Request;
      const res = createMockResponse();

      // Call the route handler directly
      await handler(req, res as any);

      // Verify capabilities are clearly indicated
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0] as unknown as ProvidersResponse;

      const openrouterProvider = response.providers.find(
        (p: ProviderInfo) => p.id === 'openrouter'
      );
      const claudeProvider = response.providers.find((p: ProviderInfo) => p.id === 'claude');
      const geminiProvider = response.providers.find((p: ProviderInfo) => p.id === 'gemini');

      // Verify OpenRouter capabilities
      expect(openrouterProvider!.capabilities).toContain('text-generation');
      expect(openrouterProvider!.capabilities).toContain('code-analysis');
      expect(openrouterProvider!.capabilities).toContain('model-selection');

      // Verify Claude capabilities
      expect(claudeProvider!.capabilities).toContain('text-generation');
      expect(claudeProvider!.capabilities).toContain('code-analysis');
      expect(claudeProvider!.capabilities).toContain('function-calling');

      // Verify Gemini capabilities (includes image analysis)
      expect(geminiProvider!.capabilities).toContain('text-generation');
      expect(geminiProvider!.capabilities).toContain('code-analysis');
      expect(geminiProvider!.capabilities).toContain('image-analysis');
      expect(geminiProvider!.capabilities).toContain('function-calling');
    });
  });
});
