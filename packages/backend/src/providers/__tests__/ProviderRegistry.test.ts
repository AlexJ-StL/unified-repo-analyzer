/**
 * Tests for ProviderRegistry
 */

import { ProviderRegistry } from '../ProviderRegistry';
import { LLMProvider } from '../LLMProvider';
import { ClaudeProvider } from '../ClaudeProvider';
import { GeminiProvider } from '../GeminiProvider';
import { MockProvider } from '../MockProvider';
import { ProviderConfig } from '@unified-repo-analyzer/shared/src/types/provider';

describe('ProviderRegistry', () => {
  beforeEach(() => {
    // Reset the registry before each test
    ProviderRegistry.getInstance().reset();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ProviderRegistry.getInstance();
      const instance2 = ProviderRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('built-in providers', () => {
    test('should have default providers registered', () => {
      const registry = ProviderRegistry.getInstance();

      expect(registry.hasProvider('claude')).toBe(true);
      expect(registry.hasProvider('gemini')).toBe(true);
      expect(registry.hasProvider('mock')).toBe(true);
    });

    test('should create built-in provider instances', () => {
      const registry = ProviderRegistry.getInstance();

      const claudeProvider = registry.createProvider('claude', { apiKey: 'test-key' });
      const geminiProvider = registry.createProvider('gemini', { apiKey: 'test-key' });
      const mockProvider = registry.createProvider('mock');

      expect(claudeProvider).toBeInstanceOf(ClaudeProvider);
      expect(geminiProvider).toBeInstanceOf(GeminiProvider);
      expect(mockProvider).toBeInstanceOf(MockProvider);
    });
  });

  describe('registerProvider', () => {
    test('should register custom provider', () => {
      const registry = ProviderRegistry.getInstance();

      class CustomProvider extends LLMProvider {
        get name(): string {
          return 'custom';
        }
        formatPrompt(): string {
          return '';
        }
        async analyze(): Promise<any> {
          return { content: '', tokenUsage: { prompt: 0, completion: 0, total: 0 } };
        }
      }

      registry.registerProvider('custom', (config) => new CustomProvider(config));

      expect(registry.hasProvider('custom')).toBe(true);
      const provider = registry.createProvider('custom');
      expect(provider).toBeInstanceOf(CustomProvider);
    });

    test('should handle case-insensitive provider names', () => {
      const registry = ProviderRegistry.getInstance();

      registry.registerProvider('CUSTOM', (config) => new MockProvider(config));

      expect(registry.hasProvider('custom')).toBe(true);
      expect(registry.hasProvider('Custom')).toBe(true);
      expect(registry.hasProvider('CUSTOM')).toBe(true);
    });
  });

  describe('provider configuration', () => {
    test('should set and get provider config', () => {
      const registry = ProviderRegistry.getInstance();
      const config: ProviderConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.5,
      };

      registry.setProviderConfig('claude', config);

      expect(registry.getProviderConfig('claude')).toEqual(config);
    });

    test('should return empty object for non-existent config', () => {
      const registry = ProviderRegistry.getInstance();

      expect(registry.getProviderConfig('non-existent')).toEqual({});
    });

    test('should handle case-insensitive config names', () => {
      const registry = ProviderRegistry.getInstance();
      const config: ProviderConfig = { apiKey: 'test-key' };

      registry.setProviderConfig('CLAUDE', config);

      expect(registry.getProviderConfig('claude')).toEqual(config);
      expect(registry.getProviderConfig('Claude')).toEqual(config);
    });

    test('should merge override config with registered config', () => {
      const registry = ProviderRegistry.getInstance();

      registry.setProviderConfig('claude', {
        apiKey: 'base-key',
        model: 'base-model',
        maxTokens: 1000,
      });

      const provider = registry.createProvider('claude', {
        model: 'override-model',
        temperature: 0.3,
      });

      expect((provider as any).config).toEqual({
        apiKey: 'base-key',
        model: 'override-model',
        maxTokens: 1000,
        temperature: 0.3,
      });
    });
  });

  describe('default provider', () => {
    test('should have mock as initial default provider', () => {
      const registry = ProviderRegistry.getInstance();

      expect(registry.getDefaultProviderName()).toBe('mock');
    });

    test('should set default provider', () => {
      const registry = ProviderRegistry.getInstance();

      registry.setProviderConfig('claude', { apiKey: 'test-key' });
      registry.setDefaultProvider('claude');

      expect(registry.getDefaultProviderName()).toBe('claude');
    });

    test('should throw error when setting non-existent provider as default', () => {
      const registry = ProviderRegistry.getInstance();

      expect(() => registry.setDefaultProvider('non-existent')).toThrow(
        "Provider 'non-existent' is not registered"
      );
    });

    test('should create default provider when no name specified', () => {
      const registry = ProviderRegistry.getInstance();

      registry.setProviderConfig('claude', { apiKey: 'test-key' });
      registry.setDefaultProvider('claude');

      const provider = registry.createProvider();
      expect(provider).toBeInstanceOf(ClaudeProvider);
    });
  });

  describe('provider management', () => {
    test('should get all provider names', () => {
      const registry = ProviderRegistry.getInstance();

      const names = registry.getProviderNames();
      expect(names).toContain('claude');
      expect(names).toContain('gemini');
      expect(names).toContain('mock');
    });

    test('should check if provider exists', () => {
      const registry = ProviderRegistry.getInstance();

      expect(registry.hasProvider('claude')).toBe(true);
      expect(registry.hasProvider('non-existent')).toBe(false);
    });

    test('should throw error when creating non-existent provider', () => {
      const registry = ProviderRegistry.getInstance();

      expect(() => registry.createProvider('non-existent')).toThrow(
        "Provider 'non-existent' is not registered"
      );
    });
  });

  describe('reset', () => {
    test('should reset registry to initial state', () => {
      const registry = ProviderRegistry.getInstance();

      // Modify registry
      registry.registerProvider('custom', (config) => new MockProvider(config));
      registry.setProviderConfig('claude', { apiKey: 'test-key' });
      registry.setDefaultProvider('claude');

      // Reset
      registry.reset();

      // Verify reset state
      expect(registry.hasProvider('custom')).toBe(false);
      expect(registry.getProviderConfig('claude')).toEqual({});
      expect(registry.getDefaultProviderName()).toBe('mock');
    });
  });
});
