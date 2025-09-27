/**
 * Configuration Manager Tests
 * Tests for logging configuration management, validation, and runtime updates
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockFunction, mockManager } from '../../../tests/MockManager';
import { ConfigurationManager } from '../src/services/ConfigurationManager.js';
import {
  DEFAULT_LOGGER_CONFIG,
  type LoggerConfig,
  type LogLevel,
} from '../src/types/logging-config.js';
import { ConfigValidator } from '../src/utils/config-validator.js';

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    mockManager.setupMocks();
    // Get fresh instance for each test
    configManager = ConfigurationManager.getInstance();
    // Reset to default configuration for each test
    configManager.resetToDefaults();
  });

  afterEach(() => {
    // Clean up event listeners and state
    configManager.resetToDefaults();
    mockManager.cleanupMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Loading', () => {
    it('should load default configuration when no path provided', async () => {
      const config = await configManager.loadConfiguration();

      expect(config).toEqual(DEFAULT_LOGGER_CONFIG);
      expect(config.level).toBe('INFO');
      expect(config.format).toBe('JSON');
      expect(config.outputs).toHaveLength(2);
    });

    it('should emit configurationLoaded event', async () => {
      const eventSpy = mockFunction();
      configManager.on('configurationLoaded', eventSpy);

      await configManager.loadConfiguration();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'INFO',
          format: 'JSON',
        })
      );
    });

    it('should return current configuration', () => {
      const config = configManager.getConfiguration();
      expect(config).toEqual(DEFAULT_LOGGER_CONFIG);
    });

    it('should return a copy of configuration to prevent mutation', () => {
      const config1 = configManager.getConfiguration();
      const config2 = configManager.getConfiguration();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different objects
    });
  });

  describe('Configuration Updates', () => {
    it('should update log level successfully', async () => {
      const result = await configManager.updateConfiguration({
        level: 'DEBUG',
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.appliedChanges).toContain('Log level changed from INFO to DEBUG');

      const config = configManager.getConfiguration();
      expect(config.level).toBe('DEBUG');
    });

    it('should update multiple properties', async () => {
      const result = await configManager.updateConfiguration({
        level: 'ERROR',
        format: 'TEXT',
        includeStackTrace: false,
      });

      expect(result.success).toBe(true);
      expect(result.appliedChanges).toHaveLength(3);

      const config = configManager.getConfiguration();
      expect(config.level).toBe('ERROR');
      expect(config.format).toBe('TEXT');
      expect(config.includeStackTrace).toBe(false);
    });

    it('should reject invalid configuration updates', async () => {
      const result = await configManager.updateConfiguration({
        level: 'INVALID_LEVEL' as LogLevel,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid log level');

      // Configuration should remain unchanged
      const config = configManager.getConfiguration();
      expect(config.level).toBe('INFO');
    });

    it('should emit configurationUpdated event on successful update', async () => {
      const eventSpy = mockFunction();
      configManager.on('configurationUpdated', eventSpy);

      await configManager.updateConfiguration({ level: 'WARN' });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'WARN' }),
        expect.objectContaining({ success: true })
      );
    });

    it('should detect when restart is required', async () => {
      const result = await configManager.updateConfiguration({
        outputs: [
          {
            type: 'file',
            enabled: true,
            config: {
              path: './logs/new-path.log',
              maxSize: '5MB',
              maxFiles: 3,
              rotateDaily: false,
              compress: false,
            },
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.requiresRestart).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
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
      };

      const result = configManager.validateConfiguration(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidConfig = {
        format: 'JSON',
        // Missing level, includeStackTrace, redactSensitiveData, outputs
      };

      const result = configManager.validateConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'level')).toBe(true);
    });

    it('should validate file size parsing', () => {
      expect(configManager.parseFileSize('10MB')).toBe(10 * 1024 * 1024);
      expect(configManager.parseFileSize('1.5GB')).toBe(1.5 * 1024 * 1024 * 1024);
      expect(configManager.parseFileSize('500KB')).toBe(500 * 1024);
      expect(configManager.parseFileSize('1024B')).toBe(1024);
    });

    it('should reject invalid file size formats', () => {
      expect(() => configManager.parseFileSize('invalid')).toThrow();
      expect(() => configManager.parseFileSize('10XB')).toThrow();
      expect(() => configManager.parseFileSize('MB')).toThrow();
    });
  });

  describe('Configuration Watching', () => {
    it('should start configuration watching', () => {
      const eventSpy = mockFunction();
      configManager.on('configurationWatchStarted', eventSpy);

      // Load configuration with a path first
      configManager.loadConfiguration('./test-config.json');
      configManager.startConfigurationWatch();

      expect(eventSpy).toHaveBeenCalledWith('./test-config.json');
    });

    it('should stop configuration watching', () => {
      const eventSpy = mockFunction();
      configManager.on('configurationWatchStopped', eventSpy);

      configManager.loadConfiguration('./test-config.json');
      configManager.startConfigurationWatch();
      configManager.stopConfigurationWatch();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should not start watching without config path', () => {
      const eventSpy = mockFunction();
      configManager.on('configurationWatchStarted', eventSpy);

      configManager.startConfigurationWatch();

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration update errors gracefully', async () => {
      // Force an error by providing invalid outputs
      const result = await configManager.updateConfiguration({
        outputs: [] as LoggerConfig['outputs'],
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should preserve original configuration on update failure', async () => {
      const originalConfig = configManager.getConfiguration();

      await configManager.updateConfiguration({
        level: 'INVALID' as LogLevel,
      });

      const currentConfig = configManager.getConfiguration();
      expect(currentConfig).toEqual(originalConfig);
    });
  });

  describe('Configuration Merging', () => {
    it('should merge partial updates with existing configuration', async () => {
      // First update
      await configManager.updateConfiguration({
        level: 'DEBUG',
        includeStackTrace: false,
      });

      // Second update should preserve first update
      await configManager.updateConfiguration({
        format: 'TEXT',
      });

      const config = configManager.getConfiguration();
      expect(config.level).toBe('DEBUG');
      expect(config.format).toBe('TEXT');
      expect(config.includeStackTrace).toBe(false);
    });
  });
});

describe('ConfigValidator', () => {
  describe('Logger Configuration Validation', () => {
    it('should validate complete valid configuration', () => {
      const validConfig: LoggerConfig = {
        level: 'INFO',
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
        outputs: [
          {
            type: 'console',
            enabled: true,
            config: {
              colorize: true,
              timestamp: true,
            },
          },
          {
            type: 'file',
            enabled: true,
            config: {
              path: './logs/app.log',
              maxSize: '10MB',
              maxFiles: 5,
              rotateDaily: true,
              compress: true,
            },
          },
        ],
      };

      const result = ConfigValidator.validateLoggerConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid log levels', () => {
      const invalidConfig = {
        level: 'INVALID_LEVEL',
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
        outputs: [
          {
            type: 'console',
            enabled: true,
            config: { colorize: true },
          },
        ],
      };

      const result = ConfigValidator.validateLoggerConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_LOG_LEVEL')).toBe(true);
    });

    it('should detect missing required fields', () => {
      const incompleteConfig = {
        level: 'INFO',
        // Missing format, includeStackTrace, redactSensitiveData, outputs
      };

      const result = ConfigValidator.validateLoggerConfig(incompleteConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('should validate file output configuration', () => {
      const configWithInvalidFile = {
        level: 'INFO',
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
        outputs: [
          {
            type: 'file',
            enabled: true,
            config: {
              // Missing path
              maxSize: 'invalid_size',
              maxFiles: -1,
            },
          },
        ],
      };

      const result = ConfigValidator.validateLoggerConfig(configWithInvalidFile);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_FILE_PATH')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_MAX_SIZE_FORMAT')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_MAX_FILES')).toBe(true);
    });

    it('should validate external output configuration', () => {
      const configWithInvalidExternal = {
        level: 'INFO',
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
        outputs: [
          {
            type: 'external',
            enabled: true,
            config: {
              type: 'webhook',
              // Missing endpoint
              batchSize: -1,
              flushInterval: 50, // Too low
            },
          },
        ],
      };

      const result = ConfigValidator.validateLoggerConfig(configWithInvalidExternal);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_EXTERNAL_ENDPOINT')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_BATCH_SIZE')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_FLUSH_INTERVAL')).toBe(true);
    });

    it('should generate warnings for disabled outputs', () => {
      const configWithDisabledOutputs = {
        level: 'INFO',
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
        outputs: [
          {
            type: 'console',
            enabled: false,
            config: { colorize: true },
          },
        ],
      };

      const result = ConfigValidator.validateLoggerConfig(configWithDisabledOutputs);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'outputs')).toBe(true);
    });

    it('should handle null or undefined configuration', () => {
      const result1 = ConfigValidator.validateLoggerConfig(null);
      const result2 = ConfigValidator.validateLoggerConfig(undefined);

      expect(result1.isValid).toBe(false);
      expect(result2.isValid).toBe(false);
      expect(result1.errors[0].code).toBe('INVALID_CONFIG_TYPE');
      expect(result2.errors[0].code).toBe('INVALID_CONFIG_TYPE');
    });
  });

  describe('File Size Parsing', () => {
    it('should parse valid file sizes', () => {
      // Access the private method through the class for testing
      const testCases = [
        { input: '10MB', expected: 10 * 1024 * 1024 },
        { input: '1.5GB', expected: 1.5 * 1024 * 1024 * 1024 },
        { input: '500KB', expected: 500 * 1024 },
        { input: '1024B', expected: 1024 },
        { input: '2.5 MB', expected: 2.5 * 1024 * 1024 },
      ];

      testCases.forEach(({ input }) => {
        // Test through validation since parseFileSize is private
        const config = {
          level: 'INFO',
          format: 'JSON',
          includeStackTrace: true,
          redactSensitiveData: true,
          outputs: [
            {
              type: 'file',
              enabled: true,
              config: {
                path: './test.log',
                maxSize: input,
                maxFiles: 1,
                rotateDaily: false,
                compress: false,
              },
            },
          ],
        };

        const result = ConfigValidator.validateLoggerConfig(config);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid file size formats', () => {
      const invalidSizes = ['invalid', '10XB', 'MB', '10', '-5MB', '0KB'];

      invalidSizes.forEach((invalidSize) => {
        const config = {
          level: 'INFO',
          format: 'JSON',
          includeStackTrace: true,
          redactSensitiveData: true,
          outputs: [
            {
              type: 'file',
              enabled: true,
              config: {
                path: './test.log',
                maxSize: invalidSize,
                maxFiles: 1,
                rotateDaily: false,
                compress: false,
              },
            },
          ],
        };

        const result = ConfigValidator.validateLoggerConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_MAX_SIZE_FORMAT')).toBe(true);
      });
    });
  });
});
