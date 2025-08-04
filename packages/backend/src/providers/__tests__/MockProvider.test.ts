/**
 * Tests for MockProvider
 */

import type { ProjectInfo } from '@unified-repo-analyzer/shared/src/types/provider';
import { MockProvider } from '../MockProvider';

describe('MockProvider', () => {
  describe('constructor', () => {
    test('should initialize with default values', () => {
      const provider = new MockProvider({ apiKey: 'test-key' });
      expect(provider.name).toBe('mock');
    });

    test('should initialize with custom options', () => {
      const provider = new MockProvider(
        { apiKey: 'test-key' },
        {
          mockResponse: 'Custom response',
          mockTokenUsage: { prompt: 200, completion: 100, total: 300 },
          delay: 100,
          shouldFail: true,
          errorMessage: 'Custom error',
        }
      );

      expect((provider as any).mockResponse).toBe('Custom response');
      expect((provider as any).mockTokenUsage).toEqual({
        prompt: 200,
        completion: 100,
        total: 300,
      });
      expect((provider as any).delay).toBe(100);
      expect((provider as any).shouldFail).toBe(true);
      expect((provider as any).errorMessage).toBe('Custom error');
    });
  });

  describe('name', () => {
    test('should return correct provider name', () => {
      const provider = new MockProvider();
      expect(provider.name).toBe('mock');
    });
  });

  describe('formatPrompt', () => {
    test('should format prompt with project name', () => {
      const provider = new MockProvider();
      const projectInfo: ProjectInfo = {
        name: 'test-project',
        language: 'TypeScript',
        fileCount: 10,
        directoryCount: 5,
        directories: ['src', 'test'],
        keyFiles: ['index.ts'],
        fileAnalysis: [],
      };

      const prompt = provider.formatPrompt(projectInfo);
      expect(prompt).toBe('Mock prompt for project: test-project');
    });
  });

  describe('analyze', () => {
    test('should return mock response', async () => {
      const provider = new MockProvider();
      const response = await provider.analyze('Test prompt');

      expect(response).toEqual({
        content: 'Mock LLM response',
        tokenUsage: { prompt: 100, completion: 50, total: 150 },
      });
    });

    test('should respect configured delay', async () => {
      const provider = new MockProvider({}, { delay: 50 });

      const start = Date.now();
      await provider.analyze('Test prompt');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow for small timing variations
    });

    test('should throw error when configured to fail', async () => {
      const provider = new MockProvider({}, { shouldFail: true, errorMessage: 'Test failure' });

      await expect(provider.analyze('Test prompt')).rejects.toThrow('Test failure');
    });
  });

  describe('configuration methods', () => {
    test('setMockResponse should update the response', async () => {
      const provider = new MockProvider();
      provider.setMockResponse('Updated response');

      const response = await provider.analyze('Test prompt');
      expect(response.content).toBe('Updated response');
    });

    test('setMockTokenUsage should update the token usage', async () => {
      const provider = new MockProvider();
      provider.setMockTokenUsage({ prompt: 300, completion: 200, total: 500 });

      const response = await provider.analyze('Test prompt');
      expect(response.tokenUsage).toEqual({ prompt: 300, completion: 200, total: 500 });
    });

    test('setShouldFail should control failure behavior', async () => {
      const provider = new MockProvider();

      // Initially should succeed
      await expect(provider.analyze('Test prompt')).resolves.toBeDefined();

      // Set to fail
      provider.setShouldFail(true, 'Configured failure');
      await expect(provider.analyze('Test prompt')).rejects.toThrow('Configured failure');

      // Set back to success
      provider.setShouldFail(false);
      await expect(provider.analyze('Test prompt')).resolves.toBeDefined();
    });

    test('setDelay should update the delay', async () => {
      const provider = new MockProvider();
      provider.setDelay(50);

      const start = Date.now();
      await provider.analyze('Test prompt');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow for small timing variations
    });
  });
});
