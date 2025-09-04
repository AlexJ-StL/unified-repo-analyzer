/**
 * Test the MockManager system directly
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { MockManager } from './MockManager';

describe('MockManager System', () => {
  let mockManager: MockManager;

  beforeEach(() => {
    mockManager = MockManager.getInstance();
  });

  it('should create mock functions', () => {
    const mockFn = mockManager.mockFunction();
    expect(mockFn).toBeDefined();
    expect(typeof mockFn).toBe('function');
  });

  it('should create mock objects', () => {
    interface TestInterface extends Record<string, unknown> {
      method1: () => string;
      method2: (arg: number) => number;
      property: string;
    }

    const mock = mockManager.createMock<TestInterface>({
      method1: () => 'test',
      method2: (arg: number) => arg * 2,
      property: 'test-value',
    });

    expect(mock).toBeDefined();
    expect(mock.property).toBe('test-value');
    expect(typeof mock.method1).toBe('function');
    expect(typeof mock.method2).toBe('function');
  });

  it('should handle module mocking', () => {
    const modulePath = 'test-module';
    const mockFactory = () => ({
      testFunction: mockManager.mockFunction(),
      testValue: 'mocked',
    });

    // Should not throw
    expect(() => {
      mockManager.mockModule(modulePath, mockFactory);
    }).not.toThrow();

    // Should be able to retrieve the mock
    const mockedModule = mockManager.getMockedModule(modulePath);
    expect(mockedModule).toBeDefined();
  });

  it('should setup and cleanup mocks', () => {
    // Should not throw
    expect(() => {
      mockManager.setupMocks();
    }).not.toThrow();

    expect(() => {
      mockManager.cleanupMocks();
    }).not.toThrow();

    expect(() => {
      mockManager.resetAllMocks();
    }).not.toThrow();
  });

  it('should handle configuration updates', () => {
    const newConfig = {
      autoMock: true,
      clearMocksAfterEach: false,
    };

    mockManager.updateConfig(newConfig);
    const config = mockManager.getConfig();

    expect(config.autoMock).toBe(true);
    expect(config.clearMocksAfterEach).toBe(false);
  });
});
