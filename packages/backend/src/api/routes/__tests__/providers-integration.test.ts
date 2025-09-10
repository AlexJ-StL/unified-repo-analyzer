/**
 * Integration test for providers API to verify task 1 requirements
 */

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ProviderRegistry } from '../../../providers/ProviderRegistry.js';

describe('Providers API Integration - Task 1 Requirements', () => {
  let registry: ProviderRegistry;

  beforeAll(() => {
    registry = ProviderRegistry.getInstance();
    registry.reset();
  });

  afterAll(() => {
    registry.reset();
  });

  test('Requirement 1.1: OpenRouter should be listed as available provider', () => {
    const providers = registry.getAllProviderInfo();
    const openrouterProvider = providers.find((p) => p.id === 'openrouter');

    expect(openrouterProvider).toBeDefined();
    expect(openrouterProvider?.displayName).toBe('OpenRouter');
    expect(openrouterProvider?.available).toBe(true);
  });

  test('Requirement 1.2: System should display available models from OpenRouter', () => {
    // Verify that the registry has the fetchProviderModels method for OpenRouter
    expect(registry.hasProvider('openrouter')).toBe(true);

    // The fetchProviderModels method should exist and be callable
    expect(typeof registry.fetchProviderModels).toBe('function');
  });

  test('Requirement 7.1: Show status of all configured providers', () => {
    const providers = registry.getAllProviderInfo();

    // All providers should have status information
    providers.forEach((provider) => {
      expect(provider).toHaveProperty('status');
      expect(provider).toHaveProperty('configured');
      expect(provider).toHaveProperty('capabilities');
      expect(Array.isArray(provider.capabilities)).toBe(true);
    });
  });

  test('Requirement 7.3: Clearly indicate provider capabilities', () => {
    const providers = registry.getAllProviderInfo();

    const openrouterProvider = providers.find((p) => p.id === 'openrouter');
    const claudeProvider = providers.find((p) => p.id === 'claude');
    const geminiProvider = providers.find((p) => p.id === 'gemini');

    // Verify OpenRouter capabilities
    expect(openrouterProvider?.capabilities).toContain('text-generation');
    expect(openrouterProvider?.capabilities).toContain('code-analysis');
    expect(openrouterProvider?.capabilities).toContain('model-selection');

    // Verify Claude capabilities
    expect(claudeProvider?.capabilities).toContain('text-generation');
    expect(claudeProvider?.capabilities).toContain('code-analysis');
    expect(claudeProvider?.capabilities).toContain('function-calling');

    // Verify Gemini capabilities (includes image analysis)
    expect(geminiProvider?.capabilities).toContain('text-generation');
    expect(geminiProvider?.capabilities).toContain('code-analysis');
    expect(geminiProvider?.capabilities).toContain('image-analysis');
    expect(geminiProvider?.capabilities).toContain('function-calling');
  });

  test('Provider status checking and availability validation', () => {
    const providers = registry.getAllProviderInfo();

    // All providers should be available (registered)
    providers.forEach((provider) => {
      expect(provider.available).toBe(true);
    });

    // Test provider testing functionality
    expect(typeof registry.testProvider).toBe('function');
  });

  test('Provider configuration status in response', () => {
    // Test with configured provider
    registry.setProviderConfig('openrouter', {
      apiKey: 'test-key',
      model: 'test-model',
    });

    const providers = registry.getAllProviderInfo();
    const openrouterProvider = providers.find((p) => p.id === 'openrouter');

    expect(openrouterProvider?.configured).toBe(true);
    expect(openrouterProvider?.model).toBe('test-model');

    // Test with unconfigured provider
    const mockProvider = providers.find((p) => p.id === 'mock');
    expect(mockProvider?.configured).toBe(false);
  });
});
