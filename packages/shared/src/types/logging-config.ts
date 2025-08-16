/**
 * Logging configuration types and interfaces
 * Supports configurable log levels, outputs, and runtime updates
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogFormat = 'JSON' | 'TEXT';
export type LogOutputType = 'console' | 'file' | 'external';

export interface LoggerConfig {
  level: LogLevel;
  outputs: LogOutput[];
  format: LogFormat;
  includeStackTrace: boolean;
  redactSensitiveData: boolean;
  requestIdHeader?: string;
  componentName?: string;
}

export interface LogOutput {
  type: LogOutputType;
  enabled: boolean;
  config: ConsoleConfig | FileConfig | ExternalConfig;
}

export interface ConsoleConfig {
  colorize: boolean;
  timestamp: boolean;
  level?: LogLevel; // Override global level for this output
}

export interface FileConfig {
  path: string;
  maxSize: string; // e.g., '10MB', '100KB'
  maxFiles: number;
  rotateDaily: boolean;
  level?: LogLevel; // Override global level for this output
  compress: boolean;
}

export interface ExternalConfig {
  type: 'webhook' | 'syslog' | 'elasticsearch' | 'custom';
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  level?: LogLevel; // Override global level for this output
  batchSize?: number;
  flushInterval?: number; // milliseconds
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ConfigValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface ConfigUpdateResult {
  success: boolean;
  errors: string[];
  appliedChanges: string[];
  requiresRestart: boolean;
}

// Default configuration
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: 'INFO',
  format: 'JSON',
  includeStackTrace: true,
  redactSensitiveData: true,
  requestIdHeader: 'x-request-id',
  componentName: 'unified-repo-analyzer',
  outputs: [
    {
      type: 'console',
      enabled: true,
      config: {
        colorize: true,
        timestamp: true,
      } as ConsoleConfig,
    },
    {
      type: 'file',
      enabled: false,
      config: {
        path: './logs/application.log',
        maxSize: '10MB',
        maxFiles: 5,
        rotateDaily: true,
        compress: true,
      } as FileConfig,
    },
  ],
};

// Configuration schema for validation
export const CONFIG_SCHEMA = {
  level: {
    type: 'string',
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    required: true,
  },
  format: {
    type: 'string',
    enum: ['JSON', 'TEXT'],
    required: true,
  },
  includeStackTrace: {
    type: 'boolean',
    required: true,
  },
  redactSensitiveData: {
    type: 'boolean',
    required: true,
  },
  outputs: {
    type: 'array',
    required: true,
    minItems: 1,
  },
} as const;

// File size parsing utilities
export const FILE_SIZE_UNITS = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

export type FileSizeUnit = keyof typeof FILE_SIZE_UNITS;
