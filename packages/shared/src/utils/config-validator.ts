/**
 * Configuration validation utilities
 * Provides detailed validation for logging configuration
 */

import {
	ConfigValidationError,
	type ConfigValidationResult,
	ConfigValidationWarning,
	ConsoleConfig,
	ExternalConfig,
	FileConfig,
	type LogFormat,
	LoggerConfig,
	type LogLevel,
	LogOutput,
	type LogOutputType,
} from "../types/logging-config.js";

export class ConfigValidator {
	private static readonly VALID_LOG_LEVELS: LogLevel[] = [
		"DEBUG",
		"INFO",
		"WARN",
		"ERROR",
	];
	private static readonly VALID_LOG_FORMATS: LogFormat[] = ["JSON", "TEXT"];
	private static readonly VALID_OUTPUT_TYPES: LogOutputType[] = [
		"console",
		"file",
		"external",
	];
	private static readonly VALID_EXTERNAL_TYPES = [
		"webhook",
		"syslog",
		"elasticsearch",
		"custom",
	];

	/**
	 * Validate complete logger configuration
	 */
	public static validateLoggerConfig(config: any): ConfigValidationResult {
		const result: ConfigValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
		};

		if (!config || typeof config !== "object") {
			result.errors.push({
				field: "root",
				message: "Configuration must be an object",
				code: "INVALID_CONFIG_TYPE",
			});
			result.isValid = false;
			return result;
		}

		// Validate top-level properties
		ConfigValidator.validateLogLevel(config.level, result);
		ConfigValidator.validateLogFormat(config.format, result);
		ConfigValidator.validateBooleanField(config, "includeStackTrace", result);
		ConfigValidator.validateBooleanField(config, "redactSensitiveData", result);
		ConfigValidator.validateStringField(
			config,
			"requestIdHeader",
			result,
			false,
		);
		ConfigValidator.validateStringField(config, "componentName", result, false);
		ConfigValidator.validateOutputs(config.outputs, result);

		result.isValid = result.errors.length === 0;
		return result;
	}

	/**
	 * Validate log level
	 */
	private static validateLogLevel(
		level: any,
		result: ConfigValidationResult,
	): void {
		if (level === undefined) {
			result.errors.push({
				field: "level",
				message: "Log level is required",
				code: "MISSING_LOG_LEVEL",
			});
			return;
		}

		if (typeof level !== "string") {
			result.errors.push({
				field: "level",
				message: "Log level must be a string",
				code: "INVALID_LOG_LEVEL_TYPE",
			});
			return;
		}

		if (!ConfigValidator.VALID_LOG_LEVELS.includes(level as LogLevel)) {
			result.errors.push({
				field: "level",
				message: `Invalid log level '${level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(", ")}`,
				code: "INVALID_LOG_LEVEL",
			});
		}
	}

	/**
	 * Validate log format
	 */
	private static validateLogFormat(
		format: any,
		result: ConfigValidationResult,
	): void {
		if (format === undefined) {
			result.errors.push({
				field: "format",
				message: "Log format is required",
				code: "MISSING_LOG_FORMAT",
			});
			return;
		}

		if (typeof format !== "string") {
			result.errors.push({
				field: "format",
				message: "Log format must be a string",
				code: "INVALID_LOG_FORMAT_TYPE",
			});
			return;
		}

		if (!ConfigValidator.VALID_LOG_FORMATS.includes(format as LogFormat)) {
			result.errors.push({
				field: "format",
				message: `Invalid log format '${format}'. Must be one of: ${ConfigValidator.VALID_LOG_FORMATS.join(", ")}`,
				code: "INVALID_LOG_FORMAT",
			});
		}
	}

	/**
	 * Validate boolean field
	 */
	private static validateBooleanField(
		config: any,
		fieldName: string,
		result: ConfigValidationResult,
		required: boolean = true,
	): void {
		const value = config[fieldName];

		if (value === undefined) {
			if (required) {
				result.errors.push({
					field: fieldName,
					message: `${fieldName} is required`,
					code: "MISSING_BOOLEAN_FIELD",
				});
			}
			return;
		}

		if (typeof value !== "boolean") {
			result.errors.push({
				field: fieldName,
				message: `${fieldName} must be a boolean`,
				code: "INVALID_BOOLEAN_TYPE",
			});
		}
	}

	/**
	 * Validate string field
	 */
	private static validateStringField(
		config: any,
		fieldName: string,
		result: ConfigValidationResult,
		required: boolean = true,
	): void {
		const value = config[fieldName];

		if (value === undefined) {
			if (required) {
				result.errors.push({
					field: fieldName,
					message: `${fieldName} is required`,
					code: "MISSING_STRING_FIELD",
				});
			}
			return;
		}

		if (typeof value !== "string") {
			result.errors.push({
				field: fieldName,
				message: `${fieldName} must be a string`,
				code: "INVALID_STRING_TYPE",
			});
		} else if (value.trim().length === 0) {
			result.warnings.push({
				field: fieldName,
				message: `${fieldName} is empty`,
				suggestion: `Provide a meaningful value for ${fieldName}`,
			});
		}
	}

	/**
	 * Validate outputs array
	 */
	private static validateOutputs(
		outputs: any,
		result: ConfigValidationResult,
	): void {
		if (outputs === undefined) {
			result.errors.push({
				field: "outputs",
				message: "Outputs array is required",
				code: "MISSING_OUTPUTS",
			});
			return;
		}

		if (!Array.isArray(outputs)) {
			result.errors.push({
				field: "outputs",
				message: "Outputs must be an array",
				code: "INVALID_OUTPUTS_TYPE",
			});
			return;
		}

		if (outputs.length === 0) {
			result.errors.push({
				field: "outputs",
				message: "At least one output must be configured",
				code: "NO_OUTPUTS_CONFIGURED",
			});
			return;
		}

		// Check for enabled outputs
		const enabledOutputs = outputs.filter(
			(output: any) => output.enabled === true,
		);
		if (enabledOutputs.length === 0) {
			result.warnings.push({
				field: "outputs",
				message: "No outputs are enabled",
				suggestion: "Enable at least one output to see log messages",
			});
		}

		// Validate each output
		outputs.forEach((output: any, index: number) => {
			ConfigValidator.validateOutput(output, index, result);
		});
	}

	/**
	 * Validate individual output configuration
	 */
	private static validateOutput(
		output: any,
		index: number,
		result: ConfigValidationResult,
	): void {
		const fieldPrefix = `outputs[${index}]`;

		if (!output || typeof output !== "object") {
			result.errors.push({
				field: fieldPrefix,
				message: "Output must be an object",
				code: "INVALID_OUTPUT_TYPE",
			});
			return;
		}

		// Validate type
		if (!output.type) {
			result.errors.push({
				field: `${fieldPrefix}.type`,
				message: "Output type is required",
				code: "MISSING_OUTPUT_TYPE",
			});
		} else if (!ConfigValidator.VALID_OUTPUT_TYPES.includes(output.type)) {
			result.errors.push({
				field: `${fieldPrefix}.type`,
				message: `Invalid output type '${output.type}'. Must be one of: ${ConfigValidator.VALID_OUTPUT_TYPES.join(", ")}`,
				code: "INVALID_OUTPUT_TYPE",
			});
		}

		// Validate enabled
		if (typeof output.enabled !== "boolean") {
			result.errors.push({
				field: `${fieldPrefix}.enabled`,
				message: "Output enabled must be a boolean",
				code: "INVALID_ENABLED_TYPE",
			});
		}

		// Validate config based on type
		if (output.config) {
			switch (output.type) {
				case "console":
					ConfigValidator.validateConsoleConfig(
						output.config,
						fieldPrefix,
						result,
					);
					break;
				case "file":
					ConfigValidator.validateFileConfig(
						output.config,
						fieldPrefix,
						result,
					);
					break;
				case "external":
					ConfigValidator.validateExternalConfig(
						output.config,
						fieldPrefix,
						result,
					);
					break;
			}
		} else {
			result.errors.push({
				field: `${fieldPrefix}.config`,
				message: "Output config is required",
				code: "MISSING_OUTPUT_CONFIG",
			});
		}
	}

	/**
	 * Validate console output configuration
	 */
	private static validateConsoleConfig(
		config: any,
		fieldPrefix: string,
		result: ConfigValidationResult,
	): void {
		if (typeof config !== "object") {
			result.errors.push({
				field: `${fieldPrefix}.config`,
				message: "Console config must be an object",
				code: "INVALID_CONSOLE_CONFIG_TYPE",
			});
			return;
		}

		if (config.colorize !== undefined && typeof config.colorize !== "boolean") {
			result.errors.push({
				field: `${fieldPrefix}.config.colorize`,
				message: "colorize must be a boolean",
				code: "INVALID_COLORIZE_TYPE",
			});
		}

		if (
			config.timestamp !== undefined &&
			typeof config.timestamp !== "boolean"
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.timestamp`,
				message: "timestamp must be a boolean",
				code: "INVALID_TIMESTAMP_TYPE",
			});
		}

		if (
			config.level !== undefined &&
			!ConfigValidator.VALID_LOG_LEVELS.includes(config.level)
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.level`,
				message: `Invalid level '${config.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(", ")}`,
				code: "INVALID_OUTPUT_LEVEL",
			});
		}
	}

	/**
	 * Validate file output configuration
	 */
	private static validateFileConfig(
		config: any,
		fieldPrefix: string,
		result: ConfigValidationResult,
	): void {
		if (typeof config !== "object") {
			result.errors.push({
				field: `${fieldPrefix}.config`,
				message: "File config must be an object",
				code: "INVALID_FILE_CONFIG_TYPE",
			});
			return;
		}

		// Validate path
		if (!config.path || typeof config.path !== "string") {
			result.errors.push({
				field: `${fieldPrefix}.config.path`,
				message: "File path is required and must be a string",
				code: "MISSING_FILE_PATH",
			});
		} else if (config.path.trim().length === 0) {
			result.errors.push({
				field: `${fieldPrefix}.config.path`,
				message: "File path cannot be empty",
				code: "EMPTY_FILE_PATH",
			});
		}

		// Validate maxSize
		if (config.maxSize !== undefined) {
			if (typeof config.maxSize !== "string") {
				result.errors.push({
					field: `${fieldPrefix}.config.maxSize`,
					message: 'maxSize must be a string (e.g., "10MB")',
					code: "INVALID_MAX_SIZE_TYPE",
				});
			} else {
				try {
					ConfigValidator.parseFileSize(config.maxSize);
				} catch (error) {
					result.errors.push({
						field: `${fieldPrefix}.config.maxSize`,
						message: `Invalid maxSize format: ${error instanceof Error ? error.message : "Unknown error"}`,
						code: "INVALID_MAX_SIZE_FORMAT",
					});
				}
			}
		}

		// Validate maxFiles
		if (config.maxFiles !== undefined) {
			if (!Number.isInteger(config.maxFiles) || config.maxFiles < 1) {
				result.errors.push({
					field: `${fieldPrefix}.config.maxFiles`,
					message: "maxFiles must be a positive integer",
					code: "INVALID_MAX_FILES",
				});
			}
		}

		// Validate boolean fields
		if (
			config.rotateDaily !== undefined &&
			typeof config.rotateDaily !== "boolean"
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.rotateDaily`,
				message: "rotateDaily must be a boolean",
				code: "INVALID_ROTATE_DAILY_TYPE",
			});
		}

		if (config.compress !== undefined && typeof config.compress !== "boolean") {
			result.errors.push({
				field: `${fieldPrefix}.config.compress`,
				message: "compress must be a boolean",
				code: "INVALID_COMPRESS_TYPE",
			});
		}

		if (
			config.level !== undefined &&
			!ConfigValidator.VALID_LOG_LEVELS.includes(config.level)
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.level`,
				message: `Invalid level '${config.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(", ")}`,
				code: "INVALID_OUTPUT_LEVEL",
			});
		}
	}

	/**
	 * Validate external output configuration
	 */
	private static validateExternalConfig(
		config: any,
		fieldPrefix: string,
		result: ConfigValidationResult,
	): void {
		if (typeof config !== "object") {
			result.errors.push({
				field: `${fieldPrefix}.config`,
				message: "External config must be an object",
				code: "INVALID_EXTERNAL_CONFIG_TYPE",
			});
			return;
		}

		// Validate type
		if (
			config.type &&
			!ConfigValidator.VALID_EXTERNAL_TYPES.includes(config.type)
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.type`,
				message: `Invalid external type '${config.type}'. Must be one of: ${ConfigValidator.VALID_EXTERNAL_TYPES.join(", ")}`,
				code: "INVALID_EXTERNAL_TYPE",
			});
		}

		// Validate endpoint
		if (!config.endpoint || typeof config.endpoint !== "string") {
			result.errors.push({
				field: `${fieldPrefix}.config.endpoint`,
				message: "External endpoint is required and must be a string",
				code: "MISSING_EXTERNAL_ENDPOINT",
			});
		} else if (config.endpoint.trim().length === 0) {
			result.errors.push({
				field: `${fieldPrefix}.config.endpoint`,
				message: "External endpoint cannot be empty",
				code: "EMPTY_EXTERNAL_ENDPOINT",
			});
		} else {
			// Basic URL validation
			try {
				new URL(config.endpoint);
			} catch {
				result.warnings.push({
					field: `${fieldPrefix}.config.endpoint`,
					message: "Endpoint does not appear to be a valid URL",
					suggestion: "Ensure the endpoint is a valid HTTP/HTTPS URL",
				});
			}
		}

		// Validate optional fields
		if (config.batchSize !== undefined) {
			if (!Number.isInteger(config.batchSize) || config.batchSize < 1) {
				result.errors.push({
					field: `${fieldPrefix}.config.batchSize`,
					message: "batchSize must be a positive integer",
					code: "INVALID_BATCH_SIZE",
				});
			}
		}

		if (config.flushInterval !== undefined) {
			if (
				!Number.isInteger(config.flushInterval) ||
				config.flushInterval < 100
			) {
				result.errors.push({
					field: `${fieldPrefix}.config.flushInterval`,
					message: "flushInterval must be an integer >= 100 milliseconds",
					code: "INVALID_FLUSH_INTERVAL",
				});
			}
		}

		if (
			config.level !== undefined &&
			!ConfigValidator.VALID_LOG_LEVELS.includes(config.level)
		) {
			result.errors.push({
				field: `${fieldPrefix}.config.level`,
				message: `Invalid level '${config.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(", ")}`,
				code: "INVALID_OUTPUT_LEVEL",
			});
		}
	}

	/**
	 * Parse file size string to bytes
	 */
	private static parseFileSize(sizeStr: string): number {
		const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([A-Z]{1,2})$/i);
		if (!match) {
			throw new Error(
				`Invalid file size format: ${sizeStr}. Expected format: "10MB", "1.5GB", etc.`,
			);
		}

		const [, numStr, unitStr] = match;
		const num = parseFloat(numStr);
		const unit = unitStr.toUpperCase();

		const units: Record<string, number> = {
			B: 1,
			KB: 1024,
			MB: 1024 * 1024,
			GB: 1024 * 1024 * 1024,
		};

		if (!(unit in units)) {
			throw new Error(
				`Invalid file size unit: ${unit}. Supported units: B, KB, MB, GB`,
			);
		}

		if (num <= 0) {
			throw new Error(`File size must be positive: ${sizeStr}`);
		}

		return num * units[unit];
	}
}
