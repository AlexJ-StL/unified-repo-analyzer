/**
 * Configuration management service
 */
import {
  UserPreferences,
  WorkspaceConfiguration,
  ProjectConfiguration,
  ConfigurationProfile,
  ConfigurationValidationResult,
  ConfigurationBackup,
  AnalysisModePreset,
} from '@unified-repo-analyzer/shared';
export declare class ConfigurationService {
  private readonly configDir;
  private readonly userConfigPath;
  private readonly workspacesConfigPath;
  private readonly projectsConfigPath;
  private readonly profilesConfigPath;
  private readonly backupsDir;
  constructor();
  /**
   * Initialize configuration directory and default files
   */
  initialize(): Promise<void>;
  /**
   * Get user preferences
   */
  getUserPreferences(): Promise<UserPreferences>;
  /**
   * Save user preferences
   */
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  /**
   * Update specific preference section
   */
  updatePreferences(section: keyof UserPreferences, updates: any): Promise<UserPreferences>;
  /**
   * Get analysis mode presets
   */
  getAnalysisModePresets(): AnalysisModePreset[];
  /**
   * Get workspace configurations
   */
  getWorkspaceConfigurations(): Promise<WorkspaceConfiguration[]>;
  /**
   * Save workspace configuration
   */
  saveWorkspaceConfiguration(
    workspace: Omit<WorkspaceConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkspaceConfiguration>;
  /**
   * Update workspace configuration
   */
  updateWorkspaceConfiguration(
    id: string,
    updates: Partial<WorkspaceConfiguration>
  ): Promise<WorkspaceConfiguration>;
  /**
   * Delete workspace configuration
   */
  deleteWorkspaceConfiguration(id: string): Promise<void>;
  /**
   * Get project configurations
   */
  getProjectConfigurations(): Promise<ProjectConfiguration[]>;
  /**
   * Save project configuration
   */
  saveProjectConfiguration(
    project: Omit<ProjectConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProjectConfiguration>;
  /**
   * Update project configuration
   */
  updateProjectConfiguration(
    id: string,
    updates: Partial<ProjectConfiguration>
  ): Promise<ProjectConfiguration>;
  /**
   * Delete project configuration
   */
  deleteProjectConfiguration(id: string): Promise<void>;
  /**
   * Get configuration profiles
   */
  getConfigurationProfiles(): Promise<ConfigurationProfile[]>;
  /**
   * Save configuration profile
   */
  saveConfigurationProfile(
    profile: Omit<ConfigurationProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConfigurationProfile>;
  /**
   * Apply configuration profile
   */
  applyConfigurationProfile(profileId: string): Promise<UserPreferences>;
  /**
   * Create configuration backup
   */
  createBackup(reason: 'manual' | 'auto' | 'migration'): Promise<ConfigurationBackup>;
  /**
   * Restore configuration from backup
   */
  restoreFromBackup(backupId: string): Promise<UserPreferences>;
  /**
   * Get effective preferences for a project
   */
  getEffectivePreferences(projectPath: string): Promise<UserPreferences>;
  /**
   * Validate user preferences
   */
  validateUserPreferences(preferences: UserPreferences): ConfigurationValidationResult;
  /**
   * Reset to default preferences
   */
  resetToDefaults(): Promise<UserPreferences>;
  /**
   * Export configuration
   */
  exportConfiguration(): Promise<string>;
  /**
   * Import configuration
   */
  importConfiguration(configData: string): Promise<void>;
  /**
   * Private helper methods
   */
  private fileExists;
  private mergeWithDefaults;
  private mergePreferences;
}
export declare const configurationService: ConfigurationService;
