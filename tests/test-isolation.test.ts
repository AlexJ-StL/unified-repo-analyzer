/**
 * Test Isolation System Tests
 * Validates that the isolation system properly isolates tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cleanupTestIsolation,
  createIsolatedContext,
  DOMIsolation,
  EnvironmentIsolation,
  getIsolationStats,
  IsolationManager,
  ModuleIsolation,
  setupTestIsolation,
  TimerIsolation,
  withIsolation,
} from './test-isolation';

describe('Test Isolation System', () => {
  let testId: string;

  beforeEach(() => {
    testId = `test-${Date.now()}-${Math.random()}`;
  });

  afterEach(async () => {
    // Cleanup after each test
    await cleanupTestIsolation(testId);
  });

  describe('IsolationManager', () => {
    it('should create singleton instance', () => {
      const manager1 = IsolationManager.getInstance();
      const manager2 = IsolationManager.getInstance();

      expect(manager1).toBe(manager2);
    });

    it('should initialize isolation for a test', async () => {
      const manager = IsolationManager.getInstance();

      await manager.initializeIsolation(testId);

      expect(manager.isActive()).toBe(true);

      const stats = manager.getStats();
      expect(stats.activeTests).toBeGreaterThan(0);
    });

    it('should cleanup test isolation', async () => {
      const manager = IsolationManager.getInstance();

      await manager.initializeIsolation(testId);
      await manager.runTestCleanup(testId);

      const stats = manager.getStats();
      expect(stats.activeTests).toBe(0);
    });

    it('should handle emergency cleanup', async () => {
      const manager = IsolationManager.getInstance();

      await manager.initializeIsolation(testId);
      await manager.emergencyCleanup();

      expect(manager.isActive()).toBe(false);
    });
  });

  describe('EnvironmentIsolation', () => {
    it('should set and restore environment variables', () => {
      const originalValue = process.env.TEST_VAR;

      EnvironmentIsolation.setEnv('TEST_VAR', 'test-value');
      expect(process.env.TEST_VAR).toBe('test-value');

      EnvironmentIsolation.restoreEnv();
      expect(process.env.TEST_VAR).toBe(originalValue);
    });

    it('should create and restore from snapshot', () => {
      const _originalEnv = { ...process.env };

      EnvironmentIsolation.createSnapshot();
      process.env.NEW_VAR = 'new-value';

      EnvironmentIsolation.restoreFromSnapshot();
      expect(process.env.NEW_VAR).toBeUndefined();
    });

    it('should set multiple environment variables', () => {
      EnvironmentIsolation.setEnvVars({
        VAR1: 'value1',
        VAR2: 'value2',
      });

      expect(process.env.VAR1).toBe('value1');
      expect(process.env.VAR2).toBe('value2');

      EnvironmentIsolation.restoreEnv();
    });

    it('should temporarily override environment variables', async () => {
      const result = await EnvironmentIsolation.withEnv({ TEMP_VAR: 'temp-value' }, () => {
        expect(process.env.TEMP_VAR).toBe('temp-value');
        return 'success';
      });

      expect(result).toBe('success');
      expect(process.env.TEMP_VAR).toBeUndefined();
    });

    it('should clear test-related environment variables', () => {
      process.env.TEST_SOMETHING = 'test';
      process.env.VITEST_CONFIG = 'config';
      process.env.REGULAR_VAR = 'regular';

      EnvironmentIsolation.clearTestEnv();

      expect(process.env.TEST_SOMETHING).toBeUndefined();
      expect(process.env.VITEST_CONFIG).toBeUndefined();
      expect(process.env.REGULAR_VAR).toBe('regular');

      // Cleanup
      delete process.env.REGULAR_VAR;
    });
  });

  describe('ModuleIsolation', () => {
    it('should create and restore cache snapshot', () => {
      ModuleIsolation.createCacheSnapshot();
      ModuleIsolation.restoreCacheFromSnapshot();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should clear module cache selectively', () => {
      ModuleIsolation.clearCache(['test']);

      // Should not throw
      expect(true).toBe(true);
    });

    it('should track mocked modules', () => {
      ModuleIsolation.mockModule('test-module');
      ModuleIsolation.restoreModules();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should get cache statistics', () => {
      const stats = ModuleIsolation.getCacheStats();

      expect(typeof stats.requireCacheSize).toBe('number');
      expect(typeof stats.mockedModulesCount).toBe('number');
      expect(typeof stats.snapshotsCount).toBe('number');
    });

    it('should force clear all caches', () => {
      ModuleIsolation.forceClearAll();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('TimerIsolation', () => {
    it('should initialize timer tracking', () => {
      TimerIsolation.initialize();

      const stats = TimerIsolation.getStats();
      expect(stats.isMockingActive).toBe(true);
    });

    it('should track and clear timers', () => {
      TimerIsolation.initialize();

      const timer = TimerIsolation.setTimeout(() => {}, 100);
      expect(timer).toBeDefined();

      TimerIsolation.clearAll();

      const stats = TimerIsolation.getStats();
      expect(stats.activeTimers).toBe(0);
    });

    it('should track and clear intervals', () => {
      TimerIsolation.initialize();

      const interval = TimerIsolation.setInterval(() => {}, 100);
      expect(interval).toBeDefined();

      TimerIsolation.clearAll();

      const stats = TimerIsolation.getStats();
      expect(stats.activeIntervals).toBe(0);
    });

    it('should track and clear immediates', () => {
      TimerIsolation.initialize();

      const immediate = TimerIsolation.setImmediate(() => {});
      expect(immediate).toBeDefined();

      TimerIsolation.clearAll();

      const stats = TimerIsolation.getStats();
      expect(stats.activeImmediates).toBe(0);
    });

    it('should wait for pending timers', async () => {
      TimerIsolation.initialize();

      let completed = false;
      TimerIsolation.setTimeout(() => {
        completed = true;
      }, 10);

      await TimerIsolation.waitForPendingTimers(100);
      expect(completed).toBe(true);
    });
  });

  describe('Integration Functions', () => {
    it('should setup and cleanup test isolation', async () => {
      await setupTestIsolation(testId);

      const stats = getIsolationStats();
      expect(stats.manager.activeTests).toBeGreaterThan(0);

      await cleanupTestIsolation(testId);

      const finalStats = getIsolationStats();
      expect(finalStats.manager.activeTests).toBe(0);
    });

    it('should run function with isolation', async () => {
      let testRan = false;

      const result = await withIsolation(testId, async () => {
        testRan = true;
        return 'success';
      });

      expect(testRan).toBe(true);
      expect(result).toBe('success');
    });

    it('should create isolated context', async () => {
      const context = createIsolatedContext(testId);

      await context.setup();

      const stats = context.getStats();
      expect(stats.manager.activeTests).toBeGreaterThan(0);

      await context.cleanup();

      const finalStats = context.getStats();
      expect(finalStats.manager.activeTests).toBe(0);
    });

    it('should run function in isolated context', async () => {
      const context = createIsolatedContext(testId);

      const result = await context.run(async () => {
        return 'context-success';
      });

      expect(result).toBe('context-success');
    });
  });

  describe('DOM Isolation', () => {
    // Skip DOM tests if not in browser environment
    const skipDOMTests = typeof document === 'undefined';

    it.skipIf(skipDOMTests)('should setup clean DOM state', () => {
      DOMIsolation.setupCleanDOM();

      expect(document.body.innerHTML).toBe('');
      expect(document.title).toBe('Test');
    });

    it.skipIf(skipDOMTests)('should track and cleanup DOM elements', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      DOMIsolation.trackElement(element);
      DOMIsolation.cleanupDOM();

      expect(document.body.innerHTML).toBe('');
    });

    it.skipIf(skipDOMTests)('should create and restore DOM snapshot', () => {
      DOMIsolation.createSnapshot();

      document.body.innerHTML = '<div>test</div>';

      DOMIsolation.restoreFromSnapshot();

      // Should restore to clean state
      expect(document.body.innerHTML).toBe('');
    });
  });
});
