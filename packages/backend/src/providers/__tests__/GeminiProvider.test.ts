/**
 * Tests for GeminiProvider
 */

import type { ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import axios from 'axios';
import { vi } from 'vitest';
import { GeminiProvider } from '../GeminiProvider';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('GeminiProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('should throw error if API key is not provided', () => {
      expect(() => new GeminiProvider({})).toThrow('Gemini API key is required');
    });

    test('should initialize with default model if not provided', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      expect((provider as any).config.model).toBe('gemini-pro');
    });

    test('should use provided model if specified', () => {
      const provider = new GeminiProvider({
        apiKey: 'test-key',
        model: 'gemini-ultra',
      });
      expect((provider as any).config.model).toBe('gemini-ultra');
    });
  });

  describe('name', () => {
    test('should return correct provider name', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      expect(provider.name).toBe('gemini');
    });
  });

  describe('formatPrompt', () => {
    test('should format prompt with project information', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
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

      expect(prompt).toContain('Analyze this codebase');
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
      const provider = new GeminiProvider({ apiKey: 'test-key' });
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
    test('should call Gemini API and return formatted response', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'This is a test response' }],
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const provider = new GeminiProvider({
        apiKey: 'test-key',
        model: 'gemini-pro',
        maxTokens: 2000,
        temperature: 0.5,
      });

      const response = await provider.analyze('Test prompt');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=test-key',
        {
          contents: [
            {
              parts: [
                {
                  text: 'Test prompt',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2000,
            topP: 0.95,
            topK: 40,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
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

    test('should handle content filtering', async () => {
      const mockResponse = {
        data: {
          promptFeedback: {
            blockReason: 'SAFETY',
          },
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 0,
            totalTokenCount: 100,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const provider = new GeminiProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Gemini content filtered: SAFETY'
      );
    });

    test('should handle empty candidates', async () => {
      const mockResponse = {
        data: {
          candidates: [],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 0,
            totalTokenCount: 100,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const provider = new GeminiProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Gemini returned no candidates'
      );
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

      const provider = new GeminiProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Gemini API error: 400 - {"error":"Invalid request"}'
      );
    });

    test('should handle non-Axios errors', async () => {
      const error = new Error('Network error');

      mockedAxios.post.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const provider = new GeminiProvider({ apiKey: 'test-key' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow(
        'Gemini API error: Network error'
      );
    });
  });
});
