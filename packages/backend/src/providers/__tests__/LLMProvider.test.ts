/**
 * Tests for LLMProvider base class
 */

import type {
  LLMResponse,
  ProjectInfo,
  ProviderConfig,
} from '@unified-repo-analyzer/shared/src/types/provider';
import { LLMProvider } from '../LLMProvider';

// Concrete implementation for testing abstract class
class TestProvider extends LLMProvider {
  get name(): string {
    return 'test-provider';
  }

  formatPrompt(projectInfo: ProjectInfo): string {
    return `Test prompt for ${projectInfo.name}`;
  }

  async analyze(prompt: string): Promise<LLMResponse> {
    return {
      content: `Response for: ${prompt}`,
      tokenUsage: {
        prompt: 10,
        completion: 5,
        total: 15,
      },
    };
  }
}

describe('LLMProvider', () => {
  describe('constructor', () => {
    test('should initialize with provided config', () => {
      const config: ProviderConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.5,
      };

      const provider = new TestProvider(config);
      expect(provider).toBeInstanceOf(LLMProvider);
    });

    test('should throw error if config is not provided', () => {
      expect(() => new TestProvider(undefined as unknown as ProviderConfig)).toThrow(
        'Provider configuration is required'
      );
    });
  });

  describe('validateAndNormalizeConfig', () => {
    test('should apply default values for missing config properties', () => {
      const provider = new TestProvider({ apiKey: 'test-key' });

      // Access protected method using type assertion
      const validateMethod = (provider as any).validateAndNormalizeConfig.bind(provider);
      const normalizedConfig = validateMethod({ apiKey: 'test-key' });

      expect(normalizedConfig).toEqual({
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
      });
    });

    test('should preserve provided values', () => {
      const provider = new TestProvider({
        apiKey: 'test-key',
        model: 'custom-model',
        maxTokens: 2000,
        temperature: 0.3,
      });

      // Access protected method using type assertion
      const validateMethod = (provider as any).validateAndNormalizeConfig.bind(provider);
      const normalizedConfig = validateMethod({
        apiKey: 'test-key',
        model: 'custom-model',
        maxTokens: 2000,
        temperature: 0.3,
      });

      expect(normalizedConfig).toEqual({
        apiKey: 'test-key',
        model: 'custom-model',
        maxTokens: 2000,
        temperature: 0.3,
      });
    });
  });

  describe('abstract methods', () => {
    test('concrete implementation should provide name property', () => {
      const provider = new TestProvider({ apiKey: 'test-key' });
      expect(provider.name).toBe('test-provider');
    });

    test('concrete implementation should implement formatPrompt', async () => {
      const provider = new TestProvider({ apiKey: 'test-key' });
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
      expect(prompt).toBe('Test prompt for test-project');
    });

    test('concrete implementation should implement analyze', async () => {
      const provider = new TestProvider({ apiKey: 'test-key' });
      const response = await provider.analyze('Test prompt');

      expect(response).toEqual({
        content: 'Response for: Test prompt',
        tokenUsage: {
          prompt: 10,
          completion: 5,
          total: 15,
        },
      });
    });
  });
});
