import { UserPreferences, WorkspaceConfiguration, ProjectConfiguration, ConfigurationProfile, AnalysisModePreset } from '@unified-repo-analyzer/shared';
interface SettingsState {
    preferences: UserPreferences;
    isLoading: boolean;
    error: string | null;
    workspaces: WorkspaceConfiguration[];
    projects: ProjectConfiguration[];
    profiles: ConfigurationProfile[];
    presets: AnalysisModePreset[];
    loadPreferences: () => Promise<void>;
    updatePreferences: (preferences: UserPreferences) => Promise<void>;
    updatePreferenceSection: (section: keyof UserPreferences, updates: any) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    loadWorkspaces: () => Promise<void>;
    createWorkspace: (workspace: Omit<WorkspaceConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateWorkspace: (id: string, updates: Partial<WorkspaceConfiguration>) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    loadProjects: () => Promise<void>;
    createProject: (project: Omit<ProjectConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateProject: (id: string, updates: Partial<ProjectConfiguration>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    loadProfiles: () => Promise<void>;
    createProfile: (profile: Omit<ConfigurationProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    applyProfile: (profileId: string) => Promise<void>;
    loadPresets: () => Promise<void>;
    getEffectivePreferences: (projectPath: string) => Promise<UserPreferences>;
    createBackup: () => Promise<void>;
    restoreFromBackup: (backupId: string) => Promise<void>;
    exportConfiguration: () => Promise<string>;
    importConfiguration: (configData: string) => Promise<void>;
    validatePreferences: (preferences: UserPreferences) => Promise<any>;
    clearError: () => void;
}
export declare const useSettingsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<SettingsState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<SettingsState, SettingsState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: SettingsState) => void) => () => void;
        onFinishHydration: (fn: (state: SettingsState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<SettingsState, SettingsState>>;
    };
}>;
export {};
