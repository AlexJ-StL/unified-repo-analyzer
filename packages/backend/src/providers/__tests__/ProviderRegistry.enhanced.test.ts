/**
 * Enhanced tests for ProviderRegistry
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ProviderErrorType, ProviderRegistry } from '../ProviderRegistry.js';

describe('ProviderRegistry Enhanced', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    // Reset the singleton instance
    (ProviderRegistry as unknown as { instance: ProviderRegistry | undefined }).instance =
      undefined;
    registry = ProviderRegistry.getInstance();
  });

  describe('Provider Status Management', () => {
    it('should initialize providers with correct default status', () => {
      const providerInfo = registry.getAllProviderInfo();

      expect(providerInfo.claude.status).toBe('inactive');
      expect(providerInfo.gemini.status).toBe('inactive');
      expect(providerInfo.openrouter.status).toBe('inactive');
      expect(providerInfo.mock.status).toBe('active');
    });

    it('should update provider status correctly', () => {
      registry.updateProviderStatus('claude', 'active', 'Provider is ready');

      const providerInfo = registry.getAllProviderInfo();
      expect(providerInfo.claude.status).toBe('active');
    });

    it('should handle provider errors correctly', () => {
      const mockError = new Error('401 Unauthorized - Invalid API key');

      // Access the private method for testing
      const categorizeError = (
        registry as unknown as { categorizeError: (error: unknown) => ProviderError }
      ).categorizeError.bind(registry);
      const providerError = categorizeError(mockError);

      expect(providerError.type).toBe(ProviderErrorType.AUTHENTICATION);
      expect(providerError.recoverable).toBe(false);
    });

    it('should categorize rate limit errors', () => {
      const mockError = new Error('429 Too Many Requests - Rate limit exceeded');

      const categorizeError = (
        registry as unknown as { categorizeError: (error: unknown) => ProviderError }
      ).categorizeError.bind(registry);
      const providerError = categorizeError(mockError);

      expect(providerError.type).toBe(ProviderErrorType.RATE_LIMIT);
      expect(providerError.recoverable).toBe(true);
    });

    it('should categorize network errors', () => {
      const mockError = new Error('ECONNREFUSED - Connection refused');

      const categorizeError = (
        registry as unknown as { categorizeError: (error: unknown) => ProviderError }
      ).categorizeError.bind(registry);
      const providerError = categorizeError(mockError);

      expect(providerError.type).toBe(ProviderErrorType.NETWORK_ERROR);
      expect(providerError.recoverable).toBe(true);
    });
  });
});
