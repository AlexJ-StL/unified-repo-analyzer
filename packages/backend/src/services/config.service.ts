/**
 * Configuration management service
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  type AnalysisModePreset,
  type ConfigurationBackup,
  type ConfigurationProfile,
  type ConfigurationValidationResult,
  DEFAULT_ANALYSIS_MODE_PRESETS,
  DEFAULT_USER_PREFERENCES,
  type ProjectConfiguration,
  type UserPreferences,
  userPreferencesSchema,
  type WorkspaceConfiguration,
} from '@unified-repo-analyzer/shared';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class ConfigurationService {
  private readonly configDir: string;
  private readonly userConfigPath: string;
  private readonly workspacesConfigPath: string;
  private readonly projectsConfigPath: string;
  private readonly profilesConfigPath: string;
  private readonly backupsDir: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.repo-analyzer');
    this.userConfigPath = path.join(this.configDir, 'user-preferences.json');
    this.workspacesConfigPath = path.join(this.configDir, 'workspaces.json');
    this.projectsConfigPath = path.join(this.configDir, 'projects.json');
    this.profilesConfigPath = path.join(this.configDir, 'profiles.json');
    this.backupsDir = path.join(this.configDir, 'backups');
  }

  /**
   * Initialize configuration directory and default files
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
      await fs.mkdir(this.backupsDir, { recursive: true });

      // Create default user preferences if they don't exist
      if (!(await this.fileExists(this.userConfigPath))) {
        await this.saveUserPreferences(DEFAULT_USER_PREFERENCES);
      }

      // Create empty workspace and project configs if they don't exist
      if (!(await this.fileExists(this.workspacesConfigPath))) {
        await fs.writeFile(this.workspacesConfigPath, JSON.stringify([], null, 2));
      }

      if (!(await this.fileExists(this.projectsConfigPath))) {
        await fs.writeFile(this.projectsConfigPath, JSON.stringify([], null, 2));
      }

      if (!(await this.fileExists(this.profilesConfigPath))) {
        await fs.writeFile(this.profilesConfigPath, JSON.stringify([], null, 2));
      }

      logger.info('Configuration service initialized');
    } catch (error) {
      logger.error('Failed to initialize configuration service:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const data = await fs.readFile(this.userConfigPath, 'utf-8');
      const preferences = JSON.parse(data);

      // Merge with defaults to ensure all fields are present
      return this.mergeWithDefaults(preferences, DEFAULT_USER_PREFERENCES);
    } catch (error) {
      logger.warn('Failed to load user preferences, using defaults:', error);
      return DEFAULT_USER_PREFERENCES;
    }
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      const validation = this.validateUserPreferences(preferences);
      if (!validation.isValid) {
        throw new Error(
          `Invalid preferences: ${validation.errors.map((e) => e.message).join(', ')}`
        );
      }

      // Create backup before saving
      await this.createBackup('auto');

      await fs.writeFile(this.userConfigPath, JSON.stringify(preferences, null, 2));
      logger.info('User preferences saved');
    } catch (error) {
      logger.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  /**
   * Update specific preference section
   */
  async updatePreferences<T extends keyof UserPreferences>(
    section: T,
    updates: Partial<UserPreferences[T]>
  ): Promise<UserPreferences> {
    const preferences = await this.getUserPreferences();
    const currentSection = preferences[section];
    preferences[section] = {
      ...currentSection,
      ...updates,
    } as UserPreferences[T];
    await this.saveUserPreferences(preferences);
    return preferences;
  }

  /**
   * Get analysis mode presets
   */
  getAnalysisModePresets(): AnalysisModePreset[] {
    return DEFAULT_ANALYSIS_MODE_PRESETS;
  }

  /**
   * Get workspace configurations
   */
  async getWorkspaceConfigurations(): Promise<WorkspaceConfiguration[]> {
    try {
      const data = await fs.readFile(this.workspacesConfigPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('Failed to load workspace configurations:', error);
      return [];
    }
  }

  /**
   * Save workspace configuration
   */
  async saveWorkspaceConfiguration(
    workspace: Omit<WorkspaceConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkspaceConfiguration> {
    try {
      const workspaces = await this.getWorkspaceConfigurations();
      const newWorkspace: WorkspaceConfiguration = {
        ...workspace,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspaces.push(newWorkspace);
      await fs.writeFile(this.workspacesConfigPath, JSON.stringify(workspaces, null, 2));

      logger.info(`Workspace configuration saved: ${newWorkspace.name}`);
      return newWorkspace;
    } catch (error) {
      logger.error('Failed to save workspace configuration:', error);
      throw error;
    }
  }

  /**
   * Update workspace configuration
   */
  async updateWorkspaceConfiguration(
    id: string,
    updates: Partial<WorkspaceConfiguration>
  ): Promise<WorkspaceConfiguration> {
    try {
      const workspaces = await this.getWorkspaceConfigurations();
      const index = workspaces.findIndex((w) => w.id === id);

      if (index === -1) {
        throw new Error(`Workspace not found: ${id}`);
      }

      workspaces[index] = {
        ...workspaces[index],
        ...updates,
        updatedAt: new Date(),
      };

      await fs.writeFile(this.workspacesConfigPath, JSON.stringify(workspaces, null, 2));
      logger.info(`Workspace configuration updated: ${id}`);

      return workspaces[index];
    } catch (error) {
      logger.error('Failed to update workspace configuration:', error);
      throw error;
    }
  }

  /**
   * Delete workspace configuration
   */
  async deleteWorkspaceConfiguration(id: string): Promise<void> {
    try {
      const workspaces = await this.getWorkspaceConfigurations();
      const filtered = workspaces.filter((w) => w.id !== id);

      if (filtered.length === workspaces.length) {
        throw new Error(`Workspace not found: ${id}`);
      }

      await fs.writeFile(this.workspacesConfigPath, JSON.stringify(filtered, null, 2));
      logger.info(`Workspace configuration deleted: ${id}`);
    } catch (error) {
      logger.error('Failed to delete workspace configuration:', error);
      throw error;
    }
  }

  /**
   * Get project configurations
   */
  async getProjectConfigurations(): Promise<ProjectConfiguration[]> {
    try {
      const data = await fs.readFile(this.projectsConfigPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('Failed to load project configurations:', error);
      return [];
    }
  }

  /**
   * Save project configuration
   */
  async saveProjectConfiguration(
    project: Omit<ProjectConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProjectConfiguration> {
    try {
      const projects = await this.getProjectConfigurations();
      const newProject: ProjectConfiguration = {
        ...project,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      projects.push(newProject);
      await fs.writeFile(this.projectsConfigPath, JSON.stringify(projects, null, 2));

      logger.info(`Project configuration saved: ${newProject.name}`);
      return newProject;
    } catch (error) {
      logger.error('Failed to save project configuration:', error);
      throw error;
    }
  }

  /**
   * Update project configuration
   */
  async updateProjectConfiguration(
    id: string,
    updates: Partial<ProjectConfiguration>
  ): Promise<ProjectConfiguration> {
    try {
      const projects = await this.getProjectConfigurations();
      const index = projects.findIndex((p) => p.id === id);

      if (index === -1) {
        throw new Error(`Project not found: ${id}`);
      }

      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date(),
      };

      await fs.writeFile(this.projectsConfigPath, JSON.stringify(projects, null, 2));
      logger.info(`Project configuration updated: ${id}`);

      return projects[index];
    } catch (error) {
      logger.error('Failed to update project configuration:', error);
      throw error;
    }
  }

  /**
   * Delete project configuration
   */
  async deleteProjectConfiguration(id: string): Promise<void> {
    try {
      const projects = await this.getProjectConfigurations();
      const filtered = projects.filter((p) => p.id !== id);

      if (filtered.length === projects.length) {
        throw new Error(`Project not found: ${id}`);
      }

      await fs.writeFile(this.projectsConfigPath, JSON.stringify(filtered, null, 2));
      logger.info(`Project configuration deleted: ${id}`);
    } catch (error) {
      logger.error('Failed to delete project configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration profiles
   */
  async getConfigurationProfiles(): Promise<ConfigurationProfile[]> {
    try {
      const data = await fs.readFile(this.profilesConfigPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('Failed to load configuration profiles:', error);
      return [];
    }
  }

  /**
   * Save configuration profile
   */
  async saveConfigurationProfile(
    profile: Omit<ConfigurationProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConfigurationProfile> {
    try {
      const profiles = await this.getConfigurationProfiles();
      const newProfile: ConfigurationProfile = {
        ...profile,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profiles.push(newProfile);
      await fs.writeFile(this.profilesConfigPath, JSON.stringify(profiles, null, 2));

      logger.info(`Configuration profile saved: ${newProfile.name}`);
      return newProfile;
    } catch (error) {
      logger.error('Failed to save configuration profile:', error);
      throw error;
    }
  }

  /**
   * Apply configuration profile
   */
  async applyConfigurationProfile(profileId: string): Promise<UserPreferences> {
    try {
      const profiles = await this.getConfigurationProfiles();
      const profile = profiles.find((p) => p.id === profileId);

      if (!profile) {
        throw new Error(`Profile not found: ${profileId}`);
      }

      await this.saveUserPreferences(profile.preferences);
      logger.info(`Configuration profile applied: ${profile.name}`);

      return profile.preferences;
    } catch (error) {
      logger.error('Failed to apply configuration profile:', error);
      throw error;
    }
  }

  /**
   * Create configuration backup
   */
  async createBackup(reason: 'manual' | 'auto' | 'migration'): Promise<ConfigurationBackup> {
    try {
      const preferences = await this.getUserPreferences();
      const backup: ConfigurationBackup = {
        id: uuidv4(),
        timestamp: new Date(),
        version: '1.0.0', // TODO: Get from package.json
        preferences,
        reason,
      };

      const backupPath = path.join(this.backupsDir, `backup-${backup.id}.json`);
      await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));

      logger.info(`Configuration backup created: ${backup.id}`);
      return backup;
    } catch (error) {
      logger.error('Failed to create configuration backup:', error);
      throw error;
    }
  }

  /**
   * Restore configuration from backup
   */
  async restoreFromBackup(backupId: string): Promise<UserPreferences> {
    try {
      const backupPath = path.join(this.backupsDir, `backup-${backupId}.json`);
      const data = await fs.readFile(backupPath, 'utf-8');
      const backup: ConfigurationBackup = JSON.parse(data);

      await this.saveUserPreferences(backup.preferences);
      logger.info(`Configuration restored from backup: ${backupId}`);

      return backup.preferences;
    } catch (error) {
      logger.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * Get effective preferences for a project
   */
  async getEffectivePreferences(projectPath: string): Promise<UserPreferences> {
    try {
      const userPrefs = await this.getUserPreferences();
      const projects = await this.getProjectConfigurations();
      const workspaces = await this.getWorkspaceConfigurations();

      // Find project configuration
      const project = projects.find((p) => p.path === projectPath);
      if (!project) {
        return userPrefs;
      }

      // Find workspace configuration if project belongs to one
      let workspacePrefs = {};
      if (project.workspaceId) {
        const workspace = workspaces.find((w) => w.id === project.workspaceId);
        if (workspace) {
          workspacePrefs = workspace.preferences;
        }
      }

      // Merge preferences: user < workspace < project
      const mergedPrefs = this.mergePreferences(
        userPrefs,
        workspacePrefs,
        project.preferences
      ) as UserPreferences;
      return this.mergeWithDefaults(mergedPrefs, DEFAULT_USER_PREFERENCES);
    } catch (error) {
      logger.error('Failed to get effective preferences:', error);
      return await this.getUserPreferences();
    }
  }

  /**
   * Validate user preferences
   */
  validateUserPreferences(preferences: UserPreferences): ConfigurationValidationResult {
    try {
      userPreferencesSchema.parse(preferences);
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    } catch (error: unknown) {
      const errors =
        (error as any).errors?.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })) || [];

      return {
        isValid: false,
        errors,
        warnings: [],
      };
    }
  }

  /**
   * Reset to default preferences
   */
  async resetToDefaults(): Promise<UserPreferences> {
    await this.createBackup('manual');
    await this.saveUserPreferences(DEFAULT_USER_PREFERENCES);
    return DEFAULT_USER_PREFERENCES;
  }

  /**
   * Export configuration
   */
  async exportConfiguration(): Promise<string> {
    try {
      const config = {
        userPreferences: await this.getUserPreferences(),
        workspaces: await this.getWorkspaceConfigurations(),
        projects: await this.getProjectConfigurations(),
        profiles: await this.getConfigurationProfiles(),
        exportedAt: new Date(),
      };

      return JSON.stringify(config, null, 2);
    } catch (error) {
      logger.error('Failed to export configuration:', error);
      throw error;
    }
  }

  /**
   * Import configuration
   */
  async importConfiguration(configData: string): Promise<void> {
    try {
      const config = JSON.parse(configData);

      // Create backup before import
      await this.createBackup('manual');

      if (config.userPreferences) {
        await this.saveUserPreferences(config.userPreferences);
      }

      if (config.workspaces) {
        await fs.writeFile(this.workspacesConfigPath, JSON.stringify(config.workspaces, null, 2));
      }

      if (config.projects) {
        await fs.writeFile(this.projectsConfigPath, JSON.stringify(config.projects, null, 2));
      }

      if (config.profiles) {
        await fs.writeFile(this.profilesConfigPath, JSON.stringify(config.profiles, null, 2));
      }

      logger.info('Configuration imported successfully');
    } catch (error) {
      logger.error('Failed to import configuration:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private mergeWithDefaults(
    preferences: UserPreferences,
    defaults: UserPreferences
  ): UserPreferences {
    return {
      general: { ...defaults.general, ...preferences.general },
      analysis: { ...defaults.analysis, ...preferences.analysis },
      llmProvider: {
        ...defaults.llmProvider,
        ...preferences.llmProvider,
        providers: {
          ...defaults.llmProvider.providers,
          ...preferences.llmProvider?.providers,
        },
      },
      export: { ...defaults.export, ...preferences.export },
      ui: { ...defaults.ui, ...preferences.ui },
    };
  }

  private mergePreferences(
    ...preferences: (UserPreferences | Partial<UserPreferences>)[]
  ): UserPreferences {
    return preferences.reduce((merged: UserPreferences, prefs: Partial<UserPreferences>) => {
      if (!prefs) return merged;

      return {
        general: { ...merged.general, ...prefs.general },
        analysis: { ...merged.analysis, ...prefs.analysis },
        llmProvider: {
          ...merged.llmProvider,
          ...prefs.llmProvider,
          providers: {
            ...merged.llmProvider?.providers,
            ...prefs.llmProvider?.providers,
          },
        },
        export: { ...merged.export, ...prefs.export },
        ui: { ...merged.ui, ...prefs.ui },
      };
    }, DEFAULT_USER_PREFERENCES);
  }
}

// Export singleton instance
export const configurationService = new ConfigurationService();
