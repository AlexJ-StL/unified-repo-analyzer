/**
 * Configuration manager component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../../../store/useSettingsStore';
import ConfigurationManager from '../ConfigurationManager';

// Mock the settings store
vi.mock('../../../store/useSettingsStore');
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock all the preference components
vi.mock('../GeneralPreferences', () => {
  return function MockGeneralPreferences() {
    return <div data-testid="general-preferences">General Preferences</div>;
  };
});

vi.mock('../AnalysisPreferences', () => {
  return function MockAnalysisPreferences() {
    return <div data-testid="analysis-preferences">Analysis Preferences</div>;
  };
});

vi.mock('../LLMProviderPreferences', () => {
  return function MockLLMProviderPreferences() {
    return <div data-testid="llm-preferences">LLM Provider Preferences</div>;
  };
});

vi.mock('../ExportPreferences', () => {
  return function MockExportPreferences() {
    return <div data-testid="export-preferences">Export Preferences</div>;
  };
});

vi.mock('../UIPreferences', () => {
  return function MockUIPreferences() {
    return <div data-testid="ui-preferences">UI Preferences</div>;
  };
});

vi.mock('../WorkspaceManager', () => {
  return function MockWorkspaceManager() {
    return <div data-testid="workspace-manager">Workspace Manager</div>;
  };
});

vi.mock('../ProjectManager', () => {
  return function MockProjectManager() {
    return <div data-testid="project-manager">Project Manager</div>;
  };
});

vi.mock('../ProfileManager', () => {
  return function MockProfileManager() {
    return <div data-testid="profile-manager">Profile Manager</div>;
  };
});

vi.mock('../ConfigurationImportExport', () => {
  return function MockConfigurationImportExport() {
    return <div data-testid="import-export">Import/Export</div>;
  };
});

const mockUseSettingsStore = useSettingsStore as unknown as ReturnType<typeof vi.fn>;

describe('ConfigurationManager', () => {
  const mockStore = {
    preferences: {
      general: {
        theme: 'light' as const,
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
        ignorePatterns: [],
        maxFileSize: 1024 * 1024,
        cacheDirectory: '~/.cache',
        cacheTTL: 24,
      },
      llmProvider: { defaultProvider: 'claude', providers: {} },
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
    },
    isLoading: false,
    error: null,
    loadPreferences: vi.fn(),
    loadWorkspaces: vi.fn(),
    loadProjects: vi.fn(),
    loadProfiles: vi.fn(),
    loadPresets: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettingsStore.mockReturnValue(mockStore as any);
  });

  it('should render configuration tabs', async () => {
    render(<ConfigurationManager />);

    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
      expect(screen.getByText('LLM Providers')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('UI')).toBeInTheDocument();
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Profiles')).toBeInTheDocument();
      expect(screen.getByText('Import/Export')).toBeInTheDocument();
    });
  });

  it('should load data on mount', async () => {
    render(<ConfigurationManager />);

    await waitFor(() => {
      expect(mockStore.loadPreferences).toHaveBeenCalled();
      expect(mockStore.loadWorkspaces).toHaveBeenCalled();
      expect(mockStore.loadProjects).toHaveBeenCalled();
      expect(mockStore.loadProfiles).toHaveBeenCalled();
      expect(mockStore.loadPresets).toHaveBeenCalled();
    });
  });

  it('should show loading state', () => {
    mockUseSettingsStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
    } as any);

    render(<ConfigurationManager />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    const user = userEvent.setup();
    render(<ConfigurationManager />);

    // Initially shows General preferences
    expect(screen.getByTestId('general-preferences')).toBeInTheDocument();

    // Click on Analysis tab
    await user.click(screen.getByText('Analysis'));
    expect(screen.getByTestId('analysis-preferences')).toBeInTheDocument();

    // Click on LLM Providers tab
    await user.click(screen.getByText('LLM Providers'));
    expect(screen.getByTestId('llm-preferences')).toBeInTheDocument();
  });

  it('should handle errors', async () => {
    const mockShowToast = vi.fn();
    vi.doMock('../../../hooks/useToast', () => ({
      useToast: () => ({
        showToast: mockShowToast,
      }),
    }));

    mockUseSettingsStore.mockReturnValue({
      ...mockStore,
      error: 'Test error',
    } as any);

    render(<ConfigurationManager />);

    await waitFor(() => {
      expect(mockStore.clearError).toHaveBeenCalled();
    });
  });

  it('should render all preference components', async () => {
    const user = userEvent.setup();
    render(<ConfigurationManager />);

    // Test each tab
    const tabs = [
      { name: 'General', testId: 'general-preferences' },
      { name: 'Analysis', testId: 'analysis-preferences' },
      { name: 'LLM Providers', testId: 'llm-preferences' },
      { name: 'Export', testId: 'export-preferences' },
      { name: 'UI', testId: 'ui-preferences' },
      { name: 'Workspaces', testId: 'workspace-manager' },
      { name: 'Projects', testId: 'project-manager' },
      { name: 'Profiles', testId: 'profile-manager' },
      { name: 'Import/Export', testId: 'import-export' },
    ];

    for (const tab of tabs) {
      await user.click(screen.getByText(tab.name));
      expect(screen.getByTestId(tab.testId)).toBeInTheDocument();
    }
  });
});
