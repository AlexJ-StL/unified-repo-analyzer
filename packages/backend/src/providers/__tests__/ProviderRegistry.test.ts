/**
 * Tests for enhanced ProviderRegistry functionality
 */

import type { ProviderConfig } from '@unified-repo-analyzer/shared/src/types/provider';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ProviderError, ProviderErrorType, ProviderRegistry } from '../ProviderRegistry.js';

// We'll mock axios calls directly in tests where needed

describe('ProviderRegistry - Enhanced Status Tracking', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    // Reset the singleton instance
    (ProviderRegistry as unknown as { instance: ProviderRegistry | undefined }).instance =
      undefined;
    registry = ProviderRegistry.getInstance();
  });

  afterEach(() => {
    registry.reset();
    vi.clearAllMocks();
  });

  describe('Provider Status Management', () => {
    it('should initialize providers with correct default status', () => {
      const providerInfo = registry.getAllProviderInfo();

      expect(providerInfo).toHaveLength(4); // claude, gemini, openrouter, mock

      providerInfo.forEach((provider) => {
        expect(provider.status).toBe('inactive');
        expect(provider.configured).toBe(false);
        expect(provider.available).toBe(true);
        expect(provider.capabilities).toBeDefined();
        expect(Array.isArray(provider.capabilities)).toBe(true);
      });
    });

    it('should update status when provider is configured', () => {
      const config: ProviderConfig = {
        apiKey: 'test-key',
        model: 'test-model',
      };

      registry.setProviderConfig('openrouter', config);

      const status = registry.getProviderStatus('openrouter');
      expect(status.configured).toBe(true);
      expect(status.status).toBe('inactive'); // Still needs testing
      expect(status.error).toBeUndefined();
      expect(status.errorMessage).toBeUndefined();
    });

    it('should clear errors when configuration changes', () => {
      // First set an error state
      registry.setProviderStatus('openrouter', {
        status: 'error',
        configured: false,
        available: true,
        capabilities: ['text-generation'],
        error: {
          type: ProviderErrorType.AUTHENTICATION,
          message: 'Invalid API key',
          recoverable: false,
          timestamp: new Date(),
        },
        errorMessage: 'Invalid API key',
      });

      // Then update configuration
      registry.setProviderConfig('openrouter', { apiKey: 'new-key' });

      const status = registry.getProviderStatus('openrouter');
      expect(status.error).toBeUndefined();
      expect(status.errorMessage).toBeUndefined();
    });
  });

  describe('Health Checking', () => {
    it('should perform health check for mock provider', async () => {
      const healthCheck = await registry.performHealthCheck('mock');

      expect(healthCheck.healthy).toBe(true);
      expect(healthCheck.responseTime).toBeGreaterThan(0);
      expect(healthCheck.testedAt).toBeInstanceOf(Date);
      expect(healthCheck.capabilities).toContain('text-generation');
      expect(healthCheck.error).toBeUndefined();
    });

    it('should fail health check for unconfigured provider', async () => {
      const healthCheck = await registry.performHealthCheck('openrouter');

      expect(healthCheck.healthy).toBe(false);
      expect(healthCheck.error).toBeDefined();
      expect(healthCheck.error?.type).toBe(ProviderErrorType.CONFIGURATION_ERROR);
      expect(healthCheck.error?.message).toContain('API key is required');
    });

    it('should fail health check for unregistered provider', async () => {
      const healthCheck = await registry.performHealthCheck('nonexistent');

      expect(healthCheck.healthy).toBe(false);
      expect(healthCheck.error).toBeDefined();
      expect(healthCheck.error?.message).toContain('not registered');
    });

    it('should measure response time during health check', async () => {
      const startTime = Date.now();
      const healthCheck = await registry.performHealthCheck('mock');
      const endTime = Date.now();

      expect(healthCheck.responseTime).toBeGreaterThan(0);
      expect(healthCheck.responseTime).toBeLessThan(endTime - startTime + 100); // Allow some margin
    });
  });

  describe('Provider Testing', () => {
    it('should test mock provider successfully', async () => {
      const result = await registry.testProvider('mock');

      expect(result).toBe(true);

      const status = registry.getProviderStatus('mock');
      expect(status.status).toBe('active');
      expect(status.lastTested).toBeInstanceOf(Date);
      expect(status.healthCheck).toBeDefined();
      expect(status.healthCheck?.healthy).toBe(true);
    });

    it('should fail test for unconfigured provider', async () => {
      const result = await registry.testProvider('openrouter');

      expect(result).toBe(false);

      const status = registry.getProviderStatus('openrouter');
      expect(status.status).toBe('error');
      expect(status.error).toBeDefined();
      expect(status.error?.type).toBe(ProviderErrorType.CONFIGURATION_ERROR);
    });

    it('should update status to testing during test', async () => {
      // Start test but don't await
      const testPromise = registry.testProvider('mock');

      // Check status immediately (should be testing)
      const statusDuringTest = registry.getProviderStatus('mock');
      expect(statusDuringTest.status).toBe('testing');

      // Wait for test to complete
      await testPromise;

      // Check final status
      const finalStatus = registry.getProviderStatus('mock');
      expect(finalStatus.status).toBe('active');
    });
  });

  describe('Error Categorization', () => {
    it('should categorize authentication errors correctly', async () => {
      // Mock an authentication error
      const mockError = new Error('401 Unauthorized - Invalid API key');

      registry.setProviderConfig('openrouter', { apiKey: 'invalid-key' });

      // Mock the OpenRouter provider to throw auth error
      vi.spyOn(registry, 'createProvider').mockImplementation(() => {
        throw mockError;
      });

      const result = await registry.testProvider('openrouter');

      expect(result).toBe(false);

      const status = registry.getProviderStatus('openrouter');
      expect(status.error?.type).toBe(ProviderErrorType.AUTHENTICATION);
      expect(status.error?.recoverable).toBe(false);
    });

    it('should categorize rate limit errors correctly', async () => {
      const mockError = new Error('429 Too Many Requests - Rate limit exceeded');

      registry.setProviderConfig('openrouter', { apiKey: 'valid-key' });

      vi.spyOn(registry, 'createProvider').mockImplementation(() => {
        throw mockError;
      });

      const result = await registry.testProvider('openrouter');

      expect(result).toBe(false);

      const status = registry.getProviderStatus('openrouter');
      expect(status.error?.type).toBe(ProviderErrorType.RATE_LIMIT);
      expect(status.error?.recoverable).toBe(true);
    });

    it('should categorize network errors correctly', async () => {
      const mockError = new Error('ECONNREFUSED - Connection refused');

      registry.setProviderConfig('openrouter', { apiKey: 'valid-key' });

      vi.spyOn(registry, 'createProvider').mockImplementation(() => {
        throw mockError;
      });

      const result = await registry.testProvider('openrouter');

      expect(result).toBe(false);

      const status = registry.getProviderStatus('openrouter');
      expect(status.error?.type).toBe(ProviderErrorType.NETWORK_ERROR);
      expect(status.error?.recoverable).toBe(true);
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should not attempt recovery for non-recoverable errors', async () => {
      const authError: ProviderError = {
        type: ProviderErrorType.AUTHENTICATION,
        message: 'Invalid API key',
        recoverable: false,
        timestamp: new Date(),
      };

      const result = await registry.attemptRecovery('openrouter', authError);
      expect(result).toBe(false);
    });

    it('should attempt recovery for rate limit errors', async () => {
      const rateLimitError: ProviderError = {
        type: ProviderErrorType.RATE_LIMIT,
        message: 'Rate limit exceeded',
        recoverable: true,
        timestamp: new Date(),
      };

      // Mock successful recovery
      vi.spyOn(registry, 'testProvider').mockResolvedValue(true);

      const result = await registry.attemptRecovery('mock', rateLimitError);
      expect(result).toBe(true);
    });

    it('should attempt recovery for network errors', async () => {
      const networkError: ProviderError = {
        type: ProviderErrorType.NETWORK_ERROR,
        message: 'Connection failed',
        recoverable: true,
        timestamp: new Date(),
      };

      // Mock successful recovery
      vi.spyOn(registry, 'testProvider').mockResolvedValue(true);

      const result = await registry.attemptRecovery('mock', networkError);
      expect(result).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should test all providers', async () => {
      registry.setProviderConfig('mock', { apiKey: 'test' });

      const results = await registry.testAllProviders();

      expect(results.size).toBe(4); // All registered providers
      expect(results.get('mock')).toBe(true);
      expect(results.get('openrouter')).toBe(false); // Not configured
      expect(results.get('claude')).toBe(false); // Not configured
      expect(results.get('gemini')).toBe(false); // Not configured
    });

    it('should get health status for all providers', () => {
      const healthStatuses = registry.getProvidersHealthStatus();

      expect(healthStatuses).toHaveLength(4);
      healthStatuses.forEach((status) => {
        expect(status.name).toBeDefined();
        expect(typeof status.healthy).toBe('boolean');
      });
    });

    it('should identify providers needing attention', async () => {
      // Test one provider to set its last tested time
      await registry.testProvider('mock');

      // Get providers needing attention (should exclude mock since it was just tested)
      const needingAttention = registry.getProvidersNeedingAttention();

      expect(needingAttention).toContain('claude');
      expect(needingAttention).toContain('gemini');
      expect(needingAttention).toContain('openrouter');
      expect(needingAttention).not.toContain('mock');
    });
  });

  describe('Provider Statistics', () => {
    it('should provide accurate statistics', async () => {
      // Configure and test some providers
      registry.setProviderConfig('mock', { apiKey: 'test' });
      registry.setProviderConfig('openrouter', { apiKey: 'test' });

      await registry.testProvider('mock'); // Should succeed
      await registry.testProvider('openrouter'); // Should fail (fake API key)

      const stats = registry.getProviderStatistics();

      expect(stats.total).toBe(4);
      expect(stats.configured).toBe(2);
      expect(stats.active).toBe(1); // Only mock should be active
      expect(stats.error).toBeGreaterThan(0);
    });
  });

  describe('Error State Management', () => {
    it('should clear provider errors', () => {
      // Set error state
      registry.setProviderStatus('openrouter', {
        status: 'error',
        configured: true,
        available: true,
        capabilities: ['text-generation'],
        error: {
          type: ProviderErrorType.AUTHENTICATION,
          message: 'Test error',
          recoverable: false,
          timestamp: new Date(),
        },
        errorMessage: 'Test error',
      });

      // Clear error
      registry.clearProviderError('openrouter');

      const status = registry.getProviderStatus('openrouter');
      expect(status.status).toBe('inactive');
      expect(status.error).toBeUndefined();
      expect(status.errorMessage).toBeUndefined();
    });
  });

  describe('Provider Information', () => {
    it('should include enhanced information in getAllProviderInfo', () => {
      const providerInfo = registry.getAllProviderInfo();

      const openrouterInfo = providerInfo.find((p) => p.id === 'openrouter');
      expect(openrouterInfo).toBeDefined();
      expect(openrouterInfo?.displayName).toBe('OpenRouter');
      expect(openrouterInfo?.capabilities).toContain('text-generation');
      expect(openrouterInfo?.capabilities).toContain('model-selection');
      expect(openrouterInfo?.available).toBe(true);
      expect(openrouterInfo?.configured).toBe(false);
    });

    it('should show configured status correctly', () => {
      registry.setProviderConfig('openrouter', { apiKey: 'test-key' });

      const providerInfo = registry.getAllProviderInfo();
      const openrouterInfo = providerInfo.find((p) => p.id === 'openrouter');

      expect(openrouterInfo?.configured).toBe(true);
      expect(openrouterInfo?.model).toBeDefined();
    });
  });
});
