/**
 * Tests for OpenRouterProvider
 */

import type { LLMResponse, ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { OpenRouterProvider } from '../OpenRouterProvider';

// Mock axios
const mockPost = vi.fn();
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      post: mockPost,
    },
  };
});

describe('OpenRouterProvider', () => {
  let provider: OpenRouterProvider;
  const testConfig = { apiKey: 'test-key' };
  const testPrompt = 'Analyze this codebase';

  beforeEach(() => {
    provider = new OpenRouterProvider(testConfig);
    mockPost.mockReset();
  });

  describe('constructor', () => {
    test('should create provider instance with config', () => {
      expect(provider).toBeInstanceOf(OpenRouterProvider);
    });
  });

  describe('name', () => {
    test('should return correct provider name', () => {
      expect(provider.name).toBe('openrouter');
    });
  });

  describe('formatPrompt', () => {
    test('should format prompt with project information', () => {
      const projectInfo: ProjectInfo = {
        name: 'Test Project',
        language: 'JavaScript',
        fileCount: 10,
        directoryCount: 5,
        directories: ['src', 'test'],
        keyFiles: ['src/index.js', 'src/app.js'],
        fileAnalysis: [
          {
            path: 'src/index.js',
            lineCount: 50,
            functionCount: 3,
            classCount: 1,
            importCount: 5,
            comments: [],
            functions: ['main', 'init', 'cleanup'],
            classes: ['App'],
          },
        ],
        dependencies: { express: '4.18.0' },
        devDependencies: { jest: '29.0.0' },
      };

      const prompt = provider.formatPrompt(projectInfo);
      expect(prompt).toContain('Test Project');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('10');
      expect(prompt).toContain('5');
    });
  });

  describe('analyze', () => {
    test('should analyze prompt successfully', async () => {
      const mockResponse: LLMResponse = {
        content: 'This is a test analysis result',
        tokenUsage: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      };

      mockPost.mockResolvedValue({
        data: {
          id: 'test-id',
          choices: [
            {
              message: {
                content: 'This is a test analysis result',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
          model: 'openrouter/test-model',
        },
      });

      const result = await provider.analyze(testPrompt);
      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/auto',
          messages: [
            {
              role: 'user',
              content: testPrompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
            'HTTP-Referer': 'https://unified-repo-analyzer.com',
            'X-Title': 'Unified Repo Analyzer',
          },
          timeout: 60000,
        }
      );
    });

    test('should handle API error', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(provider.analyze(testPrompt)).rejects.toThrow(
        'OpenRouter API error: Network error'
      );
    });

    test('should handle API error with response', async () => {
      mockPost.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Invalid API key' },
        },
      });

      await expect(provider.analyze(testPrompt)).rejects.toThrow(
        'OpenRouter API error: 401 - {"error":"Invalid API key"}'
      );
    });

    test('should handle empty choices response', async () => {
      mockPost.mockResolvedValue({
        data: {
          id: 'test-id',
          choices: [],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          model: 'openrouter/test-model',
        },
      });

      await expect(provider.analyze(testPrompt)).rejects.toThrow('OpenRouter returned no choices');
    });

    test('should handle empty content in response', async () => {
      mockPost.mockResolvedValue({
        data: {
          id: 'test-id',
          choices: [
            {
              message: {
                content: '',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 0,
            total_tokens: 100,
          },
          model: 'openrouter/test-model',
        },
      });

      const result = await provider.analyze(testPrompt);
      expect(result.content).toBe('');
      expect(result.tokenUsage.prompt).toBe(100);
    });
  });
});
