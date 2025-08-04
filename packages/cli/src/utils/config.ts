import {
  type AnalysisOptions,
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from '@unified-repo-analyzer/shared';
import Conf from 'conf';

interface CLIConfigSchema {
  apiUrl: string;
  defaultOptions: Partial<AnalysisOptions>;
  outputDir: string;
  userPreferences: UserPreferences;
  profiles?: Record<string, any>;
  activeProfile?: string;
}

// Create config instance with defaults
const config = new Conf<CLIConfigSchema>({
  projectName: 'unified-repo-analyzer',
  defaults: {
    apiUrl: 'http://localhost:3000/api',
    defaultOptions: {
      mode: 'standard',
      maxFiles: 500,
      maxLinesPerFile: 1000,
      includeLLMAnalysis: true,
      llmProvider: 'claude',
      outputFormats: ['json'],
      includeTree: true,
    },
    outputDir: './analysis-results',
    userPreferences: DEFAULT_USER_PREFERENCES,
  },
});

/**
 * Get effective analysis options from user preferences
 */
export function getEffectiveAnalysisOptions(): AnalysisOptions {
  const preferences = config.get('userPreferences');
  const defaultOptions = config.get('defaultOptions');

  return {
    mode: preferences.analysis.defaultMode,
    maxFiles: preferences.analysis.maxFiles,
    maxLinesPerFile: preferences.analysis.maxLinesPerFile,
    includeLLMAnalysis: preferences.analysis.includeLLMAnalysis,
    llmProvider: preferences.llmProvider.defaultProvider,
    outputFormats: [preferences.export.defaultFormat],
    includeTree: preferences.analysis.includeTree,
    ...defaultOptions,
  };
}

/**
 * Update user preferences
 */
export function updateUserPreferences(preferences: Partial<UserPreferences>): void {
  const current = config.get('userPreferences');
  config.set('userPreferences', { ...current, ...preferences });
}

/**
 * Get user preferences
 */
export function getUserPreferences(): UserPreferences {
  return config.get('userPreferences');
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
  config.set('userPreferences', DEFAULT_USER_PREFERENCES);
}

export default config;
