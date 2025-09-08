/// <reference types="vitest/globals" />
/**
 * Simple configuration service tests
 */

import fs from 'node:fs/promises';
import { vi } from 'vitest';
import { ConfigurationService } from '../config.service';

// Mock dependencies
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  access: vi.fn().mockRejectedValue(new Error('File not found')),
}));

const mockFs = fs as any;

vi.mock('os', () => ({
  homedir: () => '/mock/home',
  platform: () => 'linux',
}));

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ConfigurationService', () => {
  let configService: ConfigurationService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock responses
    mockFs.readFile.mockImplementation((path: string) => {
      if (
        path.includes('workspaces.json') ||
        path.includes('projects.json') ||
        path.includes('profiles.json')
      ) {
        return Promise.resolve('[]');
      }
      // Return a valid preferences object for user-preferences.json
      return Promise.resolve(
        JSON.stringify({
          general: {
            theme: 'system',
            autoSave: true,
            autoIndex: true,
            enableNotifications: true,
            language: 'en',
          },
          analysis: {
            defaultMode: 'standard',
            maxFiles: 500,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: true,
            includeTree: true,
            ignorePatterns: [],
            maxFileSize: 1024 * 1024,
            cacheDirectory: '~/.cache',
            cacheTTL: 24,
          },
          llmProvider: {
            defaultProvider: 'claude',
            providers: {
              claude: {
                name: 'Claude',
                maxTokens: 8000,
                temperature: 0.7,
                enabled: true,
              },
            },
          },
          export: {
            defaultFormat: 'json',
            outputDirectory: './results',
            includeMetadata: true,
            compressLargeFiles: true,
            customTemplates: {},
          },
          ui: {
            compactMode: false,
            showAdvancedOptions: false,
            defaultView: 'grid',
            itemsPerPage: 20,
            enableAnimations: true,
          },
        })
      );
    });
    configService = new ConfigurationService();
  });

  describe('basic functionality', () => {
    it('should initialize without errors', async () => {
      await expect(configService.initialize()).resolves.not.toThrow();
    });

    it('should get user preferences', async () => {
      const preferences = await configService.getUserPreferences();
      expect(preferences).toBeDefined();
      expect(preferences.general).toBeDefined();
      expect(preferences.analysis).toBeDefined();
    });

    it('should validate preferences structure', () => {
      const mockPreferences = {
        general: {
          autoSave: true,
          autoIndex: true,
          enableNotifications: true,
          theme: 'system' as const,
          language: 'en',
        },
        analysis: {
          defaultMode: 'standard' as const,
          maxFiles: 500,
          maxLinesPerFile: 1000,
          includeLLMAnalysis: true,
          includeTree: true,
          ignorePatterns: ['node_modules/'],
          maxFileSize: 1024 * 1024,
          cacheDirectory: '~/.cache',
          cacheTTL: 24,
        },
        llmProvider: {
          defaultProvider: 'claude',
          providers: {
            claude: {
              name: 'Claude',
              maxTokens: 8000,
              temperature: 0.7,
              enabled: true,
            },
          },
        },
        export: {
          defaultFormat: 'json' as const,
          outputDirectory: './results',
          includeMetadata: true,
          compressLargeFiles: true,
          customTemplates: {},
        },
        ui: {
          compactMode: false,
          showAdvancedOptions: false,
          defaultView: 'grid' as const,
          itemsPerPage: 20,
          enableAnimations: true,
        },
      };

      const result = configService.validateUserPreferences(mockPreferences);
      expect(result.isValid).toBe(true);
    });

    it('should create workspace configuration', async () => {
      const workspace = {
        name: 'Test Workspace',
        path: '/test/path',
        preferences: {},
      };

      const result = await configService.saveWorkspaceConfiguration(workspace);
      expect(result.name).toBe(workspace.name);
      expect(result.path).toBe(workspace.path);
      expect(result.id).toBeDefined();
    });

    it('should export configuration', async () => {
      const result = await configService.exportConfiguration();
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});
