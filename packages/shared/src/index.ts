// Export all shared types and interfaces

// Export services
export * from "./services/ConfigurationManager";
export * from "./types/analysis";
export * from "./types/config";
export * from "./types/error-classification";
export * from "./types/logging-config";
export * from "./types/provider";
export * from "./types/repository";
// Export utility modules
export * from "./utils/build-utils";
export * from "./utils/config-validator";
export * from "./utils/error-classifier";
export * from "./utils/error-formatter";
// Note: error-handling exports are now covered by error-classification types
export {
	type BuildErrorContext,
	type DependencyErrorContext,
	type EnhancedError,
	EnhancedLogger,
	ErrorAnalyzer,
	ErrorHandler,
	type TypeScriptErrorContext,
} from "./utils/error-handling";

// Export validation module
export * from "./validation";
