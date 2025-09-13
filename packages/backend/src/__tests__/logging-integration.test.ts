/**
 * Integration tests for comprehensive logging system
 * Tests logging integration across file system operations, analysis, and LLM providers
 * Requirements: 4.2, 4.3, 4.4
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { AnalysisOptions } from '@unified-repo-analyzer/shared';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { AnalysisEngine } from '../core/AnalysisEngine.js';
import { logger } from '../services/logger.service.js';
import { readFileWithErrorHandling, traverseDirectory } from '../utils/fileSystem.js';

describe('Logging Integration Tests', () => {
  let tempDir: string;
  let logSpy: MockInstance<
    [message: string, metadata?: Record<string, unknown>, component?: string, requestId?: string],
    void
  >;
  let errorSpy: MockInstance<
    [
      message: string,
      error?: Error,
      metadata?: Record<string, unknown>,
      component?: string,
      requestId?: string,
    ],
    void
  >;
  let debugSpy: MockInstance<
    [message: string, metadata?: Record<string, unknown>, component?: string, requestId?: string],
    void
  >;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'logging-test-'));

    // Set up logging spies
    logSpy = vi.spyOn(logger, 'info');
    errorSpy = vi.spyOn(logger, 'error');
    debugSpy = vi.spyOn(logger, 'debug');

    // Clear any existing logs
    logSpy.mockClear();
    errorSpy.mockClear();
    debugSpy.mockClear();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });

    // Restore spies
    vi.restoreAllMocks();
  });

  describe('File System Operations Logging', () => {
    it('should log directory traversal operations', async () => {
      // Create test directory structure
      const testDir = path.join(tempDir, 'test-repo');
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'test content 1');
      await fs.writeFile(path.join(testDir, 'file2.js'), 'console.log("test");');

      const subDir = path.join(testDir, 'subdir');
      await fs.mkdir(subDir);
      await fs.writeFile(path.join(subDir, 'file3.py'), 'print("test")');

      // Perform directory traversal
      const result = await traverseDirectory(testDir);

      // Verify logging occurred
      expect(logSpy).toHaveBeenCalledWith(
        'Starting directory traversal',
        expect.objectContaining({
          path: testDir,
          options: expect.any(Object),
        }),
        'filesystem',
        expect.any(String)
      );

      expect(logSpy).toHaveBeenCalledWith(
        'Directory traversal completed',
        expect.objectContaining({
          path: testDir,
          filesFound: expect.any(Number),
          directoriesFound: expect.any(Number),
          totalSize: expect.any(Number),
          duration: expect.stringMatching(/\d+ms/),
        }),
        'filesystem',
        expect.any(String)
      );

      expect(debugSpy).toHaveBeenCalledWith(
        'Path normalized',
        expect.objectContaining({
          originalPath: testDir,
          normalizedPath: expect.any(String),
        }),
        'filesystem',
        expect.any(String)
      );

      // Verify results
      expect(result.files).toHaveLength(3);
      expect(result.directories).toHaveLength(1); // subdir
    });

    it('should log file read operations', async () => {
      // Create test file
      const testFile = path.join(tempDir, 'test-file.txt');
      const testContent = 'This is test content for logging';
      await fs.writeFile(testFile, testContent);

      // Read file
      const content = await readFileWithErrorHandling(testFile);

      // Verify logging occurred
      expect(debugSpy).toHaveBeenCalledWith(
        'Reading file',
        expect.objectContaining({
          path: testFile,
          encoding: 'utf8',
        }),
        'filesystem',
        expect.any(String)
      );

      expect(debugSpy).toHaveBeenCalledWith(
        'File read successfully',
        expect.objectContaining({
          path: testFile,
          contentLength: testContent.length,
          duration: expect.stringMatching(/\d+ms/),
        }),
        'filesystem',
        expect.any(String)
      );

      expect(content).toBe(testContent);
    });

    it('should log file system errors with classification', async () => {
      const nonExistentFile = path.join(tempDir, 'non-existent.txt');

      // Attempt to read non-existent file
      await expect(readFileWithErrorHandling(nonExistentFile)).rejects.toThrow();

      // Verify error logging occurred
      expect(errorSpy).toHaveBeenCalledWith(
        'File read failed - file not found',
        expect.any(Error),
        expect.objectContaining({
          path: nonExistentFile,
          errorId: expect.any(String),
          duration: expect.stringMatching(/\d+ms/),
        }),
        'filesystem',
        expect.any(String)
      );
    });

    it('should log permission errors', async () => {
      // This test is platform-specific and may not work on all systems
      // Skip on Windows as permission handling is different
      if (process.platform === 'win32') {
        return;
      }

      // Create a file and remove read permissions
      const testFile = path.join(tempDir, 'no-read-permission.txt');
      await fs.writeFile(testFile, 'test content');
      await fs.chmod(testFile, 0o000); // No permissions

      try {
        await readFileWithErrorHandling(testFile);
      } catch (_error) {
        // Expected to fail
      }

      // Restore permissions for cleanup
      await fs.chmod(testFile, 0o644);

      // Verify permission error logging
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('permission'),
        expect.any(Error),
        expect.objectContaining({
          path: testFile,
          errorId: expect.any(String),
        }),
        'filesystem',
        expect.any(String)
      );
    });
  });

  describe('Repository Analysis Logging', () => {
    it('should log repository analysis lifecycle', async () => {
      // Create test repository structure
      const testRepo = path.join(tempDir, 'test-repo');
      await fs.mkdir(testRepo, { recursive: true });
      await fs.writeFile(
        path.join(testRepo, 'package.json'),
        JSON.stringify({
          name: 'test-repo',
          version: '1.0.0',
          main: 'index.js',
        })
      );
      await fs.writeFile(path.join(testRepo, 'index.js'), 'console.log("Hello World");');
      await fs.writeFile(path.join(testRepo, 'README.md'), '# Test Repository');

      const analysisEngine = new AnalysisEngine();
      const options: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      // Perform analysis
      const result = await analysisEngine.analyzeRepository(testRepo, options);

      // Verify analysis start logging
      expect(logSpy).toHaveBeenCalledWith(
        'Starting repository analysis',
        expect.objectContaining({
          repositoryPath: testRepo,
          analysisMode: 'quick',
          options: expect.any(Object),
        }),
        'analysis-engine',
        expect.any(String)
      );

      // Verify repository discovery logging
      expect(logSpy).toHaveBeenCalledWith(
        'Starting repository discovery',
        expect.objectContaining({
          repositoryPath: testRepo,
        }),
        'analysis-engine',
        expect.any(String)
      );

      expect(logSpy).toHaveBeenCalledWith(
        'Repository discovery completed',
        expect.objectContaining({
          repositoryPath: testRepo,
          fileCount: expect.any(Number),
          totalSize: expect.any(Number),
          languageCount: expect.any(Number),
          duration: expect.stringMatching(/\d+ms/),
        }),
        'analysis-engine',
        expect.any(String)
      );

      // Verify analysis completion logging
      expect(logSpy).toHaveBeenCalledWith(
        'Repository analysis completed successfully',
        expect.objectContaining({
          repositoryPath: testRepo,
          fileCount: expect.any(Number),
          totalSize: expect.any(Number),
          processingTime: expect.stringMatching(/\d+ms/),
          analysisMode: 'quick',
          cacheHit: false,
        }),
        'analysis-engine',
        expect.any(String)
      );

      // Verify results
      expect(result).toBeDefined();
      expect(result.fileCount).toBeGreaterThan(0);
      expect(result.metadata.analysisMode).toBe('quick');
    });

    it('should log analysis errors with classification', async () => {
      const nonExistentRepo = path.join(tempDir, 'non-existent-repo');
      const analysisEngine = new AnalysisEngine();
      const options: AnalysisOptions = {
        mode: 'quick',
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: false,
        llmProvider: 'none',
        outputFormats: ['json'],
        includeTree: false,
      };

      // Attempt to analyze non-existent repository
      await expect(analysisEngine.analyzeRepository(nonExistentRepo, options)).rejects.toThrow();

      // Verify error logging occurred
      expect(errorSpy).toHaveBeenCalledWith(
        'Repository analysis failed',
        expect.any(Error),
        expect.objectContaining({
          repositoryPath: nonExistentRepo,
          analysisMode: 'quick',
          duration: expect.stringMatching(/\d+ms/),
          errorId: expect.any(String),
          errorCode: expect.any(String),
        }),
        'analysis-engine',
        expect.any(String)
      );
    });
  });

  describe('LLM Provider Logging', () => {
    it('should log LLM provider interactions', async () => {
      const _axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          completion: 'This is a test response from Claude.',
          stop_reason: 'stop_sequence',
          usage: {
            prompt_tokens: 50,
            completion_tokens: 20,
            total_tokens: 70,
          },
        },
      });
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);

      const { ClaudeProvider } = await import('../providers/ClaudeProvider.js');
      const claudeProvider = new ClaudeProvider({
        apiKey: 'test-api-key',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const testPrompt = 'Analyze this code: console.log("Hello World");';

      // Perform LLM analysis
      const result = await claudeProvider.analyze(testPrompt);

      // Verify LLM start logging
      expect(logSpy).toHaveBeenCalledWith(
        'Starting Claude LLM analysis',
        expect.objectContaining({
          provider: 'claude',
          model: 'claude-3-sonnet-20240229',
          promptLength: testPrompt.length,
          maxTokens: 1000,
          temperature: 0.7,
        }),
        'claude-provider',
        expect.any(String)
      );

      // Verify LLM completion logging
      expect(logSpy).toHaveBeenCalledWith(
        'Claude LLM analysis completed successfully',
        expect.objectContaining({
          provider: 'claude',
          model: 'claude-3-sonnet-20240229',
          duration: expect.stringMatching(/\d+ms/),
          tokenUsage: expect.objectContaining({
            prompt: 50,
            completion: 20,
            total: 70,
          }),
          responseLength: expect.any(Number),
        }),
        'claude-provider',
        expect.any(String)
      );

      // Verify debug logging
      expect(debugSpy).toHaveBeenCalledWith(
        'Claude API request details',
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
          maxTokens: 1000,
          temperature: 0.7,
          promptPreview: expect.any(String),
        }),
        'claude-provider',
        expect.any(String)
      );

      // Verify results
      expect(result).toBeDefined();
      expect(result.content).toBe('This is a test response from Claude.');
      expect(result.tokenUsage.total).toBe(70);
    });

    it('should log LLM provider errors with classification', async () => {
      const _axiosPostSpy = vi.spyOn(axios, 'post').mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Invalid API key' },
        },
      });
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      const { ClaudeProvider } = await import('../providers/ClaudeProvider.js');
      const claudeProvider = new ClaudeProvider({
        apiKey: 'invalid-api-key',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const testPrompt = 'Test prompt';

      // Attempt LLM analysis with invalid API key
      await expect(claudeProvider.analyze(testPrompt)).rejects.toThrow();

      // Verify error logging occurred
      expect(errorSpy).toHaveBeenCalledWith(
        'Claude API authentication failed',
        expect.objectContaining({
          response: expect.objectContaining({
            status: 401,
            data: expect.objectContaining({
              error: 'Invalid API key',
            }),
          }),
        }),
        expect.objectContaining({
          provider: 'claude',
          statusCode: 401,
          duration: expect.stringMatching(/\d+ms/),
        }),
        'claude-provider',
        expect.any(String)
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Claude LLM analysis failed',
        expect.any(Error),
        expect.objectContaining({
          provider: 'claude',
          model: 'claude-3-sonnet-20240229',
          duration: expect.stringMatching(/\d+ms/),
          errorId: expect.any(String),
          errorCode: expect.any(String),
          statusCode: 401,
        }),
        'claude-provider',
        expect.any(String)
      );
    });
  });

  describe('Error Correlation and Tracking', () => {
    it('should maintain request correlation across operations', async () => {
      // Set a specific request ID
      const testRequestId = 'test-correlation-123';
      logger.setRequestId(testRequestId);

      // Create test file
      const testFile = path.join(tempDir, 'correlation-test.txt');
      await fs.writeFile(testFile, 'test content');

      // Perform file operation
      await readFileWithErrorHandling(testFile);

      // Verify all log calls used the same request ID
      expect(debugSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        'filesystem',
        testRequestId
      );
    });

    it('should log performance metrics for operations', async () => {
      // Create test directory with multiple files
      const testDir = path.join(tempDir, 'performance-test');
      await fs.mkdir(testDir, { recursive: true });

      // Create multiple files to ensure measurable performance
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(path.join(testDir, `file${i}.txt`), `Content for file ${i}`.repeat(100));
      }

      // Perform directory traversal
      await traverseDirectory(testDir);

      // Verify performance logging occurred
      // Note: We can't easily spy on logPerformance directly, but we can verify
      // that the operation completed and logged appropriately
      expect(logSpy).toHaveBeenCalledWith(
        'Directory traversal completed',
        expect.objectContaining({
          duration: expect.stringMatching(/\d+ms/),
          filesFound: 10,
        }),
        'filesystem',
        expect.any(String)
      );
    });
  });

  describe('Log Content Validation', () => {
    it('should redact sensitive information from logs', async () => {
      const _axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          completion: 'Test response',
          stop_reason: 'stop_sequence',
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        },
      });
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);

      const { ClaudeProvider } = await import('../providers/ClaudeProvider.js');
      const claudeProvider = new ClaudeProvider({
        apiKey: 'sk-test-secret-api-key-12345',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000,
        temperature: 0.7,
      });

      await claudeProvider.analyze('Test prompt');

      // Verify that API key is not logged in plain text
      const allLogCalls = [...logSpy.mock.calls, ...debugSpy.mock.calls];
      const loggedContent = allLogCalls.map((call) => JSON.stringify(call)).join(' ');

      expect(loggedContent).not.toContain('sk-test-secret-api-key-12345');
    });

    it('should include appropriate context in error logs', async () => {
      const nonExistentFile = path.join(tempDir, 'context-test.txt');

      try {
        await readFileWithErrorHandling(nonExistentFile);
      } catch (_error) {
        // Expected to fail
      }

      // Verify error log includes appropriate context
      expect(errorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error),
        expect.objectContaining({
          path: nonExistentFile,
          errorId: expect.any(String),
          duration: expect.stringMatching(/\d+ms/),
        }),
        'filesystem',
        expect.any(String)
      );
    });
  });
});
