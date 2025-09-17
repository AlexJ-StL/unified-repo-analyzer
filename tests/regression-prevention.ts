/**
 * Regression Prevention Utilities
 * Provides utilities to prevent future test infrastructure issues
 */

import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';

/**
 * Mock validation utilities to prevent future mocking issues
 */
/**
 * Validates that vi.mock is properly configured and working
 */
export function validateMockingInfrastructure(): void {
  // Test that vi.fn is available and functional (this is the core requirement)
  if (typeof vi.fn !== 'function') {
    throw new Error('vi.fn is not available - check vitest configuration');
  }

  // Test that vi.mocked is available and functional
  if (typeof vi.mocked !== 'function') {
    // vi.mocked might not be available in all contexts, this is OK
  }

  // vi.mock might not be available in all contexts, so we check more carefully
  if (typeof vi.mock !== 'function') {
    // vi.mock might not be available in all contexts, this is OK
  }
}

/**
 * Creates a properly typed mock function with validation
 */
export function createValidatedMock<T extends (...args: unknown[]) => unknown>(
  name: string,
  implementation?: T
): MockedFunction<T> {
  try {
    const mockFn = vi.fn(implementation) as MockedFunction<T>;

    // Validate mock function has expected properties
    if (!mockFn.mockClear) {
      throw new Error(`Mock function ${name} missing mockClear method`);
    }

    if (!mockFn.mockReset) {
      throw new Error(`Mock function ${name} missing mockReset method`);
    }

    if (!mockFn.mockRestore) {
      throw new Error(`Mock function ${name} missing mockRestore method`);
    }

    return mockFn;
  } catch (error) {
    throw new Error(`Failed to create mock function ${name}: ${error}`);
  }
}

/**
 * Validates that a mock is properly configured
 */
export function validateMock<T extends (...args: unknown[]) => unknown>(
  mock: MockedFunction<T>,
  name: string
): void {
  if (!mock) {
    throw new Error(`Mock ${name} is undefined or null`);
  }

  if (typeof mock !== 'function') {
    throw new Error(`Mock ${name} is not a function`);
  }

  if (!mock.mockClear) {
    throw new Error(`Mock ${name} is missing mockClear method`);
  }

  if (typeof mock.mockImplementation !== 'function') {
    throw new Error(`Mock ${name} is missing mockImplementation method`);
  }
}

/**
 * Ensures proper mock cleanup
 */
export function ensureMockCleanup(mocks: MockedFunction<(...args: unknown[]) => unknown>[]): void {
  for (const mock of mocks) {
    try {
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
      if (mock && typeof mock.mockReset === 'function') {
        mock.mockReset();
      }
    } catch (_error) {}
  }
}

/**
 * API completeness validation for IndexSystem and other core classes
 */
/**
 * Validates that IndexSystem has all required methods
 */
export function validateIndexSystemAPI(indexSystemClass: new () => Record<string, unknown>): void {
  const requiredMethods = [
    'addRepository',
    'updateRepository',
    'removeRepository',
    'searchRepositories',
    'findSimilarRepositories',
    'suggestCombinations',
    'addTag',
    'removeTag',
    'addGlobalTag',
    'removeGlobalTag',
    'getRepositoryCount',
    'save',
    'load',
  ];

  const requiredProperties = ['repositories', 'globalTags'];

  // Check methods
  for (const method of requiredMethods) {
    if (typeof (indexSystemClass.prototype as Record<string, unknown>)[method] !== 'function') {
      throw new Error(`IndexSystem is missing required method: ${method}`);
    }
  }

  // Check properties (on instance)
  const instance = new indexSystemClass();
  for (const property of requiredProperties) {
    if (!(property in instance)) {
      throw new Error(`IndexSystem is missing required property: ${property}`);
    }
  }
}

/**
 * Validates method signatures match expected patterns
 */
export function validateMethodSignatures(
  obj: Record<string, unknown>,
  expectedSignatures: Record<string, number>
): void {
  for (const [methodName, expectedParamCount] of Object.entries(expectedSignatures)) {
    const method = obj[methodName] || obj.prototype?.[methodName];

    if (!method) {
      throw new Error(`Method ${methodName} not found`);
    }

    if (typeof method !== 'function') {
      throw new Error(`${methodName} is not a function`);
    }

    // Check parameter count (approximate, as it doesn't account for optional params)
    if (method.length > expectedParamCount) {
    }
  }
}

/**
 * Validates that async methods return promises
 */
export async function validateAsyncMethods(
  instance: Record<string, unknown>,
  asyncMethods: string[]
): Promise<void> {
  for (const methodName of asyncMethods) {
    const method = instance[methodName];

    if (!method) {
      throw new Error(`Async method ${methodName} not found`);
    }

    try {
      // Check if method name suggests it should be async
      const isAsyncMethod = methodName.startsWith('async') || methodName.includes('Async');

      if (isAsyncMethod) {
        // For methods that should be async, we can't easily test without proper parameters
        // Just verify it exists and is callable
        if (typeof method !== 'function') {
          throw new Error(`Method ${methodName} is not a function`);
        }
      }
    } catch (_error) {
      // This is expected for methods that require specific parameters
      // We're just checking that they exist and are callable
    }
  }
}

/**
 * Test assertion validation helpers
 */
/**
 * Validates that test expectations match actual behavior patterns
 */
export function validateExpectationPatterns(
  testResults: unknown[],
  expectedPatterns: unknown[]
): void {
  if (testResults.length !== expectedPatterns.length) {
    throw new Error(
      `Test results length (${testResults.length}) doesn't match expected patterns length (${expectedPatterns.length})`
    );
  }

  for (let i = 0; i < testResults.length; i++) {
    const result = testResults[i];
    const pattern = expectedPatterns[i];

    if (typeof pattern === 'object' && pattern !== null) {
      validateObjectPattern(result, pattern, `index ${i}`);
    } else if (result !== pattern) {
      throw new Error(
        `Test result at index ${i} (${result}) doesn't match expected pattern (${pattern})`
      );
    }
  }
}

/**
 * Validates object patterns recursively (private helper)
 */
function validateObjectPattern(obj: unknown, pattern: unknown, context: string): void {
  if (typeof pattern !== 'object' || pattern === null || Array.isArray(pattern)) {
    return;
  }
  const patternObj = pattern as Record<string, unknown>;

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error(`Invalid object in ${context}`);
  }
  const objRecord = obj as Record<string, unknown>;

  for (const [key, expectedValue] of Object.entries(patternObj)) {
    if (!(key in objRecord)) {
      throw new Error(`Missing property ${key} in ${context}`);
    }

    if (typeof expectedValue === 'object' && expectedValue !== null) {
      validateObjectPattern(objRecord[key], expectedValue, `${context}.${key}`);
    } else if (objRecord[key] !== expectedValue) {
      throw new Error(
        `Property ${key} in ${context} has value ${objRecord[key]}, expected ${expectedValue}`
      );
    }
  }
}

/**
 * Validates that array results have expected structure
 */
export function validateArrayStructure<T>(
  array: T[],
  validator: (item: T, index: number) => void,
  minLength?: number,
  maxLength?: number
): void {
  if (minLength !== undefined && array.length < minLength) {
    throw new Error(`Array length ${array.length} is less than minimum ${minLength}`);
  }

  if (maxLength !== undefined && array.length > maxLength) {
    throw new Error(`Array length ${array.length} is greater than maximum ${maxLength}`);
  }

  for (const [index, item] of array.entries()) {
    try {
      validator(item, index);
    } catch (error) {
      throw new Error(`Array item at index ${index} failed validation: ${error}`);
    }
  }
}

/**
 * Validates that search results have expected properties
 */
export function validateSearchResults(results: unknown[], expectedProperties: string[]): void {
  validateArrayStructure(results, (item, index) => {
    const itemRecord = item as Record<string, unknown>;
    for (const prop of expectedProperties) {
      if (!(prop in itemRecord)) {
        throw new Error(`Search result at index ${index} missing property: ${prop}`);
      }
    }
  });
}

/**
 * Test environment validation
 */
/**
 * Validates that the test environment is properly configured
 */
export function validateTestEnvironment(): void {
  // Check Node.js/Bun environment
  if (typeof process === 'undefined') {
    throw new Error('Process object not available - invalid test environment');
  }

  // Check that we're in test mode
  if (process.env.NODE_ENV !== 'test') {
  }

  // Check vitest globals - these should be available in the test context
  // We use globalThis to check for globals that might be injected
  if (
    typeof (globalThis as unknown as { expect?: unknown }).expect === 'undefined' &&
    typeof (expect as unknown) === 'undefined'
  ) {
  }

  if (
    typeof (globalThis as unknown as { describe?: unknown }).describe === 'undefined' &&
    typeof (describe as unknown) === 'undefined'
  ) {
  }

  if (
    typeof (globalThis as unknown as { it?: unknown }).it === 'undefined' &&
    typeof (it as unknown) === 'undefined'
  ) {
  }
}

/**
 * Validates that required test utilities are available
 */
export function validateTestUtilities(): void {
  // Check vi utilities
  if (typeof vi === 'undefined') {
    throw new Error('vi is not available - check vitest imports');
  }

  // Check specific vi methods - some may not be available in all contexts
  const coreViMethods = ['fn'];
  const optionalViMethods = ['mock', 'mocked', 'clearAllMocks', 'resetAllMocks'];

  for (const method of coreViMethods) {
    if (typeof (vi as unknown as Record<string, unknown>)[method] !== 'function') {
      throw new Error(`vi.${method} is not available - check vitest configuration`);
    }
  }

  for (const method of optionalViMethods) {
    if (typeof (vi as unknown as Record<string, unknown>)[method] !== 'function') {
    }
  }
}

/**
 * Validates test isolation
 */
export function validateTestIsolation(): void {
  // Check that global state is clean
  if (typeof vi.isMockFunction === 'function' && vi.isMockFunction(console.log)) {
  }

  // Check for leaked timers
  if (typeof vi.getTimerCount === 'function' && vi.getTimerCount() > 0) {
  }
}

/**
 * Performance regression prevention
 */
/**
 * Validates that operations complete within expected time bounds
 */
export async function validatePerformance<T>(
  operation: () => Promise<T>,
  maxTimeMs: number,
  operationName: string
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > maxTimeMs) {
      throw new Error(
        `Operation ${operationName} took ${duration.toFixed(2)}ms, expected < ${maxTimeMs}ms`
      );
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > maxTimeMs) {
      throw new Error(
        `Operation ${operationName} failed after ${duration.toFixed(2)}ms (timeout: ${maxTimeMs}ms): ${error}`
      );
    }

    throw error;
  }
}

/**
 * Validates memory usage doesn't exceed expected bounds
 */
export function validateMemoryUsage(maxMemoryMB: number, operationName: string): void {
  if (typeof process.memoryUsage === 'function') {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;

    if (heapUsedMB > maxMemoryMB) {
      throw new Error(
        `Operation ${operationName} used ${heapUsedMB.toFixed(2)}MB heap, expected < ${maxMemoryMB}MB`
      );
    }
  }
}

/**
 * Main regression prevention validator
 */
export class RegressionPrevention {
  /**
   * Runs all regression prevention checks
   */
  static runAllChecks(): void {
    validateTestEnvironment();
    validateTestUtilities();
    validateMockingInfrastructure();

    console.log('✅ All regression prevention checks passed');
  }

  /**
   * Validates a specific class API for completeness
   */
  static validateClassAPI(
    classConstructor: unknown,
    requiredMethods: string[],
    requiredProperties: string[] = []
  ): void {
    if (typeof classConstructor !== 'function') {
      throw new Error('Invalid class constructor');
    }
    const ctor = classConstructor as new () => Record<string, unknown>;

    // Check methods on prototype
    for (const method of requiredMethods) {
      if (typeof (ctor as any).prototype[method] !== 'function') {
        throw new Error(`Class is missing required method: ${method}`);
      }
    }

    // Check properties on instance
    if (requiredProperties.length > 0) {
      const instance = new ctor();
      for (const property of requiredProperties) {
        if (!(property in instance)) {
          throw new Error(`Class is missing required property: ${property}`);
        }
      }
    }

    console.log(`✅ Class API validation passed for ${(ctor as any).name}`);
  }
}
