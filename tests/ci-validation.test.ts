/**
 * CI/CD Configuration Validation Tests
 * Tests the enhanced CI/CD test configuration improvements
 */

import { describe, expect, it } from 'vitest';
import {
  CITestConfig,
  CITimeoutManager,
  EnvironmentDetector,
  logEnvironmentInfo,
} from './ci-test-utils';
import { getTestConfig, RuntimeTestHelpers } from './runtime-test-helpers';

describe('CI/CD Configuration Validation', () => {
  describe('Environment Detection', () => {
    it('should detect runtime environment correctly', () => {
      const isBun = EnvironmentDetector.isBun();
      const isNode = EnvironmentDetector.isNode();

      // Should detect at least one runtime
      expect(isBun || isNode).toBe(true);

      // Should not detect both (mutually exclusive)
      expect(isBun && isNode).toBe(false);

      console.log(`Runtime detected: ${isBun ? 'Bun' : 'Node.js'}`);
    });

    it('should detect CI environment correctly', () => {
      const isCI = EnvironmentDetector.isCI();
      const ciProvider = EnvironmentDetector.getCIProvider();

      console.log(`CI Environment: ${isCI}`);
      console.log(`CI Provider: ${ciProvider || 'none'}`);

      // Should be boolean
      expect(typeof isCI).toBe('boolean');
    });

    it('should detect platform information', () => {
      const platform = EnvironmentDetector.getPlatform();
      const architecture = EnvironmentDetector.getArchitecture();

      expect(platform).toBeDefined();
      expect(architecture).toBeDefined();

      console.log(`Platform: ${platform}`);
      console.log(`Architecture: ${architecture}`);
    });
  });

  describe('Timeout Management', () => {
    it('should provide runtime-aware timeouts', () => {
      const fastTimeout = CITimeoutManager.getTimeout('fast');
      const normalTimeout = CITimeoutManager.getTimeout('normal');
      const slowTimeout = CITimeoutManager.getTimeout('slow');

      expect(fastTimeout).toBeGreaterThan(0);
      expect(normalTimeout).toBeGreaterThan(fastTimeout);
      expect(slowTimeout).toBeGreaterThan(normalTimeout);

      console.log(
        `Timeouts - Fast: ${fastTimeout}ms, Normal: ${normalTimeout}ms, Slow: ${slowTimeout}ms`
      );
    });

    it('should provide runtime-aware retry counts', () => {
      const fastRetries = CITimeoutManager.getRetryCount('fast');
      const normalRetries = CITimeoutManager.getRetryCount('normal');
      const slowRetries = CITimeoutManager.getRetryCount('slow');

      expect(fastRetries).toBeGreaterThanOrEqual(0);
      expect(normalRetries).toBeGreaterThanOrEqual(0);
      expect(slowRetries).toBeGreaterThanOrEqual(0);

      console.log(`Retries - Fast: ${fastRetries}, Normal: ${normalRetries}, Slow: ${slowRetries}`);
    });
  });

  describe('Test Configuration', () => {
    it('should provide comprehensive test configuration', () => {
      const config = CITestConfig.getConfig();

      expect(config).toHaveProperty('defaultTimeout');
      expect(config).toHaveProperty('isCI');
      expect(config).toHaveProperty('isBun');
      expect(config).toHaveProperty('platform');
      expect(config).toHaveProperty('maxConcurrency');

      expect(config.defaultTimeout).toBeGreaterThan(0);
      expect(typeof config.isCI).toBe('boolean');
      expect(typeof config.isBun).toBe('boolean');
      expect(config.platform).toBeDefined();
      expect(config.maxConcurrency).toBeGreaterThan(0);

      console.log('Test Configuration:', JSON.stringify(config, null, 2));
    });
  });

  describe('Runtime Test Helpers', () => {
    it('should provide runtime-specific test configuration', () => {
      const config = getTestConfig();

      expect(config).toHaveProperty('runtime');
      expect(config).toHaveProperty('platform');
      expect(config).toHaveProperty('fastTimeout');
      expect(config).toHaveProperty('normalTimeout');
      expect(config).toHaveProperty('slowTimeout');

      expect(['bun', 'node']).toContain(config.runtime);
      expect(config.fastTimeout).toBeGreaterThan(0);
      expect(config.normalTimeout).toBeGreaterThan(config.fastTimeout);
      expect(config.slowTimeout).toBeGreaterThan(config.normalTimeout);

      console.log('Runtime Test Configuration:', JSON.stringify(config, null, 2));
    });

    it('should create runtime-aware timeouts', () => {
      const fastTimeout = RuntimeTestHelpers.getTimeout('fast');
      const normalTimeout = RuntimeTestHelpers.getTimeout('normal');
      const slowTimeout = RuntimeTestHelpers.getTimeout('slow');

      expect(fastTimeout).toBeGreaterThan(0);
      expect(normalTimeout).toBeGreaterThan(fastTimeout);
      expect(slowTimeout).toBeGreaterThan(normalTimeout);

      // In CI, timeouts should be longer
      if (EnvironmentDetector.isCI()) {
        expect(normalTimeout).toBeGreaterThan(10000); // At least 10 seconds in CI
      }
    });
  });

  describe('Environment Information Logging', () => {
    it('should log environment information without errors', () => {
      expect(() => {
        logEnvironmentInfo();
      }).not.toThrow();
    });
  });

  describe('Cross-Runtime Compatibility', () => {
    it('should handle runtime-specific behavior', () => {
      const isBun = EnvironmentDetector.isBun();

      if (isBun) {
        // Bun-specific tests
        expect(typeof Bun).toBe('object');
        console.log('Running Bun-specific validation');
      } else {
        // Node.js-specific tests
        expect(process.versions.node).toBeDefined();
        console.log('Running Node.js-specific validation');
      }
    });

    it('should provide appropriate concurrency settings', () => {
      const config = CITestConfig.getConfig();
      const isBun = EnvironmentDetector.isBun();

      if (EnvironmentDetector.isCI()) {
        // CI should have higher concurrency
        expect(config.maxConcurrency).toBeGreaterThanOrEqual(6);

        if (isBun) {
          // Bun can handle more concurrency
          expect(config.maxConcurrency).toBeGreaterThanOrEqual(8);
        }
      } else {
        // Local should have lower concurrency
        expect(config.maxConcurrency).toBeLessThanOrEqual(4);
      }
    });
  });
});
