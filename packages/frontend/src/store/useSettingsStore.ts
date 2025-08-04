import {
  type AnalysisModePreset,
  type ConfigurationProfile,
  DEFAULT_USER_PREFERENCES,
  type ProjectConfiguration,
  type UserPreferences,
  type WorkspaceConfiguration,
} from '@unified-repo-analyzer/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // User preferences
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Workspaces and projects
  workspaces: WorkspaceConfiguration[];
  projects: ProjectConfiguration[];
  profiles: ConfigurationProfile[];
  presets: AnalysisModePreset[];

  // Actions
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  updatePreferenceSection: (section: keyof UserPreferences, updates: any) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Workspace management
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (
    workspace: Omit<WorkspaceConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<WorkspaceConfiguration>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;

  // Project management
  loadProjects: () => Promise<void>;
  createProject: (
    project: Omit<ProjectConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectConfiguration>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Profile management
  loadProfiles: () => Promise<void>;
  createProfile: (
    profile: Omit<ConfigurationProfile, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  applyProfile: (profileId: string) => Promise<void>;

  // Presets
  loadPresets: () => Promise<void>;

  // Effective preferences
  getEffectivePreferences: (projectPath: string) => Promise<UserPreferences>;

  // Backup and restore
  createBackup: () => Promise<void>;
  restoreFromBackup: (backupId: string) => Promise<void>;

  // Import/Export
  exportConfiguration: () => Promise<string>;
  importConfiguration: (configData: string) => Promise<void>;

  // Validation
  validatePreferences: (preferences: UserPreferences) => Promise<any>;

  // Clear error
  clearError: () => void;
}

const API_BASE = '/api/config';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: DEFAULT_USER_PREFERENCES,
      isLoading: false,
      error: null,
      workspaces: [],
      projects: [],
      profiles: [],
      presets: [],

      // Load preferences from server
      loadPreferences: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/preferences`);
          if (!response.ok) throw new Error('Failed to load preferences');
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load preferences',
            isLoading: false,
          });
        }
      },

      // Update preferences
      updatePreferences: async (preferences: UserPreferences) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
          });
          if (!response.ok) throw new Error('Failed to update preferences');
          const updatedPreferences = await response.json();
          set({ preferences: updatedPreferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update preferences',
            isLoading: false,
          });
        }
      },

      // Update specific preference section
      updatePreferenceSection: async (section: keyof UserPreferences, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/preferences/${section}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!response.ok) throw new Error(`Failed to update ${section} preferences`);
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update preferences',
            isLoading: false,
          });
        }
      },

      // Reset to defaults
      resetToDefaults: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/reset`, { method: 'POST' });
          if (!response.ok) throw new Error('Failed to reset preferences');
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to reset preferences',
            isLoading: false,
          });
        }
      },

      // Load workspaces
      loadWorkspaces: async () => {
        try {
          const response = await fetch(`${API_BASE}/workspaces`);
          if (!response.ok) throw new Error('Failed to load workspaces');
          const workspaces = await response.json();
          set({ workspaces });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load workspaces' });
        }
      },

      // Create workspace
      createWorkspace: async (workspace) => {
        try {
          const response = await fetch(`${API_BASE}/workspaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workspace),
          });
          if (!response.ok) throw new Error('Failed to create workspace');
          await get().loadWorkspaces();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create workspace' });
        }
      },

      // Update workspace
      updateWorkspace: async (id, updates) => {
        try {
          const response = await fetch(`${API_BASE}/workspaces/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!response.ok) throw new Error('Failed to update workspace');
          await get().loadWorkspaces();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update workspace' });
        }
      },

      // Delete workspace
      deleteWorkspace: async (id) => {
        try {
          const response = await fetch(`${API_BASE}/workspaces/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete workspace');
          await get().loadWorkspaces();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete workspace' });
        }
      },

      // Load projects
      loadProjects: async () => {
        try {
          const response = await fetch(`${API_BASE}/projects`);
          if (!response.ok) throw new Error('Failed to load projects');
          const projects = await response.json();
          set({ projects });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load projects' });
        }
      },

      // Create project
      createProject: async (project) => {
        try {
          const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
          });
          if (!response.ok) throw new Error('Failed to create project');
          await get().loadProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create project' });
        }
      },

      // Update project
      updateProject: async (id, updates) => {
        try {
          const response = await fetch(`${API_BASE}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!response.ok) throw new Error('Failed to update project');
          await get().loadProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update project' });
        }
      },

      // Delete project
      deleteProject: async (id) => {
        try {
          const response = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete project');
          await get().loadProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
        }
      },

      // Load profiles
      loadProfiles: async () => {
        try {
          const response = await fetch(`${API_BASE}/profiles`);
          if (!response.ok) throw new Error('Failed to load profiles');
          const profiles = await response.json();
          set({ profiles });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load profiles' });
        }
      },

      // Create profile
      createProfile: async (profile) => {
        try {
          const response = await fetch(`${API_BASE}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          });
          if (!response.ok) throw new Error('Failed to create profile');
          await get().loadProfiles();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create profile' });
        }
      },

      // Apply profile
      applyProfile: async (profileId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/profiles/${profileId}/apply`, {
            method: 'POST',
          });
          if (!response.ok) throw new Error('Failed to apply profile');
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to apply profile',
            isLoading: false,
          });
        }
      },

      // Load presets
      loadPresets: async () => {
        try {
          const response = await fetch(`${API_BASE}/presets`);
          if (!response.ok) throw new Error('Failed to load presets');
          const presets = await response.json();
          set({ presets });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load presets' });
        }
      },

      // Get effective preferences
      getEffectivePreferences: async (projectPath: string) => {
        const response = await fetch(
          `${API_BASE}/effective-preferences?projectPath=${encodeURIComponent(projectPath)}`
        );
        if (!response.ok) throw new Error('Failed to get effective preferences');
        return response.json();
      },

      // Create backup
      createBackup: async () => {
        try {
          const response = await fetch(`${API_BASE}/backup`, { method: 'POST' });
          if (!response.ok) throw new Error('Failed to create backup');
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create backup' });
        }
      },

      // Restore from backup
      restoreFromBackup: async (backupId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/restore/${backupId}`, { method: 'POST' });
          if (!response.ok) throw new Error('Failed to restore from backup');
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to restore from backup',
            isLoading: false,
          });
        }
      },

      // Export configuration
      exportConfiguration: async () => {
        const response = await fetch(`${API_BASE}/export`);
        if (!response.ok) throw new Error('Failed to export configuration');
        return response.text();
      },

      // Import configuration
      importConfiguration: async (configData: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configData }),
          });
          if (!response.ok) throw new Error('Failed to import configuration');
          const preferences = await response.json();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to import configuration',
            isLoading: false,
          });
        }
      },

      // Validate preferences
      validatePreferences: async (preferences: UserPreferences) => {
        const response = await fetch(`${API_BASE}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences }),
        });
        if (!response.ok) throw new Error('Failed to validate preferences');
        return response.json();
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'repo-analyzer-settings',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
