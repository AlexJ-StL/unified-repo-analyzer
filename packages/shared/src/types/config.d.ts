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
    cacheTTL: number;
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
    migrate: (config: UserPreferences) => UserPreferences;
}
export interface ConfigurationBackup {
    id: string;
    timestamp: Date;
    version: string;
    preferences: UserPreferences;
    reason: 'manual' | 'auto' | 'migration';
}
export declare const DEFAULT_ANALYSIS_MODE_PRESETS: AnalysisModePreset[];
export declare const DEFAULT_USER_PREFERENCES: UserPreferences;
