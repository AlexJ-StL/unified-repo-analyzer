import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  general: {
    defaultAnalysisMode: 'quick' | 'standard' | 'comprehensive';
    defaultExportFormat: 'json' | 'markdown' | 'html';
    autoIndex: boolean;
  };
  llmProvider: {
    defaultProvider: string;
    apiKey: string;
    maxTokens: number;
    temperature: number;
  };
  fileSystem: {
    ignorePatterns: string[];
    cacheDirectory: string;
    maxFileSize: number;
  };
}

interface SettingsState {
  settings: Settings;
  updateGeneralSettings: (settings: Partial<Settings['general']>) => void;
  updateLLMProviderSettings: (settings: Partial<Settings['llmProvider']>) => void;
  updateFileSystemSettings: (settings: Partial<Settings['fileSystem']>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Settings = {
  general: {
    defaultAnalysisMode: 'standard',
    defaultExportFormat: 'json',
    autoIndex: true,
  },
  llmProvider: {
    defaultProvider: 'claude',
    apiKey: '',
    maxTokens: 8000,
    temperature: 0.7,
  },
  fileSystem: {
    ignorePatterns: ['node_modules/', '.git/', '*.log', 'dist/', 'build/'],
    cacheDirectory: '~/.repo-analyzer/cache',
    maxFileSize: 1024 * 1024, // 1MB
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateGeneralSettings: (generalSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            general: {
              ...state.settings.general,
              ...generalSettings,
            },
          },
        })),

      updateLLMProviderSettings: (llmSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            llmProvider: {
              ...state.settings.llmProvider,
              ...llmSettings,
            },
          },
        })),

      updateFileSystemSettings: (fsSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            fileSystem: {
              ...state.settings.fileSystem,
              ...fsSettings,
            },
          },
        })),

      resetToDefaults: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'repo-analyzer-settings',
    }
  )
);
