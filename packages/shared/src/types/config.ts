/**
 * Configuration-related interfaces and types
 */

import { AnalysisMode, OutputFormat } from './analysis';

export interface UserPreferences {
  general: GeneralPreferences;
  analysis: AnalysisPreferences;
  llmProvider: LLMProviderPreferences;
  export: ExportPreferences;
  ui: UIPreferences;
}

export interface GeneralPreferences {
  defaultWorkspace?: string;
  autoSave: boolean;
  autoIndex: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface AnalysisPreferences {
  defaultMode: AnalysisMode;
  maxFiles: number;
  maxLinesPerFile: number;
  includeLLMAnalysis: boolean;
  includeTree: boolean;
  ignorePatterns: string[];
  maxFileSize: number;
  cacheDirectory: string;
  cacheTTL: number; // in hours
}

export interface LLMProviderPreferences {
  defaultProvider: string;
  providers: Record<string, ProviderConfiguration>;
}

export interface ProviderConfiguration {
  name: string;
  apiKey?: string;
  model?: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  customEndpoint?: string;
}

export interface ExportPreferences {
  defaultFormat: OutputFormat;
  outputDirectory: string;
  includeMetadata: boolean;
  compressLargeFiles: boolean;
  customTemplates: Record<string, string>;
}

export interface UIPreferences {
  compactMode: boolean;
  showAdvancedOptions: boolean;
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  enableAnimations: boolean;
}

export interface AnalysisModePreset {
  name: AnalysisMode;
  displayName: string;
  description: string;
  maxFiles: number;
  maxLinesPerFile: number;
  includeLLMAnalysis: boolean;
  includeTree: boolean;
  estimatedTime: string;
  recommended: boolean;
}

export interface WorkspaceConfiguration {
  id: string;
  name: string;
  path: string;
  preferences: Partial<UserPreferences>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectConfiguration {
  id: string;
  name: string;
  path: string;
  workspaceId?: string;
  preferences: Partial<UserPreferences>;
  customIgnorePatterns?: string[];
  customAnalysisOptions?: Partial<AnalysisPreferences>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationProfile {
  id: string;
  name: string;
  description: string;
  preferences: UserPreferences;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationValidationResult {
  isValid: boolean;
  errors: ConfigurationError[];
  warnings: ConfigurationWarning[];
}

export interface ConfigurationError {
  field: string;
  message: string;
  code: string;
}

export interface ConfigurationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ConfigurationMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (config: any) => UserPreferences;
}

export interface ConfigurationBackup {
  id: string;
  timestamp: Date;
  version: string;
  preferences: UserPreferences;
  reason: 'manual' | 'auto' | 'migration';
}

export const DEFAULT_ANALYSIS_MODE_PRESETS: AnalysisModePreset[] = [
  {
    name: 'quick',
    displayName: 'Quick Analysis',
    description: 'Fast overview focusing on structure and basic metrics',
    maxFiles: 100,
    maxLinesPerFile: 500,
    includeLLMAnalysis: false,
    includeTree: true,
    estimatedTime: '< 1 minute',
    recommended: false,
  },
  {
    name: 'standard',
    displayName: 'Standard Analysis',
    description: 'Balanced analysis with LLM insights and comprehensive metrics',
    maxFiles: 500,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    includeTree: true,
    estimatedTime: '2-5 minutes',
    recommended: true,
  },
  {
    name: 'comprehensive',
    displayName: 'Comprehensive Analysis',
    description: 'Deep analysis with full LLM processing and detailed insights',
    maxFiles: 2000,
    maxLinesPerFile: 5000,
    includeLLMAnalysis: true,
    includeTree: true,
    estimatedTime: '10-30 minutes',
    recommended: false,
  },
];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  general: {
    autoSave: true,
    autoIndex: true,
    enableNotifications: true,
    theme: 'system',
    language: 'en',
  },
  analysis: {
    defaultMode: 'standard',
    maxFiles: 500,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    includeTree: true,
    ignorePatterns: [
      'node_modules/',
      '.git/',
      '.svn/',
      '.hg/',
      'dist/',
      'build/',
      'coverage/',
      '*.log',
      '*.tmp',
      '.DS_Store',
      'Thumbs.db',
    ],
    maxFileSize: 1024 * 1024, // 1MB
    cacheDirectory: '~/.repo-analyzer/cache',
    cacheTTL: 24, // 24 hours
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
      gemini: {
        name: 'Gemini',
        maxTokens: 8000,
        temperature: 0.7,
        enabled: true,
      },
      mock: {
        name: 'Mock Provider',
        maxTokens: 8000,
        temperature: 0.7,
        enabled: true,
      },
    },
  },
  export: {
    defaultFormat: 'json',
    outputDirectory: './analysis-results',
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
};
