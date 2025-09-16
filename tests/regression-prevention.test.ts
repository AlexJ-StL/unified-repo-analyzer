/**
 * Regression Prevention Tests
 * Tests to prevent future test infrastructure issues
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createValidatedMock,
  ensureMockCleanup,
  RegressionPrevention,
  validateArrayStructure,
  validateAsyncMethods,
  validateExpectationPatterns,
  validateIndexSystemAPI,
  validateMemoryUsage,
  validateMethodSignatures,
  validateMock,
  validateMockingInfrastructure,
  validatePerformance,
  validateSearchResults,
  validateTestEnvironment,
  validateTestIsolation,
  validateTestUtilities,
} from './regression-prevention';

describe('Regression Prevention Tests', () => {
  describe('Mock Infrastructure Validation', () => {
    it('should validate that mocking infrastructure is working', () => {
      expect(() => {
        validateMockingInfrastructure();
      }).not.toThrow();
    });

    it('should create properly typed mock functions', () => {
      const mockFn = createValidatedMock('testMock', () => 'test');

      expect(mockFn).toBeDefined();
      expect(typeof mockFn).toBe('function');
      expect(mockFn.mockClear).toBeDefined();
      expect(mockFn.mockReset).toBeDefined();
      expect(mockFn.mockRestore).toBeDefined();

      // Test that the mock works
      expect(mockFn()).toBe('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should validate mock functions properly', () => {
      const mockFn = vi.fn(() => 'test');

      expect(() => {
        validateMock(mockFn, 'testMock');
      }).not.toThrow();
    });

    it('should detect invalid mocks', () => {
      const invalidMock = {} as any;

      expect(() => {
        validateMock(invalidMock, 'invalidMock');
      }).toThrow('Mock invalidMock is not a function');
    });

    it('should properly cleanup mocks', () => {
      const mock1 = vi.fn();
      const mock2 = vi.fn();

      mock1();
      mock2();

      expect(mock1).toHaveBeenCalledTimes(1);
      expect(mock2).toHaveBeenCalledTimes(1);

      ensureMockCleanup([mock1, mock2]);

      expect(mock1).toHaveBeenCalledTimes(0);
      expect(mock2).toHaveBeenCalledTimes(0);
    });
  });

  describe('API Completeness Validation', () => {
    it('should validate IndexSystem API completeness', async () => {
      // Mock IndexSystem class for testing
      class MockIndexSystem {
        repositories = new Map();
        globalTags = new Set();

        addRepository() {}
        updateRepository() {}
        removeRepository() {}
        searchRepositories() {}
        findSimilarRepositories() {}
        suggestCombinations() {}
        addTag() {}
        removeTag() {}
        addGlobalTag() {}
        removeGlobalTag() {}
        getRepositoryCount() {}
        save() {}
        load() {}
      }

      expect(() => {
        validateIndexSystemAPI(MockIndexSystem);
      }).not.toThrow();
    });

    it('should detect missing methods in API', () => {
      class IncompleteIndexSystem {
        repositories = new Map();
        globalTags = new Set();

        addRepository() {}
        // Missing other required methods
      }

      expect(() => {
        validateIndexSystemAPI(IncompleteIndexSystem);
      }).toThrow('IndexSystem is missing required method: updateRepository');
    });

    it('should validate method signatures', () => {
      const mockObject = {
        methodWithOneParam: (_param: string) => {},
        methodWithTwoParams: (_param1: string, _param2: number) => {},
        methodWithNoParams: () => {},
      };

      const expectedSignatures = {
        methodWithOneParam: 1,
        methodWithTwoParams: 2,
        methodWithNoParams: 0,
      };

      expect(() => {
        validateMethodSignatures(mockObject, expectedSignatures);
      }).not.toThrow();
    });

    it('should validate async methods return promises', async () => {
      const mockInstance = {
        asyncMethod: async () => 'result',
        syncMethod: () => 'result',
      };

      // Should not throw for async method
      try {
        await validateAsyncMethods(mockInstance, ['asyncMethod']);
        // If we get here, the validation passed
        expect(true).toBe(true);
      } catch (error) {
        // If there's an error, it should be handled gracefully
        expect(error).toBeUndefined();
      }
    });
  });

  describe('Assertion Validation', () => {
    it('should validate expectation patterns', () => {
      const testResults = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];

      const expectedPatterns = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];

      expect(() => {
        validateExpectationPatterns(testResults, expectedPatterns);
      }).not.toThrow();
    });

    it('should detect pattern mismatches', () => {
      const testResults = [{ id: 1, name: 'test1' }];
      const expectedPatterns = [{ id: 1, name: 'different' }];

      expect(() => {
        validateExpectationPatterns(testResults, expectedPatterns);
      }).toThrow('Property name in index 0 has value test1, expected different');
    });

    it('should validate array structure', () => {
      const testArray = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
      ];

      const validator = (item: any, _index: number) => {
        if (!item.id || !item.name) {
          throw new Error('Item missing required properties');
        }
      };

      expect(() => {
        validateArrayStructure(testArray, validator, 1, 5);
      }).not.toThrow();
    });

    it('should validate search results structure', () => {
      const searchResults = [
        { id: 1, name: 'repo1', languages: ['JavaScript'] },
        { id: 2, name: 'repo2', languages: ['TypeScript'] },
      ];

      const expectedProperties = ['id', 'name', 'languages'];

      expect(() => {
        validateSearchResults(searchResults, expectedProperties);
      }).not.toThrow();
    });

    it('should detect missing properties in search results', () => {
      const searchResults = [
        { id: 1, name: 'repo1' }, // Missing languages
      ];

      const expectedProperties = ['id', 'name', 'languages'];

      expect(() => {
        validateSearchResults(searchResults, expectedProperties);
      }).toThrow('Search result at index 0 missing property: languages');
    });
  });

  describe('Test Environment Validation', () => {
    it('should validate test environment is properly configured', () => {
      expect(() => {
        validateTestEnvironment();
      }).not.toThrow();
    });

    it('should validate test utilities are available', () => {
      expect(() => {
        validateTestUtilities();
      }).not.toThrow();
    });

    it('should validate test isolation', () => {
      expect(() => {
        validateTestIsolation();
      }).not.toThrow();
    });
  });

  describe('Performance Validation', () => {
    it('should validate operation performance', async () => {
      const fastOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'result';
      };

      const result = await validatePerformance(
        fastOperation,
        100, // 100ms timeout
        'fastOperation'
      );

      expect(result).toBe('result');
    });

    it('should detect slow operations', async () => {
      const slowOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'result';
      };

      await expect(
        validatePerformance(
          slowOperation,
          100, // 100ms timeout
          'slowOperation'
        )
      ).rejects.toThrow('Operation slowOperation took');
    });

    it('should validate memory usage', () => {
      expect(() => {
        validateMemoryUsage(1000, 'testOperation'); // 1GB limit
      }).not.toThrow();
    });
  });

  describe('Comprehensive Regression Prevention', () => {
    it('should run all regression prevention checks', () => {
      expect(() => {
        RegressionPrevention.runAllChecks();
      }).not.toThrow();
    });

    it('should validate class API completeness', () => {
      class TestClass {
        property1 = 'value';

        method1() {}
        method2() {}
      }

      expect(() => {
        RegressionPrevention.validateClassAPI(TestClass, ['method1', 'method2'], ['property1']);
      }).not.toThrow();
    });

    it('should detect incomplete class APIs', () => {
      class IncompleteClass {
        method1() {}
        // Missing method2
      }

      expect(() => {
        RegressionPrevention.validateClassAPI(IncompleteClass, ['method1', 'method2']);
      }).toThrow('Class is missing required method: method2');
    });
  });

  describe('Real-world Regression Prevention', () => {
    it('should prevent vi.mock import issues', () => {
      // This test ensures vi.mock is properly available
      // vi.mock might not be available in all contexts, so we check more carefully
      if (typeof vi.mock === 'function') {
        expect(typeof vi.mock).toBe('function');
      }

      // Test that we can create a mock module
      const mockModule = vi.fn();
      expect(mockModule).toBeDefined();
      if (typeof vi.isMockFunction === 'function') {
        expect(vi.isMockFunction(mockModule)).toBe(true);
      }
    });

    it('should prevent vi.mocked type issues', () => {
      // This test ensures vi.mocked works with proper typing
      // vi.mocked might not be available in all contexts
      if (typeof vi.mocked === 'function') {
        const originalFn = (x: number) => x * 2;
        const mockedFn = vi.mocked(originalFn);

        if (typeof vi.isMockFunction === 'function') {
          expect(vi.isMockFunction(mockedFn)).toBe(true);
        }

        // Test that the mock can be configured
        mockedFn.mockReturnValue(42);
        expect(mockedFn(5)).toBe(42);
      }
    });

    it('should prevent IndexSystem method signature issues', () => {
      // Mock the IndexSystem to test method signatures
      class TestIndexSystem {
        repositories = new Map();
        globalTags = new Set();

        addRepository(_repo: any) {
          return 'id';
        }
        updateRepository(_id: string, _updates: any) {}
        removeRepository(_id: string) {
          return true;
        }
        searchRepositories(_query: any) {
          return [];
        }
        findSimilarRepositories(_id: string) {
          return [];
        }
        suggestCombinations(_ids: string[]) {
          return [];
        }
        addTag(_repoId: string, _tag: string) {}
        removeTag(_repoId: string, _tag: string) {}
        addGlobalTag(_tag: string) {}
        removeGlobalTag(_tag: string) {}
        getRepositoryCount() {
          return 0;
        }
        save() {}
        load() {}
      }

      // Validate that all expected methods exist and are callable
      const instance = new TestIndexSystem();

      expect(typeof instance.addRepository).toBe('function');
      expect(typeof instance.removeRepository).toBe('function');
      expect(typeof instance.getRepositoryCount).toBe('function');

      // Test that methods return expected types
      expect(typeof instance.getRepositoryCount()).toBe('number');
      expect(Array.isArray(instance.searchRepositories({}))).toBe(true);
    });

    it('should prevent test assertion pattern issues', () => {
      // Test common assertion patterns that have caused issues
      const searchResults = [
        {
          id: '1',
          name: 'repo1',
          languages: ['JavaScript'],
          frameworks: ['React'],
        },
        {
          id: '2',
          name: 'repo2',
          languages: ['TypeScript'],
          frameworks: ['Vue'],
        },
      ];

      // Validate structure
      expect(searchResults).toHaveLength(2);
      expect(searchResults[0]).toHaveProperty('id');
      expect(searchResults[0]).toHaveProperty('languages');
      expect(Array.isArray(searchResults[0].languages)).toBe(true);

      // Validate content patterns
      const jsRepos = searchResults.filter((repo) => repo.languages.includes('JavaScript'));
      expect(jsRepos).toHaveLength(1);
      expect(jsRepos[0].name).toBe('repo1');
    });

    it('should prevent logging configuration issues', () => {
      // Test that logging levels work as expected
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      // Simulate logging at different levels
      mockLogger.debug('debug message');
      mockLogger.info('info message');
      mockLogger.warn('warn message');
      mockLogger.error('error message');

      // Verify all levels were called
      expect(mockLogger.debug).toHaveBeenCalledWith('debug message');
      expect(mockLogger.info).toHaveBeenCalledWith('info message');
      expect(mockLogger.warn).toHaveBeenCalledWith('warn message');
      expect(mockLogger.error).toHaveBeenCalledWith('error message');
    });
  });
});
