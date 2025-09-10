export * from './services/ConfigurationManager';
export * from './types/analysis';
export * from './types/config';
export * from './types/error-classification';
export * from './types/logging-config';
export * from './types/provider';
export * from './types/repository';
export * from './utils/build-utils';
export * from './utils/config-validator';
export * from './utils/error-classifier';
export * from './utils/error-formatter';
export * from './utils/error-handling';
export * from './validation';
export type {
  ErrorContext,
  ClassifiedError,
  ErrorCategory,
  ErrorSeverity,
  ErrorCode,
  ErrorSuggestion,
  ErrorResponse,
  ErrorStatistics,
  ErrorCorrelation,
} from './types/error-classification.js';
export type {
  ConfigurationProfile,
  ConfigurationValidationResult,
  ConfigurationBackup,
  ProjectConfiguration,
  UserPreferences,
  AnalysisModePreset,
  WorkspaceConfiguration,
} from './types/config.js';
export { ErrorClassifier } from './utils/error-classifier.js';
export { errorClassifier } from './utils/error-classifier.js';
export { userPreferencesSchema } from './validation/schemas.js';
export { DEFAULT_ANALYSIS_MODE_PRESETS } from './types/config.js';
export { DEFAULT_USER_PREFERENCES } from './types/config.js';
