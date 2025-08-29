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
export * from './validation';

// Export all shared types and interfaces

// Export services
// Export utility modules
// Note: error-handling exports are now covered by error-classification types
export {
  type BuildErrorContext,
  type DependencyErrorContext,
  type EnhancedError,
  EnhancedLogger,
  ErrorAnalyzer,
  ErrorHandler,
  type TypeScriptErrorContext,
} from './utils/error-handling';

// Export validation module