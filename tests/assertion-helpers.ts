/**
 * Test Assertion Validation Helpers
 * Provides utilities to validate test assertions and prevent common issues
 */

import { expect } from 'vitest';

/**
 * Validates that an array has expected structure and content
 */
export function validateArrayStructure<T>(
  array: T[],
  options: {
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    itemValidator?: (item: T, index: number) => void;
    uniqueBy?: keyof T;
    sortedBy?: keyof T;
  } = {}
): void {
  const { minLength, maxLength, exactLength, itemValidator, uniqueBy, sortedBy } = options;

  // Length validations
  if (exactLength !== undefined) {
    expect(array).toHaveLength(exactLength);
  } else {
    if (minLength !== undefined) {
      expect(array.length).toBeGreaterThanOrEqual(minLength);
    }
    if (maxLength !== undefined) {
      expect(array.length).toBeLessThanOrEqual(maxLength);
    }
  }

  // Item validation
  if (itemValidator) {
    array.forEach((item, index) => {
      try {
        itemValidator(item, index);
      } catch (error) {
        throw new Error(`Array item at index ${index} failed validation: ${error}`);
      }
    });
  }

  // Uniqueness validation
  if (uniqueBy) {
    const values = array.map((item) => item[uniqueBy]);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  }

  // Sorting validation
  if (sortedBy) {
    const values = array.map((item) => item[sortedBy]);
    const sortedValues = [...values].sort();
    expect(values).toEqual(sortedValues);
  }
}

/**
 * Validates search results with comprehensive checks
 */
export function validateSearchResults(
  results: unknown[],
  options: {
    requiredProperties?: string[];
    optionalProperties?: string[];
    maxResults?: number;
    minResults?: number;
    sortedBy?: string;
    filterBy?: Record<string, unknown>;
  } = {}
): void {
  const {
    requiredProperties = [],
    optionalProperties = [],
    maxResults,
    minResults,
    sortedBy,
    filterBy,
  } = options;

  // Length validation
  if (minResults !== undefined) {
    expect(results.length).toBeGreaterThanOrEqual(minResults);
  }
  if (maxResults !== undefined) {
    expect(results.length).toBeLessThanOrEqual(maxResults);
  }

  // Property validation
  results.forEach((result, _index) => {
    const resultObj = result as Record<string, unknown>;

    // Check required properties
    requiredProperties.forEach((prop) => {
      expect(resultObj).toHaveProperty(prop);
      expect(resultObj[prop]).toBeDefined();
    });

    // Check optional properties (if present, should be defined)
    optionalProperties.forEach((prop) => {
      if (prop in resultObj) {
        expect(resultObj[prop]).toBeDefined();
      }
    });
  });

  // Sorting validation
  if (sortedBy && results.length > 1) {
    for (let i = 1; i < results.length; i++) {
      const prev = (results[i - 1] as Record<string, unknown>)[sortedBy];
      const curr = (results[i] as Record<string, unknown>)[sortedBy];
      expect((prev as string | number) <= (curr as string | number)).toBe(true);
    }
  }

  // Filter validation
  if (filterBy) {
    results.forEach((result) => {
      const resultObj = result as Record<string, unknown>;
      Object.entries(filterBy).forEach(([key, expectedValue]) => {
        if (Array.isArray(expectedValue)) {
          expect(expectedValue).toContain(resultObj[key]);
        } else {
          expect(resultObj[key]).toBe(expectedValue);
        }
      });
    });
  }
}

/**
 * Validates repository objects have expected structure
 */
export function validateRepositoryStructure(repository: Record<string, unknown>): void {
  // Required properties
  expect(repository).toHaveProperty('id');
  expect(repository).toHaveProperty('name');
  expect(repository).toHaveProperty('path');

  // Type validations
  expect(typeof repository.id).toBe('string');
  expect(typeof repository.name).toBe('string');
  expect(typeof repository.path).toBe('string');

  // Optional but common properties
  if ('languages' in repository) {
    expect(Array.isArray(repository.languages)).toBe(true);
  }

  if ('frameworks' in repository) {
    expect(Array.isArray(repository.frameworks)).toBe(true);
  }

  if ('tags' in repository) {
    expect(Array.isArray(repository.tags)).toBe(true);
  }

  if ('createdAt' in repository) {
    expect(repository.createdAt).toBeInstanceOf(Date);
  }

  if ('updatedAt' in repository) {
    expect(repository.updatedAt).toBeInstanceOf(Date);
  }
}

/**
 * Validates analysis results structure
 */
export function validateAnalysisResults(analysis: Record<string, unknown>): void {
  // Required top-level properties
  expect(analysis).toHaveProperty('summary');
  expect(analysis).toHaveProperty('details');
  expect(analysis).toHaveProperty('metadata');

  // Summary validation
  expect(analysis.summary).toHaveProperty('totalFiles');
  expect(analysis.summary).toHaveProperty('totalLines');
  expect(analysis.summary).toHaveProperty('languages');
  expect(typeof (analysis.summary as Record<string, unknown>).totalFiles).toBe('number');
  expect(typeof (analysis.summary as Record<string, unknown>).totalLines).toBe('number');
  expect(Array.isArray((analysis.summary as Record<string, unknown>).languages)).toBe(true);

  // Details validation
  expect(analysis.details).toHaveProperty('files');
  expect(Array.isArray((analysis.details as Record<string, unknown>).files)).toBe(true);

  // Metadata validation
  expect(analysis.metadata).toHaveProperty('analysisDate');
  expect(analysis.metadata).toHaveProperty('version');
  expect((analysis.metadata as Record<string, unknown>).analysisDate).toBeInstanceOf(Date);
  expect(typeof (analysis.metadata as Record<string, unknown>).version).toBe('string');
}

/**
 * Validates error objects have expected structure
 */
export function validateErrorStructure(
  error: Error | Record<string, unknown>,
  expectedType?: string
): void {
  expect(error).toBeInstanceOf(Error);
  expect(error).toHaveProperty('message');
  expect(typeof (error as Error).message).toBe('string');
  expect((error as Error).message.length).toBeGreaterThan(0);

  if (expectedType) {
    expect((error as Error).name).toBe(expectedType);
  }

  // Stack trace should be present
  expect(error).toHaveProperty('stack');
  expect(typeof (error as Error).stack).toBe('string');
}

/**
 * Validates mock function calls with detailed assertions
 */
export function validateMockCalls(
  mockFn: { mock: { calls: unknown[][]; results: Array<{ value: unknown }> } },
  options: {
    callCount?: number;
    calledWith?: unknown[][];
    returnedWith?: unknown[];
    nthCallWith?: { call: number; args: unknown[] };
  } = {}
): void {
  const { callCount, calledWith, returnedWith, nthCallWith } = options;

  // Verify it's a mock function
  expect(mockFn.mock).toBeDefined();

  // Call count validation
  if (callCount !== undefined) {
    expect(mockFn).toHaveBeenCalledTimes(callCount);
  }

  // Called with validation
  if (calledWith) {
    calledWith.forEach((args, index) => {
      expect(mockFn).toHaveBeenNthCalledWith(index + 1, ...args);
    });
  }

  // Return value validation
  if (returnedWith) {
    returnedWith.forEach((returnValue, index) => {
      expect(mockFn.mock.results[index].value).toBe(returnValue);
    });
  }

  // Specific call validation
  if (nthCallWith) {
    expect(mockFn).toHaveBeenNthCalledWith(nthCallWith.call, ...nthCallWith.args);
  }
}

/**
 * Validates performance metrics
 */
export function validatePerformanceMetrics(
  metrics: Record<string, unknown>,
  options: {
    maxDuration?: number;
    minDuration?: number;
    maxMemory?: number;
    requiredMetrics?: string[];
  } = {}
): void {
  const { maxDuration, minDuration, maxMemory, requiredMetrics = [] } = options;

  // Required metrics
  requiredMetrics.forEach((metric) => {
    expect(metrics).toHaveProperty(metric);
    expect(typeof metrics[metric]).toBe('number');
  });

  // Duration validation
  if ('duration' in metrics) {
    if (maxDuration !== undefined) {
      expect(metrics.duration).toBeLessThanOrEqual(maxDuration);
    }
    if (minDuration !== undefined) {
      expect(metrics.duration).toBeGreaterThanOrEqual(minDuration);
    }
  }

  // Memory validation
  if ('memoryUsage' in metrics && maxMemory !== undefined) {
    expect(metrics.memoryUsage).toBeLessThanOrEqual(maxMemory);
  }
}

/**
 * Validates configuration objects
 */
export function validateConfiguration(
  config: Record<string, unknown>,
  schema: Record<string, { type: string; required?: boolean; default?: unknown }>
): void {
  Object.entries(schema).forEach(([key, definition]) => {
    const { type, required = false, default: defaultValue } = definition;

    if (required) {
      expect(config).toHaveProperty(key);
    }

    if (key in config) {
      const value = config[key];

      switch (type) {
        case 'string':
          expect(typeof value).toBe('string');
          break;
        case 'number':
          expect(typeof value).toBe('number');
          break;
        case 'boolean':
          expect(typeof value).toBe('boolean');
          break;
        case 'array':
          expect(Array.isArray(value)).toBe(true);
          break;
        case 'object':
          expect(typeof value).toBe('object');
          expect(value).not.toBeNull();
          break;
      }
    } else if (defaultValue !== undefined) {
      // If not present but has default, that's okay
      expect(true).toBe(true);
    }
  });
}

/**
 * Validates API response structure
 */
export function validateAPIResponse(
  response: Record<string, unknown>,
  options: {
    statusCode?: number;
    requiredHeaders?: string[];
    bodySchema?: Record<string, unknown>;
    errorSchema?: Record<string, unknown>;
  } = {}
): void {
  const { statusCode, requiredHeaders = [], bodySchema, errorSchema } = options;

  // Status code validation
  if (statusCode !== undefined) {
    expect((response.status as number) || (response.statusCode as number)).toBe(statusCode);
  }

  // Headers validation
  if (response.headers) {
    requiredHeaders.forEach((header) => {
      expect(response.headers as Record<string, unknown>).toHaveProperty(header.toLowerCase());
    });
  }

  // Body validation
  if ((response.body as unknown) || (response.data as unknown)) {
    const body = (response.body as unknown) || (response.data as unknown);

    if (statusCode && statusCode >= 200 && statusCode < 300 && bodySchema) {
      validateConfiguration(
        body as Record<string, unknown>,
        bodySchema as Record<string, { type: string; required?: boolean; default?: unknown }>
      );
    } else if (statusCode && statusCode >= 400 && errorSchema) {
      validateConfiguration(
        body as Record<string, unknown>,
        errorSchema as Record<string, { type: string; required?: boolean; default?: unknown }>
      );
    }
  }
}

/**
 * Validates file system operations results
 */
export function validateFileSystemResults(
  results: Record<string, unknown>,
  options: {
    expectedFiles?: string[];
    expectedDirectories?: string[];
    fileContentValidation?: Record<string, (content: string) => void>;
  } = {}
): void {
  const { expectedFiles = [], expectedDirectories = [], fileContentValidation = {} } = options;

  // File existence validation
  expectedFiles.forEach((filePath) => {
    expect(results.files as unknown[]).toContain(filePath);
  });

  // Directory existence validation
  expectedDirectories.forEach((dirPath) => {
    expect(results.directories as unknown[]).toContain(dirPath);
  });

  // File content validation
  Object.entries(fileContentValidation).forEach(([filePath, validator]) => {
    expect(results.fileContents as Record<string, unknown>).toHaveProperty(filePath);
    validator((results.fileContents as Record<string, string>)[filePath]);
  });
}

/**
 * Common assertion patterns for specific test scenarios
 */

/**
 * Validates a successful repository search
 */
export function validateRepositorySearch(results: unknown[], query: Record<string, unknown>): void {
  validateSearchResults(results, {
    requiredProperties: ['id', 'name', 'path'],
    optionalProperties: ['languages', 'frameworks', 'tags', 'description'],
    maxResults: 100, // Reasonable limit
  });

  // Validate each repository structure
  results.forEach((repo) => {
    validateRepositoryStructure(repo as Record<string, unknown>);
  });

  // If query has specific filters, validate they're applied
  if (query.languages) {
    results.forEach((repo) => {
      const repoObj = repo as Record<string, unknown>;
      const languages = repoObj.languages as unknown[];
      const hasMatchingLanguage = (query.languages as string[]).some((lang: string) =>
        languages?.includes(lang)
      );
      expect(hasMatchingLanguage).toBe(true);
    });
  }

  if (query.frameworks) {
    results.forEach((repo) => {
      const repoObj = repo as Record<string, unknown>;
      const frameworks = repoObj.frameworks as unknown[];
      const hasMatchingFramework = (query.frameworks as string[]).some((framework: string) =>
        frameworks?.includes(framework)
      );
      expect(hasMatchingFramework).toBe(true);
    });
  }
}

/**
 * Validates a successful analysis operation
 */
export function validateAnalysisOperation(result: Record<string, unknown>): void {
  validateAnalysisResults(result);

  // Additional analysis-specific validations
  expect((result.summary as Record<string, unknown>).totalFiles as number).toBeGreaterThan(0);
  expect((result.summary as Record<string, unknown>).totalLines as number).toBeGreaterThan(0);
  expect(
    ((result.summary as Record<string, unknown>).languages as unknown[]).length
  ).toBeGreaterThan(0);

  // Validate file details
  const files = (result.details as Record<string, unknown>).files as unknown[];
  files.forEach((file: unknown) => {
    const fileObj = file as Record<string, unknown>;
    expect(fileObj).toHaveProperty('path');
    expect(fileObj).toHaveProperty('language');
    expect(fileObj).toHaveProperty('lines');
    expect(typeof fileObj.path).toBe('string');
    expect(typeof fileObj.language).toBe('string');
    expect(typeof fileObj.lines).toBe('number');
  });
}

/**
 * Validates a successful export operation
 */
export function validateExportOperation(result: Record<string, unknown>, format: string): void {
  expect(result).toHaveProperty('success');
  expect(result.success).toBe(true);
  expect(result).toHaveProperty('format');
  expect(result.format).toBe(format);
  expect(result).toHaveProperty('outputPath');
  expect(typeof result.outputPath).toBe('string');

  if (result.data) {
    switch (format.toLowerCase()) {
      case 'json':
        expect(() => JSON.parse(result.data as string)).not.toThrow();
        break;
      case 'markdown':
        expect(typeof result.data).toBe('string');
        expect(result.data as string).toContain('#'); // Should have markdown headers
        break;
      case 'html':
        expect(typeof result.data).toBe('string');
        expect(result.data as string).toContain('<html>'); // Should be valid HTML
        break;
    }
  }
}

/**
 * Validates logging operations
 */
export function validateLoggingOperation(
  mockLogger: Record<string, { mock: { calls: Array<[string, ...unknown[]]> } }>,
  expectedLogs: Array<{ level: string; message: string; metadata?: Record<string, unknown> }>
): void {
  expectedLogs.forEach((expectedLog, _index) => {
    const { level, message, metadata } = expectedLog;

    expect(mockLogger[level]).toBeDefined();
    expect(mockLogger[level].mock).toBeDefined();

    const calls = mockLogger[level].mock.calls;
    const matchingCall = calls.find(
      (call: [string, ...unknown[]]) => call[0].includes(message) || call[0] === message
    );

    expect(matchingCall).toBeDefined();

    if (metadata && matchingCall) {
      expect(matchingCall[1]).toMatchObject(metadata);
    }
  });
}
