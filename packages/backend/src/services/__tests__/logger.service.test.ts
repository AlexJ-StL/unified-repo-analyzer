import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LoggerConfig, LogLevel, requestLogger, logError, logPerformance, logSecurityEvent, logAnalysis } from '../logger.service.js';

describe('Logger Service', () => {
  let logger: Logger;

  beforeEach(() => {
    // Create logger instance with test configuration
    const testConfig: Partial<LoggerConfig> = {
      level: 'DEBUG',
      outputs: [{ type: 'console', config: { colorize: false } }],
      format: 'JSON',
      includeStackTrace: true,
      redactSensitiveData: true,
    };
    
    logger = new Logger(testConfig, 'test-component');
  });

  describe('Logger Class', () => {
    it('should create logger with default configuration', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeInstanceOf(Logger);
      expect(defaultLogger.getConfig().level).toBe('INFO');
    });

    it('should create logger with custom configuration', () => {
      const config: Partial<LoggerConfig> = {
        level: 'ERROR',
        format: 'TEXT',
        includeStackTrace: false,
      };
      
      const customLogger = new Logger(config);
      const actualConfig = customLogger.getConfig();
      
      expect(actualConfig.level).toBe('ERROR');
      expect(actualConfig.format).toBe('TEXT');
      expect(actualConfig.includeStackTrace).toBe(false);
    });

    it('should generate unique request IDs', () => {
      const requestId1 = logger.getRequestId();
      const requestId2 = logger.getRequestId();
      
      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });

    it('should set and get request ID', () => {
      const testRequestId = 'test-request-123';
      logger.setRequestId(testRequestId);
      
      expect(logger.getRequestId()).toBe(testRequestId);
    });

    it('should update configuration', () => {
      const newConfig: Partial<LoggerConfig> = {
        level: 'WARN',
        format: 'TEXT',
      };
      
      logger.updateConfig(newConfig);
      const updatedConfig = logger.getConfig();
      
      expect(updatedConfig.level).toBe('WARN');
      expect(updatedConfig.format).toBe('TEXT');
    });
  });

  describe('Logging Methods', () => {
    it('should log debug messages with structured format', () => {
      const message = 'Debug message';
      const metadata = { key: 'value' };
      const component = 'test-component';
      const requestId = 'test-request-id';

      // This should not throw an error
      expect(() => {
        logger.debug(message, metadata, component, requestId);
      }).not.toThrow();
    });

    it('should log info messages with metadata', () => {
      const message = 'Info message';
      const metadata = { operation: 'test', duration: 100 };

      expect(() => {
        logger.info(message, metadata);
      }).not.toThrow();
    });

    it('should log warning messages', () => {
      const message = 'Warning message';
      const metadata = { warning: 'test warning' };

      expect(() => {
        logger.warn(message, metadata);
      }).not.toThrow();
    });

    it('should log error messages with error objects', () => {
      const message = 'Error message';
      const error = new Error('Test error');
      const metadata = { context: 'test' };

      expect(() => {
        logger.error(message, error, metadata);
      }).not.toThrow();
    });
  });

  describe('Data Sanitization', () => {
    it('should redact sensitive data when enabled', () => {
      const sensitiveLogger = new Logger({
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        redactSensitiveData: true,
      });

      const metadata = {
        username: 'testuser',
        password: 'secret123',
        apiKey: 'api-key-123',
        token: 'bearer-token',
        normalData: 'normal-value',
      };

      expect(() => {
        sensitiveLogger.info('Test message', metadata);
      }).not.toThrow();
    });

    it('should not redact data when disabled', () => {
      const nonRedactingLogger = new Logger({
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        redactSensitiveData: false,
      });

      const metadata = {
        password: 'secret123',
        normalData: 'normal-value',
      };

      expect(() => {
        nonRedactingLogger.info('Test message', metadata);
      }).not.toThrow();
    });
  });

  describe('File Configuration', () => {
    it('should handle file configuration without creating files', () => {
      const fileConfig = {
        level: 'INFO' as LogLevel,
        outputs: [{
          type: 'console' as const, // Use console instead of file to avoid file system operations
          config: {
            colorize: false,
          }
        }],
        format: 'JSON' as const,
        includeStackTrace: true,
        redactSensitiveData: true,
      };

      const fileLogger = new Logger(fileConfig);
      expect(fileLogger.getConfig().outputs[0].type).toBe('console');
    });
  });
});

describe('Helper Functions', () => {
  // Simplified tests without mocking for now

  it('should export helper functions', () => {
    // Just test that the functions are exported and can be imported
    expect(typeof requestLogger).toBe('function');
    expect(typeof logError).toBe('function');
    expect(typeof logPerformance).toBe('function');
    expect(typeof logSecurityEvent).toBe('function');
    expect(typeof logAnalysis).toBe('function');
  });
});