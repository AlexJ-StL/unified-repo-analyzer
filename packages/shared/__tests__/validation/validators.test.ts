/**
 * Tests for validation utility functions
 */

import { describe, expect, test } from "vitest";
import { z } from "zod";
import * as validators from "../../src/validation/validators";

describe("Validation Utilities", () => {
  describe("validate function", () => {
    test("should validate data against a schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().positive(),
      });

      const validData = { name: "John", age: 30 };

      expect(() => validators.validate(schema, validData)).not.toThrow();
      expect(validators.validate(schema, validData)).toEqual(validData);
    });

    test("should throw an error for invalid data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().positive(),
      });

      const invalidData = { name: "John", age: -5 };

      expect(() => validators.validate(schema, invalidData)).toThrow();
    });
  });

  describe("validateSafe function", () => {
    test("should return success and data for valid input", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().positive(),
      });

      const validData = { name: "John", age: 30 };

      const result = validators.validateSafe(schema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    test("should return failure and errors for invalid input", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().positive(),
      });

      const invalidData = { name: "John", age: -5 };

      const result = validators.validateSafe(schema, invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeInstanceOf(z.ZodError);
    });
  });

  describe("Specific validators", () => {
    test("should validate repository analysis data", () => {
      const validAnalysis = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        path: "/path/to/repo",
        name: "my-repo",
        description: "My repository",
        language: "TypeScript",
        languages: ["TypeScript", "JavaScript"],
        frameworks: [
          {
            name: "React",
            version: "18.0.0",
            confidence: 0.9,
            category: "frontend",
          },
          {
            name: "Express",
            version: "4.18.0",
            confidence: 0.8,
            category: "backend",
          },
        ],
        fileCount: 100,
        directoryCount: 10,
        totalSize: 1024000,
        createdAt: new Date(),
        updatedAt: new Date(),

        codeAnalysis: {
          complexity: {
            cyclomaticComplexity: 15,
            maintainabilityIndex: 75,
            technicalDebt: "Low",
            codeQuality: "good",
          },
          linesOfCode: 5000,
          functions: [],
          classes: [],
        },

        dependencies: [
          {
            name: "react",
            version: "18.0.0",
            type: "production",
          },
          {
            name: "express",
            version: "4.18.0",
            type: "production",
          },
        ],

        fileTypes: {
          ".ts": 50,
          ".js": 30,
          ".json": 5,
        },

        summary: "This is a repository summary",
      };

      expect(() =>
        validators.validateRepositoryAnalysis(validAnalysis)
      ).not.toThrow();
    });

    test("should validate file info data", () => {
      const validFileInfo = {
        path: "src/index.ts",
        language: "TypeScript",
        size: 1024,
        lineCount: 100,
        tokenCount: 500,
        importance: 0.8,
        functions: [
          {
            name: "main",
            lineNumber: 10,
            parameters: ["arg1", "arg2"],
            description: "Main function",
          },
        ],
        classes: [
          {
            name: "MyClass",
            lineNumber: 20,
            methods: ["method1", "method2"],
            description: "My class description",
          },
        ],
        description: "Main file",
        useCase: "Entry point",
      };

      expect(() => validators.validateFileInfo(validFileInfo)).not.toThrow();
    });

    test("should validate analysis options data", () => {
      const validOptions = {
        mode: "standard",
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
        llmProvider: "claude",
        outputFormats: ["json", "markdown"],
        includeTree: true,
      };

      expect(() =>
        validators.validateAnalysisOptions(validOptions)
      ).not.toThrow();
    });
  });
});
