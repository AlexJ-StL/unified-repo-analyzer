/**
 * Tests for ResourceController
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  canStartProcess,
  emergencyCleanup,
  getResourceStats,
  ResourceController,
  resourceController,
  startResourceMonitoring,
  stopResourceMonitoring,
} from './ResourceController';

describe('ResourceController System', () => {
  beforeEach(() => {
    // Reset the controller state
    resourceController.stopMonitoring();
  });

  afterEach(() => {
    // Clean up after each test
    resourceController.stopMonitoring();
  });

  it('should be a singleton', () => {
    const instance1 = ResourceController.getInstance();
    const instance2 = ResourceController.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should update and get resource limits', () => {
    const newLimits = {
      maxConcurrentProcesses: 2,
      maxCpuPercent: 90,
    };

    resourceController.updateLimits(newLimits);
    const limits = resourceController.getLimits();

    expect(limits.maxConcurrentProcesses).toBe(2);
    expect(limits.maxCpuPercent).toBe(90);
    expect(limits.maxMemoryMB).toBe(2048); // Should keep default
  });

  it('should start and stop monitoring', () => {
    // Should not throw
    expect(() => {
      startResourceMonitoring(1000);
    }).not.toThrow();

    expect(() => {
      stopResourceMonitoring();
    }).not.toThrow();
  });

  it('should get resource statistics', async () => {
    const stats = await getResourceStats();

    expect(stats).toHaveProperty('totalProcesses');
    expect(stats).toHaveProperty('bunProcesses');
    expect(stats).toHaveProperty('vitestProcesses');
    expect(stats).toHaveProperty('totalCpuPercent');
    expect(stats).toHaveProperty('totalMemoryMB');
    expect(stats).toHaveProperty('systemLoad');

    expect(typeof stats.totalProcesses).toBe('number');
    expect(typeof stats.bunProcesses).toBe('number');
    expect(typeof stats.vitestProcesses).toBe('number');
  });

  it('should check if process can start', async () => {
    const canStart = await canStartProcess();
    expect(typeof canStart).toBe('boolean');
  });

  it('should register and unregister processes', () => {
    const testPid = 12345;

    // Should not throw
    expect(() => {
      resourceController.registerProcess(testPid);
    }).not.toThrow();

    expect(() => {
      resourceController.unregisterProcess(testPid);
    }).not.toThrow();
  });

  it('should handle emergency cleanup', () => {
    // Just test that the function exists and can be called
    expect(typeof emergencyCleanup).toBe('function');

    // Test that calling it doesn't throw immediately
    expect(() => {
      emergencyCleanup(); // Don't await to avoid hanging
    }).not.toThrow();
  });

  it('should handle process killing gracefully', async () => {
    // Test with non-existent PID - should handle gracefully
    const result = await resourceController.killProcess(999999);
    expect(typeof result).toBe('boolean');
  });

  it('should export convenience functions', () => {
    expect(typeof startResourceMonitoring).toBe('function');
    expect(typeof stopResourceMonitoring).toBe('function');
    expect(typeof getResourceStats).toBe('function');
    expect(typeof canStartProcess).toBe('function');
    expect(typeof emergencyCleanup).toBe('function');
  });
});
