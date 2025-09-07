/**
 * Configuration validation utilities
 * Provides detailed validation for logging configuration
 */

import type {
  ConfigValidationResult,
  LogFormat,
  LogLevel,
  LogOutputType,
  LoggerConfig,
} from '../types/logging-config.js';

export class ConfigValidator {
  private static readonly VALID_LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  private static readonly VALID_LOG_FORMATS: LogFormat[] = ['JSON', 'TEXT'];
  private static readonly VALID_OUTPUT_TYPES: LogOutputType[] = ['console', 'file', 'external'];
  private static readonly VALID_EXTERNAL_TYPES = ['webhook', 'syslog', 'elasticsearch', 'custom'];

  /**
   * Validate complete logger configuration
   */
  public static validateLoggerConfig(config: unknown): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.errors.push({
        field: 'root',
        message: 'Configuration must be an object',
        code: 'INVALID_CONFIG_TYPE',
      });
      result.isValid = false;
      return result;
    }

    // Type guard to ensure config has the required properties
    const configObj = config as Partial<LoggerConfig>;

    // Validate top-level properties
    ConfigValidator.validateLogLevel(configObj.level, result);
    ConfigValidator.validateLogFormat(configObj.format, result);
    ConfigValidator.validateBooleanField(configObj, 'includeStackTrace', result);
    ConfigValidator.validateBooleanField(configObj, 'redactSensitiveData', result);
    ConfigValidator.validateStringField(configObj, 'requestIdHeader', result, false);
    ConfigValidator.validateStringField(configObj, 'componentName', result, false);
    ConfigValidator.validateOutputs(configObj.outputs, result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate log level
   */
  private static validateLogLevel(level: unknown, result: ConfigValidationResult): void {
    if (level === undefined) {
      result.errors.push({
        field: 'level',
        message: 'Log level is required',
        code: 'MISSING_LOG_LEVEL',
      });
      return;
    }

    if (typeof level !== 'string') {
      result.errors.push({
        field: 'level',
        message: 'Log level must be a string',
        code: 'INVALID_LOG_LEVEL_TYPE',
      });
      return;
    }

    if (!ConfigValidator.VALID_LOG_LEVELS.includes(level as LogLevel)) {
      result.errors.push({
        field: 'level',
        message: `Invalid log level '${level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(', ')}`,
        code: 'INVALID_LOG_LEVEL',
      });
    }
  }

  /**
   * Validate log format
   */
  private static validateLogFormat(format: unknown, result: ConfigValidationResult): void {
    if (format === undefined) {
      result.errors.push({
        field: 'format',
        message: 'Log format is required',
        code: 'MISSING_LOG_FORMAT',
      });
      return;
    }

    if (typeof format !== 'string') {
      result.errors.push({
        field: 'format',
        message: 'Log format must be a string',
        code: 'INVALID_LOG_FORMAT_TYPE',
      });
      return;
    }

    if (!ConfigValidator.VALID_LOG_FORMATS.includes(format as LogFormat)) {
      result.errors.push({
        field: 'format',
        message: `Invalid log format '${format}'. Must be one of: ${ConfigValidator.VALID_LOG_FORMATS.join(', ')}`,
        code: 'INVALID_LOG_FORMAT',
      });
    }
  }

  /**
   * Validate boolean field
   */
  private static validateBooleanField(
    config: Record<string, unknown>,
    fieldName: string,
    result: ConfigValidationResult,
    required = true
  ): void {
    const value = config[fieldName];

    if (value === undefined) {
      if (required) {
        result.errors.push({
          field: fieldName,
          message: `${fieldName} is required`,
          code: 'MISSING_BOOLEAN_FIELD',
        });
      }
      return;
    }

    if (typeof value !== 'boolean') {
      result.errors.push({
        field: fieldName,
        message: `${fieldName} must be a boolean`,
        code: 'INVALID_BOOLEAN_TYPE',
      });
    }
  }

  /**
   * Validate string field
   */
  private static validateStringField(
    config: Record<string, unknown>,
    fieldName: string,
    result: ConfigValidationResult,
    required = true
  ): void {
    const value = config[fieldName];

    if (value === undefined) {
      if (required) {
        result.errors.push({
          field: fieldName,
          message: `${fieldName} is required`,
          code: 'MISSING_STRING_FIELD',
        });
      }
      return;
    }

    if (typeof value !== 'string') {
      result.errors.push({
        field: fieldName,
        message: `${fieldName} must be a string`,
        code: 'INVALID_STRING_TYPE',
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
  private static validateOutputs(outputs: unknown, result: ConfigValidationResult): void {
    if (outputs === undefined) {
      result.errors.push({
        field: 'outputs',
        message: 'Outputs array is required',
        code: 'MISSING_OUTPUTS',
      });
      return;
    }

    if (!Array.isArray(outputs)) {
      result.errors.push({
        field: 'outputs',
        message: 'Outputs must be an array',
        code: 'INVALID_OUTPUTS_TYPE',
      });
      return;
    }

    if (outputs.length === 0) {
      result.errors.push({
        field: 'outputs',
        message: 'At least one output must be configured',
        code: 'NO_OUTPUTS_CONFIGURED',
      });
      return;
    }

    // Check for enabled outputs
    const enabledOutputs = (outputs as unknown[]).filter((output) => {
      if (typeof output === 'object' && output !== null) {
        const outputObj = output as Record<string, unknown>;
        return outputObj.enabled === true;
      }
      return false;
    });
    if (enabledOutputs.length === 0) {
      result.warnings.push({
        field: 'outputs',
        message: 'No outputs are enabled',
        suggestion: 'Enable at least one output to see log messages',
      });
    }

    // Validate each output
    (outputs as unknown[]).forEach((output, index) => {
      ConfigValidator.validateOutput(output, index, result);
    });
  }

  /**
   * Validate individual output configuration
   */
  private static validateOutput(
    output: unknown,
    index: number,
    result: ConfigValidationResult
  ): void {
    const fieldPrefix = `outputs[${index}]`;

    if (!output || typeof output !== 'object') {
      result.errors.push({
        field: fieldPrefix,
        message: 'Output must be an object',
        code: 'INVALID_OUTPUT_TYPE',
      });
      return;
    }

    // Type cast for property access
    const outputObj = output as Record<string, unknown>;

    // Validate type
    if (!outputObj.type) {
      result.errors.push({
        field: `${fieldPrefix}.type`,
        message: 'Output type is required',
        code: 'MISSING_OUTPUT_TYPE',
      });
    } else if (
      typeof outputObj.type === 'string' &&
      !ConfigValidator.VALID_OUTPUT_TYPES.includes(outputObj.type as LogOutputType)
    ) {
      result.errors.push({
        field: `${fieldPrefix}.type`,
        message: `Invalid output type '${outputObj.type}'. Must be one of: ${ConfigValidator.VALID_OUTPUT_TYPES.join(', ')}`,
        code: 'INVALID_OUTPUT_TYPE',
      });
    }

    // Validate enabled
    if (typeof outputObj.enabled !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.enabled`,
        message: 'Output enabled must be a boolean',
        code: 'INVALID_ENABLED_TYPE',
      });
    }

    // Validate config based on type
    if (outputObj.config) {
      const type = outputObj.type as string;
      switch (type) {
        case 'console':
          ConfigValidator.validateConsoleConfig(outputObj.config, fieldPrefix, result);
          break;
        case 'file':
          ConfigValidator.validateFileConfig(outputObj.config, fieldPrefix, result);
          break;
        case 'external':
          ConfigValidator.validateExternalConfig(outputObj.config, fieldPrefix, result);
          break;
      }
    } else {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'Output config is required',
        code: 'MISSING_OUTPUT_CONFIG',
      });
    }
  }

  /**
   * Validate console output configuration
   */
  private static validateConsoleConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    if (typeof config !== 'object' || config === null) {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'Console config must be an object',
        code: 'INVALID_CONSOLE_CONFIG_TYPE',
      });
      return;
    }

    const configObj = config as Record<string, unknown>;

    if (configObj.colorize !== undefined && typeof configObj.colorize !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.config.colorize`,
        message: 'colorize must be a boolean',
        code: 'INVALID_COLORIZE_TYPE',
      });
    }

    if (configObj.timestamp !== undefined && typeof configObj.timestamp !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.config.timestamp`,
        message: 'timestamp must be a boolean',
        code: 'INVALID_TIMESTAMP_TYPE',
      });
    }

    if (
      configObj.level !== undefined &&
      typeof configObj.level === 'string' &&
      !ConfigValidator.VALID_LOG_LEVELS.includes(configObj.level as LogLevel)
    ) {
      result.errors.push({
        field: `${fieldPrefix}.config.level`,
        message: `Invalid level '${configObj.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(', ')}`,
        code: 'INVALID_OUTPUT_LEVEL',
      });
    }
  }

  /**
   * Validate file output configuration
   */
  private static validateFileConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    if (typeof config !== 'object' || config === null) {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'File config must be an object',
        code: 'INVALID_FILE_CONFIG_TYPE',
      });
      return;
    }

    const configObj = config as Record<string, unknown>;

    // Validate path
    if (!configObj.path || typeof configObj.path !== 'string') {
      result.errors.push({
        field: `${fieldPrefix}.config.path`,
        message: 'File path is required and must be a string',
        code: 'MISSING_FILE_PATH',
      });
    } else if (typeof configObj.path === 'string' && configObj.path.trim().length === 0) {
      result.errors.push({
        field: `${fieldPrefix}.config.path`,
        message: 'File path cannot be empty',
        code: 'EMPTY_FILE_PATH',
      });
    }

    // Validate maxSize
    if (configObj.maxSize !== undefined) {
      if (typeof configObj.maxSize !== 'string') {
        result.errors.push({
          field: `${fieldPrefix}.config.maxSize`,
          message: 'maxSize must be a string (e.g., "10MB")',
          code: 'INVALID_MAX_SIZE_TYPE',
        });
      } else {
        try {
          ConfigValidator.parseFileSize(configObj.maxSize);
        } catch (error) {
          result.errors.push({
            field: `${fieldPrefix}.config.maxSize`,
            message: `Invalid maxSize format: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'INVALID_MAX_SIZE_FORMAT',
          });
        }
      }
    }

    // Validate maxFiles
    if (configObj.maxFiles !== undefined) {
      if (
        typeof configObj.maxFiles === 'number' &&
        (!Number.isInteger(configObj.maxFiles) || configObj.maxFiles < 1)
      ) {
        result.errors.push({
          field: `${fieldPrefix}.config.maxFiles`,
          message: 'maxFiles must be a positive integer',
          code: 'INVALID_MAX_FILES',
        });
      }
    }

    // Validate boolean fields
    if (configObj.rotateDaily !== undefined && typeof configObj.rotateDaily !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.config.rotateDaily`,
        message: 'rotateDaily must be a boolean',
        code: 'INVALID_ROTATE_DAILY_TYPE',
      });
    }

    if (configObj.compress !== undefined && typeof configObj.compress !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.config.compress`,
        message: 'compress must be a boolean',
        code: 'INVALID_COMPRESS_TYPE',
      });
    }

    if (
      configObj.level !== undefined &&
      typeof configObj.level === 'string' &&
      !ConfigValidator.VALID_LOG_LEVELS.includes(configObj.level as LogLevel)
    ) {
      result.errors.push({
        field: `${fieldPrefix}.config.level`,
        message: `Invalid level '${configObj.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(', ')}`,
        code: 'INVALID_OUTPUT_LEVEL',
      });
    }
  }

  /**
   * Validate external output configuration
   */
  private static validateExternalConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    if (typeof config !== 'object' || config === null) {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'External config must be an object',
        code: 'INVALID_EXTERNAL_CONFIG_TYPE',
      });
      return;
    }

    const configObj = config as Record<string, unknown>;

    // Validate type
    if (
      configObj.type &&
      typeof configObj.type === 'string' &&
      !ConfigValidator.VALID_EXTERNAL_TYPES.includes(configObj.type)
    ) {
      result.errors.push({
        field: `${fieldPrefix}.config.type`,
        message: `Invalid external type '${configObj.type}'. Must be one of: ${ConfigValidator.VALID_EXTERNAL_TYPES.join(', ')}`,
        code: 'INVALID_EXTERNAL_TYPE',
      });
    }

    // Validate endpoint
    if (!configObj.endpoint || typeof configObj.endpoint !== 'string') {
      result.errors.push({
        field: `${fieldPrefix}.config.endpoint`,
        message: 'External endpoint is required and must be a string',
        code: 'MISSING_EXTERNAL_ENDPOINT',
      });
    } else if (typeof configObj.endpoint === 'string' && configObj.endpoint.trim().length === 0) {
      result.errors.push({
        field: `${fieldPrefix}.config.endpoint`,
        message: 'External endpoint cannot be empty',
        code: 'EMPTY_EXTERNAL_ENDPOINT',
      });
    } else {
      // Basic URL validation
      try {
        new URL(configObj.endpoint as string);
      } catch {
        result.warnings.push({
          field: `${fieldPrefix}.config.endpoint`,
          message: 'Endpoint does not appear to be a valid URL',
          suggestion: 'Ensure the endpoint is a valid HTTP/HTTPS URL',
        });
      }
    }

    // Validate optional fields
    if (configObj.batchSize !== undefined) {
      if (
        typeof configObj.batchSize === 'number' &&
        (!Number.isInteger(configObj.batchSize) || configObj.batchSize < 1)
      ) {
        result.errors.push({
          field: `${fieldPrefix}.config.batchSize`,
          message: 'batchSize must be a positive integer',
          code: 'INVALID_BATCH_SIZE',
        });
      }
    }

    if (configObj.flushInterval !== undefined) {
      if (
        typeof configObj.flushInterval === 'number' &&
        (!Number.isInteger(configObj.flushInterval) || configObj.flushInterval < 100)
      ) {
        result.errors.push({
          field: `${fieldPrefix}.config.flushInterval`,
          message: 'flushInterval must be an integer >= 100 milliseconds',
          code: 'INVALID_FLUSH_INTERVAL',
        });
      }
    }

    if (
      configObj.level !== undefined &&
      typeof configObj.level === 'string' &&
      !ConfigValidator.VALID_LOG_LEVELS.includes(configObj.level as LogLevel)
    ) {
      result.errors.push({
        field: `${fieldPrefix}.config.level`,
        message: `Invalid level '${configObj.level}'. Must be one of: ${ConfigValidator.VALID_LOG_LEVELS.join(', ')}`,
        code: 'INVALID_OUTPUT_LEVEL',
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
        `Invalid file size format: ${sizeStr}. Expected format: "10MB", "1.5GB", etc.`
      );
    }

    const [, numStr, unitStr] = match;
    const num = Number.parseFloat(numStr);
    const unit = unitStr.toUpperCase();

    const units: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    if (!(unit in units)) {
      throw new Error(`Invalid file size unit: ${unit}. Supported units: B, KB, MB, GB`);
    }

    if (num <= 0) {
      throw new Error(`File size must be positive: ${sizeStr}`);
    }

    return num * units[unit];
  }
}
