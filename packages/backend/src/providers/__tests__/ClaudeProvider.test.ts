/**
 * Tests for ClaudeProvider
 */

import type { ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import axios from 'axios';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ClaudeProvider } from '../ClaudeProvider.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios) as typeof axios & {
  isAxiosError: MockedFunction<(error: unknown) => error is import('axios').AxiosError>;
};

describe('ClaudeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('should throw error if API key is not provided', () => {
      expect(() => new ClaudeProvider({})).toThrow('Claude API key is required');
    });

    test('should initialize with default model if not provided', () => {
      const provider = new ClaudeProvider({ apiKey: 'test-key' });
      // Test that the provider can be created successfully with default model
      expect(provider.name).toBe('claude');
    });

    test('should use provided model if specified', () => {
      const provider = new ClaudeProvider({
        apiKey: 'test-key',
        model: 'claude-3-opus',
      });
      // Test that the provider can be created successfully with custom model
      expect(provider.name).toBe('claude');
    });
  });

  describe('name', () => {
    test('should return correct provider name', () => {
      const provider = new ClaudeProvider({ apiKey: 'test-key' });
      expect(provider.name).toBe('claude');
    });
  });

  describe('formatPrompt', () => {
    test('should format prompt with project information', () => {
      const provider = new ClaudeProvider({ apiKey: 'test-key' });
      const projectInfo: ProjectInfo = {
        name: 'test-project',
        language: 'TypeScript',
        fileCount: 10,
        directoryCount: 5,
        directories: ['src', 'test'],
        keyFiles: ['index.ts'],
        fileAnalysis: [
          {
            path: 'src/index.ts',
            lineCount: 100,
            functionCount: 5,
            classCount: 2,
            importCount: 10,
            comments: [],
            functions: [],
            classes: [],
          },
        ],
      };

      const prompt = provider.formatPrompt(projectInfo);

      expect(prompt).toContain('Human: I need you to analyze this codebase');
      expect(prompt).toContain('Name: test-project');
      expect(prompt).toContain('Primary Language: TypeScript');
      expect(prompt).toContain('File Count: 10');
      expect(prompt).toContain('Directory Count: 5');
      expect(prompt).toContain('# Key Directories');
      expect(prompt).toContain('- src');
      expect(prompt).toContain('- test');
      expect(prompt).toContain('# Key Files');
      expect(prompt).toContain('## src/index.ts');
      expect(prompt).toContain('- Lines: 100');
      expect(prompt).toContain('- Functions: 5');
      expect(prompt).toContain('- Classes: 2');
      expect(prompt).toContain('- Imports: 10');
      expect(prompt).toContain('executive summary');
      expect(prompt).toContain('technical breakdown');
    });

    test('should handle optional fields', () => {
      const provider = new ClaudeProvider({ apiKey: 'test-key' });
      const projectInfo: ProjectInfo = {
        name: 'test-project',
        language: null,
        fileCount: 10,
        directoryCount: 5,
        directories: [],
        keyFiles: [],
        fileAnalysis: [],
        description: 'Test description',
        readme: '# Test README',
        dependencies: { react: '18.0.0' },
        devDependencies: { typescript: '5.0.0' },
      };

      const prompt = provider.formatPrompt(projectInfo);

      expect(prompt).toContain('Primary Language: Unknown');
      expect(prompt).toContain('# Description');
      expect(prompt).toContain('Test description');
      expect(prompt).toContain('# README');
      expect(prompt).toContain('# Test README');
      expect(prompt).toContain('# Dependencies');
      expect(prompt).toContain('- react: 18.0.0');
      expect(prompt).toContain('# Dev Dependencies');
      expect(prompt).toContain('- typescript: 5.0.0');
    });
  });

  describe('analyze', () => {
    test('should call Claude API and return formatted response', async () => {
      const mockResponse = {
        data: {
          id: 'test-id',
          type: 'completion',
          completion: ' This is a test response',
          stop_reason: 'stop_sequence',
          model: 'claude-2.1',
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const provider = new ClaudeProvider({
        apiKey: 'test-key',
        model: 'claude-2.1',
        maxTokens: 2000,
        temperature: 0.5,
      });

      const response = await provider.analyze('Test prompt');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/complete',
        {
          prompt: 'Test prompt',
          model: 'claude-2.1',
          max_tokens_to_sample: 2000,
          temperature: 0.5,
          stop_sequences: ['Human:', 'Assistant:'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
            'Anthropic-Version': '2023-06-01',
          },
          timeout: 60000,
        }
      );

      expect(response).toEqual({
        content: 'This is a test response',
        tokenUsage: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });
    });

    test('should handle API errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Invalid request' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const provider = new ClaudeProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Claude API error: 400 - {"error":"Invalid request"}'
      );
    });

    test('should handle non-Axios errors', async () => {
      const error = new Error('Network error');

      mockedAxios.post.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const provider = new ClaudeProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Claude API error: Network error'
      );
    });
  });
});
