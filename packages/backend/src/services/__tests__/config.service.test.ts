/// <reference types="vitest/globals" />
/**
 * Configuration service tests
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockHomeDir = '/mock/home';

import { ConfigurationService } from '../config.service';

const DEFAULT_USER_PREFERENCES = {
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
    ignorePatterns: ['node_modules/', '.git/'],
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

vi.mock('node:fs/promises');
const mockFs = vi.mocked(fs);

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));
const mockUuidV4 = vi.mocked(uuidv4);

vi.mock('node:os', () => ({
  default: {
    homedir: vi.fn(() => '/mock/home'),
    platform: vi.fn(() => 'win32'),
  },
  homedir: vi.fn(() => '/mock/home'),
  platform: vi.fn(() => 'win32'),
}));
const mockOsHomedir = vi.mocked(os.homedir);

const mockLoggerInfo = vi.fn();
const mockLoggerWarn = vi.fn();
const mockLoggerError = vi.fn();
vi.doMock('../../utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
}));

describe('ConfigurationService', () => {
  let configService: ConfigurationService;
  const mockConfigDir = path.join(mockHomeDir, '.repo-analyzer');

  beforeEach(() => {
    // Reset mock implementations
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
    mockFs.access.mockResolvedValue(undefined);

    mockUuidV4.mockReturnValue('mock-uuid-123');
    mockOsHomedir.mockReturnValue('/mock/home');
    mockLoggerInfo.mockClear();
    mockLoggerWarn.mockClear();
    mockLoggerError.mockClear();

    configService = new ConfigurationService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create configuration directory and default files', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await configService.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(mockConfigDir, {
        recursive: true,
      });
      expect(mockFs.mkdir).toHaveBeenCalledWith(path.join(mockConfigDir, 'backups'), {
        recursive: true,
      });
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockConfigDir, 'user-preferences.json'),
        JSON.stringify(DEFAULT_USER_PREFERENCES, null, 2)
      );
    });

    it('should not overwrite existing files', async () => {
      mockFs.access.mockResolvedValue(undefined); // Files exist

      await configService.initialize();

      expect(mockFs.writeFile).not.toHaveBeenCalledWith(
        expect.stringContaining('user-preferences.json'),
        expect.any(String)
      );
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences from file', async () => {
      const mockPreferences = { ...DEFAULT_USER_PREFERENCES };
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await configService.getUserPreferences();

      expect(result).toEqual(mockPreferences);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(mockConfigDir, 'user-preferences.json'),
        'utf-8'
      );
    });

    it('should return defaults if file read fails', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await configService.getUserPreferences();

      expect(result).toEqual(DEFAULT_USER_PREFERENCES);
    });

    it('should merge with defaults for missing fields', async () => {
      const partialPreferences = {
        general: { theme: 'dark' as const },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(partialPreferences));

      const result = await configService.getUserPreferences();

      expect(result.general.theme).toBe('dark');
      expect(result.general.autoSave).toBe(DEFAULT_USER_PREFERENCES.general.autoSave);
      expect(result.analysis).toEqual(DEFAULT_USER_PREFERENCES.analysis);
    });
  });

  describe('saveUserPreferences', () => {
    it('should save valid preferences', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));

      await configService.saveUserPreferences(DEFAULT_USER_PREFERENCES);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockConfigDir, 'user-preferences.json'),
        JSON.stringify(DEFAULT_USER_PREFERENCES, null, 2)
      );
    });

    it('should create backup before saving', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));

      await configService.saveUserPreferences(DEFAULT_USER_PREFERENCES);

      // Should create backup (writeFile called twice - once for backup, once for preferences)
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
    });

    it('should throw error for invalid preferences', async () => {
      const invalidPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        general: {
          ...DEFAULT_USER_PREFERENCES.general,
          theme: 'invalid' as any,
        },
      };

      await expect(configService.saveUserPreferences(invalidPreferences)).rejects.toThrow();
    });
  });

  describe('updatePreferences', () => {
    it('should update specific preference section', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
      mockFs.writeFile.mockResolvedValue(undefined);

      const updates = { theme: 'dark' as const };
      const result = await configService.updatePreferences('general', updates);

      expect(result.general.theme).toBe('dark');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('validateUserPreferences', () => {
    it('should validate correct preferences', () => {
      const result = configService.validateUserPreferences(DEFAULT_USER_PREFERENCES);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid preferences', () => {
      const invalidPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        general: {
          ...DEFAULT_USER_PREFERENCES.general,
          theme: 'invalid' as any,
        },
      };

      const result = configService.validateUserPreferences(invalidPreferences);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('workspace management', () => {
    it('should save workspace configuration', async () => {
      mockFs.readFile.mockResolvedValue('[]');
      mockFs.writeFile.mockResolvedValue(undefined);

      const workspace = {
        name: 'Test Workspace',
        path: '/test/path',
        preferences: {},
      };

      const result = await configService.saveWorkspaceConfiguration(workspace);

      expect(result.name).toBe(workspace.name);
      expect(result.path).toBe(workspace.path);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should update workspace configuration', async () => {
      const existingWorkspace = {
        id: 'test-id',
        name: 'Test Workspace',
        path: '/test/path',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify([existingWorkspace]));
      mockFs.writeFile.mockResolvedValue(undefined);

      const updates = { name: 'Updated Workspace' };
      const result = await configService.updateWorkspaceConfiguration('test-id', updates);

      expect(result.name).toBe('Updated Workspace');
      expect(result.updatedAt).not.toEqual(existingWorkspace.updatedAt);
    });

    it('should delete workspace configuration', async () => {
      const existingWorkspace = {
        id: 'test-id',
        name: 'Test Workspace',
        path: '/test/path',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify([existingWorkspace]));
      mockFs.writeFile.mockResolvedValue(undefined);

      await configService.deleteWorkspaceConfiguration('test-id');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('workspaces.json'),
        JSON.stringify([], null, 2)
      );
    });
  });

  describe('backup and restore', () => {
    it('should create configuration backup', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
      mockFs.writeFile.mockResolvedValue(undefined);

      const backup = await configService.createBackup('manual');

      expect(backup.id).toBeDefined();
      expect(backup.preferences).toEqual(DEFAULT_USER_PREFERENCES);
      expect(backup.reason).toBe('manual');
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`backup-${backup.id}.json`),
        expect.any(String)
      );
    });

    it('should restore from backup', async () => {
      const backupData = {
        id: 'backup-id',
        timestamp: new Date(),
        version: '1.0.0',
        preferences: DEFAULT_USER_PREFERENCES,
        reason: 'manual' as const,
      };
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(backupData)) // Read backup
        .mockResolvedValueOnce(JSON.stringify(DEFAULT_USER_PREFERENCES)); // Create new backup
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await configService.restoreFromBackup('backup-id');

      expect(result).toEqual(DEFAULT_USER_PREFERENCES);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('import and export', () => {
    it('should export configuration', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));

      const result = await configService.exportConfiguration();

      const exported = JSON.parse(result);
      expect(exported.userPreferences).toEqual(DEFAULT_USER_PREFERENCES);
      expect(exported.exportedAt).toBeDefined();
    });

    it('should import configuration', async () => {
      const configData = JSON.stringify({
        userPreferences: DEFAULT_USER_PREFERENCES,
        workspaces: [],
        projects: [],
        profiles: [],
      });
      mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
      mockFs.writeFile.mockResolvedValue(undefined);

      await configService.importConfiguration(configData);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('user-preferences.json'),
        JSON.stringify(DEFAULT_USER_PREFERENCES, null, 2)
      );
    });
  });
});
