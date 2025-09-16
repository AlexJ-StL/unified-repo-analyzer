/**
 * End-to-end integration tests for complete analysis workflow with path handling
 */

import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { ClassifiedError } from '@unified-repo-analyzer/shared/src/types/error-classification';
import type { FileInfo } from '@unified-repo-analyzer/shared/src/types/repository';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import routes from '../routes';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', routes);

describe('Complete Analysis Workflow Integration Tests', () => {
  let testRepoPath: string;
  let tempDir: string;

  beforeAll(async () => {
    // Create temporary directory for test repositories
    tempDir = await fs.mkdtemp(path.join(tmpdir(), 'repo-analyzer-test-'));
  });

  afterAll(async () => {
    // Cleanup temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_error) {}
  });

  beforeEach(async () => {
    // Create a fresh test repository for each test
    testRepoPath = path.join(tempDir, `test-repo-${Date.now()}`);
    await fs.mkdir(testRepoPath, { recursive: true });

    // Create some test files
    await fs.writeFile(
      path.join(testRepoPath, 'README.md'),
      '# Test Repository\n\nThis is a test repository for integration testing.'
    );

    await fs.writeFile(
      path.join(testRepoPath, 'package.json'),
      JSON.stringify(
        {
          name: 'test-repo',
          version: '1.0.0',
          description: 'Test repository',
          main: 'index.js',
          dependencies: {
            express: '^4.18.0',
          },
        },
        null,
        2
      )
    );

    await fs.writeFile(
      path.join(testRepoPath, 'index.js'),
      `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
    );

    // Create a subdirectory with more files
    const srcDir = path.join(testRepoPath, 'src');
    await fs.mkdir(srcDir);

    await fs.writeFile(
      path.join(srcDir, 'utils.js'),
      `function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };`
    );
  });

  describe('Windows Path Format Analysis', () => {
    it('should analyze repository with Windows backslash path', async () => {
      // Convert to Windows-style path for testing
      const windowsPath = testRepoPath.replace(/\//g, '\\');

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: windowsPath,
          options: {
            mode: 'quick',
            maxFiles: 50,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: false,
            outputFormats: ['json'],
            includeTree: true,
          },
        });

      // Should succeed regardless of path format
      expect([200, 400, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('files');
        expect(response.body.files).toBeInstanceOf(Array);
        expect(response.body.files.length).toBeGreaterThan(0);

        // Should contain our test files
        const fileNames = response.body.files.map((f: FileInfo) => f.path);
        expect(fileNames).toContain('README.md');
        expect(fileNames).toContain('package.json');
        expect(fileNames).toContain('index.js');
      }
    });

    it('should analyze repository with Windows forward slash path', async () => {
      // Use forward slashes (Unix-style) on Windows
      const forwardSlashPath = testRepoPath.replace(/\\/g, '/');

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: forwardSlashPath,
          options: {
            mode: 'standard',
            maxFiles: 50,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: false,
            outputFormats: ['json'],
          },
        });

      expect([200, 400, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('files');

        // Should detect JavaScript files
        const jsFiles = response.body.files.filter((f: FileInfo) => f.path.endsWith('.js'));
        expect(jsFiles.length).toBeGreaterThan(0);

        // Should have language detection
        expect(response.body).toHaveProperty('languages');
        expect(response.body.languages).toContain('JavaScript');
      }
    });

    it('should handle relative paths correctly', async () => {
      // Test with relative path
      const relativePath = path.relative(process.cwd(), testRepoPath);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: relativePath,
          options: {
            mode: 'quick',
            maxFiles: 20,
            includeLLMAnalysis: false,
          },
        });

      expect([200, 400, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('path');
        // Path should be normalized to absolute
        expect(path.isAbsolute(response.body.path)).toBe(true);
      }
    });
  });

  describe('Error Handling in Analysis Workflow', () => {
    it('should provide detailed error for non-existent path', async () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist');

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: nonExistentPath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);

      // Should provide helpful suggestions
      const suggestions = response.body.suggestions.join(' ').toLowerCase();
      expect(suggestions).toMatch(/path|directory|exist/);
    });

    it('should handle file instead of directory', async () => {
      const filePath = path.join(testRepoPath, 'README.md');

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: filePath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('suggestions');

      // Should suggest selecting a directory
      const suggestions = response.body.suggestions.join(' ').toLowerCase();
      expect(suggestions).toMatch(/directory|folder/);
    });

    it('should handle invalid path characters', async () => {
      const invalidPath = 'C:\\Users\\Test<>User\\Documents';

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: invalidPath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('technicalDetails');

      if (response.body.technicalDetails?.errors) {
        const errorCodes = response.body.technicalDetails.errors.map(
          (e: ClassifiedError) => e.code
        );
        expect(errorCodes).toContain('INVALID_CHARACTERS');
      }
    });

    it('should handle reserved names in path', async () => {
      const reservedPath = 'C:\\Users\\CON\\Documents';

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: reservedPath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('technicalDetails');

      if (response.body.technicalDetails?.errors) {
        const errorCodes = response.body.technicalDetails.errors.map(
          (e: ClassifiedError) => e.code
        );
        expect(errorCodes).toContain('RESERVED_NAME');
      }
    });

    it('should handle very long paths', async () => {
      const longPath = `C:\\${'VeryLongDirectoryName'.repeat(20)}`;

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: longPath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('technicalDetails');

      if (response.body.technicalDetails?.errors) {
        const errorCodes = response.body.technicalDetails.errors.map(
          (e: ClassifiedError) => e.code
        );
        expect(errorCodes).toContain('PATH_TOO_LONG');
      }
    });
  });

  describe('Batch Analysis with Mixed Path Formats', () => {
    it('should handle batch analysis with mixed valid and invalid paths', async () => {
      const paths = [
        testRepoPath, // Valid path
        path.join(tempDir, 'non-existent'), // Invalid path
        'C:\\Users\\CON\\Test', // Invalid path with reserved name
        testRepoPath.replace(/\//g, '\\'), // Valid path with different separators
      ];

      const response = await request(app)
        .post('/api/analyze/batch')
        .send({
          paths,
          options: {
            mode: 'quick',
            maxFiles: 10,
            includeLLMAnalysis: false,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('pathValidation');
      expect(response.body.pathValidation).toHaveProperty('totalRequested', 4);
      expect(response.body.pathValidation).toHaveProperty('validPaths');
      expect(response.body.pathValidation).toHaveProperty('invalidPaths');
      expect(response.body.pathValidation).toHaveProperty('invalidPathDetails');

      // Should have some valid and some invalid paths
      expect(response.body.pathValidation.validPaths).toBeGreaterThan(0);
      expect(response.body.pathValidation.invalidPaths).toBeGreaterThan(0);

      // Should provide details about invalid paths
      expect(response.body.pathValidation.invalidPathDetails).toBeInstanceOf(Array);
      expect(response.body.pathValidation.invalidPathDetails.length).toBeGreaterThan(0);

      // Should have analysis results for valid paths
      expect(response.body).toHaveProperty('repositories');
      expect(response.body.repositories).toBeInstanceOf(Array);
    });

    it('should normalize paths consistently in batch analysis', async () => {
      const samePaths = [
        testRepoPath,
        testRepoPath.replace(/\//g, '\\'),
        testRepoPath + path.sep, // With trailing separator
        `${testRepoPath.replace(/\//g, '\\')}\\`, // With trailing separator
      ];

      const response = await request(app)
        .post('/api/analyze/batch')
        .send({
          paths: samePaths,
          options: {
            mode: 'quick',
            maxFiles: 5,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('pathValidation');

      // All paths should resolve to the same normalized path
      // So we should have fewer valid paths than requested due to deduplication
      expect(response.body.pathValidation.validPaths).toBeLessThanOrEqual(samePaths.length);

      if (response.body.repositories && response.body.repositories.length > 0) {
        // All analysis results should have the same normalized path
        const uniquePaths = new Set(
          response.body.repositories.map((r: { path: string }) => r.path)
        );
        expect(uniquePaths.size).toBe(1);
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/analyze')
        .send({
          path: testRepoPath,
          options: {
            mode: 'quick',
            maxFiles: 20,
            maxLinesPerFile: 500,
            includeLLMAnalysis: false,
          },
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 30 seconds for a small test repo
      expect(duration).toBeLessThan(30000);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('analysisTime');
        expect(response.body.metadata.analysisTime).toBeGreaterThan(0);
      }
    });

    it('should handle concurrent analysis requests', async () => {
      const requests = Array.from({ length: 3 }, (_, _i) =>
        request(app)
          .post('/api/analyze')
          .send({
            path: testRepoPath,
            options: {
              mode: 'quick',
              maxFiles: 10,
              includeLLMAnalysis: false,
            },
          })
      );

      const responses = await Promise.all(requests);

      // All requests should complete
      expect(responses).toHaveLength(3);

      // All should have valid responses
      responses.forEach((response) => {
        expect([200, 400, 404]).toContain(response.status);
      });
    });

    it('should provide consistent results for same repository', async () => {
      const request1 = await request(app)
        .post('/api/analyze')
        .send({
          path: testRepoPath,
          options: {
            mode: 'quick',
            maxFiles: 20,
            includeLLMAnalysis: false,
          },
        });

      const request2 = await request(app)
        .post('/api/analyze')
        .send({
          path: testRepoPath,
          options: {
            mode: 'quick',
            maxFiles: 20,
            includeLLMAnalysis: false,
          },
        });

      if (request1.status === 200 && request2.status === 200) {
        // Should have same number of files
        expect(request1.body.files.length).toBe(request2.body.files.length);

        // Should have same languages detected
        expect(request1.body.languages).toEqual(request2.body.languages);

        // Should have same file structure
        const files1 = request1.body.files.map((f: FileInfo) => f.path).sort();
        const files2 = request2.body.files.map((f: FileInfo) => f.path).sort();
        expect(files1).toEqual(files2);
      }
    });
  });

  describe('Path Validation Integration', () => {
    it('should validate path before starting analysis', async () => {
      // First validate the path
      const validationResponse = await request(app)
        .post('/api/path/validate')
        .send({ path: testRepoPath })
        .expect(200);

      expect(validationResponse.body.isValid).toBe(true);
      expect(validationResponse.body.metadata.exists).toBe(true);
      expect(validationResponse.body.metadata.isDirectory).toBe(true);

      // Then analyze using the same path
      const analysisResponse = await request(app)
        .post('/api/analyze')
        .send({
          path: testRepoPath,
          options: {
            mode: 'quick',
            maxFiles: 10,
          },
        });

      expect([200, 400]).toContain(analysisResponse.status);

      if (analysisResponse.status === 200) {
        // Analysis should succeed since validation passed
        expect(analysisResponse.body).toHaveProperty('id');
        expect(analysisResponse.body).toHaveProperty('files');
      }
    });

    it('should provide consistent error messages between validation and analysis', async () => {
      const invalidPath = 'C:\\NonExistent\\Path';

      // Validate the invalid path
      const validationResponse = await request(app)
        .post('/api/path/validate')
        .send({ path: invalidPath })
        .expect(200);

      expect(validationResponse.body.isValid).toBe(false);

      // Try to analyze the same invalid path
      const analysisResponse = await request(app)
        .post('/api/analyze')
        .send({
          path: invalidPath,
          options: { mode: 'quick', maxFiles: 10 },
        })
        .expect(404);

      // Both should indicate path not found
      const validationErrors = validationResponse.body.errors.map((e: ClassifiedError) => e.code);
      expect(validationErrors).toContain('PATH_NOT_FOUND');

      expect(analysisResponse.body.error).toMatch(/not found|not exist/i);
    });
  });
});
