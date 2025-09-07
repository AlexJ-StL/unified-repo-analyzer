/**
 * Configuration Manager Service
 * Handles loading, validation, and runtime updates of logging configuration
 */

import { EventEmitter } from 'node:events';
import {
  CONFIG_SCHEMA,
  type ConfigUpdateResult,
  type ConfigValidationResult,
  DEFAULT_LOGGER_CONFIG,
  FILE_SIZE_UNITS,
  type FileSizeUnit,
  type LogFormat,
  type LoggerConfig,
  type LogLevel,
} from '../types/logging-config.js';

export class ConfigurationManager extends EventEmitter {
  private static instance: ConfigurationManager;
  private currentConfig: LoggerConfig;
  private configPath?: string;
  private watchingConfig = false;

  private constructor() {
    super();
    this.currentConfig = { ...DEFAULT_LOGGER_CONFIG };
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Load configuration from file or use defaults
   */
  public async loadConfiguration(configPath?: string): Promise<LoggerConfig> {
    this.configPath = configPath;

    if (configPath) {
      try {
        // In a real implementation, this would read from file system
        // For now, we'll simulate loading from a configuration source
        const configData = await this.readConfigurationFile(configPath);
        const validationResult = this.validateConfiguration(configData);

        if (!validationResult.isValid) {
          this.currentConfig = { ...DEFAULT_LOGGER_CONFIG };
        } else {
          this.currentConfig = this.mergeWithDefaults(configData);
        }

        if (validationResult.warnings.length > 0) {
        }
      } catch (_error) {
        this.currentConfig = { ...DEFAULT_LOGGER_CONFIG };
      }
    } else {
      this.currentConfig = { ...DEFAULT_LOGGER_CONFIG };
    }

    this.emit('configurationLoaded', this.currentConfig);
    return this.currentConfig;
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): LoggerConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update configuration at runtime
   */
  public async updateConfiguration(updates: Partial<LoggerConfig>): Promise<ConfigUpdateResult> {
    const result: ConfigUpdateResult = {
      success: false,
      errors: [],
      appliedChanges: [],
      requiresRestart: false,
    };

    try {
      // Create updated configuration
      const updatedConfig = { ...this.currentConfig, ...updates };

      // Validate the updated configuration
      const validationResult = this.validateConfiguration(updatedConfig);

      if (!validationResult.isValid) {
        result.errors = validationResult.errors.map((e) => `${e.field}: ${e.message}`);
        return result;
      }

      // Apply changes
      const previousConfig = { ...this.currentConfig };
      this.currentConfig = updatedConfig;

      // Track what changed
      result.appliedChanges = this.getConfigurationDiff(previousConfig, updatedConfig);

      // Check if restart is required (for certain changes like file paths)
      result.requiresRestart = this.requiresRestart(previousConfig, updatedConfig);

      // Persist configuration if path is set
      if (this.configPath) {
        await this.saveConfigurationFile(this.configPath, updatedConfig);
      }

      result.success = true;
      this.emit('configurationUpdated', this.currentConfig, result);
    } catch (error) {
      result.errors.push(
        `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return result;
  }

  /**
   * Validate configuration object
   */
  public validateConfiguration(config: unknown): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Type guard to ensure config is an object
    if (!config || typeof config !== 'object') {
      result.errors.push({
        field: 'config',
        message: 'Configuration must be an object',
        code: 'INVALID_CONFIG_TYPE',
      });
      result.isValid = false;
      return result;
    }

    // Type assertion after validation
    const configObj = config as Record<string, unknown>;

    // Validate required fields
    if (!('level' in configObj) || typeof configObj.level !== 'string' || !CONFIG_SCHEMA.level.enum.includes(configObj.level as LogLevel)) {
      result.errors.push({
        field: 'level',
        message: `Invalid log level. Must be one of: ${CONFIG_SCHEMA.level.enum.join(', ')}`,
        code: 'INVALID_LOG_LEVEL',
      });
    }

    if (!('format' in configObj) || typeof configObj.format !== 'string' || !CONFIG_SCHEMA.format.enum.includes(configObj.format as LogFormat)) {
      result.errors.push({
        field: 'format',
        message: `Invalid log format. Must be one of: ${CONFIG_SCHEMA.format.enum.join(', ')}`,
        code: 'INVALID_LOG_FORMAT',
      });
    }

    if (!('includeStackTrace' in configObj) || typeof configObj.includeStackTrace !== 'boolean') {
      result.errors.push({
        field: 'includeStackTrace',
        message: 'includeStackTrace must be a boolean',
        code: 'INVALID_BOOLEAN',
      });
    }

    if (!('redactSensitiveData' in configObj) || typeof configObj.redactSensitiveData !== 'boolean') {
      result.errors.push({
        field: 'redactSensitiveData',
        message: 'redactSensitiveData must be a boolean',
        code: 'INVALID_BOOLEAN',
      });
    }

    // Validate outputs
    if (!('outputs' in configObj) || !Array.isArray(configObj.outputs) || configObj.outputs.length === 0) {
      result.errors.push({
        field: 'outputs',
        message: 'At least one output must be configured',
        code: 'NO_OUTPUTS',
      });
    } else {
      configObj.outputs.forEach((output: unknown, index: number) => {
        this.validateOutput(output, index, result);
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Parse file size string to bytes
   */
  public parseFileSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([A-Z]{1,2})$/i);
    if (!match) {
      throw new Error(`Invalid file size format: ${sizeStr}`);
    }

    const [, numStr, unitStr] = match;
    const num = Number.parseFloat(numStr);
    const unit = unitStr.toUpperCase() as FileSizeUnit;

    if (!(unit in FILE_SIZE_UNITS)) {
      throw new Error(`Invalid file size unit: ${unit}`);
    }

    return num * FILE_SIZE_UNITS[unit];
  }

  /**
   * Start watching configuration file for changes
   */
  public startConfigurationWatch(): void {
    if (!this.configPath || this.watchingConfig) {
      return;
    }

    this.watchingConfig = true;
    // In a real implementation, this would use fs.watch or similar
    // For now, we'll just emit that watching started
    this.emit('configurationWatchStarted', this.configPath);
  }

  /**
   * Stop watching configuration file
   */
  public stopConfigurationWatch(): void {
    if (!this.watchingConfig) {
      return;
    }

    this.watchingConfig = false;
    this.emit('configurationWatchStopped');
  }

  /**
   * Reset configuration to defaults (primarily for testing)
   */
  public resetToDefaults(): void {
    this.currentConfig = { ...DEFAULT_LOGGER_CONFIG };
    this.configPath = undefined;
    this.watchingConfig = false;
    this.removeAllListeners();
  }

  // Private methods

  private async readConfigurationFile(_path: string): Promise<LoggerConfig> {
    // Simulate reading configuration file
    // In real implementation, this would use fs.readFile
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          level: 'INFO',
          format: 'JSON',
          includeStackTrace: true,
          redactSensitiveData: true,
          outputs: [
            {
              type: 'console',
              enabled: true,
              config: { colorize: true, timestamp: true },
            },
          ],
        });
      }, 10);
    });
  }

  private async saveConfigurationFile(path: string, config: LoggerConfig): Promise<void> {
    // Simulate saving configuration file
    // In real implementation, this would use fs.writeFile
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit('configurationSaved', path, config);
        resolve();
      }, 10);
    });
  }

  private mergeWithDefaults(config: Partial<LoggerConfig>): LoggerConfig {
    return {
      ...DEFAULT_LOGGER_CONFIG,
      ...config,
      outputs: config.outputs || DEFAULT_LOGGER_CONFIG.outputs,
    };
  }

  private validateOutput(output: unknown, index: number, result: ConfigValidationResult): void {
    const fieldPrefix = `outputs[${index}]`;

    // Type guard to check if output has the required properties
    if (!output || typeof output !== 'object') {
      result.errors.push({
        field: fieldPrefix,
        message: 'Output must be an object',
        code: 'INVALID_OUTPUT_TYPE',
      });
      return;
    }

    // Check if output has required properties
    if (!('type' in output) || !['console', 'file', 'external'].includes(output.type as string)) {
      result.errors.push({
        field: `${fieldPrefix}.type`,
        message: 'Output type must be console, file, or external',
        code: 'INVALID_OUTPUT_TYPE',
      });
      return;
    }

    if (!('enabled' in output) || typeof output.enabled !== 'boolean') {
      result.errors.push({
        field: `${fieldPrefix}.enabled`,
        message: 'Output enabled must be a boolean',
        code: 'INVALID_BOOLEAN',
      });
    }

    // Validate type-specific configuration
    if ('type' in output && typeof output.type === 'string') {
      switch (output.type) {
        case 'file':
          if ('config' in output && output.config) {
            this.validateFileConfig(output.config, fieldPrefix, result);
          }
          break;
        case 'external':
          if ('config' in output && output.config) {
            this.validateExternalConfig(output.config, fieldPrefix, result);
          }
          break;
        case 'console':
          if ('config' in output && output.config) {
            this.validateConsoleConfig(output.config, fieldPrefix, result);
          }
          break;
      }
    }
  }

  private validateFileConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    // Type guard for config object
    if (!config || typeof config !== 'object') {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'File config must be an object',
        code: 'INVALID_CONFIG_TYPE',
      });
      return;
    }

    // Check if config has path property
    if (!('path' in config) || typeof config.path !== 'string') {
      result.errors.push({
        field: `${fieldPrefix}.config.path`,
        message: 'File path is required and must be a string',
        code: 'MISSING_FILE_PATH',
      });
      return;
    }

    // Check maxSize if present
    if ('maxSize' in config && config.maxSize) {
      try {
        this.parseFileSize(config.maxSize as string);
      } catch (error) {
        result.errors.push({
          field: `${fieldPrefix}.config.maxSize`,
          message: `Invalid maxSize format: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'INVALID_FILE_SIZE',
        });
      }
    }

    // Check maxFiles if present
    if ('maxFiles' in config && config.maxFiles !== undefined) {
      const maxFiles = config.maxFiles as number;
      if (!Number.isInteger(maxFiles) || maxFiles < 1) {
        result.errors.push({
          field: `${fieldPrefix}.config.maxFiles`,
          message: 'maxFiles must be a positive integer',
          code: 'INVALID_MAX_FILES',
        });
      }
    }
  }

  private validateExternalConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    // Type guard for config object
    if (!config || typeof config !== 'object') {
      result.errors.push({
        field: `${fieldPrefix}.config`,
        message: 'External config must be an object',
        code: 'INVALID_CONFIG_TYPE',
      });
      return;
    }

    // Check if config has endpoint property
    if (!('endpoint' in config) || typeof config.endpoint !== 'string') {
      result.errors.push({
        field: `${fieldPrefix}.config.endpoint`,
        message: 'External endpoint is required and must be a string',
        code: 'MISSING_ENDPOINT',
      });
      return;
    }

    // Check batchSize if present
    if ('batchSize' in config && config.batchSize !== undefined) {
      const batchSize = config.batchSize as number;
      if (!Number.isInteger(batchSize) || batchSize < 1) {
        result.errors.push({
          field: `${fieldPrefix}.config.batchSize`,
          message: 'batchSize must be a positive integer',
          code: 'INVALID_BATCH_SIZE',
        });
      }
    }
  }

  private validateConsoleConfig(
    config: unknown,
    fieldPrefix: string,
    result: ConfigValidationResult
  ): void {
    // Type guard for config object
    if (!config || typeof config !== 'object') {
      result.warnings.push({
        field: `${fieldPrefix}.config`,
        message: 'Console config should be an object',
        suggestion: 'Provide a valid console configuration object',
      });
      return;
    }

    // Check colorize if present
    if (
      'colorize' in config &&
      config.colorize !== undefined &&
      typeof config.colorize !== 'boolean'
    ) {
      result.warnings.push({
        field: `${fieldPrefix}.config.colorize`,
        message: 'colorize should be a boolean',
        suggestion: 'Use true or false for colorize setting',
      });
    }
  }

  private getConfigurationDiff(previous: LoggerConfig, current: LoggerConfig): string[] {
    const changes: string[] = [];

    if (previous.level !== current.level) {
      changes.push(`Log level changed from ${previous.level} to ${current.level}`);
    }

    if (previous.format !== current.format) {
      changes.push(`Log format changed from ${previous.format} to ${current.format}`);
    }

    if (previous.includeStackTrace !== current.includeStackTrace) {
      changes.push(`Stack trace inclusion changed to ${current.includeStackTrace}`);
    }

    if (previous.redactSensitiveData !== current.redactSensitiveData) {
      changes.push(`Sensitive data redaction changed to ${current.redactSensitiveData}`);
    }

    if (previous.outputs.length !== current.outputs.length) {
      changes.push(
        `Number of outputs changed from ${previous.outputs.length} to ${current.outputs.length}`
      );
    }

    return changes;
  }

  private requiresRestart(previous: LoggerConfig, current: LoggerConfig): boolean {
    // Check if any changes require a restart
    // File path changes typically require restart
    const previousFilePaths = previous.outputs
      .filter((o) => o.type === 'file')
      .map((o) => {
        // Type guard to ensure config is FileConfig and has path
        if (typeof o.config === 'object' && o.config !== null && 'path' in o.config) {
          return (o.config as { path: string }).path;
        }
        return '';
      });

    const currentFilePaths = current.outputs
      .filter((o) => o.type === 'file')
      .map((o) => {
        // Type guard to ensure config is FileConfig and has path
        if (typeof o.config === 'object' && o.config !== null && 'path' in o.config) {
          return (o.config as { path: string }).path;
        }
        return '';
      });

    return JSON.stringify(previousFilePaths) !== JSON.stringify(currentFilePaths);
  }
}
