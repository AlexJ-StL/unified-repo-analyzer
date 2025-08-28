/**
 * Test Assertion Validation Helpers
 * Provides utilities to validate test assertions and prevent common issues
 */

import { expect } from "vitest";

/**
 * Enhanced assertion helpers that provide better error messages and validation
 */
export class AssertionHelpers {
  /**
   * Validates that an array has expected structure and content
   */
  static validateArrayStructure<T>(
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
    const {
      minLength,
      maxLength,
      exactLength,
      itemValidator,
      uniqueBy,
      sortedBy,
    } = options;

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
          throw new Error(
            `Array item at index ${index} failed validation: ${error}`
          );
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
  static validateSearchResults(
    results: any[],
    options: {
      requiredProperties?: string[];
      optionalProperties?: string[];
      maxResults?: number;
      minResults?: number;
      sortedBy?: string;
      filterBy?: Record<string, any>;
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
    results.forEach((result, index) => {
      // Check required properties
      requiredProperties.forEach((prop) => {
        expect(result).toHaveProperty(prop);
        expect(result[prop]).toBeDefined();
      });

      // Check optional properties (if present, should be defined)
      optionalProperties.forEach((prop) => {
        if (prop in result) {
          expect(result[prop]).toBeDefined();
        }
      });
    });

    // Sorting validation
    if (sortedBy && results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1][sortedBy];
        const curr = results[i][sortedBy];
        expect(prev <= curr).toBe(true);
      }
    }

    // Filter validation
    if (filterBy) {
      results.forEach((result) => {
        Object.entries(filterBy).forEach(([key, expectedValue]) => {
          if (Array.isArray(expectedValue)) {
            expect(expectedValue).toContain(result[key]);
          } else {
            expect(result[key]).toBe(expectedValue);
          }
        });
      });
    }
  }

  /**
   * Validates repository objects have expected structure
   */
  static validateRepositoryStructure(repository: any): void {
    // Required properties
    expect(repository).toHaveProperty("id");
    expect(repository).toHaveProperty("name");
    expect(repository).toHaveProperty("path");

    // Type validations
    expect(typeof repository.id).toBe("string");
    expect(typeof repository.name).toBe("string");
    expect(typeof repository.path).toBe("string");

    // Optional but common properties
    if ("languages" in repository) {
      expect(Array.isArray(repository.languages)).toBe(true);
    }

    if ("frameworks" in repository) {
      expect(Array.isArray(repository.frameworks)).toBe(true);
    }

    if ("tags" in repository) {
      expect(Array.isArray(repository.tags)).toBe(true);
    }

    if ("createdAt" in repository) {
      expect(repository.createdAt).toBeInstanceOf(Date);
    }

    if ("updatedAt" in repository) {
      expect(repository.updatedAt).toBeInstanceOf(Date);
    }
  }

  /**
   * Validates analysis results structure
   */
  static validateAnalysisResults(analysis: any): void {
    // Required top-level properties
    expect(analysis).toHaveProperty("summary");
    expect(analysis).toHaveProperty("details");
    expect(analysis).toHaveProperty("metadata");

    // Summary validation
    expect(analysis.summary).toHaveProperty("totalFiles");
    expect(analysis.summary).toHaveProperty("totalLines");
    expect(analysis.summary).toHaveProperty("languages");
    expect(typeof analysis.summary.totalFiles).toBe("number");
    expect(typeof analysis.summary.totalLines).toBe("number");
    expect(Array.isArray(analysis.summary.languages)).toBe(true);

    // Details validation
    expect(analysis.details).toHaveProperty("files");
    expect(Array.isArray(analysis.details.files)).toBe(true);

    // Metadata validation
    expect(analysis.metadata).toHaveProperty("analysisDate");
    expect(analysis.metadata).toHaveProperty("version");
    expect(analysis.metadata.analysisDate).toBeInstanceOf(Date);
    expect(typeof analysis.metadata.version).toBe("string");
  }

  /**
   * Validates error objects have expected structure
   */
  static validateErrorStructure(error: any, expectedType?: string): void {
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty("message");
    expect(typeof error.message).toBe("string");
    expect(error.message.length).toBeGreaterThan(0);

    if (expectedType) {
      expect(error.name).toBe(expectedType);
    }

    // Stack trace should be present
    expect(error).toHaveProperty("stack");
    expect(typeof error.stack).toBe("string");
  }

  /**
   * Validates mock function calls with detailed assertions
   */
  static validateMockCalls(
    mockFn: any,
    options: {
      callCount?: number;
      calledWith?: any[][];
      returnedWith?: any[];
      nthCallWith?: { call: number; args: any[] };
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
      expect(mockFn).toHaveBeenNthCalledWith(
        nthCallWith.call,
        ...nthCallWith.args
      );
    }
  }

  /**
   * Validates performance metrics
   */
  static validatePerformanceMetrics(
    metrics: any,
    options: {
      maxDuration?: number;
      minDuration?: number;
      maxMemory?: number;
      requiredMetrics?: string[];
    } = {}
  ): void {
    const {
      maxDuration,
      minDuration,
      maxMemory,
      requiredMetrics = [],
    } = options;

    // Required metrics
    requiredMetrics.forEach((metric) => {
      expect(metrics).toHaveProperty(metric);
      expect(typeof metrics[metric]).toBe("number");
    });

    // Duration validation
    if ("duration" in metrics) {
      if (maxDuration !== undefined) {
        expect(metrics.duration).toBeLessThanOrEqual(maxDuration);
      }
      if (minDuration !== undefined) {
        expect(metrics.duration).toBeGreaterThanOrEqual(minDuration);
      }
    }

    // Memory validation
    if ("memoryUsage" in metrics && maxMemory !== undefined) {
      expect(metrics.memoryUsage).toBeLessThanOrEqual(maxMemory);
    }
  }

  /**
   * Validates configuration objects
   */
  static validateConfiguration(
    config: any,
    schema: Record<string, { type: string; required?: boolean; default?: any }>
  ): void {
    Object.entries(schema).forEach(([key, definition]) => {
      const { type, required = false, default: defaultValue } = definition;

      if (required) {
        expect(config).toHaveProperty(key);
      }

      if (key in config) {
        const value = config[key];

        switch (type) {
          case "string":
            expect(typeof value).toBe("string");
            break;
          case "number":
            expect(typeof value).toBe("number");
            break;
          case "boolean":
            expect(typeof value).toBe("boolean");
            break;
          case "array":
            expect(Array.isArray(value)).toBe(true);
            break;
          case "object":
            expect(typeof value).toBe("object");
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
  static validateAPIResponse(
    response: any,
    options: {
      statusCode?: number;
      requiredHeaders?: string[];
      bodySchema?: Record<string, any>;
      errorSchema?: Record<string, any>;
    } = {}
  ): void {
    const {
      statusCode,
      requiredHeaders = [],
      bodySchema,
      errorSchema,
    } = options;

    // Status code validation
    if (statusCode !== undefined) {
      expect(response.status || response.statusCode).toBe(statusCode);
    }

    // Headers validation
    if (response.headers) {
      requiredHeaders.forEach((header) => {
        expect(response.headers).toHaveProperty(header.toLowerCase());
      });
    }

    // Body validation
    if (response.body || response.data) {
      const body = response.body || response.data;

      if (statusCode && statusCode >= 200 && statusCode < 300 && bodySchema) {
        this.validateConfiguration(body, bodySchema);
      } else if (statusCode && statusCode >= 400 && errorSchema) {
        this.validateConfiguration(body, errorSchema);
      }
    }
  }

  /**
   * Validates file system operations results
   */
  static validateFileSystemResults(
    results: any,
    options: {
      expectedFiles?: string[];
      expectedDirectories?: string[];
      fileContentValidation?: Record<string, (content: string) => void>;
    } = {}
  ): void {
    const {
      expectedFiles = [],
      expectedDirectories = [],
      fileContentValidation = {},
    } = options;

    // File existence validation
    expectedFiles.forEach((filePath) => {
      expect(results.files).toContain(filePath);
    });

    // Directory existence validation
    expectedDirectories.forEach((dirPath) => {
      expect(results.directories).toContain(dirPath);
    });

    // File content validation
    Object.entries(fileContentValidation).forEach(([filePath, validator]) => {
      expect(results.fileContents).toHaveProperty(filePath);
      validator(results.fileContents[filePath]);
    });
  }
}

/**
 * Common assertion patterns for specific test scenarios
 */
export class CommonAssertionPatterns {
  /**
   * Validates a successful repository search
   */
  static validateRepositorySearch(results: any[], query: any): void {
    AssertionHelpers.validateSearchResults(results, {
      requiredProperties: ["id", "name", "path"],
      optionalProperties: ["languages", "frameworks", "tags", "description"],
      maxResults: 100, // Reasonable limit
    });

    // Validate each repository structure
    results.forEach((repo) => {
      AssertionHelpers.validateRepositoryStructure(repo);
    });

    // If query has specific filters, validate they're applied
    if (query.languages) {
      results.forEach((repo) => {
        const hasMatchingLanguage = query.languages.some((lang: string) =>
          repo.languages?.includes(lang)
        );
        expect(hasMatchingLanguage).toBe(true);
      });
    }

    if (query.frameworks) {
      results.forEach((repo) => {
        const hasMatchingFramework = query.frameworks.some(
          (framework: string) => repo.frameworks?.includes(framework)
        );
        expect(hasMatchingFramework).toBe(true);
      });
    }
  }

  /**
   * Validates a successful analysis operation
   */
  static validateAnalysisOperation(result: any): void {
    AssertionHelpers.validateAnalysisResults(result);

    // Additional analysis-specific validations
    expect(result.summary.totalFiles).toBeGreaterThan(0);
    expect(result.summary.totalLines).toBeGreaterThan(0);
    expect(result.summary.languages.length).toBeGreaterThan(0);

    // Validate file details
    result.details.files.forEach((file: any) => {
      expect(file).toHaveProperty("path");
      expect(file).toHaveProperty("language");
      expect(file).toHaveProperty("lines");
      expect(typeof file.path).toBe("string");
      expect(typeof file.language).toBe("string");
      expect(typeof file.lines).toBe("number");
    });
  }

  /**
   * Validates a successful export operation
   */
  static validateExportOperation(result: any, format: string): void {
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("format");
    expect(result.format).toBe(format);
    expect(result).toHaveProperty("outputPath");
    expect(typeof result.outputPath).toBe("string");

    if (result.data) {
      switch (format.toLowerCase()) {
        case "json":
          expect(() => JSON.parse(result.data)).not.toThrow();
          break;
        case "markdown":
          expect(typeof result.data).toBe("string");
          expect(result.data).toContain("#"); // Should have markdown headers
          break;
        case "html":
          expect(typeof result.data).toBe("string");
          expect(result.data).toContain("<html>"); // Should be valid HTML
          break;
      }
    }
  }

  /**
   * Validates logging operations
   */
  static validateLoggingOperation(
    mockLogger: any,
    expectedLogs: Array<{ level: string; message: string; metadata?: any }>
  ): void {
    expectedLogs.forEach((expectedLog, index) => {
      const { level, message, metadata } = expectedLog;

      expect(mockLogger[level]).toHaveBeenCalled();

      const calls = mockLogger[level].mock.calls;
      const matchingCall = calls.find(
        (call: any[]) => call[0].includes(message) || call[0] === message
      );

      expect(matchingCall).toBeDefined();

      if (metadata) {
        expect(matchingCall[1]).toMatchObject(metadata);
      }
    });
  }
}
