/**
 * Basic configuration service tests
 */

import fs from 'node:fs/promises';
import { vi } from 'vitest';
import { ConfigurationService } from '../config.service';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('os', () => ({ homedir: () => '/mock/home' }));
vi.mock('uuid', () => ({ v4: () => 'mock-uuid-123' }));
vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockFs = fs as anyed<typeof fs>;

describe('ConfigurationService - Basic Tests', () => {
  let configService: ConfigurationService;

  const mockValidPreferences = {
    general: {
      theme: 'system' as const,
      autoSave: true,
      autoIndex: true,
      enableNotifications: true,
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock file system responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.access.mockRejectedValue(new Error('File not found'));

    mockFs.readFile.mockImplementation((path: string) => {
      if (typeof path === 'string') {
        if (
          path.includes('workspaces.json') ||
          path.includes('projects.json') ||
          path.includes('profiles.json')
        ) {
          return Promise.resolve('[]');
        }
        if (path.includes('user-preferences.json')) {
          return Promise.resolve(JSON.stringify(mockValidPreferences));
        }
      }
      return Promise.resolve('{}');
    });

    configService = new ConfigurationService();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(configService.initialize()).resolves.not.toThrow();
      expect(mockFs.mkdir).toHaveBeenCalled();
    });
  });

  describe('user preferences', () => {
    it('should get user preferences', async () => {
      const preferences = await configService.getUserPreferences();
      expect(preferences).toBeDefined();
      expect(preferences.general).toBeDefined();
      expect(preferences.analysis).toBeDefined();
    });

    it('should validate valid preferences', () => {
      const result = configService.validateUserPreferences(mockValidPreferences);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('workspace management', () => {
    it('should create workspace configuration', async () => {
      const workspace = {
        name: 'Test Workspace',
        path: '/test/path',
        preferences: {},
      };

      const result = await configService.saveWorkspaceConfiguration(workspace);
      expect(result.name).toBe(workspace.name);
      expect(result.path).toBe(workspace.path);
      expect(result.id).toBe('mock-uuid-123');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('export functionality', () => {
    it('should export configuration as JSON string', async () => {
      const result = await configService.exportConfiguration();
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();

      const parsed = JSON.parse(result);
      expect(parsed.userPreferences).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });
});
