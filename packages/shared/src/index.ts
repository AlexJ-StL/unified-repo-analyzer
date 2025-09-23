export * from './services/ConfigurationManager';
export * from './types/analysis';
export * from './types/config';
export type {
  AnalysisModePreset,
  ConfigurationBackup,
  ConfigurationProfile,
  ConfigurationValidationResult,
  ProjectConfiguration,
  UserPreferences,
  WorkspaceConfiguration,
} from './types/config.js';
// Export default values
export { DEFAULT_ANALYSIS_MODE_PRESETS, DEFAULT_USER_PREFERENCES } from './types/config.js';
export * from './types/error-classification';
// Export specific types that are needed by the backend
export type {
  ClassifiedError,
  ErrorCategory,
  ErrorCode,
  ErrorContext,
  ErrorCorrelation,
  ErrorResponse,
  ErrorSeverity,
  ErrorStatistics,
  ErrorSuggestion,
} from './types/error-classification.js';
export * from './types/logging-config';
export * from './types/provider';
export * from './types/repository';
export * from './utils/build-utils';
export * from './utils/config-validator';
export * from './utils/error-classifier';
export { ErrorClassifier, errorClassifier } from './utils/error-classifier.js';
export * from './utils/error-formatter';
export * from './utils/error-handling';
export * from './utils/path-utils';
export * from './validation';
export { userPreferencesSchema } from './validation/schemas.js';
